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
      {
        key: 'DebugDrawPlugin',
        plugin: PhaserDebugDrawPlugin,
        mapping: 'debugDraw'
      }
    ]
  }
});
```

Options
-------

You can set these properties of the scene's plugin instance (e.g., `this.debugDraw`).

    {
      alpha: 1,
      color: 0x00ddff,
      inputColor: 0xffcc00,
      inputDisabledColor: 0x886600,
      lineWidth: 1,
      maskColor: 0xff0022,
      pointerColor: 0xffcc00,
      pointerDownColor: 0x00ff22,
      pointerInactiveColor: 0x888888,
      showInactivePointers: false,
      showInput: true,
      showPointers: true,
      showRotation: true
    }

[1]: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Components.GetBounds.html#getBounds

Browser
-------

```html
<script src='path/to/phaser-plugin-debug-draw.umd.js'></script>
```

Then use the global `PhaserDebugDrawPlugin`.

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
