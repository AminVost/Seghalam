"""SQLite DDL regression check (not a replacement for Android JSI runtime tests)."""
from pathlib import Path
import re
import sqlite3

source = (Path(__file__).resolve().parents[1] / 'src/storage/db.ts').read_text(encoding='utf-8')
statements = re.findall(r"tx\.execute\('((?:CREATE TABLE|CREATE INDEX)[^']*)'\)", source)
backtick_statements = re.findall(r'tx\.execute\(`((?:CREATE TABLE|CREATE INDEX).*?)`\)', source, re.DOTALL)
statements += backtick_statements
triggers = re.findall(r'tx\.execute\(`(CREATE TRIGGER .*?)`\)', source, re.DOTALL)
assert len(statements) >= 8, f'Expected DDL declarations, only got {len(statements)}'
assert len(triggers) == 2, f'Expected 2 validity triggers, got {len(triggers)}'

with sqlite3.connect(':memory:') as connection:
    connection.execute('PRAGMA foreign_keys = ON')
    connection.execute('CREATE TABLE schema_meta (id INTEGER PRIMARY KEY CHECK(id=1), version INTEGER NOT NULL)')
    for statement in statements + triggers:
        connection.execute(statement)
    names = {row[0] for row in connection.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    assert {'pantry','shopping','meal','history','favorite','cooking_session','user_setting',
            'catalog_ingredient','catalog_recipe','catalog_recipe_category',
            'catalog_recipe_ingredient','catalog_meta','catalog_ingredient_alias','catalog_recipe_search'} <= names
    connection.execute("INSERT INTO pantry(id,ingredient_id,amount,unit,created_at) VALUES('p','egg',2,'pcs','2026-10-20')")
    connection.execute("INSERT INTO shopping(id,ingredient_id,amount,unit,done) VALUES('s','egg',2,'pcs',0)")
    connection.execute("UPDATE pantry SET place='freezer' WHERE id='p'")
    assert connection.execute("SELECT place FROM pantry WHERE id='p'").fetchone()[0]=='freezer'


    def should_fail(sql):
        try:
            connection.execute(sql)
        except sqlite3.IntegrityError:
            return
        raise AssertionError(f'Invalid DB write unexpectedly succeeded: {sql}')

    should_fail("UPDATE pantry SET amount=-1 WHERE id='p'")
    should_fail("UPDATE pantry SET amount=NULL,unit='pcs' WHERE id='p'")
    should_fail("UPDATE shopping SET amount=-2 WHERE id='s'")
    should_fail("UPDATE shopping SET done=2 WHERE id='s'")
    should_fail("INSERT INTO shopping(id,ingredient_id,amount,unit,done) VALUES('b','egg',NULL,'pcs',0)")
    connection.execute("INSERT INTO catalog_ingredient(id,name_fa,payload) VALUES('egg','تخم‌مرغ','{}')")
    connection.execute("INSERT INTO catalog_recipe(id,title,payload,status) VALUES('r','املت','{}','draft')")
    connection.execute("INSERT INTO catalog_ingredient_alias(ingredient_id,alias,normalized_alias) VALUES('egg','تخم مرغ','تخم مرغ')")
    connection.execute("INSERT INTO catalog_recipe_search(recipe_id,normalized_title) VALUES('r','املت')")
    connection.execute("INSERT INTO catalog_recipe_ingredient(recipe_id,ingredient_id,amount,unit,essential) VALUES('r','egg',3,'pcs',1)")
    connection.execute("INSERT INTO catalog_recipe_category(recipe_id,category) VALUES('r','snack')")
    should_fail("INSERT INTO catalog_recipe_ingredient(recipe_id,ingredient_id,amount,unit,essential) VALUES('bad','egg',1,'pcs',1)")
    should_fail("INSERT INTO catalog_recipe_ingredient(recipe_id,ingredient_id,amount,unit,essential) VALUES('r','missing',1,'pcs',1)")
    should_fail("INSERT INTO catalog_recipe(id,title,payload,status) VALUES('bad','bad','{}','revieweeed')")
    should_fail("INSERT INTO catalog_recipe_ingredient(recipe_id,ingredient_id,amount,unit,essential) VALUES('r','egg',-1,'pcs',1)")
    # Catalog changes cannot touch personal inventory: retained within the same SQLite connection.
    connection.execute('DELETE FROM catalog_recipe')
    assert connection.execute("SELECT amount FROM pantry WHERE id='p'").fetchone()[0] == 2
    connection.execute("UPDATE pantry SET amount=0 WHERE id='p'")
    assert connection.execute("SELECT amount FROM pantry WHERE id='p'").fetchone()[0] == 0
print('SQLite DDL: table creation, triggers, CHECK constraints and integrity smoke PASS')
