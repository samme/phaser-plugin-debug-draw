![Preview](./preview.png)

Phaser 3 Debug Draw Plugin
==========================

It shows:

- Game Object bounds
- Bitmap Mask bounds
- Geometric input areas

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

At the end of the scene's `create` method, add

```javascript
this.debugDraw.bringToTop();
```

Modules
-------

The default export is the plugin class, identical to the global `PhaserDebugDrawPlugin`.

### ES6

```javascript
import DebugDrawPlugin from 'phaser-plugin-debug-draw';
```
