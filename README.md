![Preview](./preview.png)

Phaser 3 Debug Draw Plugin
==========================

See [demo](https://codepen.io/samme/full/zMZyOM/), [screenshots](https://phaser.discourse.group/t/debug-draw-plugin-phaser-3/4480).

It shows:

- Game Objects with origin, bounds, rotation, input
- Bitmap Masks
- Input pointers
- Camera bounds, deadzone, and follow target
- Lights

It doesn't show:

- Game Objects in Containers
- Blitter Bobs
- Particle Emitters

Install
-------

### Browser / UMD

Download and add the [plugin UMD script](dist/phaser-plugin-debug-draw.umd.js)

```html
<script src='path/to/phaser.js'></script>
<script src='path/to/phaser-plugin-debug-draw.umd.js'></script>
```

Or use the CDN scripts:

```html
<script src='https://cdn.jsdelivr.net/npm/phaser@3.55.2'></script>
<script src='https://cdn.jsdelivr.net/npm/phaser-plugin-debug-draw@7.0.0'></script>
```

Then add to your game config:

```js
/* global PhaserDebugDrawPlugin */
new Phaser.Game({
  plugins: {
    scene: [
      { key: 'DebugDrawPlugin', plugin: PhaserDebugDrawPlugin, mapping: 'debugDraw' }
    ]
  }
});
```

### Module

```js
import DebugDrawPlugin from 'phaser-plugin-debug-draw';

new Phaser.Game({
  plugins: {
    scene: [
      { key: 'DebugDrawPlugin', plugin: DebugDrawPlugin, mapping: 'debugDraw' }
    ]
  }
});
```

### Quick Load

```js
function preload () {
  this.load.scenePlugin(
    'PhaserDebugDrawPlugin',
    'https://cdn.jsdelivr.net/npm/phaser-plugin-debug-draw@7.0.0',
    'debugDraw',
    'debugDraw'
  );
}
```

### Load from Console

Given a global variable `game`:

```js
game.scene
  .getScenes(true)[0]
  .load
  .scenePlugin(
    'PhaserDebugDrawPlugin',
    'https://cdn.jsdelivr.net/npm/phaser-plugin-debug-draw@7.0.0',
    'debugDraw',
    'debugDraw'
  )
  .start();
```

Options
-------

Set properties on the plugin instance, e.g.,

```js
// In scene `init()` or `create()`:
this.debugDraw.showPointers = false;
```

See `console.log(this.debugDraw)` for all the options.

Position & Bounds
-----------------

It draws a dot on the Game Object's `x`, `y`.

If the Game Object has an origin, it also draws a rectangle from the origin with dimensions (`displayWidth`, `displayWidth`) or (`height`, `width`).

Mesh & Rope
-----------

```js
// In scene `create()`:
mesh.setDebug(this.debugDraw.graphic);
rope.setDebug(this.debugDraw.graphic);
```
