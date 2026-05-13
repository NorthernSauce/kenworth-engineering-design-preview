/* ═════════════════════════════════════════════════════════════════════
   FLOURISHES — runtime behaviour (shared, every page)
     1. Mark <body> loaded for fade-in
     2. Scroll-reveal observer — adds .is-in to .reveal / .reveal-stagger
     3. Animated stat counters — [data-count] elements count up on enter
     4. Auto-tag candidates — sections, machines, acards, specs, steps
   Respects prefers-reduced-motion.
   ═════════════════════════════════════════════════════════════════════ */

(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Page-load fade-in
  function markLoaded() { document.body.classList.add('is-loaded'); }
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    requestAnimationFrame(markLoaded);
  } else {
    document.addEventListener('DOMContentLoaded', markLoaded);
  }

  // 4. Auto-tag reveal candidates — ONLY inner content elements.
  //    Never tag the outer <section> surface — that would animate the
  //    surface colour/background fading in, which looks janky on dark
  //    sections.  Only the things INSIDE the section.
  function autoTag() {
    const innerSelectors = [
      '.section__head',
      '.section__lede',
      '.svc-hero__inner',
      '.quote-hero__inner',
      '.hero__copy',
      '.empathy__layout',
      '.industries__hd',
      '.industries__foot',
      '.cta-band-pro__lead',
      '.pre-footer__inner',
      '.quality__copy',
      '.quality__viz'
    ];
    innerSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (!el.classList.contains('reveal') && !el.classList.contains('reveal-stagger')) {
          el.classList.add('reveal');
        }
      });
    });

    // Stagger inside common grids
    const staggerSelectors = [
      '.spec-grid',
      '.machines__grid',
      '.industries__grid',
      '.industry-grid',
      '.hub-grid',
      '.steps-pro',
      '.cta-band-pro__steps',
      '.duties',
      '.gives',
      '.roles',
      '.contact-paths',
      '.fstat__row',
      '.stat-strip__grid',
      '.timeline',
      '.team-grid',
      '.sector-list'
    ];
    staggerSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (!el.classList.contains('reveal') && !el.classList.contains('reveal-stagger')) {
          el.classList.add('reveal-stagger');
        }
      });
    });
  }
  autoTag();

  // If reduced motion, skip the observer entirely — CSS already pins is-in state
  if (reduce) {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => el.classList.add('is-in'));
    return;
  }

  // 2. Scroll-reveal observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
  );
  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => observer.observe(el));

  // 3. Animated stat counters
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;
    const duration = parseInt(el.dataset.countDuration || '1400', 10);
    const decimals = parseInt(el.dataset.countDecimals || '0', 10);
    const prefix = el.dataset.countPrefix || '';
    const suffix = el.dataset.countSuffix || '';
    const start = performance.now();

    function frame(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const val = target * easeOutQuart(t);
      el.textContent = prefix + val.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));
})();
