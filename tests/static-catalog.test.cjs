const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {RECIPES} = require('../.domain-build/data/recipes');
const {pageStaticCatalog,searchStaticCatalog} = require('../.domain-build/domain/staticCatalog');

test('all 378 bundled recipes load without SQLite content rows', () => {
  assert.equal(RECIPES.length, 378);
  assert.equal(new Set(RECIPES.map(r=>r.id)).size, RECIPES.length);
  const seen = new Set();
  for(let start=0;start<RECIPES.length;start+=24){
    const page=pageStaticCatalog(RECIPES,24,start);
    for(const recipe of page)seen.add(recipe.id);
  }
  assert.equal(seen.size,378);
});

test('paging is bounded, deterministic, and does not modify bundled recipes', () => {
  const originalIds=RECIPES.map(recipe=>recipe.id);
  const first=pageStaticCatalog(RECIPES,24,0);
  const second=pageStaticCatalog(RECIPES,24,24);
  assert.equal(first.length,24);
  assert.equal(second.length,24);
  assert.equal(new Set([...first,...second].map(r=>r.id)).size,48);
  assert.deepEqual(pageStaticCatalog(RECIPES,24,0).map(r=>r.id),first.map(r=>r.id));
  assert.deepEqual(RECIPES.map(recipe=>recipe.id),originalIds);
});

test('category filter only returns matching recipe categories', () => {
  const filtered=pageStaticCatalog(RECIPES,100,0,'snack');
  assert.ok(filtered.length>0);
  assert.ok(filtered.every(r=>r.categories.includes('snack')));
});

test('Persian search handles Arabic characters and zero-width joiners', () => {
  const sample=RECIPES.find(r=>r.title.includes('گوجه'));
  assert.ok(sample);
  const query=sample.title.replaceAll('ی','ي').replaceAll('ک','ك').replaceAll('\u200c',' ');
  const matches=searchStaticCatalog(RECIPES,query,100);
  assert.ok(matches.some(r=>r.id===sample.id));
});

test('wildcard characters are literal search text, never executable SQL', () => {
  assert.deepEqual(searchStaticCatalog(RECIPES,'%%%%',24),[]);
  assert.deepEqual(searchStaticCatalog(RECIPES,'_____ ',24),[]);
});

test('invalid paging and result limits are rejected', () => {
  for(const value of [0,-1,101,Infinity,NaN,1.5]){
    assert.throws(()=>pageStaticCatalog(RECIPES,value,0));
    assert.throws(()=>searchStaticCatalog(RECIPES,'برنج',value));
  }
  assert.throws(()=>pageStaticCatalog(RECIPES,24,-1));
});

test('Android startup never seeds static recipe data into SQLite', () => {
  const source=fs.readFileSync(path.join(__dirname,'../src/storage/db.ts'),'utf8');
  assert.doesNotMatch(source,/\bsyncCatalog\s*\(/);
  assert.doesNotMatch(source,/INSERT\s+INTO\s+catalog_recipe(?:_|\b)/i);
  assert.match(source,/catalogCache\s*=\s*RECIPES/);
  assert.match(source,/RECIPES\.some\(item=>item\.id===recipeId\)/);
  assert.match(source,/function initializeSchema\(/);
});
