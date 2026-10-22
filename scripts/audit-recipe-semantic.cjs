/** Editorial QA heuristics: catches obvious recipe identity and safety mismatches,
 * but DOES NOT certify sensory quality, nutrition, licenses, or medical allergies. */
const {RECIPES}=require('../.domain-build/data/recipes');
const titleRules=[
 [/بامیه/,['okra']],[/شلغم/,['turnip']],[/آلو/,['prune']],
 [/(?:^|\s)مرغ/,['chicken','chicken_mince','chicken_leg','chicken_thigh','chicken_cooked']],
 [/ماهی(?!چه)/,['fish','tuna','salmon','cod','sardine','white_fish']],[/میگو/,['shrimp']],
 [/بادمجان/,['eggplant']],[/کدو/,['zucchini','pumpkin','pumpkin_seed','sweet_potato']],[/عدس/,['lentil','red_lentil']],
 [/نخود(?!فرنگی)/,['chickpea','chickpea_canned','chickpea_flour','peas','peas_frozen','red_lentil']],
 [/باقلا|باقالی/,['fava_bean']],[/لوبیا/,['bean','green_bean','kidney_bean','white_bean','canned_bean','black_bean','butter_bean']],
 [/گردو/,['walnut']],[/قارچ/,['mushroom']],[/زرشک/,['barberry']],
 [/موز(?!ارلا)/,['banana']],[/شیر(?!ازی|ین)/,['milk','coconut_milk','doogh']],
 [/ماست/,['yogurt']],[/تخم‌مرغ/,['egg']]
];
const errs=[];
for(const r of RECIPES){
 const ids=new Set(r.ingredients.map(x=>x.ingredientId));
 for(const [pattern,required] of titleRules){
  if(pattern.test(r.title)&&!required.some(key=>ids.has(key))){
   // 'لوبیاپلو' may use green beans; supported above.
   errs.push(`${r.id} ${r.title}: lacks named food ${pattern}`);
  }
 }
 const chicken=['chicken','chicken_mince','chicken_leg','chicken_thigh','turkey','ground_turkey'].some(x=>ids.has(x));
 const minced=ids.has('ground_beef')||ids.has('ground_lamb');
 const fish=['fish','shrimp','salmon','cod','white_fish','sardine'].some(x=>ids.has(x));
 if(chicken&&!r.steps.some(s=>s.safetyNote?.includes('۷۴')))errs.push(`${r.id}: no 74C poultry safety note`);
 if(minced&&!r.steps.some(s=>s.safetyNote?.includes('۷۱')))errs.push(`${r.id}: no 71C ground meat safety note`);
 if(fish&&!r.steps.some(s=>s.safetyNote?.includes('۶۳')))errs.push(`${r.id}: no 63C fish safety note`);
 if(r.steps.some(step=>step.body.length<15))errs.push(`${r.id}: overly terse step`);
}
if(errs.length){console.error(errs.join('\n'));process.exit(1)}
console.log(`Semantic structural QA: ${RECIPES.length} distinct recipes passed basic names, step length, and safety-note checks (not culinary review).`);
