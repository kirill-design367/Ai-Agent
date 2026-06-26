/**
 * VoxEngine-сценарий ИИ-обзвонщика (Voximplant).
 *
 * Логика одного звонка:
 *   1. Получаем номер абонента из customData (его передаёт campaign.py).
 *   2. Звоним на номер через PSTN.
 *   3. Когда абонент взял трубку — проигрываем твою голосовую запись.
 *   4. Всё время слушаем DTMF (нажатия кнопок).
 *   5. Если абонент нажал "1" — отправляем номер в Telegram с пометкой "ЛИД"
 *      напрямую через Bot API (свой сервер не нужен) и кладём трубку.
 *   6. Если запись доиграла и никто не нажал — ждём пару секунд и кладём трубку.
 *
 * Этот файл нужно вставить в редактор сценариев в панели Voximplant
 * (Applications -> ваше приложение -> Scenarios), подставив значения ниже
 * ИЛИ оставив их пустыми, если будете передавать их через customData (см. README).
 *
 * ВАЖНО: имена методов VoxEngine иногда меняются между версиями. Если что-то
 * не заработает — сверьтесь с актуальной докой: https://voximplant.com/docs/references/voxengine
 */

require(Modules.Player);

// ── Настройки ────────────────────────────────────────────────────────────────
// Можно захардкодить здесь, либо передать через customData как JSON (см. README).
let CONFIG = {
  // Токен Telegram-бота (получить у @BotFather)
  TELEGRAM_BOT_TOKEN: "PUT_YOUR_BOT_TOKEN_HERE",
  // ID чата, куда слать лиды (свой numeric id у @userinfobot, либо id группы)
  TELEGRAM_CHAT_ID: "PUT_YOUR_CHAT_ID_HERE",
  // Ваш купленный в Voximplant номер (Caller ID), от которого идёт звонок
  CALLER_ID: "PUT_YOUR_VOXIMPLANT_NUMBER_HERE",
  // Прямая ссылка на mp3/wav с вашей записью (или используем медиа из Voximplant)
  AUDIO_URL: "https://example.com/voice.mp3",
  // Сколько секунд ждать нажатия после окончания записи, прежде чем класть трубку
  WAIT_AFTER_AUDIO_SEC: 8,
  // Цифра, которую должен нажать заинтересованный клиент
  INTEREST_KEY: "1",
};

let phoneNumber = "";
let leadSent = false;

VoxEngine.addEventListener(AppEvents.Started, function () {
  // customData приходит из Management API (StartScenarios -> script_custom_data).
  // Поддерживаем два формата: просто номер строкой, либо JSON с номером и
  // переопределением настроек (удобно, чтобы не хранить токены в коде сценария).
  const raw = (VoxEngine.customData() || "").trim();

  if (raw.charAt(0) === "{") {
    try {
      const data = JSON.parse(raw);
      phoneNumber = String(data.phone || "").trim();
      CONFIG = Object.assign({}, CONFIG, data.config || {});
    } catch (err) {
      Logger.write("Не удалось разобрать customData как JSON: " + err);
    }
  } else {
    phoneNumber = raw;
  }

  if (!phoneNumber) {
    Logger.write("Пустой номер — завершаем сценарий.");
    VoxEngine.terminate();
    return;
  }

  Logger.write("Звоним на: " + phoneNumber);
  const call = VoxEngine.callPSTN(phoneNumber, CONFIG.CALLER_ID);

  call.addEventListener(CallEvents.Connected, onConnected);
  call.addEventListener(CallEvents.Failed, function (e) {
    Logger.write("Звонок не удался (" + e.code + "): " + phoneNumber);
    VoxEngine.terminate();
  });
  call.addEventListener(CallEvents.Disconnected, function () {
    Logger.write("Звонок завершён: " + phoneNumber);
    VoxEngine.terminate();
  });
});

function onConnected(e) {
  const call = e.call;
  Logger.write("Абонент ответил: " + phoneNumber);

  // Включаем приём тоновых сигналов (DTMF) и слушаем их всё время разговора.
  call.handleTones(true);
  call.addEventListener(CallEvents.ToneReceived, function (toneEvent) {
    Logger.write("Нажата кнопка: " + toneEvent.tone);
    if (toneEvent.tone === CONFIG.INTEREST_KEY && !leadSent) {
      onInterested(call);
    }
  });

  // Проигрываем вашу запись абоненту.
  const player = VoxEngine.createURLPlayer(CONFIG.AUDIO_URL, false);
  player.sendMediaTo(call);

  player.addEventListener(PlayerEvents.PlaybackFinished, function () {
    Logger.write("Запись доиграна, ждём нажатие...");
    // Даём время нажать "1" после фразы, затем кладём трубку.
    setTimeout(function () {
      if (!leadSent) {
        Logger.write("Нажатия не было — завершаем: " + phoneNumber);
        call.hangup();
      }
    }, CONFIG.WAIT_AFTER_AUDIO_SEC * 1000);
  });
}

function onInterested(call) {
  leadSent = true;
  Logger.write("ЛИД! " + phoneNumber);

  const text =
    "🔥 ЛИД\nНомер: " + phoneNumber + "\nВремя: " + new Date().toISOString();
  const url =
    "https://api.telegram.org/bot" +
    CONFIG.TELEGRAM_BOT_TOKEN +
    "/sendMessage?chat_id=" +
    encodeURIComponent(CONFIG.TELEGRAM_CHAT_ID) +
    "&text=" +
    encodeURIComponent(text);

  Net.httpRequestAsync(url)
    .then(function (res) {
      Logger.write("Отправлено в Telegram, код: " + res.code);
    })
    .catch(function (err) {
      Logger.write("Ошибка отправки в Telegram: " + err);
    })
    .then(function () {
      // В любом случае кладём трубку и завершаем сценарий.
      call.hangup();
    });
}
