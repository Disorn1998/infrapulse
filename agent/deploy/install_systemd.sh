#!/usr/bin/env bash
# ==============================================================================
# InfraPulse Agent — Ubuntu / Debian Systemd Service Installer
# ==============================================================================

set -e

if [ "$EUID" -ne 0 ]; then
  echo "[ERROR] Please run this script as root or with sudo:"
  echo "        sudo bash install_systemd.sh"
  exit 1
fi

INSTALL_DIR="/opt/infrapulse/agent"
SERVICE_NAME="infrapulse-agent.service"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_SRC_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Installing InfraPulse Agent on Ubuntu ==="

# 1. Create target directory
mkdir -p "$INSTALL_DIR"

# 2. Copy agent source files
cp "$AGENT_SRC_DIR/collector.py" "$INSTALL_DIR/"
cp "$AGENT_SRC_DIR/buffer.py" "$INSTALL_DIR/"
cp "$AGENT_SRC_DIR/monitor_agent.py" "$INSTALL_DIR/"
cp "$AGENT_SRC_DIR/requirements.txt" "$INSTALL_DIR/"

# 3. Create config.json if not present
if [ ! -f "$INSTALL_DIR/config.json" ]; then
  if [ -f "$AGENT_SRC_DIR/config.json" ]; then
    cp "$AGENT_SRC_DIR/config.json" "$INSTALL_DIR/"
  else
    cp "$AGENT_SRC_DIR/config.example.json" "$INSTALL_DIR/config.json"
    echo "[NOTICE] Copied config.example.json to $INSTALL_DIR/config.json. Please edit backend URL & token if needed."
  fi
fi

# 4. Setup Python Virtualenv
echo "Setting up Python 3 virtual environment in $INSTALL_DIR/venv..."
python3 -m venv "$INSTALL_DIR/venv"
"$INSTALL_DIR/venv/bin/pip" install --upgrade pip
"$INSTALL_DIR/venv/bin/pip" install -r "$INSTALL_DIR/requirements.txt"

# 5. Install and enable systemd service
echo "Registering systemd service..."
cp "$SCRIPT_DIR/$SERVICE_NAME" /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now "$SERVICE_NAME"

echo "=== Installation Complete ==="
echo "Check service status: sudo systemctl status $SERVICE_NAME"
echo "View live agent logs: sudo journalctl -u $SERVICE_NAME -f"
