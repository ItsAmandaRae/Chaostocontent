import asyncio,json,base64,time,re
from datetime import datetime,timezone
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path('/tmp/browser/planner-reuse'); ROOT.mkdir(parents=True,exist_ok=True)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  context=await browser.new_context(viewport={'width':1280,'height':1800},timezone_id='America/Edmonton')
  page=await context.new_page(); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
  user={'id':'11111111-1111-4111-8111-111111111111','aud':'authenticated','role':'authenticated','email':'fixture@example.invalid','email_confirmed_at':'2026-01-01T00:00:00Z','app_metadata':{},'user_metadata':{},'created_at':'2026-01-01T00:00:00Z'}
  def enc(x):return base64.urlsafe_b64encode(json.dumps(x).encode()).decode().rstrip('=')
  token=enc({'alg':'HS256'})+'.'+enc({'sub':user['id'],'session_id':'fictional','exp':int(time.time())+3600})+'.fictional'
  session={'access_token':token,'refresh_token':'fictional','expires_in':3600,'token_type':'bearer','user':user}
  from zoneinfo import ZoneInfo;today=datetime.now(timezone.utc).astimezone(ZoneInfo('America/Edmonton')).strftime('%Y-%m-%d')
  colors=['pink','cyan','mint','yellow','lavender','peach','sky','lime','rose','periwinkle','apricot','silver']
  buckets=[{'id':f'b{i}','name':f'Bucket {c}','color':c,'user_id':user['id'],'created_at':today} for i,c in enumerate(colors)]
  posts=[{'id':f'p{i}','user_id':user['id'],'title':f'Long title {i} '+('many brilliant words '*30),'content':f'Original fixture wording {i}','variant':'reel_script','platform':'twitter','bucket_id':f'b{i}','scheduled_at':today+'T18:00:00Z','published_at':None,'status':'draft','external_url':None,'dump_id':None,'idea_id':None,'source_snapshot':'Original source preserved','voice_mode':'reference','reference_note':'My supplied stance','created_at':today,'deleted_at':None} for i in range(6)]
  calls=[]; fail=[False]; opened=[]
  async def auth(r):
   path=r.request.url.split('/auth/v1/')[1].split('?')[0]
   await r.fulfill(json=session if path=='token' else user)
  async def rest(r):
   path=r.request.url.split('/rest/v1/')[1].split('?')[0]; method=r.request.method
   if path=='rpc/my_access':return await r.fulfill(json={'plan':'Complimentary','paid':True,'admin':False,'billing_active':False,'creations_remaining':97,'creations':100,'media_remaining':99,'media_reads':100,'reset_at':'2026-11-01T00:00:00Z','expires_at':None})
   if path=='rpc/reuse_content':
    data=r.request.post_data_json;calls.append(('reuse',data));await asyncio.sleep(.3)
    src=next(x for x in posts if x['id']==data['p_post']);assert src['content']==data['p_expected_text']
    if data.get('p_copy_id'):
     result={**src,'id':data['p_copy_id'],'platform':data['p_platform'],'scheduled_at':None,'published_at':None,'external_url':None,'status':'draft'};posts.append(result)
    else:src['platform']=data['p_platform'];result=src
    return await r.fulfill(json=result)
   if path=='posts' and method=='PATCH':
    data=r.request.post_data_json; calls.append(('save',data));await asyncio.sleep(.2)
    if fail[0]:return await r.fulfill(status=503,json={'message':'Fixture offline','code':'offline'})
    from urllib.parse import urlparse,parse_qs
    ident=parse_qs(urlparse(r.request.url).query)['id'][0].replace('eq.','');src=next(x for x in posts if x['id']==ident);src.update(data)
    return await r.fulfill(json=[{'id':ident}])
   await r.fulfill(json=posts if path=='posts' else buckets if path=='buckets' else [])
  await page.route('**/auth/v1/**',auth);await page.route('**/rest/v1/**',rest)
  async def provider(r):
   errors.append('Unexpected provider request');await r.abort()
  await page.route('**/functions/v1/**',provider)
  await page.goto('http://localhost:8080/auth');await page.locator('#email').fill('fixture@example.invalid');await page.locator('#password').fill('FictionalPassword-1!');await page.get_by_role('button',name='Sign in',exact=True).click();await page.wait_for_url('**/dashboard')
  await page.goto('http://localhost:8080/dashboard/calendar');await page.get_by_text('All buckets shown together').wait_for();await page.get_by_role('button',name='Month',exact=True).click()
  for width in [1280,390,360]:
   await page.set_viewport_size({'width':width,'height':1800 if width==1280 else 900});await page.wait_for_timeout(1000);await page.screenshot(path=str(ROOT/f'planner-{width}.png'));assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   if width==1280:
    cell=page.locator(f'[data-planner-day="{today}"]');assert await cell.locator('button[title]').count()==3;assert (await cell.locator('button[title]').first.bounding_box())['height']==32;assert await cell.bounding_box() and (await cell.bounding_box())['height']==180
    await cell.get_by_role('button',name='+3 more',exact=True).click();await page.wait_for_timeout(1000);dialog=page.get_by_role('dialog');assert await dialog.locator('button[title]').count()==6;await dialog.locator('button[title]').last.scroll_into_view_if_needed();assert await dialog.locator('button[title]').last.is_visible();await dialog.locator('button[title]').first.scroll_into_view_if_needed();await page.screenshot(path=str(ROOT/f'overflow-{width}.png'));await dialog.get_by_role('button',name='Close',exact=True).click();await page.wait_for_timeout(1000)
   else:
    day=page.get_by_role('button',name=re.compile(r'6 planned'));assert await day.count()>=1;await day.first.click();await page.wait_for_timeout(500);section=page.locator('section[aria-label^="Content planned for"]');assert await section.locator('button[title]').count()==6;assert await section.get_by_role('button',name='Add content to this day').count()==1;await page.screenshot(path=str(ROOT/f'overflow-{width}.png'))
  await page.set_viewport_size({'width':1280,'height':1800});await page.reload();await page.get_by_text('All buckets shown together').wait_for();await page.get_by_role('button',name='Week',exact=True).click();await page.wait_for_timeout(1000);cell=page.locator(f'[data-planner-day="{today}"]');await cell.wait_for();assert (await cell.bounding_box())['height']==190;assert await cell.locator('button[title]').count()==3;await cell.get_by_role('button',name='+3 more').click();assert await page.get_by_role('dialog').locator('button[title]').count()==6;await page.get_by_role('dialog').get_by_role('button',name='Close',exact=True).click();await page.wait_for_timeout(1000);await cell.get_by_role('button',name='Select',exact=False).click();await page.get_by_role('button',name='Add content to this day').click();assert await page.get_by_role('dialog').locator('button').count()==7;await page.get_by_role('dialog').get_by_role('button',name='Close',exact=True).click();await page.wait_for_timeout(1000);await cell.locator('button[title]').first.click();await page.wait_for_url('**/dashboard/posts?open=p0');await page.locator('#post-p0 textarea').wait_for()
  card=page.locator('#post-p0');await card.get_by_role('textbox',name='Content wording').fill('Latest unsaved fixture text')
  await card.get_by_role('button',name='Change platform',exact=True).click();await page.get_by_role('dialog').locator('select').select_option('instagram');await page.get_by_role('button',name='Change destination',exact=True).click();await card.get_by_role('button',name='Copy & open Instagram',exact=True).wait_for();assert posts[0]['content']=='Latest unsaved fixture text';await page.evaluate('window.open=(url)=>{window.__opened=url};navigator.clipboard.writeText=async(text)=>{window.__copied=text}');await card.get_by_role('button',name='Copy & open Instagram',exact=True).click();assert await page.evaluate('window.__opened')=='https://www.instagram.com/';assert await page.evaluate('window.__copied')=='Latest unsaved fixture text'
  await card.get_by_role('textbox',name='Content wording').fill('Newest copy words');await card.get_by_role('button',name='Also use on…',exact=True).click();await page.get_by_role('dialog').locator('select').select_option('tiktok');await page.get_by_role('button',name='Make editable copy',exact=True).dblclick();await page.wait_for_timeout(1200)
  assert len([c for c in calls if c[0]=='reuse' and c[1].get('p_copy_id')])==1
  copy=posts[-1];assert copy['content']=='Newest copy words' and copy['scheduled_at'] is None and copy['source_snapshot']=='Original source preserved';assert posts[0]['platform']=='instagram'
  card=page.locator('#post-p0');fail[0]=True;await card.get_by_role('textbox',name='Content wording').fill('Unsaved failure must not copy');before=len([x for x in calls if x[0]=='reuse']);await card.get_by_role('button',name='Also use on…',exact=True).click();await page.get_by_role('button',name='Make editable copy',exact=True).click();await page.get_by_role('alert').filter(has_text="Couldn't save your latest wording").wait_for();await page.wait_for_timeout(1000);assert len([x for x in calls if x[0]=='reuse'])==before;await page.screenshot(path=str(ROOT/'failed-save.png'));fail[0]=False;await page.get_by_role('dialog').get_by_role('button',name='Close',exact=True).click()
  await page.goto('http://localhost:8080/dashboard/settings');await page.get_by_text('Next reset:').wait_for();assert '11/1/2026' in await page.get_by_text('Next reset:').inner_text()
  for path in ['/','/auth','/demo/calendar','/demo/posts']:
   for width in [1280,360]:
    await page.set_viewport_size({'width':width,'height':1800 if width==1280 else 900});await page.goto('http://localhost:8080'+path);await page.wait_for_timeout(800);await page.screenshot(path=str(ROOT/f'{path.replace("/","_") or "landing"}-{width}.png'));overflow=await page.evaluate('document.documentElement.scrollWidth-innerWidth');print('PUBLIC CHECK',path,width,'overflow',overflow);assert overflow==0;
  assert not errors,errors
  print('PASS MOCKED signed-in planner: all buckets, desktop 32px bars 180px month 190px week with overflow dialog; mobile month/week seven-column with colored bars, selected-day panel with all six records and add action at 390/360; item opens editor without chooser; destination reflects immediately; unsaved text flushed; rapid copy once; failed save blocks copy; Edmonton UTC reset Nov1; no horizontal overflow incl. landing 360. All external endpoints mocked; no provider calls.')
  await browser.close()
asyncio.run(main())
