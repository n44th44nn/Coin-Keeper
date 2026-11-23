/* ==========================================================================
   CoinKeeper Inline SVG Icon Factory (Aman tanpa innerHTML)
   ========================================================================== */

(function (global) {
  'use strict';

  const CoinKeeper = (global.CoinKeeper = global.CoinKeeper || {});
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const ICON_DEFS = {
    wallet: [
      { tag: 'rect', attrs: { x: '3', y: '6', width: '18', height: '13', rx: '2.5' } },
      { tag: 'path', attrs: { d: 'M3 10h18' } },
      { tag: 'circle', attrs: { cx: '16.5', cy: '14.5', r: '1.25', fill: 'currentColor', stroke: 'none' } }
    ],
    home: [
      { tag: 'path', attrs: { d: 'M3 10.5 12 3l9 7.5' } },
      { tag: 'path', attrs: { d: 'M5 9.5V20h5v-5.5h4V20h5V9.5' } }
    ],
    list: [
      { tag: 'path', attrs: { d: 'M8 6h13M8 12h13M8 18h13' } },
      { tag: 'circle', attrs: { cx: '4', cy: '6', r: '1', fill: 'currentColor', stroke: 'none' } },
      { tag: 'circle', attrs: { cx: '4', cy: '12', r: '1', fill: 'currentColor', stroke: 'none' } },
      { tag: 'circle', attrs: { cx: '4', cy: '18', r: '1', fill: 'currentColor', stroke: 'none' } }
    ],
    budget: [
      { tag: 'rect', attrs: { x: '3', y: '5', width: '18', height: '14', rx: '2' } },
      { tag: 'path', attrs: { d: 'M3 10h18' } },
      { tag: 'path', attrs: { d: 'M7 15h6' } }
    ],
    chart: [
      { tag: 'path', attrs: { d: 'M4 20V10M10 20V4M16 20v-7M21 20H3' } }
    ],
    piggy: [
      { tag: 'path', attrs: { d: 'M19 11c0-3.3-3.1-6-7-6s-7 2.7-7 6c0 2.1 1.2 4 3 5v3h3v-2h2v2h3v-3c1.8-1 3-2.9 3-5Z' } },
      { tag: 'path', attrs: { d: 'M19 11h2v2h-2M10 8h4' } },
      { tag: 'circle', attrs: { cx: '15', cy: '10', r: '0.8', fill: 'currentColor', stroke: 'none' } }
    ],
    trash: [
      { tag: 'path', attrs: { d: 'M4 7h16' } },
      { tag: 'path', attrs: { d: 'M9 7V4h6v3' } },
      { tag: 'path', attrs: { d: 'M6 7l1 13h10l1-13' } },
      { tag: 'path', attrs: { d: 'M10 11v5M14 11v5' } }
    ],
    check: [
      { tag: 'path', attrs: { d: 'M5 12.5 9.5 17 19 7.5' } }
    ],
    warning: [
      { tag: 'path', attrs: { d: 'M12 3.5 21 19.5H3L12 3.5Z' } },
      { tag: 'path', attrs: { d: 'M12 10v4.5' } },
      { tag: 'circle', attrs: { cx: '12', cy: '17', r: '0.9', fill: 'currentColor', stroke: 'none' } }
    ],
    alert: [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '9' } },
      { tag: 'path', attrs: { d: 'M12 8v5' } },
      { tag: 'circle', attrs: { cx: '12', cy: '16', r: '0.9', fill: 'currentColor', stroke: 'none' } }
    ],
    close: [
      { tag: 'path', attrs: { d: 'M6 6l12 12M18 6 6 18' } }
    ],
    plus: [
      { tag: 'path', attrs: { d: 'M12 5v14M5 12h14' } }
    ],
    undo: [
      { tag: 'path', attrs: { d: 'M9 14 4 9l5-5' } },
      { tag: 'path', attrs: { d: 'M4 9h10a5 5 0 1 1 0 10h-3' } }
    ],
    info: [
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '9' } },
      { tag: 'path', attrs: { d: 'M12 11v5' } },
      { tag: 'circle', attrs: { cx: '12', cy: '8', r: '0.9', fill: 'currentColor', stroke: 'none' } }
    ],
    eye: [
      { tag: 'path', attrs: { d: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z' } },
      { tag: 'circle', attrs: { cx: '12', cy: '12', r: '3' } }
    ],
    eyeOff: [
      { tag: 'path', attrs: { d: 'M17.94 17.94A10.07 10.07 0 0 1 12 19c-6.4 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94' } },
      { tag: 'path', attrs: { d: 'M9.9 4.24A9.12 9.12 0 0 1 12 4c6.4 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19' } },
      { tag: 'path', attrs: { d: 'M14.12 14.12a3 3 0 1 1-4.24-4.24' } },
      { tag: 'line', attrs: { x1: '2', y1: '2', x2: '22', y2: '22' } }
    ]
  };

  function createIcon(name, size) {
    const dim = size || 20;
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', String(dim));
    svg.setAttribute('height', String(dim));
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    const shapes = ICON_DEFS[name] || ICON_DEFS.info;
    shapes.forEach(function (def) {
      const shape = document.createElementNS(SVG_NS, def.tag);
      Object.keys(def.attrs).forEach(function (k) {
        shape.setAttribute(k, def.attrs[k]);
      });
      svg.appendChild(shape);
    });

    return svg;
  }

  CoinKeeper.icons = {
    create: createIcon
  };
})(window);
