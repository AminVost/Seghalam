const test=require('node:test');
const assert=require('node:assert/strict');
const {selectedRecipeStillVisible,effectiveCookingServings,clampedCookingStep}=require('../.domain-build/domain/flows');
test('planning cannot silently save an outdated filtered recipe',()=>{
 const filtered=[{id:'omelet'},{id:'soup'}];
 assert.equal(selectedRecipeStillVisible('rice',filtered),false);
 assert.equal(selectedRecipeStillVisible('',filtered),false);
 assert.equal(selectedRecipeStillVisible('soup',filtered),true);
});
test('cooking resumes with the exact chosen portion count',()=>{
 assert.equal(effectiveCookingServings(5,2),5);
 assert.equal(effectiveCookingServings(0,2),2); // legacy v5 row
 assert.equal(effectiveCookingServings(31,2),2);
 assert.equal(effectiveCookingServings(NaN,2),2);
});
test('stale session step never exceeds changed recipe steps',()=>{
 assert.equal(clampedCookingStep(9,4),3);
 assert.equal(clampedCookingStep(-4,4),0);
 assert.equal(clampedCookingStep(2,4),2);
 assert.throws(()=>clampedCookingStep(1,0));
});
