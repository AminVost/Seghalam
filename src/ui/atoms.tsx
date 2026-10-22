import React from 'react';
import {Pressable,StyleSheet,Text,View,ActivityIndicator} from 'react-native';
import {palette as c} from './theme';
export function Txt({children,big=false,muted=false,weight=false,style}: {children:React.ReactNode;big?:boolean;muted?:boolean;weight?:boolean;style?:object}){
  return <Text allowFontScaling style={[s.text,big&&s.big,muted&&s.muted,weight&&s.bold,style]}>{children}</Text>;
}
export function Btn({children,onPress,secondary=false,disabled=false}: {children:React.ReactNode;onPress:()=>void;secondary?:boolean;disabled?:boolean}){
  const accessible=typeof children==='string'?children:undefined;
  return <Pressable accessibilityRole="button" accessibilityLabel={accessible} accessibilityState={{disabled}}
    disabled={disabled} onPress={onPress} style={({pressed})=>[s.button,secondary&&s.secondary,disabled&&s.disabled,pressed&&s.pressed]}>
    <Txt weight style={{color:secondary?c.dark:c.inkOnDark,textAlign:'center',fontSize:14}}>{children}</Txt>
  </Pressable>;
}
export function Panel({children}: {children:React.ReactNode}){return <View style={s.panel}>{children}</View>;}
export function Loading(){return <View style={{padding:60,gap:15,alignItems:'center'}}><ActivityIndicator size="large" color={c.green}/><Txt>در حال آماده‌سازی اطلاعات...</Txt></View>;}
const s=StyleSheet.create({
  text:{fontFamily:'Vazirmatn-Regular',fontSize:15,color:c.text,textAlign:'right',writingDirection:'rtl',lineHeight:27,includeFontPadding:false},
  big:{fontFamily:'Vazirmatn-Bold',fontSize:22,lineHeight:37},muted:{color:c.secondary},bold:{fontFamily:'Vazirmatn-Bold'},
  button:{minHeight:50,paddingVertical:10,paddingHorizontal:14,borderRadius:16,backgroundColor:c.dark,alignItems:'center',justifyContent:'center',marginVertical:4},
  secondary:{backgroundColor:c.pale,borderWidth:1,borderColor:c.line},disabled:{opacity:0.43},pressed:{opacity:0.86,transform:[{scale:0.985}]},
  panel:{borderRadius:22,backgroundColor:c.surface,padding:17,marginBottom:6,borderWidth:1,borderColor:c.line,gap:9,
    elevation:1,shadowColor:'#23382B',shadowOpacity:0.03,shadowRadius:8,shadowOffset:{width:0,height:2}},
});
