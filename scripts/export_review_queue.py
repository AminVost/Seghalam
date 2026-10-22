"""Regenerate an audit sheet without erasing valid reviews of unchanged recipe content.
Existing sign-offs are retained ONLY if the exact authored recipe SHA-256 matches.
"""
from pathlib import Path
import json,csv
root=Path(__file__).resolve().parents[1]
catalog=json.loads((root/'content/catalog.generated.json').read_text(encoding='utf-8'))
out=root/'content/editorial-review-queue.csv'
headers=['recipe_id','name_fa','categories','servings','ingredient_count','step_count','content_hash','status','source_url','source_scope','source_title','editor','review_date','source_checked','amounts_verified','steps_cooked_and_tested','food_safety_reviewed','allergens_verified','rights_and_photos_cleared','publish_approved','review_notes']
old={}
if out.exists():
 with out.open('r',encoding='utf-8-sig',newline='') as previous:
  old={row['recipe_id']:row for row in csv.DictReader(previous)}
rows=[]
for r in catalog['recipes']:
 stamp=catalog['reviewHashes'][r['id']]
 previous=old.get(r['id'],{})
 keep=previous if previous.get('content_hash')==stamp else {}
 value={'recipe_id':r['id'],'name_fa':r['title'],'categories':';'.join(r['categories']),
  'servings':r['servings'],'ingredient_count':len(r['ingredients']),'step_count':len(r['steps']),
  'content_hash':stamp,'status':r['contentStatus'],'source_url':r['provenance'].get('url',''),'source_scope':r['provenance'].get('sourceScope','unknown'),'source_title':r['provenance'].get('sourceTitle','')}
 for field in ('editor','review_date','review_notes'):value[field]=keep.get(field,'')
 for field in ('source_checked','amounts_verified','steps_cooked_and_tested','food_safety_reviewed','allergens_verified','rights_and_photos_cleared','publish_approved'):
  value[field]=keep.get(field,'NO')
 rows.append(value)
with out.open('w',encoding='utf-8-sig',newline='') as output:
 writer=csv.DictWriter(output,fieldnames=headers);writer.writeheader();writer.writerows(rows)
assert len(rows)==len(catalog['recipes'])
print(f'Created/updated {out}: {len(rows)} review rows; changed recipes have reviews reset')
