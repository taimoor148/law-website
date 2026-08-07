/* ============================================================
   JUSTICE DESK — HOME PAGE JAVASCRIPT
   Handles: navbar scroll, mobile menu, counter animations,
   reveal animations, FAQ accordion, back-to-top (theme is handled by main.js)
   ============================================================ */

(function () {
  'use strict';

  /* ── Navbar scroll effect ── */
  const nav = document.getElementById('sv-header');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile menu ── */
  const burger = document.getElementById('sv-burger-btn');
  const mobileMenu = document.getElementById('sv-mobile-menu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen.toString());
      mobileMenu.setAttribute('aria-hidden', (!isOpen).toString());
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('.sv-mobile-link, .sv-cta-btn').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Smooth scroll for one-page anchors ── */
  const NAV_HEIGHT = 76;
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
      window.scrollTo({ top: Math.max(y, 0), behavior: 'smooth' });
    });
  });

  /* ── Active section highlighting (scroll spy) ── */
  const spyLinks = document.querySelectorAll('.sv-nav-link[data-nav]');
  const spyIds = Array.from(spyLinks).map(l => l.getAttribute('data-nav'));
  const spySections = spyIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const setActive = (id) => {
    spyLinks.forEach(l => {
      l.classList.toggle('sv-nav-link--active', l.getAttribute('data-nav') === id);
    });
  };

  const spyObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  spySections.forEach(s => spyObs.observe(s));

  /* ── Intersection Observer for reveal animations ── */
  const observerOpts = { threshold: 0.15, rootMargin: '0px 0px -60px 0px' };

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        revealObs.unobserve(entry.target);
      }
    });
  }, observerOpts);

  // Observe all data-reveal elements
  document.querySelectorAll('[data-reveal], .stagger, [data-hero-title]').forEach(el => {
    revealObs.observe(el);
  });

  // Hero eyebrow reveal
  document.querySelectorAll('.sv-hero-eyebrow').forEach(el => {
    setTimeout(() => el.classList.add('is-revealed'), 200);
  });

  /* ── Number counter animation ── */
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0');
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const val = target * easeOut(progress);
      el.textContent = val.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals) + suffix;
    };
    requestAnimationFrame(step);
  }

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-count]').forEach(el => {
          if (!el.dataset.counted) {
            el.dataset.counted = '1';
            animateCount(el);
          }
        });
        counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.sv-hero-stats, .sv-stats-band').forEach(el => {
    counterObs.observe(el);
  });

  /* ── FAQ Accordion ── */
  document.querySelectorAll('.sv-acc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.sv-acc-item');
      const panel = item.querySelector('.sv-acc-panel');
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all
      document.querySelectorAll('.sv-acc-btn').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const p = b.closest('.sv-acc-item').querySelector('.sv-acc-panel');
        if (p) p.classList.remove('open');
      });

      // Open this one if it was closed
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        if (panel) panel.classList.add('open');
      }
    });
  });

  /* ── Back to top ── */
  const toTop = document.getElementById('back-to-top-btn');
  if (toTop) {
    window.addEventListener('scroll', () => {
      toTop.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Dynamic year ── */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  /* ── Mask line hero title ── */
  const heroTitle = document.querySelector('[data-hero-title]');
  if (heroTitle) {
    setTimeout(() => {
      heroTitle.classList.add('is-revealed');
    }, 400);
  }

  /* ── Stagger children index ── */
  document.querySelectorAll('.stagger').forEach(container => {
    Array.from(container.children).forEach((child, i) => {
      child.style.setProperty('--i', i);
    });
  });

})();
