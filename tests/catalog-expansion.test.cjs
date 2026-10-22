const test=require('node:test');const assert=require('node:assert/strict');
const {RECIPES}=require('../.domain-build/data/recipes');
const {INGREDIENTS,BY_ID}=require('../.domain-build/data/ingredients');
const {matchRecipe}=require('../.domain-build/domain/matcher');
const {validateCatalog}=require('../.domain-build/domain/validate');
const {normalizeFa}=require('../.domain-build/domain/normalize');
const grown=RECIPES.filter(r=>Number(r.id.slice(7))>=173);
test('database contains at least twice the baseline 173 dishes',()=>assert.ok(RECIPES.length>=346));
test('original IDs are preserved and added IDs are contiguous',()=>{
 for(let i=0;i<RECIPES.length;i++)assert.equal(RECIPES[i].id,`recipe-${String(i+1).padStart(3,'0')}`);
});
test('expanded ingredient identifiers are unique and usable',()=>{
 assert.equal(new Set(INGREDIENTS.map(i=>i.id)).size,INGREDIENTS.length);
 assert.ok(INGREDIENTS.length>=220);
 for(const r of RECIPES)for(const ing of r.ingredients)assert.ok(BY_ID.has(ing.ingredientId),`${r.id}: ${ing.ingredientId}`);
});
test('new records have bounded source-discovery metadata and no forged sign-off',()=>{
 assert.ok(grown.length>=174);
 for(const r of grown){
  assert.equal(r.contentStatus,'draft');
  assert.match(r.provenance.url,/^https:\/\/(tollbit\.bbcgoodfood\.com|chishi\.ir)\//);
  assert.ok(['collection','recipe','adaptation'].includes(r.provenance.sourceScope));
  assert.ok(r.provenance.sourceTitle.length>2);
 }
});
test('recipe-index links are not accepted as verified recipe-level sources',()=>{
 const indexRecord=grown.find(r=>r.provenance.sourceScope==='collection');assert.ok(indexRecord);
 assert.ok(validateCatalog([{...indexRecord,contentStatus:'reviewed'}]).some(x=>x.includes('reviewed')));
});
test('commercial ingredient of unknown composition is not falsely allergy-safe',()=>{
 assert.equal(BY_ID.get('sausages').compositionUnverified,true);
 const r={...RECIPES[0],ingredients:[{ingredientId:'sausages',quantity:{amount:150,unit:'g'},essential:true}]};
 assert.equal(matchRecipe(r,[],3,{excludedIngredientIds:[],excludedAllergens:['گلوتن']}).status,'incompatible');
});
test('pesto has conservative milk and nut allergen metadata',()=>{
 assert.ok(BY_ID.get('pesto').allergens.includes('مغزها'));
 assert.ok(BY_ID.get('pesto').allergens.includes('لبنیات'));
});
test('no recipe aliases are disguised as duplicate ingredient sets',()=>{
 const combinations=new Map();
 for(const r of RECIPES){
  const signature=r.ingredients.map(i=>i.ingredientId).sort().join(',');
  assert.equal(combinations.has(signature),false,`Same ingredient set: ${r.title} / ${combinations.get(signature)}`);
  combinations.set(signature,r.title);
 }
});
test('Persian-normalized new titles are distinct',()=>{
 const names=grown.map(r=>normalizeFa(r.title));
 assert.equal(new Set(names).size,names.length);
});
test('new poultry, fish, and mince include temperature notes',()=>{
 for(const r of grown){
  const ids=new Set(r.ingredients.map(x=>x.ingredientId));
  const combined=r.steps.map(x=>x.safetyNote||'').join(' ');
  if(['chicken','chicken_thigh','chicken_leg','chicken_mince','ground_turkey'].some(x=>ids.has(x)))assert.match(combined,/۷۴/,r.title);
  if(['ground_beef','ground_lamb'].some(x=>ids.has(x)))assert.match(combined,/۷۱/,r.title);
  if(['salmon','fish','white_fish','cod','sardine'].some(x=>ids.has(x)))assert.match(combined,/۶۳/,r.title);
 }
});
test('all new recipes contain four actionable editorial cooking steps',()=>{
 for(const r of grown){assert.ok(r.steps.length>=4,r.title);for(const s of r.steps)assert.ok(s.body.length>=30,r.title);}
});
