import { PurgeCSS } from 'purgecss';
import { writeFile, stat } from 'node:fs/promises';

// The pruning is destructive — it overwrites public/styles/site.css in place
// with the curated subset. Re-run after content changes or after a Webflow
// re-export. To rebuild from scratch, restore the source file from git first.
const SOURCE_CSS = 'public/styles/site.css';
const OUTPUT_CSS = SOURCE_CSS;

// Webflow's runtime JS toggles classes that are not present in static HTML
// (e.g. `w--current` for active tabs, `w--open` for dropdowns, `w--tab-active`
// for the active tab pane). Finsweet's modal lib does the same with
// `fs-modal-*`. PurgeCSS's content scan catches literal strings in JS bundles
// — these patterns are a defensive backstop for anything that's computed.
const SAFELIST = {
  standard: [
    /^w--/,
    /^w-mod-/,
    /^w-slider-/,
    /^w-tab-/,
    /^w-form-/,
    /^w-nav/,
    /^w-dropdown/,
    /^w-condition-/,
    /^w-pagination/,
    /^w-checkbox/,
    /^w-radio/,
    /^w-input-/,
    /^w-fileupload/,
    /^w-commerce-/,
    /^wf-/,
    /^fs-/,
    /^fs_/,
    /^is-/,
    /^calendly-/,
    'html',
    'body',
    'main',
  ],
  greedy: [/^w--/, /^w-tab-/, /^w-nav-/, /^w-slider-/],
};

const result = await new PurgeCSS().purge({
  content: [
    'dist/**/*.html',
    'public/scripts/*.js',
    'public/*.js',
    'src/**/*.astro',
    'src/**/*.html',
  ],
  css: [SOURCE_CSS],
  safelist: SAFELIST,
  // Keep keyframes (the marquee animation, etc.) and font-face rules.
  keyframes: true,
  fontFace: true,
});

if (result.length !== 1) {
  console.error(`Expected one output, got ${result.length}`);
  process.exit(1);
}

const sourceSize = (await stat(SOURCE_CSS)).size;
const pruned = result[0].css;
await writeFile(OUTPUT_CSS, pruned, 'utf8');

console.log(`${SOURCE_CSS}: ${(sourceSize / 1024).toFixed(1)}KB`);
console.log(`${OUTPUT_CSS}: ${(pruned.length / 1024).toFixed(1)}KB`);
console.log(`saved ${(((sourceSize - pruned.length) / sourceSize) * 100).toFixed(1)}%`);
