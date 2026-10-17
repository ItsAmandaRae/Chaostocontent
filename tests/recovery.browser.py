import asyncio,json,base64,time
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path('/tmp/browser/recovery')
def token():
 def enc(x):return base64.urlsafe_b64encode(json.dumps(x).encode()).decode().rstrip('=')
 return enc({'alg':'HS256'})+'.'+enc({'sub':'11111111-1111-4111-8111-111111111111','session_id':'fictional-recovery','exp':int(time.time())+3600})+'.fictional'
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  context=await browser.new_context(viewport={'width':1280,'height':1800})
  page=await context.new_page(); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
  user={'id':'11111111-1111-4111-8111-111111111111','aud':'authenticated','role':'authenticated','email':'fictional@example.invalid','app_metadata':{},'user_metadata':{},'created_at':'2026-01-01T00:00:00Z'}
  access=token(); session={'access_token':access,'refresh_token':'fictional-refresh','expires_in':3600,'token_type':'bearer','user':user}
  updates=[]; recovery_requests=[]; signups=[]; fail_update=[True]
  async def route(r):
   path=r.request.url.split('/auth/v1/')[1].split('?')[0]
   if path=='user' and r.request.method=='PUT':
    
    if fail_update[0]:
     fail_update[0]=False;await r.fulfill(status=422,json={'msg':'Choose a different password','code':'weak_password'})
    else:updates.append(r.request.post_data_json); await r.fulfill(json=user)
   elif path=='user':await r.fulfill(json=user)
   elif path=='logout':await r.fulfill(status=204)
   elif path=='recover':recovery_requests.append(r.request.post_data_json);await r.fulfill(json={})
   elif path=='signup':signups.append(r.request.post_data_json);await r.fulfill(json=user)
   elif path=='token':await r.fulfill(json=session)
   else:await r.fulfill(json={})
  await page.route('**/auth/v1/**',route)
  await page.goto('http://localhost:8080/reset-password')
  await page.get_by_role('link',name='Request a fresh link').wait_for()
  assert await page.locator('#new-password').count()==0 and not updates
  await page.screenshot(path=str(OUT/'missing-desktop.png'))
  await page.goto('http://localhost:8080/auth#error=access_denied&error_code=otp_expired&error_description=Expired')
  await page.get_by_role('link',name='Request a fresh link').wait_for()
  assert '#' not in page.url and not updates
  await page.goto('http://localhost:8080/auth#access_token='+access+'&refresh_token=fictional-refresh&expires_in=3600&token_type=bearer&type=recovery')
  await page.reload(); await page.locator('#new-password').wait_for(); assert '#' not in page.url
  await page.reload();await page.locator('#new-password').wait_for()
  await page.locator('#new-password').fill('LongFixturePassword-1!')
  await page.locator('#confirm-password').fill('mismatch')
  await page.get_by_role('button',name='Save new password').click()
  await page.get_by_role('alert').filter(has_text='do not match').wait_for();assert not updates
  await page.locator('#confirm-password').fill('LongFixturePassword-1!')
  await page.get_by_role('button',name='Show passwords').click();assert await page.locator('#new-password').get_attribute('type')=='text'
  await page.screenshot(path=str(OUT/'valid-desktop.png'))
  await page.get_by_role('button',name='Save new password').click()
  await page.get_by_role('alert').filter(has_text='Choose a different password').wait_for();assert not updates
  await page.get_by_role('button',name='Save new password').click()
  await page.get_by_role('link',name='Back to sign in').wait_for()
  print('update request keys:',[list(x) for x in updates]); assert len(updates)==1 and 'password' in updates[0] and 'current_password' not in updates[0]
  await page.get_by_role('link',name='Back to sign in').click()
  await page.locator('#email').wait_for()
  await page.locator('#email').fill('fictional@example.invalid');await page.locator('#password').fill('LongFixturePassword-1!');await page.get_by_role('button',name='Sign in',exact=True).click();await page.wait_for_url('**/dashboard')
  await page.goto('http://localhost:8080/reset-password');await page.get_by_role('link',name='Request a fresh link').wait_for();assert await page.locator('#new-password').count()==0 and len(updates)==1
  await page.get_by_role('link',name='Request a fresh link').click()
  await page.locator('#email').fill('fictional@example.invalid');assert not recovery_requests
  await page.get_by_role('button',name='Send reset link').click()
  await page.get_by_role('status').filter(has_text='If an account matches').wait_for()
  assert len(recovery_requests)==1 and recovery_requests[0].get('email')=='fictional@example.invalid'
  await page.screenshot(path=str(OUT/'email-state.png'))
  await page.evaluate('localStorage.clear()');await page.goto('http://localhost:8080/auth?mode=signup');await page.locator('#email').fill('fictional@example.invalid');await page.locator('#password').fill('LongFixturePassword-1!');await page.get_by_role('button',name='Create account').click();await page.get_by_role('status').filter(has_text='confirm your account').wait_for();assert len(signups)==1
  await page.set_viewport_size({'width':360,'height':800})
  await page.goto('http://localhost:8080/reset-password');await page.get_by_role('link',name='Request a fresh link').wait_for();await page.screenshot(path=str(OUT/'missing-mobile.png'))
  assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  await page.goto('http://localhost:8080/auth#access_token='+access+'&refresh_token=fictional-refresh&expires_in=3600&token_type=bearer&type=recovery');await page.reload();await page.locator('#new-password').wait_for();await page.wait_for_timeout(800);await page.screenshot(path=str(OUT/'valid-mobile.png'));assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  assert not errors,errors
  print('PASS browser MOCKS: legacy recovery, SDK token cleanup, refresh, validation, visibility, password-only update, local signout, missing/expired links, forgot explicit request/check-email, signup confirmation, desktop/mobile. No live email or account changes.')
  await browser.close()
asyncio.run(main())
