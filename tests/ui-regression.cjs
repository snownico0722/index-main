// No application dependency: npm install --no-save --package-lock=false playwright@1.55.1
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const playwright = require('playwright');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:8080';
const results = [];
fs.mkdirSync('test-results', { recursive: true });
const pause = page => page.waitForTimeout(200);
const skins = ['glass', 'liquid', 'acrylic', 'mica', 'paper', 'obsidian', 'neon', 'pixel', 'plain'];

async function run(browser, name, fn, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
  const page = await context.newPage();
  page.setDefaultTimeout(6000);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    return ['127.0.0.1', 'localhost'].includes(url.hostname) || ['file:', 'data:', 'blob:'].includes(url.protocol)
      ? route.continue() : route.abort();
  });
  try {
    await fn(page, context);
    assert.deepEqual(errors, [], 'No uncaught page errors');
    results.push({ name, pass: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, pass: false, error: error.message, errors });
    console.error(`FAIL ${name}: ${error.message}`);
    await page.screenshot({ path: `test-results/failure-${name.replace(/[^a-z0-9-]/gi, '-')}.png` }).catch(() => {});
  } finally { await context.close(); }
}
const go = (page, file = 'index.html') => page.goto(`${base}/${file}`);
async function preferences(page, values) {
  if (!await page.locator('.preference-panel').isVisible()) await page.locator('.preference-toggle').click();
  for (const [group, value] of Object.entries(values)) {
    await page.locator(`button[data-preference-group="${group}"][data-preference-option="${value}"]`).click();
  }
  await pause(page);
}
async function panelFits(page) {
  const panel = await page.locator('.preference-panel').boundingBox();
  const vp = page.viewportSize();
  assert(panel.x >= 11 && panel.y >= 11, 'Leading 12px viewport gutter');
  assert(panel.x + panel.width <= vp.width - 11, 'Trailing viewport gutter');
  assert(panel.y + panel.height <= vp.height - 11, 'Bottom viewport gutter');
  assert(await page.locator('.preference-panel').evaluate(el => el.scrollWidth <= el.clientWidth), 'No internal horizontal overflow');
}
(async () => {
  // Fail fast on accidental divergence of the standalone bookmark distribution.
  for (const file of ['css/ops-coffee.css', 'js/site-preferences.js', 'js/liquid-glass.js', 'js/background-loader.js']) {
    assert(fs.readFileSync(file).equals(fs.readFileSync(`book2html/data/${file}`)), `Mirror: ${file}`);
  }
  for (const engine of (process.env.TEST_BROWSERS || 'chromium,firefox,webkit').split(',')) {
    const browser = await playwright[engine].launch();
    for (const theme of ['light', 'dark']) for (const surface of skins) {
      await run(browser, `${engine}-${theme}-${surface}`, async (page, context) => {
        await context.addInitScript(values => localStorage.setItem('sitePreferences', JSON.stringify(values)), {theme, surface});
        await go(page);
        for (const width of [1440, 390]) {
          await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
          await pause(page);
          assert.equal(await page.locator('.nav-item').count(), 10);
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No page overflow');
          assert(await page.locator('#search-btn svg').isVisible(), 'Theme-aware search icon');
          await page.screenshot({path: `test-results/${engine}-${theme}-${surface}-${width}.png`});
          await page.locator('.preference-toggle').click();
          await panelFits(page);
          assert.equal(await page.locator('.surface-preview').count(), 9);
          await page.locator('.preference-close').click();
        }
        await preferences(page, {density: 'compact'});
        assert.equal(await page.locator('body').getAttribute('data-density'), 'compact');
        await page.reload();
        // Init script seeds the matrix on each navigation, so storage is tested separately below.
      });
    }
    await run(browser, `${engine}-search-and-keyboard`, async page => {
      await go(page);
      await page.locator('#txt').focus();
      await page.keyboard.press('Escape');
      assert(await page.locator('#txt').evaluate(el => el === document.activeElement));
      await page.locator('#search-engine-toggle').click();
      assert(await page.locator('.search-engine').isVisible(), 'First pointer click must open');
      await page.keyboard.press('Escape');
      assert(!await page.locator('.search-engine').isVisible());
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      assert.match(await page.locator('#search-engine-toggle').getAttribute('aria-label'), /Google/);
      assert(await page.locator('#txt').evaluate(el => el === document.activeElement));
      await page.reload();
      assert.match(await page.locator('#search-engine-toggle').getAttribute('aria-label'), /Google/);
      await page.evaluate(() => { window.searchCalls = []; window.open = (...args) => { window.searchCalls.push(args); return null; }; });
      await page.locator('#txt').fill('中文 & a=b');
      await page.evaluate(() => document.querySelector('#txt').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true })));
      assert.equal(await page.evaluate(() => window.searchCalls.length), 0, 'IME confirmation must not search');
      await page.locator('#txt').press('Enter');
      const calls = await page.evaluate(() => window.searchCalls);
      assert.equal(calls.length, 1);
      assert.equal(calls[0][0], `https://www.google.com/search?q=${encodeURIComponent('中文 & a=b')}`);
      assert.equal(calls[0][2], 'noopener,noreferrer');
      await page.locator('#txt').fill('  ');
      await page.locator('#search-btn').click();
      assert.equal(await page.evaluate(() => window.searchCalls.length), 1);
    });
    await run(browser, `${engine}-settings-viewport-and-storage`, async page => {
      await go(page);
      await preferences(page, {surface: 'paper', theme: 'dark'});
      await page.locator('.preference-close').click();
      assert(await page.locator('.preference-toggle').evaluate(el => el === document.activeElement));
      await page.reload();
      assert.equal(await page.locator('body').getAttribute('data-surface'), 'paper');
      assert.equal(await page.locator('body').getAttribute('data-theme'), 'dark');
      await page.locator('.preference-toggle').click();
      await page.keyboard.press('Escape');
      assert(!await page.locator('.preference-panel').isVisible());
      await page.locator('.preference-toggle').click();
      await page.locator('.preference-advanced-summary').click();
      for (const [width, height] of [[320,568], [390,300], [768,900], [1024,600], [2560,1080]]) {
        await page.setViewportSize({width,height}); await pause(page); await panelFits(page);
      }
      await page.locator('#txt').focus();
      assert(!await page.locator('.preference-panel').isVisible(), 'Keyboard departure closes non-modal panel');
      await page.evaluate(() => localStorage.setItem('sitePreferences', '{broken'));
      await page.reload();
      assert.equal(await page.locator('body').getAttribute('data-surface'), 'glass');
    });
    await run(browser, `${engine}-pages-and-file-mode`, async page => {
      for (const file of ['index.html','common.html','develop.html','tools.html']) {
        await go(page,file);
        assert(await page.locator('.nav-item').count() > 0);
        const links = await page.locator('.header-menu a').evaluateAll(links => links.map(a => a.getAttribute('href')));
        for (const link of links) assert(fs.existsSync(link), `Navigation destination ${link}`);
      }
      await page.goto(pathToFileURL(path.resolve('index.html')).href);
      assert.equal(await page.locator('.nav-item').count(), 10);
      await preferences(page, {surface: 'liquid'});
      await page.locator('.preference-close').click();
      await page.screenshot({path: `test-results/${engine}-file-liquid.png`});
    });
    await run(browser, `${engine}-reduced-motion-storage-denied`, async (page, context) => {
      await context.addInitScript(() => {
        Storage.prototype.getItem = () => { throw new DOMException('Denied', 'SecurityError'); };
        Storage.prototype.setItem = () => { throw new DOMException('Denied', 'SecurityError'); };
      });
      await go(page);
      await preferences(page, {surface: 'liquid'});
      await page.locator('.preference-close').click();
      await page.locator('.nav-item').first().hover();
      assert.equal(await page.locator('.nav-item').first().evaluate(el => getComputedStyle(el).transform), 'none');
    }, {reducedMotion: 'reduce'});
    await run(browser, `${engine}-liquid-lifecycle`, async (page, context) => {
      await context.addInitScript(() => {
        window.liquidEncodes = 0;
        const encode = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function(...args) { window.liquidEncodes++; return encode.apply(this,args); };
      });
      await go(page); await pause(page);
      assert.equal(await page.evaluate(() => window.liquidEncodes), 0, 'No unused material precomputation');
      await preferences(page,{surface:'liquid'});
      await page.locator('.preference-close').click(); await pause(page);
      if (engine === 'chromium') {
        assert(await page.locator('filter').count() > 0, 'Actual refraction is present');
        await page.locator('.nav-item').first().evaluate(el => el.remove()); await pause(page);
        assert.equal(await page.locator('filter').count(), await page.locator('[data-liquid-ready]').count(), 'No orphan filter');
      } else assert.equal(await page.locator('filter').count(), 0, 'Other engines use CSS fallback');
      for (let i=0; i<3; i++) {
        await preferences(page,{surface:'glass'});
        assert.equal(await page.locator('filter').count(), 0, 'Release filters on exit');
        assert.equal(await page.locator('[data-liquid-ready]').count(), 0);
        await preferences(page,{surface:'liquid'});
      }
    });
    await run(browser, `${engine}-standalone-bookmarks`, async page => {
      await go(page, 'test-results/bookmarks-fixture.html');
      assert.equal(await page.locator('.nav-item').count(), 160);
      await preferences(page, {surface:'liquid'});
      await page.locator('.preference-close').click(); await pause(page);
      const initial = await page.locator('filter').count();
      assert(initial < 60, 'Long-page filters are bounded by viewport, not total bookmarks');
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(500);
      assert(await page.locator('filter').count() < 60);
      if (engine === 'chromium') assert(await page.locator('.nav-item').last().getAttribute('data-liquid-ready'));
      assert(!await page.locator('script').evaluateAll(nodes => nodes.some(n => n.textContent.includes('alert(1)'))));
      await page.screenshot({path: `test-results/${engine}-bookmarks-bottom.png`});
    });
    await run(browser, `${engine}-canvas-failure`, async (page, context) => {
      await context.addInitScript(() => { HTMLCanvasElement.prototype.toDataURL = () => { throw new Error('Canvas blocked'); }; });
      await go(page); await preferences(page,{surface:'liquid'});
      assert.equal(await page.locator('filter').count(), 0);
      assert.equal(await page.locator('html').getAttribute('data-liquid-glass-supported'), 'false');
    });
    await browser.close();
  }
  fs.writeFileSync('test-results/results.json', JSON.stringify(results,null,2));
  const failed = results.filter(r => !r.pass);
  console.log(`${results.length - failed.length}/${results.length} PASS`);
  if (failed.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
