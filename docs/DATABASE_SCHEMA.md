# Database architecture — schema migration v5 (2026-10-20)

## Runtime Android SQLite
`src/storage/db.ts` uses local private OP-SQLite `seghalam.sqlite` with `PRAGMA foreign_keys=ON`, transactional migrations (`schema_meta.version=5`) and indexes.

**User tables preserved during catalog refresh:** `pantry`, `favorite`, `shopping`, `meal`, `history`, `cooking_session`, `user_setting`, `schema_meta`. Pantry and shopping enforce checks; shopping transfer and cooking consumption/history are transactional.

**Catalog tables:**
- `catalog_ingredient(id,name_fa,payload)` and `catalog_recipe(id,title,payload,status,source_url)`
- `catalog_recipe_category(recipe_id,category)` and `catalog_recipe_ingredient(recipe_id,ingredient_id,amount,unit,essential)`
- new in v5: `catalog_recipe_search(recipe_id,normalized_title)` with `idx_catalog_search_title` and `catalog_ingredient_alias(ingredient_id,alias,normalized_alias)` with `idx_catalog_alias_norm`
- `catalog_meta(id,revision,recipe_count)`; `CONTENT_REVISION=2026102003`.

`syncCatalog()` validates 378 records, updates catalog tables transactionally, batches parameterized SQL inserts in chunks of 32 rows, and never truncates user tables. Existing recipe identifiers 001–172 remain stable, new IDs 173–378. `getCatalog()` caches the full catalog for the existing recommendation engine; `getCatalogPage(limit, offset, category)` and `searchCatalogInDb(query,limit)` offer bounded SQL reads for list-driven UI. The current UI is still attached to the full catalog array; memory optimization of all screens requires actual native profiling, not merely the existence of pagination helpers.

## Offline audit fixture
- `content/catalog.generated.json`: 378 draft recipes, 236 ingredients.
- `content/seghalam-catalog.sqlite`: 1,523,712-byte **standalone content-only audit fixture**, SQLite FK clean, 378 recipes, 236 ingredients, 2,045 relation rows; NOT native OP-SQLite runtime DB.
- `content/editorial-review-queue.csv`: 378 approval rows, still all pending.

Recreate: `npm run test:catalog && python scripts/export_review_queue.py` (requires Node/TypeScript/Python 3). Schema DDL smoke is covered by `scripts/validate_sqlite_schema.py`. `scripts/test_catalog_v5_migration.py` additionally simulates a v4→v5 migration in Python SQLite, checking preservation of pantry, favorites, meal, shopping, history, settings. Android migrations 4→5 have **not** been exercised on a device. See `docs/DATABASE_EXPANSION_REVIEW_2026-10-20.md`.
