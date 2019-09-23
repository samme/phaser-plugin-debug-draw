![Preview](./preview.png)

Phaser 3 Debug Draw Plugin
==========================

It shows:

- Display Object bounds
- Bitmap Mask bounds
- Geometric input areas (but without scaling or rotation)

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

Module
------

You can use the default export, which is identical to the global `PhaserDebugDrawPlugin`.

### ES6

```javascript
import DebugDrawPlugin from 'phaser-plugin-debug-draw';
```
