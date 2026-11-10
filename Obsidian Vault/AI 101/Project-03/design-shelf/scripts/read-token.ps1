$ErrorActionPreference = 'Stop'
$encrypted = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot '..\.local\sites-token.dpapi')
$secure = ConvertTo-SecureString $encrypted.Trim()
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try { [Console]::Out.Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)) }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
