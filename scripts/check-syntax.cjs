/** TypeScript TSX parser smoke test. This is NOT a complete React Native typecheck. */
const ts=require('typescript');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const paths=['App.tsx','src/ui/atoms.tsx','src/ui/theme.ts','src/ui/ThemeProvider.tsx','src/ui/CoachTour.tsx','src/domain/staticCatalog.ts','src/storage/db.ts'];
let count=0;
for(const relative of paths){
 const filename=path.join(root,relative);
 const kind=filename.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS;
 const source=ts.createSourceFile(filename,fs.readFileSync(filename,'utf8'),ts.ScriptTarget.ESNext,true,kind);
 const errors=source.parseDiagnostics;
 if(errors.length){
   for(const diagnostic of errors)console.error(relative,ts.flattenDiagnosticMessageText(diagnostic.messageText,' '));
   process.exitCode=1;
 }else count++;
}
if(!process.exitCode)console.log(`Syntax parsing PASS (${count} UI/storage TS/TSX files); full RN typecheck still required`);
