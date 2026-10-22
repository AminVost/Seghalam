## Latest phone-photo regression fixes — test APK 0.3.1 (2026-10-22)

User installed 0.3.0 and supplied 9 real-device photos. Confirmed defects: (a) standalone headings such as `یخچال من` and `برنامه غذایی من` appeared near the LEFT edge, despite a broadly RTL main layout; (b) horizontally scrolling category filters and meal suggestions were clipped on the LEFT; (c) tour modal footer came dangerously close to/beneath Android three-button navigation; (d) pantry multiselect submission was below a lengthy 28-chip selector, not apparent without scrolling; (e) font-dependent Unicode nav glyphs looked inconsistent, and recipe thumbnails repeated one soup emoji. Also observed Play Protect **Uncommon** warning because debug-key, Telegram-sideloaded APK: this warning is NOT a definitive malware verdict; do not disable Play Protect or claim publisher identity. Official Android docs: https://developers.google.com/android/play-protect/warning-strings.

0.3.1 remedies: `src/ui/CoachTour.tsx` uses insets, screen height cap and ScrollView content with fixed footer, explicitly offsets >=60dp on Android nav; `App.tsx` uses explicit RTL body/header/row containers and full-width right-aligned page headings; wraps category filters and meal choices; pins multi-selection action bar between ScrollView and bottom tabs; and uses native-View tab glyphs plus dish-relevant fallback icons. App `versionCode=4`, `versionName=0.3.1`, output `Seghalam-0.3.1-PHONE-TEST.apk`. `tests/mobile-layout-contract.test.cjs` guards main requirements. Do not regress these. Continue device screenshot QA across Android navigation styles, display sizes, Persian/English locales, high font scale and dark mode. Tests/build cannot prove pixel-level correctness.

**New phone test command** after safe `git pull origin main`: `powershell -ExecutionPolicy Bypass -File .\scripts\build-phone-apk.ps1 -UseMavenMirror`. Install over existing app; NEVER clear user data or uninstall. Report actual Gradle/phone outcome; code pushes do not imply native APK compiled.

---

## Latest checkpoint — Android UI overhaul, version 0.3.0 (2026-10-22)

**User/device feedback:** Android phone now opens 0.2.0 without startup SQLite failure, but app RTL, UX navigation clarity, font sizing, icon clipping, multiselect, optional onboarding coach and dark theme all required improvement. 0.3.0 source implements these changes. See `docs/UX_RTL_REVIEW_2026-10-22_FA.md`.

**Important invariants:**
- Persian-only interface uses native Android RTL already enabled in `MainApplication.kt` PLUS root `direction:'rtl'` and `flexDirection:'row'`. Do not reintroduce `row-reverse` with native RTL; header/tab/sheet layout will be reversed twice. Test on both Persian- and English-locale Android phones.
- `ThemeProvider` + `src/ui/theme.ts` owns semantic light/dark/system tokens. New screens/components must use `useTheme()`; do not import static `palette` for newly themed UI. Persist selection via `src/storage/db.ts` key `ui_theme`.
- Onboarding tour is optional. `CoachTour` is animated and takes a **controlled step** from AppBody so switching to the FlatList recipes view doesn't reset it. Do not block first use or override user choice to skip.
- Pantry and shopping multi-select explicitly preserve unknown amount `NULL` and use atomic SQLite transactions, skipping existing items; no silent quantity invention. User data must survive same-signed version upgrades.
- `App.tsx` currently owns multiple app flows; future work can split into screens but must preserve storage and state semantics.
- New test APK is `Seghalam-0.3.0-PHONE-TEST.apk`, Gradle versionCode 3. Sign with the original debug key for upgrades. Never uninstall the previous app or clear app storage when smoke-testing.
- GitHub Actions `mobile-source-checks.yml` executes React Native `npm run typecheck` and complete `npm run test:all`. Host success does **not** equal real Android screenshot, RTL or native-device coverage. Need actual phone tests on multiple sizes, locales, themes and update/fresh install paths.

**Next:** User should run `git pull origin main`, `powershell -ExecutionPolicy Bypass -File .\scripts\build-phone-apk.ps1 -UseMavenMirror`; install 0.3 APK over 0.2 without clearing data. Verify all acceptance scenarios in the UX report. Recipes remain 378 unreviewed drafts, not ready for public distribution.

---

## Latest checkpoint — Android first-launch SQLite fix (2026-10-22)

**Architecture invariant:** 378 recipes and 236 ingredient definitions are immutable bundled content in `src/data/*`. Never reintroduce `syncCatalog()` / catalog seeding into the mobile SQLite database on app startup. `src/domain/staticCatalog.ts` implements bounded search and paging, `src/storage/db.ts` returns bundled `RECIPES`, and `addMeal` validates bundled IDs. Persist ONLY user-owned, mutable data (pantry, shopping, favorites, history, meals, sessions, settings) in OP-SQLite `seghalam.sqlite`. Preserve schema v6 and preexisting `catalog_*` tables non-destructively. See `docs/DATABASE_SCHEMA.md`.

**Why:** First real-device APK build succeeded but startup failed during mass recipe catalog seeding with `cannot rollback - no transaction is active`. OP-SQLite can mask original transaction errors (https://github.com/OP-Engineering/op-sqlite/issues/462, another version). Avoiding unnecessary mass import is the root architectural mitigation; the precise underlying native cause remains unverified. Do not claim all-device compatibility without Android instrumentation tests.

**Evidence:** 65 previous Node tests + 7 static catalog tests + 2 mocked storage-init tests PASS, plus Python SQLite host schema and migration checks. React Native typecheck and APK build succeeded on the user's Windows host *before* the startup patch; the newly revised APK needs rebuilding and device validation. All 378 recipe drafts remain unreviewed; `npm run audit:content` must fail until proper editorial signoff.

**Next action:** `git pull origin main`, `npm run typecheck`, `npm run test:all`, `powershell -ExecutionPolicy Bypass -File .\scripts\build-phone-apk.ps1 -UseMavenMirror`, install over the previously signed APK **without clearing app data**, verify first launch + pantry + favorites + meal planning and persistence. When testing on additional devices, include new install and update migration. Never delete user storage as the first troubleshooting step.

---

## Latest checkpoint — UI/flow audit, 2026-10-20

Use `docs/FINAL_QA_REVIEW_FA.md` as the current audit. Current source version: 0.2.0, SQLite schema v6; first-run and v5→v6 migrations must preserve user data and session servings. UI lists use FlatList and pantry includes storage place. Test: `npm run test:all`; release content gate: `npm run audit:content` (MUST FAIL while 378 recipes remain drafts). Android APK/React Native typecheck not verified. Do not claim store readiness. Do not silently mark drafts as reviewed. Keep metadata status and source links intact.

# SEGHALAM — persistent engineering context (updated 2026-10-20)

## Goal
A full Persian Android-first, offline-first React Native cooking app governed by `docs/ORIGINAL_MASTER_PROMPT.txt`. The customer expects Production, not an MVP. Never claim APK/build/device test, safety or editorial verification without evidence. Continue implementation without deleting user state.

## Verified current baseline
- React Native `0.87.1`, React `19.2.3`, TypeScript strict, OP-SQLite `17.0.0`. RN node_modules/Android SDK unavailable in present runtime; no verified APK or full app typecheck.
- `src/data/recipes.ts`: **378 distinct draft recipes**, 206 added beyond the previous 172; 0 human reviewed. 236 canonical ingredients; 2,045 ingredient-recipe links. Counts by overlapping categories: Iranian 105, light 181, snack 110, fastfood 139.
- Newly researched `content/researched-recipes.psv`: 206 real dish names indexed/listed by websites. For 185 new drafts, URLs refer to **collection pages, not the source recipe**; 8 use specific dish page URL; 13 are adaptations. Ingredients/amounts and cooking steps are independent **unverified drafts**. Some 16 detailed Iranian recipe steps are manually drafted, not independently cooked. 16 older source links have no recent editorial signoff. Do not claim verified online-derived instructions.
- `src/storage/db.ts`: `schema_meta.version=5`, `CONTENT_REVISION=2026102003`, `catalog_recipe_search` indexed normalized titles, `catalog_ingredient_alias`, parameterized batched inserts and paged lookup. Existing user pantry/favorites/planner/history tables are not deleted by catalog refresh. On-device Android migration remains untested.
- `content/seghalam-catalog.sqlite`: inspectable standalone SQLite content-only fixture, 1,523,712 bytes (NOT the Android user database); `content/catalog.generated.json` and `content/editorial-review-queue.csv`.
- `npm run test:all`: 62 Node unit tests PASS plus structural catalog & SQLite DDL/FK checks and host v4→v5 upgrade simulation preserving pantry/favorites/shopping/history/settings. `npm run audit:content`: EXPECTED FAIL on 378 draft records. Not a Production release.
- Performance proof: host Python SQLite benchmark only (`docs/CATALOG_SQLITE_HOST_BENCHMARK.json`); Android latency, APK size, memory, performance still unknown.

## Mandatory rules
1. NEVER turn draft into reviewed without detailed per-recipe source-level verification, actual cooking/quantity validation, allergy & food safety assessment, photo rights, reviewer name and date, current SHA-matching CSV signoff. Directory/listing URLs do not qualify as a verified recipe page. Source URL != content license.
2. Do not misrepresent made-up weights or generic cooking guidance as accurately transcribed authentic website recipes. Full editorial review is required.
3. Ingredient normalization != substitution. Reject definite eligibility for missing/unknown/expired amounts. Branded/compound ingredient composition may be unknown: exclude from safe recommendations when allergen exclusions are active unless verified.
4. Keep all core workflows offline. Avoid mandatory AI network charges, loggable secrets, forced account registration, unwarranted device permissions.
5. Cooking consumption must be explicit, transactional, without negative inventory. Catalog sync must retain existing user state and stable recipe IDs. Bump CONTENT_REVISION on shipped recipe facts change; schema version only on DDL change.
6. Always run real tests, update `docs/IMPLEMENTATION_STATUS.md` and `docs/TEST_REPORT.md`, record native/device blockers honestly.

## Commands
```bash
python scripts/compile_research_recipes.py
npm run test:all
python scripts/export_review_queue.py
python scripts/profile_catalog_sqlite.py
npm run audit:content      # expected fail until human editorial verification
npm run typecheck          # full RN typecheck needs installed packages
```
For native scaffold/build on configured Windows: `PowerShell -ExecutionPolicy Bypass -File .\scripts\bootstrap-native.ps1` (NOT verified).

## Next work required
- Verify or correct 378 recipes individually against specific sources, authentic ingredients/weights/steps, real cooking, food safety and rights. 185 new records currently point to category listings. Never use auto-generated common-step templates as reliable recipes without review.
- Full Android native dependency/build/JSI SQLite migration/E2E performance tests. Confirm paginated UI uses new SQL reader (helper exists but legacy UI still reads entire cached set).
- All original specification gaps: nutrition sources, verified substitutions, professional UI/images, true offline alarms, Persian/Hermes RTL and accessibility, validated photo AI only if useful, release signing & Bazaar review.
