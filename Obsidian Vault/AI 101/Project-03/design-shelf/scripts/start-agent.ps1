$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$script = Join-Path $PSScriptRoot 'agent-bridge.mjs'
$pidFile = Join-Path $root '.local\agent.pid'
if (Test-Path -LiteralPath $pidFile) {
  $agentPid = 0
  if ([int]::TryParse((Get-Content -Raw -LiteralPath $pidFile).Trim(), [ref]$agentPid)) {
    $existing = Get-CimInstance Win32_Process -Filter "ProcessId=$agentPid" -ErrorAction SilentlyContinue
    if ($existing -and $existing.CommandLine.Contains($script)) { exit 0 }
  }
}
$nodePath = (Get-Command node).Source
Start-Process -FilePath $nodePath -ArgumentList ('"' + $script + '"') -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput (Join-Path $root '.local\agent.log') -RedirectStandardError (Join-Path $root '.local\agent-error.log')
