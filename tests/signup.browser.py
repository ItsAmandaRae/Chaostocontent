import asyncio, json, base64, time
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  context=await browser.new_context(viewport={'width':1280,'height':1800})
  page=await context.new_page(); errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  user={'id':'11111111-1111-4111-8111-111111111111','aud':'authenticated','role':'authenticated','email':'fictional@example.invalid','email_confirmed_at':'2026-01-01T00:00:00Z','app_metadata':{},'user_metadata':{},'created_at':'2026-01-01T00:00:00Z'}
  calls=[];fail=[False]; signed=[False]
  async def route(r):
   path=r.request.url.split('/auth/v1/')[1].split('?')[0]; calls.append((path,r.request.method))
   if path=='signup':await r.fulfill(json=user)
   elif path=='resend':
    assert r.request.post_data_json['type']=='signup'
    await asyncio.sleep(.4)
    await r.fulfill(status=429 if fail[0] else 200,json={'msg':'Rate limited','code':'over_email_send_rate_limit'} if fail[0] else {})
   elif path=='user':await r.fulfill(json=user)
   else:await r.fulfill(json={})
  await page.route('**/auth/v1/**',route)
  # Do not let any fixture navigate through real data endpoints.
  await page.route('**/rest/v1/**',lambda r:r.fulfill(json=[]))
  await page.route('**/functions/v1/**',lambda r:r.fulfill(json={}))
  await page.goto('http://localhost:8080/auth?mode=signup')
  await page.locator('#email').fill('fictional@example.invalid');await page.locator('#password').fill('LongFixturePassword-1!')
  await page.get_by_role('button',name='Create account').click()
  await page.get_by_role('status').filter(has_text='verify your account').wait_for()
  assert '/auth' in page.url and not [x for x in calls if x[0]=='resend']
  await page.reload();await page.get_by_role('status').filter(has_text='verify your account').wait_for()
  assert await page.get_by_role('button',name='Resend confirmation').is_disabled()
  await page.wait_for_timeout(1000);await page.screenshot(path='/tmp/browser/signup/desktop.png')
  await page.clock.install();await page.clock.fast_forward(61000)
  await page.get_by_role('button',name='Resend confirmation',exact=True).click()
  assert await page.get_by_role('button',name='Requesting…').is_disabled()
  await page.get_by_role('status').filter(has_text='new confirmation email has been requested').wait_for()
  assert len([x for x in calls if x[0]=='resend'])==1
  await page.clock.fast_forward(61000);fail[0]=True
  await page.get_by_role('button',name='Resend confirmation',exact=True).click();await page.get_by_role('alert').filter(has_text='Too many requests').wait_for()
  assert len([x for x in calls if x[0]=='resend'])==2
  await page.set_viewport_size({'width':360,'height':800});await page.screenshot(path='/tmp/browser/signup/mobile.png')
  assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  await page.get_by_role('button',name='Edit email',exact=True).click();await page.locator('#email').wait_for();assert await page.locator('#email').input_value()=='fictional@example.invalid'
  await page.locator('#password').fill('LongFixturePassword-1!');await page.get_by_role('button',name='Create account').click();await page.get_by_role('button',name='Back to sign in',exact=True).click();await page.locator('#password').wait_for()
  def enc(x):return base64.urlsafe_b64encode(json.dumps(x).encode()).decode().rstrip('=')
  token=enc({'alg':'HS256'})+'.'+enc({'sub':user['id'],'session_id':'signup-fixture','exp':int(time.time())+3600})+'.fictional'
  await page.goto('http://localhost:8080/#access_token='+token+'&refresh_token=fictional&expires_in=3600&token_type=bearer&type=signup')
  await page.wait_for_timeout(1500);print('confirmation page:',page.url,await page.locator('body').inner_text());await page.get_by_role('button',name='Continue',exact=True).wait_for();assert await page.locator('#new-password').count()==0
  assert '#' not in page.url
  await page.wait_for_timeout(1000);await page.screenshot(path='/tmp/browser/signup/confirmed-mobile.png')
  await page.get_by_role('button',name='Continue',exact=True).click();await page.wait_for_url('**/dashboard')
  await page.goto('http://localhost:8080/auth#type=signup&error=access_denied&error_description=Expired')
  await page.get_by_role('alert').filter(has_text='confirmation link').wait_for();assert await page.locator('#new-password').count()==0
  assert not errors,errors
  print('PASS MOCKS: no-session signup persistence/reload; no automatic resend; cooldown/inflight; resend success/429; edit/back; SDK signup callback validated and Continue dashboard; expired confirmation never reset; 1280/360 no overflow. No live emails/password changes.')
  await browser.close()
asyncio.run(main())
