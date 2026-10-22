# Deterministic recommendation engine

Algorithm: Persian alias normalization -> ingredient-intent parsing -> pantry quantity comparison -> dietary exclusions -> result status and deterministic rank. `src/domain/recommend.ts` sorts by suitability class before lower cook time and shortages. The scoring is an **engineering heuristic**, not a food-quality model.

Eligibility classes: `ready` (verified required quantity), `uncertain` (unknown amount/unit), `substituted` (only a verified, recipe-bound substitution), `missing` (absent or insufficient), `incompatible` (user exclusion). `incompatible` never appears in default suggestions.

No ingredient is auto-present even if water/salt. `null` quantity means existing but insufficient evidence of readiness. Use `convert()` for kg/g and l/ml; no generic pcs-to-grams conversion, density magic, or unidentified substitution.

The rules engine requires no AI API and is executable locally. Natural-language support is intentionally bounded: common ingredients, exclusions, short Persian requests, times and servings. It must not be promoted as unlimited generative AI.
