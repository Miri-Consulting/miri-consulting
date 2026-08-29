import { chromium } from 'playwright';
const OUT = '/private/tmp/claude-501/-Users-micaelsanchez-repos-miri-consulting-site/9921322c-e98d-4c65-9054-26f539122fcd/scratchpad/shots';
const b = await chromium.launch();

// Ground truth: what is actually painted, not what a selector claims.
const visibleModal = (p) => p.evaluate(() => {
  const vis = [...document.querySelectorAll('.fs_modal-1_popup-2')]
    .filter(m => { const r = m.getBoundingClientRect(); return r.width > 50 && r.height > 50 && getComputedStyle(m).display !== 'none'; })
    .map(m => (m.className.match(/(team|service)-modal-popup/) || ['?'])[0]);
  return vis;
});

async function scenario(label, order, pauseMs) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.route('**/cdn-cookieyes.com/**', r => r.abort());
  await p.goto('https://miri-consulting.com/', { waitUntil: 'networkidle' });
  const open = {
    service: () => p.locator('.section_layout507 .w-tab-pane.w--tab-active a[fs-modal-element]').click(),
    team: () => p.locator('.team8_item').first().click(),
  };
  const steps = [];
  for (const [i, which] of order.entries()) {
    await open[which]();
    await p.waitForTimeout(pauseMs);
    steps.push(`${which}:[${(await visibleModal(p)).join(',') || 'NONE'}]`);
    await p.screenshot({ path: `${OUT}/rc-${label}-${i}-${which}.png` });
    // close whatever is open, the way a person would
    const close = p.locator('.fs_modal-1_popup-2 .fs_modal-1_close-2:visible').first();
    if (await close.count()) { await close.click().catch(()=>{}); await p.waitForTimeout(pauseMs); }
  }
  console.log(`${label.padEnd(34)} ${steps.join('  ->  ')}`);
  await ctx.close();
}

await scenario('service->team, 2s pauses', ['service', 'team'], 2000);
await scenario('team->service, 2s pauses', ['team', 'service'], 2000);
await scenario('service->team, no pause',  ['service', 'team'], 150);
await scenario('team->service, no pause',  ['team', 'service'], 150);
await b.close();
