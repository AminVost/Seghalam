import {INGREDIENTS} from '../data/ingredients';
const digits = '۰۱۲۳۴۵۶۷۸۹';
const arabicDigits='٠١٢٣٤٥٦٧٨٩';
export function normalizeFa(input:string):string {
  return input.normalize('NFKC').replace(/[يى]/g,'ی').replace(/ك/g,'ک')
    .replace(/[أإ]/g,'ا').replace(/ة/g,'ه')
    .replace(/[\u064B-\u065F\u0670\u0640]/g,'')
    .replace(/[۰-۹]/g,c=>String(digits.indexOf(c)))
    .replace(/[٠-٩]/g,c=>String(arabicDigits.indexOf(c)))
    .replace(/[\u200c\u200d]/g,' ').replace(/[^\p{L}\p{N}\s]/gu,' ')
    .replace(/\s+/g,' ').trim().toLowerCase();
}
function escapeRegex(v:string):string{return v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
/** Return non-overlapping, longest-first matches to prevent "رب گوجه" -> "گوجه". */
export function extractIngredients(text:string):Array<{id:string;start:number;end:number;phrase:string}> {
  const clean=` ${normalizeFa(text)} `;
  const candidates:Array<{id:string;start:number;end:number;phrase:string}>=[];
  for(const ing of INGREDIENTS){
    for(const alias of ing.aliases){
      const normalized=normalizeFa(alias);
      const rx = new RegExp(`\\s${escapeRegex(normalized)}(?=\\s)`,'g');
      for(const m of clean.matchAll(rx)){
        candidates.push({id:ing.id,start:(m.index ?? 0),end:(m.index ?? 0)+normalized.length,phrase:normalized});
      }
    }
  }
  candidates.sort((a,b)=>(b.end-b.start)-(a.end-a.start)||a.start-b.start);
  const chosen:typeof candidates=[];
  for(const candidate of candidates){
    if(!chosen.some(c=>candidate.start<c.end && c.start<candidate.end)) chosen.push(candidate);
  }
  return chosen.sort((a,b)=>a.start-b.start);
}
