#!/bin/zsh
set -e

cd "$(dirname "$0")/.."

echo "Starting SharkBay..."
echo "Keep this Terminal window open while you use the app."
echo

npm run dev
