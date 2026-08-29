import { chromium } from 'playwright';
const OUT = '/private/tmp/claude-501/-Users-micaelsanchez-repos-miri-consulting-site/9921322c-e98d-4c65-9054-26f539122fcd/scratchpad/shots';
const b = await chromium.launch();
const vis = (p) => p.evaluate(() => [...document.querySelectorAll('.fs_modal-1_popup-2')]
  .filter(m => { const r = m.getBoundingClientRect(); return r.width > 50 && r.height > 50 && getComputedStyle(m).display !== 'none'; })
  .map(m => (m.className.match(/(team|service)-modal-popup/) || ['?'])[0]));

async function run(order, pause, label) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.route('**/cdn-cookieyes.com/**', r => r.abort());
  await p.goto('https://miri-consulting.com/', { waitUntil: 'networkidle' });
  const out = [];
  for (const [i, which] of order.entries()) {
    const sel = which === 'service'
      ? '.section_layout507 .w-tab-pane.w--tab-active a[fs-modal-element]'
      : '.team8_item';
    await p.locator(sel).first().dispatchEvent('click');   // bypass stability gate
    await p.waitForTimeout(pause);
    out.push(`open ${which} -> ${(await vis(p)).join('|') || 'NONE'}`);
    await p.screenshot({ path: `${OUT}/rc-${label}-${i}.png` });
    const close = p.locator('.fs_modal-1_popup-2 .fs_modal-1_close-2').filter({ visible: true }).first();
    if (await close.count()) { await close.dispatchEvent('click'); await p.waitForTimeout(pause); }
    out.push(`closed -> ${(await vis(p)).join('|') || 'NONE'}`);
  }
  console.log(`[${label}] ` + out.join(' ; '));
  await ctx.close();
}
await run(['service','team'], 2000, 'svc-then-team-slow');
await run(['team','service'], 2000, 'team-then-svc-slow');
await run(['service','team'], 200,  'svc-then-team-fast');
await b.close();
