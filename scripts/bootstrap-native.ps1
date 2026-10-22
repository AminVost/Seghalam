# On Windows, generate the uncommitted Gradle wrapper and Native template from
# the exact official React Native version. Safe to re-run after a failed install.
param([switch]$SkipDebugBuild)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $root

function Assert-LastExit([string]$operation) {
  if ($LASTEXITCODE -ne 0) { throw "$operation failed with exit code $LASTEXITCODE" }
}
# Windows PowerShell 5.1 Set-Content -Encoding UTF8 adds a BOM. That BOM
# breaks React Native CLI's JSON parser when it reads package.json.
function Write-Utf8NoBom([string]$path, [string]$content) {
  [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
}
function Need-Command([string]$command) {
  if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
    throw "Missing $command. Install Node.js, JDK and Android Studio first."
  }
}
Need-Command 'node'
Need-Command 'npm'
Need-Command 'java'
$nodeVersion = (& node -p 'process.versions.node').Trim()
$major = [int]$nodeVersion.Split('.')[0]
$minor = [int]$nodeVersion.Split('.')[1]
if ($major -lt 22 -or ($major -eq 22 -and $minor -lt 13)) {
  throw "Node.js 22.13+ required, found $nodeVersion"
}
$sdk = $env:ANDROID_HOME
if (-not $sdk) { $sdk = $env:ANDROID_SDK_ROOT }
if (-not $sdk -and $env:LOCALAPPDATA) { $sdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
if (-not $sdk -or -not (Test-Path $sdk)) { throw 'Android SDK not found. Install it with Android Studio.' }
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk

# This project intentionally does not commit the unverified hand-assembled Gradle
# wrapper. Use the matching official template to obtain a real wrapper JAR.
$wrapper = Join-Path $root 'android/gradlew.bat'
if (-not (Test-Path $wrapper)) {
  $tmp = Join-Path ([IO.Path]::GetTempPath()) ('Seghalam-Native-' + [guid]::NewGuid().ToString('N'))
  $originalManifest = Get-Content (Join-Path $root 'android/app/src/main/AndroidManifest.xml') -Raw -Encoding UTF8
  $debugManifest = Get-Content (Join-Path $root 'android/app/src/debug/AndroidManifest.xml') -Raw -Encoding UTF8
  New-Item -ItemType Directory -Path $tmp -Force | Out-Null
  try {
    Push-Location $tmp
    try {
      & npx --yes '@react-native-community/cli@20.2.0' init Seghalam --version 0.87.1 --package-name ir.seghalam.food --pm npm --skip-install
      Assert-LastExit 'Official React Native template generation'
    } finally { Pop-Location }
    $template = Join-Path $tmp 'Seghalam'
    if (-not (Test-Path (Join-Path $template 'android/gradlew.bat'))) { throw 'Official Gradle Wrapper missing from template.' }
    Copy-Item (Join-Path $template 'android/*') (Join-Path $root 'android') -Recurse -Force

    # Restore the app's minimal permission policy and branding; the template can
    # change other Native build defaults to keep them compatible with RN 0.87.1.
    $mainManifestPath = Join-Path $root 'android/app/src/main/AndroidManifest.xml'
    $debugManifestPath = Join-Path $root 'android/app/src/debug/AndroidManifest.xml'
    New-Item -ItemType Directory (Split-Path $debugManifestPath) -Force | Out-Null
    Write-Utf8NoBom $mainManifestPath $originalManifest
    Write-Utf8NoBom $debugManifestPath $debugManifest
    Copy-Item (Join-Path $root 'assets/branding/android/*') (Join-Path $root 'android/app/src/main/res') -Recurse -Force
    $stringsPath = Join-Path $root 'android/app/src/main/res/values/strings.xml'
    if (Test-Path $stringsPath) {
      $strings = Get-Content $stringsPath -Raw -Encoding UTF8
      # Keep this script ASCII-safe for Windows PowerShell 5.1, which treats
      # BOM-less UTF-8 scripts as the legacy system code page.
      # These code points spell the Persian app name with a zero-width non-joiner.
      $appName = -join (@(0x0633, 0x0647, 0x200C, 0x0642, 0x0644, 0x0645, 0x0020, 0x063A, 0x0630, 0x0627) | ForEach-Object { [char]$_ })
      $replacement = '<string name="app_name">' + $appName + '</string>'
      $strings = [regex]::Replace($strings, '<string name="app_name">.*?</string>', $replacement)
      Write-Utf8NoBom $stringsPath $strings
    }
    # Native template defines the toolchain pairings; keep our additional
    # project libraries and scripts untouched.
    $templateManifest = Get-Content (Join-Path $template 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    $ourManifest = Get-Content (Join-Path $root 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($section in @('dependencies','devDependencies')) {
      foreach ($property in $templateManifest.$section.PSObject.Properties) {
        if ($ourManifest.$section.PSObject.Properties[$property.Name]) {
          $ourManifest.$section.PSObject.Properties[$property.Name].Value = $property.Value
        }
      }
    }
    Write-Utf8NoBom (Join-Path $root 'package.json') ($ourManifest | ConvertTo-Json -Depth 20)
  } finally {
    if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
  }
}

# The CLI template can add MainActivity/MainApplication beside the checked-in
# entrypoints. Remove generated duplicates even on a repeated bootstrap run.
& (Join-Path $root 'scripts/repair-native-sources.ps1')

npm install
Assert-LastExit 'npm install'
& (Join-Path $root 'scripts/install-font.ps1')
Assert-LastExit 'Vazirmatn installation'
npm run typecheck
Assert-LastExit 'React Native TypeScript typecheck'
npm run test:all
Assert-LastExit 'Domain, semantic and SQLite checks'
if (-not $SkipDebugBuild) {
  Push-Location (Join-Path $root 'android')
  try { & .\gradlew.bat :app:assembleDebug --no-daemon; Assert-LastExit 'Android assembleDebug' }
  finally { Pop-Location }
  Write-Host "APK: $root\android\app\build\outputs\apk\debug\app-debug.apk"
} else {
  Write-Host 'Native setup completed. Gradle build was intentionally skipped.'
}
