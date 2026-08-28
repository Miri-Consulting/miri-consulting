(() => {
  // Defers the hero's Spline scene until the browser is idle or the visitor
  // interacts, so the 3D runtime never competes with first paint.
  //
  // Initialisation is strictly once per element. Spline renders through
  // THREE.WebGPURenderer, which configures the canvas against a specific
  // GPUDevice; calling createInstance a second time on a canvas that already
  // has a device attached produces a renderer whose command encoder belongs to
  // one device and whose swap-chain texture belongs to another. Chrome then
  // logs, every frame:
  //
  //   THREE.WebGPURenderer: Uncaptured WebGPU GPUValidationError:
  //   [TextureView of Texture "IOSurface(...)"] is associated with [Device],
  //   and cannot be used with [Device].
  //
  // The previous version could reach that state two ways: bootSplines was
  // registered against four event types (each `once`, so up to four calls plus
  // the idle/load path), and a rejected createInstance reset the started flag,
  // letting a later event retry on a canvas the failed attempt had already
  // claimed. Both are fixed below — an element is attempted exactly once, and
  // a failure is terminal.

  const STATE = 'miriSplineState'; // 'started' | 'failed' — absent means untried

  function startSpline(scene) {
    // Terminal states: never touch this element again.
    if (scene.dataset[STATE]) {
      return;
    }

    const url = scene.getAttribute('data-miri-spline-url');
    if (!url) {
      return;
    }

    // Webflow's bundle may not have registered the module yet. Leave the
    // element untried so a later trigger can pick it up — nothing has been
    // created on the canvas at this point, so this retry is safe.
    if (!window.Webflow || typeof window.Webflow.require !== 'function') {
      return;
    }

    const spline = window.Webflow.require('spline');
    if (!spline || typeof spline.createInstance !== 'function') {
      return;
    }

    scene.setAttribute('data-animation-type', 'spline');
    scene.setAttribute('data-spline-url', url);
    scene.dataset[STATE] = 'started';

    void spline.createInstance(scene, url).catch(() => {
      // Terminal. A retry would attach a second GPU device to a canvas the
      // failed attempt already configured. Hide the dead canvas instead; the
      // hero's background and overlay stand on their own without it.
      scene.dataset[STATE] = 'failed';
      scene.setAttribute('hidden', '');
    });
  }

  function bootSplines() {
    document.querySelectorAll('.spline-scene[data-miri-spline-url]').forEach(startSpline);
  }

  function scheduleSplines() {
    let triggered = false;
    const events = ['pointerdown', 'keydown', 'touchstart', 'scroll'];

    const fire = () => {
      if (triggered) {
        return;
      }
      triggered = true;
      events.forEach((name) => window.removeEventListener(name, fire));

      // A WebGPU device created while the tab is hidden is routinely lost when
      // the tab is restored, which lands in the same mismatched-device state.
      // Wait for the page to be visible before handing off to Spline.
      if (document.visibilityState === 'hidden') {
        document.addEventListener('visibilitychange', function onVisible() {
          if (document.visibilityState === 'visible') {
            document.removeEventListener('visibilitychange', onVisible);
            bootSplines();
          }
        });
        return;
      }

      bootSplines();
    };

    const run = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(fire, { timeout: 3500 });
      } else {
        window.setTimeout(fire, 2500);
      }
    };

    if (document.readyState === 'complete') {
      run();
    } else {
      window.addEventListener('load', run, { once: true });
    }

    events.forEach((name) => window.addEventListener(name, fire, { passive: true }));
  }

  scheduleSplines();
})();
