import type {Unit} from './types';
/** A physical unit is not necessarily convertible to every other unit. */
const liquids=new Set(['milk','water','lemon_juice','oil','olive_oil','chicken_stock','beef_broth','rosewater','vinegar','apple_vinegar','coconut_milk','soy_sauce','sesame_oil','ghee','maple_syrup','date_syrup','lime_juice']);
const countables=new Set(['egg','banana','apple','dates','orange','pear','lime','mango','pineapple','quince','peach','apricot','fig']);
export function defaultUnitFor(ingredientId:string):Unit {
  return countables.has(ingredientId)?'pcs':liquids.has(ingredientId)?'ml':'g';
}
export function sensibleRecipeUnit(ingredientId:string,unit:Unit):boolean {
  if(countables.has(ingredientId))return unit==='pcs'||unit==='g'||unit==='kg';
  if(liquids.has(ingredientId))return unit==='ml'||unit==='l';
  // Unspecified piece weights are not falsely translated into mass.
  return unit==='g'||unit==='kg';
}
