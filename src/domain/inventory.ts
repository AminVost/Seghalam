import type {PantryItem,Quantity} from './types';
import {convert} from './units';
import {BY_ID} from '../data/ingredients';
import {isExpired} from './dates';
export function consumeItems(pantry:readonly PantryItem[], consumption:readonly {ingredientId:string;quantity:Quantity}[]):PantryItem[]{
  for(const used of consumption){if(!Number.isFinite(used.quantity.amount)||used.quantity.amount<=0)throw new Error('مقدار مصرف نامعتبر');}
  const copy=pantry.map(item=>({...item,quantity:item.quantity?{...item.quantity}:null}));
  for(const used of consumption){
    let remaining=used.quantity.amount;
    for(const row of copy.filter(i=>i.ingredientId===used.ingredientId&&i.quantity&&!isExpired(i.expiresOn))){
      if(remaining<=1e-9)break;
      const neededInRowUnit=convert({amount:remaining,unit:used.quantity.unit},row.quantity!.unit,BY_ID.get(used.ingredientId));
      // Other lots may be measured in a convertible unit. Skip incompatible lots.
      if(neededInRowUnit===null)continue;
      const take=Math.min(row.quantity!.amount,neededInRowUnit);
      row.quantity!.amount-=take;
      remaining-=convert({amount:take,unit:row.quantity!.unit},used.quantity.unit,BY_ID.get(used.ingredientId))!;
    }
    if(remaining>1e-8)throw new Error('مقدار موجودی کافی نیست');
  }
  return copy;
}
