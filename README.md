![Preview](./preview.png)

Phaser 3 Debug Draw Plugin
==========================

It shows:

- Game Objects (origin, bounds, rotation, input)
- Bitmap Masks
- Input pointers
- Camera bounds and deadzone

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
      color: colors.blue,
      inputColor: colors.yellow,
      inputDisabledColor: colors.gray,
      cameraBoundsColor: colors.fuchsia,
      cameraDeadzoneColor: colors.orange,
      cameraFollowColor: color.orange,
      lineWidth: 1,
      maskColor: colors.red,
      pointerColor: colors.yellow,
      pointerDownColor: colors.lime,
      pointerInactiveColor: colors.gray,
      showInactivePointers: false,
      showInput: true,
      showPointers: true,
      showRotation: true
    }

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
