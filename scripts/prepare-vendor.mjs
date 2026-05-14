import { cp, link, mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const webflowRoot = path.join(
  root,
  'cdn.prod.website-files.com/64f363b4ba0fc1362362824f',
);
const vendorRoot = path.join(root, 'public/vendor');

await mkdir(path.join(vendorRoot, 'webflow/css'), { recursive: true });
await mkdir(path.join(vendorRoot, 'webflow/js'), { recursive: true });
await mkdir(path.join(vendorRoot, 'webflow/assets'), { recursive: true });
await mkdir(path.join(vendorRoot, 'tags/first-party'), { recursive: true });

await cp(path.join(webflowRoot, 'css'), path.join(vendorRoot, 'webflow/css'), {
  recursive: true,
});
await cp(path.join(webflowRoot, 'js'), path.join(vendorRoot, 'webflow/js'), {
  recursive: true,
});

const assetEntries = await readdir(webflowRoot);
for (const entry of assetEntries) {
  if (entry === 'css' || entry === 'js') continue;
  await cp(path.join(webflowRoot, entry), path.join(vendorRoot, 'webflow/assets', entry));
}

const assetDir = path.join(vendorRoot, 'webflow/assets');

function webflowEncodedName(entry) {
  return entry
    .replaceAll(' ', '%20')
    .replaceAll('`', '%60')
    .replaceAll(':', '%3A')
    .replaceAll("'", '%27')
    .replaceAll('(', '%28')
    .replaceAll(')', '%29')
    .replaceAll('@', '%40');
}

async function ensureAssetAlias(source, alias) {
  if (alias === source) return;
  try {
    await link(path.join(assetDir, source), path.join(assetDir, alias));
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
}

for (const entry of await readdir(assetDir)) {
  if (entry.includes('%')) continue;
  await ensureAssetAlias(entry, entry.replaceAll(' ', '%20').replaceAll('@', '%40'));
  await ensureAssetAlias(entry, webflowEncodedName(entry));
}

const ogImageSource = path.join(assetDir, '6814fec732b8cad8fad64a0d_Home_Page_1.png');
try {
  await stat(ogImageSource);
} catch {
  const ogResponse = await fetch(
    'https://cdn.prod.website-files.com/64f363b4ba0fc1362362824f/6814fec732b8cad8fad64a0d_Home%20Page%20(1).png',
  );
  if (ogResponse.ok) {
    await writeFile(ogImageSource, Buffer.from(await ogResponse.arrayBuffer()));
  }
}

await cp(
  path.join(
    root,
    'haqt6iy0yx2eNjRmMzYzYjRiYTBmYzEzNjIzNjI4MjRm/tvAAsIKEswP0uufI_5zRB4CSZhM',
  ),
  path.join(vendorRoot, 'tags/first-party/tvAAsIKEswP0uufI_5zRB4CSZhM'),
);

await cp(
  path.join(root, 'miri-static-overrides.js'),
  path.join(root, 'public/miri-static-overrides.js'),
);

const splineDir = path.join(root, 'public/assets/spline');
const splineTarget = path.join(splineDir, 'hero.scene.splinecode');
await mkdir(splineDir, { recursive: true });
try {
  await stat(splineTarget);
} catch {
  const splineResponse = await fetch(
    'https://prod.spline.design/g1zcjk-5vLl2eWGi/scene.splinecode',
  );
  if (splineResponse.ok) {
    await writeFile(splineTarget, Buffer.from(await splineResponse.arrayBuffer()));
  }
}

const teamAssets = path.join(root, 'src/assets/team');
try {
  await stat(teamAssets);
  await cp(teamAssets, path.join(root, 'public/assets/team'), { recursive: true });
} catch {
  // optional team headshots
}

const testimonialAssets = path.join(root, 'src/assets/testimonials');
try {
  await stat(testimonialAssets);
  await cp(testimonialAssets, path.join(root, 'public/assets/testimonials'), {
    recursive: true,
  });
} catch {
  // optional testimonial portraits
}

console.log('Vendor tree prepared under public/vendor');
