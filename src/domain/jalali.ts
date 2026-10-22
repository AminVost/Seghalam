import {isValidIsoDay} from './dates';

/** Pure calendar adapter. SQLite stores unambiguous Gregorian YYYY-MM-DD civil dates. */
const persianNumber = (raw:string):string=>raw.replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776))
  .replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632));
const persianFormatter=()=>new Intl.DateTimeFormat('en-US-u-ca-persian',{
  timeZone:'UTC',year:'numeric',month:'2-digit',day:'2-digit',calendar:'persian'
});
function jalaliParts(day:string):number[] {
  const isoDay=new Date(`${day}T12:00:00.000Z`);
  const formatter=persianFormatter();
  if(formatter.resolvedOptions().calendar!=='persian')throw new Error('تقویم شمسی روی این دستگاه پشتیبانی نمی‌شود؛ از تاریخ میلادی YYYY-MM-DD استفاده کن');
  const parts=formatter.formatToParts(isoDay);
  return ['year','month','day'].map(k=>Number(parts.find(v=>v.type===k)?.value??NaN));
}
export function formatJalali(day:string):string {
  if(!isValidIsoDay(day))return day;
  try {
    const parts=jalaliParts(day);
    return parts.map((n,i)=>String(n).padStart(i===0?4:2,'0')).join('/').replace(/[0-9]/g,n=>'۰۱۲۳۴۵۶۷۸۹'[Number(n)]!);
  }catch{return day;}
}
/** Accept Persian, Arabic and ASCII numerals; reject impossible Jalali dates. */
export function toIsoDate(raw:string):string {
  const input=persianNumber(raw.trim()).replace(/\s/g,'');
  if(isValidIsoDay(input))return input;
  const match=/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/.exec(input);
  if(!match)throw new Error('تاریخ باید مانند ۱۴۰۵/۰۷/۲۸ باشد');
  const y=Number(match[1]),m=Number(match[2]),d=Number(match[3]);
  if(y<1250||y>1550||m<1||m>12||d<1||d>31)throw new Error('تاریخ شمسی نامعتبر است');
  const target=y*10000+m*100+d;
  // The proleptic calendar conversion is computed with native Intl; avoid fragile home-made leap tables.
  let lo=Math.floor(Date.UTC(1850,0,1)/86400000),hi=Math.floor(Date.UTC(2150,11,31)/86400000);
  while(lo<=hi){
    const mid=Math.floor((lo+hi)/2);
    const iso=new Date(mid*86400000).toISOString().slice(0,10);
    const [yy,mm,dd]=jalaliParts(iso);
    const n=yy!*10000+mm!*100+dd!;
    if(n===target)return iso;
    if(n<target)lo=mid+1;else hi=mid-1;
  }
  throw new Error('تاریخ شمسی وجود ندارد');
}
