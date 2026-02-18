/**
 * Waveline-BG v1.0.0 — Demo page logic
 *
 * Handles:
 * - Initial rendering of body background and demo sections
 * - Interactive playground controls (sliders, color picker, seed input)
 * - Live preview rendering
 * - Config display, SVG download, clipboard copy
 */
// ── Utility ──────────────────────────────────────────────────────────────────
/** Shorthand for document.getElementById(). */
function g(id) {
  return document.getElementById(id);
}
/**
 * Reads the current playground control values and returns a WavelineBG
 * options object. backgroundColor is always set to white so the SVG layer
 * provides its own fill (required for inline mode — see README).
 * @returns {object} WavelineBG options.
 */
function getConfig() {
  return {
    density: parseInt(g('density').value),
    freq: parseInt(g('freq').value),
    amplitude: parseFloat(g('amplitude').value),
    bias: parseFloat(g('bias').value),
    strokeMin: parseFloat(g('strokeMin').value),
    strokeMax: parseFloat(g('strokeMax').value),
    opacityMin: parseFloat(g('opacityMin').value),
    opacityMax: parseFloat(g('opacityMax').value),
    strokeColor: g('strokeColor').value,
    seed: parseInt(g('seed').value),
    backgroundColor: '#ffffff' // inline mode: SVG carries its own background fill
  };
}
/**
 * Removes the inline SVG wrapper previously injected by WavelineBG.apply()
 * in 'inline' mode. Must be called before re-applying to avoid stacking
 * multiple SVG layers inside the same element.
 * @param {HTMLElement} el - The container element.
 */
function removeInlineWrapper(el) {
  var w = el.querySelector('div[style*="position: absolute"]');
  if (w) w.remove();
}
// ── Display updates ───────────────────────────────────────────────────────────
/**
 * Refreshes the numeric labels displayed next to each slider.
 * Integer controls (density, freq) show 0 decimal places;
 * float controls (amplitude, bias, stroke*, opacity*) show 2.
 */
function updateDisplays() {
  var map = {
    density: 0,
    freq: 0,
    amplitude: 2,
    bias: 2,
    strokeMin: 2,
    strokeMax: 2,
    opacityMin: 2,
    opacityMax: 2
  };
  for (var k in map) {
    if (!map.hasOwnProperty(k)) continue;
    // Build the display element id: e.g. "density" → "vDensity"
    var displayId = 'v' + k.charAt(0).toUpperCase() + k.slice(1);
    g(displayId).textContent = parseFloat(g(k).value).toFixed(map[k]);
  }
}
// ── Live Preview ──────────────────────────────────────────────────────────────
/**
 * Re-renders the live preview zone with the current control values.
 * Removes the previous SVG wrapper, applies a fresh one in inline mode,
 * and updates the config display box.
 */
function updatePreview() {
  var preview = g('livePreview');
  // Remove previous SVG wrapper before re-applying
  removeInlineWrapper(preview);
  // Apply using inline mode: SVG is a real DOM node behind the content
  WavelineBG.apply(preview, getConfig(), 'inline');
  // Update the copyable config snippet
  g('configBox').textContent =
    'WavelineBG.apply(element, ' + JSON.stringify(getConfig(), null, 2) + ", 'inline');";
}
// ── Initialisation ────────────────────────────────────────────────────────────
/**
 * Runs once the page (including external scripts) has fully loaded.
 * Applies all initial backgrounds and sets up the playground.
 */
window.addEventListener('load', function () {

  // 1. Body background — dataUrl mode, subtle light-grey wavelines
  WavelineBG.apply(document.body, {
    density: 10,
    freq: 5,
    seed: 12345,
    strokeColor: '#cccccc',
    opacityMin: 0.25,
    opacityMax: 0.55
  }, 'dataUrl');

  // 2. Demo 1 — dataUrl mode
  WavelineBG.apply(g('demo1'), {
    density: 8,
    freq: 4,
    seed: 9999,
    strokeColor: '#aaaaaa'
  }, 'dataUrl');

  // 3. Demo 2 — inline mode (SVG inserted as a DOM node)
  WavelineBG.apply(g('demo2'), {
    density: 12,
    freq: 6,
    amplitude: 1.2,
    seed: 5555,
    strokeColor: '#999999',
    strokeMin: 0.12,
    strokeMax: 0.32,
    backgroundColor: '#ffffff'
  }, 'inline');

  // Playground: initialise display labels and render first preview
  updateDisplays();
  updatePreview();
});
// ── Section regenerate buttons ────────────────────────────────────────────────
/** Regenerates the body background with a random seed. */
function changeBodyBg() {
  WavelineBG.apply(document.body, {
    density: 10,
    freq: 5,
    seed: Math.floor(Math.random() * 1e9),
    strokeColor: '#cccccc',
    opacityMin: 0.25,
    opacityMax: 0.55
  }, 'dataUrl');
}
/** Regenerates demo1 (dataUrl mode) with a random seed. */
function changeDemo1() {
  WavelineBG.apply(g('demo1'), {
    density: 8,
    freq: 4,
    seed: Math.floor(Math.random() * 1e9),
    strokeColor: '#aaaaaa'
  }, 'dataUrl');
}
/**
 * Regenerates demo2 (inline mode) with a random seed.
 * Removes the previous SVG wrapper first to avoid stacking layers.
 */
function changeDemo2() {
  removeInlineWrapper(g('demo2'));
  WavelineBG.apply(g('demo2'), {
    density: 12,
    freq: 6,
    amplitude: 1.2,
    seed: Math.floor(Math.random() * 1e9),
    strokeColor: '#999999',
    strokeMin: 0.12,
    strokeMax: 0.32,
    backgroundColor: '#ffffff'
  }, 'inline');
}
// ── Playground control listeners ──────────────────────────────────────────────
// Attach input listeners to all controls; any change triggers a full redraw.
['density', 'freq', 'amplitude', 'bias',
  'strokeMin', 'strokeMax', 'opacityMin', 'opacityMax',
  'strokeColor', 'seed'].forEach(function (id) {
    g(id).addEventListener('input', function () {
      updateDisplays();
      updatePreview();
    });
  });
// ── Playground action buttons ─────────────────────────────────────────────────
/** Sets a random seed and re-renders the preview. */
function randomSeed() {
  g('seed').value = Math.floor(Math.random() * 1e9);
  updatePreview();
}
/** Resets all controls to their default values and re-renders. */
function resetControls() {
  g('density').value = 10;
  g('freq').value = 5;
  g('amplitude').value = 1;
  g('bias').value = 0;
  g('strokeMin').value = 0.16;
  g('strokeMax').value = 0.26;
  g('opacityMin').value = 0.5;
  g('opacityMax').value = 1;
  g('strokeColor').value = '#888888';
  g('seed').value = 12345;
  updateDisplays();
  updatePreview();
}
/**
 * Triggers a download of the current SVG as a .svg file.
 * Uses a temporary <a> element and a Blob object URL.
 */
function downloadSvg() {
  var svg = WavelineBG.generateSvg(getConfig());
  var blob = new Blob([svg], { type: 'image/svg+xml' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = 'waveline-bg-' + g('seed').value + '.svg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
/**
 * Copies the current WavelineBG.apply() config snippet to the clipboard.
 * Falls back to an alert if the Clipboard API is unavailable.
 */
function copyConfig() {
  var code = 'WavelineBG.apply(element, '
    + JSON.stringify(getConfig(), null, 2)
    + ", 'inline');";
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code)
      .then(function () { alert('Copied!'); })
      .catch(function () { alert('Copy failed — see box below.'); });
  } else {
    alert('Clipboard API not available — copy from the box below.');
  }
}
