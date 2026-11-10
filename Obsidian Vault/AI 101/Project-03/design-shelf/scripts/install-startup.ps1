$ErrorActionPreference = 'Stop'
$launcher = Join-Path $PSScriptRoot 'start-sync.ps1'
$startup = [Environment]::GetFolderPath('Startup')
$linkPath = Join-Path $startup 'Design Shelf Notes.lnk'
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($linkPath)
$shortcut.TargetPath = (Get-Command powershell.exe).Source
$shortcut.Arguments = '-NoProfile -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $launcher + '"'
$shortcut.WorkingDirectory = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$shortcut.WindowStyle = 7
$shortcut.Description = 'Sync selected project summaries to your private Design Shelf.'
$shortcut.Save()
Write-Output 'Design Shelf note sync will start when you sign into Windows.'
