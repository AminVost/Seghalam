import type {Quantity} from './types';
import {convert} from './units';
import {BY_ID} from '../data/ingredients';
/** Aggregate only when a trustworthy conversion exists and neither amount is unknown. */
export function aggregateShopping(rows:readonly {ingredientId:string;quantity:Quantity|null}[]):{ingredientId:string;quantity:Quantity|null}[]{
  const result:{ingredientId:string;quantity:Quantity|null}[]=[];
  for(const row of rows){
    if(!row.quantity){result.push({...row});continue;}
    const found=result.find(v=>v.ingredientId===row.ingredientId&&v.quantity!==null&&
      convert(row.quantity!,v.quantity!.unit,BY_ID.get(row.ingredientId))!==null);
    if(found&&found.quantity){
      found.quantity={amount:found.quantity.amount+convert(row.quantity,found.quantity.unit,BY_ID.get(row.ingredientId))!,unit:found.quantity.unit};
    }else{result.push({ingredientId:row.ingredientId,quantity:{...row.quantity}});}
  }
  return result;
}
