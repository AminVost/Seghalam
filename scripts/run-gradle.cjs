const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const wrapper=path.join(__dirname,'..','android',process.platform==='win32'?'gradlew.bat':'gradlew');
if(!fs.existsSync(wrapper)){
  console.error('Gradle wrapper missing. On Windows, run scripts/bootstrap-native.ps1 first.');
  process.exit(2);
}
const args=process.argv.slice(2);
if(args.length!==1||!['assembleDebug','assembleRelease'].includes(args[0])){
  console.error('Usage: node scripts/run-gradle.cjs assembleDebug|assembleRelease');
  process.exit(2);
}
if(args[0]==='assembleRelease'){
  const contentAudit=spawnSync('npm',['run','audit:content'],{cwd:path.join(__dirname,'..'),stdio:'inherit',shell:process.platform==='win32'});
  if(contentAudit.status!==0)process.exit(contentAudit.status??1);
  if(process.env.SEGHALAM_RELEASE_SIGNING_CONFIRMED!=='1'){
    console.error('Release signing not confirmed. Configure publisher signing, then set SEGHALAM_RELEASE_SIGNING_CONFIRMED=1.');
    process.exit(2);
  }
}
const result=spawnSync(wrapper,[args[0]],{cwd:path.dirname(wrapper),stdio:'inherit',shell:process.platform==='win32'});
if(result.error){console.error(String(result.error));process.exit(2);}
process.exit(result.status??1);
