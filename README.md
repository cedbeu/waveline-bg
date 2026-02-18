# Waveline-BG v1.0.0

> **Organic waveline backgrounds for smooth web design**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/waveline-bg)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)]()

Generate flowing SVG waveline patterns inspired by topographic maps using d3-contour (marching squares) over a procedural scalar field built from superimposed sine waves. Perfect for hero sections, cards, and decorative UI elements.

**[View Interactive Demo](index.html)** | **[GitHub](https://github.com/cedbeu/waveline-bg)**

---

## Files

| File                 | Role                                                            |
|----------------------|-----------------------------------------------------------------|
| src/waveline-bg.js   | Library — no dependencies except d3-contour (currently via CDN) |
| index.html      | Demo page                                                       |
| index.css       | Demo page styles                                                |
| index.js        | Demo page logic                                                 |

---

## ✨ Features

- 🎨 **Organic waveline patterns** - Smooth, flowing lines inspired by topographic maps
- 🎲 **Deterministic generation** - Same seed = same pattern (perfect for design systems)
- 🚀 **Zero dependencies** - Only requires d3-contour (loaded via CDN)
- ⚡ **Lightweight** - ~8KB minified
- 🎮 **Highly customizable** - Control density, frequency, colors, opacity, and more
- 📱 **Responsive** - SVG-based, scales perfectly
- 🔧 **Two modes** - dataUrl (fast) or inline (quality)
- 🌈 **Framework agnostic** - Works with vanilla JS, React, Vue, Angular

---

## 📦 Installation

### Option 1: Direct Download

1. Download `src/waveline-bg.js` from this repository
2. Include it in your HTML:

```html
<!-- Load d3-contour (dependency) -->
<script src="https://d3js.org/d3-contour.v2.min.js"></script>

<!-- Load Waveline-BG -->
<script src="./waveline-bg.js"></script>
```

### Option 2: CDN (coming soon)

```html
<script src="https://cdn.jsdelivr.net/npm/waveline-bg@1.0.0/waveline-bg.min.js"></script>
```

### Option 3: npm (coming soon)

```bash
npm install waveline-bg
```

---

## 🚀 Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <!-- Your content -->
  <div id="hero">
    <h1>Welcome</h1>
  </div>

  <!-- Load dependencies -->
  <script src="https://d3js.org/d3-contour.v2.min.js"></script>
  <script src="./waveline-bg.js"></script>

  <!-- Apply background -->
  <script>
    // Apply to body
    WavelineBG.apply(document.body, {
      density: 10,
      freq: 5,
      seed: 12345,
      strokeColor: '#d4d4d4'
    }, 'dataUrl');

    // Apply to specific element
    const hero = document.getElementById('hero');
    WavelineBG.apply(hero, {
      density: 8,
      freq: 4,
      strokeColor: '#c0c0c0'
    }, 'inline');
  </script>
</body>
</html>
```

---

## 🎨 API Reference

### `WavelineBG.apply(element, options, mode)`

Applies a waveline background to an HTML element.

**Parameters:**

- `element` (HTMLElement) - Target element
- `options` (Object) - Configuration object (see below)
- `mode` (String) - `'dataUrl'` or `'inline'`

**Returns:** `void`

---

### `WavelineBG.generateSvg(options)`

Generates and returns SVG string (useful for export/download).

**Parameters:**

- `options` (Object) - Configuration object

**Returns:** `String` - SVG markup

---

## ⚙️ Configuration Options

| Option | Type | Default | Range | Description |
|--------|------|---------|-------|-------------|
| `width` | Number | 100 | > 0 | SVG viewBox width |
| `height` | Number | 56.25 | > 0 | SVG viewBox height (16:9 aspect ratio) |
| `gridWidth` | Number | 160 | > 0 | Field resolution (horizontal) |
| `gridHeight` | Number | 90 | > 0 | Field resolution (vertical) |
| **`density`** | Number | 10 | 5-20 | **Number of wavelines** |
| **`freq`** | Number | 5 | 2-12 | **Terrain complexity / frequency** |
| **`amplitude`** | Number | 1.0 | 0.4-2.0 | **Terrain contrast / amplitude** |
| `strokeMin` | Number | 0.16 | > 0 | Minimum stroke width |
| `strokeMax` | Number | 0.26 | > 0 | Maximum stroke width |
| `opacityMin` | Number | 0.5 | 0-1 | Minimum stroke opacity |
| `opacityMax` | Number | 1.0 | 0-1 | Maximum stroke opacity |
| `bias` | Number | 0 | -1 to +1 | Threshold distribution (-1: valleys, 0: linear, +1: peaks) |
| **`seed`** | Number | random | 0 to 999,999,999 | **Deterministic seed** (same seed = same pattern) |
| **`strokeColor`** | String | '#d4d4d4' | Any CSS color | **Stroke color** |
| `backgroundColor` | String | 'transparent' | Any CSS color | Background fill color |

**Bold** = Most commonly adjusted parameters

---

## 🌱 Understanding the Seed

### What is the seed?

The `seed` is a **deterministic random number** that controls **ONLY the terrain shape** (where waves and valleys appear).

### What the seed controls vs. doesn't control

| ✅ Controlled by seed | ❌ NOT controlled by seed |
|----------------------|---------------------------|
| Position of waves/valleys | Number of lines (`density`) |
| Terrain layout | Terrain complexity (`freq`) |
| Wave flow direction | Stroke color |
| - | Stroke width |
| - | Opacity |
| - | All other visual parameters |

**Think of it this way:**
- The `seed` generates the **terrain canvas** (the wave pattern itself)
- All other parameters control **how you draw** that terrain

### Seed format and valid values

**Type:** Integer (whole number)

**Valid range:** `0` to `4,294,967,295` (32-bit unsigned integer)

**Recommended:** Use integers between `0` and `999,999,999` for simplicity.

**Examples:**
```javascript
seed: 12345       // Valid - reproducible pattern
seed: 0           // Valid - minimum value
seed: 999999999   // Valid - easy to remember
```

### Usage patterns

#### 1. Deterministic (reproducible) - Fixed seed

```javascript
WavelineBG.apply(element, {
  seed: 12345,  // Same seed = same pattern every time
  density: 10,
  freq: 5
}, 'dataUrl');
```

**Use case:** Fixed design, brand consistency, version control

#### 2. Random (different every time) - Generate random seed

```javascript
WavelineBG.apply(element, {
  seed: Math.floor(Math.random() * 1e9),  // New pattern each time
  density: 10,
  freq: 5
}, 'dataUrl');
```

**Use case:** "Regenerate" button, dynamic backgrounds

#### 3. Automatic random - Omit seed parameter

```javascript
WavelineBG.apply(element, {
  // No seed specified → automatically random
  density: 10,
  freq: 5
}, 'dataUrl');
```

**Use case:** Simple usage, don't care about reproducibility

### Examples demonstrating seed behavior

```javascript
// Same seed + same params = identical output
WavelineBG.apply(elem1, { seed: 12345, density: 10, freq: 5 });
WavelineBG.apply(elem2, { seed: 12345, density: 10, freq: 5 });
// → elem1 and elem2 look IDENTICAL


// Same seed + different params = same terrain, different style
WavelineBG.apply(elem1, { seed: 12345, density: 5, freq: 3 });   // Sparse
WavelineBG.apply(elem2, { seed: 12345, density: 20, freq: 10 });  // Dense
// → Waves in same positions, but different visual style


// Different seed + same params = different terrain, same style
WavelineBG.apply(elem1, { seed: 111, density: 10, freq: 5 });
WavelineBG.apply(elem2, { seed: 222, density: 10, freq: 5 });
// → Same visual style, but completely different wave patterns
```

---

## 🔧 Modes

### `dataUrl` mode (recommended for dynamic backgrounds)

```javascript
WavelineBG.apply(element, options, 'dataUrl');
```

- ✅ SVG encoded as data URL
- ✅ Applied via CSS `background-image`
- ✅ Fast to regenerate
- ✅ Good for frequently changing backgrounds
- ✅ Works with `background-size`, `background-position`

### `inline` mode (recommended for static backgrounds)

```javascript
WavelineBG.apply(element, options, 'inline');
```

- ✅ SVG inserted directly into DOM
- ✅ Better vector quality
- ✅ Good for fixed backgrounds
- ✅ Easier to inspect in DevTools
- ⚠️ Slightly more expensive to regenerate

**Tip:** Use `dataUrl` for body backgrounds, `inline` for specific elements.

---

## 💡 Tips & Best Practices

### Recommended parameter ranges

For natural-looking results:

- **`density`**: 8-12 (balanced appearance)
- **`freq`**: 4-6 (natural terrain)
- **`amplitude`**: 0.8-1.2 (subtle to moderate relief)
- **`bias`**: 0 (linear distribution, most natural)
- **`strokeColor`**: Muted grays or brand colors
- **`opacityMin/Max`**: 0.3-0.8 for subtle backgrounds

### Performance considerations

- Higher `gridWidth`/`gridHeight` = smoother contours but slower generation
- Higher `density` = more lines = slightly slower rendering
- `inline` mode is slightly slower to regenerate than `dataUrl`
- For body backgrounds, use lower densities (8-10) for better performance

### Reproducibility

Save your configuration to recreate exact backgrounds:

```javascript
const myConfig = {
  seed: 123456,
  density: 10,
  freq: 5,
  strokeColor: '#214d83'
};

// Save to localStorage
localStorage.setItem('bgConfig', JSON.stringify(myConfig));

// Restore later
const saved = JSON.parse(localStorage.getItem('bgConfig'));
WavelineBG.apply(document.body, saved, 'dataUrl');
```

### Accessibility

For better readability:

- Use subtle colors and low opacity for backgrounds
- Ensure sufficient contrast with foreground content
- Consider `prefers-reduced-motion` media query for animations

---

## 🎯 Framework Integration

### React

```jsx
import { useEffect, useRef } from 'react';

function MyComponent() {
  const ref = useRef();

  useEffect(() => {
    if (window.WavelineBG && ref.current) {
      window.WavelineBG.apply(ref.current, {
        density: 10,
        freq: 5,
        seed: 12345,
        strokeColor: '#d4d4d4'
      }, 'inline');
    }
  }, []);

  return <div ref={ref}>Content</div>;
}
```

### Vue

```vue
<template>
  <div ref="container">Content</div>
</template>

<script>
export default {
  mounted() {
    if (window.WavelineBG) {
      window.WavelineBG.apply(this.$refs.container, {
        density: 10,
        freq: 5,
        seed: 12345
      }, 'inline');
    }
  }
}
</script>
```

### Angular

```typescript
import { Component, ElementRef, AfterViewInit } from '@angular/core';

declare const WavelineBG: any;

@Component({
  selector: 'app-my-component',
  template: '<div>Content</div>'
})
export class MyComponent implements AfterViewInit {
  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    WavelineBG.apply(this.el.nativeElement, {
      density: 10,
      freq: 5,
      seed: 12345
    }, 'inline');
  }
}
```

---

## 🌱 Genesis & Inspiration

This library emerged from exploring **procedural background generation** techniques for web design.

### The Journey

**Initial exploration: Organic blobs**
- Keywords: `SVG blob generator`, `perlin noise blobs`, `organic shapes`
- Result: Too abstract, lacked structure and elegance

**Evolution: Topographic patterns**
- Keywords: `topographic lines`, `contour lines generator`, `elevation map SVG`
- Technique: **Marching squares algorithm** (via d3-contour)
- Result: Structured yet organic, perfect balance between order and flow

### Technical Foundation

- **Algorithm:** Marching squares (contour tracing)
- **Field generation:** Sinusoidal wave composition (multiple frequencies)
- **Rendering:** SVG paths with variable stroke properties
- **Determinism:** Mulberry32 PRNG for reproducible randomness

### Related Concepts & Keywords

If you want to explore similar techniques:

**Terrain & Elevation:**
- `procedural terrain generation`
- `scalar field visualization`
- `contour plot`, `isoline generation`
- `topographic map SVG`

**Algorithms:**
- `marching squares`, `marching cubes` (3D)
- `perlin noise`, `simplex noise` (alternative field generators)
- `worley noise`, `voronoi patterns`

**Design & Art:**
- `generative art`, `algorithmic design`
- `flow field`, `vector field visualization`
- `parametric design`, `computational design`

### Inspiration Sources

- **Cartography:** Topographic maps (USGS, IGN, Ordnance Survey)
- **Science:** Weather isobars/isotherms, electron density plots
- **Art:** Generative artists (Tyler Hobbs, Anders Hoff, Matt DesLauriers)
- **Nature:** Terrain contours, sand dunes, wave patterns

---

## 🔍 How It Works

### High-Level Overview

1. **Generate scalar field** using sinusoidal wave composition
2. **Calculate contour lines** at specific threshold values using marching squares
3. **Render SVG paths** with variable stroke width and opacity
4. **Apply to element** via CSS background or inline SVG

### Technical Details

#### 1. Scalar Field Generation

```javascript
// Combine multiple sine waves with different phases and frequencies
value = sin(x * freq + phase1) + sin(y * freq + phase2) 
      + 0.6 * sin((x+y) * freq + phase3)
      + 0.4 * sin((x-y) * freq + phase4)
```

The `seed` determines the random phases, ensuring reproducibility.

#### 2. Contour Calculation

Uses **d3-contour** (implementation of marching squares):
- Traces iso-lines at specific elevation values
- Smooths contours using interpolation
- Returns GeoJSON MultiPolygon geometries

#### 3. SVG Rendering

- Convert GeoJSON coordinates to SVG path commands
- Apply gradient stroke width (thinner at high elevations)
- Apply gradient opacity (more transparent at high elevations)
- Combine into single SVG element

---

## 📚 Examples

### Subtle Gray (Default)

```javascript
WavelineBG.apply(element, {
  density: 10,
  freq: 5,
  strokeColor: '#d4d4d4',
  seed: 12345
}, 'dataUrl');
```

### Bold Dark

```javascript
WavelineBG.apply(element, {
  density: 15,
  freq: 7,
  amplitude: 1.5,
  strokeColor: '#2a2a2a',
  strokeMin: 0.2,
  strokeMax: 0.5,
  seed: 99999
}, 'dataUrl');
```

### Soft Pastel

```javascript
WavelineBG.apply(element, {
  density: 12,
  freq: 6,
  amplitude: 0.8,
  strokeColor: '#E8A5A5',
  opacityMin: 0.3,
  opacityMax: 0.7,
  seed: 77777
}, 'dataUrl');
```

### Dense Blue

```javascript
WavelineBG.apply(element, {
  density: 18,
  freq: 8,
  amplitude: 1.2,
  strokeColor: '#5E8BB8',
  opacityMin: 0.6,
  opacityMax: 1.0,
  seed: 54321
}, 'dataUrl');
```

---

## 🐛 Troubleshooting

### "d3-contour is required" error

Make sure you load d3-contour **before** waveline-bg.js:

```html
<script src="https://d3js.org/d3-contour.v2.min.js"></script>
<script src="./src/waveline-bg.js"></script>
```

### Background not showing

Check that:
1. Target element has content or minimum height
2. If using `inline` mode, element has `position: relative` or `position: absolute`
3. Content has sufficient z-index to appear above background

### Regeneration not working (inline mode)

Before regenerating in `inline` mode, remove the previous SVG:

```javascript
const existing = element.querySelector('div[style*="position: absolute"]');
if (existing) existing.remove();

WavelineBG.apply(element, newOptions, 'inline');
```

### Lines appear jagged or pixelated

- Increase `gridWidth` and `gridHeight` for smoother contours
- Use `inline` mode instead of `dataUrl` for better quality
- Ensure browser supports SVG rendering

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development

1. Clone the repository
2. Open `index.html` in your browser (no build step required)
3. Make changes to `src/waveline-bg.js`
4. Test in the interactive demo

---

## 📄 License

MIT © [Your Name]

See [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **d3-contour** by Mike Bostock - The brilliant marching squares implementation
- **Generative art community** - For endless inspiration
- **Cartographers** - For showing us the beauty of topographic maps

---

## 📞 Support

- 🐛 **Issues:** [GitHub Issues](https://github.com/cedbeu/waveline-bg/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/cedbeu/waveline-bg/discussions)

---

## 🗺️ Roadmap

### v1.1.0 (Coming Soon)
- [ ] Color palette system (predefined + custom)
- [ ] Separate terrain and color seeds
- [ ] Background color in palette system
- [ ] Preset gallery
- [ ] To CDN
- [ ] To npm

### v1.2.0
- [ ] Animation support
- [ ] React/Vue/Angular components
- [ ] TypeScript definitions

### v2.0.0
- [ ] Alternative field generators (Perlin, Simplex noise)
- [ ] 3D mode (marching cubes)
- [ ] WebGL renderer for performance

---

**Made with 💙 by Cédric BEUZIT**

*Inspired by topographic maps, designed for the web.*
