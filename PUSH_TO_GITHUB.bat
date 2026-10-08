@echo off
chcp 65001 >nul
echo ==========================================
echo   TaxFeeder — Push to GitHub
echo   https://github.com/kjelili/taxfeeder
echo ==========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed or not in PATH.
    echo Please install Git from https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Check if this folder is already a git repo
if exist ".git" (
    echo [INFO] Git repository already initialized.
) else (
    echo [INFO] Initializing Git repository...
    git init
    git branch -M main
)

REM Check if remote exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo [INFO] Adding remote origin...
    git remote add origin https://github.com/kjelili/taxfeeder.git
) else (
    echo [INFO] Remote origin already set.
)

echo.
echo [INFO] Adding all files...
git add .

echo [INFO] Committing...
git commit -m "Initial commit: TaxFeeder v0.1.0 — client doc portal for tax preparers"

echo.
echo [INFO] Pushing to GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo [ERROR] Push failed. Common fixes:
    echo 1. Make sure you're authenticated with GitHub (run: gh auth login)
    echo 2. Or use a Personal Access Token as your password
    echo 3. Check that the repo https://github.com/kjelili/taxfeeder exists
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   SUCCESS! Pushed to GitHub.
echo   https://github.com/kjelili/taxfeeder
echo ==========================================
pause
