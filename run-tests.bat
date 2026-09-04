@echo off
setlocal

REM Always run from this script's own folder, regardless of where it's launched from.
cd /d "%~dp0"

echo ============================================
echo  Meridian - Setup and Test Runner
echo ============================================
echo Working directory: %cd%
echo.

if not exist "package.json" (
  echo ERROR: package.json not found in this folder.
  echo Make sure this .bat file sits directly inside the meridian-tests folder.
  pause
  exit /b 1
)

echo [1/6] Setting up server\.env ...
if not exist "server\.env" (
  echo   server\.env not found - creating it with the standard local dev credentials
  echo   (DB_USER=meridian / DB_PASSWORD=meridian_dev_pw / DB_NAME=meridian_health).
  (
    echo DB_HOST=127.0.0.1
    echo DB_PORT=3306
    echo DB_USER=meridian
    echo DB_PASSWORD=meridian_dev_pw
    echo DB_NAME=meridian_health
    echo JWT_SECRET=meridian_local_dev_secret_change_if_shared
    echo PORT=4000
    echo CORS_ORIGIN=http://localhost:5173
  ) > "server\.env"
  echo   Created server\.env automatically.
  echo.
  echo   NOTE: this assumes you already ran this SQL in MySQL once ^(as root^):
  echo     CREATE USER 'meridian'@'%%' IDENTIFIED BY 'meridian_dev_pw';
  echo     CREATE DATABASE IF NOT EXISTS meridian_health;
  echo     GRANT ALL PRIVILEGES ON meridian_health.* TO 'meridian'@'%%';
  echo     FLUSH PRIVILEGES;
  echo   If you haven't, do that in a MySQL client first, then re-run this script.
) else (
  echo   server\.env already exists - leaving it as is.
)
echo.

echo [2/6] Installing root dependencies ^(npm install^) ...
call npm install
if errorlevel 1 (
  echo ERROR: npm install failed in the root folder. See output above.
  pause
  exit /b 1
)
echo.

echo [3/6] Installing server dependencies ...
call npm install --prefix server
if errorlevel 1 (
  echo ERROR: npm install failed in server\. See output above.
  pause
  exit /b 1
)
echo.

echo [4/6] Freeing ports 4000 and 5173 if anything is still holding them ...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :4000 ^| findstr LISTENING') do (
  echo   Killing process %%p on port 4000
  taskkill /F /PID %%p >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
  echo   Killing process %%p on port 5173
  taskkill /F /PID %%p >nul 2>&1
)
echo.

echo [5/6] Initializing the database ^(schema + seed data^) ...
echo   This requires MySQL to already be running on this machine.
call npm run db:init --prefix server
if errorlevel 1 (
  echo ERROR: Database init failed. Common causes:
  echo   - MySQL isn't running
  echo   - the 'meridian' MySQL user hasn't been created yet ^(see note above^)
  echo   - server\.env has the wrong DB_USER / DB_PASSWORD
  echo Fix the issue above, then re-run this script.
  pause
  exit /b 1
)
echo.

echo [6/6] Building the app and running the Playwright test suite ^(chromium^) ...
echo   This builds first, then runs all tests serially. This can take 1-3 minutes.
call npm run test:e2e -- --project=chromium
echo.

echo ============================================
echo  Done. See the summary above for pass/fail counts.
echo  Run "npx playwright show-report" to view the full HTML report.
echo ============================================
pause
