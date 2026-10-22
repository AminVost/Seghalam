import React,{createContext,useContext,useMemo,useState} from 'react';
import {useColorScheme} from 'react-native';
import {paletteFor,type Palette,type ThemeMode} from './theme';

type ThemeValue={palette:Palette;mode:ThemeMode;isDark:boolean;setMode:(mode:ThemeMode)=>void};
const ThemeContext=createContext<ThemeValue|undefined>(undefined);
export function ThemeProvider({children}:{children:React.ReactNode}){
  const system=useColorScheme();
  const [mode,setMode]=useState<ThemeMode>('system');
  const isDark=mode==='dark'||(mode==='system'&&system==='dark');
  const value=useMemo(()=>({palette:paletteFor(isDark),mode,isDark,setMode}),[isDark,mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme():ThemeValue{
  const context=useContext(ThemeContext);
  if(!context)throw new Error('ThemeProvider is missing');
  return context;
}
