![Preview](./preview.png)

Phaser 3 Debug Draw Plugin
==========================

It shows:

- Display Object bounds and rotation, colored by interactive status
- Bitmap Mask bounds and rotation
- TileSprite texture origins
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
<script src='path/to/phaser-plugin-debug-draw.umd.js'></script>
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
