#!/usr/bin/env bash
# Локальная проверка игры в GitHub Codespaces: тестовая сеть + сервер + сайт одной командой.
#   bash local.sh        — запустить всё
#   bash local.sh stop   — остановить всё
cd "$(dirname "$0")" || exit 1

stop_all() {
  pkill -f "hardhat node" 2>/dev/null
  pkill -f "tsx src/index.ts" 2>/dev/null
  pkill -f "next dev" 2>/dev/null
  pkill -f "next-server" 2>/dev/null
}
if [ "$1" = "stop" ]; then stop_all; echo "Остановлено."; exit 0; fi

if [ -z "$CODESPACE_NAME" ]; then echo "Запускайте внутри GitHub Codespaces."; exit 1; fi
DOMAIN="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
RPC="https://${CODESPACE_NAME}-8545.${DOMAIN}"
API="https://${CODESPACE_NAME}-8080.${DOMAIN}"
WS="wss://${CODESPACE_NAME}-8080.${DOMAIN}/ws"
SITE="https://${CODESPACE_NAME}-3000.${DOMAIN}"

stop_all
sleep 1

for d in contracts server web; do
  if [ ! -d "$d/node_modules" ]; then echo "Устанавливаю пакеты: $d (1–3 минуты)…"; (cd "$d" && npm install --no-audit --no-fund) || { echo "Ошибка npm install в $d"; exit 1; }; fi
done

echo "1/4 Запускаю локальную сеть…"
(cd contracts && nohup npx hardhat node --hostname 0.0.0.0 > /tmp/cb-node.log 2>&1 &)
CHK='{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}'
for i in $(seq 1 60); do
  curl -s -X POST -H 'Content-Type: application/json' --data "$CHK" http://127.0.0.1:8545 | grep -q result && break
  sleep 1
done
curl -s -X POST -H 'Content-Type: application/json' --data "$CHK" http://127.0.0.1:8545 | grep -q result || { echo "Сеть не запустилась, см. /tmp/cb-node.log"; tail -20 /tmp/cb-node.log; exit 1; }

echo "2/4 Разворачиваю контракты…"
(cd contracts && rm -f local.json && npx hardhat run scripts/local-setup.ts --network localhost) || { echo "Деплой не удался"; exit 1; }
ESCROW=$(node -p "require('./contracts/local.json').escrow")
USDC=$(node -p "require('./contracts/local.json').usdc")
ORACLE_PK=$(node -p "require('./contracts/local.json').oraclePk")
FAUCET_PK=$(node -p "require('./contracts/local.json').faucetPk")

echo "3/4 Запускаю игровой сервер…"
rm -f server/data/local-state.json server/data/local-profiles.json
(cd server && RPC_URL=http://127.0.0.1:8545 ESCROW="$ESCROW" ORACLE_PK="$ORACLE_PK" FAUCET_PK="$FAUCET_PK" USDC_TOKEN="$USDC" \
  STATE_FILE=./data/local-state.json PROFILES_FILE=./data/local-profiles.json PORT=8080 \
  nohup npx tsx src/index.ts > /tmp/cb-server.log 2>&1 &)

echo "4/4 Запускаю сайт…"
(cd web && NEXT_PUBLIC_THIRDWEB_CLIENT_ID=fc1b95eb7453e110e8e2007b00301f0e NEXT_PUBLIC_CHAIN_ID=31337 NEXT_PUBLIC_RPC_URL="$RPC" \
  NEXT_PUBLIC_ESCROW="$ESCROW" NEXT_PUBLIC_USDC="$USDC" NEXT_PUBLIC_API_URL="$API" NEXT_PUBLIC_WS_URL="$WS" NEXT_PUBLIC_FAUCET=1 \
  nohup npx next dev -p 3000 > /tmp/cb-web.log 2>&1 &)

for i in $(seq 1 90); do curl -s http://127.0.0.1:8080/health | grep -q ok && break; sleep 1; done
for i in $(seq 1 120); do curl -s -o /dev/null http://127.0.0.1:3000 && break; sleep 1; done

if command -v gh >/dev/null 2>&1; then
  gh codespace ports visibility 8545:public 8080:public 3000:public -c "$CODESPACE_NAME" >/dev/null 2>&1 \
    && echo "Порты 8545, 8080, 3000 открыты." \
    || echo "ВНИМАНИЕ: порты не открылись автоматически — внизу вкладка PORTS: для 8545, 8080 и 3000 нажмите правой кнопкой → Port Visibility → Public."
fi

echo
echo "================ ГОТОВО ================"
echo "Сайт:    $SITE"
echo "Журналы: /tmp/cb-node.log  /tmp/cb-server.log  /tmp/cb-web.log"
echo "Остановить: bash local.sh stop"
