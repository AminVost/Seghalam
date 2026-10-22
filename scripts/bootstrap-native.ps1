# On Windows, generate the uncommitted Gradle wrapper and Native template from
# the exact official React Native version. Safe to re-run after a failed install.
param([switch]$SkipDebugBuild)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $root

function Assert-LastExit([string]$operation) {
  if ($LASTEXITCODE -ne 0) { throw "$operation failed with exit code $LASTEXITCODE" }
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
    Set-Content $mainManifestPath $originalManifest -Encoding UTF8
    Set-Content $debugManifestPath $debugManifest -Encoding UTF8
    Copy-Item (Join-Path $root 'assets/branding/android/*') (Join-Path $root 'android/app/src/main/res') -Recurse -Force
    $stringsPath = Join-Path $root 'android/app/src/main/res/values/strings.xml'
    if (Test-Path $stringsPath) {
      $strings = Get-Content $stringsPath -Raw -Encoding UTF8
      $strings = [regex]::Replace($strings, '<string name="app_name">.*?</string>', '<string name="app_name">سه‌قلم غذا</string>')
      Set-Content $stringsPath $strings -Encoding UTF8
    }
    $mainKt = Get-ChildItem (Join-Path $root 'android/app/src/main/java') -Filter MainApplication.kt -Recurse | Select-Object -First 1
    if ($mainKt) {
      $kt = Get-Content $mainKt.FullName -Raw -Encoding UTF8
      if ($kt -notmatch 'I18nUtil') {
        $kt = $kt -replace 'import android.app.Application', "import android.app.Application`nimport com.facebook.react.modules.i18nmanager.I18nUtil"
        $kt = $kt -replace 'super.onCreate\(\)', "super.onCreate()`n    I18nUtil.getInstance().allowRTL(applicationContext, true)`n    I18nUtil.getInstance().forceRTL(applicationContext, true)"
        Set-Content $mainKt.FullName $kt -Encoding UTF8
      }
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
    $ourManifest | ConvertTo-Json -Depth 20 | Set-Content (Join-Path $root 'package.json') -Encoding UTF8
  } finally {
    if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
  }
}

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
