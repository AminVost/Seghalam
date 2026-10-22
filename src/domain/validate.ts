import {BY_ID} from '../data/ingredients';
import type {Recipe,Category} from './types';
import {sensibleRecipeUnit} from './ingredientUnits';
import {normalizeFa} from './normalize';

export function validateCatalog(recipes:readonly Recipe[]):string[]{
  const errs:string[]=[],ids=new Set<string>(),titles=new Set<string>();
  for(const r of recipes){
    if(ids.has(r.id))errs.push(`${r.id}: duplicate id`);ids.add(r.id);
    const normalizedTitle=normalizeFa(r.title);
    if(titles.has(normalizedTitle))errs.push(`${r.id}: duplicate normalized title`);titles.add(normalizedTitle);
    if(!r.title.trim()||r.steps.length<2||r.ingredients.length<2)errs.push(`${r.id}: incomplete`);
    if(!Number.isSafeInteger(r.servings)||r.servings<1||r.servings>30||
       !Number.isFinite(r.prepMinutes)||r.prepMinutes<0||
       !Number.isFinite(r.cookMinutes)||r.cookMinutes<0||r.cookMinutes+r.prepMinutes<=0)
      errs.push(`${r.id}: invalid time/servings`);
    if(!r.categories.length)errs.push(`${r.id}: no category`);
    const ingIds=new Set<string>();
    for(const ing of r.ingredients){
      if(ingIds.has(ing.ingredientId))errs.push(`${r.id}: duplicate ingredient ${ing.ingredientId}`);
      ingIds.add(ing.ingredientId);
      if(!BY_ID.has(ing.ingredientId)||!Number.isFinite(ing.quantity.amount)||ing.quantity.amount<=0)errs.push(`${r.id}: invalid ingredient ${ing.ingredientId}`);
      if(!sensibleRecipeUnit(ing.ingredientId,ing.quantity.unit))errs.push(`${r.id}: questionable unit ${ing.ingredientId}`);
    }
    for(const step of r.steps){if(!step.title.trim()||!step.body.trim())errs.push(`${r.id}: empty step`);}
    if(r.provenance.sourceScope==='collection'&&!r.provenance.sourceTitle)errs.push(`${r.id}: no collection-listed title`);
    if(r.contentStatus==='reviewed'&&(r.provenance.kind!=='source'||
       !r.provenance.url||!/^https:\/\//.test(r.provenance.url)||r.provenance.sourceScope!=='recipe'))errs.push(`${r.id}: reviewed without verifiable source URL`);
  }
  return errs;
}
/** The release gate is intentionally stricter than schema-valid editorial drafts. */
export function validateProductionCatalog(recipes:readonly Recipe[]):string[]{
  const errors=validateCatalog(recipes);
  if(recipes.length<120)errors.push(`production: ${recipes.length}/120 distinct recipes`);
  const targets:Record<Category,number>={iranian:60,light:30,snack:30,fastfood:25};
  for(const [category,minimum] of Object.entries(targets)){
    const total=recipes.filter(r=>r.categories.includes(category as Category)).length;
    if(total<minimum)errors.push(`production: ${category} ${total}/${minimum}`);
  }
  const drafts=recipes.filter(r=>r.contentStatus!=='reviewed');
  if(drafts.length)errors.push(`production: ${drafts.length} unreviewed recipes`);
  return errors;
}
