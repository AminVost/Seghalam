const test=require('node:test');
const assert=require('node:assert/strict');
const {localIsoDay,isValidIsoDay,isExpired}=require('../.domain-build/domain/dates');
const {usablePantry}=require('../.domain-build/domain/pantry');
const {defaultUnitFor,sensibleRecipeUnit}=require('../.domain-build/domain/ingredientUnits');
const {parseIntent}=require('../.domain-build/domain/language');
const {matchRecipe}=require('../.domain-build/domain/matcher');
const {consumeItems}=require('../.domain-build/domain/inventory');
const {validateCatalog}=require('../.domain-build/domain/validate');
const {recommend}=require('../.domain-build/domain/recommend');
const {RECIPES}=require('../.domain-build/data/recipes');
const q=(amount,unit='pcs')=>({amount,unit});
const egg={id:'egg-lot',ingredientId:'egg',quantity:q(3),createdAt:'2026-10-20'};
const recipe={id:'fixture',title:'تخم‌مرغ آزمایشی',description:'',categories:['snack'],servings:1,prepMinutes:2,cookMinutes:4,difficulty:'easy',ingredients:[{ingredientId:'egg',quantity:q(2),essential:true}],steps:[{title:'الف',body:'ب'},{title:'پ',body:'ت'}],contentStatus:'draft',provenance:{kind:'editorial'}};
test('calendar validates month lengths and leap days',()=>{
 assert.equal(isValidIsoDay('2024-02-29'),true);
 for(const x of ['2025-02-29','2026-04-31','2026-13-01','2026-00-01','2026-10-00','not-a-date','٢٠٢٦-١٠-٢٠'])assert.equal(isValidIsoDay(x),false,x);
});
test('local date formatting uses local calendar without UTC conversion',()=>{assert.equal(localIsoDay(new Date(2026,9,20,23,59)), '2026-10-20');});
test('expiry on same day remains usable, past day expires',()=>{
 assert.equal(isExpired('2026-10-20','2026-10-20'),false);
 assert.equal(isExpired('2026-10-19','2026-10-20'),true);
 assert.equal(isExpired(undefined,'2026-10-20'),false);
});
test('expired lot excluded from pantry matching',()=>{
 assert.equal(matchRecipe(recipe,[{...egg,expiresOn:'2020-01-01'}]).status,'missing');
 assert.equal(matchRecipe(recipe,[{...egg,expiresOn:'2099-01-01'}]).status,'ready');
});
test('mixed expired and usable lots only count unexpired quantity',()=>{
 const x=matchRecipe(recipe,[{...egg,id:'a',quantity:q(100),expiresOn:'2020-01-01'},{...egg,id:'b',quantity:q(1)}]);
 assert.equal(x.status,'missing');assert.equal(x.missing[0].shortfall.amount,1);
});
test('pantry filters expired but retains unknown expiration',()=>{
 const a=usablePantry([{...egg,id:'a',expiresOn:'2020-01-01'},{...egg,id:'b'}]);
 assert.deepEqual(a.map(x=>x.id),['b']);
});
test('never consumes expired lots',()=>{
 assert.throws(()=>consumeItems([{...egg,expiresOn:'2020-01-01'}],[{ingredientId:'egg',quantity:q(1)}]));
});
test('consumes across multiple usable lots without mutating original',()=>{
 const old=[{...egg,id:'a',quantity:q(1)},{...egg,id:'b',quantity:q(2)}];
 const res=consumeItems(old,[{ingredientId:'egg',quantity:q(2)}]);
 assert.equal(res[0].quantity.amount+res[1].quantity.amount,1);
 assert.equal(old[0].quantity.amount,1);
});
test('rejects zero, infinity and NaN consumption',()=>{
 for(const amount of [0,-2,Infinity,NaN])assert.throws(()=>consumeItems([egg],[{ingredientId:'egg',quantity:q(amount)}]));
});
test('per-ingredient defaults match recipe quantity dimension',()=>{
 assert.equal(defaultUnitFor('milk'),'ml');assert.equal(defaultUnitFor('oil'),'ml');
 assert.equal(defaultUnitFor('egg'),'pcs');assert.equal(defaultUnitFor('rice'),'g');
 assert.equal(sensibleRecipeUnit('lemon','ml'),false);
});
test('recipe with invalid quantity unit fails content validation',()=>{
 const broken={...recipe,ingredients:[{ingredientId:'lemon',quantity:q(20,'ml'),essential:true}]};
 assert.ok(validateCatalog([broken]).some(e=>e.includes('questionable unit')));
});
test('recipe with duplicate ingredient IDs is rejected',()=>{
 const broken={...recipe,ingredients:[...recipe.ingredients,...recipe.ingredients]};
 assert.ok(validateCatalog([broken]).some(e=>e.includes('duplicate ingredient')));
});
test('edited content cannot accidentally be marked reviewed without provenance',()=>{
 const broken={...recipe,contentStatus:'reviewed'};
 assert.ok(validateCatalog([broken]).length>0);
});
test('real draft catalog is still not production-reviewed',()=>{
 assert.equal(RECIPES.filter(x=>x.contentStatus==='reviewed').length,0);
 assert.ok(RECIPES.length>=120);
});
test('coordinated negative ingredients are all excluded',()=>{
 const x=parseIntent('شیر و پنیر ندارم'); assert.deepEqual(x.excludedIds,['milk','cheese']);assert.deepEqual(x.includedIds,[]);
});
test('independent positive and negative clauses do not leak',()=>{
 const x=parseIntent('شیر ندارم ولی پنیر دارم');assert.deepEqual(x.includedIds,['cheese']);assert.deepEqual(x.excludedIds,['milk']);
});
test('without scope ends before با clause',()=>{
 const x=parseIntent('بدون مرغ و قارچ با سیب زمینی');assert.deepEqual(x.excludedIds,['chicken','mushroom']);assert.deepEqual(x.includedIds,['potato']);
});
test('positive clause after comma overrides earlier بدون',()=>{
 const x=parseIntent('بدون شیر، پنیر دارم');assert.deepEqual(x.excludedIds,['milk']);assert.deepEqual(x.includedIds,['cheese']);
});
test('timed request in hours parsed to minutes',()=>{
 assert.equal(parseIntent('غذا زیر ۲ ساعت').maxTimeMinutes,120);
});
test('no recommendations with excluded allergen',()=>{
 assert.deepEqual(recommend([recipe],[egg],{diet:{excludedAllergens:['تخم‌مرغ'],excludedIngredientIds:[]}}),[]);
});
const {validateProductionCatalog}=require('../.domain-build/domain/validate');
test('production content gate rejects partial unverified draft catalog',()=>{
 const errors=validateProductionCatalog(RECIPES);
 assert.ok(RECIPES.length>=120);
 assert.ok(errors.some(x=>x.includes('unreviewed')));
 assert.equal(RECIPES.filter(x=>x.contentStatus==='reviewed').length,0);
});
test('reviewed source requires an HTTPS provenance URL',()=>{
 const invalid={...recipe,contentStatus:'reviewed',provenance:{kind:'source'}};
 assert.ok(validateCatalog([invalid]).some(x=>x.includes('source URL')));
});
test('duplicate normalized recipe titles are invalid',()=>{
 assert.ok(validateCatalog([recipe,{...recipe,id:'other',title:'تخم مرغ آزمایشی'}]).some(x=>x.includes('duplicate normalized title')));
});
const {parsePositiveAmount}=require('../.domain-build/domain/units');
test('comma used as decimal is never silently multiplied by ten',()=>{
 assert.equal(parsePositiveAmount('۱,۵'),1.5);
 assert.equal(parsePositiveAmount('۲,۲۵'),2.25);
});
test('thousands group separators must be valid',()=>{
 assert.equal(parsePositiveAmount('۱٬۵۰۰'),1500);
 assert.equal(parsePositiveAmount('1,234.5'),1234.5);
 for(const invalid of ['۱٬۵','1,2,3','1,000,5'])assert.throws(()=>parsePositiveAmount(invalid));
});
test('content now includes 120+ distinct titles and exceeds all category targets',()=>{
 assert.ok(RECIPES.length>=120);
 assert.equal(new Set(RECIPES.map(x=>x.title)).size,RECIPES.length);
 for(const [cat,min] of Object.entries({iranian:60,light:30,snack:30,fastfood:25}))
   assert.ok(RECIPES.filter(r=>r.categories.includes(cat)).length>=min,cat);
});
test('all chicken cooking drafts include minimum temperature safety note',()=>{
 const poultry=RECIPES.filter(r=>r.ingredients.some(i=>['chicken','chicken_leg','chicken_mince','turkey'].includes(i.ingredientId)));
 assert.ok(poultry.length>=12);
 assert.ok(poultry.every(r=>r.steps.some(s=>s.safetyNote?.includes('۷۴'))));
});
test('can consume from a compatible lot even if an earlier lot uses unconvertible units',()=>{
 const original=[{...egg,id:'grams',quantity:q(60,'g')},{...egg,id:'pieces',quantity:q(3,'pcs')}];
 const updated=consumeItems(original,[{ingredientId:'egg',quantity:q(2,'pcs')}]);
 assert.equal(updated[0].quantity.amount,60);
 assert.equal(updated[1].quantity.amount,1);
});

const {toIsoDate,formatJalali}=require('../.domain-build/domain/jalali');
test('Persian calendar date is reversible and stored as Gregorian civil ISO',()=>{
 assert.equal(toIsoDate('۱۴۰۵/۰۷/۲۸'),'2026-10-20');
 assert.equal(toIsoDate('1405/7/28'),'2026-10-20');
 assert.equal(formatJalali('2026-10-20'),'۱۴۰۵/۰۷/۲۸');
 assert.equal(toIsoDate('2026-10-20'),'2026-10-20');
});
test('Persian calendar rejects impossible dates and invalid input',()=>{
 for(const date of ['۱۴۰۵/۱۳/۰۱','۱۴۰۵/۰۱/۳۲','۱۴۰۴/۱۲/۳۰','۱۳۹۸/۰۰/۰۱','not-a-date'])
   assert.throws(()=>toIsoDate(date),date);
});
