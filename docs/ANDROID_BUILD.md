# Android debug build instructions (Windows PowerShell)

Prerequisites: Internet, Node 22.13+, JDK 17+ (supported by RN), Android Studio SDK API 37 (target SDK 36) with build tools and emulator or Android physical USB driver; configure ANDROID_HOME and sdkmanager licenses.

From a new extraction directory:

```powershell
PowerShell -ExecutionPolicy Bypass -File .\scripts\bootstrap-native.ps1
```

This downloads the official RN Android template (including Gradle wrapper JAR) because this archived source was authored offline. It then runs npm install, complete TS checker and Gradle build.

If native bootstrap or build fails, inspect terminal output, fix and retry. APK path **only after a successful build**:

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

To install after confirming file exists:

```powershell
adb devices
adb install -r .\android\app\build\outputs\apk\debug\app-debug.apk
```

Debug APK should not be uploaded to Cafe Bazaar. Sign the release using your own keystore under environment secrets, never include signing files in Git. Re-test cold start, RTL, keyboard, database migration and airplane mode before release.
