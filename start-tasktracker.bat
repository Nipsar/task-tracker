@echo off

set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo Starting Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo Waiting for Docker Engine...

:wait_docker
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker is not ready yet...
    timeout /t 5 /nobreak >nul
    goto wait_docker
)

echo Docker is ready.

echo Starting PostgreSQL container...
docker compose up -d

echo Starting Spring Boot backend...
start "TaskTracker Backend" /D "%PROJECT_DIR%" cmd /k ".\mvnw.cmd spring-boot:run"

echo Waiting for backend...
timeout /t 12 /nobreak >nul

echo Opening browser...
start "" "http://localhost:8081"

pause