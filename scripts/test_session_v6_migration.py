#!/usr/bin/env python3
"""Host SQLite migration regression; exercises actual ALTER DDL found in db.ts.
Not a substitute for OP-SQLite device tests.
"""
from pathlib import Path
import sqlite3,re
text=(Path(__file__).resolve().parents[1]/'src/storage/db.ts').read_text(encoding='utf-8')
match=re.search(r"tx\.execute\('(?P<ddl>ALTER TABLE cooking_session ADD COLUMN servings[^']*)'\)",text)
assert match,'v6 session migration was removed'
with sqlite3.connect(':memory:') as conn:
 conn.execute('CREATE TABLE cooking_session (id INTEGER PRIMARY KEY CHECK(id=1),recipe_id TEXT NOT NULL,step INTEGER NOT NULL,end_at INTEGER,remaining_ms INTEGER)')
 conn.execute('CREATE TABLE pantry (id TEXT PRIMARY KEY,amount REAL)')
 conn.execute("INSERT INTO pantry VALUES('p1',4)")
 conn.execute("INSERT INTO cooking_session VALUES(1,'recipe-1',3,1700000000000,NULL)")
 with conn:
  conn.execute(match.group('ddl'))
  conn.execute('UPDATE cooking_session SET servings=4 WHERE id=1')
 assert conn.execute('SELECT step,servings,end_at FROM cooking_session WHERE id=1').fetchone()==(3,4,1700000000000)
 assert conn.execute('SELECT amount FROM pantry WHERE id="p1"').fetchone()[0]==4
 try:conn.execute('UPDATE cooking_session SET servings=31 WHERE id=1')
 except sqlite3.IntegrityError:pass
 else:raise AssertionError('Invalid 31 servings accepted')
 print('SQLite v5→v6 migration PASS: session portions persisted; invalid counts rejected; pantry retained')
