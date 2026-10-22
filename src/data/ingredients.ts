import type {Ingredient} from '../domain/types';
import {EXPANDED_INGREDIENTS} from './expandedIngredients';
import {RESEARCH_INGREDIENTS} from './researchIngredients';
const entries: Array<[string,string,string,string?,string?]> = [
 ['egg','تخم‌مرغ','تخم مرغ|تخممرغ|تخم‌مرغ|egg','تخم‌مرغ'],
 ['potato','سیب‌زمینی','سیب زمینی|سیب‌زمینی|سیبزمینی|potato'],
 ['onion','پیاز','پیاز|onion'],['tomato','گوجه‌فرنگی','گوجه|گوجه فرنگی|گوجه‌فرنگی|tomato'],
 ['tomato_paste','رب گوجه‌فرنگی','رب گوجه|رب گوجه فرنگی|tomato paste'],
 ['rice','برنج','برنج|rice'],['chicken','مرغ','گوشت مرغ|سینه مرغ|مرغ|chicken'],
 ['beef','گوشت قرمز','گوشت گوساله|گوشت قرمز|گوشت گوسفندی|beef'],
 ['ground_beef','گوشت چرخ‌کرده','گوشت چرخکرده|گوشت چرخ کرده|گوشت چرخ‌کرده'],
 ['bread','نان','نان|bread','گلوتن'],['flour','آرد گندم','آرد|آرد گندم|flour','گلوتن'],
 ['pasta','ماکارونی','پاستا|ماکارونی|pasta','گلوتن'],
 ['milk','شیر','شیر|milk','لبنیات'],['cheese','پنیر','پنیر|cheese','لبنیات'],
 ['yogurt','ماست','ماست|yogurt','لبنیات'],['butter','کره','کره|butter','لبنیات'],
 ['oil','روغن','روغن|روغن مایع|oil'],['olive_oil','روغن زیتون','روغن زیتون|olive oil'],
 ['salt','نمک','نمک|salt'],['pepper','فلفل سیاه','فلفل سیاه|black pepper'],
 ['turmeric','زردچوبه','زردچوبه|turmeric'],['garlic','سیر','سیر|garlic'],
 ['cucumber','خیار','خیار|cucumber'],['lettuce','کاهو','کاهو|lettuce'],
 ['carrot','هویج','هویج|carrot'],['bell_pepper','فلفل دلمه‌ای','فلفل دلمه ای|فلفل دلمه‌ای'],
 ['mushroom','قارچ','قارچ|mushroom'],['spinach','اسفناج','اسفناج|spinach'],
 ['lentil','عدس','عدس|lentil'],['chickpea','نخود','نخود|chickpea'],
 ['bean','لوبیا چیتی','لوبیا چیتی|لوبیا'],
 ['peas','نخودفرنگی','نخود فرنگی|نخودفرنگی'],
 ['corn','ذرت','ذرت|corn'],['lemon','لیموترش','لیمو ترش|لیموترش|lemon'],['lemon_juice','آبلیمو','آب لیمو|آبلیمو|lemon juice'],
 ['banana','موز','موز|banana'],['apple','سیب','سیب|apple'],
 ['oats','جو دوسر','جو دو سر|جو دوسر|اوتمیل'],
 ['walnut','گردو','گردو|walnut','مغزها'],['dates','خرما','خرما|dates'],
 ['tuna','کنسرو تن ماهی','تن ماهی|کنسرو تن ماهی|ماهی تن','ماهی'],
 ['sausages','سوسیس','سوسیس|sausage'],['baking_powder','بیکینگ‌پودر','بیکینگ پودر|بکینگ پودر'],
 ['sugar','شکر','شکر|sugar'],['water','آب','آب|water'],
 ['eggplant','بادمجان','بادمجان|بادمجون'],['zucchini','کدو سبز','کدو سبز|کدو'],
 ['parsley','جعفری','جعفری'],['dill','شوید','شوید'],['mint','نعنا','نعنا|نعناع'],
 ['cinnamon','دارچین','دارچین'],['honey','عسل','عسل'],['sesame','کنجد','کنجد','کنجد'],
 ['red_pepper','فلفل قرمز','فلفل قرمز|فلفل تند']
];
const labelDependent=new Set(['sausages','soy_sauce','tamari','pesto','hummus','barbecue_sauce','hot_sauce','chili_sauce','mayonnaise','chicken_stock','beef_broth','tomato_sauce','chicken_cooked','bacon','granola','jam','chocolate','baking_chocolate','flatbread','tortilla','corn_tortilla','rice_noodles','breadcrumbs','bread_lavash','pizza_dough']);
const compoundAllergens:Record<string,string[]>={soy_sauce:['سویا','گلوتن'],tamari:['سویا'],pesto:['مغزها','لبنیات'],mayonnaise:['تخم‌مرغ'],hummus:['کنجد'],chicken_stock:['ترکیب نامشخص'],beef_broth:['ترکیب نامشخص']};
export const INGREDIENTS: Ingredient[] = [...entries.map(([id,fa,aliases,allergens]) => ({
  id,fa,aliases:aliases.split('|'),group:'مواد غذایی',allergens:allergens ? [allergens] : [],
})), ...EXPANDED_INGREDIENTS,...RESEARCH_INGREDIENTS].map(i=>({
  ...i,allergens:Array.from(new Set([...(i.allergens??[]),...(compoundAllergens[i.id]??[])])),
  ...(labelDependent.has(i.id)?{compositionUnverified:true}:{})
}));
export const BY_ID: ReadonlyMap<string,Ingredient> = new Map(INGREDIENTS.map(i=>[i.id,i]));
