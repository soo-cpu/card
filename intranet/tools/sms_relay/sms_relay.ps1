<#
  홈퍼니싱 인트라넷 문자 중계 (알리고) — 대표 PC에서 1분마다 실행
  하는 일: '문자 발송함' 폴더의 요청 파일(sms_req_번호.json) 중 결과 파일(sms_res_번호.json)이 없는 것을 알리고로 보내고 결과 파일을 씀.
  - 요청 파일은 지우거나 옮기지 않음 (읽기만)
  - 알리고 키·아이디·발신번호는 이 PC의 .env 에만 (ALIGO_API_KEY / ALIGO_USER_ID / ALIGO_SENDER)
  - 안전장치: SMS_FORCE_TEST(없으면 Y) · SMS_ONLY_TO · 한 번에 50명 · 하루 SMS_DAILY_MAX(기본 200) · 24시간 지난 요청은 안 보냄
  쓰는 법: powershell -NoProfile -ExecutionPolicy Bypass -File sms_relay.ps1 [-Queue "문자 발송함 경로"] [-EnvFile ".env 경로"] [-Loop]
  Windows PowerShell 5.1 과 PowerShell 7 둘 다에서 돌도록 씀. 이 파일은 UTF-8(BOM)으로 저장.
#>
[CmdletBinding()]
param(
  [string]$Queue = "",
  [string]$EnvFile = "",
  [string]$ApiUrl = "https://apis.aligo.in/send/",
  [string]$StateDir = "",
  [switch]$Loop,
  [int]$IntervalSec = 20,
  [string]$NowUtc = ""
)

$ErrorActionPreference = "Stop"
$Here = $PSScriptRoot
if (-not $Here) { $Here = Split-Path -Parent $MyInvocation.MyCommand.Path }
if (-not $EnvFile) { $EnvFile = Join-Path $Here ".env" }
if (-not $StateDir) { $StateDir = Join-Path $Here "sms_relay_state" }
$LogFile = Join-Path $StateDir "sms_relay.log"
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$MaxPerRequest = 50
$MaxBytes = 2000

function Write-RelayLog([string]$Text) {
  # 로그에는 키·전체 전화번호를 쓰지 않음 (번호는 뒤 4자리만)
  try {
    $line = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss") + " " + $Text
    [System.IO.File]::AppendAllText($LogFile, $line + "`r`n", $Utf8NoBom)
  } catch { }
}

function Read-EnvFile([string]$Path) {
  $map = @{}
  if (-not (Test-Path -LiteralPath $Path)) { return $map }
  foreach ($raw in [System.IO.File]::ReadAllLines($Path, [System.Text.Encoding]::UTF8)) {
    $line = $raw.Trim()
    if ($line.Length -eq 0 -or $line.StartsWith("#")) { continue }
    $i = $line.IndexOf("=")
    if ($i -lt 1) { continue }
    $k = $line.Substring(0, $i).Trim()
    $v = $line.Substring($i + 1).Trim()
    if ($v.Length -ge 2 -and (($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'")))) { $v = $v.Substring(1, $v.Length - 2) }
    $map[$k] = $v
  }
  return $map
}

function Get-MsgBytes([string]$Text) {
  # 인트라넷 화면과 같은 셈법: EUC-KR 기준 한글 등 2바이트, 영문·숫자 1바이트, 줄바꿈 2바이트
  $n = 0
  foreach ($ch in $Text.ToCharArray()) {
    $c = [int]$ch
    if ($c -ge 0xDC00 -and $c -le 0xDFFF) { continue }
    if ($c -eq 10) { $n += 2 } elseif ($c -lt 128) { $n += 1 } else { $n += 2 }
  }
  return $n
}

function Get-TelDigits($Value) {
  $d = ([string]$Value) -replace "\D", ""
  if ($d.Length -eq 12 -and $d.StartsWith("8210")) { $d = "0" + $d.Substring(2) }
  if ($d -match "^01[016789]\d{7,8}$") { return $d }
  return ""
}

function Get-TelMask($Value) {
  $d = ([string]$Value) -replace "\D", ""
  if ($d.Length -ge 4) { return "***" + $d.Substring($d.Length - 4) }
  return "***"
}

function Get-RequestTime($Req, [System.IO.FileInfo]$File) {
  # PowerShell 7 은 JSON 날짜 글을 DateTime 으로 바꿔 주고, 5.1 은 글 그대로 둠 → 둘 다 받음
  try {
    $at = $Req.at
    if ($at -is [datetime]) { return $at.ToUniversalTime() }
    if ($at) {
      $styles = [System.Globalization.DateTimeStyles]::AssumeUniversal -bor [System.Globalization.DateTimeStyles]::AdjustToUniversal
      return [datetime]::Parse([string]$at, [System.Globalization.CultureInfo]::InvariantCulture, $styles)
    }
  } catch { }
  return $File.CreationTimeUtc
}

function Save-Result([string]$Id, $Result) {
  # 임시 이름으로 다 쓴 뒤 이름을 바꿈 (반쯤 쓴 파일을 화면이 읽지 않게). 이미 결과가 있으면 덮어쓰지 않음
  $final = Join-Path $Queue ("sms_res_" + $Id + ".json")
  if (Test-Path -LiteralPath $final) { return }
  $tmp = $final + ".tmp"
  $json = $Result | ConvertTo-Json -Depth 6 -Compress
  [System.IO.File]::WriteAllText($tmp, $json, $Utf8NoBom)
  Move-Item -LiteralPath $tmp -Destination $final
}

function New-Result([string]$Id, [bool]$Test, [string]$ErrorText, $Results) {
  $list = @($Results)
  $ok = @($list | Where-Object { $_.ok }).Count
  return [ordered]@{
    v = 1; id = $Id; at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"); test = $Test
    ok = $ok; fail = ($list.Count - $ok); error = $ErrorText; results = $list
  }
}

function New-ItemResult($To, [bool]$Ok, [string]$Code, [string]$Message, [string]$MsgId, [string]$Type, [bool]$Test) {
  return [ordered]@{ to = [string]$To; ok = $Ok; code = $Code; message = $Message; msg_id = $MsgId; type = $Type; test = $Test }
}

function Get-KstHour {
  # 한국 시간 '시' (시험할 때만 -NowUtc 로 시각을 정해 줌)
  $u = (Get-Date).ToUniversalTime()
  if ($NowUtc) { try { $styles = [System.Globalization.DateTimeStyles]::AssumeUniversal -bor [System.Globalization.DateTimeStyles]::AdjustToUniversal; $u = [datetime]::Parse($NowUtc, [System.Globalization.CultureInfo]::InvariantCulture, $styles) } catch { } }
  return $u.AddHours(9).Hour
}

function Test-ConnectFail($Ex) {
  # 알리고에 아예 닿지 못한 경우만 참 (이름 풀이 실패·연결 거부·망 끊김). 시간 초과·응답 깨짐·중간에 끊김은 요청이 닿았을 수 있어 거짓
  $e = $Ex
  for ($i = 0; $i -lt 8 -and $e; $i++) {
    if ($e -is [System.Net.Sockets.SocketException]) {
      $c = [string]$e.SocketErrorCode
      return (@("HostNotFound", "ConnectionRefused", "NetworkUnreachable", "HostUnreachable", "TryAgain", "NoData", "NetworkDown") -contains $c)
    }
    if ($e -is [System.Net.WebException]) {
      $st = [string]$e.Status
      if (@("NameResolutionFailure", "ConnectFailure", "ProxyNameResolutionFailure") -contains $st) { return $true }
    }
    $e = $e.InnerException
  }
  return $false
}

function Get-DayState {
  $today = (Get-Date).ToString("yyyy-MM-dd")
  $path = Join-Path $StateDir "sms_relay_day.json"
  $st = $null
  try { if (Test-Path -LiteralPath $path) { $st = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8) | ConvertFrom-Json } } catch { $st = $null }
  $real = 0
  if ($st -and ([string]$st.day) -eq $today) { $real = [int]$st.real }
  return @{ day = $today; real = $real; path = $path }
}

function Save-DayState($State) {
  $json = ([ordered]@{ day = $State.day; real = $State.real }) | ConvertTo-Json -Compress
  [System.IO.File]::WriteAllText($State.path, $json, $Utf8NoBom)
}

function Send-Aligo($Cfg, [string]$To, [string]$Msg, [string]$Type, [bool]$Test) {
  $form = [ordered]@{ key = $Cfg.Key; user_id = $Cfg.UserId; sender = $Cfg.Sender; receiver = $To; msg = $Msg; msg_type = $Type }
  if ($Type -eq "LMS") { $form["title"] = $Cfg.Title }
  if ($Test) { $form["testmode_yn"] = "Y" }
  $pairs = @()
  foreach ($k in $form.Keys) { $pairs += ([uri]::EscapeDataString([string]$k) + "=" + [uri]::EscapeDataString([string]$form[$k])) }
  $bytes = [System.Text.Encoding]::UTF8.GetBytes(($pairs -join "&"))
  $resp = Invoke-WebRequest -UseBasicParsing -Uri $ApiUrl -Method Post -Body $bytes -ContentType "application/x-www-form-urlencoded; charset=UTF-8" -TimeoutSec 30
  $text = [System.Text.Encoding]::UTF8.GetString($resp.RawContentStream.ToArray())
  return ($text | ConvertFrom-Json)
}

function Invoke-Request([System.IO.FileInfo]$File, $Cfg) {
  $name = $File.Name
  $id = $name.Substring(8, $name.Length - 13)   # sms_req_ … .json
  if ($id -notmatch "^\d{14}_[A-Za-z0-9]{6}$") { return }
  if (Test-Path -LiteralPath (Join-Path $Queue ("sms_res_" + $id + ".json"))) { return }

  # 1) 읽기 — 드라이브가 아직 내려받는 중일 수 있어 2분은 기다려 줌
  $req = $null
  try { $req = [System.IO.File]::ReadAllText($File.FullName, [System.Text.Encoding]::UTF8) | ConvertFrom-Json } catch { $req = $null }
  $items = @()
  if ($req -and $req.items) { $items = @($req.items) }
  $bad = ""
  if (-not $req) { $bad = "요청 파일을 읽지 못했어요 (JSON 오류)" }
  elseif (([string]$req.id) -ne $id) { $bad = "요청 파일 이름과 안의 번호가 달라요" }
  elseif ($items.Count -lt 1) { $bad = "받는 사람이 없어요" }
  elseif ($items.Count -gt $MaxPerRequest) { $bad = "한 번에 " + $MaxPerRequest + "명까지만 보낼 수 있어요 (" + $items.Count + "명)" }
  if ($bad) {
    if (((Get-Date).ToUniversalTime() - $File.LastWriteTimeUtc).TotalSeconds -lt 120 -and -not $req) { return }
    $rs = @(); foreach ($it in $items) { $rs += (New-ItemResult $it.to $false "-900" $bad "" "" $true) }
    Save-Result $id (New-Result $id $true $bad $rs)
    Write-RelayLog ("실패 " + $id + " : " + $bad)
    return
  }

  # 2) 24시간 지난 요청은 보내지 않음
  # 요청에 test 칸이 없으면 시험으로 봄 (실수로 실제 발송이 되지 않게)
  $reqTest = $true
  if ($req.PSObject.Properties.Name -contains "test") { $reqTest = [bool]$req.test }
  $age = ((Get-Date).ToUniversalTime() - (Get-RequestTime $req $File)).TotalHours
  if ($age -gt 24) {
    $msg = "시간 지남 (요청한 지 24시간이 지나 보내지 않았어요)"
    $rs = @(); foreach ($it in $items) { $rs += (New-ItemResult $it.to $false "-902" $msg "" "" $reqTest) }
    Save-Result $id (New-Result $id $reqTest $msg $rs)
    Write-RelayLog ("시간 지남 " + $id + " (" + $items.Count + "명)")
    return
  }

  # 3) 보내는 중에 멈춘 적이 있는 요청은 다시 보내지 않음 (같은 문자가 두 번 나가는 것 막기)
  $mark = Join-Path $StateDir ("run_" + $id + ".txt")
  if (Test-Path -LiteralPath $mark) {
    $msg = "중계가 보내는 중에 멈췄어요. 일부가 이미 나갔을 수 있어 다시 보내지 않았어요"
    $rs = @(); foreach ($it in $items) { $rs += (New-ItemResult $it.to $false "-903" $msg "" "" $reqTest) }
    Save-Result $id (New-Result $id $reqTest $msg $rs)
    Write-RelayLog ("멈춘 요청 " + $id + " : 다시 보내지 않음")
    return
  }
  # 3-1) 실제 발송 규칙 (화면과 같은 규칙을 중계에도): 2명 이상·광고 글은 08~21시(한국 시간)만, 광고 글은 맨 앞 (광고)·맨 끝 무료수신거부 080
  $realN = 0; $adBad = ""; $hasAd = $false
  foreach ($it in $items) {
    $t0 = Get-TelDigits $it.to
    $isT = ($reqTest -or $Cfg.ForceTest)
    if (-not $isT -and $Cfg.OnlyTo.Count -gt 0 -and ($Cfg.OnlyTo -notcontains $t0)) { $isT = $true }
    if ($isT) { continue }
    $realN++
    $m0 = (([string]$it.msg) -replace "`r`n", "`n" -replace "`r", "`n").Trim()
    if ($m0.Contains("(광고)")) {
      $hasAd = $true
      if (-not $m0.StartsWith("(광고)")) { $adBad = "광고 문자는 맨 앞에 (광고) 를 적어야 해요" }
      elseif ($m0 -notmatch "무료\s*수신거부\s*080[\d-]{7,}\s*$") { $adBad = "광고 문자는 맨 끝에 무료수신거부 080 번호를 적어야 해요" }
    }
  }
  $hr = Get-KstHour
  $block = ""
  if ($adBad) { $block = $adBad }
  elseif (($realN -ge 2 -or $hasAd) -and ($hr -lt 8 -or $hr -ge 21)) { $block = "여러 명·광고 문자는 오전 8시 ~ 밤 9시(한국 시간)에만 실제로 보낼 수 있어요" }
  if ($block) {
    $rs = @(); foreach ($it in $items) { $rs += (New-ItemResult $it.to $false "-904" $block "" "" $false) }
    Save-Result $id (New-Result $id $false $block $rs)
    Write-RelayLog ("막음 " + $id + " : " + $block)
    return
  }
  [System.IO.File]::WriteAllText($mark, (Get-Date).ToString("s"), $Utf8NoBom)

  # 4) 한 명씩 보내기
  $day = Get-DayState
  $results = @()
  $allTest = $true
  $first = $true
  foreach ($it in $items) {
    $to = Get-TelDigits $it.to
    $text = ([string]$it.msg) -replace "`r`n", "`n" -replace "`r", "`n"
    $size = Get-MsgBytes $text
    $type = "SMS"; if ($size -gt 90) { $type = "LMS" }
    $isTest = ($reqTest -or $Cfg.ForceTest)
    if (-not $isTest -and $Cfg.OnlyTo.Count -gt 0 -and ($Cfg.OnlyTo -notcontains $to)) { $isTest = $true }
    if (-not $to) { $results += (New-ItemResult $it.to $false "-900" "휴대폰 번호 형식이 아니에요" "" $type $isTest); $first = $false; continue }
    if ($text.Trim().Length -eq 0) { $results += (New-ItemResult $to $false "-900" "보낼 글이 비어 있어요" "" $type $isTest); $first = $false; continue }
    if ($size -gt $MaxBytes) { $results += (New-ItemResult $to $false "-900" ("글이 너무 길어요 (" + $size + "바이트)") "" $type $isTest); $first = $false; continue }
    if (-not $isTest -and $day.real -ge $Cfg.DailyMax) { $results += (New-ItemResult $to $false "-901" ("하루 발송 한도(" + $Cfg.DailyMax + "건)를 넘어 보내지 않았어요") "" $type $false); $allTest = $false; $first = $false; continue }
    try {
      $r = Send-Aligo $Cfg $to $text $type $isTest
      $code = [string]$r.result_code
      $n = 0; $okNow = ([int]::TryParse($code, [ref]$n) -and $n -ge 1)
      $rtype = $type; if ($r.msg_type) { $rtype = [string]$r.msg_type }
      $results += (New-ItemResult $to $okNow $code ([string]$r.message) ([string]$r.msg_id) $rtype $isTest)
      if (-not $isTest) { $allTest = $false; if ($okNow) { $day.real = $day.real + 1; Save-DayState $day } }
      Write-RelayLog ("  " + $id + " " + (Get-TelMask $to) + " " + $type + " 시험=" + $isTest + " 결과=" + $code)
    } catch {
      if ($first -and (Test-ConnectFail $_.Exception)) {
        # 첫 건부터 알리고에 아예 닿지 못함(이름 풀이·연결 거부) → 아무것도 안 나갔으니 결과를 쓰지 않고 다음 번에 다시
        # (시간 초과·응답 깨짐은 요청이 닿았을 수 있어 다시 보내지 않고 아래에서 -999 로 끝냄)
        Remove-Item -LiteralPath $mark -ErrorAction SilentlyContinue
        Write-RelayLog ("연결 실패 " + $id + " : 다음 번에 다시 해요 (" + $_.Exception.Message + ")")
        return
      }
      if (-not $isTest) { $allTest = $false }
      $results += (New-ItemResult $to $false "-999" "알리고 응답을 확인하지 못했어요 (나갔을 수 있어 다시 보내지 않았어요 · 알리고 발송 내역을 확인해 주세요)" "" $type $isTest)
      Write-RelayLog ("  " + $id + " " + (Get-TelMask $to) + " 연결 실패")
    }
    $first = $false
  }
  Save-Result $id (New-Result $id $allTest "" $results)
  Remove-Item -LiteralPath $mark -ErrorAction SilentlyContinue
  $okCount = @($results | Where-Object { $_.ok }).Count
  Write-RelayLog ("끝 " + $id + " 보낸 사람=" + ([string]$req.by) + " " + $results.Count + "명 성공=" + $okCount + " 실패=" + ($results.Count - $okCount) + " 시험=" + $allTest)
}

function Invoke-Once {
  $envMap = Read-EnvFile $EnvFile
  $q = $Queue
  if (-not $q -and $envMap["SMS_QUEUE"]) { $q = $envMap["SMS_QUEUE"] }
  if (-not $q) { $q = Join-Path $Here "문자 발송함" }
  $script:Queue = $q
  if (-not (Test-Path -LiteralPath $q)) { Write-RelayLog ("문자 발송함 폴더가 없어요: " + $q); return 2 }
  $files = @(Get-ChildItem -LiteralPath $q -Filter "sms_req_*.json" -File | Sort-Object Name)
  $todo = @($files | Where-Object { -not (Test-Path -LiteralPath (Join-Path $q ("sms_res_" + $_.Name.Substring(8)))) })
  if ($todo.Count -eq 0) { return 0 }
  $force = $true
  if ($envMap.ContainsKey("SMS_FORCE_TEST") -and ($envMap["SMS_FORCE_TEST"].Trim().ToUpper() -eq "N")) { $force = $false }
  $only = @()
  if ($envMap["SMS_ONLY_TO"]) { foreach ($p in ($envMap["SMS_ONLY_TO"] -split "[,; ]+")) { $d = Get-TelDigits $p; if ($d) { $only += $d } } }
  $max = 200; $m = 0
  if ($envMap["SMS_DAILY_MAX"] -and [int]::TryParse($envMap["SMS_DAILY_MAX"], [ref]$m) -and $m -ge 0) { $max = $m }
  $title = "아르띠꼬 스튜디오"
  if ($envMap["SMS_TITLE"]) { $title = $envMap["SMS_TITLE"] }
  if ($title.Length -gt 20) { $title = $title.Substring(0, 20) }
  $cfg = @{ Key = $envMap["ALIGO_API_KEY"]; UserId = $envMap["ALIGO_USER_ID"]; Sender = (([string]$envMap["ALIGO_SENDER"]) -replace "\D", ""); ForceTest = $force; OnlyTo = $only; DailyMax = $max; Title = $title }
  if (-not $cfg.Key -or -not $cfg.UserId -or -not $cfg.Sender) {
    # 키가 없으면 실패로 끝내지 않고 그대로 둠 (.env 를 채우면 다음 번에 나감 · 24시간 안)
    Write-RelayLog (".env 에 ALIGO_API_KEY / ALIGO_USER_ID / ALIGO_SENDER 가 없어 기다리는 요청 " + $todo.Count + "건을 그대로 뒀어요")
    return 2
  }
  foreach ($f in $todo) {
    try { Invoke-Request $f $cfg } catch { Write-RelayLog ("오류 " + $f.Name + " : " + $_.Exception.Message) }
  }
  return 0
}

# ── 시작 ──
if (-not (Test-Path -LiteralPath $StateDir)) { New-Item -ItemType Directory -Path $StateDir -Force | Out-Null }
try { [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12 } catch { }
# 두 개가 동시에 돌지 않게 잠금 (1분마다 실행이 겹칠 때)
$lock = $null
try { $lock = [System.IO.File]::Open((Join-Path $StateDir "sms_relay.lock"), [System.IO.FileMode]::OpenOrCreate, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None) } catch { exit 0 }
$code = 0
try {
  if ($Loop) {
    while ($true) { try { $code = Invoke-Once } catch { Write-RelayLog ("오류: " + $_.Exception.Message) }; Start-Sleep -Seconds $IntervalSec }
  } else {
    try { $code = Invoke-Once } catch { Write-RelayLog ("오류: " + $_.Exception.Message); $code = 1 }
  }
} finally { if ($lock) { $lock.Close() } }
$last = @($code) | Select-Object -Last 1
$exitCode = 0
if ($last -is [int]) { $exitCode = $last }
exit $exitCode
