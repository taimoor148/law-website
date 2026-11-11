/* ============================================================
   JUSTICE DESK — Core Engine (Premium Edition)
   Theme · Loader · Cursor · Nav · Particles · Spotlight ·
   Reveal · Counters · Tilt · Parallax · Magnetic · Carousel ·
   Accordion · Filters · Forms · Floats · Transitions · Sprite
   ============================================================ */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const doc = document.documentElement;

  /* ----------------------------------------------------------
     THEME SWITCHER
     ---------------------------------------------------------- */
  const theme = {
    init() {
      const toggles = document.querySelectorAll("[data-theme-toggle]");
      toggles.forEach((btn) => {
        btn.setAttribute("aria-label", "Toggle color theme");
        btn.addEventListener("click", () => {
          const next = doc.getAttribute("data-theme") === "dark" ? "light" : "dark";
          this.set(next);
        });
      });
    },
    set(mode) {
      doc.setAttribute("data-theme", mode);
      try { localStorage.setItem("sv-theme", mode); } catch (e) {}
      document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
        b.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
      });
      doc.classList.add("theme-switching");
      clearTimeout(this._t);
      this._t = setTimeout(() => doc.classList.remove("theme-switching"), 750);
      window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: mode } }));
    },
  };

  /* ----------------------------------------------------------
     LOADER
     ---------------------------------------------------------- */
  const loader = {
    init() {
      const el = document.querySelector(".loader");
      const countEl = document.querySelector("[data-loader-count]");
      const finish = () => {
        el?.classList.add("is-done");
        document.querySelectorAll("[data-hero-title]").forEach((h) => h.classList.add("is-revealed"));
        document.body.classList.add("intro-ready");
        window.dispatchEvent(new CustomEvent("app:loaded"));
      };
      if (!el || prefersReduced) {
        finish();
        return;
      }
      const start = performance.now();
      const tick = (now) => {
        const pct = Math.min(100, Math.round(((now - start) / 1200) * 100));
        if (countEl) countEl.textContent = String(pct).padStart(2, "0") + "%";
        doc.style.setProperty("--load", pct + "%");
        if (pct < 100) requestAnimationFrame(tick);
        else finish();
      };
      requestAnimationFrame(tick);
      setTimeout(() => {
        if (!el.classList.contains("is-done")) finish();
      }, 2800);
    },
  };

  /* ----------------------------------------------------------
     CUSTOM CURSOR + GOLD GLOW + SPOTLIGHT
     ---------------------------------------------------------- */
  const cursor = {
    init() {
      if (isTouch || prefersReduced) return;
      const dot = document.createElement("div");
      dot.className = "cursor-dot";
      const ring = document.createElement("div");
      ring.className = "cursor-ring";
      const glow = document.createElement("div");
      glow.className = "cursor-glow";
      document.body.appendChild(dot);
      document.body.appendChild(ring);
      document.body.appendChild(glow);
      document.body.classList.add("cursor-glow-on");

      let mx = innerWidth / 2, my = innerHeight / 2;
      let rx = mx, ry = my;
      let gx = mx, gy = my;
      let dotS = 1, ringS = 1;

      const t3 = (x, y, s) => `translate3d(${x}px, ${y}px, 0) translate(-50%,-50%) scale(${s})`;

      const track = (e) => {
        mx = e.clientX; my = e.clientY;
      };
      window.addEventListener("mousemove", track, { passive: true });

      let lastTime = 0;
      const loop = (now) => {
        const dt = now - lastTime;
        lastTime = now;
        const f = dt ? Math.min(1, dt / 16.6) : 1;
        const ringF = f * 0.9;
        const glowF = f * 0.78;
        rx += (mx - rx) * ringF;
        ry += (my - ry) * ringF;
        gx += (mx - gx) * glowF;
        gy += (my - gy) * glowF;
        dot.style.transform = t3(mx, my, dotS);
        ring.style.transform = t3(rx, ry, ringS);
        glow.style.transform = t3(gx, gy, 1);
        doc.style.setProperty("--mx", mx + "px");
        doc.style.setProperty("--my", my + "px");
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);

      const actives = "a, button, [role=button], .tilt, input, textarea, select, .carousel-dot";
      document.addEventListener("mouseover", (e) => {
        if (e.target.closest(actives)) {
          dot.classList.add("is-active");
          ring.classList.add("is-active");
          dotS = 0.5;
          ringS = 1.2;
        }
      });
      document.addEventListener("mouseout", (e) => {
        if (e.target.closest(actives)) {
          dot.classList.remove("is-active");
          ring.classList.remove("is-active");
          dotS = 1;
          ringS = 1;
        }
      });
      document.addEventListener("mousedown", () => ringS = 0.82);
      document.addEventListener("mouseup", () => ringS = 1);
    },
  };

  /* ----------------------------------------------------------
     NAVIGATION
     ---------------------------------------------------------- */
  const nav = {
    init() {
      const navEl = document.querySelector(".nav");
      if (!navEl) return;
      const burger = document.querySelector(".nav-burger");
      const menu = document.querySelector(".mobile-menu");
      let lastY = scrollY;

      const onScroll = () => {
        const y = scrollY;
        navEl.classList.toggle("is-scrolled", y > 60);
        if (y > lastY && y > 400 && !menu.classList.contains("is-open")) {
          navEl.classList.add("is-hidden");
        } else {
          navEl.classList.remove("is-hidden");
        }
        lastY = y;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();

      if (burger && menu) {
        burger.addEventListener("click", () => {
          const open = menu.classList.toggle("is-open");
          burger.setAttribute("aria-expanded", open);
          burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
          document.body.style.overflow = open ? "hidden" : "";
          const links = menu.querySelectorAll(".mobile-link");
          links.forEach((l, i) => (l.style.transitionDelay = open ? `${0.12 + i * 0.06}s` : "0s"));
        });
        menu.querySelectorAll("a").forEach((a) =>
          a.addEventListener("click", () => {
            menu.classList.remove("is-open");
            burger.setAttribute("aria-expanded", "false");
            document.body.style.overflow = "";
          })
        );
      }
    },
  };

  /* ----------------------------------------------------------
     SCROLL REVEAL
     ---------------------------------------------------------- */
  const reveal = {
    init() {
      const items = document.querySelectorAll("[data-reveal], .stagger");
      if (!items.length) return;
      const heroItems = document.querySelectorAll(
        ".hero [data-reveal], .hero .stagger, .page-hero [data-reveal], .page-hero .stagger"
      );
      const heroSet = new Set(heroItems);

      document.querySelectorAll(".stagger").forEach((sg) => {
        [...sg.children].forEach((c, i) => c.style.setProperty("--i", i));
      });

      const startObserving = () => {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-revealed");
                io.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );
        items.forEach((el, i) => {
          if (heroSet.has(el) && !document.body.classList.contains("intro-ready")) {
            el._pendingHero = io;
            return;
          }
          el.style.setProperty("--i", i);
          io.observe(el);
        });
      };
      startObserving();
      window.addEventListener("app:loaded", () => {
        setTimeout(() => {
          items.forEach((el, i) => {
            if (el._pendingHero) {
              el.style.setProperty("--reveal-delay", `${0.15 + i * 0.12}s`);
              el._pendingHero.observe(el);
              delete el._pendingHero;
            }
          });
          document.querySelectorAll("[data-hero-title]").forEach((h) => h.classList.add("is-revealed"));
        }, 120);
      });
    },
  };

  /* ----------------------------------------------------------
     ANIMATED COUNTERS
     ---------------------------------------------------------- */
  const counters = {
    init() {
      const els = document.querySelectorAll("[data-count]");
      if (!els.length) return;
      const format = (el, v) => {
        const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
        let s = v.toFixed(decimals);
        const suffix = el.getAttribute("data-suffix") || "";
        return s + suffix;
      };
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            if (el.dataset.counted) return;
            el.dataset.counted = "1";
            const target = parseFloat(el.getAttribute("data-count"));
            const dur = prefersReduced ? 0 : 2000;
            const start = performance.now();
            const step = (now) => {
              const p = Math.min(1, (now - start) / dur);
              const eased = 1 - Math.pow(1 - p, 3);
              el.textContent = format(el, target * eased);
              if (p < 1) requestAnimationFrame(step);
              else el.textContent = format(el, target);
            };
            requestAnimationFrame(step);
            io.unobserve(el);
          });
        },
        { threshold: 0.5 }
      );
      els.forEach((el) => io.observe(el));
    },
  };

  /* ----------------------------------------------------------
     3D TILT CARDS (with live glare)
     ---------------------------------------------------------- */
  const tilt = {
    init() {
      if (isTouch || prefersReduced) return;
      const cards = document.querySelectorAll(".tilt");
      cards.forEach((card) => {
        const glare = document.createElement("div");
        glare.className = "tilt-glare";
        card.appendChild(glare);
        let raf = null;
        card.addEventListener("mousemove", (e) => {
          if (raf) cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            const rx = (0.5 - py) * 10;
            const ry = (px - 0.5) * 12;
            card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
            card.style.setProperty("--mx", (px * 100) + "%");
            card.style.setProperty("--my", (py * 100) + "%");
          });
        });
        card.addEventListener("mouseleave", () => {
          card.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
        });
      });
    },
  };

  /* ----------------------------------------------------------
     PARALLAX (multiple layers)
     ---------------------------------------------------------- */
  const parallax = {
    init() {
      if (prefersReduced) return;
      const els = document.querySelectorAll("[data-parallax]");
      if (!els.length) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) this.observe(entry.target);
            else this.unobserve(entry.target);
          });
        },
        { threshold: 0 }
      );
      this.elements = [];
      els.forEach((el) => {
        const speed = parseFloat(el.getAttribute("data-parallax") || "0.2");
        const y = el.getBoundingClientRect().top + scrollY;
        this.elements.push({ el, speed, originY: y });
        io.observe(el);
      });
      this.onScroll();
      let raf = null;
      const onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          this.onScroll();
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
    },
    observe(el) { el._pActive = true; },
    unobserve(el) { el._pActive = false; },
    onScroll() {
      if (prefersReduced) return;
      this.elements.forEach(({ el, speed, originY }) => {
        if (!el._pActive) return;
        const offset = scrollY - originY;
        el.style.transform = `translate3d(0, ${offset * speed}px, 0)`;
      });
    },
  };

  /* ----------------------------------------------------------
     MAGNETIC BUTTONS
     ---------------------------------------------------------- */
  const magnetic = {
    init() {
      if (isTouch || prefersReduced) return;
      const els = document.querySelectorAll(".magnetic");
      els.forEach((el) => {
        el.addEventListener("mousemove", (e) => {
          const r = el.getBoundingClientRect();
          const mx = (e.clientX - r.left - r.width / 2) * 0.3;
          const my = (e.clientY - r.top - r.height / 2) * 0.3;
          el.style.transform = `translate(${mx}px, ${my}px)`;
        });
        el.addEventListener("mouseleave", () => {
          el.style.transform = "translate(0,0)";
        });
      });
    },
  };

  /* ----------------------------------------------------------
     CAROUSEL
     ---------------------------------------------------------- */
  const carousel = {
    init() {
      document.querySelectorAll("[data-carousel]").forEach((root) => {
        const track = root.querySelector(".carousel-track");
        const slides = root.querySelectorAll(".carousel-slide");
        const dotsWrap = root.querySelector(".carousel-dots");
        if (!track || slides.length <= 1) return;
        let idx = 0;
        const dots = [];
        for (let i = 0; i < slides.length; i++) {
          const d = document.createElement("button");
          d.className = "carousel-dot" + (i === 0 ? " is-active" : "");
          d.setAttribute("aria-label", "Go to slide " + (i + 1));
          d.addEventListener("click", () => go(i));
          dotsWrap.appendChild(d);
          dots.push(d);
        }
        const go = (i) => {
          idx = (i + slides.length) % slides.length;
          track.style.transform = `translateX(-${idx * 100}%)`;
          dots.forEach((d, di) => d.classList.toggle("is-active", di === idx));
        };
        let timer = null;
        if (!prefersReduced) {
          timer = setInterval(() => go(idx + 1), 6000);
          root.addEventListener("mouseenter", () => clearInterval(timer));
          root.addEventListener("mouseleave", () => (timer = setInterval(() => go(idx + 1), 6000)));
        }
        const prev = root.querySelector("[data-carousel-prev]");
        const next = root.querySelector("[data-carousel-next]");
        if (prev) prev.addEventListener("click", () => go(idx - 1));
        if (next) next.addEventListener("click", () => go(idx + 1));
      });
    },
  };

  /* ----------------------------------------------------------
     ACCORDION
     ---------------------------------------------------------- */
  const accordion = {
    init() {
      document.querySelectorAll(".accordion").forEach((wrap) => {
        const items = wrap.querySelectorAll(".accordion-item");
        items.forEach((item) => {
          const btn = item.querySelector(".accordion-btn");
          const panel = item.querySelector(".accordion-panel");
          btn.addEventListener("click", () => {
            const isOpen = item.classList.contains("is-open");
            items.forEach((it) => {
              it.classList.remove("is-open");
              it.querySelector(".accordion-panel").style.maxHeight = null;
            });
            if (!isOpen) {
              item.classList.add("is-open");
              panel.style.maxHeight = panel.scrollHeight + "px";
            }
          });
        });
      });
    },
  };

  /* ----------------------------------------------------------
     FILTERS
     ---------------------------------------------------------- */
  const filters = {
    init() {
      document.querySelectorAll("[data-filter-group]").forEach((group) => {
        const btns = group.querySelectorAll(".filter-btn");
        const sel = group.getAttribute("data-filter-group");
        const grid = document.querySelector(sel.startsWith("#") ? sel : "#" + sel);
        if (!grid) return;
        const items = grid.querySelectorAll("[data-category]");
        btns.forEach((btn) => {
          btn.addEventListener("click", () => {
            btns.forEach((b) => b.classList.remove("is-active"));
            btn.classList.add("is-active");
            const f = btn.getAttribute("data-filter");
            items.forEach((item) => {
              const cats = item.getAttribute("data-category").split(" ");
              const show = f === "all" || cats.includes(f);
              item.classList.toggle("is-filtered", !show);
            });
          });
        });
      });
    },
  };

  /* ----------------------------------------------------------
     FORMS
     ---------------------------------------------------------- */
  const forms = {
    init() {
      document.querySelectorAll("[data-form]").forEach((form) => {
        const success = form.querySelector(".form-success");
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          let valid = true;
          form.querySelectorAll("[required]").forEach((input) => {
            const field = input.closest(".form-field");
            let ok = input.value.trim().length > 0;
            if (ok && input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) ok = false;
            if (field) field.classList.toggle("has-error", !ok);
            if (!ok) valid = false;
          });
          if (!valid) return;
          const btn = form.querySelector("button[type=submit]");
          if (btn) {
            const original = btn.innerHTML;
            btn.innerHTML = "Sending...";
            btn.disabled = true;
            setTimeout(() => {
              btn.innerHTML = original;
              btn.disabled = false;
              form.reset();
              if (success) success.classList.add("show");
            }, 1200);
          }
        });
        form.querySelectorAll("input, textarea").forEach((input) => {
          input.addEventListener("input", () => {
            const field = input.closest(".form-field");
            if (field) field.classList.remove("has-error");
          });
        });
      });
    },
  };

  /* ----------------------------------------------------------
     FLOATS + FOOTER YEAR
     ---------------------------------------------------------- */
  const floats = {
    init() {
      const toTop = document.querySelector(".to-top");
      if (toTop) {
        const onScroll = () => toTop.classList.toggle("show", scrollY > 700);
        window.addEventListener("scroll", onScroll, { passive: true });
        toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
      }
    },
  };

  const footerYear = {
    init() {
      const el = document.querySelector("[data-year]");
      if (el) el.textContent = new Date().getFullYear();
    },
  };

  /* ----------------------------------------------------------
     PAGE TRANSITIONS
     ---------------------------------------------------------- */
  const transitions = {
    init() {
      const overlay = document.querySelector(".page-transition");
      if (!overlay) return;
      document.addEventListener("click", (e) => {
        const link = e.target.closest('a[href^="."], a[href^="index"], a[href*=".html"]');
        if (!link) return;
        const url = link.getAttribute("href");
        if (!url || url.startsWith("#") || url.startsWith("http") || url.startsWith("mailto") || url.startsWith("tel")) return;
        const same = new URL(url, location.href).pathname === location.pathname;
        if (same) return;
        e.preventDefault();
        overlay.classList.add("is-active");
        setTimeout(() => (window.location.href = url), 450);
      });
    },
  };

  /* ----------------------------------------------------------
     SVG SPRITE INLINER
     ---------------------------------------------------------- */
  const sprite = {
    async init() {
      const url = document.querySelector('meta[name="svg-sprite"]')?.content || "assets/icons/sprite.svg";
      try {
        const res = await fetch(url);
        const text = await res.text();
        const doc2 = new DOMParser().parseFromString(text, "text/html");
        const svg = doc2.querySelector("svg");
        if (svg) {
          svg.setAttribute("style", "display:none");
          document.body.insertAdjacentElement("afterbegin", svg);
        }
      } catch (e) { /* icons degrade gracefully */ }
    },
  };

  /* ----------------------------------------------------------
     GOLD PARTICLES (hero / section canvas)
     ---------------------------------------------------------- */
  const particles = {
    init() {
      if (prefersReduced) return;
      const hosts = document.querySelectorAll("[data-particles]");
      if (!hosts.length) return;
      hosts.forEach((host) => {
        const canvas = document.createElement("canvas");
        canvas.className = "hero-particles";
        host.appendChild(canvas);
        const ctx = canvas.getContext("2d");
        let w, h, parts = [], raf = null;
        const DPR = Math.min(window.devicePixelRatio || 1, 2);

        const isMobile = window.innerWidth < 768;
        const resize = () => {
          const r = host.getBoundingClientRect();
          w = r.width; h = r.height;
          canvas.width = w * DPR;
          canvas.height = h * DPR;
          canvas.style.width = w + "px";
          canvas.style.height = h + "px";
          ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
          let count = Math.max(24, Math.min(60, Math.floor(w / 22)));
          if (isMobile) count = Math.max(12, Math.floor(count / 2));
          parts = Array.from({ length: count }, () => spawn(true));
        };

        const spawn = (anywhere) => {
          const rightSide = Math.random() > 0.5;
          return {
            x: anywhere ? Math.random() * w : (rightSide ? w + 10 : -10),
            y: Math.random() * h,
            r: Math.random() * 1.8 + 0.6,
            vy: -(Math.random() * 0.5 + 0.15),
            vx: (Math.random() - 0.5) * 0.35,
            tw: Math.random() * Math.PI * 2,
            tws: 0.02 + Math.random() * 0.03,
            o: Math.random() * 0.5 + 0.25,
          };
        };

        const draw = () => {
          ctx.clearRect(0, 0, w, h);
          parts.forEach((p) => {
            p.x += p.vx; p.y += p.vy; p.tw += p.tws;
            if (p.y < -12) Object.assign(p, spawn(false));
            if (p.x < -12) p.x = w + 12;
            if (p.x > w + 12) p.x = -12;
            const alpha = p.o * (0.5 + 0.5 * Math.sin(p.tw));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(229, 199, 110, ${alpha.toFixed(3)})`;
            ctx.shadowColor = "rgba(217,178,76,.8)";
            ctx.shadowBlur = isMobile ? 0 : 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          });
          raf = requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener("resize", resize, { passive: true });
        draw();
      });
    },
  };

  /* ----------------------------------------------------------
     MOUSE-REACTIVE 3D HERO VISUAL
     ---------------------------------------------------------- */
  const hero3d = {
    init() {
      if (isTouch || prefersReduced) return;
      const wrap = document.querySelector(".hero-scale-wrap");
      if (!wrap) return;
      const hero = document.querySelector(".hero");
      hero.addEventListener("mousemove", (e) => {
        const r = hero.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        wrap.style.transform = `translate(-50%, -50%) rotateY(${px * 14}deg) rotateX(${py * -10}deg) translateY(0)`;
      });
      hero.addEventListener("mouseleave", () => {
        wrap.style.transform = "translate(-50%, -50%)";
      });
    },
  };

  /* ----------------------------------------------------------
     STEP 4 — RIPPLE · MAGNET-HERO · LETTER REVEAL · HERO PARALLAX
     ---------------------------------------------------------- */
  const interact = {
    ripples() {
      if (prefersReduced || isTouch) return;
      const sel = ".sv-btn-primary,.sv-btn-outline,.sv-btn-ghost,.sv-btn-glass," +
                  ".sv-cta-btn,.btn-gold,.btn-glass,.btn-ghost,.btn-light";
      document.addEventListener("pointerdown", (e) => {
        const btn = e.target.closest(sel);
        if (!btn || btn.disabled) return;
        const r = btn.getBoundingClientRect();
        const d = Math.max(r.width, r.height) * 1.4;
        const span = document.createElement("span");
        span.className = "ripple";
        span.style.width = span.style.height = d + "px";
        span.style.left = e.clientX - r.left - d / 2 + "px";
        span.style.top = e.clientY - r.top - d / 2 + "px";
        btn.appendChild(span);
        setTimeout(() => span.remove(), 750);
      });
    },
    magnetHero() {
      if (prefersReduced || isTouch) return;
      document.querySelectorAll(".sv-hero-actions a, .sv-hero-actions button").forEach((el) => {
        if (el.classList.contains("magnetic")) return;
        el.addEventListener("mousemove", (e) => {
          const r = el.getBoundingClientRect();
          const mx = (e.clientX - r.left - r.width / 2) * 0.22;
          const my = (e.clientY - r.top - r.height / 2) * 0.22;
          el.style.setProperty("--mx", mx.toFixed(1) + "px");
          el.style.setProperty("--my", my.toFixed(1) + "px");
          el.style.transform = `translate(${mx}px, ${my}px)`;
        });
        el.addEventListener("mouseleave", () => {
          el.style.transform = "translate(0, 0)";
        });
      });
    },
    letterSplit() {
      if (prefersReduced) return;
      document.querySelectorAll(".sv-hero-title .mask-line, .hero-title .mask-line").forEach((line) => {
        const span = line.querySelector(":scope > span");
        if (!span || span.children.length || !span.textContent.trim()) return;
        const words = span.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        let ci = 0;
        words.forEach((w) => {
          if (/^\s+$/.test(w)) {
            frag.appendChild(document.createTextNode(w));
            return;
          }
          const word = document.createElement("span");
          word.className = "hero-word";
          [...w].forEach((ch) => {
            const c = document.createElement("i");
            c.className = "hero-char";
            c.textContent = ch;
            c.style.setProperty("--c", ci++);
            word.appendChild(c);
          });
          frag.appendChild(word);
        });
        span.innerHTML = "";
        span.appendChild(frag);
        span.classList.add("hero-line");
      });
    },
    heroParallax() {
      if (prefersReduced) return;
      const photo = document.querySelector(".sv-hero-photo");
      const fig = document.querySelector(".sv-hero-fig-scales");
      const wrap = document.querySelector(".sv-hero");
      if (!photo) return;
      const items = [];
      if (photo) items.push({ el: photo, d: 0.06 });
      if (fig) items.push({ el: fig, d: 0.12 });
      let raf = null;
      const update = () => {
        if (!wrap) return;
        const r = wrap.getBoundingClientRect();
        const mid = r.top + r.height / 2 - innerHeight / 2;
        items.forEach(({ el, d }) => {
          el.style.translate = `0 ${(mid * -d).toFixed(1)}px`;
        });
        raf = null;
      };
      window.addEventListener("scroll", () => {
        if (raf) return;
        raf = requestAnimationFrame(update);
      }, { passive: true });
      update();
    },
  };

  /* ----------------------------------------------------------
     BOOT
     ---------------------------------------------------------- */
  const boot = () => {
    sprite.init();
    theme.init();
    (function () {
      const over = document.createElement("div");
      over.className = "page-transition";
      over.innerHTML = '<div class="pt-emblem"><svg aria-hidden="true"><use href="#i-scales"/></svg></div>';
      document.body.appendChild(over);
    })();
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
      const mode = doc.getAttribute("data-theme") || "light";
      b.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
    });
    nav.init();
    reveal.init();
    counters.init();
    tilt.init();
    parallax.init();
    magnetic.init();
    carousel.init();
    accordion.init();
    filters.init();
    forms.init();
    floats.init();
    footerYear.init();
    transitions.init();
    cursor.init();
    particles.init();
    hero3d.init();
    interact.ripples();
    interact.magnetHero();
    interact.heroParallax();
    window.addEventListener("app:loaded", () => interact.letterSplit(), { once: true });
    loader.init();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
