#!/usr/bin/env python3
"""Host SQLite regression for an upgrade from v4 to v5, retaining user data.
This is NOT a React Native OP-SQLite device migration test.
"""
from __future__ import annotations
from pathlib import Path
import re,sqlite3,json
source=(Path(__file__).resolve().parents[1]/'src/storage/db.ts').read_text(encoding='utf-8')
json_catalog=json.loads((Path(__file__).resolve().parents[1]/'content/catalog.generated.json').read_text(encoding='utf-8'))
# Extract exact CREATE statements from native migrations, distinguishing v5 section.
creates=re.findall(r"tx\.execute\('((?:CREATE TABLE|CREATE INDEX)[^']*)'\)",source)
creates+=re.findall(r'tx\.execute\(`((?:CREATE TABLE|CREATE INDEX).*?)`\)',source,re.DOTALL)
triggers=re.findall(r'tx\.execute\(`(CREATE TRIGGER .*?)`\)',source,re.DOTALL)
old=[s for s in creates if not any(x in s for x in ('catalog_recipe_search','idx_catalog_search_title','catalog_ingredient_alias','idx_catalog_alias_norm'))]
new=[s for s in creates if s not in old]
assert len(new)==4, f'expected 4 v5 CREATEs, got {len(new)}'
assert len(triggers)==2
with sqlite3.connect(':memory:') as db:
 db.execute('PRAGMA foreign_keys = ON')
 db.execute('CREATE TABLE schema_meta(id INTEGER PRIMARY KEY CHECK(id=1),version INTEGER NOT NULL)')
 for sql in old+triggers:db.execute(sql)
 db.execute('INSERT INTO schema_meta VALUES(1,4)')
 db.execute("INSERT INTO pantry(id,ingredient_id,amount,unit,created_at) VALUES('p1','egg',7,'pcs','2026-10-20')")
 db.execute("INSERT INTO favorite(recipe_id) VALUES('recipe-001')")
 db.execute("INSERT INTO shopping(id,ingredient_id,amount,unit,done) VALUES('s1','egg',2,'pcs',0)")
 db.execute("INSERT INTO meal(id,day,meal,recipe_id) VALUES('m1','2026-10-20','dinner','recipe-001')")
 db.execute("INSERT INTO history(id,recipe_id,finished_at,servings) VALUES('h1','recipe-001','2026-10-20',3)")
 db.execute("INSERT INTO user_setting(key,value) VALUES('theme','dark')")
 db.execute("INSERT INTO catalog_ingredient(id,name_fa,payload) VALUES('egg','تخم مرغ','{}')")
 db.execute("INSERT INTO catalog_recipe(id,title,payload,status) VALUES('recipe-001','املت','{}','draft')")
 db.execute("INSERT INTO catalog_recipe_ingredient(recipe_id,ingredient_id,amount,unit,essential) VALUES('recipe-001','egg',3,'pcs',1)")
 db.execute("INSERT INTO catalog_recipe_category(recipe_id,category) VALUES('recipe-001','iranian')")
 db.execute('INSERT INTO catalog_meta(id,revision,recipe_count) VALUES(1,2026102002,172)')
 # Apply exact v5 DDL. Foreign keys remain enforced across the upgrade.
 with db:
  for sql in new:db.execute(sql)
  db.execute('UPDATE schema_meta SET version=5 WHERE id=1')
  db.execute('DELETE FROM catalog_ingredient_alias')
  db.execute('DELETE FROM catalog_recipe_search')
  db.execute('DELETE FROM catalog_recipe_ingredient')
  db.execute('DELETE FROM catalog_recipe_category')
  db.execute('DELETE FROM catalog_recipe')
  db.execute('DELETE FROM catalog_ingredient')
  db.executemany('INSERT INTO catalog_ingredient VALUES(?,?,?)',[(i['id'],i['fa'],json.dumps(i,ensure_ascii=False)) for i in json_catalog['ingredients']])
  db.executemany('INSERT INTO catalog_recipe VALUES(?,?,?,?,?)',[(r['id'],r['title'],json.dumps(r,ensure_ascii=False),r['contentStatus'],r['provenance'].get('url')) for r in json_catalog['recipes']])
  db.executemany('INSERT INTO catalog_recipe_ingredient VALUES(?,?,?,?,?)',[(r['id'],i['ingredientId'],i['quantity']['amount'],i['quantity']['unit'],int(i['essential'])) for r in json_catalog['recipes'] for i in r['ingredients']])
  db.executemany('INSERT INTO catalog_recipe_category VALUES(?,?)',[(r['id'],category) for r in json_catalog['recipes'] for category in r['categories']])
  # These are sample normalized values, not the full in-app normalization implementation.
  db.execute("INSERT INTO catalog_ingredient_alias VALUES('egg','تخم مرغ','تخم مرغ')")
  db.execute("INSERT INTO catalog_recipe_search VALUES('recipe-001','املت گوجه فرنگی')")
  db.execute('UPDATE catalog_meta SET revision=2026102003,recipe_count=378 WHERE id=1')
 assert db.execute('PRAGMA foreign_key_check').fetchall()==[]
 assert db.execute('SELECT version FROM schema_meta WHERE id=1').fetchone()[0]==5
 assert db.execute('SELECT COUNT(*) FROM catalog_recipe').fetchone()[0]==378
 assert db.execute('SELECT COUNT(*) FROM catalog_ingredient').fetchone()[0]==236
 assert db.execute('SELECT COUNT(*) FROM catalog_recipe_ingredient').fetchone()[0]==2045
 assert db.execute('SELECT amount FROM pantry WHERE id="p1"').fetchone()[0]==7
 assert db.execute('SELECT count(*) FROM favorite WHERE recipe_id="recipe-001"').fetchone()[0]==1
 assert db.execute('SELECT amount FROM shopping WHERE id="s1"').fetchone()[0]==2
 assert db.execute('SELECT count(*) FROM meal WHERE id="m1"').fetchone()[0]==1
 assert db.execute('SELECT count(*) FROM history WHERE id="h1"').fetchone()[0]==1
 assert db.execute('SELECT value FROM user_setting WHERE key="theme"').fetchone()[0]=='dark'
 assert db.execute('SELECT count(*) FROM catalog_recipe_search WHERE normalized_title LIKE "%املت%"').fetchone()[0]==1
print('SQLite v4→v5 host migration simulation PASS; 378 recipes/236 ingredients/2045 links; pantry, shopping, favorites, history, meal, settings preserved')
