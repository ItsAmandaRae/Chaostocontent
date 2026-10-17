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

// Persist/reload checks use one isolated account, never an existing owner.
if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
 const { createClient } = await import('@supabase/supabase-js');
 const admin=createClient(process.env.VITE_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
 const password=crypto.randomUUID()+'aA1!';
 const email=`ux-fixture-${crypto.randomUUID()}@example.invalid`;
 const created=await admin.auth.admin.createUser({email,password,email_confirm:true});assert.ifError(created.error);assert.ok(created.data.user);
 const id=created.data.user.id;
 try {
  const client=createClient(process.env.VITE_SUPABASE_URL,process.env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false}});
  assert.ifError((await client.auth.signInWithPassword({email,password})).error);
  assert.ifError((await client.from('brand_profiles').insert({user_id:id,tone_traits:traits,voice_samples:brand.voice_samples})).error);
  const stored=await client.from('brand_profiles').select('tone_traits,voice_samples').single();assert.ifError(stored.error);assert.deepEqual(stored.data?.tone_traits,traits);assert.deepEqual(stored.data?.voice_samples,brand.voice_samples);
  const bucket=await client.from('buckets').insert({user_id:id,name:'Fictional',color:'cyan'}).select().single();assert.ifError(bucket.error);assert.ok(bucket.data);
  assert.ifError((await client.from('buckets').update({color:'mint',name:'Edited fictional'}).eq('id',bucket.data.id)).error);
  const loaded=await client.from('buckets').select().eq('id',bucket.data.id).single();assert.equal(loaded.data?.color,'mint');assert.equal(loaded.data?.name,'Edited fictional');
  assert.ok((await client.from('buckets').update({color:'unapproved'}).eq('id',bucket.data.id)).error);
  console.log('Isolated custom trait/voice sample and bucket color roundtrips passed; invalid color blocked');
 } finally {
  for (const table of ['brand_profiles','buckets','profiles']) assert.ifError((await admin.from(table).delete().eq('user_id',id)).error);
  assert.ifError((await admin.auth.admin.deleteUser(id)).error);
 }
}
