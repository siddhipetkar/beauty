@echo off
title Lumiere Beauty - Java Server
echo ==================================================================
echo   Lumiere Beauty - Smart Shade Shopping
echo   Starting Pure Java Backend on http://localhost:8080 ...
echo ==================================================================

cd /d "%~dp0"
start "" http://localhost:8080
java LumiereServer.java
pause
