# Keep one React Native Activity/Application source in the canonical package.
# React Native CLI 20.2.0 may generate a duplicate directory named
# com/ir.seghalam.food while this project already tracks ir/seghalam/food.
# Safe to rerun; only duplicate entrypoint files are removed.
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$javaRoot = Join-Path $root 'android/app/src/main/java'
$canonicalDir = Join-Path $javaRoot 'ir/seghalam/food'
$classFiles = @('MainActivity.kt', 'MainApplication.kt', 'MainActivity.java', 'MainApplication.java')
$expected = @('MainActivity.kt', 'MainApplication.kt')

foreach ($name in $expected) {
  $path = Join-Path $canonicalDir $name
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Missing canonical React Native entrypoint: $path"
  }
}

$canonicalPaths = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
foreach ($name in $expected) {
  [void]$canonicalPaths.Add([System.IO.Path]::GetFullPath((Join-Path $canonicalDir $name)))
}

$incorrectCliDir = [System.IO.Path]::GetFullPath((Join-Path $javaRoot 'com/ir.seghalam.food'))
$candidates = @(Get-ChildItem -LiteralPath $javaRoot -Recurse -File | Where-Object { $classFiles -contains $_.Name })
foreach ($candidate in $candidates) {
  $candidatePath = [System.IO.Path]::GetFullPath($candidate.FullName)
  if ($canonicalPaths.Contains($candidatePath)) { continue }

  $source = [System.IO.File]::ReadAllText($candidatePath)
  $samePackage = [regex]::IsMatch($source, '(?m)^\s*package\s+ir[.]seghalam[.]food\s*;?\s*$')
  $knownWrongDirectory = $candidatePath.StartsWith(
    ($incorrectCliDir + [System.IO.Path]::DirectorySeparatorChar),
    [System.StringComparison]::OrdinalIgnoreCase
  )
  if ($samePackage -or $knownWrongDirectory) {
    Write-Host "Removing duplicate Native entrypoint: $candidatePath"
    Remove-Item -LiteralPath $candidatePath -Force
  }
}

# Fail fast rather than waiting for Gradle/Kotlin to discover redeclarations.
foreach ($name in $expected) {
  $kind = [System.IO.Path]::GetFileNameWithoutExtension($name)
  $matching = @(
    Get-ChildItem -LiteralPath $javaRoot -Recurse -File |
    Where-Object { $_.BaseName -eq $kind -and @('.kt', '.java') -contains $_.Extension } |
    Where-Object { [regex]::IsMatch([System.IO.File]::ReadAllText($_.FullName), '(?m)^\s*package\s+ir[.]seghalam[.]food\s*;?\s*$') }
  )
  if ($matching.Count -ne 1) {
    throw "Expected one $kind in package ir.seghalam.food, found $($matching.Count)."
  }
}
Write-Host 'Native entrypoint sources verified: exactly one MainActivity and MainApplication.'
