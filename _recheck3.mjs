import { chromium } from 'playwright';
const OUT = '/private/tmp/claude-501/-Users-micaelsanchez-repos-miri-consulting-site/9921322c-e98d-4c65-9054-26f539122fcd/scratchpad/shots';
const b = await chromium.launch();

async function run(order, pause, label) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.route('**/cdn-cookieyes.com/**', r => r.abort());
  await p.goto('https://miri-consulting.com/', { waitUntil: 'networkidle' });
  const state = () => p.evaluate(() => [...document.querySelectorAll('.fs_modal-1_popup-2')]
    .filter(m => { const r = m.getBoundingClientRect(); return r.width > 50 && r.height > 50 && getComputedStyle(m).display !== 'none'; })
    .map(m => (m.className.match(/(team|service)-modal-popup/) || ['?'])[0]));
  const openers = {
    service: async () => { const l = p.locator('.section_layout507 .w-tab-pane.w--tab-active a[fs-modal-element]'); await l.scrollIntoViewIfNeeded(); await l.click(); },
    team: async () => { const l = p.locator('.team8_item').first(); await l.scrollIntoViewIfNeeded(); await l.click(); },
  };
  const out = [];
  for (const [i, which] of order.entries()) {
    await openers[which]();
    await p.waitForTimeout(pause);
    out.push(`${i + 1}.${which}=${(await state()).join('|') || 'NONE'}`);
    await p.screenshot({ path: `${OUT}/rc3-${label}-${i}-${which}.png` });
    // close ONLY the currently visible modal
    const close = p.locator('.fs_modal-1_popup-2:visible .fs_modal-1_close-2:visible').first();
    if (await close.count()) { await close.click(); await p.waitForTimeout(pause); }
    out.push(`closed=${(await state()).join('|') || 'NONE'}`);
  }
  console.log(`${label.padEnd(26)} ${out.join('  ')}`);
  await ctx.close();
}

await run(['service', 'team'], 2000, 'service-then-team');
await run(['team', 'service'], 2000, 'team-then-service');
await run(['service', 'team'], 150, 'fast-service-team');
await b.close();
