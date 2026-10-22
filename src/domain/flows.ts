/** UI flow invariants, isolated for device-independent regression tests. */
export function selectedRecipeStillVisible(selectedId:string,visible:readonly {id:string}[]):boolean{
  return selectedId.length>0&&visible.some(item=>item.id===selectedId);
}
/** Pre-v6 cooking sessions lack persisted servings (stored as zero on upgrade). */
export function effectiveCookingServings(saved:number,recipeDefault:number):number{
  return Number.isSafeInteger(saved)&&saved>=1&&saved<=30?saved:recipeDefault;
}
export function clampedCookingStep(index:number,numberOfSteps:number):number{
  if(!Number.isSafeInteger(numberOfSteps)||numberOfSteps<1)throw new Error('دستور بدون مرحله است');
  return Number.isSafeInteger(index)?Math.max(0,Math.min(index,numberOfSteps-1)):0;
}
