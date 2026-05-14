(() => {
  let calendlyLoading;

  function loadCalendly() {
    if (window.Calendly) {
      return Promise.resolve();
    }

    if (calendlyLoading) {
      return calendlyLoading;
    }

    calendlyLoading = new Promise((resolve) => {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = 'https://assets.calendly.com/assets/external/widget.css';
      document.head.appendChild(stylesheet);

      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });

    return calendlyLoading;
  }

  function deferCalendlyAssets() {
    document
      .querySelectorAll('link[href*="assets.calendly.com/assets/external/widget.css"]')
      .forEach((node) => node.remove());
    document
      .querySelectorAll('script[src*="assets.calendly.com/assets/external/widget.js"]')
      .forEach((node) => node.remove());

    document.addEventListener(
      'click',
      (event) => {
        const trigger = event.target.closest('.calendly-widget, .calendly-widget-big');
        if (!trigger) {
          return;
        }

        event.preventDefault();
        loadCalendly().then(() => {
          const url = trigger.getAttribute('href');
          if (url && window.Calendly) {
            window.Calendly.initPopupWidget({ url });
          }
        });
      },
      true,
    );
  }

  function startSpline(scene) {
    if (scene.dataset.miriSplineStarted === 'true') {
      return;
    }

    const url = scene.getAttribute('data-miri-spline-url');
    if (!url) {
      return;
    }

    scene.dataset.miriSplineStarted = 'true';
    scene.setAttribute('data-animation-type', 'spline');
    scene.setAttribute('data-spline-url', url);

    const tryLoad = () => {
      if (!window.Webflow || typeof window.Webflow.require !== 'function') {
        return false;
      }

      window.Webflow.require('spline').then((api) => {
        if (api && typeof api.createInstance === 'function') {
          api.createInstance(scene, url);
        } else if (api && typeof api.init === 'function') {
          api.init();
        }
      });

      return true;
    };

    if (tryLoad()) {
      return;
    }

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (tryLoad() || attempts > 40) {
        window.clearInterval(timer);
      }
    }, 100);
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

    run();
    ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach((eventName) => {
      window.addEventListener(eventName, bootSplines, { once: true, passive: true });
    });
  }

  deferCalendlyAssets();
  scheduleSplines();
})();
