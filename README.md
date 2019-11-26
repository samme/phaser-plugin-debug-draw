![Preview](./preview.png)

Phaser 3 Debug Draw Plugin
==========================

It shows:

- Game Objects (origin, bounds, rotation, input)
- Bitmap Masks
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

You can set some options on the plugin. Do

```
console.log(this.debugDraw);
```

from a scene to see its properties.

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
