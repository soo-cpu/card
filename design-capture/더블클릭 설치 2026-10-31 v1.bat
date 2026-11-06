@echo off
rem Double-click: install + register nightly task (2026-10-31 v1)
for %%F in ("%~dp0*2026-10-31 v1.ps1") do powershell -NoProfile -ExecutionPolicy Bypass -File "%%~fF"
