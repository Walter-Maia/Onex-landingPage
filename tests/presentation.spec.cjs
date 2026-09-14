const {test, expect} = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const products = ['OneXcloud','VPS','Servidor dedicado','Colocation','Telefonia','Email profissional'];
const normalize = s => s.replace(/\s+/g,' ').trim();

async function openSite(page, suffix = '') {
  await page.goto('./' + suffix);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('h1')).toBeVisible();
}
async function scrollThrough(page) {
  await page.evaluate(async()=>{
    const wait = ms => new Promise(r=>setTimeout(r,ms));
    for(let y=0;y<document.documentElement.scrollHeight;y+=Math.max(300,innerHeight*.8)) {
      scrollTo({top:y,behavior:'instant'});await wait(45);
    }
    scrollTo({top:0,behavior:'instant'});
  });
  await page.waitForTimeout(550);
}
async function overflow(page) {
  return page.evaluate(()=>{
    const width = document.documentElement.clientWidth;
    return [...document.querySelectorAll('main h1,main h2,main h3,main p,main a,main button,main summary,main img,header nav,footer a')].filter(el=>{
      if(el.closest('[hidden]')) return false;
      const closed=el.closest('details:not([open])');
      if(closed && !el.closest('summary')) return false;
      const r=el.getBoundingClientRect(),s=getComputedStyle(el);
      if(!r.width || !r.height || s.visibility==='hidden' || s.display==='none') return false;
      return r.left < -1 || r.right > width+1;
    }).map(el=>({tag:el.tagName,text:el.textContent.trim().slice(0,65),left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,width}));
  });
}

test('conteudo comercial, assets locais e ausencia de erros', async({page})=>{
  const errors=[], badAssets=[], external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1') && r.status()>=400)badAssets.push(`${r.status()} ${r.url()}`);});
  await page.route('**/*',route=>{
    const u=route.request().url();
    if(/^https?:/.test(u) && !u.startsWith('http://127.0.0.1:4173/')) {external.push(u);return route.abort();}
    return route.continue();
  });
  await page.emulateMedia({reducedMotion:'reduce'});
  await openSite(page);
  await scrollThrough(page);
  expect(normalize(await page.locator('h1').innerText())).toMatch(/^Conectamos hoje e protegemos o amanhã[.!]?$/);
  await expect(page.locator('h1')).toHaveCount(1);
  const text=await page.locator('body').innerText();
  expect(text).not.toMatch(/demonstração|enviar prévia|prévia concluída|nenhuma informação foi enviada|protótipo/i);
  for(const product of products) expect(text).toContain(product);
  const images=await page.locator('img').evaluateAll(imgs=>imgs.map(i=>({src:i.src,ok:i.complete&&i.naturalWidth>0})));
  expect(images.filter(i=>!i.ok)).toEqual([]);
  const anchors=await page.locator('a[href^="#"]').evaluateAll(links=>links.filter(a=>a.hash.length>1&&!document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a=>a.href));
  expect(anchors).toEqual([]);
  expect(badAssets).toEqual([]);expect(errors).toEqual([]);expect(external).toEqual([]);
});

test('responsividade em larguras intermediarias e paisagem',async({page},info)=>{
  test.setTimeout(180000);
  await page.emulateMedia({reducedMotion:'reduce'});
  await openSite(page);await scrollThrough(page);
  const widths=info.project.name.startsWith('mobile') ? [320,360,390,430,768,844] : [320,360,390,430,600,767,768,860,900,1024,1280,1440,1920,2560];
  for(const width of widths){
    const height=width===844?390:width<768?844:900;
    await page.setViewportSize({width,height});
    await page.waitForTimeout(70);
    expect(await overflow(page),`Conteudo cortado em ${width}x${height}`).toEqual([]);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
  if(info.project.name==='chromium'){
    for(let width=337;width<=2530;width+=47){
      await page.setViewportSize({width,height:900});
      expect(await overflow(page),`Conteudo cortado em largura ${width}`).toEqual([]);
    }
  }
});

test('intro completa, pular, replay e foco',async({page})=>{
  await openSite(page);
  await expect(page.locator('#intro')).toBeHidden({timeout:9000});
  await expect(page.locator('main')).not.toHaveAttribute('inert','');
  await scrollThrough(page);
  const replay=page.locator('#btn-replay');
  await replay.scrollIntoViewIfNeeded();
  const y=await page.evaluate(()=>scrollY);
  await replay.click();
  await expect(page.locator('#intro')).toBeVisible();
  await expect(page.getByRole('button', {name:/Pular intro/i})).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#intro')).toBeHidden();
  await expect(replay).toBeFocused();
  expect(Math.abs((await page.evaluate(()=>scrollY))-y)).toBeLessThan(3);
  await replay.click();
  await expect(page.locator('#intro')).toBeHidden({timeout:9000});
  await expect(replay).toBeFocused();
  expect(Math.abs((await page.evaluate(()=>scrollY))-y)).toBeLessThan(3);
  await page.reload();await expect(page.locator('#intro')).toBeHidden();
});

test('menu mobile e ancoras',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await openSite(page);
  const toggle=page.locator('.nav-toggle');
  await toggle.click();await expect(toggle).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('Escape');await expect(toggle).toHaveAttribute('aria-expanded','false');
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.locator('header nav a.nav__link[href="#contato"]').click();
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await expect(page).toHaveURL(/#contato$/);
  await expect(page.locator('#contato')).toBeInViewport();
});

test('sem JavaScript: conteudo e contato continuam disponiveis',async({browser},info)=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const page=await context.newPage();
  await page.goto(info.project.use.baseURL || 'http://127.0.0.1:4173/Onex-landingPage/');
  await expect(page.locator('h1')).toBeVisible();await expect(page.locator('#intro')).toBeHidden();
  const text=await page.locator('body').innerText();
  for(const product of products)expect(text).toContain(product);
  await expect(page.locator('a[href^="tel:"]').first()).toHaveAttribute('href','tel:+553140404888');
  await expect(page.locator('a[href^="mailto:"]').first()).toHaveAttribute('href','mailto:contato@onexdatacenter.com.br');
  expect(await overflow(page)).toEqual([]);
  await context.close();
});

test('contraste e estrutura acessivel',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await openSite(page);await scrollThrough(page);
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(results.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
});

test('contatos usam canais oficiais e preservam produto ou cidade',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await openSite(page);
  const links=await page.locator('a[href*="api.whatsapp.com"]').evaluateAll(els=>els.map(a=>({href:a.href,key:a.getAttribute('data-wa')||a.getAttribute('data-interest')||'',text:a.textContent.trim()})));
  expect(links.length).toBeGreaterThan(5);
  for(const link of links){
    const url=new URL(link.href);
    expect(url.protocol).toBe('https:');expect(url.hostname).toBe('api.whatsapp.com');
    expect(url.searchParams.get('phone')).toBe('553140404888');
    if(link.key==='visita-ipatinga')expect(url.searchParams.get('text')).toMatch(/Ipatinga/);
    if(link.key==='visita-bh')expect(url.searchParams.get('text')).toMatch(/Belo Horizonte/);
  }
  expect(await page.locator('form').count()).toBe(0);
});

test('pacote abre por arquivo local sem dependencia de rede',async({browser,browserName})=>{
  const path=require('node:path');const {pathToFileURL}=require('node:url');
  // WebKit on Windows rejects file navigation with its offline flag; block HTTP instead.
  const context=await browser.newContext({reducedMotion:'reduce',offline:browserName!=='webkit'});
  const network=[];
  await context.route(/^https?:\/\//,route=>{network.push(route.request().url());return route.abort();});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve('dist/index.html')).href);
  await expect(page.locator('h1')).toBeVisible();
  await scrollThrough(page);
  expect(await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src))).toEqual([]);
  expect(errors).toEqual([]);
  expect(network).toEqual([]);
  await context.close();
});
