$ErrorActionPreference = 'Stop'
$connection = [Console]::In.ReadLine() | ConvertFrom-Json
if (-not $connection.siteUrl.StartsWith('https://') -or -not $connection.token) { throw 'Missing site connection.' }
$localDir = Join-Path $PSScriptRoot '..\.local'
New-Item -ItemType Directory -Path $localDir -Force | Out-Null
$secure = ConvertTo-SecureString $connection.token -AsPlainText -Force
ConvertFrom-SecureString $secure | Set-Content -LiteralPath (Join-Path $localDir 'sites-token.dpapi') -Encoding utf8
@{ siteUrl = $connection.siteUrl } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $localDir 'connection.json') -Encoding utf8
Write-Output 'Private site connection saved for this Windows user.'
