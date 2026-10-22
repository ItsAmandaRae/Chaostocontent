"""Isolated browser regressions. Every auth/data request is intercepted; no email or account writes."""
import asyncio, base64, json, time
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path('/tmp/browser/auth-repair')
OUT.mkdir(parents=True, exist_ok=True)

async def main():
 async with async_playwright() as p:
  browser = await p.chromium.launch(headless=True)
  context = await browser.new_context(viewport={'width':1280,'height':1800})
  page = await context.new_page()
  user = {'id':'11111111-1111-4111-8111-111111111111','email':'fixture@example.invalid','email_confirmed_at':'2026-01-01T00:00:00Z','aud':'authenticated','role':'authenticated','app_metadata':{},'user_metadata':{},'created_at':'2026-01-01T00:00:00Z'}
  def enc(value): return base64.urlsafe_b64encode(json.dumps(value).encode()).decode().rstrip('=')
  access = enc({'alg':'HS256'})+'.'+enc({'sub':user['id'],'session_id':'fixture-session','exp':int(time.time())+3600})+'.fixture'
  session = {'access_token':access,'refresh_token':'fixture-refresh','expires_in':3600,'token_type':'bearer','user':user}
  calls = []; delay = [0]; fail_login = [True]; fail_reset = [True]
  errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
  async def route(r):
   path = r.request.url.split('/auth/v1/')[1].split('?')[0]
   calls.append((path,r.request.method,r.request.post_data_json if r.request.method == 'POST' else None,r.request.url))
   if path == 'user':
    await asyncio.sleep(delay[0]); await r.fulfill(json=user)
   elif path == 'token':
    await r.fulfill(status=400 if fail_login[0] else 200,json={'message':'Invalid login credentials'} if fail_login[0] else session)
   elif path == 'recover':
    await r.fulfill(status=429 if fail_reset[0] else 200,json={'message':'Too many requests'} if fail_reset[0] else {})
   elif path == 'logout': await r.fulfill(status=204)
   else: await r.fulfill(json={})
  await page.route('**/auth/v1/**',route)
  await page.route('**/rest/v1/**',lambda r:r.fulfill(json=[]))
  await page.route('**/functions/v1/**',lambda r:r.fulfill(json={}))
  # Reproduce both previously sticky error states, then leave and sign in normally.
  for callback in ['#error=access_denied&error_description=Expired','#type=signup&error=access_denied&error_description=Expired']:
   await page.goto('http://localhost:8080/auth'+callback)
   await page.get_by_role('alert').wait_for()
   await page.get_by_role('link').first.click(); await page.wait_for_url('http://localhost:8080/')
   await page.goto('http://localhost:8080/auth?mode=login')
   await page.locator('#email').fill('  fixture@example.invalid  ')
   await page.locator('#password').fill('FixturePassword-1!')
   await page.get_by_role('button',name='Sign in',exact=True).click()
   await page.get_by_text('Email or password not recognised.',exact=False).wait_for()
   assert calls[-1][2]['email'] == 'fixture@example.invalid'
  # Forgot requests need no old password, are explicit, normalize email, and show persistent errors.
  await page.get_by_role('button',name='Set or reset password',exact=True).click()
  assert await page.locator('#password').count() == 0
  assert not [c for c in calls if c[0] == 'recover']
  await page.locator('#email').fill('  fixture@example.invalid  ')
  await page.get_by_role('button',name='Send reset link').click()
  await page.get_by_text('Too many requests. Please wait',exact=False).wait_for()
  fail_reset[0] = False
  await page.get_by_role('button',name='Send reset link').click()
  await page.get_by_role('status').filter(has_text='If an account matches').wait_for()
  reset = [c for c in calls if c[0] == 'recover']
  assert len(reset) == 2 and all(c[2]['email'] == 'fixture@example.invalid' for c in reset)
  assert all('redirect_to=http%3A%2F%2Flocalhost%3A8080%2Freset-password' in c[3] for c in reset)
  await page.get_by_role('button',name='Back to sign in').click()
  await page.locator('#password').wait_for()
  # No reload workaround: slow server validation must not race the initialization fallback.
  delay[0] = .25
  await page.goto('http://localhost:8080/auth#access_token='+access+'&refresh_token=fixture-refresh&expires_in=3600&token_type=bearer&type=recovery')
  await page.locator('#new-password').wait_for()
  assert await page.evaluate("sessionStorage.getItem('ctc-password-recovery') !== null")
  await page.screenshot(path=str(OUT/'ready-without-reload.png'))
  # In-flight recovery and confirmation validation cannot restore state after leaving.
  for kind in ['recovery','signup']:
   await page.goto('http://localhost:8080/auth#access_token='+access+'&refresh_token=fixture-refresh&expires_in=3600&token_type=bearer&type='+kind)
   await page.get_by_role('link').first.click(); await page.wait_for_url('http://localhost:8080/')
   await page.wait_for_timeout(800)
   assert page.url == 'http://localhost:8080/'
   assert await page.evaluate("sessionStorage.getItem('ctc-password-recovery') === null")
  # An ordinary sign-in invalidates a previous marker and does not authorize reset.
  delay[0] = 0; fail_login[0] = False
  await page.goto('http://localhost:8080/auth?mode=login')
  await page.evaluate("sessionStorage.setItem('ctc-password-recovery', JSON.stringify({userId:'fixture',sessionId:'old',expiresAt:Date.now()+100000}))")
  await page.evaluate("localStorage.clear()")
  await page.reload(); await page.get_by_role('link',name='Request a fresh link').wait_for()
  await page.get_by_role('link',name='Request a fresh link').click()
  await page.get_by_role('button',name='Sign in',exact=True).click()
  await page.locator('#email').fill('fixture@example.invalid'); await page.locator('#password').fill('FixturePassword-1!')
  await page.get_by_role('button',name='Sign in',exact=True).click(); await page.wait_for_url('**/dashboard')
  await page.goto('http://localhost:8080/reset-password')
  await page.get_by_role('link',name='Request a fresh link').wait_for()
  assert await page.locator('#new-password').count() == 0
  assert not [c for c in calls if c[0] == 'user' and c[1] == 'PUT']
  assert not errors, errors
  print('PASS MOCKS: expired-link departure, normalized requests, persistent login/reset errors, exact redirect, no old password, recovery without reload under slow validation, abandoned callback races, ordinary-session denial. No real auth writes.')
  await browser.close()

asyncio.run(main())