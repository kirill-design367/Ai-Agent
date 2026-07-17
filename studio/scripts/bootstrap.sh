#!/usr/bin/env bash
# AUREA — bootstrap чистого Ubuntu-сервера. ИДЕМПОТЕНТНЫЙ (можно запускать повторно).
# Делает: apt, Docker, swap 4G, ufw (22/80/443), fail2ban, пользователь deploy
# с SSH-ключом, отключение паролей и root-логина по SSH, каталог /opt/aurea.
#
# Запуск (от root):
#   sudo DEPLOY_PUBKEY="ssh-ed25519 AAAA...публичный-ключ-Actions" bash bootstrap.sh
set -euo pipefail

DEPLOY_USER=deploy
APP_DIR=/opt/aurea

[ "$(id -u)" = 0 ] || { echo "Нужен root: sudo bash bootstrap.sh"; exit 1; }
: "${DEPLOY_PUBKEY:?Передай публичный ключ для деплоя: DEPLOY_PUBKEY=\"ssh-ed25519 ...\"}"

echo "== 1/8 apt =="
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get -y -o Dpkg::Options::=--force-confold upgrade
apt-get install -y ca-certificates curl ufw fail2ban

echo "== 2/8 Docker =="
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

echo "== 3/8 swap 4G =="
if ! swapon --show 2>/dev/null | grep -q '/swapfile'; then
  fallocate -l 4G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=4096
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "== 4/8 firewall (ufw) =="
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "== 5/8 fail2ban =="
systemctl enable --now fail2ban

echo "== 6/8 пользователь $DEPLOY_USER =="
if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi
usermod -aG docker "$DEPLOY_USER"
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
AUTH="/home/$DEPLOY_USER/.ssh/authorized_keys"
touch "$AUTH"
# ключ для GitHub Actions
grep -qF "$DEPLOY_PUBKEY" "$AUTH" || echo "$DEPLOY_PUBKEY" >> "$AUTH"
# чтобы не потерять доступ владельца — переносим и его ключи (root) на deploy
if [ -f /root/.ssh/authorized_keys ]; then
  while IFS= read -r k; do
    [ -n "$k" ] && { grep -qF "$k" "$AUTH" || echo "$k" >> "$AUTH"; }
  done < /root/.ssh/authorized_keys
fi
chmod 600 "$AUTH"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"

echo "== 7/8 каталог приложения =="
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$APP_DIR"

echo "== 8/8 SSH: отключаем пароли и root-логин =="
mkdir -p /etc/ssh/sshd_config.d
printf 'PasswordAuthentication no\nPermitRootLogin no\nPubkeyAuthentication yes\n' \
  > /etc/ssh/sshd_config.d/99-aurea.conf
# на всякий случай — и в основном конфиге
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config || true
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config || true
systemctl restart ssh 2>/dev/null || systemctl restart sshd

echo
echo "✓ Готово. Пользователь: $DEPLOY_USER (в группе docker), каталог: $APP_DIR."
echo "  Дальше заходить как $DEPLOY_USER@<IP> по ключу; root и пароли отключены."
