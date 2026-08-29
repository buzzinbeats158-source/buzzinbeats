@echo off
setlocal EnableDelayedExpansion

set "REPO_URL=https://github.com/buzzinbeats158-source/buzzinbeats.git"
set "BRANCH=main"

cd /d "%~dp0"

if not exist ".git" (
    echo Initializing git repository...
    git init
    git branch -M %BRANCH%
)

for /f "delims=" %%r in ('git remote 2^>nul') do set "HASREMOTE=1"
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo Adding remote origin...
    git remote add origin %REPO_URL%
) else (
    for /f "delims=" %%u in ('git remote get-url origin') do set "CURRENTURL=%%u"
    if not "%CURRENTURL%"=="%REPO_URL%" (
        echo Updating remote origin to %REPO_URL%...
        git remote set-url origin %REPO_URL%
    )
)

echo Staging changes...
git add -A

git diff --cached --quiet
if not errorlevel 1 (
    echo No changes to commit.
) else (
    set "COMMITMSG=Update !date! !time!"
    git commit -m "!COMMITMSG!"
)

echo Pushing to %REPO_URL% (%BRANCH%)...
git push -u origin %BRANCH%

echo.
echo Done.
pause
