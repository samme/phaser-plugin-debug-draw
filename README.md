![Preview](./preview.png)

Phaser 3 Debug Draw Plugin
==========================

[Demo](https://codepen.io/samme/full/zMZyOM/) | [Screenshots](https://phaser.discourse.group/t/debug-draw-plugin-phaser-3/4480)

It shows:

- Game Objects (origin, bounds, rotation, input)
- Bitmap Masks
- Input pointers
- Camera bounds, deadzone, and follow target
- Lights

It doesn't show:

- Game Objects in Containers
- Blitter Bobs
- Particle Emitters

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

Browser / UMD
-------------

```html
<script src='path/to/phaser-plugin-debug-draw.umd.js'></script>
```

Then use the global `PhaserDebugDrawPlugin`.

ES Module
---------

```javascript
import DebugDrawPlugin from 'phaser-plugin-debug-draw';
```

Options
-------

Set properties on the plugin instance, e.g.,

```javascript
// Scene `init()` or `create()`
this.debugDraw.showPointers = false;
```

See `console.log(this.debugDraw)` for all the options.

Position & Bounds
-----------------

It draws a dot on the Game Object's `x`, `y`.

If the Game Object has an origin, it also draws a rectangle from the origin with dimensions (`displayWidth`, `displayWidth`) or (`height`, `width`).

Mesh & Rope
-----------

```javascript
// Scene create()
// …
mesh.setDebug(this.debugDraw.graphic);
rope.setDebug(this.debugDraw.graphic);
```

Load on Demand
--------------

```javascript
// Scene `preload()`
this.load
  .setBaseURL()
  .setPath()
  .setPrefix()
  .scenePlugin(
    'PhaserDebugDrawPlugin',
    'https://cdn.jsdelivr.net/npm/phaser-plugin-debug-draw@6.0.0',
    'debugDraw',
    'debugDraw'
  );
```

Load from Console
-----------------

```javascript
game.scene
  .getScenes(true)[0]
  .load
  .setBaseURL()
  .setPath()
  .setPrefix()
  .scenePlugin(
    'PhaserDebugDrawPlugin',
    'https://cdn.jsdelivr.net/npm/phaser-plugin-debug-draw@6.0.0',
    'debugDraw',
    'debugDraw'
  )
  .start();
```
