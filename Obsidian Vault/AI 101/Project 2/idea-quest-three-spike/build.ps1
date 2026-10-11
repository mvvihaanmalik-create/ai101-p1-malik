$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $PSCommandPath
$build = Join-Path $env:LOCALAPPDATA 'AI101Projects\idea-quest-three-build'
New-Item -ItemType Directory -Path $build -Force | Out-Null

# Install build dependencies outside the public-synced Obsidian vault.
& npm install --prefix $build --no-audit --no-fund --save-exact 'three@0.186.1' 'esbuild@0.28.2'
if ($LASTEXITCODE -ne 0) { throw 'Could not install the pinned build dependencies.' }

$env:IDEAQUEST_BUILD_HERE = $here
$env:IDEAQUEST_BUILD_DEPS = $build
try {
    $code = @'
const path = require('node:path');
const here = process.env.IDEAQUEST_BUILD_HERE;
const deps = process.env.IDEAQUEST_BUILD_DEPS;
const esbuild = require(path.join(deps, 'node_modules', 'esbuild'));
esbuild.buildSync({
  entryPoints: [path.join(here, 'src', 'main.js')],
  outfile: path.join(here, 'app.js'),
  nodePaths: [path.join(deps, 'node_modules')],
  bundle: true, minify: true, format: 'iife', platform: 'browser', target: 'es2020'
});
'@
    & node -e $code
    if ($LASTEXITCODE -ne 0) { throw 'Could not bundle the prototype.' }
    Copy-Item -LiteralPath (Join-Path $build 'node_modules\three\LICENSE') -Destination (Join-Path $here 'THREE-LICENSE.txt') -Force
} finally {
    Remove-Item Env:IDEAQUEST_BUILD_HERE -ErrorAction SilentlyContinue
    Remove-Item Env:IDEAQUEST_BUILD_DEPS -ErrorAction SilentlyContinue
}
Write-Output 'Built app.js and included the Three.js license; no node_modules in the vault.'
