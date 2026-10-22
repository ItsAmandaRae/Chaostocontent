import asyncio,os,uuid,requests
from playwright.async_api import async_playwright
env=dict(l.strip().split("=",1) for l in open("/dev-server/.env") if "=" in l)
U=env["VITE_SUPABASE_URL"].strip('"'); SK=os.environ["SUPABASE_SERVICE_ROLE_KEY"]; H={"apikey":SK,"Authorization":f"Bearer {SK}","Content-Type":"application/json"}
email=f"mic-fixture-{uuid.uuid4().hex[:8]}@example.invalid"; pw="Fx-"+uuid.uuid4().hex+"Aa1!"
uid=requests.post(f"{U}/auth/v1/admin/users",headers=H,json={"email":email,"password":pw,"email_confirm":True}).json()["id"]
MOCK="""
window.__m={tracksStopped:0,granted:0,live:0};window.__delay=0;
navigator.mediaDevices.getUserMedia=async()=>{await new Promise(r=>setTimeout(r,window.__delay));window.__m.granted++;window.__m.live++;
 const t={stop(){if(!this.s){this.s=1;window.__m.tracksStopped++;window.__m.live--}}};return {getTracks:()=>[t]}};
window.MediaRecorder=class{constructor(s){this.state='inactive';this.mimeType='audio/webm'}start(){this.state='recording'}
 stop(){this.state='inactive';setTimeout(()=>{this.ondataavailable&&this.ondataavailable({data:new Blob(['x'])});this.onstop&&this.onstop()},50)}};
"""
res={}
async def main():
 try:
  async with async_playwright() as p:
   b=await p.chromium.launch(headless=True); c=await b.new_context(viewport={"width":1280,"height":1800}); pg=await c.new_page()
   await pg.add_init_script(MOCK)
   await pg.route("**/functions/v1/process-dump",lambda r:r.fulfill(status=200,content_type="application/json",body='{"title":"t"}'))
   await pg.goto("http://localhost:8080/auth"); await pg.fill("input[type=email]",email); await pg.fill("input[type=password]",pw)
   await pg.get_by_role("button",name="Sign in").last.click(); await pg.wait_for_url("**/dashboard**")
   side=pg.locator("aside button").filter(has_text="Dump it").first
   m=lambda: pg.evaluate("window.__m")
   # 1 close while recording
   await side.click(); await pg.get_by_role("button",name="Voice").click(); await pg.get_by_role("button",name="Start recording").click(); await pg.wait_for_timeout(1200)
   await pg.keyboard.press("Escape"); await pg.wait_for_timeout(400); res["close_while_recording"]=await m()
   await side.click(); await pg.wait_for_timeout(300); res["reopen_has_stale_file"]=await pg.get_by_text("Ready: voice-note").count()
   # 2 switch tab
   await pg.get_by_role("button",name="Voice").click(); await pg.get_by_role("button",name="Start recording").click(); await pg.wait_for_timeout(300)
   await pg.get_by_role("button",name="Note").click(); await pg.wait_for_timeout(300); res["tab_switch"]=await m()
   await pg.keyboard.press("Escape")
   # 3 permission resolves after close
   await pg.evaluate("window.__delay=800"); await side.click(); await pg.get_by_role("button",name="Voice").click(); await pg.get_by_role("button",name="Start recording").click()
   await pg.keyboard.press("Escape"); await pg.wait_for_timeout(1200); res["late_permission"]=await m()
   # 4 navigate away while recording (unmount)
   await pg.evaluate("window.__delay=0"); await pg.get_by_role("button",name="Dump it").nth(1).click()
   await pg.get_by_role("button",name="Voice").click(); await pg.get_by_role("button",name="Start recording").click(); await pg.wait_for_timeout(300)
   await pg.evaluate("history.pushState({},'','/dashboard/posts');dispatchEvent(new PopStateEvent('popstate'))"); await pg.wait_for_timeout(800); res["navigate_away"]=await m()
   await pg.keyboard.press("Escape")
   # 5 explicit stop then save from sidebar -> navigates once
   await side.click(); await pg.get_by_role("button",name="Voice").click(); await pg.get_by_role("button",name="Start recording").click(); await pg.wait_for_timeout(1100)
   await pg.get_by_role("button",name="Stop").click(); await pg.wait_for_timeout(300)
   res["stopped_ready"]=await pg.get_by_text("Ready: voice-note").count()
   navs=[]; pg.on("framenavigated",lambda f: navs.append(f.url))
   await pg.locator("[role=dialog] button").filter(has_text="Dump it").last.click(); await pg.wait_for_timeout(3500)
   res["url_after_save"]=pg.url
   # text save from sidebar too
   await side.click(); await pg.get_by_role("button",name="Note").click(); await pg.fill("textarea","Sidebar text"); 
   await pg.locator("[role=dialog] button").filter(has_text="Dump it").last.click(); await pg.wait_for_timeout(3000)
   hist=await pg.evaluate("history.length"); res["text_url"]=pg.url; res["history_len"]=hist
   res["audio_rows"]=len(requests.get(f"{U}/rest/v1/dumps?user_id=eq.{uid}&kind=eq.audio&select=id",headers=H).json())
   await b.close()
 finally:
  for o in requests.get(f"{U}/storage/v1/object/list/dumps",headers=H,json={"prefix":uid}).json() if False else []: pass
  requests.delete(f"{U}/auth/v1/admin/users/{uid}",headers=H)
  for k,v in res.items(): print(k,v)
asyncio.run(main())
