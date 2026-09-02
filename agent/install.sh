#!/usr/bin/env bash
# ==============================================================================
# InfraPulse 1-Line Universal Linux Agent Installer
# Usage:
#   curl -sSL https://raw.githubusercontent.com/Disorn1998/infrapulse/main/agent/install.sh | bash
#   curl -sSL https://raw.githubusercontent.com/Disorn1998/infrapulse/main/agent/install.sh | bash -s -- --url https://your-backend.onrender.com/api/v1 --token your_token
# ==============================================================================

set -e

# Default settings
SERVER_URL="https://infrapulse-backend-fddp.onrender.com/api/v1"
AGENT_TOKEN="infrapulse_secret_token_change_in_production"
INTERVAL=30
INSTALL_DIR="/opt/infrapulse-agent"
SERVICE_NAME="infrapulse-agent"
GITHUB_RAW="https://raw.githubusercontent.com/Disorn1998/infrapulse/main/agent"

# Parse CLI arguments if passed
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --url) SERVER_URL="$2"; shift ;;
        --token) AGENT_TOKEN="$2"; shift ;;
        --interval) INTERVAL="$2"; shift ;;
    esac
    shift
done

echo "=================================================================="
echo "          ⚡ InfraPulse Telemetry Agent 1-Line Installer          "
echo "=================================================================="
echo "Target Server URL : $SERVER_URL"
echo "Sampling Interval : ${INTERVAL}s"
echo "Install Directory : $INSTALL_DIR"
echo "------------------------------------------------------------------"

# 1. Require Root / Sudo
if [ "$EUID" -ne 0 ]; then
    echo "[!] Please run with sudo or as root: sudo bash -c \"\$(curl -sSL ...)\""
    exit 1
fi

# 2. Install Dependencies (Python3, pip, curl)
echo "[*] Checking Python environment and system dependencies..."
if command -v apt-get >/dev/null 2>&1; then
    apt-get update -qq
    apt-get install -y -qq python3 python3-pip python3-venv curl
elif command -v yum >/dev/null 2>&1; then
    yum install -y python3 python3-pip curl
elif command -v apk >/dev/null 2>&1; then
    apk add --no-cache python3 py3-pip curl
fi

# 3. Create Install Directory
echo "[*] Setting up directory: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# 4. Download Agent Core Files from GitHub
echo "[*] Downloading InfraPulse agent modules directly from GitHub..."
curl -sSL "$GITHUB_RAW/monitor_agent.py" -o "$INSTALL_DIR/monitor_agent.py"
curl -sSL "$GITHUB_RAW/collector.py" -o "$INSTALL_DIR/collector.py"
curl -sSL "$GITHUB_RAW/buffer.py" -o "$INSTALL_DIR/buffer.py"

# 5. Create Python Virtual Environment & Install psutil/requests
echo "[*] Configuring Python virtual environment and packages..."
python3 -m venv "$INSTALL_DIR/venv"
"$INSTALL_DIR/venv/bin/pip" install --upgrade --quiet pip
"$INSTALL_DIR/venv/bin/pip" install --quiet psutil requests

# 6. Generate config.json
echo "[*] Generating agent configuration..."
cat <<EOF > "$INSTALL_DIR/config.json"
{
  "server_url": "$SERVER_URL",
  "agent_secret_token": "$AGENT_TOKEN",
  "interval_seconds": $INTERVAL,
  "max_buffer_records": 1000,
  "timeout_seconds": 10,
  "db_path": "$INSTALL_DIR/agent_buffer.db"
}
EOF

# 7. Create and Register systemd Background Service
echo "[*] Registering systemd background daemon (/etc/systemd/system/${SERVICE_NAME}.service)..."
cat <<EOF > "/etc/systemd/system/${SERVICE_NAME}.service"
[Unit]
Description=InfraPulse Telemetry Agent Service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/venv/bin/python $INSTALL_DIR/monitor_agent.py --config $INSTALL_DIR/config.json
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# 8. Reload & Enable Service
systemctl daemon-reload
systemctl enable --now "$SERVICE_NAME"

echo "=================================================================="
echo "  [OK] InfraPulse Agent successfully installed & running 24/7!   "
echo "  Node is now streaming real-time telemetry to your Dashboard.   "
echo "  Service Status: systemctl status $SERVICE_NAME                  "
echo "=================================================================="
