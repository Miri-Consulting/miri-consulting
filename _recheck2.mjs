import { chromium } from 'playwright';
const OUT = '/private/tmp/claude-501/-Users-micaelsanchez-repos-miri-consulting-site/9921322c-e98d-4c65-9054-26f539122fcd/scratchpad/shots';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.route('**/cdn-cookieyes.com/**', r => r.abort());
await p.goto('https://miri-consulting.com/', { waitUntil: 'networkidle' });

const state = () => p.evaluate(() => {
  const vis = [...document.querySelectorAll('.fs_modal-1_popup-2')]
    .filter(m => { const r = m.getBoundingClientRect(); return r.width > 50 && r.height > 50 && getComputedStyle(m).display !== 'none'; })
    .map(m => (m.className.match(/(team|service)-modal-popup/) || ['?'])[0]);
  return { openModals: vis, bodyOverflow: getComputedStyle(document.body).overflow };
});

const log = async (t) => console.log(t.padEnd(30), JSON.stringify(await state()));
await log('0 initial');

// 1. open a SERVICE modal (the user's first action)
await p.locator('.section_layout507 .w-tab-pane.w--tab-active a[fs-modal-element]').click();
await p.waitForTimeout(2000);
await log('1 after opening service');
await p.screenshot({ path: `${OUT}/rc2-1-service.png` });

// 2. close it like a person
await p.locator('.fs_modal-1_popup-2.service-modal-popup .fs_modal-1_close-2').first().click();
await p.waitForTimeout(2000);
await log('2 after closing service');

// 3. now open a TEAM modal (the user's second action)
await p.locator('.team8_item').first().scrollIntoViewIfNeeded();
await p.waitForTimeout(500);
await p.locator('.team8_item').first().click();
await p.waitForTimeout(2500);
await log('3 after opening team');
await p.screenshot({ path: `${OUT}/rc2-3-team.png` });
await b.close();
