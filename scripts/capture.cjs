// Capture the built site by normal scrolling, without overriding reveal styles.
const {chromium} = require('@playwright/test');
const fs=require('node:fs');const path=require('node:path');
const {spawn}=require('node:child_process');
const out=path.resolve('docs/final-presentation');fs.mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,[path.join(__dirname,'serve.cjs')],{env:{...process.env,PORT:'4175',SITE_DIR:'dist'},windowsHide:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let browser;
 try {
  for(let i=0;i<30;i++){try{if((await fetch('http://127.0.0.1:4175/')).ok)break;}catch{}await delay(100);}
  browser=await chromium.launch();
  for(const [width,height] of [[1440,900],[390,844],[768,1024],[1920,1080],[320,740]]){
    const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
    const page=await context.newPage();await page.goto('http://127.0.0.1:4175/Onex-landingPage/');
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=innerHeight*.75){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,60));}scrollTo({top:0,behavior:'instant'});});
    await page.waitForTimeout(400);
    await page.screenshot({path:path.join(out,`hero-${width}.png`)});
    await page.screenshot({path:path.join(out,`full-${width}.png`),fullPage:true});
    await context.close();
  }
  for(const [width,height] of [[1440,900],[390,844]]){
    const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:out,size:{width,height}}});
    const page=await context.newPage();await page.goto('http://127.0.0.1:4175/Onex-landingPage/');
    await page.waitForTimeout(6500);
    const tabs=page.getByRole('tab');
    for(let i=0;i<await tabs.count();i++){await tabs.nth(i).click();await page.waitForTimeout(700);}
    const summaries=page.locator('#solucoes summary');
    if(!await tabs.count())for(let i=0;i<await summaries.count();i++){await summaries.nth(i).click();await page.waitForTimeout(700);}
    await context.close();await page.video().saveAs(path.join(out,`intro-products-${width}.webm`));
  }
  console.log(out);
 } finally {if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
