/** Release guard: never infer independent cooking/rights review from source code alone. */
const fs=require('node:fs');const crypto=require('node:crypto');
const path=require('node:path');
const {validateProductionCatalog}=require('../.domain-build/domain/validate');
const {RECIPES}=require('../.domain-build/data/recipes');
const errors=validateProductionCatalog(RECIPES);
// Read a deliberately human-edited audit sheet. This does not itself verify claims;
// the signed evidence must be checked separately before pressing Publish in the store.
function parseCsv(raw){
 const out=[],row=[];let value='',quoted=false;
 const text=raw.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){
   if(quoted&&text[i+1]==='"'){value+='"';i++;}
   else quoted=!quoted;
  }else if(c===','&&!quoted){row.push(value);value='';}
  else if((c==='\n'||c==='\r')&&!quoted){
   if(c==='\r'&&text[i+1]==='\n')i++;
   row.push(value);value='';if(row.some(x=>x!==''))out.push(row.splice(0));else row.length=0;
  }else value+=c;
 }
 if(quoted)throw Error('Malformed review CSV: unterminated quote');
 if(value||row.length){row.push(value);out.push(row);}
 const header=out.shift();if(!header)throw Error('Review CSV missing header');
 return out.map(fields=>Object.fromEntries(header.map((key,i)=>[key,fields[i]??''])));
}
const queue=path.resolve(__dirname,'../content/editorial-review-queue.csv');
try{
 const rows=parseCsv(fs.readFileSync(queue,'utf8'));
 const byId=new Map(rows.map(r=>[r.recipe_id,r]));
 if(rows.length!==RECIPES.length||byId.size!==rows.length)errors.push('production: review sheet contains missing/duplicated recipe rows');
 for(const recipe of RECIPES){
  const r=byId.get(recipe.id);
  if(!r){errors.push(`${recipe.id}: absent in editorial checklist`);continue;}
  if(recipe.contentStatus!=='reviewed')continue; // Explicit draft errors are already reported.
  const flags=['source_checked','amounts_verified','steps_cooked_and_tested','food_safety_reviewed','allergens_verified','rights_and_photos_cleared','publish_approved'];
  if(!r.editor?.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(r.review_date||'')||
    r.status!=='reviewed'||!/^https:\/\//.test(r.source_url||'')||
    flags.some(flag=>r[flag]!=='YES'))errors.push(`${recipe.id}: incomplete human review evidence`);
  if(recipe.provenance.sourceScope!=='recipe')errors.push(`${recipe.id}: editorial review requires an individually matched recipe URL, not a category index`);
  if(r.source_url!==recipe.provenance.url)errors.push(`${recipe.id}: source URL differs from signed-off checklist`);
  const hash=crypto.createHash('sha256').update(JSON.stringify(recipe)).digest('hex');
  if(r.content_hash!==hash)errors.push(`${recipe.id}: recipe content changed after culinary sign-off`);
 }
}catch(e){errors.push('production: content review sheet unreadable: '+String(e));}
if(errors.length){
 console.error('CONTENT RELEASE GATE FAILED — not safe to publish:');
 for(const e of errors.slice(0,25))console.error(' - '+e);
 if(errors.length>25)console.error(` - …and ${errors.length-25} more violations`);
 process.exit(1);
}
console.log(`CONTENT RELEASE GATE PASS — ${RECIPES.length} individually reviewed and signed-off records. Store and Android acceptance remain separate checks.`);
