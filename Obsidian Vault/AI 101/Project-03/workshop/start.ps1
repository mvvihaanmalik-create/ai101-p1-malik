$ErrorActionPreference = 'Stop'
$workshopRoot = $PSScriptRoot
$courseRoot = (Resolve-Path (Join-Path $workshopRoot '../..')).Path
$nodeBinary = (Get-Command node -ErrorAction Stop).Source
$runtimeDir = Join-Path $workshopRoot '.local'
New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
$apps = @(
  @{ Name='ideaquest'; Port=4188; Root=(Join-Path $courseRoot 'Project 2/idea-quest-three-spike'); Script='server.mjs' },
  @{ Name='shelf'; Port=8917; Root=(Join-Path $courseRoot 'Project-03/design-shelf'); Script='scripts/dev.mjs' },
  @{ Name='server'; Port=4190; Root=$workshopRoot; Script='server.mjs' }
)
foreach ($app in $apps) {
  $address = 'http://127.0.0.1:' + $app.Port + '/'
  try {
    $response = Invoke-WebRequest -Uri $address -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -eq 200) { Write-Output ($app.Name + ' is running: ' + $address); continue }
  } catch {}
  $scriptFile = Join-Path $app.Root $app.Script
  $process = Start-Process -FilePath $nodeBinary -ArgumentList @('"' + $scriptFile + '"') -WorkingDirectory $app.Root -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtimeDir ($app.Name + '.log')) -RedirectStandardError (Join-Path $runtimeDir ($app.Name + '-error.log')) -PassThru
  Set-Content -LiteralPath (Join-Path $runtimeDir ($app.Name + '.pid')) -Value $process.Id
  Write-Output ($app.Name + ' starting: ' + $address)
}

$publisherScript = Join-Path $workshopRoot 'scripts/publish-cloud.mjs'
$publisherPidFile = Join-Path $runtimeDir 'cloud-publisher.pid'
if ((Test-Path (Join-Path $workshopRoot 'cloud/.vercel/project.json')) -and (Test-Path $publisherScript)) {
  $publisherRunning = $false
  if (Test-Path $publisherPidFile) {
    $publisherProcessId = Get-Content -LiteralPath $publisherPidFile -ErrorAction SilentlyContinue
    if ($publisherProcessId -match '^\d+$') {
      $publisherProcess = Get-CimInstance Win32_Process -Filter ('ProcessId = ' + $publisherProcessId) -ErrorAction SilentlyContinue
      $publisherRunning = $publisherProcess -and $publisherProcess.CommandLine -like '*scripts*publish-cloud.mjs*--watch*'
    }
  }
  if (-not $publisherRunning) {
    $publisher = Start-Process -FilePath $nodeBinary -ArgumentList @('"' + $publisherScript + '"', '--watch') -WorkingDirectory $courseRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtimeDir 'cloud-publisher.log') -RedirectStandardError (Join-Path $runtimeDir 'cloud-publisher-error.log') -PassThru
    Set-Content -LiteralPath $publisherPidFile -Value $publisher.Id
  }
  Write-Output 'Vercel update watcher is running.'
}
