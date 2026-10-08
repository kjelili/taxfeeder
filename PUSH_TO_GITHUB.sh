#!/bin/bash
set -e

echo "=========================================="
echo "  TaxFeeder — Push to GitHub"
echo "  https://github.com/kjelili/taxfeeder"
echo "=========================================="
echo ""

if ! command -v git &> /dev/null; then
    echo "[ERROR] Git is not installed."
    echo "Please install Git: https://git-scm.com/downloads"
    exit 1
fi

if [ ! -d ".git" ]; then
    echo "[INFO] Initializing Git repository..."
    git init
    git branch -M main
fi

if ! git remote get-url origin &> /dev/null; then
    echo "[INFO] Adding remote origin..."
    git remote add origin https://github.com/kjelili/taxfeeder.git
fi

echo "[INFO] Adding all files..."
git add .

echo "[INFO] Committing..."
git commit -m "Initial commit: TaxFeeder v0.1.0 — client doc portal for tax preparers"

echo ""
echo "[INFO] Pushing to GitHub..."
git push -u origin main

echo ""
echo "=========================================="
echo "  SUCCESS! Pushed to GitHub."
echo "  https://github.com/kjelili/taxfeeder"
echo "=========================================="
