# Test evidence — 2026-10-20, database expansion to 378 dishes

Environment: Node 22, available TypeScript compiler, Python 3 and host `sqlite3`. React Native `node_modules`, Android SDK and official Gradle wrapper unavailable, so no verified native app build.

| Check | Actual result | Caveat |
| --- | --- | --- |
| `npm run test:all` | **PASS**, 62 Node domain tests; 0 failures | RN app typecheck excluded |
| `npm run audit:semantic` | **PASS** on 378 records | Checks naming/ingredient logic, safety-note presence; not culinary quality |
| Dataset compilation/export | **PASS**, 378 draft recipes + 236 ingredients | Weights and procedures remain unverified |
| SQLite catalog integrity | **PASS**, 2,045 relation rows, FK clean | Python desktop fixture, not Android OP-SQLite |
| SQLite DDL/checks/triggers | **PASS**, schema v5 tables | No device migration 4→5 evidence |
| v4→v5 migration simulation on host | **PASS**, 378 new catalog rows, preserves user pantry/shopping/favorites/meal/history/settings | Host sqlite3 simulation; not real Android JSI |
| Unit tests: content provenance/allergens/duplicates | **PASS** as part of 62 | Cannot replace actual label review |
| `npm run audit:content` | **EXPECTED NONZERO EXIT** for 378 drafts | Correct release-gate behavior |
| Host SQLite profiling | **DONE**, medians documented | Only host and only SQL; NOT Android speed |
| Full RN `npm run typecheck` | **BLOCKED** | npm dependencies missing |
| `assembleDebug`, E2E device/emulator, app memory/FPS | **NOT RUN** | No SDK/native runtime device |
| Signed release/Café Bazaar compliance | **NOT VERIFIED** | Editorial QA and signing incomplete |

See `docs/CATALOG_SQLITE_HOST_BENCHMARK.json`, `docs/DATABASE_EXPANSION_REVIEW_2026-10-20.md`, `docs/test-all-latest.log` (must be regenerated after changes), and `docs/content-gate-latest.log`.
