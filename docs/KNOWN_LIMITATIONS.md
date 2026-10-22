# Known limitations / Release blockers (updated 2026-10-20)

**378 distinct named recipe drafts is not equivalent to 378 culinary verified recipes. There is no final Android APK or production release.**

1. All 378 recipes remain `draft`, 0 cooking-tested/independently signed off. In 206 new records the names originate from indexed source lists or selected individual pages, but weights and steps are editorial estimates. 185 link to collections, 8 individual pages, 13 adaptations; older 16 have historical source URLs and 156 lack specific links. Real per-recipe source verification, cooking, allergens and rights check required; 16 new Iranian detailed methods are also unverified.
2. Some new recipe steps are *method templates*, not individually validated cooking procedures, and may require major revision (especially complex traditional dishes, food safety and cooking duration).
3. No source-proven nutritional profiles, validated gluten/allergen/cross-contact guarantees or substitutions. Compound/branded food composition may vary; conservative filtering is not a clinical safety guarantee.
4. No complete RN dependency install/typecheck, Android SDK/Gradle build, emulator or device E2E. SQLite migration v5 and pagination helper exist but are not tested on Android and primary UI still loads full catalog into JS memory.
5. No verified background timer alarm, complete professional RTL/Dark Mode/accessibility QA, genuine licensed dish photos, on-device AI/photo classification or completed privacy/store/signing requirements.
6. Host SQLite benchmark medians are not Android FPS, cold-start or real app memory data.
7. `npm run audit:content` **must fail** until actual independent per-recipe QA/signed editorial checklist passes. Never bypass it to publish generated instructions.

Current audited files: `docs/DATABASE_EXPANSION_REVIEW_2026-10-20.md`, `content/editorial-review-queue.csv`, `docs/IMPLEMENTATION_STATUS.md`.
