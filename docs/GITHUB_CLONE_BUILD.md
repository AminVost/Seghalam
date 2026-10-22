# Clone & Android phone APK test — Windows 11

This repo contains the complete React Native source and offline recipe drafts.
It does **not** contain a verified Gradle wrapper JAR, npm `node_modules`, or prebuilt generated content outputs (rebuild from checked-in TypeScript sources).
A previous Android test APK compiled successfully on the user's Windows host on 2026-10-22. That build exposed a first-launch SQLite catalog-seeding failure; the new static-content architecture is pending real-device retest.

## Requirements

- Node.js 22.13 or later, Python 3 (for the SQLite checks), Git
- JDK 17+ configured in `JAVA_HOME`
- Android Studio, Android SDK Platform 37, Build Tools 36.0.0, NDK 27.1.12297006
- Network access to npm, Maven/Google Android SDK repositories and Gradle

## Run

```powershell
git clone https://github.com/AminVost/Seghalam.git
cd Seghalam
powershell -ExecutionPolicy Bypass -File .\scripts\build-phone-apk.ps1 -UseMavenMirror
```

`build-phone-apk.ps1` downloads the **official RN 0.87.1 Android template**
and its Gradle wrapper, installs npm dependencies and Vazirmatn, runs checks,
and builds a **self-contained test APK signed by the debug key**. It does not
modify the publisher signing configuration permanently.

Output after a successful build:

```text
Seghalam-0.2.0-PHONE-TEST.apk
```

Or for the developer/Metro debug variant:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-native.ps1
```

Debug output: `android\app\build\outputs\apk\debug\app-debug.apk`.
For test builds use the dedicated phone script, not `assemble:release`, which
purposefully blocks when unreviewed recipes exist.

## Known issues

- 378 recipes are **unreviewed editorial drafts**, not culinary-verified content.
- Updated APK still requires device validation, especially fresh install and upgrade of previously installed v0.2.0. Do NOT clear application data as a troubleshooting shortcut. `npm run test:all` is **not** an APK build.
- Publishing in Cafe Bazaar requires verified recipes, signed Release APK/AAB,
  a real-device UX pass, and release policy checks.
- Do **not** commit the generated debug keystore, credentials, `node_modules`,
  Gradle caches or local SDK configuration.


## Existing installation and startup verification

The catalog is bundled immutable TypeScript data. The Android SQLite database is reserved for user-owned mutable information; see `docs/DATABASE_SCHEMA.md`. The new build should not attempt to insert 378 recipes into SQLite.

To update a phone that already ran the older APK, install the newly built APK **over** it with the same package ID and signing key. Do **not** uninstall first, reset app data or delete `seghalam.sqlite`. Confirm startup, recipe list, pantry, favorites, meal planning and persistence after restarting the app.

A successful local Build or mock SQLite test alone cannot demonstrate compatibility with every Android device. If startup fails, use the built-in report-sharing button and capture the actual error; do not guess at corrupted storage.
