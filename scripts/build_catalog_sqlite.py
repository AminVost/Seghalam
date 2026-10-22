"""Build an inspectable content SQLite artifact from the exact offline TypeScript export.

The mobile app imports the identical catalog into its own separate per-user SQLite
connection at versioned bootstrap. This generated file is an audit fixture and
cannot replace native SQLite integration testing.
"""
import json
import sqlite3
import re
import unicodedata
from pathlib import Path
root=Path(__file__).resolve().parents[1]
content=json.loads((root/'content/catalog.generated.json').read_text(encoding='utf-8'))
out=root/'content/seghalam-catalog.sqlite'
def norm(value):
 s=unicodedata.normalize('NFKC',value).translate(str.maketrans('يىكأإة','ییکااه'))
 s=''.join(str('۰۱۲۳۴۵۶۷۸۹'.index(c)) if c in '۰۱۲۳۴۵۶۷۸۹' else str('٠١٢٣٤٥٦٧٨٩'.index(c)) if c in '٠١٢٣٤٥٦٧٨٩' else c for c in s)
 s=re.sub(r'[\u064B-\u065F\u0670\u0640]','',s).replace('\u200c',' ').replace('\u200d',' ')
 s=re.sub(r'[^\w\s]', ' ',s)
 return ' '.join(s.lower().split())

if out.exists():out.unlink()
db=sqlite3.connect(out)
with db:
 db.execute('PRAGMA foreign_keys = ON')
 db.executescript('''
 CREATE TABLE ingredient(id TEXT PRIMARY KEY, name_fa TEXT NOT NULL, data TEXT NOT NULL);
 CREATE TABLE recipe(id TEXT PRIMARY KEY,title TEXT NOT NULL,data TEXT NOT NULL,status TEXT NOT NULL,source_url TEXT);
 CREATE TABLE ingredient_alias(ingredient_id TEXT NOT NULL REFERENCES ingredient(id) ON DELETE CASCADE,alias TEXT NOT NULL,normalized_alias TEXT NOT NULL,PRIMARY KEY(ingredient_id,normalized_alias));
 CREATE INDEX idx_alias_normalized ON ingredient_alias(normalized_alias);
 CREATE TABLE recipe_search(recipe_id TEXT PRIMARY KEY REFERENCES recipe(id) ON DELETE CASCADE,normalized_title TEXT NOT NULL);
 CREATE INDEX idx_search_normalized ON recipe_search(normalized_title);
 CREATE INDEX idx_recipe_title ON recipe(title);
 CREATE TABLE recipe_category(recipe_id TEXT NOT NULL REFERENCES recipe(id),category TEXT NOT NULL,PRIMARY KEY(recipe_id,category));
 CREATE TABLE recipe_ingredient(recipe_id TEXT NOT NULL REFERENCES recipe(id),ingredient_id TEXT NOT NULL REFERENCES ingredient(id),amount REAL NOT NULL CHECK(amount>0),unit TEXT NOT NULL,required INTEGER NOT NULL CHECK(required IN(0,1)),PRIMARY KEY(recipe_id,ingredient_id));
 CREATE TABLE metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL);
 CREATE INDEX idx_recipe_category ON recipe_category(category);
 CREATE INDEX idx_recipe_ingredient ON recipe_ingredient(ingredient_id);
 ''')
 db.executemany('INSERT INTO ingredient VALUES(?,?,?)',[(i['id'],i['fa'],json.dumps(i,ensure_ascii=False)) for i in content['ingredients']])
 db.executemany('INSERT INTO ingredient_alias VALUES(?,?,?)',[(i['id'],a,a) for i in content['ingredients'] for a in sorted({norm(x) for x in [i['fa'],*i['aliases']]}) if a])
 for r in content['recipes']:
  db.execute('INSERT INTO recipe VALUES(?,?,?,?,?)',(r['id'],r['title'],json.dumps(r,ensure_ascii=False),r['contentStatus'],r['provenance'].get('url')))
  db.execute('INSERT INTO recipe_search VALUES(?,?)',(r['id'],norm(r['title'])))
  db.executemany('INSERT INTO recipe_category VALUES(?,?)',[(r['id'],c) for c in r['categories']])
  db.executemany('INSERT INTO recipe_ingredient VALUES(?,?,?,?,?)',[(r['id'],i['ingredientId'],i['quantity']['amount'],i['quantity']['unit'],int(i['essential'])) for i in r['ingredients']])
 db.executemany('INSERT INTO metadata VALUES(?,?)',[('revision',str(content['revision'])),('count',str(len(content['recipes'])))])
 assert db.execute('PRAGMA foreign_key_check').fetchall()==[]
 assert db.execute('SELECT COUNT(*) FROM recipe').fetchone()[0]==len(content['recipes'])
 assert db.execute('SELECT COUNT(*) FROM ingredient').fetchone()[0]==len(content['ingredients'])
 assert db.execute('SELECT COUNT(*) FROM recipe_search').fetchone()[0]==len(content['recipes'])
 assert db.execute('SELECT COUNT(*) FROM ingredient_alias').fetchone()[0]>=len(content['ingredients'])
 assert db.execute("SELECT COUNT(*) FROM recipe_search WHERE normalized_title LIKE '%قیمه%'").fetchone()[0]>0
 assert db.execute("SELECT COUNT(*) FROM ingredient_alias WHERE normalized_alias='سيب زميني'").fetchone()[0]==0
 assert db.execute("SELECT COUNT(*) FROM ingredient_alias WHERE normalized_alias='سیب زمینی'").fetchone()[0]>0
 assert db.execute('SELECT COUNT(*) FROM recipe_ingredient').fetchone()[0]==sum(len(r['ingredients']) for r in content['recipes'])
 assert db.execute('SELECT COUNT(*) FROM recipe WHERE status="reviewed"').fetchone()[0]==0
db.close()
print(f'Verified content fixture: {len(content["recipes"])} draft recipes and {len(content["ingredients"])} ingredients; {out.stat().st_size//1024} KiB')
