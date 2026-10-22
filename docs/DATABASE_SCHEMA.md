# Mobile storage architecture — 22 October 2026

## Runtime design: immutable catalog + SQLite user data

The application is **fully offline**. On Android it uses two distinct forms of local data:

1. **Recipe content** (378 recipes and 236 canonical ingredients): shipped as TypeScript/JavaScript bundled with the application in `src/data/recipes.ts` and `src/data/ingredients.ts`. `getCatalog()` directly validates and caches this immutable collection. `src/domain/staticCatalog.ts` provides bounded pagination and normalized Persian title search without SQLite writes or network access.
2. **User-owned mutable data**: kept in a private, on-device OP-SQLite database, `seghalam.sqlite`: `pantry`, `shopping`, `favorite`, `meal`, `history`, `cooking_session`, `user_setting` and `schema_meta`. Operations that change multiple user rows still use SQLite transactions.

**No recipe catalog is seeded into SQLite at startup.** Earlier v0.2.0 builds imported thousands of content rows and their relationships during `syncCatalog()`. Real device first launch failed while doing so and surfaced `cannot rollback - no transaction is active`. OP-SQLite has a documented class of issues where an automatic rollback masks an underlying SQL failure (see [upstream issue #462](https://github.com/OP-Engineering/op-sqlite/issues/462)). That report concerns another OP-SQLite version; it does **not** establish the exact original cause on this device. Host SQLite accepted the same catalog data and constraints. Removing the unnecessary content import eliminates this transaction from app startup entirely.

## Existing installations / migration safety

- `schema_meta.version` stays at **6**. No forced schema downgrade, database deletion or app-data reset is performed.
- Existing v1–v6 migration steps still run for older installs.
- Historical `catalog_*` tables may exist on user devices and are left **untouched**, to avoid destructive migrations. New installs also create the backward-compatible empty tables, but do not populate them. These tables are not consulted by the application at runtime.
- `getCatalog()`, recipe page/search and `addMeal()` refer to bundled recipes, never to the old `catalog_recipe` table. Existing recipe IDs are stable.
- Shopping, cooking completion, favorites, history and pantry data stay in SQLite. Preserve the same Android application ID and signing key when installing the update.

## Validation

- `npm run typecheck` — React Native TypeScript types (requires installed native dependencies).
- `npm run test:all` — includes existing domain, content structure and SQLite host migration checks plus new static-catalog and mocked first-launch tests.
- `tests/static-catalog.test.cjs` — checks all 378 recipes, page/filter/search, stable ordering and disallows static recipe inserts from bootstrap.
- `tests/native-startup-contract.test.cjs` — executes the actual transpiled `src/storage/db.ts` against an in-memory **mock** of OP-SQLite with both fresh and existing v6 schema states; ensures initialization does not insert content and meal selection works without `catalog_recipe`. Mock tests are not equivalent to testing a real Android device.
- Host Python SQLite migration tests protect user data and integrity. These are not Android instrumentation tests.

## Content-only QA database

`content/catalog.generated.json` and `content/seghalam-catalog.sqlite` are **optional QA/export fixtures**, not shipped/opened as the application's mutable on-device database. The SQLite fixture contains 378 recipes, 236 ingredients and 2,045 recipe–ingredient rows. It is still useful for analysis and editorial review.

All recipes remain **draft** and require independent culinary validation prior to public release.

## Real-device acceptance criteria

On an Android device: install the updated APK **over the existing signed version without clearing data**, launch without a database error, confirm 378 searchable recipes, add/edit pantry items, mark favorites, add a meal, close/reopen, and check persistence. Also test a fresh install on another device / emulator with its own data. Native device validation is required before claiming broad Android compatibility.
