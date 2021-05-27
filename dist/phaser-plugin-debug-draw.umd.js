(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('phaser')) :
  typeof define === 'function' && define.amd ? define(['phaser'], factory) :
  (global = global || self, global.PhaserDebugDrawPlugin = factory(global.Phaser));
}(this, (function (Phaser) { 'use strict';

  Phaser = Phaser && Object.prototype.hasOwnProperty.call(Phaser, 'default') ? Phaser['default'] : Phaser;

  var colors = {
    aqua: 0x00d9f7,
    black: 0x000000,
    blue: 0x0050d4,
    fuchsia: 0xff00c3,
    gray: 0x333333,
    green: 0x00d942,
    lime: 0xb4d900,
    maroon: 0x790009,
    navy: 0x002b75,
    olive: 0x00b562,
    orange: 0xeb7700,
    purple: 0x8d00ff,
    red: 0xeb0012,
    silver: 0x777777,
    teal: 0x00a6a6,
    white: 0xffffff,
    yellow: 0xebcf00
  };

  var cos = Math.cos;
  var max = Math.max;
  var sin = Math.sin;
  var ref = Phaser.Scenes.Events;
  var START = ref.START;
  var CREATE = ref.CREATE;
  var PRE_RENDER = ref.PRE_RENDER;
  var SHUTDOWN = ref.SHUTDOWN;
  var DESTROY = ref.DESTROY;
  var ref$1 = Phaser.Utils.Array;
  var Each = ref$1.Each;
  var POINTER_RADIUS = 20;

  var DebugDrawPlugin = /*@__PURE__*/(function (superclass) {
    function DebugDrawPlugin () {
      superclass.apply(this, arguments);
    }

    if ( superclass ) DebugDrawPlugin.__proto__ = superclass;
    DebugDrawPlugin.prototype = Object.create( superclass && superclass.prototype );
    DebugDrawPlugin.prototype.constructor = DebugDrawPlugin;

    DebugDrawPlugin.prototype.boot = function boot () {
      if (Phaser.VERSION.split('.')[1] < 53) {
        throw new Error('Phaser v3.53.0 or greater is required. Or use <https://github.com/samme/phaser-plugin-debug-draw/releases/tag/v6.0.1>');
      }

      this.systems.events
        .on(START, this.sceneStart, this)
        .on(CREATE, this.bringToTop, this)
        .on(PRE_RENDER, this.scenePreRender, this)
        .on(SHUTDOWN, this.sceneShutdown, this)
        .once(DESTROY, this.sceneDestroy, this);

      if (this.systems.settings.isBooted) {
        this.sceneStart();
      }
    };

    DebugDrawPlugin.prototype.sceneStart = function sceneStart () {
      this.graphic = this.scene.add.graphics();
    };

    DebugDrawPlugin.prototype.sceneShutdown = function sceneShutdown () {
      this.graphic.destroy();
      this.graphic = null;
    };

    DebugDrawPlugin.prototype.scenePreRender = function scenePreRender () {
      this.drawAll();
    };

    DebugDrawPlugin.prototype.drawAll = function drawAll () {
      var ref = this.systems;
      var cameras = ref.cameras;
      var displayList = ref.displayList;
      var lights = ref.lights;

      if (!displayList.length) { return; }

      var disabledInputObjs = [];
      var inputObjs = [];
      var maskObjs = [];
      var otherObjs = [];
      var showInput = this.showInput && this.systems.input.isActive();

      this.graphic.clear();

      displayList.each(this.processObj, this, disabledInputObjs, inputObjs, maskObjs, otherObjs, showInput);

      if (otherObjs.length) {
        this.drawOthers(otherObjs);
      }

      if (disabledInputObjs.length) {
        this.drawDisabledInputs(disabledInputObjs);
      }

      if (inputObjs.length) {
        this.drawInputs(inputObjs);
      }

      if (maskObjs.length) {
        this.drawMasks(maskObjs);
      }

      if (showInput && this.showPointers) {
        this.drawPointers(this.getPointers());
      }

      this.drawCamera(cameras.main);

      if (lights && lights.active && this.showLights) {
        this.drawLights(lights.lights);
      }

      // For Mesh/Rope debug callbacks
      this.setColor(this.color);
    };

    DebugDrawPlugin.prototype.processObj = function processObj (obj, disabledInputObjs, inputObjs, maskObjs, otherObjs, showInput) {
      if (obj.input && showInput) {
        if (obj.input.enabled) {
          inputObjs[inputObjs.length] = obj;
        } else {
          disabledInputObjs[disabledInputObjs.length] = obj;
        }
      } else if (obj.type === 'Layer') {
        Each(obj.list, this.processObj, this, disabledInputObjs, inputObjs, maskObjs, otherObjs, showInput);
      } else {
        otherObjs[otherObjs.length] = obj;
      }

      var maskObj = obj.mask ? obj.mask.bitmapMask : null;

      if (maskObj && maskObjs.indexOf(maskObj) === -1) {
        maskObjs[maskObjs.length] = maskObj;
      }
    };

    DebugDrawPlugin.prototype.sceneDestroy = function sceneDestroy () {
      this.systems.events
        .off(START, this.sceneStart, this)
        .off(CREATE, this.bringToTop, this)
        .off(PRE_RENDER, this.scenePreRender, this)
        .off(SHUTDOWN, this.sceneShutdown, this)
        .off(DESTROY, this.sceneDestroy, this);

      this.scene = null;
      this.systems = null;
    };

    DebugDrawPlugin.prototype.drawOthers = function drawOthers (objs) {
      this.setColor(this.color);

      objs.forEach(this.drawObj, this);
    };

    DebugDrawPlugin.prototype.drawDisabledInputs = function drawDisabledInputs (objs) {
      this.setColor(this.inputDisabledColor);

      objs.forEach(this.drawObjInput, this);
    };

    DebugDrawPlugin.prototype.drawInputs = function drawInputs (objs) {
      this.setColor(this.inputColor);

      objs.forEach(this.drawObjInput, this);
    };

    DebugDrawPlugin.prototype.drawMasks = function drawMasks (objs) {
      this.setColor(this.maskColor);

      objs.forEach(this.drawObj, this);
    };

    DebugDrawPlugin.prototype.drawObj = function drawObj (obj) {
      this.dot(obj.x, obj.y);

      if ('originX' in obj) {
        var width = obj.width;
        var height = obj.height;

        if ('displayWidth' in obj) {
          width = obj.displayWidth;
          height = obj.displayHeight;
        }

        if (width || height) {
          this.graphic.strokeRect(obj.x - obj.originX * width, obj.y - obj.originY * height, width, height);

          if (obj.rotation && this.showRotation) {
            var rad = 0.5 * max(width, height);

            this.line(obj.x, obj.y, cos(obj.rotation) * rad, sin(obj.rotation) * rad);
          }
        }
      }
    };

    DebugDrawPlugin.prototype.drawObjInput = function drawObjInput (obj) {
      this.drawObj(obj);
    };

    DebugDrawPlugin.prototype.drawPointers = function drawPointers (pointers) {
      pointers.forEach(this.drawPointer, this);
    };

    DebugDrawPlugin.prototype.drawPointer = function drawPointer (pointer) {
      if (!pointer.active && !this.showInactivePointers) { return; }

      var ref = this.systems.cameras.main;
      var x = ref.x;
      var y = ref.y;
      var zoom = ref.zoom;
      var worldX = pointer.worldX - x;
      var worldY = pointer.worldY - y;

      this.setColor(this.getColorForPointer(pointer));

      if (pointer.locked) {
        this.graphic.strokeRect(worldX - POINTER_RADIUS, worldY - POINTER_RADIUS, 2 * POINTER_RADIUS, 2 * POINTER_RADIUS);
        this.line(worldX, worldY, pointer.movementX, pointer.movementY);
      } else {
        this.graphic.strokeCircle(worldX, worldY, POINTER_RADIUS);
      }

      if (pointer.isDown) {
        this.line(worldX, worldY, (pointer.downX - pointer.x) / zoom, (pointer.downY - pointer.y) / zoom);
      }
    };

    DebugDrawPlugin.prototype.drawCamera = function drawCamera (camera) {
      if (camera.useBounds) {
        this.setColor(this.cameraBoundsColor);
        this.graphic.strokeRectShape(camera._bounds);
      }

      if (camera.deadzone) {
        this.setColor(this.cameraDeadzoneColor);
        this.graphic.strokeRectShape(camera.deadzone);
      }

      var _follow = camera._follow;

      if (_follow) {
        var followOffset = camera.followOffset;

        this.setColor(this.cameraFollowColor);
        this.dot(_follow.x, _follow.y);
        this.lineDelta(_follow, followOffset, -1);
      }
    };

    DebugDrawPlugin.prototype.drawLights = function drawLights (lights) {
      this.setColor(this.lightColor);

      lights.forEach(this.drawLight, this);
    };

    DebugDrawPlugin.prototype.drawLight = function drawLight (light) {
      this.graphic.strokeCircleShape(light);
    };

    DebugDrawPlugin.prototype.getColorForPointer = function getColorForPointer (pointer) {
      if (pointer.isDown) { return this.pointerDownColor; }
      if (!pointer.active) { return this.pointerInactiveColor; }

      return this.pointerColor;
    };

    DebugDrawPlugin.prototype.getPointers = function getPointers () {
      var ref = this.systems;
      var input = ref.input;

      return [
        input.mousePointer,
        input.pointer1,
        input.pointer2,
        input.pointer3,
        input.pointer4,
        input.pointer5,
        input.pointer6,
        input.pointer7,
        input.pointer8,
        input.pointer9
      ].filter(Boolean);
    };

    DebugDrawPlugin.prototype.bringToTop = function bringToTop () {
      this.systems.displayList.bringToTop(this.graphic);
    };

    DebugDrawPlugin.prototype.toggle = function toggle () {
      this.graphic.setVisible(!this.graphic.visible);
    };

    DebugDrawPlugin.prototype.setColor = function setColor (color) {
      this.graphic.fillStyle(color, this.alpha).lineStyle(this.lineWidth, color, this.alpha);
    };

    DebugDrawPlugin.prototype.line = function line (x, y, dx, dy) {
      if (!dx && !dy) { return; }
      this.graphic.lineBetween(x, y, x + dx, y + dy);
    };

    DebugDrawPlugin.prototype.lineDelta = function lineDelta (start, delta, scale) {
      if ( scale === void 0 ) scale = 1;

      this.line(start.x, start.y, scale * delta.x, scale * delta.y);
    };

    DebugDrawPlugin.prototype.dot = function dot (x, y) {
      this.graphic.fillPoint(x, y, 3 * this.lineWidth);
    };

    DebugDrawPlugin.prototype.dotPoint = function dotPoint (p) {
      this.dot(p.x, p.y);
    };

    return DebugDrawPlugin;
  }(Phaser.Plugins.ScenePlugin));

  Object.assign(DebugDrawPlugin.prototype, {
    alpha: 1,
    cameraBoundsColor: colors.fuchsia,
    cameraDeadzoneColor: colors.orange,
    cameraFollowColor: colors.orange,
    color: colors.aqua,
    inputColor: colors.yellow,
    inputDisabledColor: colors.silver,
    lightColor: colors.purple,
    lineWidth: 1,
    maskColor: colors.red,
    pointerColor: colors.yellow,
    pointerDownColor: colors.green,
    pointerInactiveColor: colors.silver,
    showInactivePointers: false,
    showInput: true,
    showLights: true,
    showPointers: true,
    showRotation: true
  });

  return DebugDrawPlugin;

})));
