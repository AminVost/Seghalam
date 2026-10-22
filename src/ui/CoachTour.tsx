import React,{useEffect,useRef} from 'react';
import {Animated,BackHandler,Modal,Platform,Pressable,ScrollView,StyleSheet,useWindowDimensions,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Btn,Txt} from './atoms';
import {useTheme} from './ThemeProvider';

export type TourTarget='home'|'pantry'|'recipes'|'plan';
const slides:{tab:TourTarget;title:string;detail:string;hint:string}[]=[
  {tab:'home',title:'از اینجا شروع کنیم',detail:'سه‌قلم با مواد غذایی خانه‌ات، غذاهای مناسب را پیشنهاد می‌دهد. هیچ ماده‌ای بدون ثبت تو موجود فرض نمی‌شود.',hint:'خانه'},
  {tab:'pantry',title:'مواد غذایی را انتخاب کن',detail:'در «یخچال من» جست‌وجو کن؛ می‌توانی چند ماده را یکجا انتخاب و ثبت کنی. مقدار نامشخص هم قابل ثبت است.',hint:'یخچال من'},
  {tab:'recipes',title:'دستور مناسب را پیدا کن',detail:'در بخش دستورها نام غذا را جست‌وجو کن، دسته‌بندی را انتخاب کن و مواد کمبود را به خرید اضافه کن.',hint:'دستورها'},
  {tab:'plan',title:'برای روزهای بعد برنامه بریز',detail:'یک تاریخ و وعده انتخاب کن و غذا را ثبت کن؛ بعداً از خانه می‌توانی سراغ خرید و آشپزی بروی.',hint:'برنامه من'},
];

/** Bottom-sheet tutorial with explicit Android 15+/16 edge-to-edge protection.
 * Footer actions live OUTSIDE the scrolling content, so they cannot vanish
 * underneath the device's three-button/gesture navigation bar.
 */
export function CoachTour({visible,step,onStepChange,onClose,onNavigate}:{visible:boolean;step:number;onStepChange:(step:number)=>void;onClose:()=>void;onNavigate:(tab:TourTarget)=>void}){
  const {palette:c}=useTheme();
  const {height}=useWindowDimensions();
  const insets=useSafeAreaInsets();
  const bottomPad=Math.max(insets.bottom,Platform.OS==='android'?48:22)+12;
  const topPad=Math.max(insets.top,20)+10;
  const availableHeight=Math.max(230,height-bottomPad-topPad-12);
  const motion=useRef(new Animated.Value(0)).current;
  useEffect(()=>{
    if(!visible)return;
    motion.setValue(0);
    const animation=Animated.timing(motion,{toValue:1,duration:240,useNativeDriver:true});
    animation.start();
    return ()=>animation.stop();
  },[visible,step,motion]);
  useEffect(()=>{
    if(!visible)return;
    const back=BackHandler.addEventListener('hardwareBackPress',()=>{onClose();return true;});
    return ()=>back.remove();
  },[visible,onClose]);
  const next=()=>{
    if(step===slides.length-1){onClose();return;}
    const i=step+1;
    onStepChange(i);
    onNavigate(slides[i]!.tab);
  };
  const prev=()=>{
    if(step===0)return;
    const i=step-1;onStepChange(i);onNavigate(slides[i]!.tab);
  };
  const current=slides[step]??slides[0]!;
  return <Modal transparent visible={visible} animationType="fade" statusBarTranslucent navigationBarTranslucent
    onRequestClose={onClose}>
    <View style={[styles.scrim,{backgroundColor:c.overlay,paddingBottom:bottomPad,paddingTop:topPad}]}>
      <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button"
        accessibilityLabel="بستن راهنمای آموزشی" onPress={onClose}/>
      <Animated.View style={[styles.sheet,{backgroundColor:c.surface,borderColor:c.line,maxHeight:availableHeight,
        opacity:motion,transform:[{translateY:motion.interpolate({inputRange:[0,1],outputRange:[16,0]})}]}]}>
        <View style={styles.top}>
          <Txt muted style={{fontSize:12}}>راهنمای اختیاری • {step+1} از {slides.length}</Txt>
          <Pressable accessibilityRole="button" accessibilityLabel="رد کردن راهنما" onPress={onClose}>
            <Txt style={{fontSize:13,color:c.secondary}}>رد کردن ✕</Txt>
          </Pressable>
        </View>
        <View style={[styles.track,{backgroundColor:c.pale}]}>
          <View style={[styles.fill,{backgroundColor:c.green,width:`${(step+1)/slides.length*100}%`}]}/>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.description}
          showsVerticalScrollIndicator={false} nestedScrollEnabled>
          <View style={[styles.marker,{backgroundColor:c.pale}]}>
            <Txt style={{textAlign:'center',fontSize:22,lineHeight:40,includeFontPadding:true}}>✦</Txt>
          </View>
          <Txt big style={styles.rtlText}>{current.title}</Txt>
          <Txt muted style={styles.rtlText}>{current.detail}</Txt>
          <Txt weight style={[styles.rtlText,{color:c.dark,fontSize:12}]}>بخش فعلی: {current.hint}</Txt>
        </ScrollView>
        <View style={styles.actions}>
          <View style={{flex:1}}><Btn onPress={next}>{step===slides.length-1?'پایان راهنما':'مرحله بعد'}</Btn></View>
          {step>0?<Btn secondary onPress={prev}>قبلی</Btn>:null}
        </View>
      </Animated.View>
    </View>
  </Modal>;
}
const styles=StyleSheet.create({
  scrim:{flex:1,justifyContent:'flex-end',paddingHorizontal:14,direction:'rtl'},
  sheet:{width:'100%',maxWidth:560,alignSelf:'center',borderRadius:22,borderWidth:1,padding:16,
    gap:10,elevation:12,direction:'rtl',overflow:'hidden'},
  top:{flexDirection:'row',direction:'rtl',justifyContent:'space-between',alignItems:'center',gap:8},
  track:{height:5,borderRadius:5,overflow:'hidden',direction:'rtl'},
  fill:{height:'100%',borderRadius:5},
  scroll:{flexShrink:1},
  description:{paddingVertical:6,gap:10,direction:'rtl',alignItems:'stretch'},
  rtlText:{textAlign:'right',alignSelf:'stretch'},
  marker:{height:44,width:44,borderRadius:14,justifyContent:'center',alignItems:'center',alignSelf:'flex-start'},
  actions:{flexDirection:'row',direction:'rtl',alignItems:'center',gap:10,marginTop:4,flexShrink:0},
});
