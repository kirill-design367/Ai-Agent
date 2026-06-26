#!/usr/bin/env python3
"""
Запускалка обзвона (Voximplant Management API).

Читает CSV со списком клиентов и по очереди запускает облачный сценарий
scenario.js на каждый номер. Сам звонок, проигрывание записи и сбор нажатия "1"
происходят в облаке Voximplant — этот скрипт только инициирует звонки,
троттлит их и пишет лог результатов.

Запуск:
    python campaign.py                      # обзвонить data/clients.csv
    python campaign.py --file my_base.csv   # другой файл
    python campaign.py --dry-run            # ничего не звонит, только проверка

Перед запуском заполните .env (см. .env.example) и настройте сценарий+правило
в панели Voximplant (подробности в README.md).
"""

import argparse
import csv
import json
import os
import re
import sys
import time
from datetime import datetime

import requests
from dotenv import load_dotenv

load_dotenv()

API_URL = "https://api.voximplant.com/platform_api/StartScenarios/"

# ── Настройки из .env ────────────────────────────────────────────────────────
ACCOUNT_ID = os.getenv("VOX_ACCOUNT_ID", "")
API_KEY = os.getenv("VOX_API_KEY", "")
RULE_ID = os.getenv("VOX_RULE_ID", "")

# Эти значения можно передать в сценарий через customData, чтобы не хранить
# токены прямо в коде scenario.js. Если оставить пустыми — сценарий возьмёт
# свои захардкоженные значения.
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
CALLER_ID = os.getenv("VOX_CALLER_ID", "")
AUDIO_URL = os.getenv("AUDIO_URL", "")
# Текст для озвучки (TTS). Если задан — робот проговорит его, mp3 не нужен.
MESSAGE_TEXT = os.getenv("MESSAGE_TEXT", "")

# Пауза между запусками звонков, сек (защита от слишком быстрого обзвона).
DELAY_BETWEEN_CALLS = float(os.getenv("DELAY_BETWEEN_CALLS", "6"))

LEADS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "leads")
LOG_FILE = os.path.join(LEADS_DIR, "campaign_log.csv")


def normalize_phone(raw: str) -> str:
    """Приводим номер к формату 7XXXXXXXXXX (только цифры, РФ)."""
    digits = re.sub(r"\D", "", raw)
    if digits.startswith("8") and len(digits) == 11:
        digits = "7" + digits[1:]
    if len(digits) == 10:
        digits = "7" + digits
    return digits


def read_clients(path: str):
    """Читаем номера из CSV. Берём первый столбец либо колонку 'phone'."""
    if not os.path.exists(path):
        sys.exit(f"Файл с базой не найден: {path}")

    numbers = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        rows = list(reader)

    if not rows:
        return numbers

    # Определяем, есть ли заголовок с колонкой phone.
    header = [c.strip().lower() for c in rows[0]]
    phone_idx = header.index("phone") if "phone" in header else 0
    start = 1 if "phone" in header else 0

    for row in rows[start:]:
        if not row:
            continue
        cell = row[phone_idx] if len(row) > phone_idx else row[0]
        phone = normalize_phone(cell)
        if len(phone) == 11:
            numbers.append(phone)
        else:
            print(f"  ⚠ пропущен некорректный номер: {cell!r}")
    return numbers


def build_custom_data(phone: str) -> str:
    """
    Формируем customData для сценария. Если в .env заданы токены/настройки —
    передаём их вместе с номером, чтобы не дублировать в коде сценария.
    """
    overrides = {}
    if TELEGRAM_BOT_TOKEN:
        overrides["TELEGRAM_BOT_TOKEN"] = TELEGRAM_BOT_TOKEN
    if TELEGRAM_CHAT_ID:
        overrides["TELEGRAM_CHAT_ID"] = TELEGRAM_CHAT_ID
    if CALLER_ID:
        overrides["CALLER_ID"] = CALLER_ID
    if MESSAGE_TEXT:
        # TTS-режим: передаём текст и явно отключаем mp3.
        overrides["MESSAGE_TEXT"] = MESSAGE_TEXT
        overrides["AUDIO_URL"] = ""
    elif AUDIO_URL:
        # Режим mp3: своя запись по ссылке, TTS отключаем.
        overrides["AUDIO_URL"] = AUDIO_URL
        overrides["MESSAGE_TEXT"] = ""

    if overrides:
        return json.dumps({"phone": phone, "config": overrides})
    return phone


def start_call(phone: str) -> dict:
    """Инициируем один звонок через Voximplant Management API."""
    params = {
        "account_id": ACCOUNT_ID,
        "api_key": API_KEY,
        "rule_id": RULE_ID,
        "script_custom_data": build_custom_data(phone),
    }
    resp = requests.post(API_URL, data=params, timeout=30)
    try:
        return resp.json()
    except ValueError:
        return {"error": {"msg": resp.text, "code": resp.status_code}}


def log_result(phone: str, result: dict):
    os.makedirs(LEADS_DIR, exist_ok=True)
    is_new = not os.path.exists(LOG_FILE)
    with open(LOG_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if is_new:
            writer.writerow(["timestamp", "phone", "media_session_id", "error"])
        writer.writerow([
            datetime.now().isoformat(timespec="seconds"),
            phone,
            result.get("media_session_access_url", "")
            or result.get("result", ""),
            json.dumps(result.get("error", ""), ensure_ascii=False),
        ])


def check_config():
    missing = [
        name
        for name, val in {
            "VOX_ACCOUNT_ID": ACCOUNT_ID,
            "VOX_API_KEY": API_KEY,
            "VOX_RULE_ID": RULE_ID,
        }.items()
        if not val
    ]
    if missing:
        sys.exit(
            "Не заполнены обязательные настройки в .env: "
            + ", ".join(missing)
            + "\nСкопируйте .env.example в .env и заполните (см. README.md)."
        )


def main():
    parser = argparse.ArgumentParser(description="ИИ-обзвонщик (Voximplant)")
    parser.add_argument(
        "--file", default="data/clients.csv", help="CSV со списком номеров"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Не звонить, только показать, что было бы обзвонено",
    )
    args = parser.parse_args()

    numbers = read_clients(args.file)
    if not numbers:
        sys.exit("В базе нет корректных номеров.")

    print(f"Загружено номеров: {len(numbers)}")

    if args.dry_run:
        print("DRY-RUN: звонки не выполняются. Номера к обзвону:")
        for n in numbers:
            print(f"  +{n}")
        return

    check_config()

    print(f"Старт обзвона. Пауза между звонками: {DELAY_BETWEEN_CALLS} сек.\n")
    for i, phone in enumerate(numbers, 1):
        print(f"[{i}/{len(numbers)}] Звоню +{phone} ...", end=" ", flush=True)
        try:
            result = start_call(phone)
        except requests.RequestException as e:
            result = {"error": {"msg": str(e)}}

        if result.get("error"):
            print(f"ошибка: {result['error']}")
        else:
            print("запущено ✓")
        log_result(phone, result)

        if i < len(numbers):
            time.sleep(DELAY_BETWEEN_CALLS)

    print(f"\nГотово. Лог: {LOG_FILE}")
    print("Лиды (нажавшие 1) приходят в Telegram прямо во время звонков.")


if __name__ == "__main__":
    main()
