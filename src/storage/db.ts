import {open} from '@op-engineering/op-sqlite';
import type {PantryItem, Quantity, StoragePlace} from '../domain/types';
import {consumeItems} from '../domain/inventory';
import {isValidIsoDay} from '../domain/dates';
import {BY_ID} from '../data/ingredients';
import {RECIPES} from '../data/recipes';
import {validateCatalog} from '../domain/validate';
import type {Recipe} from '../domain/types';
import {convert} from '../domain/units';
import {pageStaticCatalog,searchStaticCatalog} from '../domain/staticCatalog';

// Open lazily during bootstrap: a native SQLite failure can be shown by the UI
// instead of crashing the module during application import.
let databaseHandle:ReturnType<typeof open>|null=null;
const connection=():ReturnType<typeof open>=>{
  if(!databaseHandle)databaseHandle=open({name:'seghalam.sqlite'});
  return databaseHandle;
};
export type ShoppingItem={id:string;ingredientId:string;quantity:Quantity|null;done:boolean};
export type Meal={id:string;date:string;meal:string;recipeId:string};
export type CookingSession={recipeId:string;step:number;servings:number;endAt:number|null;remainingMs:number|null};
const id=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
const iso=()=>new Date().toISOString();
let catalogCache:Recipe[]|null=null;
let initialized=false;
let initPromise:Promise<void>|null=null;
const requireIngredient=(ingredientId:string)=>{if(!BY_ID.has(ingredientId))throw new Error('ماده غذایی نامعتبر');};
const requireQuantity=(quantity:Quantity|null)=>{
  if(quantity && (!Number.isFinite(quantity.amount)||quantity.amount<=0||!(['g','kg','ml','l','pcs'] as string[]).includes(quantity.unit)))throw new Error('مقدار یا واحد نامعتبر است');
};
const unpackPantry=(v:Record<string,unknown>):PantryItem=>({
  id:String(v.id),ingredientId:String(v.ingredient_id),
  quantity:v.amount==null?null:{amount:Number(v.amount),unit:String(v.unit) as Quantity['unit']},
  ...(v.expires_on?{expiresOn:String(v.expires_on)}:{}),
  ...(v.place?{place:String(v.place) as PantryItem['place']}:{}),
  createdAt:String(v.created_at)
});
/** One connection; async SQLite calls; no network, no implicit changes to food availability. */
export async function initializeDatabase():Promise<void>{
  if(initialized)return;
  if(initPromise)return initPromise;
  initPromise=initializeSchema();
  try{await initPromise;}finally{initPromise=null;}
}
async function initializeSchema():Promise<void>{
  let stage='opening database and enabling foreign keys';
  try {
  await connection().execute('PRAGMA foreign_keys = ON');
  await connection().execute('CREATE TABLE IF NOT EXISTS schema_meta (id INTEGER PRIMARY KEY CHECK(id=1), version INTEGER NOT NULL)');
  const info=await connection().execute('SELECT version FROM schema_meta WHERE id=1');
  const version=info.rows.length?Number(info.rows[0]?.version):0;
  if(version>6)throw new Error('نسخه دیتابیس جدیدتر از نسخه اپ است');
  stage='creating base tables (v1)';
  if(version<1){
    await connection().transaction(async tx=>{
      await tx.execute('CREATE TABLE IF NOT EXISTS pantry (id TEXT PRIMARY KEY, ingredient_id TEXT NOT NULL, amount REAL, unit TEXT, expires_on TEXT, place TEXT, created_at TEXT NOT NULL, CHECK(amount IS NULL OR amount>=0), CHECK((amount IS NULL AND unit IS NULL) OR (amount IS NOT NULL AND unit IS NOT NULL)))');
      await tx.execute('CREATE INDEX IF NOT EXISTS idx_pantry_ingredient ON pantry(ingredient_id)');
      await tx.execute('CREATE TABLE IF NOT EXISTS favorite (recipe_id TEXT PRIMARY KEY)');
      await tx.execute('CREATE TABLE IF NOT EXISTS shopping (id TEXT PRIMARY KEY, ingredient_id TEXT NOT NULL, amount REAL, unit TEXT, done INTEGER NOT NULL DEFAULT 0 CHECK(done IN (0,1)), CHECK(amount IS NULL OR amount>0), CHECK((amount IS NULL AND unit IS NULL) OR (amount IS NOT NULL AND unit IS NOT NULL)))');
      await tx.execute('CREATE TABLE IF NOT EXISTS meal (id TEXT PRIMARY KEY, day TEXT NOT NULL, meal TEXT NOT NULL, recipe_id TEXT NOT NULL)');
      await tx.execute('CREATE TABLE IF NOT EXISTS history (id TEXT PRIMARY KEY, recipe_id TEXT NOT NULL, finished_at TEXT NOT NULL, servings INTEGER NOT NULL)');
      await tx.execute('CREATE TABLE IF NOT EXISTS cooking_session (id INTEGER PRIMARY KEY CHECK(id=1), recipe_id TEXT NOT NULL, step INTEGER NOT NULL, end_at INTEGER, remaining_ms INTEGER)');
      await tx.execute('INSERT OR REPLACE INTO schema_meta(id,version) VALUES(1,1)');
    });
  }
  stage='creating settings table (v2)';
  if(version<2){
    await connection().transaction(async tx=>{
      await tx.execute('CREATE TABLE IF NOT EXISTS user_setting (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
      await tx.execute('INSERT OR REPLACE INTO schema_meta(id,version) VALUES(1,2)');
    });
  }
  stage='creating shopping validation (v3)';
  if(version<3){
    await connection().transaction(async tx=>{
      await tx.execute(`CREATE TRIGGER IF NOT EXISTS trg_shopping_valid_insert BEFORE INSERT ON shopping
        WHEN (NEW.amount IS NOT NULL AND (NEW.amount<=0 OR NEW.unit IS NULL)) OR
             (NEW.amount IS NULL AND NEW.unit IS NOT NULL) OR (NEW.done NOT IN (0,1))
        BEGIN SELECT RAISE(ABORT, 'Invalid shopping row'); END`);
      await tx.execute(`CREATE TRIGGER IF NOT EXISTS trg_shopping_valid_update BEFORE UPDATE ON shopping
        WHEN (NEW.amount IS NOT NULL AND (NEW.amount<=0 OR NEW.unit IS NULL)) OR
             (NEW.amount IS NULL AND NEW.unit IS NOT NULL) OR (NEW.done NOT IN (0,1))
        BEGIN SELECT RAISE(ABORT, 'Invalid shopping row'); END`);
      await tx.execute('INSERT OR REPLACE INTO schema_meta(id,version) VALUES(1,3)');
    });
  }
  stage='creating catalog tables (v4)';
  if(version<4){
    await connection().transaction(async tx=>{
      await tx.execute('CREATE TABLE IF NOT EXISTS catalog_ingredient (id TEXT PRIMARY KEY, name_fa TEXT NOT NULL, payload TEXT NOT NULL)');
      await tx.execute(`CREATE TABLE IF NOT EXISTS catalog_recipe (id TEXT PRIMARY KEY, title TEXT NOT NULL, payload TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('draft','reviewed')), source_url TEXT)`);
      await tx.execute('CREATE TABLE IF NOT EXISTS catalog_recipe_category (recipe_id TEXT NOT NULL REFERENCES catalog_recipe(id) ON DELETE CASCADE, category TEXT NOT NULL, PRIMARY KEY(recipe_id,category))');
      await tx.execute('CREATE TABLE IF NOT EXISTS catalog_recipe_ingredient (recipe_id TEXT NOT NULL REFERENCES catalog_recipe(id) ON DELETE CASCADE, ingredient_id TEXT NOT NULL REFERENCES catalog_ingredient(id), amount REAL NOT NULL CHECK(amount>0), unit TEXT NOT NULL, essential INTEGER NOT NULL CHECK(essential IN (0,1)), PRIMARY KEY(recipe_id,ingredient_id))');
      await tx.execute('CREATE TABLE IF NOT EXISTS catalog_meta (id INTEGER PRIMARY KEY CHECK(id=1),revision INTEGER NOT NULL, recipe_count INTEGER NOT NULL)');
      await tx.execute('CREATE INDEX IF NOT EXISTS idx_catalog_category ON catalog_recipe_category(category,recipe_id)');
      await tx.execute('CREATE INDEX IF NOT EXISTS idx_catalog_required ON catalog_recipe_ingredient(ingredient_id,recipe_id)');
      await tx.execute('INSERT OR REPLACE INTO schema_meta(id,version) VALUES(1,4)');
    });
  }
  stage='creating catalog search tables (v5)';
  if(version<5){
    await connection().transaction(async tx=>{
      await tx.execute('CREATE TABLE IF NOT EXISTS catalog_ingredient_alias (ingredient_id TEXT NOT NULL REFERENCES catalog_ingredient(id) ON DELETE CASCADE, alias TEXT NOT NULL, normalized_alias TEXT NOT NULL, PRIMARY KEY(ingredient_id,normalized_alias))');
      await tx.execute('CREATE INDEX IF NOT EXISTS idx_catalog_alias_norm ON catalog_ingredient_alias(normalized_alias)');
      await tx.execute('CREATE TABLE IF NOT EXISTS catalog_recipe_search (recipe_id TEXT PRIMARY KEY REFERENCES catalog_recipe(id) ON DELETE CASCADE, normalized_title TEXT NOT NULL)');
      await tx.execute('CREATE INDEX IF NOT EXISTS idx_catalog_search_title ON catalog_recipe_search(normalized_title)');
      await tx.execute('INSERT OR REPLACE INTO schema_meta(id,version) VALUES(1,5)');
    });
  }
  stage='migrating cooking sessions (v6)';
  if(version<6){
    await connection().transaction(async tx=>{
      // Pre-v6 sessions had no portion count; zero means use the source recipe default.
      await tx.execute('ALTER TABLE cooking_session ADD COLUMN servings INTEGER NOT NULL DEFAULT 0 CHECK(servings BETWEEN 0 AND 30)');
      await tx.execute('INSERT OR REPLACE INTO schema_meta(id,version) VALUES(1,6)');
    });
  }
  stage='creating recipe title index';
  await connection().execute('CREATE INDEX IF NOT EXISTS idx_catalog_title ON catalog_recipe(title)');
  // Recipes are immutable content in the JS bundle, not a database seed job.
  // Only user-owned tables (pantry, shopping, favorites, etc.) need SQLite.
  initialized=true;
  } catch(error) {
    const details=error instanceof Error?error.message:String(error);
    console.error('[Seghalam SQLite startup]',stage,error);
    throw new Error(`SQLite startup failed during ${stage}: ${details}`);
  }
}
/**
 * Offline catalog is bundled with the app. No seed transaction is required:
 * the previous 378-recipe import could fail during Android startup, and
 * OP-SQLite can mask the original SQLite error during automatic ROLLBACK.
 *
 * Never delete legacy catalog tables here: existing user databases may have
 * them, and this upgrade must preserve pantry, favorites, history and meals.
 */
export async function getCatalog():Promise<Recipe[]>{
  if(catalogCache)return catalogCache;
  const errors=validateCatalog(RECIPES);
  if(errors.length)throw new Error(`فهرست غذاها معتبر نیست: ${errors[0]}`);
  catalogCache=RECIPES;
  return catalogCache;
}
/** Paged access to immutable bundled content; no native SQL round trips. */
export async function getCatalogPage(limit=24,offset=0,category?:string):Promise<Recipe[]>{
  return pageStaticCatalog(await getCatalog(),limit,offset,category);
}
/** Search Persian-normalized titles directly in the offline content. */
export async function searchCatalog(query:string,limit=24):Promise<Recipe[]>{
  return searchStaticCatalog(await getCatalog(),query,limit);
}
/** @deprecated Keep the old export for compatibility with other call sites. */
export const searchCatalogInDb=searchCatalog;
export async function getPantry():Promise<PantryItem[]>{
  const r=await connection().execute('SELECT * FROM pantry ORDER BY created_at DESC');
  return r.rows.map(v=>unpackPantry(v));
}
export async function addPantry(ingredientId:string,quantity:Quantity|null,expiresOn?:string,place:StoragePlace='fridge'):Promise<void>{
  requireIngredient(ingredientId);requireQuantity(quantity);
  if(!['fridge','freezer','cabinet'].includes(place))throw new Error('محل نگهداری نامعتبر است');
  if(expiresOn&&!isValidIsoDay(expiresOn))throw new Error('تاریخ انقضا نامعتبر است');
  await connection().execute('INSERT INTO pantry (id, ingredient_id, amount, unit, expires_on, place, created_at) VALUES (?,?,?,?,?,?,?)',
    [id(),ingredientId,quantity?.amount??null,quantity?.unit??null,expiresOn??null,place,iso()]);
}
/** Add several chosen ingredients as explicitly unknown quantities in one atomic write.
 * Never overwrite existing pantry rows or turn an unknown amount into a claim
 * that a recipe is ready to cook.
 */
export async function addPantryBulk(ingredientIds:readonly string[],place:StoragePlace='fridge'):Promise<number>{
  const ids=[...new Set(ingredientIds)];
  if(ids.length===0||ids.length>50)throw new Error('بین ۱ تا ۵۰ ماده غذایی انتخاب کن');
  if(!['fridge','freezer','cabinet'].includes(place))throw new Error('محل نگهداری نامعتبر است');
  ids.forEach(requireIngredient);
  let added=0;
  await connection().transaction(async tx=>{
    for(const ingredientId of ids){
      const exists=await tx.execute('SELECT id FROM pantry WHERE ingredient_id=? LIMIT 1',[ingredientId]);
      if(exists.rows.length)continue;
      await tx.execute('INSERT INTO pantry (id,ingredient_id,amount,unit,expires_on,place,created_at) VALUES (?,?,NULL,NULL,NULL,?,?)',
        [id(),ingredientId,place,iso()]);
      added++;
    }
  });
  return added;
}
export async function editPantry(itemId:string,quantity:Quantity|null,expiresOn?:string,place:StoragePlace='fridge'):Promise<void>{
  requireQuantity(quantity);
  if(!['fridge','freezer','cabinet'].includes(place))throw new Error('محل نگهداری نامعتبر است');
  if(expiresOn&&!isValidIsoDay(expiresOn))throw new Error('تاریخ انقضا نامعتبر است');
  const out=await connection().execute('UPDATE pantry SET amount=?,unit=?,expires_on=?,place=? WHERE id=?',
    [quantity?.amount??null,quantity?.unit??null,expiresOn??null,place,itemId]);
  if(out.rowsAffected!==1)throw new Error('قلم انتخاب‌شده دیگر وجود ندارد');
}

export async function removePantry(itemId:string):Promise<void>{await connection().execute('DELETE FROM pantry WHERE id=?',[itemId]);}
export async function getFavorites():Promise<string[]>{const r=await connection().execute('SELECT recipe_id FROM favorite');return r.rows.map(v=>String(v.recipe_id));}
export async function toggleFavorite(recipeId:string,enabled:boolean):Promise<void>{
  await connection().execute(enabled?'INSERT OR IGNORE INTO favorite(recipe_id) VALUES(?)':'DELETE FROM favorite WHERE recipe_id=?',[recipeId]);
}
export async function getShopping():Promise<ShoppingItem[]>{
  const r=await connection().execute('SELECT * FROM shopping ORDER BY done ASC, rowid DESC');
  return r.rows.map(x=>({id:String(x.id),ingredientId:String(x.ingredient_id),done:Boolean(x.done),
    quantity:x.amount==null?null:{amount:Number(x.amount),unit:String(x.unit) as Quantity['unit']}}));
}
export async function addShopping(ingredientId:string,quantity:Quantity|null):Promise<void>{
  requireIngredient(ingredientId);requireQuantity(quantity);
  await connection().transaction(async tx=>{
    if(quantity){
      const found=await tx.execute('SELECT * FROM shopping WHERE ingredient_id=? AND done=0 AND amount IS NOT NULL',[ingredientId]);
      for(const candidate of found.rows){
        const target=String(candidate.unit) as Quantity['unit'];
        const converted=convert(quantity,target,BY_ID.get(ingredientId));
        if(converted!==null){
          await tx.execute('UPDATE shopping SET amount=amount+? WHERE id=?',[converted,String(candidate.id)]);
          return;
        }
      }
    }
    await tx.execute('INSERT INTO shopping(id,ingredient_id,amount,unit,done) VALUES(?,?,?,?,0)',
      [id(),ingredientId,quantity?.amount??null,quantity?.unit??null]);
  });
}
/** Add multiple shopping ingredients without silently assigning quantities. */
export async function addShoppingBulk(ingredientIds:readonly string[]):Promise<number>{
  const ids=[...new Set(ingredientIds)];
  if(ids.length===0||ids.length>50)throw new Error('بین ۱ تا ۵۰ ماده غذایی انتخاب کن');
  ids.forEach(requireIngredient);
  let added=0;
  await connection().transaction(async tx=>{
    for(const ingredientId of ids){
      const exists=await tx.execute('SELECT id FROM shopping WHERE ingredient_id=? AND done=0 LIMIT 1',[ingredientId]);
      if(exists.rows.length)continue;
      await tx.execute('INSERT INTO shopping(id,ingredient_id,amount,unit,done) VALUES(?,?,NULL,NULL,0)',[id(),ingredientId]);
      added++;
    }
  });
  return added;
}
export async function editShopping(itemId:string,quantity:Quantity|null):Promise<void>{
  requireQuantity(quantity);
  const result=await connection().execute('UPDATE shopping SET amount=?,unit=? WHERE id=?',
    [quantity?.amount??null,quantity?.unit??null,itemId]);
  if(result.rowsAffected!==1)throw new Error('قلم موردنظر پیدا نشد');
}
/** Moving shopping -> pantry is atomic; items are not silently consumed or doubled. */
export async function purchaseShopping(row:ShoppingItem):Promise<void>{
  await connection().transaction(async tx=>{
    // Read and delete under the same transaction; ignore stale client item values.
    const current=await tx.execute('SELECT * FROM shopping WHERE id=?',[row.id]);
    if(current.rows.length!==1)throw new Error('این قلم قبلاً منتقل یا حذف شده است');
    const actual=current.rows[0]!;
    const ingredientId=String(actual.ingredient_id);
    requireIngredient(ingredientId);
    const quantity=actual.amount==null?null:{amount:Number(actual.amount),unit:String(actual.unit) as Quantity['unit']};
    requireQuantity(quantity);
    const deleted=await tx.execute('DELETE FROM shopping WHERE id=?',[row.id]);
    if(deleted.rowsAffected!==1)throw new Error('انتقال این قلم ناموفق بود');
    await tx.execute('INSERT INTO pantry(id,ingredient_id,amount,unit,created_at) VALUES(?,?,?,?,?)',
      [id(),ingredientId,quantity?.amount??null,quantity?.unit??null,iso()]);
  });
}
export async function updateShoppingDone(itemId:string,done:boolean):Promise<void>{
  await connection().execute('UPDATE shopping SET done=? WHERE id=?',[done?1:0,itemId]);
}
export async function removeShopping(itemId:string):Promise<void>{await connection().execute('DELETE FROM shopping WHERE id=?',[itemId]);}
export async function getMeals():Promise<Meal[]>{const r=await connection().execute('SELECT * FROM meal ORDER BY day');return r.rows.map(v=>({id:String(v.id),date:String(v.day),meal:String(v.meal),recipeId:String(v.recipe_id)}));}
export async function addMeal(day:string,meal:string,recipeId:string):Promise<void>{
  if(!isValidIsoDay(day)||!['صبحانه','ناهار','شام','میان‌وعده'].includes(meal))throw new Error('تاریخ یا وعده نامعتبر است');
  if(!RECIPES.some(item=>item.id===recipeId))throw new Error('غذای انتخابی در فهرست آفلاین پیدا نشد');
  await connection().execute('INSERT INTO meal(id,day,meal,recipe_id) VALUES(?,?,?,?)',[id(),day,meal,recipeId]);
}
export async function removeMeal(idValue:string):Promise<void>{await connection().execute('DELETE FROM meal WHERE id=?',[idValue]);}
export async function saveSession(value:CookingSession|null):Promise<void>{
  if(!value){await connection().execute('DELETE FROM cooking_session WHERE id=1');return;}
  if(!Number.isSafeInteger(value.step)||value.step<0||!Number.isSafeInteger(value.servings)||value.servings<1||value.servings>30)
    throw new Error('اطلاعات جلسه آشپزی نامعتبر است');
  await connection().execute('INSERT OR REPLACE INTO cooking_session(id,recipe_id,step,end_at,remaining_ms,servings) VALUES(1,?,?,?,?,?)',
    [value.recipeId,value.step,value.endAt,value.remainingMs,value.servings]);
}
export async function getSession():Promise<CookingSession|null>{
  const r=await connection().execute('SELECT * FROM cooking_session WHERE id=1');
  if(!r.rows.length)return null;
  const x=r.rows[0]!;
  return {recipeId:String(x.recipe_id),step:Number(x.step),servings:Number(x.servings),endAt:x.end_at===null?null:Number(x.end_at),remainingMs:x.remaining_ms===null?null:Number(x.remaining_ms)};
}
/** Explicit completion, atomic consumption + history, no partially written inventory. */
export async function finishCooking(recipeId:string,servings:number,items:readonly {ingredientId:string;quantity:Quantity}[]):Promise<void>{
  if(!Number.isSafeInteger(servings)||servings<1||servings>30)throw new Error('تعداد نفرات نامعتبر است');
  await connection().transaction(async tx=>{
    const existing=await tx.execute('SELECT * FROM pantry ORDER BY created_at ASC');
    const before=existing.rows.map(v=>unpackPantry(v));
    // Validate and calculate against the SAME transaction snapshot being mutated.
    const after=consumeItems(before,items);
    for(const item of after){
      if(item.quantity){
        const original=before.find(v=>v.id===item.id);
        if(!original?.quantity)throw new Error('موجودی ماده هنگام ثبت پخت پیدا نشد');
        if(original.quantity.amount!==item.quantity.amount){
          const update=await tx.execute('UPDATE pantry SET amount=? WHERE id=? AND amount=?',
            [item.quantity.amount,item.id,original.quantity.amount]);
          if(update.rowsAffected!==1)throw new Error('موجودی هم‌زمان تغییر کرده است');
        }
      }
    }
    await tx.execute('INSERT INTO history(id,recipe_id,finished_at,servings) VALUES(?,?,?,?)',[id(),recipeId,iso(),servings]);
    await tx.execute('DELETE FROM cooking_session WHERE id=1 AND recipe_id=?',[recipeId]);
  });
}
export async function finishWithoutConsuming(recipeId:string,servings:number):Promise<void>{
  if(!Number.isSafeInteger(servings)||servings<1||servings>30)throw new Error('تعداد نفرات نامعتبر است');
  await connection().transaction(async tx=>{
    await tx.execute('INSERT INTO history(id,recipe_id,finished_at,servings) VALUES(?,?,?,?)',[id(),recipeId,iso(),servings]);
    await tx.execute('DELETE FROM cooking_session WHERE id=1 AND recipe_id=?',[recipeId]);
  });
}
export async function getHistory():Promise<{recipeId:string;finishedAt:string}[]>{
  const r=await connection().execute('SELECT recipe_id, finished_at FROM history ORDER BY finished_at DESC LIMIT 40');
  return r.rows.map(x=>({recipeId:String(x.recipe_id),finishedAt:String(x.finished_at)}));
}

export async function getAllergenPreferences():Promise<string[]>{
  const r=await connection().execute('SELECT value FROM user_setting WHERE key=?',['excluded_allergens']);
  if(!r.rows.length)return [];
  try{const v:unknown=JSON.parse(String(r.rows[0]?.value));return Array.isArray(v)?v.filter((x):x is string=>typeof x==='string'):[];}catch{return [];}
}
export async function saveAllergenPreferences(allergens:readonly string[]):Promise<void>{
  await connection().execute('INSERT OR REPLACE INTO user_setting(key,value) VALUES(?,?)',['excluded_allergens',JSON.stringify(allergens)]);
}

export async function getOnboardingCompleted():Promise<boolean>{
  const r=await connection().execute('SELECT value FROM user_setting WHERE key=?',['onboarding_completed']);
  return r.rows.length>0&&String(r.rows[0]?.value)==='1';
}
export async function finishOnboarding():Promise<void>{
  await connection().execute('INSERT OR REPLACE INTO user_setting(key,value) VALUES(?,?)',['onboarding_completed','1']);
}

export type UiThemeMode='system'|'light'|'dark';
export async function getThemePreference():Promise<UiThemeMode>{
  const r=await connection().execute('SELECT value FROM user_setting WHERE key=?',['ui_theme']);
  const value=r.rows.length?String(r.rows[0]?.value):'system';
  return value==='light'||value==='dark'?value:'system';
}
export async function saveThemePreference(mode:UiThemeMode):Promise<void>{
  if(!['system','light','dark'].includes(mode))throw new Error('تم نامعتبر است');
  await connection().execute('INSERT OR REPLACE INTO user_setting(key,value) VALUES(?,?)',['ui_theme',mode]);
}
