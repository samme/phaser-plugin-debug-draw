![Preview](./preview.png)

Phaser 3 Debug Draw Plugin
==========================

It shows:

- Game Objects (origin, bounds, rotation, input)
- Bitmap Masks
- Input pointers
- Camera bounds, deadzone, and follow target
- Mesh and Rope vertices

[Demo](https://codepen.io/samme/full/zMZyOM/) | [Screenshots](https://phaser.discourse.group/t/debug-draw-plugin-phaser-3/4480)

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
      cameraBoundsColor: colors.fuchsia,
      cameraDeadzoneColor: colors.orange,
      cameraFollowColor: colors.orange,
      color: colors.aqua,
      inputColor: colors.yellow,
      inputDisabledColor: colors.silver,
      lineWidth: 1,
      maskColor: colors.red,
      pointerColor: colors.yellow,
      pointerDownColor: colors.green,
      pointerInactiveColor: colors.silver,
      showInactivePointers: false,
      showInput: true,
      showPointers: true,
      showRotation: true,
      verticesColor: colors.blue
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
