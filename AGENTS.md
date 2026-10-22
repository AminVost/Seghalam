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
