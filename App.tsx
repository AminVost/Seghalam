import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Alert,BackHandler,FlatList,Image,Keyboard,Pressable,ScrollView,Share,StatusBar,StyleSheet,TextInput,View} from 'react-native';
import {SafeAreaProvider,SafeAreaView} from 'react-native-safe-area-context';
import {RECIPES} from './src/data/recipes';
import {BY_ID,INGREDIENTS} from './src/data/ingredients';
import {normalizeFa} from './src/domain/normalize';
import {parseIntent} from './src/domain/language';
import {matchRecipe} from './src/domain/matcher';
import {recommend} from './src/domain/recommend';
import {quantityFa,scaleQuantity,parsePositiveAmount} from './src/domain/units';
import {defaultUnitFor} from './src/domain/ingredientUnits';
import {selectedRecipeStillVisible,effectiveCookingServings,clampedCookingStep} from './src/domain/flows';
import {isExpired,localIsoDay} from './src/domain/dates';
import {formatJalali,toIsoDate} from './src/domain/jalali';
import type {Category,PantryItem,Quantity,Recipe,Unit,StoragePlace} from './src/domain/types';
import * as db from './src/storage/db';
import {Btn,Loading,Panel,Txt} from './src/ui/atoms';
import type {Palette} from './src/ui/theme';
import {ThemeProvider,useTheme} from './src/ui/ThemeProvider';
import {CoachTour} from './src/ui/CoachTour';

type Tab='home'|'pantry'|'recipes'|'plan';
type Page='tabs'|'detail'|'cook'|'shopping'|'favorites'|'history'|'settings';
const categoryTitle:Record<Category,string>={iranian:'ایرانی و خانگی',light:'غذاهای سبک و سبزیجاتی',snack:'میان‌وعده',fastfood:'فست‌فود خانگی'};
const fmt=(v:number)=>new Intl.NumberFormat('fa-IR').format(v);
const today=()=>localIsoDay();
function SingleRecipe({recipe,onPress,favorite,status,subtitle}: {recipe:Recipe;onPress:()=>void;favorite?:boolean;status?:string;subtitle?:string}){
  const {palette:c}=useTheme();
  const s=useMemo(()=>createStyles(c),[c]);
  const total=recipe.prepMinutes+recipe.cookMinutes;
  const category=recipe.categories[0]??'iranian';
  const emoji:Record<Category,string>={iranian:'🍲',light:'🥗',snack:'🥣',fastfood:'🥙'};
  const tint:Record<Category,string>={iranian:'#F8E8D2',light:'#E6F0DD',snack:'#F9E8DE',fastfood:'#F5E8C8'};
  const uncertainty=!!status&&(/نامشخص|نیازمند|نامناسب|کم داری/.test(status));
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${recipe.title}، ${total} دقیقه${status?`، ${status}`:''}`}
    style={({pressed})=>[s.recipeCard,pressed&&{opacity:0.78,transform:[{scale:0.99}]}]}>
    <View style={[s.dishIcon,{backgroundColor:tint[category]}]}><Txt style={{fontSize:25,lineHeight:47,includeFontPadding:true,textAlign:'center'}}>{emoji[category]}</Txt></View>
    <View style={{flex:1,gap:5}}>
      <Txt weight style={{color:c.dark,fontSize:15}}>{recipe.title}{favorite?'  ♥':''}</Txt>
      <Txt muted style={{fontSize:12}}>{fmt(total)} دقیقه  •  {fmt(recipe.servings)} نفر  •  {categoryTitle[category]}</Txt>
      {subtitle?<Txt muted style={{fontSize:12}}>{subtitle}</Txt>:null}
      {status?<View style={[s.statusPill,{backgroundColor:uncertainty?'#FFF0E4':'#E4F0E6'}]}>
        <Txt style={{color:uncertainty?'#954A20':c.green,fontSize:11}}>{status}</Txt></View>:null}
    </View>
    <View style={s.cardArrow}><Txt weight style={{color:c.green}}>‹</Txt></View>
  </Pressable>;
}
export default function App(){return <SafeAreaProvider><ThemeProvider><AppBody/></ThemeProvider></SafeAreaProvider>;}
function AppBody(){
  const {palette:c,mode,isDark,setMode}=useTheme();
  const s=useMemo(()=>createStyles(c),[c]);
  const [tourVisible,setTourVisible]=useState(false);
  const [tourStep,setTourStep]=useState(0);
  const [bulkPantry,setBulkPantry]=useState(false),[bulkShopping,setBulkShopping]=useState(false);
  const [selectedPantryIds,setSelectedPantryIds]=useState<string[]>([]);
  const [selectedShoppingIds,setSelectedShoppingIds]=useState<string[]>([]);
  const [ready,setReady]=useState(false),[fatal,setFatal]=useState(''),[retryIndex,setRetryIndex]=useState(0);
  const [catalog,setCatalog]=useState<Recipe[]>([]);
  const [onboardingVisible,setOnboardingVisible]=useState(false);
  const [tab,setTab]=useState<Tab>('home'),[page,setPage]=useState<Page>('tabs');
  const [pantry,setPantry]=useState<PantryItem[]>([]),[shopping,setShopping]=useState<db.ShoppingItem[]>([]);
  const [favorites,setFavorites]=useState<string[]>([]),[meals,setMeals]=useState<db.Meal[]>([]);
  const [history,setHistory]=useState<{recipeId:string;finishedAt:string}[]>([]);
  const [session,setSession]=useState<db.CookingSession|null>(null);
  const [recipe,setRecipe]=useState<Recipe>(RECIPES[0]!);
  const [search,setSearch]=useState(''),[query,setQuery]=useState(''),[homeFilter,setHomeFilter]=useState<Category|''>(''),[recipeFilter,setRecipeFilter]=useState<Category|''>('');
  const [planSearch,setPlanSearch]=useState('');
  const [ingredientSearch,setIngredientSearch]=useState(''),[newIngredientId,setNewIngredientId]=useState('');
  const [amount,setAmount]=useState(''),[unit,setUnit]=useState<Unit>('pcs'),[busy,setBusy]=useState(false);
  const [expiresOn,setExpiresOn]=useState(''),[place,setPlace]=useState<StoragePlace>('fridge'),[editingPantryId,setEditingPantryId]=useState<string|null>(null);
  const [shoppingSearch,setShoppingSearch]=useState(''),[shoppingPick,setShoppingPick]=useState(''),[shoppingAmount,setShoppingAmount]=useState('');
  const [shoppingUnit,setShoppingUnit]=useState<Unit>('g'),[editingShoppingId,setEditingShoppingId]=useState<string|null>(null);
  const runningRef=useRef(false);
  const [servings,setServings]=useState(2),[cookStep,setCookStep]=useState(0),[timerNow,setTimerNow]=useState(Date.now());
  const [currentDay,setCurrentDay]=useState(today());
  const [planDay,setPlanDay]=useState(formatJalali(today())),[planSlot,setPlanSlot]=useState('شام');
  const [planRecipe,setPlanRecipe]=useState(RECIPES[0]!.id);
  const [excludedAllergens,setExcludedAllergens]=useState<string[]>([]);
  const refresh=async()=>{
    const [p,sh,f,m,h,se,diet]=await Promise.all([db.getPantry(),db.getShopping(),db.getFavorites(),db.getMeals(),db.getHistory(),db.getSession(),db.getAllergenPreferences()]);
    setPantry(p);setShopping(sh);setFavorites(f);setMeals(m);setHistory(h);setSession(se);setExcludedAllergens(diet);
  };
  useEffect(()=>{
    let alive=true;
    const boot=async()=>{
      let phase='Opening and migrating SQLite';
      try {
        setFatal('');
        await db.initializeDatabase();
        const savedTheme=await db.getThemePreference();
        if(alive)setMode(savedTheme);
        phase='Reading the offline recipe catalog';
        const localRecipes=await db.getCatalog();
        setCatalog(localRecipes);
        phase='Reading pantry, preferences, and saved items';
        await refresh();
        phase='Checking onboarding settings';
        const completed=await db.getOnboardingCompleted();
        if(alive){setOnboardingVisible(!completed);setReady(true);}
      }catch(e){
        const details=e instanceof Error?`${e.name}: ${e.message}`:String(e);
        const report=`Seghalam 0.2.0 startup failure\nPhase: ${phase}\n${details}`;
        console.error('[Seghalam startup]',report,e);
        if(alive)setFatal(report);
      }
    };
    void boot();
    return()=>{alive=false;};
  },[retryIndex]);
  useEffect(()=>{
    if(page!=='cook'||!session?.endAt)return;
    setTimerNow(Date.now());
    const ticker=setInterval(()=>setTimerNow(Date.now()),1000);
    return()=>clearInterval(ticker);
  },[page,session?.endAt]);
  useEffect(()=>{
    const id=setInterval(()=>setCurrentDay(today()),60000);
    return()=>clearInterval(id);
  },[]);
  useEffect(()=>{const listener=BackHandler.addEventListener('hardwareBackPress',()=>{
    if(page!=='tabs'){setPage(page==='cook'?'detail':'tabs');return true;}
    if(tab!=='home'){setTab('home');return true;}return false;
  });return()=>listener.remove();},[page,tab]);
  const run=async(fn:()=>Promise<void>)=>{
    if(runningRef.current)return;runningRef.current=true;setBusy(true);try{await fn();await refresh();}catch(e){Alert.alert('خطا',String(e instanceof Error?e.message:e));}finally{runningRef.current=false;setBusy(false);}
  };
  const saveTheme=(value:db.UiThemeMode)=>void run(async()=>{await db.saveThemePreference(value);setMode(value);});
  const openTour=()=>{setTourStep(0);setPage('tabs');setTab('home');setTourVisible(true);};
  const tour=()=> <CoachTour visible={tourVisible} step={tourStep} onStepChange={setTourStep} onClose={()=>setTourVisible(false)} onNavigate={target=>{setPage('tabs');setTab(target);}}/>;
  const intent=useMemo(()=>parseIntent(query),[query]);
  const effectivePantry=useMemo(()=>{
    const extra=intent.includedIds.filter(id=>!pantry.some(p=>p.ingredientId===id))
      .map(id=>({id:`query-${id}`,ingredientId:id,quantity:null,createdAt:''}));
    return [...pantry.filter(p=>!intent.excludedIds.includes(p.ingredientId)),...extra];
  },[pantry,intent]);
  const suggestions=useMemo(()=>recommend(catalog,effectivePantry,{
    maxMinutes:intent.maxTimeMinutes,categories:intent.categories.length?intent.categories:homeFilter?[homeFilter]:[],
    ...(intent.servings?{servings:intent.servings}:{}),diet:{excludedIngredientIds:intent.excludedIds,excludedAllergens}
  }),[catalog,effectivePantry,intent,homeFilter,excludedAllergens,currentDay]);
  const visibleSuggestions=useMemo(()=>{
    if(!pantry.length&&!query.trim())return [];
    return suggestions.filter(x=>x.status==='ready'||x.status==='substituted'||x.status==='uncertain').slice(0,12);
  },[pantry.length,query,suggestions]);
  const recipeList=useMemo(()=>catalog.filter(r=>(!recipeFilter||r.categories.includes(recipeFilter))&&
    (!search||normalizeFa(r.title).includes(normalizeFa(search)))),[catalog,recipeFilter,search]);
  const planCandidates=useMemo(()=>catalog.filter(r=>!planSearch||normalizeFa(r.title).includes(normalizeFa(planSearch))).slice(0,24),[catalog,planSearch]);
  const chosen=INGREDIENTS.filter(i=>!ingredientSearch||normalizeFa(i.fa).includes(normalizeFa(ingredientSearch))||i.aliases.some(a=>normalizeFa(a).includes(normalizeFa(ingredientSearch)))).slice(0,28);
  const shoppingChoices=INGREDIENTS.filter(i=>!shoppingSearch||normalizeFa(i.fa).includes(normalizeFa(shoppingSearch))||i.aliases.some(a=>normalizeFa(a).includes(normalizeFa(shoppingSearch)))).slice(0,20);
  const showRecipe=(r:Recipe)=>{setRecipe(r);setServings(r.servings);setPage('detail');Keyboard.dismiss();};
  const qs=(a:string):Quantity|null=>{
    const n=parsePositiveAmount(a);return n===null?null:{amount:n,unit};
  };
  const resetIngredientEditor=()=>{setAmount('');setExpiresOn('');setPlace('fridge');setNewIngredientId('');setIngredientSearch('');setEditingPantryId(null);};
  const addIngredient=()=>void run(async()=>{
    if(!newIngredientId)throw new Error('ابتدا یک ماده انتخاب کن');
    const day=expiresOn.trim()?toIsoDate(expiresOn):undefined;
    if(editingPantryId)await db.editPantry(editingPantryId,qs(amount),day,place);
    else await db.addPantry(newIngredientId,qs(amount),day,place);
    resetIngredientEditor();
  });
  const beginEditPantry=(item:PantryItem)=>{
    setTab('pantry');setPage('tabs');setEditingPantryId(item.id);setNewIngredientId(item.ingredientId);
    setIngredientSearch(BY_ID.get(item.ingredientId)?.fa??'');setAmount(item.quantity?String(item.quantity.amount):'');
    setUnit(item.quantity?.unit??defaultUnitFor(item.ingredientId));setExpiresOn(item.expiresOn?formatJalali(item.expiresOn):'');setPlace(item.place??'fridge');
  };

  const resetShoppingEditor=()=>{setShoppingPick('');setShoppingSearch('');setShoppingAmount('');setEditingShoppingId(null);};
  const saveShopping=()=>void run(async()=>{
    if(!shoppingPick)throw new Error('ابتدا ماده غذایی را انتخاب کن');
    const parsed=parsePositiveAmount(shoppingAmount);
    const q:Quantity|null=parsed===null?null:{amount:parsed,unit:shoppingUnit};
    if(editingShoppingId)await db.editShopping(editingShoppingId,q);
    else await db.addShopping(shoppingPick,q);
    resetShoppingEditor();
  });
  const openCooking=()=>{
    const check=matchRecipe(recipe,pantry,servings,{excludedIngredientIds:[],excludedAllergens});
    if(check.status==='incompatible'){Alert.alert('محدودیت غذایی','این دستور با یکی از محدودیت‌های ثبت‌شده سازگار نیست.');return;}
    if(session&&session.recipeId===recipe.id){setServings(effectiveCookingServings(session.servings,recipe.servings));setCookStep(clampedCookingStep(session.step,recipe.steps.length));setPage('cook');return;}
    const begin=()=>{setCookStep(0);void run(()=>db.saveSession({recipeId:recipe.id,step:0,servings,endAt:null,remainingMs:null}));setPage('cook');};
    if(session&&session.recipeId!==recipe.id){
      Alert.alert('آشپزی قبلی ناتمام است','شروع غذای جدید پیشرفت آشپزی قبلی را جایگزین می‌کند.',
        [{text:'انصراف',style:'cancel'},{text:'شروع غذای جدید',onPress:begin}]);
    }else begin();
  };
  const saveStep=(v:number)=>{
    const go=()=>void run(async()=>{await db.saveSession({recipeId:recipe.id,step:v,servings,endAt:null,remainingMs:null});setCookStep(v);});
    if(session?.recipeId===recipe.id&&(session.endAt!==null||session.remainingMs!==null)){
      Alert.alert('تغییر مرحله','با تغییر مرحله تایمر فعلی پاک می‌شود. ادامه می‌دهی؟',
        [{text:'انصراف',style:'cancel'},{text:'تغییر مرحله',onPress:go}]);
    }else go();
  };
  const currentTimer=session?.recipeId===recipe.id?(session.endAt?Math.max(0,session.endAt-timerNow):session.remainingMs??0):0;
  const toggleTimer=()=>void run(async()=>{
    const base=session?.recipeId===recipe.id?session:{recipeId:recipe.id,step:cookStep,servings,endAt:null,remainingMs:null};
    const secs=(recipe.steps[cookStep]?.minutes??5)*60000;
    const now=Date.now();
    const running=base.endAt!==null&&base.endAt>now;
    const left=base.endAt?Math.max(0,base.endAt-now):base.remainingMs;
    await db.saveSession({...base,step:cookStep,
      endAt:running?null:now+(left&&left>0?left:secs),
      remainingMs:running?left:null});
  });
  const finish=()=>{
    Alert.alert('اتمام آشپزی','مصرف مواد فقط با تأیید شما ثبت می‌شود.',[
      {text:'فعلاً ثبت نکن',style:'cancel'},
      {text:'ثبت پخت بدون کاهش مواد',onPress:()=>void run(async()=>{await db.finishWithoutConsuming(recipe.id,servings);setPage('tabs');setTab('home');})},
      {text:'کاهش موجودی',onPress:()=>{
        const essential=recipe.ingredients.filter(x=>x.essential).map(x=>({ingredientId:x.ingredientId,quantity:scaleQuantity(x.quantity,recipe.servings,servings,x.scaling)}));
        void run(async()=>{await db.finishCooking(recipe.id,servings,essential);setPage('tabs');setTab('home');});
      }}
    ]);
  };
  const card=(r:Recipe)=>{
    const matched=matchRecipe(r,pantry,r.servings,{excludedIngredientIds:[],excludedAllergens});
    return <SingleRecipe key={r.id} recipe={r} favorite={favorites.includes(r.id)} onPress={()=>showRecipe(r)}
      status={pantry.length?({ready:'آماده پخت',uncertain:'مقدار برخی مواد نامشخص',missing:'نیازمند خرید',substituted:'با جایگزین',incompatible:'نامناسب'}[matched.status]):undefined}/>;
  };
  const menu=()=> <View style={s.tabs} accessibilityRole="tablist">{([['home','خانه','⌂'],['pantry','یخچال من','▣'],['recipes','دستورها','☷'],['plan','برنامه من','▤']] as [Tab,string,string][]).map(([t,label,ico])=><Pressable key={t} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{selected:t===tab}}
        style={[s.tab,t===tab&&s.tabActive]} onPress={()=>{Keyboard.dismiss();setTab(t);setPage('tabs');}}>
        <Txt style={{fontSize:18,lineHeight:30,includeFontPadding:true,color:t===tab?c.dark:c.secondary}}>{ico}</Txt><Txt weight={t===tab} style={{fontSize:11,color:t===tab?c.dark:c.secondary}}>{label}</Txt></Pressable>)}</View>;
  const header=()=> <View style={s.header}>
    <View style={{flexDirection:'row',alignItems:'center',gap:12,maxWidth:720,width:'100%',alignSelf:'center'}}>
      <Image source={require('./assets/branding/brand-mark.png')} resizeMode="contain" style={{width:42,height:42}} />
      <View style={{flex:1,gap:0}}><Txt weight style={{color:c.dark,fontSize:16}}>سه‌قلم غذا</Txt>
        <Txt muted style={{fontSize:11}}>ببین چی داری، بگو چی بپزی!</Txt></View>
      {page!=='tabs'?<Pressable accessibilityRole="button" accessibilityLabel="بازگشت" onPress={()=>{setPage(page==='cook'?'detail':'tabs');Keyboard.dismiss();}}
        style={s.backButton}><Txt weight style={{color:c.dark,fontSize:14}}>بازگشت  ‹</Txt></Pressable>:null}
    </View>
  </View>;
  const categories=(scope:'home'|'recipes')=> <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categories} style={{flexGrow:0}}>
    {([['','همه'],['iranian','🍲 ایرانی'],['light','🥗 سبک'],['snack','🥣 میان‌وعده'],['fastfood','🥪 فست‌فود']] as [Category|'',string][]).map(([id,label])=><Pressable key={id} accessibilityRole="button" accessibilityState={{selected:(scope==='home'?homeFilter:recipeFilter)===id}} onPress={()=>scope==='home'?setHomeFilter(id):setRecipeFilter(id)} style={[s.chip,(scope==='home'?homeFilter:recipeFilter)===id&&s.chipActive]}><Txt style={{color:(scope==='home'?homeFilter:recipeFilter)===id?'#fff':c.dark,fontSize:13}}>{label}</Txt></Pressable>)}
  </ScrollView>;
  if(fatal)return <SafeAreaView style={[s.base,{justifyContent:'center',padding:20}]}><Panel>
    <Txt big>خطا در آماده‌سازی اطلاعات</Txt>
    <Txt muted>راه‌اندازی اطلاعات محلی کامل نشد. فعلاً اطلاعات برنامه را پاک نکن.</Txt>
    <Txt weight>جزئیات خطا برای عیب‌یابی:</Txt>
    <ScrollView style={{maxHeight:175}}><Txt style={{fontSize:12,lineHeight:22,textAlign:'left',writingDirection:'ltr'}}>{fatal}</Txt></ScrollView>
    <Btn secondary onPress={()=>void Share.share({message:fatal}).catch(()=>Alert.alert('خطا','امکان اشتراک گزارش وجود ندارد.'))}>اشتراک گزارش خطا</Btn>
    <Btn onPress={()=>setRetryIndex(v=>v+1)}>تلاش مجدد</Btn>
  </Panel></SafeAreaView>;
  if(!ready)return <SafeAreaView style={s.base}><Loading/></SafeAreaView>;
  if(onboardingVisible)return <SafeAreaView style={s.base} edges={['top','bottom']}>
    <ScrollView contentContainerStyle={[s.body,{flexGrow:1,justifyContent:'center'}]}>
      <Image source={require('./assets/branding/app-icon.png')} resizeMode="contain" style={{width:96,height:96,alignSelf:'center'}} />
      <Txt big style={{textAlign:'center',fontSize:23}}>سه‌قلم غذا</Txt>
      <Txt muted style={{textAlign:'center'}}>ببین چی داری، بگو چی بپزی!</Txt>
      <Panel><Txt big>آشپزی از مواد خونه</Txt><Txt>۱. موادی که داری رو در یخچال ثبت کن.</Txt>
        <Txt>۲. غذاهای قابل پخت یا مواد کمبود رو ببین.</Txt>
        <Txt>۳. دستور رو مرحله‌به‌مرحله انجام بده.</Txt></Panel>
      <Panel><Txt weight>آفلاین، بدون ثبت‌نام</Txt><Txt muted>داده‌های این نسخه روی گوشی تو می‌مونن. دستورهای فعلی هنوز در مرحله بازبینی محتوا هستن.</Txt></Panel>
      <Btn disabled={busy} onPress={()=>void run(async()=>{await db.finishOnboarding();setOnboardingVisible(false);openTour();})}>بله، راهنمای تعاملی را شروع کن</Btn>
      <Btn secondary disabled={busy} onPress={()=>void run(async()=>{await db.finishOnboarding();setOnboardingVisible(false);setTab('home');})}>بدون راهنما وارد برنامه شو</Btn>
    </ScrollView>
  </SafeAreaView>;
  if(page==='tabs'&&tab==='recipes')return <SafeAreaView style={s.base} edges={['top','bottom']}>
    <StatusBar barStyle={isDark?"light-content":"dark-content"}/>
    {header()}
    <FlatList data={recipeList} keyExtractor={item=>item.id} renderItem={({item})=>card(item)}
      initialNumToRender={12} maxToRenderPerBatch={12} windowSize={7} removeClippedSubviews
      keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
      contentContainerStyle={[s.body,{gap:11}]}
      ListHeaderComponent={<View style={{gap:13}}>
        <View style={s.sectionTitle}><Txt big style={{color:c.dark}}>کشف غذاها</Txt><Txt muted>{fmt(recipeList.length)} دستور در این دسته</Txt></View>
        <TextInput value={search} onChangeText={setSearch} style={s.input} placeholder="نام غذا یا بخشی از نام آن" placeholderTextColor={c.secondary} textAlign="right" accessibilityLabel="جست‌وجوی دستور پخت" />
        {categories('recipes')}
        <Txt muted style={{fontSize:12}}>دستورهای این مجموعه هنوز در انتظار بازبینی آشپزی هستند.</Txt>
      </View>}
      ListEmptyComponent={<Panel><Txt muted>دستوری مطابق جست‌وجو وجود ندارد؛ عبارت را کوتاه‌تر کن.</Txt></Panel>}
      ListFooterComponent={<Txt muted style={{textAlign:'center',fontSize:12,marginTop:10}}>پایان فهرست • {fmt(recipeList.length)} دستور</Txt>}
    />
    {menu()}
    {tour()}
  </SafeAreaView>;
  if(page==='favorites'||page==='history'){
    // Retain history timestamps with the matching recipe even if an old content
    // package removed one of the recorded recipe identifiers.
    const saved=page==='favorites'?
      catalog.filter(r=>favorites.includes(r.id)).map(recipe=>({recipe,finishedAt:''})):
      history.flatMap(record=>{
        const found=catalog.find(r=>r.id===record.recipeId);
        return found?[{recipe:found,finishedAt:record.finishedAt}]:[];
      });
    return <SafeAreaView style={s.base} edges={['top','bottom']}>
      <StatusBar barStyle={isDark?"light-content":"dark-content"}/>
      {header()}
      <FlatList data={saved} keyExtractor={(item,index)=>`${item.recipe.id}-${index}`}
        renderItem={({item})=><SingleRecipe recipe={item.recipe} favorite={page==='favorites'} onPress={()=>showRecipe(item.recipe)}
          subtitle={item.finishedAt?new Date(item.finishedAt).toLocaleDateString('fa-IR'):undefined}/>}
        initialNumToRender={12} maxToRenderPerBatch={12} windowSize={7}
        contentContainerStyle={s.body}
        ListHeaderComponent={<View style={s.sectionTitle}><Txt big style={{color:c.dark}}>{page==='favorites'?'غذاهای محبوب من':'سابقه آشپزی'}</Txt>
          <Txt muted>{fmt(saved.length)} مورد</Txt></View>}
        ListEmptyComponent={<Panel><Txt muted>{page==='favorites'?'هنوز غذایی ذخیره نشده است.':'هنوز هیچ پختی ثبت نشده است.'}</Txt></Panel>}
      />
    </SafeAreaView>;
  }
  return <SafeAreaView style={s.base} edges={['top','bottom']}><StatusBar barStyle={isDark?"light-content":"dark-content"}/>
    {header()}
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.body}>
    {page==='tabs'&&tab==='home'?<>
      <View style={s.hero}>
        <View pointerEvents="none" style={s.heroOrb}/><View pointerEvents="none" style={s.heroOrbSmall}/>
        <Txt style={{color:c.saffron,fontSize:12,fontWeight:'700'}}>سه‌قلم | آشپزی هوشمند و آفلاین</Txt>
        <Txt style={{color:'#FFF',fontSize:25,fontWeight:'800',lineHeight:39}}>امروز چی بپزیم؟</Txt>
        <Txt style={{color:'#EBF4EB',fontSize:14}}>مواد خونه رو انتخاب کن، بقیه‌ش با ما!</Txt>
        <Pressable accessibilityRole="button" accessibilityLabel="رفتن به یخچال من" onPress={()=>setTab('pantry')} style={s.heroButton}>
          <Txt weight style={{color:c.deep}}>ثبت مواد غذایی  ←</Txt></Pressable>
      </View>
      {session?<Btn secondary onPress={()=>{const r=catalog.find(x=>x.id===session.recipeId);if(r){setRecipe(r);setServings(effectiveCookingServings(session.servings,r.servings));setCookStep(clampedCookingStep(session.step,r.steps.length));setPage('cook');}}}>ادامه آشپزی ناتمام ←</Btn>:null}
      <View style={s.overview}><View><Txt big style={{color:c.dark}}>{fmt(new Set(pantry.map(x=>x.ingredientId)).size)}</Txt><Txt muted>نوع ماده در خانه</Txt></View><View><Txt big style={{color:c.dark}}>{fmt(suggestions.filter(x=>x.status==='ready').length)}</Txt><Txt muted>غذای آماده پخت</Txt></View></View>
      <View style={s.sectionTitle}><Txt big style={{color:c.dark}}>با این مواد چی بپزم؟</Txt><Txt muted>پیشنهاد بر اساس موجودی</Txt></View>
      <TextInput value={query} onChangeText={setQuery} placeholder="مثلاً مرغ و سیب‌زمینی دارم، زیر ۳۰ دقیقه" placeholderTextColor={c.secondary} style={s.input} textAlign="right" accessibilityLabel="جستجوی هوشمند فارسی"/>
      {intent.excludedIds.length?<Txt muted>مواد حذف‌شده: {intent.excludedIds.map(i=>BY_ID.get(i)?.fa).join('، ')}</Txt>:null}
      {pantry.length===0&&!query?<Panel><Txt>هنوز هیچ ماده‌ای ثبت نکردی. برای پیشنهاد دقیق، چند ماده اضافه کن.</Txt><Btn onPress={()=>setTab('pantry')}>افزودن مواد غذایی</Btn></Panel>:null}
      {categories('home')}
      {visibleSuggestions.length===0&&(pantry.length>0||query.trim())?<Panel><Txt muted>با مواد ثبت‌شده غذای قابل تهیه قطعی یا احتمالی پیدا نشد. می‌توانی موجودی را تکمیل کنی یا از بخش دستورها، مواد کمبود را ببینی.</Txt><Btn secondary onPress={()=>setTab('recipes')}>دیدن همه دستورها</Btn></Panel>:null}
      {visibleSuggestions.map(x=><SingleRecipe key={x.recipe.id} recipe={x.recipe} status={({ready:'● آماده پخت',uncertain:'◐ مقدار نامشخص',missing:'＋ چند قلم کم داری',substituted:'↔ جایگزین'} as Record<string,string>)[x.status]}
        subtitle={x.explanation} onPress={()=>showRecipe(x.recipe)}/>)}
      <View style={s.two}><Btn secondary onPress={()=>setPage('shopping')}>فهرست خرید</Btn><Btn secondary onPress={()=>setPage('favorites')}>علاقه‌مندی‌ها</Btn></View>
      <View style={s.two}><Btn secondary onPress={()=>setPage('history')}>سابقه آشپزی</Btn><Btn secondary onPress={()=>setPage('settings')}>تنظیمات و محدودیت‌ها</Btn></View>
    </>:null}
    {page==='tabs'&&tab==='pantry'?<>
      <Txt big>یخچال من</Txt><Txt muted>مواد را با مقدار دقیق یا بدون مقدار ثبت کن؛ چیزی خودکار موجود فرض نمی‌شود.</Txt>
      <Panel><Txt weight>افزودن ماده غذایی</Txt>
        <TextInput value={ingredientSearch} onChangeText={setIngredientSearch} style={s.input} placeholder="جستجوی مواد: تخم‌مرغ، برنج، رب..." placeholderTextColor={c.secondary} textAlign="right"/>
        <View style={s.wrap}>{chosen.map(i=><Pressable key={i.id} disabled={!!editingPantryId} accessibilityRole="button" accessibilityLabel={i.fa} accessibilityState={{selected:newIngredientId===i.id,disabled:!!editingPantryId}} onPress={()=>{setNewIngredientId(i.id);setUnit(defaultUnitFor(i.id));setEditingPantryId(null);setAmount('');setExpiresOn('');setPlace('fridge');}} style={[s.smallChip,newIngredientId===i.id&&s.selectedChip]}><Txt style={{fontSize:12,color:newIngredientId===i.id?'#fff':c.text}}>{i.fa}</Txt></Pressable>)}</View>
        {newIngredientId?<><Txt>انتخاب‌شده: {BY_ID.get(newIngredientId)?.fa}</Txt>{editingPantryId?<Txt muted style={{fontSize:12}}>هنگام ویرایش، نوع ماده ثابت است؛ برای انتخاب ماده دیگر، ابتدا انصراف بزن.</Txt>:null}
          <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" style={s.input} placeholder="مقدار (اختیاری؛ خالی = نامشخص)" placeholderTextColor={c.secondary} textAlign="right"/>
          <View style={s.wrap}>{([['pcs','عدد'],['g','گرم'],['kg','کیلو'],['ml','میلی‌لیتر'],['l','لیتر']] as [Unit,string][]).map(([u,title])=><Pressable key={u} onPress={()=>setUnit(u)} style={[s.smallChip,unit===u&&s.selectedChip]}><Txt style={{color:unit===u?'#fff':c.dark,fontSize:12}}>{title}</Txt></Pressable>)}</View>
          <TextInput value={expiresOn} onChangeText={setExpiresOn} style={s.input} placeholder="انقضا (شمسی، مثال: ۱۴۰۵/۰۷/۲۸)" placeholderTextColor={c.secondary} textAlign="right" keyboardType="numbers-and-punctuation" />
          <Txt weight>محل نگهداری</Txt>
          <View style={s.wrap}>{([['fridge','یخچال'],['freezer','فریزر'],['cabinet','کابینت']] as [StoragePlace,string][]).map(([id,label])=><Pressable key={id} accessibilityRole="button" accessibilityState={{selected:place===id}}
             onPress={()=>setPlace(id)} style={[s.smallChip,place===id&&s.selectedChip]}><Txt style={{color:place===id?'#fff':c.dark,fontSize:12}}>{label}</Txt></Pressable>)}</View>
          {editingPantryId?<Btn secondary onPress={resetIngredientEditor}>انصراف از ویرایش</Btn>:null}
          <Btn disabled={busy} onPress={addIngredient}>{editingPantryId?'ذخیره تغییرات':'ثبت در موجودی'}</Btn></>:null}
      </Panel>
      <Txt big>مواد ثبت‌شده ({fmt(pantry.length)})</Txt>
      {!pantry.length?<Panel><Txt muted>هنوز ماده‌ای اضافه نشده است.</Txt></Panel>:null}
      {pantry.map(row=><Panel key={row.id}><View style={s.spread}><Pressable onPress={()=>Alert.alert('حذف ماده','این قلم حذف شود؟',[{text:'انصراف'},{text:'حذف',style:'destructive',onPress:()=>void run(()=>db.removePantry(row.id))}])}><Txt style={{color:c.tomato}}>حذف</Txt></Pressable>
          <View style={{flex:1,alignItems:'flex-end'}}><Txt weight>{BY_ID.get(row.ingredientId)?.fa}</Txt><Txt muted>{row.quantity?quantityFa(row.quantity):'مقدار نامشخص'} • {row.place==='freezer'?'فریزر':row.place==='cabinet'?'کابینت':'یخچال'}</Txt>
          {row.expiresOn?<Txt style={{fontSize:12,color:isExpired(row.expiresOn)?c.tomato:c.secondary}}>{isExpired(row.expiresOn)?'منقضی شده · ': 'انقضا: '}{formatJalali(row.expiresOn)}</Txt>:null}
          <Btn secondary onPress={()=>beginEditPantry(row)}>ویرایش مقدار / انقضا</Btn></View></View></Panel>)}
    </>:null}
    {page==='tabs'&&tab==='plan'?<>
      <Txt big>برنامه غذایی من</Txt><Txt muted>برای هر روز، یک یا چند وعده برنامه‌ریزی کن.</Txt>
      <Panel><Txt weight>برنامه‌ریزی وعده</Txt>
        <TextInput value={planDay} onChangeText={setPlanDay} style={s.input} placeholder="تاریخ شمسی: ۱۴۰۵/۰۷/۲۸" placeholderTextColor={c.secondary} textAlign="right"/>
        <View style={s.wrap}>{['صبحانه','ناهار','شام','میان‌وعده'].map(v=><Pressable key={v} accessibilityRole="button" accessibilityState={{selected:planSlot===v}} style={[s.smallChip,planSlot===v&&s.selectedChip]} onPress={()=>setPlanSlot(v)}><Txt style={{color:planSlot===v?'#fff':c.dark}}>{v}</Txt></Pressable>)}</View>
        <Txt muted>غذا را انتخاب کن:</Txt>
        <TextInput value={planSearch} onChangeText={text=>{setPlanSearch(text);setPlanRecipe('');}} style={s.input} textAlign="right" placeholder="جست‌وجوی غذا برای برنامه غذایی" placeholderTextColor={c.secondary}/>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flexGrow:0}} contentContainerStyle={{gap:8}}>{planCandidates.map(r=><Pressable key={r.id} accessibilityRole="button" accessibilityLabel={r.title} accessibilityState={{selected:planRecipe===r.id}} onPress={()=>setPlanRecipe(r.id)} style={[s.smallChip,planRecipe===r.id&&s.selectedChip]}><Txt style={{fontSize:12,color:planRecipe===r.id?'#fff':c.dark}}>{r.title}</Txt></Pressable>)}</ScrollView>
        <Txt muted>{planRecipe?`غذای انتخابی: ${catalog.find(r=>r.id===planRecipe)?.title??'انتخاب نشده'}`:'برای ثبت، یکی از غذاهای نمایش‌داده‌شده را انتخاب کن.'}</Txt>
        <Btn disabled={busy||!planRecipe} onPress={()=>void run(async()=>{const isoDay=toIsoDate(planDay);if(!selectedRecipeStillVisible(planRecipe,planCandidates))throw new Error('ابتدا یک غذا از نتایج فعلی انتخاب کن');await db.addMeal(isoDay,planSlot,planRecipe);})}>ثبت برنامه</Btn>
      </Panel>
      <Txt big>وعده‌های ثبت‌شده</Txt>
      {meals.map(m=><Panel key={m.id}><View style={s.spread}><Pressable onPress={()=>void run(()=>db.removeMeal(m.id))}><Txt style={{color:c.tomato}}>حذف</Txt></Pressable><View><Txt weight>{formatJalali(m.date)} · {m.meal}</Txt><Txt>{catalog.find(r=>r.id===m.recipeId)?.title??'غذای حذف‌شده'}</Txt></View></View></Panel>)}
      {!meals.length?<Txt muted>هنوز برنامه‌ای ثبت نشده است.</Txt>:null}
    </>:null}
    {page==='detail'?<>
      <View style={s.detailHero}><Txt style={{fontSize:40,lineHeight:64,includeFontPadding:true,textAlign:'center'}}>🍽️</Txt><Txt big style={{textAlign:'center',color:c.dark}}>{recipe.title}</Txt><Txt muted style={{textAlign:'center'}}>{recipe.description}</Txt></View>
      <View style={s.overview}><Txt>{fmt(recipe.prepMinutes+recipe.cookMinutes)} دقیقه</Txt><Txt>{fmt(servings)} نفر</Txt><Txt>{recipe.difficulty==='easy'?'آسان':'متوسط'}</Txt></View>
      <View style={s.spread}><Btn secondary onPress={()=>void run(()=>db.toggleFavorite(recipe.id,!favorites.includes(recipe.id)))}>{favorites.includes(recipe.id)?'♥ حذف علاقه‌مندی':'♡ ذخیره غذا'}</Btn><Txt muted>تعداد نفرات</Txt><Btn secondary onPress={()=>setServings(Math.max(1,servings-1))}>−</Btn><Btn secondary onPress={()=>setServings(Math.min(20,servings+1))}>＋</Btn></View>
      <Txt big>مواد مورد نیاز</Txt>
      {recipe.ingredients.map((ing,i)=>{
        const q=scaleQuantity(ing.quantity,recipe.servings,servings,ing.scaling);
        const one=matchRecipe({...recipe,ingredients:[{...ing,essential:true}]},pantry,servings,{excludedIngredientIds:[],excludedAllergens});
        const shortage=one.missing.find(m=>m.ingredientId===ing.ingredientId)?.shortfall;
        return <Panel key={`${ing.ingredientId}-${i}`}><View style={s.spread}>
          <Btn secondary disabled={busy||!ing.essential||one.status!=='missing'||!shortage} onPress={()=>void run(()=>db.addShopping(ing.ingredientId,shortage??q))}>+ کمبود</Btn>
          <View style={{flex:1}}><Txt weight>{BY_ID.get(ing.ingredientId)?.fa}{!ing.essential?' (اختیاری)':''}</Txt><Txt muted>{quantityFa(q)}</Txt>
            <Txt style={{color:one.status==='ready'?c.green:c.tomato,fontSize:12}}>{!ing.essential?'اختیاری است؛ برای پخت ضروری نیست':one.status==='ready'?'موجود':one.status==='uncertain'?'مقدار نامعلوم؛ موجودی را بررسی کن':one.explanation}</Txt></View></View></Panel>;
      })}
      <Panel><Txt muted>این دستور در کاتالوگ آزمایشی است و هنوز بازبینی مستقل نهایی نشده است.</Txt></Panel>
      <Btn secondary onPress={()=>void Share.share({message:`${recipe.title}\n\n${recipe.ingredients.map(i=>`${BY_ID.get(i.ingredientId)?.fa}: ${quantityFa(scaleQuantity(i.quantity,recipe.servings,servings,i.scaling))}`).join('\n')}\n\n${recipe.steps.map((step,i)=>`${i+1}. ${step.body}`).join('\n')}`})}>اشتراک‌گذاری متن دستور</Btn>
      <Btn disabled={busy} onPress={openCooking}>شروع آشپزی مرحله‌به‌مرحله</Btn>
    </>:null}
    {page==='cook'?<>
      <Txt muted>در حال پخت: {recipe.title} • {fmt(servings)} نفر</Txt>
      <Txt big style={{color:c.dark}}>مرحله {fmt(cookStep+1)} از {fmt(recipe.steps.length)}</Txt>
      <View style={s.progressTrack} accessible accessibilityRole="progressbar" accessibilityLabel={`پیشرفت آشپزی، مرحله ${cookStep+1} از ${recipe.steps.length}`} accessibilityValue={{min:0,max:recipe.steps.length,now:cookStep+1}}><View style={[s.progressFill,{width:`${((cookStep+1)/Math.max(1,recipe.steps.length))*100}%`}]}/></View>
      <View style={s.cookingPanel}><Txt style={{fontSize:38,lineHeight:65,includeFontPadding:true}}>🍳</Txt><Txt big>{recipe.steps[cookStep]?.title}</Txt><Txt style={{fontSize:14,lineHeight:27}}>{recipe.steps[cookStep]?.body}</Txt>
        {recipe.steps[cookStep]?.safetyNote?<Txt style={{color:c.tomato}}>{recipe.steps[cookStep]?.safetyNote}</Txt>:null}</View>
      <Panel><Txt weight>تایمر مرحله</Txt>{session?.endAt&&currentTimer===0?<Txt weight style={{color:c.tomato}}>زمان این مرحله به پایان رسید.</Txt>:null}<Txt big style={{textAlign:'center'}}>{fmt(Math.floor(currentTimer/60000))}:{fmt(Math.floor(currentTimer/1000)%60).padStart(2,'۰')}</Txt>
        <View style={s.two}><Btn secondary onPress={toggleTimer}>{session?.endAt?(currentTimer>0?'مکث':'شروع مجدد'):'شروع / ادامه'}</Btn><Btn secondary onPress={()=>void run(()=>db.saveSession({recipeId:recipe.id,step:cookStep,servings,endAt:null,remainingMs:null}))}>بازنشانی</Btn></View>
        <Txt muted>تایمر از زمان مرجع ذخیره‌شده محاسبه می‌شود؛ اعلان پس‌زمینه هنوز فعال نیست.</Txt></Panel>
      <View style={s.two}><Btn secondary disabled={cookStep===0} onPress={()=>saveStep(cookStep-1)}>مرحله قبل</Btn>
        <Btn onPress={()=>cookStep===recipe.steps.length-1?finish():saveStep(cookStep+1)}>{cookStep===recipe.steps.length-1?'پایان آشپزی':'مرحله بعد'}</Btn></View>
      <Btn secondary onPress={()=>setPage('detail')}>خروج و ذخیره ادامه آشپزی</Btn>
    </>:null}
    {page==='shopping'?<>
      <Txt big>فهرست خرید</Txt><Txt muted>اقلام را اضافه یا ویرایش کن؛ پس از خرید می‌توانی آن‌ها را به یخچال منتقل کنی.</Txt>
      <Panel><Txt weight>{editingShoppingId?'ویرایش قلم':'افزودن به لیست خرید'}</Txt>
        <TextInput value={shoppingSearch} onChangeText={setShoppingSearch} style={s.input} textAlign="right" placeholder="جست‌وجوی ماده غذایی" placeholderTextColor={c.secondary}/>
        <View style={s.wrap}>{shoppingChoices.map(i=><Pressable key={i.id} accessibilityRole="button" accessibilityLabel={i.fa} accessibilityState={{selected:shoppingPick===i.id,disabled:!!editingShoppingId}} disabled={!!editingShoppingId} style={[s.smallChip,shoppingPick===i.id&&s.selectedChip]} onPress={()=>{setShoppingPick(i.id);setShoppingUnit(defaultUnitFor(i.id));}}><Txt style={{fontSize:12,color:shoppingPick===i.id?'#fff':c.dark}}>{i.fa}</Txt></Pressable>)}</View>
        {shoppingPick?<><Txt muted>ماده انتخاب‌شده: {BY_ID.get(shoppingPick)?.fa}</Txt>
          <TextInput value={shoppingAmount} onChangeText={setShoppingAmount} keyboardType="decimal-pad" style={s.input} textAlign="right" placeholder="مقدار (اختیاری)" placeholderTextColor={c.secondary}/>
          <View style={s.wrap}>{([['pcs','عدد'],['g','گرم'],['kg','کیلو'],['ml','میلی‌لیتر'],['l','لیتر']] as [Unit,string][]).map(([u,name])=><Pressable key={u} style={[s.smallChip,shoppingUnit===u&&s.selectedChip]} onPress={()=>setShoppingUnit(u)}><Txt style={{color:shoppingUnit===u?'#fff':c.dark}}>{name}</Txt></Pressable>)}</View>
          <Btn onPress={saveShopping} disabled={busy}>{editingShoppingId?'ذخیره تغییرات':'افزودن قلم'}</Btn>
          {editingShoppingId?<Btn secondary onPress={resetShoppingEditor}>انصراف از ویرایش</Btn>:null}
        </>:null}
      </Panel>
      {shopping.map(item=><Panel key={item.id}><View style={s.spread}><Btn secondary disabled={busy} onPress={()=>void run(()=>db.purchaseShopping(item))}>انتقال به یخچال ✓</Btn>
        <Pressable onPress={()=>void run(()=>db.removeShopping(item.id))}><Txt style={{color:c.tomato}}>حذف</Txt></Pressable><View><Txt weight>{BY_ID.get(item.ingredientId)?.fa}</Txt><Txt muted>{item.quantity?quantityFa(item.quantity):'مقدار نامشخص'}</Txt>
          <Btn secondary onPress={()=>{setEditingShoppingId(item.id);setShoppingPick(item.ingredientId);setShoppingSearch(BY_ID.get(item.ingredientId)?.fa??'');setShoppingAmount(item.quantity?String(item.quantity.amount):'');setShoppingUnit(item.quantity?.unit??defaultUnitFor(item.ingredientId));}}>ویرایش</Btn>
          <Pressable onPress={()=>void run(()=>db.updateShoppingDone(item.id,!item.done))}><Txt style={{color:c.green}}>{item.done?'☑ خریداری شده':'☐ علامت‌گذاری خرید'}</Txt></Pressable>
          </View></View></Panel>)}
      {!shopping.length?<Panel><Txt muted>فهرست خرید خالی است. از صفحه غذا مواد کمبود را اضافه کن.</Txt></Panel>:null}
    </>:null}
    {page==='settings'?<>
      <Txt big>ترجیحات و محدودیت غذایی</Txt>
      <Txt muted>مواد آلرژی‌زای ثبت‌شده در پیشنهادها فیلتر می‌شوند. اطلاعات ترکیبات و آلودگی متقاطع کاتالوگ اولیه هنوز بازبینی نهایی نشده است؛ از اپ برای تأیید ایمنی آلرژی استفاده نکن.</Txt>
      <Panel><Txt weight>مواد آلرژی‌زا برای حذف</Txt>
        <View style={s.wrap}>{['تخم‌مرغ','گلوتن','لبنیات','مغزها','ماهی','کنجد'].map(a=><Pressable key={a} accessibilityRole="checkbox" accessibilityState={{checked:excludedAllergens.includes(a)}} style={[s.smallChip,excludedAllergens.includes(a)&&s.selectedChip]}
          onPress={()=>void run(()=>db.saveAllergenPreferences(excludedAllergens.includes(a)?excludedAllergens.filter(x=>x!==a):[...excludedAllergens,a]))}>
          <Txt style={{color:excludedAllergens.includes(a)?'#fff':c.dark}}>{excludedAllergens.includes(a)?'✓ ':''}{a}</Txt></Pressable>)}</View>
        <Txt muted>این فیلترها برای راحتی جست‌وجو هستند و جایگزین بررسی برچسب مواد غذایی یا نظر متخصص نیستند.</Txt>
      </Panel>
      <Panel><Txt weight>حریم خصوصی</Txt><Txt>همه اطلاعات این نسخه فقط در دیتابیس دستگاه ذخیره می‌شوند. حساب کاربری یا سرویس ابری الزامی وجود ندارد.</Txt></Panel>
    </>:null}
    <View style={{height:20}}/>
    </ScrollView>
    {page==='tabs'?menu():null}
    {tour()}
  </SafeAreaView>;
}
const createStyles=(c:Palette)=>StyleSheet.create({
  base:{flex:1,backgroundColor:c.background,direction:'rtl'},
  header:{paddingHorizontal:18,paddingVertical:11,borderBottomWidth:1,borderBottomColor:c.line,backgroundColor:c.surface},
  backButton:{paddingHorizontal:13,paddingVertical:8,minHeight:45,justifyContent:'center',borderRadius:13,backgroundColor:c.pale},
  body:{paddingHorizontal:17,paddingTop:19,paddingBottom:36,gap:14,width:'100%',maxWidth:720,alignSelf:'center'},
  hero:{backgroundColor:c.deep,borderRadius:24,padding:21,minHeight:188,gap:8,justifyContent:'center',overflow:'hidden',elevation:3},
  heroOrb:{position:'absolute',height:170,width:170,borderRadius:85,right:-50,top:-60,backgroundColor:'#2F624C'},
  heroOrbSmall:{position:'absolute',height:100,width:100,borderRadius:50,right:22,bottom:-67,backgroundColor:'#4A7754'},
  heroButton:{backgroundColor:c.saffron,borderRadius:15,alignSelf:'flex-end',minHeight:48,justifyContent:'center',paddingVertical:9,paddingHorizontal:19,marginTop:11},
  overview:{flexDirection:'row',justifyContent:'space-around',paddingVertical:18,paddingHorizontal:12,backgroundColor:c.pale,borderRadius:22,alignItems:'center',borderWidth:1,borderColor:c.line},
  sectionTitle:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8},
  input:{fontFamily:'Vazirmatn-Regular',backgroundColor:c.surface,borderWidth:1,borderColor:c.line,borderRadius:13,minHeight:46,paddingHorizontal:13,fontSize:13,color:c.text,writingDirection:'rtl',textAlign:'right',includeFontPadding:true},
  recipeCard:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:c.surface,padding:13,borderRadius:22,borderWidth:1,borderColor:c.line,minHeight:94},
  dishIcon:{width:60,height:60,borderRadius:18,alignItems:'center',justifyContent:'center',overflow:'visible'},
  cardArrow:{width:24,height:35,alignItems:'center',justifyContent:'center'},
  statusPill:{borderRadius:10,paddingVertical:4,paddingHorizontal:9,alignSelf:'flex-end'},
  chip:{backgroundColor:c.pale,borderRadius:22,paddingVertical:10,paddingHorizontal:15,minHeight:43,justifyContent:'center'},
  chipActive:{backgroundColor:c.green},categories:{gap:8,paddingVertical:4},
  wrap:{flexDirection:'row',flexWrap:'wrap',gap:8},
  smallChip:{backgroundColor:c.pale,borderRadius:14,paddingHorizontal:12,paddingVertical:8,minHeight:43,justifyContent:'center',borderWidth:1,borderColor:c.line},
  selectedChip:{backgroundColor:c.green,borderColor:c.green},
  spread:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'},
  two:{flexDirection:'row',gap:10,justifyContent:'space-around',flexWrap:'wrap',alignItems:'center'},
  tabs:{flexDirection:'row',padding:7,backgroundColor:c.surface,borderTopWidth:1,borderTopColor:c.line,minHeight:72},
  tab:{flex:1,alignItems:'center',justifyContent:'center',padding:4,borderRadius:15,minHeight:55,gap:1},
  tabActive:{backgroundColor:c.pale,borderBottomWidth:2,borderBottomColor:c.green},
  detailHero:{backgroundColor:c.pale,borderRadius:25,paddingVertical:29,paddingHorizontal:20,gap:12},
  cookingPanel:{backgroundColor:c.surface,borderRadius:24,padding:18,alignItems:'stretch',minHeight:210,gap:17,justifyContent:'center',borderWidth:1,borderColor:c.line},
  progressTrack:{height:8,borderRadius:8,backgroundColor:c.pale,overflow:'hidden'},
  progressFill:{height:'100%',borderRadius:8,backgroundColor:c.green},
});
