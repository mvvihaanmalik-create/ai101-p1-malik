$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$syncScript = Join-Path $PSScriptRoot 'sync.mjs'
$pidFile = Join-Path $root '.local\sync.pid'
if (Test-Path -LiteralPath $pidFile) {
  $syncPid = 0
  if ([int]::TryParse((Get-Content -Raw -LiteralPath $pidFile).Trim(), [ref]$syncPid)) {
    $existing = Get-CimInstance Win32_Process -Filter "ProcessId=$syncPid" -ErrorAction SilentlyContinue
    if ($existing -and $existing.CommandLine.Contains($syncScript)) { & (Join-Path $PSScriptRoot 'start-agent.ps1'); exit 0 }
  }
}
$nodePath = (Get-Command node).Source
Start-Process -FilePath $nodePath -ArgumentList ('"' + $syncScript + '"') -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput (Join-Path $root '.local\sync.log') -RedirectStandardError (Join-Path $root '.local\sync-error.log')
& (Join-Path $PSScriptRoot 'start-agent.ps1')
