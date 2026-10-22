import {BY_ID} from '../data/ingredients';
import {convert,scaleQuantity,quantityFa} from './units';
import {usablePantry} from './pantry';
import type {DietaryRule,Eligibility,Missing,PantryItem,Recipe,Substitution} from './types';
export function matchRecipe(recipe:Recipe,pantry:readonly PantryItem[],servings=recipe.servings,
  diet:DietaryRule={excludedIngredientIds:[],excludedAllergens:[]}, substitutions: readonly Substitution[]=[]):Eligibility{
  const missing:Missing[]=[];
  const applied:{from:string;to:string}[]=[];
  const pantryById=new Map<string,PantryItem[]>();
  for(const item of usablePantry(pantry)){pantryById.set(item.ingredientId,[...(pantryById.get(item.ingredientId)??[]),item]);}
  // Fail-closed: unclassified allergens do NOT imply allergy-safe claims.
  for(const ing of recipe.ingredients){
    const known=BY_ID.get(ing.ingredientId);
    if(diet.excludedIngredientIds.includes(ing.ingredientId) || !known ||
       known.allergens.some(a=>diet.excludedAllergens.includes(a)) ||
       (known.compositionUnverified===true && diet.excludedAllergens.length>0)){
      return {recipeId:recipe.id,status:'incompatible',missing:[],substitutions:[],explanation:'با محدودیت غذایی ثبت‌شده سازگار نیست.',score:-1};
    }
  }
  for(const ing of recipe.ingredients.filter(i=>i.essential)){
    const needed=scaleQuantity(ing.quantity,recipe.servings,servings,ing.scaling);
    let total=0,hasUnknown=false;
    for(const row of pantryById.get(ing.ingredientId)??[]){
      if(!row.quantity){hasUnknown=true;continue;}
      const converted=convert(row.quantity,needed.unit,BY_ID.get(ing.ingredientId));
      if(converted===null){hasUnknown=true;continue;}
      total+=converted;
    }
    if(total+1e-8>=needed.amount)continue;
    if(hasUnknown){missing.push({ingredientId:ing.ingredientId,needed,
      have:total?{amount:total,unit:needed.unit}:null,shortfall:null,kind:'unknown'});continue;}
    const alt=substitutions.find(s=>s.recipeId===recipe.id&&s.from===ing.ingredientId&&s.verified&&
      !diet.excludedIngredientIds.includes(s.to)&&!(BY_ID.get(s.to)?.allergens??[]).some(a=>diet.excludedAllergens.includes(a))&&
      !(diet.excludedAllergens.length>0&&BY_ID.get(s.to)?.compositionUnverified)&&
      (pantryById.get(s.to)??[]).some(p=>p.quantity&&convert(p.quantity,needed.unit,BY_ID.get(s.to))!==null&&
        (convert(p.quantity,needed.unit,BY_ID.get(s.to))??0)>=needed.amount*s.ratio));
    if(alt&&total===0){applied.push({from:alt.from,to:alt.to});continue;}
    missing.push({ingredientId:ing.ingredientId,needed,have:total?{amount:total,unit:needed.unit}:null,
      shortfall:{amount:Math.max(0,needed.amount-total),unit:needed.unit},kind:total?'insufficient':'absent'});
  }
  const status:Eligibility['status']=missing.some(m=>m.kind!=='unknown')?'missing':
    missing.length?'uncertain':applied.length?'substituted':'ready';
  let explanation='همه مواد ضروری به مقدار کافی موجودند.';
  if(status==='missing'){
    const first=missing.find(m=>m.kind!=='unknown')!;
    const fa=BY_ID.get(first.ingredientId)?.fa??first.ingredientId;
    explanation=`${fa}: ${quantityFa(first.shortfall!)} کم داری.`;
  }else if(status==='uncertain')explanation='مواد را داری، ولی مقدار بعضی‌ها مشخص نیست.';
  else if(status==='substituted')explanation='با یک جایگزین تأییدشده برای همین دستور قابل تهیه است.';
  return {recipeId:recipe.id,status,missing,substitutions:applied,explanation,score:0};
}
