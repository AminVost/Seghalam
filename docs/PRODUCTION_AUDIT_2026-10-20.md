> **Historical report / آرشیوی:** این گزارش مربوط به پیش از افزایش کاتالوگ به ۳۷۸ دستور است. وضعیت جاری: `docs/DATABASE_EXPANSION_REVIEW_2026-10-20.md`.

# Seghalam — whole-repository production audit and remediation

**Date:** 2026-10-20  
**Overall gate: NOT PRODUCTION-READY**  
**Source audited:** this repository, not an Android-installed build.

## 1. Architecture / build — BLOCKED

The application is an actual React Native + TypeScript source tree, not yet a successful compiled native artifact. The original native folder did not include the Gradle wrapper executable/JAR. The project bootstrap now reuses the official 0.87.1 template and explicitly re-applies custom manifests, brand assets and RTL setup. Debug and release Android permissions are separated. Native resolution remains *untested*: no npm registry DNS access, Android SDK or Gradle wrapper in the available environment.

**Action required:** on a networked Android workstation, execute `scripts/bootstrap-native.ps1`, then full typecheck, dependency audit, `assembleDebug`, physical/emulator tests. Record the actual output and fix native incompatibilities found.

## 2. Recommendation engine — improved, pure logic tests passed

Fixed incorrectly counting expired pantry lots in eligibility and consumption. Consumption now rejects invalid or nonpositive quantities. Ingredient unit dimensions are reviewed at the schema level so a whole lemon cannot silently represent 20 ml lemon juice. Fixed search negation handling for compound phrases and later positive clauses. Added explicit local civil-date comparison and boundary tests. Missing ingredients/unknown quantities remain distinct. No fabricated substitute source or allergy certification added.

**Limits:** no curated substitution table, no production-scoped allergy provenance, no ranking calibration across 120 verified recipes. Expiry only applies if a user provides an expiry date.

## 3. SQLite persistence — strengthened, device tests still missing

The cooking completion preflight now happens inside the write transaction. UI actions use a re-entry guard. Shopping item transfer reads server-of-truth row and deletes it before insert, atomically; stale transfers fail. Shopping list additions coalesce verified compatible quantities. Added shopping row integrity triggers in migration v3, including existing v1/v2 installations. Added manual shopping edit/done and pantry quantity/expiry update. Onboarding completion is stored locally.

**Limits:** database runtime, migration upgrade and transaction interactions must be tested using the actual OP-SQLite native module on Android. Python SQLite smoke test is not a native JSI integration test. No foreign key exists for recipe IDs because catalog source-of-truth is bundled TypeScript, not SQLite.

## 4. Persian UX / RTL — source improved, real UI not validated

Added first-launch onboarding and skip path, pantry editing, shopping editing, clear expired badges, sharing recipe text, and empty-state behavior that no longer lists ineligible meals as immediate recommendations. Fixed optional ingredient availability display. Background ticker now runs every second only during an active on-screen cooking timer. Added a day-change refresh for expiry assessment. Ingredients use an appropriate default measurement unit.

**Limits:** UI currently uses simple in-app tab/stack state, rather than navigation library; Dark Mode, shipped Vazirmatn, visual screenshots, TalkBack tests, keyboard edge cases, animation and responsive-device validation remain to be completed. Date entry currently uses ISO Gregorian text fields while the wider brief asks for a proper Jalali date picker.

## 5. Content / food safety — release blocker

25 distinct recipes still have `contentStatus: 'draft'`; **zero** are independently verified. The contracted target is at least 120 separate, source-backed, license-audited recipes. Two recipes used the wrong ingredient ID (`lemon` measured in ml); corrected to `lemon_juice`, matching their step text. Schema validation now rejects dubious quantity units, duplicate ingredients and empty steps. No nutritional metrics or safe-for-allergies claims are invented.

**Action required:** source and verify content, safety guidance and media rights; publish only after independent review. Neither this catalog nor recommendations are suitable for clinical allergy assurance.

## 6. Security / publication — partial

The offline main manifest no longer requests INTERNET. The debug-specific manifest permits Metro development networking and cleartext HTTP, separated from release. SQLite queries use placeholders. Debug APK is not a release artifact. Official Cafe Bazaar guidelines were attempted but the page dynamically renders without providing the policy text to the inspection environment; full up-to-date marketplace compliance has not been certified.

**Action required:** actual signed release, keystore stored outside Git, dependency/vulnerability audit, store listing, rights review, permission audit on final merged manifest, real screenshots and publisher submission.

## 7. Regression / performance — partial

- `npm run test:domain`: **46 passed / 0 failed** on Node 22 and global TypeScript; includes 25 new regression tests.
- `npm run test:sqlite`: **PASS** using CPython's SQLite to parse the repository's SQL DDL and exercise constraints/triggers.
- TypeScript syntactic transpilation of `App.tsx` / `src/storage/db.ts`: 0 parse diagnostics (not full typechecking).
- `npm run typecheck`: **BLOCKED**, not passed; `node_modules` is absent and registry DNS is unavailable. This produces expected unresolved React/React Native type errors.
- `npm run assemble:debug`: **BLOCKED**, not passed; Gradle wrapper and Android SDK unavailable. No APK was made.
- Jest, Android UI automation/E2E, phone profiling and release testing: **NOT RUN**.

## Hard release gates

1. Install native toolchain, full `npm ci` / dependency resolution and pass TypeScript/Jest/build.
2. Validate SQLite migrations, data preservation, timers, RTL and full primary user journeys in airplane mode on representative Android devices.
3. Replace/verify and properly license at least 120 distinct complete recipes and any included images. Record source provenance.
4. Complete food allergens, substitutions and nutrition with conservative sourced policy, or explicitly remove the unsupported claims.
5. Finish final design/accessibility, fonts, dark mode, native notifications and requested photo/AI features **only if actually validated**; never advertise nonfunctional features.
6. Create a release-signed artifact, verify final permissions and current Cafe Bazaar requirements and capture real screenshots.

**No audit pass is represented as independent device validation.**
