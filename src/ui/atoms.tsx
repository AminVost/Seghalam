import React,{useMemo} from 'react';
import {Pressable,StyleSheet,Text,View,ActivityIndicator} from 'react-native';
import {useTheme} from './ThemeProvider';
import type {Palette} from './theme';

export function Txt({children,big=false,muted=false,weight=false,style}: {children:React.ReactNode;big?:boolean;muted?:boolean;weight?:boolean;style?:object}){
  const {palette:c}=useTheme();
  const s=useMemo(()=>makeStyles(c),[c]);
  return <Text allowFontScaling maxFontSizeMultiplier={1.35}
    style={[s.text,big&&s.big,muted&&s.muted,weight&&s.bold,style]}>{children}</Text>;
}
export function Btn({children,onPress,secondary=false,disabled=false}: {children:React.ReactNode;onPress:()=>void;secondary?:boolean;disabled?:boolean}){
  const {palette:c}=useTheme();
  const s=useMemo(()=>makeStyles(c),[c]);
  const accessible=typeof children==='string'?children:undefined;
  return <Pressable accessibilityRole="button" accessibilityLabel={accessible} accessibilityState={{disabled}}
    disabled={disabled} onPress={onPress} style={({pressed})=>[s.button,secondary&&s.secondary,disabled&&s.disabled,pressed&&s.pressed]}>
    <Txt weight style={{color:secondary?c.text:c.inkOnDark,textAlign:'center',fontSize:12.5,lineHeight:23}}>{children}</Txt>
  </Pressable>;
}
export function Panel({children}: {children:React.ReactNode}){
  const {palette:c}=useTheme();const s=useMemo(()=>makeStyles(c),[c]);
  return <View style={s.panel}>{children}</View>;
}
export function Loading(){
  const {palette:c}=useTheme();
  return <View style={{padding:42,gap:14,alignItems:'center'}}>
    <ActivityIndicator size="large" color={c.green}/><Txt>در حال آماده‌سازی اطلاعات...</Txt>
  </View>;
}
const makeStyles=(c:Palette)=>StyleSheet.create({
  text:{fontFamily:'Vazirmatn-Regular',fontSize:13,color:c.text,textAlign:'right',writingDirection:'rtl',lineHeight:23,includeFontPadding:true},
  big:{fontFamily:'Vazirmatn-Bold',fontSize:18,lineHeight:30},
  muted:{color:c.secondary},bold:{fontFamily:'Vazirmatn-Bold'},
  button:{minHeight:44,paddingVertical:9,paddingHorizontal:13,borderRadius:13,backgroundColor:c.green,
    alignItems:'center',justifyContent:'center',marginVertical:3,maxWidth:'100%',flexShrink:1},
  secondary:{backgroundColor:c.pale,borderWidth:1,borderColor:c.line},
  disabled:{opacity:0.45},pressed:{opacity:0.86,transform:[{scale:0.99}]},
  panel:{borderRadius:19,backgroundColor:c.surface,padding:15,marginBottom:5,borderWidth:1,borderColor:c.line,gap:9,
    elevation:1,shadowColor:'#172F22',shadowOpacity:0.05,shadowRadius:6,shadowOffset:{width:0,height:1}},
});
