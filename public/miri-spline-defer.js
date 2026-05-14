(() => {
  function startSpline(scene) {
    if (scene.dataset.miriSplineStarted === 'true') {
      return;
    }

    const url = scene.getAttribute('data-miri-spline-url');
    if (!url) {
      return;
    }

    if (!window.Webflow || typeof window.Webflow.require !== 'function') {
      return;
    }

    scene.dataset.miriSplineStarted = 'true';
    scene.setAttribute('data-animation-type', 'spline');
    scene.setAttribute('data-spline-url', url);

    const spline = window.Webflow.require('spline');
    if (!spline || typeof spline.createInstance !== 'function') {
      scene.dataset.miriSplineStarted = 'false';
      return;
    }

    void spline.createInstance(scene, url).catch(() => {
      scene.dataset.miriSplineStarted = 'false';
    });
  }

  function bootSplines() {
    document.querySelectorAll('.spline-scene[data-miri-spline-url]').forEach(startSpline);
  }

  function scheduleSplines() {
    const run = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(bootSplines, { timeout: 3500 });
      } else {
        window.setTimeout(bootSplines, 2500);
      }
    };

    if (document.readyState === 'complete') {
      run();
    } else {
      window.addEventListener('load', run, { once: true });
    }

    ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach((eventName) => {
      window.addEventListener(eventName, bootSplines, { once: true, passive: true });
    });
  }

  scheduleSplines();
})();
