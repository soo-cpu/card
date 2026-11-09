# 설치및예약등록 2026-10-31 v0
# 디자인사례캡처를 윈도우 PC에 설치하고, 매일 새벽 2시 자동 실행으로 등록한다.
# - 기존 파일·폴더는 지우거나 고치지 않는다 (없을 때만 새로 만든다).
# - 같은 이름의 예약 작업이 이미 있으면 덮어쓰지 않고 멈춘다.

$ErrorActionPreference = "Stop"
$Here       = Split-Path -Parent $MyInvocation.MyCommand.Path
$ScriptFile = Join-Path $Here "디자인사례캡처 2026-10-31 v0.py"
$TaskName   = "디자인사례캡처 2026-10-31 v0"

function Step($msg) { Write-Host ""; Write-Host "▶ $msg" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "  ✔ $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "  ! $msg" -ForegroundColor Yellow }

if (-not (Test-Path -LiteralPath $ScriptFile)) {
    Write-Host "같은 폴더에 '디자인사례캡처 2026-10-31 v0.py' 가 없습니다." -ForegroundColor Red
    Read-Host "엔터를 누르면 닫힙니다"; exit 1
}

# ── 1. 파이썬 ──────────────────────────────────────────
Step "1/5 파이썬 확인"
function Find-Python {
    foreach ($cmd in @("py", "python")) {
        try {
            $args0 = if ($cmd -eq "py") { @("-3", "-c", "import sys;print(sys.executable)") } else { @("-c", "import sys;print(sys.executable)") }
            $exe = & $cmd @args0 2>$null
            if ($LASTEXITCODE -eq 0 -and $exe -and (Test-Path $exe) -and ($exe -notmatch "WindowsApps")) { return $exe.Trim() }
        } catch {}
    }
    $cand = Get-ChildItem "$env:LOCALAPPDATA\Programs\Python\Python3*\python.exe" -ErrorAction SilentlyContinue |
            Sort-Object FullName -Descending | Select-Object -First 1
    if ($cand) { return $cand.FullName }
    return $null
}
$Python = Find-Python
if (-not $Python) {
    Warn "파이썬이 없어 설치합니다 (winget, 사용자 계정 설치)."
    winget install -e --id Python.Python.3.12 --scope user --accept-package-agreements --accept-source-agreements
    $Python = Find-Python
}
if (-not $Python) {
    Write-Host "파이썬 설치를 확인하지 못했습니다. https://www.python.org 에서 설치 후 다시 실행해 주세요." -ForegroundColor Red
    Read-Host "엔터를 누르면 닫힙니다"; exit 1
}
Ok "파이썬: $Python"

# ── 2. Playwright + 크로미움 ───────────────────────────
Step "2/5 Playwright·크로미움 설치 (몇 분 걸릴 수 있음)"
& $Python -m pip install --user --upgrade playwright pillow
& $Python -m playwright install chromium
Ok "Playwright·크로미움 준비 완료"

# ── 3. 구글 드라이브 폴더 ──────────────────────────────
Step "3/5 구글 드라이브 'Claude 자료함\디자인 사례' 폴더 확인"
$DriveRoot = $null
foreach ($d in (Get-PSDrive -PSProvider FileSystem)) {
    foreach ($n in @("내 드라이브", "My Drive")) {
        $p = Join-Path $d.Root $n
        if (Test-Path -LiteralPath $p) { $DriveRoot = $p; break }
    }
    if ($DriveRoot) { break }
}
if (-not $DriveRoot) {
    foreach ($p in @("$env:USERPROFILE\Google Drive\내 드라이브", "$env:USERPROFILE\Google Drive\My Drive", "$env:USERPROFILE\Google Drive")) {
        if (Test-Path -LiteralPath $p) { $DriveRoot = $p; break }
    }
}
if (-not $DriveRoot) {
    Warn "구글 드라이브 동기화 폴더를 자동으로 못 찾았습니다."
    $DriveRoot = Read-Host "  '내 드라이브' 폴더 경로를 붙여넣어 주세요 (예: G:\내 드라이브)"
    if (-not (Test-Path -LiteralPath $DriveRoot)) { Write-Host "경로가 없습니다." -ForegroundColor Red; Read-Host "엔터"; exit 1 }
}
$Target = Join-Path $DriveRoot "Claude 자료함\디자인 사례"
if (Test-Path -LiteralPath $Target) { Ok "이미 있음: $Target" }
else { New-Item -ItemType Directory -Path $Target | Out-Null; Ok "새로 만듦: $Target" }

# ── 4. 절전 중 깨우기 허용 ─────────────────────────────
Step "4/5 절전 해제 타이머(Wake timer) 허용"
# SUB_SLEEP / '절전 모드 해제 타이머 허용' = 1(사용)
powercfg /SETACVALUEINDEX SCHEME_CURRENT SUB_SLEEP bd3b718a-0680-4d9d-8ab2-e1d2b4ac806d 1
powercfg /SETDCVALUEINDEX SCHEME_CURRENT SUB_SLEEP bd3b718a-0680-4d9d-8ab2-e1d2b4ac806d 1
powercfg /SETACTIVE SCHEME_CURRENT
Ok "현재 전원 계획에서 해제 타이머 허용"

# ── 5. 작업 스케줄러 등록 ──────────────────────────────
Step "5/5 작업 스케줄러 등록 (매일 02:00)"
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Warn "'$TaskName' 작업이 이미 있어 그대로 둡니다 (덮어쓰지 않음)."
} else {
    $action    = New-ScheduledTaskAction -Execute $Python `
                   -Argument "`"$ScriptFile`" --root `"$DriveRoot`"" -WorkingDirectory $Here
    $trigger   = New-ScheduledTaskTrigger -Daily -At "02:00"
    $settings  = New-ScheduledTaskSettingsSet -WakeToRun -StartWhenAvailable `
                   -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
                   -RunOnlyIfNetworkAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 1)
    $principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings `
        -Principal $principal -Description "매일 새벽 인테리어 디자인 사례 캡처 → Claude 자료함\디자인 사례 (내부 참고용)" | Out-Null
    Ok "등록 완료: '$TaskName' — 매일 02:00, 절전 중이면 깨워서 실행"
}

Write-Host ""
$ans = Read-Host "지금 한 번 시험 실행해 볼까요? (Y/N)"
if ($ans -match "^[Yy]") {
    & $Python $ScriptFile --root $DriveRoot
    Write-Host ""; Ok "결과 폴더: $Target"
    Start-Process explorer.exe $Target
}
Write-Host ""
Read-Host "끝났습니다. 엔터를 누르면 닫힙니다"
