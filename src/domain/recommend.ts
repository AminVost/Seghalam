import type {Category,DietaryRule,Eligibility,PantryItem,Recipe} from './types';
import {matchRecipe} from './matcher';
const priority:Record<Eligibility['status'],number>={ready:5,substituted:4,uncertain:3,missing:2,incompatible:0};
export function recommend(recipes:readonly Recipe[],pantry:readonly PantryItem[],opts:{servings?:number;maxMinutes?:number;categories?:Category[];diet?:DietaryRule}={}){
  return recipes.filter(r=>(!opts.maxMinutes||r.prepMinutes+r.cookMinutes<=opts.maxMinutes)&&
    (!opts.categories?.length||opts.categories.some(c=>r.categories.includes(c))))
    .map(r=>{
      const assessment=matchRecipe(r,pantry,opts.servings??r.servings,opts.diet);
      const score=priority[assessment.status]*1000-assessment.missing.length*25-
        (r.prepMinutes+r.cookMinutes)*0.3-(r.difficulty==='medium'?5:0);
      return {recipe:r,...assessment,score};
    }).filter(r=>r.status!=='incompatible')
    .sort((a,b)=>b.score-a.score||a.recipe.title.localeCompare(b.recipe.title,'fa'));
}
