#!/bin/bash
set -e

SERVER_NAME="${CS2_SERVERNAME:-Coolify CS2 Server}"
MAX_PLAYERS="${CS2_MAXPLAYERS:-14}"
START_MAP="${CS2_MAP:-de_dust2}"
GAME_MODE="${CS2_GAMEMODE:-0}"
GAME_TYPE="${CS2_GAMETYPE:-0}"
TICKRATE="${CS2_TICKRATE:-64}"
SERVER_PASSWORD="${CS2_PW:-}"
RCON_PASSWORD="${CS2_RCONPW:-changeme123}"
AUTO_SHUTDOWN="${AUTO_SHUTDOWN:-false}"
IDLE_TIMEOUT="${IDLE_TIMEOUT:-30}"
GSLT_TOKEN="${STEAM_GSLT:-}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "=========================================="
log "  CS2 Server - FSHOST Style"
log "=========================================="
log "Server Name: $SERVER_NAME"
log "Map: $START_MAP"
log "Max Players: $MAX_PLAYERS"
log "Game Mode: $GAME_MODE (type: $GAME_TYPE)"
log "Tickrate: $TICKRATE"
log "Auto-Shutdown: $AUTO_SHUTDOWN (${IDLE_TIMEOUT}min)"
log "=========================================="

if [ ! -f "/home/steam/serverfiles/game/bin/linuxsteam64/cs2" ]; then
    log "[INSTALL] CS2 server files not found. Installing..."
    log "[INSTALL] This will take 10-20 minutes and download ~30GB..."

    if ! ./cs2server auto-install; then
        log "[INSTALL] LinuxGSM install failed, trying SteamCMD directly..."

        mkdir -p /home/steam/steamcmd
        cd /home/steam/steamcmd
        curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" | tar zxvf -
        ./steamcmd.sh +force_install_dir /home/steam/serverfiles +login anonymous +app_update 730 validate +quit

        cd /home/steam
    fi
fi

log "[UPDATE] Checking for updates..."
./cs2server update || log "[UPDATE] Update check completed"

log "[CONFIG] Generating server.cfg..."
cat > /home/steam/serverfiles/game/csgo/cfg/server.cfg <<EOF
hostname "$SERVER_NAME"
sv_password "$SERVER_PASSWORD"
rcon_password "$RCON_PASSWORD"
sv_maxrate 0
sv_minrate 80000
sv_maxupdaterate $TICKRATE
sv_minupdaterate 10
mp_autoteambalance 1
mp_limitteams 1
sv_lan 0
sv_cheats 0
EOF

log "[START] Starting CS2 dedicated server..."
cd /home/steam/serverfiles/game/bin/linuxsteam64

CMD="./cs2 -dedicated -ip 0.0.0.0 -port 27015 -maxplayers $MAX_PLAYERS +map $START_MAP -tickrate $TICKRATE +game_type $GAME_TYPE +game_mode $GAME_MODE +exec server.cfg"

if [ -n "$GSLT_TOKEN" ]; then
    CMD="$CMD +sv_setsteamaccount $GSLT_TOKEN"
    log "[AUTH] Using Steam GSLT token"
else
    log "[WARN] No GSLT token provided. Server will be LAN only!"
    CMD="$CMD +sv_lan 1"
fi

if [ -n "$SERVER_PASSWORD" ]; then
    log "[SECURITY] Server password enabled"
fi

log "[EXEC] $CMD"

$CMD &
SERVER_PID=$!
log "[RUNNING] Server PID: $SERVER_PID"

echo $SERVER_PID > /tmp/cs2.pid

if [ "$AUTO_SHUTDOWN" = "true" ] && [ "$IDLE_TIMEOUT" -gt 0 ]; then
    log "[WATCHER] Auto-shutdown enabled. Checking every minute..."

    (
        IDLE_MINUTES=0

        while true; do
            sleep 60

            if ! kill -0 $SERVER_PID 2>/dev/null; then
                log "[WATCHER] Server process died, exiting watcher..."
                exit 0
            fi

            IDLE_MINUTES=$((IDLE_MINUTES + 1))
            log "[WATCHER] Idle check: $IDLE_MINUTES/$IDLE_TIMEOUT minutes"

            if [ $IDLE_MINUTES -ge "$IDLE_TIMEOUT" ]; then
                log "[WATCHER] Server idle for ${IDLE_TIMEOUT} minutes. Shutting down..."
                kill -TERM $SERVER_PID
                sleep 5
                kill -KILL $SERVER_PID 2>/dev/null || true
                exit 0
            fi
        done
    ) &
    WATCHER_PID=$!
    log "[WATCHER] Watcher PID: $WATCHER_PID"
fi

wait $SERVER_PID
EXIT_CODE=$?

log "[STOPPED] Server exited with code $EXIT_CODE"
rm -f /tmp/cs2.pid

if [ -n "$WATCHER_PID" ]; then
    kill $WATCHER_PID 2>/dev/null || true
fi

exit $EXIT_CODE