import type {Quantity,Ingredient} from './types';
export function convert(value:Quantity,target:Quantity['unit'],ingredient?:Ingredient):number|null{
  if(!Number.isFinite(value.amount)||value.amount<0)return null;
  if(value.unit===target)return value.amount;
  const factor:Partial<Record<Quantity['unit'],number>>={g:1,kg:1000,ml:1,l:1000};
  const isMass=(u:Quantity['unit'])=>u==='g'||u==='kg';
  const isVolume=(u:Quantity['unit'])=>u==='ml'||u==='l';
  if((isMass(value.unit)&&isMass(target))||(isVolume(value.unit)&&isVolume(target))){
    return value.amount*(factor[value.unit]??1)/(factor[target]??1);
  }
  if(ingredient?.gramsPerPiece){
    if(value.unit==='pcs'&&isMass(target))return value.amount*ingredient.gramsPerPiece/(factor[target]??1);
    if(isMass(value.unit)&&target==='pcs')return value.amount*(factor[value.unit]??1)/ingredient.gramsPerPiece;
  }
  return null;
}
export function scaleQuantity(input:Quantity,baseServings:number,targetServings:number,behavior:'linear'|'fixed'='linear'):Quantity{
  if(!Number.isFinite(baseServings)||baseServings<=0||targetServings<=0||!Number.isFinite(targetServings)||!Number.isFinite(input.amount)||input.amount<0)throw new Error('تعداد نفرات نامعتبر');
  return {unit:input.unit,amount:behavior==='fixed'?input.amount:input.amount*targetServings/baseServings};
}
export function quantityFa(q:Quantity):string{
  const names:Record<Quantity['unit'],string>={g:'گرم',kg:'کیلوگرم',ml:'میلی‌لیتر',l:'لیتر',pcs:'عدد'};
  return `${new Intl.NumberFormat('fa-IR',{maximumFractionDigits:2}).format(q.amount)} ${names[q.unit]}`;
}

/** Locale-aware positive quantity, avoiding the Persian decimal separator being removed. */
export function parsePositiveAmount(input:string):number|null{
  const digitsFa='۰۱۲۳۴۵۶۷۸۹',digitsAr='٠١٢٣٤٥٦٧٨٩';
  const raw=input.trim();if(!raw)return null;
  let n=raw.replace(/[۰-۹]/g,c=>String(digitsFa.indexOf(c)))
    .replace(/[٠-٩]/g,c=>String(digitsAr.indexOf(c)))
    .replace(/٫/g,'.').replace(/\s/g,'');
  // Group separators require proper three-digit groups; never silently interpret 1,5 as 15.
  const groupedThousands=/^\d{1,3}(?:[,٬]\d{3})+(?:\.\d+)?$/;
  if(groupedThousands.test(n))n=n.replace(/[,٬]/g,'');
  else if(/^\d+,\d{1,2}$/.test(n))n=n.replace(',','.');
  else if(n.includes(',')||n.includes('٬'))throw new Error('جداکننده عدد نامعتبر یا مبهم است');
  if(!/^(?:\d+)(?:\.\d+)?$/.test(n))throw new Error('مقدار باید یک عدد مثبت باشد');
  const value=Number(n);
  if(!Number.isFinite(value)||value<=0)throw new Error('مقدار باید عدد مثبت باشد');
  return value;
}
