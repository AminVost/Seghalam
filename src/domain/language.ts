import {extractIngredients,normalizeFa} from './normalize';
import type {CookingIntent,Category} from './types';

/** Conservative Persian intent parser. Unrecognized grammar must never add ingredients automatically. */
export function parseIntent(input:string):CookingIntent{
  const n=normalizeFa(input);
  const found=extractIngredients(input);
  const includedIds:string[]=[],excludedIds:string[]=[];
  // Coordinate consecutive ingredients ('شیر و پنیر ندارم') as one phrase.
  const groups:typeof found[]=[];
  for(const ingredient of found){
    const last=groups[groups.length-1];
    const previous=last?.[last.length-1];
    const between=previous?n.slice(previous.end,ingredient.start).trim():'';
    if(last&&/^(و|یا|و یا)$/.test(between))last.push(ingredient);
    else groups.push([ingredient]);
  }
  const negative=/^(?:ندارم|نیست|نباشه|نمی خوام|نمیخورم|نمی خورم)(?:$|\s)/;
  const positive=/^(?:دارم|هست|می خوام|میخوام)(?:$|\s)/;
  for(let gi=0;gi<groups.length;gi++){
    const group=groups[gi]!;
    const first=group[0]!,last=group[group.length-1]!;
    const prev=groups[gi-1];
    const next=groups[gi+1];
    const before=n.slice(prev?prev[prev.length-1]!.end:0,first.start).trim();
    const after=n.slice(last.end,next?next[0]!.start:n.length).trim();
    // Last qualifier wins when an explicit suffix follows the group.
    const qualifiers=[...before.matchAll(/بدون|حساسیت به|نمی خوام|نمیخورم|نمی خورم|ندارم|نباشه|با|ولی|اما|دارم|هست/g)];
    const q=qualifiers.length?qualifiers[qualifiers.length-1]![0]:'';
    let excluded=/^(بدون|حساسیت به|نمی خوام|نمیخورم|نمی خورم|ندارم|نباشه)$/.test(q);
    if(negative.test(after))excluded=true;
    else if(positive.test(after))excluded=false;
    for(const ingredient of group){
      const bucket=excluded?excludedIds:includedIds;
      if(!bucket.includes(ingredient.id))bucket.push(ingredient.id);
    }
  }
  const timed=n.match(/(?:زیر|کمتر از|حداکثر)\s*(\d+)\s*(?:دقیقه|دقیقه ای|ساعت)/);
  const short=/نیم ساعت/.test(n)?30:/یک ساعت/.test(n)?60:undefined;
  const rawTime=timed?Number(timed[1])*(timed[0].includes('ساعت')?60:1):short;
  const persons=n.match(/(?:برای\s+)?(\d+)\s*نفر/);
  const categories:Category[]=[];
  if(/رژیمی|سبک|کم چرب/.test(n))categories.push('light');
  if(/میان وعده|صبحانه|عصرانه/.test(n))categories.push('snack');
  if(/فست فود|ساندویچ|پیتزا|پاستا/.test(n))categories.push('fastfood');
  if(/ایرانی|خورشت|خونگی|خانگی/.test(n))categories.push('iranian');
  return {includedIds:includedIds.filter(id=>!excludedIds.includes(id)),excludedIds,
    ...(rawTime&&rawTime>0&&rawTime<=600?{maxTimeMinutes:rawTime}:{}),
    ...(persons&&Number(persons[1])>=1&&Number(persons[1])<=30?{servings:Number(persons[1])}:{}),
    categories,unresolvedTerms:[]};
}
