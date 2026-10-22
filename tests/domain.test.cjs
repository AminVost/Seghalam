const test=require('node:test');const assert=require('node:assert/strict');
const {normalizeFa,extractIngredients}=require('../.domain-build/domain/normalize');
const {convert,scaleQuantity}=require('../.domain-build/domain/units');
const {parseIntent}=require('../.domain-build/domain/language');
const {matchRecipe}=require('../.domain-build/domain/matcher');
const {consumeItems}=require('../.domain-build/domain/inventory');
const {recommend}=require('../.domain-build/domain/recommend');
const {validateCatalog}=require('../.domain-build/domain/validate');
const {RECIPES}=require('../.domain-build/data/recipes');
const fixed={id:'p',ingredientId:'egg',quantity:{amount:1,unit:'pcs'},createdAt:'2026-10-20'};
const eggDish={id:'egg-test',title:'تخم مرغ',description:'',categories:['snack'],servings:1,prepMinutes:1,cookMinutes:5,difficulty:'easy',ingredients:[{ingredientId:'egg',quantity:{amount:3,unit:'pcs'},essential:true}],steps:[{title:'یک',body:'الف'},{title:'دو',body:'ب'}],contentStatus:'draft',provenance:{kind:'editorial'}};
test('normalizes Persian/Arabic letters and digits',()=>{assert.equal(normalizeFa('سيب‌زمينی ۳'), 'سیب زمینی 3');});
test('longest alias does not conflate paste with fresh tomato',()=>{assert.deepEqual(extractIngredients('رب گوجه دارم').map(x=>x.id),['tomato_paste']);});
test('negation across clauses',()=>{let x=parseIntent('مرغ دارم ولی تخم‌مرغ ندارم');assert.deepEqual(x.includedIds,['chicken']);assert.deepEqual(x.excludedIds,['egg']);});
test('exclude explicitly without',()=>{assert.deepEqual(parseIntent('غذای بدون شیر و پنیر').excludedIds,['milk','cheese']);});
test('Persian time and servings',()=>{const x=parseIntent('با مرغ زیر ۳۰ دقیقه برای ۳ نفر');assert.equal(x.maxTimeMinutes,30);assert.equal(x.servings,3);});
test('converts mass but not pieces without references',()=>{assert.equal(convert({amount:2,unit:'kg'},'g'),2000);assert.equal(convert({amount:2,unit:'pcs'},'g'),null);});
test('scales servings accurately',()=>{assert.equal(scaleQuantity({amount:100,unit:'g'},2,3).amount,150);});
test('reports insufficient eggs not ready',()=>{const x=matchRecipe(eggDish,[fixed]);assert.equal(x.status,'missing');assert.equal(x.missing[0].shortfall.amount,2);});
test('unknown quantity never ready',()=>{const x=matchRecipe(eggDish,[{...fixed,quantity:null}]);assert.equal(x.status,'uncertain');});
test('blocks dietary allergen',()=>{assert.equal(matchRecipe(eggDish,[fixed],1,{excludedIngredientIds:[],excludedAllergens:['تخم‌مرغ']}).status,'incompatible');});
test('rejects inventory becoming negative and does not mutate original',()=>{assert.throws(()=>consumeItems([fixed],[{ingredientId:'egg',quantity:{amount:2,unit:'pcs'}}]));assert.equal(fixed.quantity.amount,1);});
test('catalog recipe schema all valid',()=>{assert.deepEqual(validateCatalog(RECIPES),[]);});
test('recommendations ranked with strict statuses',()=>{const x=recommend([eggDish],[{...fixed,quantity:{amount:3,unit:'pcs'}}]);assert.equal(x[0].status,'ready');});
const {aggregateShopping}=require('../.domain-build/domain/shopping');
test('shopping aggregation converts compatible quantities',()=>{
 const x=aggregateShopping([{ingredientId:'rice',quantity:{amount:1,unit:'kg'}},{ingredientId:'rice',quantity:{amount:250,unit:'g'}}]);
 assert.equal(x.length,1);assert.equal(x[0].quantity.amount,1.25);
});
test('does not merge incompatible units',()=>{
 const x=aggregateShopping([{ingredientId:'rice',quantity:{amount:1,unit:'pcs'}},{ingredientId:'rice',quantity:{amount:200,unit:'g'}}]);assert.equal(x.length,2);
});
test('does not assume absent ingredients when search contains negation',()=>{
 const x=parseIntent('با مرغ ولی بدون شیر و پنیر');assert.deepEqual(x.includedIds,['chicken']);assert.deepEqual(x.excludedIds,['milk','cheese']);
});
test('published content always requires provenance',()=>{
 const r={...RECIPES[0],contentStatus:'reviewed'};assert.ok(validateCatalog([r]).length>0);
});
test('cooking consumption succeeds only with sufficient quantity',()=>{
 const x=consumeItems([{...fixed,quantity:{amount:5,unit:'pcs'}}],[{ingredientId:'egg',quantity:{amount:3,unit:'pcs'}}]);assert.equal(x[0].quantity.amount,2);
});
const {parsePositiveAmount}=require('../.domain-build/domain/units');
test('Persian decimal quantities are not multiplied by ten',()=>{assert.equal(parsePositiveAmount('۱٫۵'),1.5);assert.equal(parsePositiveAmount('۲۵۰'),250);});
test('empty quantity remains explicitly unknown',()=>{assert.equal(parsePositiveAmount(' '),null);});
test('rejects malformed and negative quantities',()=>{assert.throws(()=>parsePositiveAmount('-۱'));assert.throws(()=>parsePositiveAmount('۱.۲.۳'));});
