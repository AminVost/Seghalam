# Called by bootstrap-native.ps1 after npm install; SIL OFL-1.1 licensed font.
$ErrorActionPreference='Stop'
$root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$source=Join-Path $root 'node_modules/vazirmatn/fonts/ttf'
$target=Join-Path $root 'android/app/src/main/assets/fonts'
if (!(Test-Path $source)) { throw 'Vazirmatn package not installed' }
New-Item -ItemType Directory -Path $target -Force | Out-Null
foreach ($weight in @('Regular','Bold')) {
  $file="Vazirmatn-$weight.ttf"
  $from=Join-Path $source $file
  if (!(Test-Path $from)) { throw "Missing Vazirmatn font: $file" }
  Copy-Item $from (Join-Path $target $file) -Force
}
Write-Host 'Vazirmatn font assets installed into Android build tree.'
