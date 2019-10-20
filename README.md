![Preview](./preview.png)

Phaser 3 Debug Draw Plugin
==========================

It shows:

- Display Object bounds and rotation
- Bitmap Mask bounds and rotation
- Geometric input hit areas (but without scaling or rotation)
- Input pointers

[Demo](https://codepen.io/samme/full/zMZyOM/)

Use
---

```javascript
new Phaser.Game({
  plugins: {
    scene: [
      { key: 'DebugDrawPlugin', plugin: PhaserDebugDrawPlugin, mapping: 'debugDraw' }
    ]
  }
});
```

Browser
-------

```html
<script src='path/to/PhaserDebugDrawPlugin.umd.js'></script>
```

ES Module
---------

```javascript
import DebugDrawPlugin from 'phaser-plugin-debug-draw';
```

CommonJS Module
---------------

```javascript
var DebugDrawPlugin = require('phaser-plugin-debug-draw');
```
