# Clone & Android phone APK test — Windows 11

This repo contains the complete React Native source and offline recipe drafts.
It does **not** contain a verified Gradle wrapper JAR, npm `node_modules`, or prebuilt generated content outputs (rebuild from checked-in TypeScript sources).
Android compilation is not verified by the current authoring environment.

## Requirements

- Node.js 22.13 or later, Python 3 (for the SQLite checks), Git
- JDK 17+ configured in `JAVA_HOME`
- Android Studio, Android SDK Platform 37, Build Tools 36.0.0, NDK 27.1.12297006
- Network access to npm, Maven/Google Android SDK repositories and Gradle

## Run

```powershell
git clone https://github.com/AminVost/Seghalam.git
cd Seghalam
powershell -ExecutionPolicy Bypass -File .\scripts\build-phone-apk.ps1
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
- Android build, device UI, migration and performance require validation on a
  computer with the dependencies above. `npm run test:all` is **not** an APK build.
- Publishing in Cafe Bazaar requires verified recipes, signed Release APK/AAB,
  a real-device UX pass, and release policy checks.
- Do **not** commit the generated debug keystore, credentials, `node_modules`,
  Gradle caches or local SDK configuration.
