/**
 * Waveline-BG v1.0.0
 * Organic waveline backgrounds for modern web design.
 *
 * (c) 2026 Cédric BEUZIT – MIT License
 * 
 * Generates topographic-style SVG patterns using d3-contour (marching squares)
 * over a procedural scalar field built from superimposed sine waves.
 *
 * Dependencies : d3-contour v2 (peer dependency, loaded via CDN or bundler)
 * @license MIT
 */
(function(window) {
  'use strict';

  // ── PRNG ──────────────────────────────────────────────────────────────────
  /**
   * Mulberry32 — fast, deterministic 32-bit pseudo-random number generator.
   * Returns a function that yields floats in [0, 1).
   * Using a seeded PRNG ensures the same seed always produces the same terrain.
   * @param {number} seed - Integer seed value.
   * @returns {function(): number}
   */
  function mulberry32(seed) {
    return function() {
      var t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // ── SCALAR FIELD ──────────────────────────────────────────────────────────
  /**
   * Generates a flat array of scalar values representing a 2D terrain.
   * The field is built by summing three phase-shifted sine waves at different
   * frequencies and directions, producing organic, non-repeating patterns.
   *
   * Array layout: row-major, i.e. values[j * gridW + i] = value at (i, j).
   * This matches the format expected by d3.contours().size([gridW, gridH]).
   *
   * @param {number} gridW     - Grid width in cells.
   * @param {number} gridH     - Grid height in cells.
   * @param {number} freq      - Base frequency multiplier (controls wave density).
   * @param {number} amplitude - Overall contrast of the terrain.
   * @param {number} seed      - PRNG seed for reproducible results.
   * @returns {number[]}
   */
  function generateField(gridW, gridH, freq, amplitude, seed) {
    var values = [];
    var rnd    = mulberry32(seed >>> 0);
    // Random phase offsets ensure visual variety across seeds
    var phase1 = rnd() * Math.PI * 2;
    var phase2 = rnd() * Math.PI * 2;
    var phase3 = rnd() * Math.PI * 2;
    var f      = freq / 10; // normalize freq to a usable range

    for (var j = 0; j < gridH; j++) {
      for (var i = 0; i < gridW; i++) {
        // Normalize coords to [-0.5, 0.5] for frequency-independent scaling
        var nx = i / gridW - 0.5;
        var ny = j / gridH - 0.5;
        // Three sine layers: horizontal/vertical, diagonal, counter-diagonal
        var v1 = Math.sin(nx * Math.PI * 2 * f + phase1) + Math.sin(ny * Math.PI * 2 * f * 0.9 + phase2);
        var v2 = 0.6 * Math.sin((nx + ny) * Math.PI * 2 * f * 0.7 + phase3);
        var v3 = 0.4 * Math.sin((nx - ny) * Math.PI * 2 * f * 0.5 - phase2);
        values.push((v1 + v2 + v3) * amplitude);
      }
    }
    return values;
  }

  // ── CONTOUR → SVG PATH ────────────────────────────────────────────────────
  /**
   * Converts a single d3-contour GeoJSON MultiPolygon into an SVG path string.
   *
   * d3-contour produces coordinates in grid-cell units [0, gridW] × [0, gridH].
   * We scale them to SVG user units using sx/sy, then subtract the bleed offset
   * so the terrain extends slightly beyond the visible viewBox on all sides.
   * This ensures contour artefacts at the grid edges are clipped out of view.
   *
   * @param {object} contour - d3 GeoJSON MultiPolygon contour object.
   * @param {number} sx      - Horizontal scale factor (SVG units per grid cell).
   * @param {number} sy      - Vertical scale factor (SVG units per grid cell).
   * @param {number} ox      - Horizontal offset (bleed in SVG units).
   * @param {number} oy      - Vertical offset (bleed in SVG units).
   * @returns {string} SVG path data string.
   */
  function contourToPath(contour, sx, sy, ox, oy) {
    var d = '';
    contour.coordinates.forEach(function(poly) {
      poly.forEach(function(ring) {
        ring.forEach(function(pt, idx) {
          var x = pt[0] * sx - ox;
          var y = pt[1] * sy - oy;
          d += (idx === 0 ? 'M ' : 'L ') + x.toFixed(3) + ' ' + y.toFixed(3) + ' ';
        });
        d += 'Z '; // close each ring
      });
    });
    return d.trim();
  }

  // ── BIAS ──────────────────────────────────────────────────────────────────
  /**
   * Applies a power-curve bias to a normalized value u ∈ [0, 1].
   * Positive bias pushes contours toward the lower end (denser at bottom).
   * Negative bias pushes them toward the upper end (denser at top).
   * At bias=0 the distribution is linear.
   *
   * @param {number} u    - Input value in [0, 1].
   * @param {number} bias - Bias amount in [-1, 1].
   * @returns {number}
   */
  function applyBias(u, bias) {
    if (bias === 0) return u;
    if (bias > 0)   return Math.pow(u, 1 + bias);
    return 1 - Math.pow(1 - u, 1 - bias);
  }

  // ── SVG GENERATION ────────────────────────────────────────────────────────
  /**
   * Generates a complete SVG string representing the waveline pattern.
   *
   * The terrain grid is mapped onto a slightly larger area than the viewBox
   * (controlled by the bleed factor). A <clipPath> then clips the SVG to
   * the exact viewBox bounds, removing any contour artefacts at grid edges.
   *
   * @param {object} options - Configuration object (see README for full list).
   * @returns {string} SVG markup as a string.
   */
  function generateWavelineSvg(options) {
    options = options || {};

    // Canvas dimensions in SVG user units (default: 16:9 aspect ratio)
    var width      = options.width      || 100;
    var height     = options.height     || 56.25;

    // Grid resolution: more cells = finer contours, but slower generation
    var gridWidth  = options.gridWidth  || 160;
    var gridHeight = options.gridHeight || 90;

    // Terrain parameters
    var density    = options.density    || 10;   // number of contour lines
    var freq       = options.freq       || 5;    // wave frequency
    var amplitude  = options.amplitude  || 1.0;  // terrain contrast

    // Stroke appearance
    var strokeMin  = options.strokeMin  !== undefined ? options.strokeMin  : 0.16;
    var strokeMax  = options.strokeMax  !== undefined ? options.strokeMax  : 0.26;
    var opacityMin = options.opacityMin !== undefined ? options.opacityMin : 0.5;
    var opacityMax = options.opacityMax !== undefined ? options.opacityMax : 1.0;

    var bias        = options.bias        || 0;
    var seed        = options.seed        !== undefined ? options.seed : Math.floor(Math.random() * 1e9);
    var strokeColor = options.strokeColor     || '#888888';
    var bgColor     = options.backgroundColor || 'transparent';

    if (typeof d3 === 'undefined' || !d3.contours) {
      throw new Error('d3-contour is required. Load it before waveline-bg.js.');
    }

    // ── Bleed: extend terrain beyond the viewBox ───────────────────────────
    // d3-contour generates artefact lines at the exact boundaries of the grid.
    // By mapping the grid onto a zone 10% larger on each side, these artefacts
    // fall outside the viewBox and are removed by the clipPath.
    var bleed = 0.10;
    var fullW = width  * (1 + bleed * 2); // total mapped width  (120% of viewBox)
    var fullH = height * (1 + bleed * 2); // total mapped height (120% of viewBox)
    var ox    = width  * bleed;           // left/right bleed in SVG units
    var oy    = height * bleed;           // top/bottom bleed in SVG units
    var sx    = fullW / (gridWidth  - 1); // horizontal scale: grid cell → SVG units
    var sy    = fullH / (gridHeight - 1); // vertical scale:   grid cell → SVG units

    // ── Generate scalar field and compute contour thresholds ───────────────
    var field = generateField(gridWidth, gridHeight, freq, amplitude, seed);
    var min   = Math.min.apply(null, field);
    var max   = Math.max.apply(null, field);

    // Distribute thresholds evenly across the field range, with optional bias
    var levels = [];
    for (var k = 1; k <= density; k++) {
      var u = k / (density + 1);
      levels.push(min + applyBias(u, bias) * (max - min));
    }

    // Run marching squares via d3-contour
    var contourData = d3.contours()
      .size([gridWidth, gridHeight])
      .smooth(true)
      .thresholds(levels)(field);

    // ── Build SVG string ───────────────────────────────────────────────────
    // Use a unique clipPath id per seed to avoid collisions when multiple
    // instances are rendered on the same page.
    var clipId = 'wlbg-' + (seed % 999983);

    var svg = '<svg xmlns="http://www.w3.org/2000/svg"'
            + ' viewBox="0 0 ' + width + ' ' + height + '"'
            + ' preserveAspectRatio="xMidYMid slice">'
            + '<defs><clipPath id="' + clipId + '">'
            + '<rect x="0" y="0" width="' + width + '" height="' + height + '"/>'
            + '</clipPath></defs>'
            // Background fill (transparent by default; set backgroundColor for inline mode)
            + '<rect width="' + width + '" height="' + height + '" fill="' + bgColor + '"/>'
            + '<g clip-path="url(#' + clipId + ')">';

    // Render each contour as a stroked path.
    // Stroke width and opacity vary linearly from inner to outer contours,
    // creating a subtle depth effect.
    contourData.forEach(function(c, idx) {
      var t  = idx / (contourData.length - 1 || 1); // normalized position [0, 1]
      var d  = contourToPath(c, sx, sy, ox, oy);
      var sw = strokeMin + (strokeMax - strokeMin) * t;       // thin → thick
      var op = opacityMin + (opacityMax - opacityMin) * (1 - t); // opaque → faint
      svg += '<path d="' + d + '"'
           + ' fill="none"'
           + ' stroke="' + strokeColor + '"'
           + ' stroke-width="' + sw + '"'
           + ' stroke-opacity="' + op + '"'
           + ' stroke-linejoin="round"'
           + ' stroke-linecap="round"/>';
    });

    svg += '</g></svg>';
    return svg;
  }

  // ── APPLY ─────────────────────────────────────────────────────────────────
  /**
   * Applies a waveline background to a DOM element.
   *
   * Two modes are available:
   *
   * - 'dataUrl' (default): encodes the SVG as a data URI and sets it as the
   *   element's CSS background-image. Fast and simple; SVG is not in the DOM.
   *
   * - 'inline': inserts the SVG as a real DOM node inside a positioned wrapper
   *   (position:absolute; z-index:-1), placed behind the element's content.
   *   The element gets position:relative if it was static.
   *   Use backgroundColor option to provide the fill; do not set a CSS
   *   background on the container, as it would hide the SVG layer.
   *
   * When regenerating in inline mode, remove the previous wrapper first:
   *   var w = el.querySelector('div[style*="position: absolute"]');
   *   if (w) w.remove();
   *
   * @param {HTMLElement} element - Target DOM element.
   * @param {object}      options - Same options as generateWavelineSvg().
   * @param {string}      mode    - 'dataUrl' or 'inline'. Default: 'dataUrl'.
   */
  function applyWavelineBackground(element, options, mode) {
    options = options || {};
    mode    = mode || 'dataUrl';

    var svgString = generateWavelineSvg(options);

    if (mode === 'dataUrl') {
      // Encode as a percent-encoded data URI and apply as CSS background
      var encoded = encodeURIComponent(svgString);
      element.style.backgroundImage    = 'url("data:image/svg+xml;charset=UTF-8,' + encoded + '")';
      element.style.backgroundSize     = 'cover';
      element.style.backgroundPosition = 'center';
      element.style.backgroundRepeat   = 'no-repeat';
    } else {
      // Create a full-bleed absolutely positioned wrapper behind the content
      var wrapper = document.createElement('div');
      wrapper.style.position      = 'absolute';
      wrapper.style.inset         = '0';        // top/right/bottom/left: 0
      wrapper.style.zIndex        = '-1';       // behind all content
      wrapper.style.pointerEvents = 'none';     // non-interactive
      wrapper.style.overflow      = 'hidden';   // safety clip

      wrapper.innerHTML = svgString;

      // Make the SVG fill the wrapper exactly, without inline spacing
      var svgEl = wrapper.querySelector('svg');
      svgEl.style.width   = '100%';
      svgEl.style.height  = '100%';
      svgEl.style.display = 'block'; // remove default inline bottom gap

      // Ensure the container establishes a stacking context for the wrapper
      var pos = window.getComputedStyle(element).position;
      if (pos === 'static' || pos === '') element.style.position = 'relative';

      // Insert before first child so the wrapper stays at the bottom of the stack
      element.insertBefore(wrapper, element.firstChild);
    }
  }

  // ── PUBLIC API ────────────────────────────────────────────────────────────
  /**
   * WavelineBG public API exposed on window.
   *
   * @property {string}   version     - Library version string.
   * @property {function} generateSvg - Generates and returns an SVG string.
   * @property {function} apply       - Applies background to a DOM element.
   */
  window.WavelineBG = {
    version:     '1.0.0',
    generateSvg: generateWavelineSvg,
    apply:       applyWavelineBackground
  };

})(window);
