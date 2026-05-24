#!/usr/bin/env bash
set -euo pipefail

# Adjust these paths to your repo layout:
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"

echo "Setting up backend..."
cd "$BACKEND_DIR"
python -m venv .venv
. .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

echo "Setting up frontend..."
cd "../$FRONTEND_DIR"
npm ci || npm install

echo "Installing coding agents..."
# curl -fsSL https://claude.ai/install.sh | bash
sudo npm i -g @openai/codex

echo "Done."