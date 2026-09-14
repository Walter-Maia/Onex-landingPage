const {test,expect}=require('@playwright/test');
const keys=['onexcloud','vps','dedicado','colocation','telefonia','email'];

test('abertura sem movimento comeca no hero sem roubar foco',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('./');await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(250);
  expect(await page.evaluate(()=>scrollY)).toBeLessThan(5);
  expect(await page.evaluate(()=>document.activeElement.getAttribute('role'))).not.toBe('tab');
});

test('seis tabs, teclado, paineis e CTA correspondente',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('./#solucoes');
  const tabs=page.getByRole('tab');await expect(tabs).toHaveCount(6);
  for(let i=0;i<keys.length;i++){
    await tabs.nth(i).click();await expect(tabs.nth(i)).toHaveAttribute('aria-selected','true');
    await expect(page.getByRole('tab',{selected:true})).toHaveCount(1);
    await expect(page.getByRole('tabpanel')).toHaveCount(1);
    const panel=page.locator('#produto-'+keys[i]);await expect(panel).toBeVisible();
    await expect(panel.locator('a[data-wa="'+keys[i]+'"]')).toBeVisible();
    expect(await panel.locator('a[data-wa]').getAttribute('href')).toContain('phone=553140404888');
  }
  await tabs.first().focus();await page.keyboard.press('ArrowDown');
  await expect(tabs.nth(1)).toBeFocused();await expect(tabs.nth(1)).toHaveAttribute('aria-selected','true');
  await page.keyboard.press('End');await expect(tabs.last()).toBeFocused();
  await page.keyboard.press('Home');await expect(tabs.first()).toBeFocused();
  await tabs.last().click();
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator('#produto-email')).toHaveAttribute('open','');
  await page.setViewportSize({width:1440,height:900});
  await expect(page.locator('#tab-email')).toHaveAttribute('aria-selected','true');
});

test('accordions mobile abrem cada produto e CTA cabe na tela',async({page,isMobile})=>{
  await page.setViewportSize({width:320,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('./#solucoes');
  for(const key of keys){
    const product=page.locator('#produto-'+key);const summary=product.locator('summary');
    if(!await product.evaluate(el=>el.open)) {if(isMobile)await summary.tap();else await summary.click();}
    await expect(product).toHaveAttribute('open','');
    const cta=product.locator('a[data-wa="'+key+'"]');await expect(cta).toBeVisible();
    const r=await cta.boundingBox();expect(r.x).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(321);
    await summary.focus();await page.keyboard.press('Enter');await expect(product).not.toHaveAttribute('open','');
  }
});

test('link direto abre produto correto em desktop e mobile',async({page})=>{
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('./#produto-email');
    const product=page.locator('#produto-email');await expect(product).toHaveAttribute('open','');
    await expect(product.locator('a[data-wa="email"]')).toBeVisible();
  }
});
