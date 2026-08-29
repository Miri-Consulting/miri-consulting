import { chromium } from 'playwright';
const b = await chromium.launch();
let fails = 0;
for (let i = 0; i < 4; i++) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.route('**/cdn-cookieyes.com/**', r => r.abort());
  await p.goto('https://miri-consulting.com/', { waitUntil: 'networkidle' });
  await p.locator('.team8_item').first().click();
  await p.locator('.fs_modal-1_popup-2.team-modal-popup:visible .fs_modal-1_close-2').click();
  await p.locator('.fs_modal-1_popup-2.team-modal-popup:visible').waitFor({ state: 'hidden' });
  // What sits at the service trigger's click point right after the modal closes?
  const probe = await p.evaluate(() => {
    const t = document.querySelector('.section_layout507 .w-tab-pane.w--tab-active a[fs-modal-element]');
    if (!t) return { err: 'no trigger' };
    const r = t.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const hit = document.elementFromPoint(x, y);
    return {
      triggerInViewport: r.top >= 0 && r.bottom <= innerHeight,
      hitElement: hit ? (hit.className || hit.tagName).toString().slice(0, 70) : 'null',
      hitIsTriggerOrChild: hit ? (hit === t || t.contains(hit)) : false,
      bodyOverflow: getComputedStyle(document.body).overflow,
    };
  });
  let opened = true;
  try {
    await p.locator('.section_layout507 .w-tab-pane.w--tab-active a[fs-modal-element]').click({ timeout: 6000 });
    await p.locator('.fs_modal-1_popup-2.service-modal-popup:visible').waitFor({ timeout: 4000 });
  } catch { opened = false; fails++; }
  console.log(`run ${i + 1}: opened=${opened} ${JSON.stringify(probe)}`);
  await ctx.close();
}
console.log(`real .click() failures: ${fails}/4`);
await b.close();
