#!/usr/bin/env bash
# Double-click this file on macOS or Linux to set up and start the site.
# Equivalent to: npm install && npm run setup && npm run dev
set -e
cd "$(dirname "$0")"

echo
echo "  Government Degree College Zaim — Website & Management Portal"
echo "  ==========================================================="
echo

if ! command -v node >/dev/null 2>&1; then
  echo "  Node.js is not installed. Get it from https://nodejs.org (LTS version),"
  echo "  then run this again."
  echo
  read -rp "  Press Enter to close. "
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "  Installing dependencies (first run only, this takes a few minutes)…"
  npm install
fi

npm run setup

echo
echo "  Starting the site. Open http://localhost:3000 in your browser."
echo "  Press Ctrl+C in this window to stop it."
echo
npm run dev
