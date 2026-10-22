import React,{useEffect,useRef,useState} from 'react';
import {Animated,BackHandler,Modal,Pressable,StyleSheet,View} from 'react-native';
import {Btn,Txt} from './atoms';
import {useTheme} from './ThemeProvider';

export type TourTarget='home'|'pantry'|'recipes'|'plan';
const slides:{tab:TourTarget;title:string;detail:string;hint:string}[]=[
  {tab:'home',title:'از اینجا شروع کنیم',detail:'سه‌قلم با مواد غذایی خانه‌ات، غذاهای مناسب را پیشنهاد می‌دهد. هیچ ماده‌ای بدون ثبت تو موجود فرض نمی‌شود.',hint:'خانه'},
  {tab:'pantry',title:'مواد غذایی را انتخاب کن',detail:'در «یخچال من» جست‌وجو کن؛ می‌توانی چند ماده را یکجا انتخاب و ثبت کنی. مقدار نامشخص هم قابل ثبت است.',hint:'یخچال من'},
  {tab:'recipes',title:'دستور مناسب را پیدا کن',detail:'در بخش دستورها نام غذا را جست‌وجو کن، دسته‌بندی را انتخاب کن و مواد کمبود را به خرید اضافه کن.',hint:'دستورها'},
  {tab:'plan',title:'برای روزهای بعد برنامه بریز',detail:'یک تاریخ و وعده انتخاب کن و غذا را ثبت کن؛ بعداً از خانه می‌توانی سراغ خرید و آشپزی بروی.',hint:'برنامه من'},
];

export function CoachTour({visible,onClose,onNavigate}:{visible:boolean;onClose:()=>void;onNavigate:(tab:TourTarget)=>void}){
  const {palette:c}=useTheme();
  const [step,setStep]=useState(0);
  const motion=useRef(new Animated.Value(0)).current;
  useEffect(()=>{
    if(!visible)return;
    motion.setValue(0);
    Animated.timing(motion,{toValue:1,duration:280,useNativeDriver:true}).start();
  },[visible,step,motion]);
  useEffect(()=>{
    if(visible){setStep(0);onNavigate('home');}
    // Run only when tutorial is opened. Changes to callbacks must not reset slides.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[visible]);
  useEffect(()=>{
    if(!visible)return;
    const back=BackHandler.addEventListener('hardwareBackPress',()=>{onClose();return true;});
    return ()=>back.remove();
  },[visible,onClose]);
  const next=()=>{
    if(step===slides.length-1){onClose();return;}
    const i=step+1;
    setStep(i);
    onNavigate(slides[i]!.tab);
  };
  const prev=()=>{
    if(step===0)return;
    const i=step-1;setStep(i);onNavigate(slides[i]!.tab);
  };
  const current=slides[step]!;
  return <Modal transparent visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
    <View style={[styles.scrim,{backgroundColor:c.overlay}]}>
      <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="بستن راهنمای آموزشی" onPress={onClose}/>
      <Animated.View style={[styles.sheet,{backgroundColor:c.surface,borderColor:c.line,
        opacity:motion,transform:[{translateY:motion.interpolate({inputRange:[0,1],outputRange:[24,0]})}]}]}>
        <View style={styles.top}>
          <Txt muted style={{fontSize:12}}>راهنمای اختیاری • {step+1} از {slides.length}</Txt>
          <Pressable accessibilityRole="button" onPress={onClose}><Txt style={{fontSize:13,color:c.secondary}}>رد کردن ✕</Txt></Pressable>
        </View>
        <View style={[styles.track,{backgroundColor:c.pale}]}>
          <View style={[styles.fill,{backgroundColor:c.green,width:`${(step+1)/slides.length*100}%`}]}/>
        </View>
        <View style={[styles.marker,{backgroundColor:c.pale}]}>
          <Txt style={{textAlign:'center',fontSize:22,lineHeight:40,includeFontPadding:true}}>✦</Txt>
        </View>
        <Txt big>{current.title}</Txt>
        <Txt muted>{current.detail}</Txt>
        <Txt weight style={{color:c.dark,fontSize:12}}>بخش فعلی: {current.hint}</Txt>
        <View style={styles.actions}>
          {step>0?<Btn secondary onPress={prev}>قبلی</Btn>:null}
          <View style={{flex:1}}><Btn onPress={next}>{step===slides.length-1?'پایان راهنما':'مرحله بعد'}</Btn></View>
        </View>
      </Animated.View>
    </View>
  </Modal>;
}
const styles=StyleSheet.create({
  scrim:{flex:1,justifyContent:'flex-end',paddingHorizontal:14,paddingBottom:22,direction:'rtl'},
  sheet:{width:'100%',maxWidth:560,alignSelf:'center',borderRadius:24,borderWidth:1,padding:20,gap:12,elevation:14},
  top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  track:{height:5,borderRadius:5,overflow:'hidden',direction:'rtl'},
  fill:{height:'100%',borderRadius:5},
  marker:{height:48,width:48,borderRadius:16,justifyContent:'center',alignItems:'center'},
  actions:{flexDirection:'row',alignItems:'center',gap:10,marginTop:4},
});
