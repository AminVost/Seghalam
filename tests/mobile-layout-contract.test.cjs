const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const source=(file)=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

test('coach sheet uses safe-area insets and bounds its height above Android navigation',()=>{
  const tour=source('src/ui/CoachTour.tsx');
  assert.match(tour,/useSafeAreaInsets/);
  assert.match(tour,/useWindowDimensions/);
  assert.match(tour,/bottomPad=Math\.max\(insets\.bottom/);
  assert.match(tour,/paddingBottom:bottomPad/);
  assert.match(tour,/maxHeight:availableHeight/);
  assert.match(tour,/navigationBarTranslucent/);
  assert.match(tour,/<ScrollView[^>]*style=\{styles\.scroll\}/);
  assert.ok(tour.indexOf('</ScrollView>')<tour.indexOf('<View style={styles.actions}>'),
    'Tour controls must not be inside scrollable text');
});

test('Persian main screens and wrapping selectors must remain explicit RTL',()=>{
  const app=source('App.tsx');
  assert.match(app,/base:\{flex:1,backgroundColor:c\.background,direction:'rtl'/);
  assert.match(app,/body:\{[^\n]*direction:'rtl'/);
  assert.match(app,/categories:\{[^\n]*flexWrap:'wrap',direction:'rtl'/);
  assert.match(app,/pageHeading:\{width:'100%',textAlign:'right'/);
  assert.doesNotMatch(app,/<ScrollView horizontal/);
  assert.doesNotMatch(app,/row-reverse/);
  assert.match(app,/<View style=\{s\.wrap\}>\{planCandidates\.map/);
});

test('bulk add actions stay visible outside long ScrollView, above bottom tabs',()=>{
  const app=source('App.tsx');
  const scrollEnd=app.lastIndexOf('</ScrollView>');
  const sticky=app.indexOf("tab==='pantry'&&bulkPantry?<View style={s.bulkActionBar}>");
  const tabs=app.lastIndexOf("{page==='tabs'?menu():null}");
  assert.ok(scrollEnd>0&&scrollEnd<sticky&&sticky<tabs);
  assert.match(app,/page==='shopping'&&bulkShopping\?<View style=\{s\.bulkActionBar\}>/);
  assert.match(app,/disabled=\{busy\|\|selectedPantryIds\.length===0\}/);
});

test('test APK version is unique for the UX hotfix and upgrade-safe',()=>{
  const app=source('android/app/build.gradle');
  const build=source('scripts/build-phone-apk.ps1');
  assert.match(app,/versionCode 4/);
  assert.match(app,/versionName '0\.3\.1'/);
  assert.match(build,/Seghalam-0\.3\.1-PHONE-TEST\.apk/);
  assert.match(build,/versionCode 4/);
  assert.equal(JSON.parse(source('package.json')).version,'0.3.1');
});
