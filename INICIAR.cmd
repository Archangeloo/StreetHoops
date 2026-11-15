@echo off
setlocal
cd /d "%~dp0"
title Street Hoops
where node >nul 2>nul
if errorlevel 1 (
  echo Instale o Node.js 20.19 ou superior e abra este arquivo novamente.
  pause
  exit /b 1
)
where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo O npm nao foi encontrado. Reinstale o Node.js com npm.
  pause
  exit /b 1
)
if not exist "node_modules\.package-lock.json" (
  echo Instalando as dependencias. Aguarde...
  call npm.cmd ci
  if errorlevel 1 goto :failure
)
call npm.cmd run local
if errorlevel 1 goto :failure
exit /b 0
:failure
echo.
echo Nao foi possivel iniciar. Confira a mensagem acima e o README.md.
pause
exit /b 1
