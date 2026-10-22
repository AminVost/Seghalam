# Produces a stand-alone PHONE TEST APK, with JavaScript bundled into it,
# and signed ONLY using the React Native development/debug keystore.
# NOT suitable for Cafe Bazaar publication.
# Run on Windows with Internet, Android SDK (API 37), Node >=22.13 and JDK >=17.
param([switch]$SkipBootstrap)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $root

function Check-Exit($action) {
  if ($LASTEXITCODE -ne 0) { throw "$action failed (exit code $LASTEXITCODE)" }
}
function Require-Command($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Required command not found: $name. Install it and reopen PowerShell."
  }
}

Require-Command node
Require-Command npm
Require-Command java
$nodeVersion = (& node -p 'process.versions.node').Trim()
$nodeParts = $nodeVersion.Split('.')
if ([int]$nodeParts[0] -lt 22 -or ([int]$nodeParts[0] -eq 22 -and [int]$nodeParts[1] -lt 13)) {
  throw "Node.js 22.13+ is required. Installed: $nodeVersion"
}

$sdk = $env:ANDROID_HOME
if (-not $sdk) { $sdk = $env:ANDROID_SDK_ROOT }
if (-not $sdk -and $env:LOCALAPPDATA) { $sdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
if (-not $sdk -or -not (Test-Path $sdk)) {
  throw 'Android SDK not found. Install Android Studio SDK, then configure ANDROID_HOME.'
}
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
Write-Host "Android SDK: $sdk"
Write-Warning 'TEST BUILD ONLY: this app still contains recipes awaiting culinary verification.'

$wrapper = Join-Path $root 'android/gradlew.bat'
$installed = Join-Path $root 'node_modules/react-native/package.json'
if (-not (Test-Path $wrapper) -or -not (Test-Path $installed)) {
  if ($SkipBootstrap) { throw 'Dependencies or Gradle wrapper missing. Run without -SkipBootstrap.' }
  Write-Host 'Preparing the official React Native Android template and dependencies...'
  & (Join-Path $root 'scripts/bootstrap-native.ps1') -SkipDebugBuild
  Check-Exit 'React Native bootstrap'
}

# The original release signing rules are never committed or permanently changed.
# A non-debuggable Release variant bundles JS into the APK, so Metro is NOT needed.
$gradleFile = Join-Path $root 'android/app/build.gradle'
$original = [System.IO.File]::ReadAllText($gradleFile)
$testSigning = @'

// TEMPORARY: Stand-alone test APK. Overrides signing only during this build.
// DO NOT PUBLISH: signingConfigs.debug is NOT the publisher key.
android {
    buildTypes {
        release {
            signingConfig signingConfigs.debug
            minifyEnabled false
        }
    }
}
'@

try {
  [System.IO.File]::WriteAllText($gradleFile, $original + $testSigning, [System.Text.UTF8Encoding]::new($false))
  Write-Host 'Building self-contained APK with bundled Hermes JS...'
  Push-Location (Join-Path $root 'android')
  try {
    & .\gradlew.bat :app:assembleRelease --no-daemon
    Check-Exit 'Gradle assembleRelease'
  } finally { Pop-Location }
} finally {
  [System.IO.File]::WriteAllText($gradleFile, $original, [System.Text.UTF8Encoding]::new($false))
}

$sourceApk = Join-Path $root 'android/app/build/outputs/apk/release/app-release.apk'
if (-not (Test-Path $sourceApk)) { throw "APK not found after build: $sourceApk" }
# Verify that the release build is self-contained and will not ask for Metro.
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($sourceApk)
try {
  $bundle = $zip.Entries | Where-Object { $_.FullName -eq 'assets/index.android.bundle' } | Select-Object -First 1
  if (-not $bundle) { throw 'JS bundle is missing from the APK; refusing to publish the test file.' }
} finally { $zip.Dispose() }

$dest = Join-Path $root 'Seghalam-0.2.0-PHONE-TEST.apk'
Copy-Item $sourceApk $dest -Force
$checksum = (Get-FileHash $dest -Algorithm SHA256).Hash
Write-Host ''
Write-Host 'SUCCESS: Stand-alone phone test APK created.' -ForegroundColor Green
Write-Host "Path: $dest"
Write-Host "SHA256: $checksum"
Write-Host 'Copy the APK to your Android phone and install it (unknown-source permission may be required).'
Write-Host 'Metro is not required. This APK is debug-key signed for testing, NOT for Cafe Bazaar.'
