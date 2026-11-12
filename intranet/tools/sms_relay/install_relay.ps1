<#
  문자 중계 설치 — 작업 스케줄러에 '1분마다 sms_relay.ps1 실행'을 등록 (로그온해 있는 동안만 실행. 비밀번호를 묻지 않음)
  등록: powershell -NoProfile -ExecutionPolicy Bypass -File install_relay.ps1 [-Queue "문자 발송함 경로"]
  제거: powershell -NoProfile -ExecutionPolicy Bypass -File install_relay.ps1 -Remove
  이 파일은 UTF-8(BOM)으로 저장. Windows PowerShell 5.1 / PowerShell 7 공용.
#>
[CmdletBinding()]
param(
  [string]$Queue = "",
  [string]$TaskName = "홈퍼니싱 문자 중계",
  [switch]$Remove
)
$ErrorActionPreference = "Stop"
$Here = $PSScriptRoot
if (-not $Here) { $Here = Split-Path -Parent $MyInvocation.MyCommand.Path }
$Relay = Join-Path $Here "sms_relay.ps1"

if ($Remove) {
  $old = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
  if ($old) { Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false; Write-Host ("제거했어요: " + $TaskName) }
  else { Write-Host ("등록된 작업이 없어요: " + $TaskName) }
  exit 0
}

if (-not (Test-Path -LiteralPath $Relay)) { Write-Host ("sms_relay.ps1 이 같은 폴더에 없어요: " + $Here); exit 1 }
if (-not (Test-Path -LiteralPath (Join-Path $Here ".env"))) { Write-Host "주의: 같은 폴더에 .env 가 아직 없어요. 'env 예시.txt' 를 .env 로 복사해 알리고 키를 채워 주세요 (그 전에는 문자가 나가지 않고 기다려요)." }
if ($Queue -and -not (Test-Path -LiteralPath $Queue)) { Write-Host ("문자 발송함 폴더를 찾지 못했어요: " + $Queue); exit 1 }

$psArgs = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $Relay + '"'
if ($Queue) { $psArgs = $psArgs + ' -Queue "' + $Queue + '"' }
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $psArgs -WorkingDirectory $Here
# 지금부터 1분마다 계속 (로그온 중에만)
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 1) -RepetitionDuration (New-TimeSpan -Days 3650)
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
$principal = New-ScheduledTaskPrincipal -UserId ($env:USERDOMAIN + "\" + $env:USERNAME) -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "인트라넷 문자 발송함의 요청을 알리고로 보냄 (1분마다)" -Force | Out-Null
Write-Host ("등록했어요: " + $TaskName + " (1분마다, 로그온해 있는 동안)")
Write-Host ("기록 파일: " + (Join-Path $Here "sms_relay_state\sms_relay.log"))
Write-Host "지우려면: install_relay.ps1 -Remove"
