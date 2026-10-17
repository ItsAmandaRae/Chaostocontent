import assert from 'node:assert/strict';
import { addVoiceTrait } from '../src/lib/voice';
import { voiceSystem } from '../supabase/functions/_shared/voice';
import { plannerDays, movePlanner, dayKey, planDateISO, localPlanDate, plannerTitle, savedPlannerView } from '../src/lib/planner';
import { shareTo } from '../src/lib/share';
const traits = addVoiceTrait(['warm'], ' delightfully direct ');
assert.deepEqual(traits, ['warm','delightfully direct']);
assert.deepEqual(addVoiceTrait(traits, 'DELIGHTFULLY DIRECT'), traits);
const brand = { what_you_do:null,audience:null,audience_problem:null,tone_traits:traits,voice_samples:['This is how I actually talk.'], banned_words:['synergy'],offers:null,links:null,cta_style:null };
for (const reference of [false,true]) {
 const prompt=voiceSystem(brand, reference);
 assert.ok(prompt.includes('delightfully direct')); assert.ok(prompt.includes('This is how I actually talk.')); assert.ok(prompt.includes('synergy'));
 assert.ok(prompt.includes('preserve their distinctive phrasing'));
 assert.equal(prompt.includes('Do not imitate its voice'),reference);
}
const anchor=new Date(2026,9,17);
assert.equal(plannerDays(anchor,'week').length,7);
assert.equal(dayKey(movePlanner(anchor,'week',1)),'2026-10-24');
assert.equal(dayKey(movePlanner(anchor,'month',1)),'2026-11-17');
assert.equal(dayKey(localPlanDate(planDateISO(anchor))),'2026-10-17');
assert.equal(dayKey(localPlanDate('2026-10-17')),'2026-10-17');
assert.equal(plannerTitle({content:'\nReadable title\nbody'}),'Readable title');
assert.equal(plannerTitle({content:''}),'Untitled');
const memory=new Map<string,string>();
Object.defineProperty(globalThis,'localStorage',{value:{getItem:(key:string)=>memory.get(key)??null,setItem:(key:string,value:string)=>memory.set(key,value)},configurable:true});
assert.equal(savedPlannerView('new-user'),'week'); memory.set('ctc-planner-view:fixture','month');assert.equal(savedPlannerView('fixture'),'month');assert.equal(savedPlannerView('other'),'week');
const opened:string[]=[];const copied:string[]=[];
Object.defineProperty(globalThis,'navigator',{value:{clipboard:{writeText:async(text:string)=>{copied.push(text)}}},configurable:true});
Object.defineProperty(globalThis,'window',{value:{open:(url:string)=>opened.push(url)},configurable:true});
for(const [platform,url] of [['instagram','https://www.instagram.com/'],['tiktok','https://www.tiktok.com/upload'],['twitter','https://x.com/intent/post?text=fixture%20text']]) {const result=await shareTo(platform,'fixture text');assert.ok(result.copied&&result.opened);assert.equal(opened.at(-1),url);assert.equal(copied.at(-1),'fixture text');}
console.log('Voice prompt, local date/range, user-scoped view and Copy/Open regression checks passed');
