/** Semantic design tokens for high-contrast RTL interfaces in both themes. */
export type ThemeMode='system'|'light'|'dark';
export type Palette={
  background:string;surface:string;dark:string;green:string;saffron:string;
  tomato:string;text:string;secondary:string;line:string;pale:string;
  warm:string;deep:string;inkOnDark:string;overlay:string;
};
const light:Palette={
  background:'#F8F9F4',surface:'#FFFFFF',dark:'#183D32',green:'#28684C',saffron:'#E9B453',
  tomato:'#A83A2A',text:'#263C31',secondary:'#536A5F',line:'#DAE5DC',pale:'#EDF3EA',
  warm:'#F8E8CC',deep:'#123228',inkOnDark:'#FFFFFF',overlay:'rgba(8,26,19,0.55)',
};
const dark:Palette={
  background:'#111A17',surface:'#1B2923',dark:'#E1EFE5',green:'#27684B',saffron:'#E9B453',
  tomato:'#FF9E86',text:'#DCE9E0',secondary:'#AABFB3',line:'#34463B',pale:'#293B31',
  warm:'#3D3826',deep:'#13372A',inkOnDark:'#FFFFFF',overlay:'rgba(0,0,0,0.7)',
};
export const palette=light; // Compatibility for code not yet migrated to the theme hook.
export function paletteFor(isDark:boolean):Palette{return isDark?dark:light;}
