const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');

const source=fs.readFileSync(path.join(__dirname,'../src/storage/db.ts'),'utf8');
const javascript=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;

function loadNativeStorage(version){
  const calls=[];
  const execute=async(sql,params=[])=>{
    calls.push({sql,params});
    if(/SELECT version FROM schema_meta/.test(sql))return {rows:version?[{version}]:[],rowsAffected:0};
    return {rows:[],rowsAffected:1};
  };
  const native={execute,transaction:async(fn)=>fn({execute})};
  const stubRequire=(name)=>{
    if(name==='@op-engineering/op-sqlite')return {open:()=>native};
    if(name.startsWith('../'))return require(path.join(__dirname,'../.domain-build/',name.slice(3)));
    throw new Error('Unexpected dependency: '+name);
  };
  const mod={exports:{}};
  new Function('require','module','exports',javascript)(stubRequire,mod,mod.exports);
  return {storage:mod.exports,calls};
}

test('fresh Android SQLite bootstrap creates user schema but never imports recipe rows',async()=>{
  const {storage,calls}=loadNativeStorage(0);
  await storage.initializeDatabase();
  const recipes=await storage.getCatalog();
  assert.equal(recipes.length,378);
  assert.ok(calls.some(({sql})=>sql.includes('CREATE TABLE IF NOT EXISTS pantry')));
  assert.ok(calls.some(({sql})=>sql.includes('CREATE TABLE IF NOT EXISTS favorite')));
  assert.ok(!calls.some(({sql})=>/^\s*INSERT\s+INTO\s+catalog_/i.test(sql)));
  const page=await storage.getCatalogPage(24,0);
  assert.equal(page.length,24);
  assert.equal((await storage.searchCatalog('گوجه')).length>0,true);
  await storage.addMeal('2026-10-22','شام',recipes[0].id);
  assert.ok(calls.some(({sql})=>sql.includes('INSERT INTO meal')));
  assert.ok(!calls.some(({sql})=>sql.includes('SELECT id FROM catalog_recipe')));
});

test('existing v6 user database skips migrations and still reads the bundled catalog',async()=>{
  const {storage,calls}=loadNativeStorage(6);
  await storage.initializeDatabase();
  assert.equal((await storage.getCatalog()).length,378);
  assert.ok(!calls.some(({sql})=>/\bDELETE\s+FROM\s+(?:pantry|shopping|favorite|meal|history|cooking_session)/i.test(sql)));
  assert.ok(!calls.some(({sql})=>/^\s*INSERT\s+INTO\s+catalog_/i.test(sql)));
  await assert.rejects(storage.addMeal('2026-10-22','شام','nonexistent-recipe'));
});
