/**
 * Static edge refraction for Chromium. Other engines retain the CSS glass fallback.
 * Work is demand-driven: no canvas/worker/SVG allocation outside the liquid skin.
 * Only near-viewport surfaces get filters; nested settings controls use CSS instead.
 */
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const SELECTOR = ".nav-item, .search-box, .search-engine, .preference-panel";
  const MARGIN = 160;
  const MAX_CACHE = 64;
  const maps = new Map(); // data URLs, no Blob URL lifetime or worker to leak
  const entries = new Map();
  const pending = new Set();
  let svg, defs, frame = 0, sequence = 0, failed = false;
  const supports = typeof CSS !== "undefined" && CSS.supports("backdrop-filter", "url(#x)") &&
    /(?:Chrome|Chromium|Edg)\//.test(navigator.userAgent);
  document.documentElement.dataset.liquidGlassSupported = String(supports);
  if (!supports) return;
  const active = () => document.body.dataset.surface === "liquid" && !document.hidden && !failed;
  const near = (el) => {
    if (!el.isConnected || el.closest("[hidden]")) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 3 && rect.height > 3 && rect.bottom > -MARGIN &&
      rect.top < innerHeight + MARGIN && rect.right > -MARGIN && rect.left < innerWidth + MARGIN;
  };
  const release = (el) => {
    const entry = entries.get(el);
    if (!entry) return;
    entry.filter.remove();
    el.style.removeProperty("backdrop-filter");
    el.style.removeProperty("-webkit-backdrop-filter");
    delete el.dataset.liquidReady;
    entries.delete(el);
  };
  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    pending.clear();
    [...entries.keys()].forEach(release);
    svg?.remove();
    svg = defs = null;
    maps.clear();
  };
  const createSvg = (tag, attributes = {}) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  };
  const fillDisplacementData = (data, w, h, r, b) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let dist;       // 离最近边的距离
        let nx = 0, ny = 0; // 内法线（指向中心方向的单位向量）

        // 判断 corner / edge
        const inLeft   = x < r;
        const inRight  = x >= w - r;
        const inTop    = y < r;
        const inBottom = y >= h - r;

        if (inLeft && inTop) {
          // top-left corner
          const cx = r, cy = r;
          const dx = x - cx, dy = y - cy;
          const dr = Math.sqrt(dx * dx + dy * dy);
          dist = r - dr;
          if (dr > 0.001) { nx = -dx / dr; ny = -dy / dr; }
        } else if (inRight && inTop) {
          const cx = w - 1 - r, cy = r;
          const dx = x - cx, dy = y - cy;
          const dr = Math.sqrt(dx * dx + dy * dy);
          dist = r - dr;
          if (dr > 0.001) { nx = -dx / dr; ny = -dy / dr; }
        } else if (inLeft && inBottom) {
          const cx = r, cy = h - 1 - r;
          const dx = x - cx, dy = y - cy;
          const dr = Math.sqrt(dx * dx + dy * dy);
          dist = r - dr;
          if (dr > 0.001) { nx = -dx / dr; ny = -dy / dr; }
        } else if (inRight && inBottom) {
          const cx = w - 1 - r, cy = h - 1 - r;
          const dx = x - cx, dy = y - cy;
          const dr = Math.sqrt(dx * dx + dy * dy);
          dist = r - dr;
          if (dr > 0.001) { nx = -dx / dr; ny = -dy / dr; }
        } else {
          // 矩形主体：到上下左右的距离取最小
          const dL = x;
          const dR = w - 1 - x;
          const dT = y;
          const dB = h - 1 - y;
          const dH = Math.min(dL, dR);
          const dV = Math.min(dT, dB);
          if (dH < dV) {
            dist = dH;
            nx = (dL < dR) ? 1 : -1;
            ny = 0;
          } else {
            dist = dV;
            nx = 0;
            ny = (dT < dB) ? 1 : -1;
          }
        }

        // bezel 范围之外（中心区）位移 = 0；负距离（角外侧）也 = 0
        // Apple Liquid Glass 风格：边缘折射环 + 中心透镜（基本不变形）。
        // hover 反馈交给 CSS 的 transform: scale 处理，displacement 保持静态。
        let mag = 0;
        if (dist >= 0 && dist < b) {
          const t = dist / b;
          mag = Math.pow(1 - t, 1.5);
        }

        const dx = nx * mag;
        const dy = ny * mag;
        const idx = (y * w + x) * 4;
        // round + clamp
        data[idx]     = Math.max(0, Math.min(255, Math.round(128 + dx * 127)));
        data[idx + 1] = Math.max(0, Math.min(255, Math.round(128 + dy * 127)));
        data[idx + 2] = 128;
        data[idx + 3] = 255;
      }
    }
  };

  const mapFor = (width, height, radius, bezel) => {
    const scale = Math.min(1, 256 / Math.max(width, height));
    const w = Math.max(2, Math.round(width * scale));
    const h = Math.max(2, Math.round(height * scale));
    const short = Math.min(w, h) / 2;
    const r = Math.min(Math.round(radius * scale), short);
    const b = Math.min(Math.max(1, Math.round(bezel * scale)), short);
    const key = `${w}x${h}r${r}b${b}`;
    if (maps.has(key)) {
      const url = maps.get(key);
      maps.delete(key);
      maps.set(key, url);
      return url;
    }
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    const pixels = ctx.createImageData(w, h);
    fillDisplacementData(pixels.data, w, h, r, b);
    ctx.putImageData(pixels, 0, 0);
    const url = canvas.toDataURL();
    if (url === "data:,") throw new Error("Canvas encoding unavailable");
    maps.set(key, url);
    if (maps.size > MAX_CACHE) maps.delete(maps.keys().next().value);
    return url;
  };

  const setup = (el) => {
    if (!near(el)) { release(el); return; }
    // offset dimensions exclude hover transforms; use the actual density/radius.
    const width = el.offsetWidth, height = el.offsetHeight;
    const radius = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, width / 2, height / 2);
    const bezel = Math.min(16, width / 4, height / 3);
    const geometry = `${width}/${height}/${radius}/${bezel}`;
    if (entries.get(el)?.geometry === geometry) return;
    const url = mapFor(width, height, radius, bezel);
    if (!svg) {
      svg = createSvg("svg", { width: 0, height: 0, "aria-hidden": "true", focusable: "false", "data-liquid-defs": "" });
      svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
      defs = createSvg("defs");
      svg.append(defs);
      document.body.append(svg);
    }
    release(el);
    const id = `lg-${++sequence}`;
    const filter = createSvg("filter", {
      id, x: "0%", y: "0%", width: "100%", height: "100%",
      filterUnits: "objectBoundingBox", primitiveUnits: "userSpaceOnUse",
      "color-interpolation-filters": "sRGB"
    });
    filter.append(createSvg("feImage", {
      href: url, x: 0, y: 0, width, height, result: "displacement", preserveAspectRatio: "none"
    }), createSvg("feDisplacementMap", {
      in: "SourceGraphic", in2: "displacement", scale: bezel * 2,
      xChannelSelector: "R", yChannelSelector: "G"
    }));
    defs.append(filter);
    const chain = `url(#${id}) blur(2px) saturate(135%)`;
    el.style.backdropFilter = chain;
    el.style.webkitBackdropFilter = chain;
    el.dataset.liquidReady = "true";
    entries.set(el, { filter, geometry });
  };
  const flush = () => {
    frame = 0;
    if (!active()) return;
    const start = performance.now();
    try {
      while (pending.size) {
        const el = pending.values().next().value;
        pending.delete(el);
        setup(el);
        // Bound per-frame work, including on large bookmark pages.
        if (performance.now() - start >= 4) break;
      }
    } catch {
      failed = true;
      reset();
      document.documentElement.dataset.liquidGlassSupported = "false";
    }
    if (pending.size && active()) frame = requestAnimationFrame(flush);
  };
  const enqueue = (el) => {
    if (!active()) return;
    pending.add(el);
    if (!frame) frame = requestAnimationFrame(flush);
  };
  const refresh = () => {
    if (!active()) { reset(); return; }
    entries.forEach((_, el) => { if (!near(el)) release(el); });
    document.querySelectorAll(SELECTOR).forEach(el => { if (active() && near(el)) enqueue(el); });
  };
  const intersection = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(changes => {
    changes.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) enqueue(target);
      else { pending.delete(target); release(target); }
    });
  }, { rootMargin: `${MARGIN}px` }) : null;
  const resize = typeof ResizeObserver !== "undefined" ? new ResizeObserver(changes => {
    changes.forEach(({ target }) => { if (active() && near(target)) enqueue(target); });
  }) : null;
  const observe = (node) => {
    if (!(node instanceof Element)) return;
    const elements = [...node.querySelectorAll(SELECTOR)];
    if (node.matches(SELECTOR)) elements.push(node);
    elements.forEach(el => { intersection?.observe(el); resize?.observe(el); if (active() && near(el)) enqueue(el); });
  };
  const unobserve = (node) => {
    if (!(node instanceof Element)) return;
    const elements = [...node.querySelectorAll(SELECTOR)];
    if (node.matches(SELECTOR)) elements.push(node);
    elements.forEach(el => {
      intersection?.unobserve(el); resize?.unobserve(el); pending.delete(el); release(el);
    });
  };
  new MutationObserver(changes => {
    let needsRefresh = false;
    changes.forEach(change => {
      if (change.type === "attributes") needsRefresh = true;
      else {
        change.removedNodes.forEach(unobserve);
        change.addedNodes.forEach(observe);
      }
    });
    if (needsRefresh) refresh();
  }).observe(document.body, { subtree: true, childList: true, attributes: true,
    attributeFilter: ["data-surface", "data-density", "hidden", "open"] });
  // Observer callbacks cover modern engines; this keeps the fallback functional.
  if (!intersection) window.addEventListener("scroll", refresh, { passive: true });
  window.addEventListener("resize", refresh, { passive: true });
  document.addEventListener("visibilitychange", refresh);
  window.addEventListener("pagehide", reset);
  window.addEventListener("pageshow", refresh);
  observe(document.body);
})();
