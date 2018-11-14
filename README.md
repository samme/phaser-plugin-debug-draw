![Preview](https://i.imgur.com/b13yOVC.png)

Phaser 3 Debug Draw Plugin
==========================

It shows:

- Game Object bounds
- Bitmap Mask bounds
- Geometric input areas

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

At the end of the scene's `create` method, add

```javascript
this.debugDraw.bringToTop();
```

Modules
-------

The default export is the plugin class, identical to the global `PhaserDebugDrawPlugin`.

### ES6

```javascript
import DebugDrawPlugin from 'phaser-plugin-debug-draw'; // UMD
// OR
import DebugDrawPlugin from 'path/to/phaser-plugin-debug-draw/src'; // ES6 module
```

### CommonJS

```javascript
var DebugDrawPlugin = require('phaser-plugin-debug-draw');
```
