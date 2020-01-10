import Phaser from 'phaser';

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

var POINTER_RADIUS = 20;

var FOLLOW_RADIUS = 20;

var DebugDrawPlugin = /*@__PURE__*/(function (superclass) {
  function DebugDrawPlugin () {
    superclass.apply(this, arguments);
  }

  if ( superclass ) DebugDrawPlugin.__proto__ = superclass;
  DebugDrawPlugin.prototype = Object.create( superclass && superclass.prototype );
  DebugDrawPlugin.prototype.constructor = DebugDrawPlugin;

  DebugDrawPlugin.prototype.boot = function boot () {
    this.systems.events
      .on('start', this.sceneStart, this)
      .on('create', this.bringToTop, this)
      .on('postupdate', this.scenePostUpdate, this)
      .on('shutdown', this.sceneShutdown, this)
      .once('destroy', this.sceneDestroy, this);
  };

  DebugDrawPlugin.prototype.sceneStart = function sceneStart () {
    this.graphic = this.scene.add.graphics();
  };

  DebugDrawPlugin.prototype.sceneShutdown = function sceneShutdown () {
    this.graphic.destroy();
    this.graphic = null;
  };

  DebugDrawPlugin.prototype.scenePostUpdate = function scenePostUpdate () {
    this.drawAll();
  };

  DebugDrawPlugin.prototype.drawAll = function drawAll () {
    var ref = this.systems;
    var cameras = ref.cameras;
    var displayList = ref.displayList;

    if (!displayList.length) { return; }

    var disabledInputs = [];
    var inputs = [];
    var masks = [];
    var showInput = this.showInput && this.systems.input.isActive();

    this.graphic
      .clear()
      .fillStyle(this.color, this.alpha)
      .lineStyle(this.lineWidth, this.color, this.alpha);

    displayList.each(this.processObj, this, disabledInputs, inputs, masks, showInput);

    if (disabledInputs.length) {
      this.drawDisabledInputs(disabledInputs);
    }

    if (inputs.length) {
      this.drawInputs(inputs);
    }

    if (masks.length) {
      this.drawMasks(masks);
    }

    if (showInput && this.showPointers) {
      this.drawPointers(this.getPointers());
    }

    this.drawCamera(cameras.main);
  };

  DebugDrawPlugin.prototype.processObj = function processObj (obj, disabledInputs, inputs, masks, showInput) {
    if (obj.input && showInput) {
      if (obj.input.enabled) {
        inputs[inputs.length] = obj;
      } else {
        disabledInputs[disabledInputs.length] = obj;
      }
    } else {
      this.drawObj(obj);
    }

    if (obj.mask && masks.indexOf(obj) === -1) {
      masks[masks.length] = obj;
    }
  };

  DebugDrawPlugin.prototype.sceneDestroy = function sceneDestroy () {
    this.systems.events
      .off('start', this.sceneStart, this)
      .off('create', this.bringToTop, this)
      .off('postupdate', this.scenePostUpdate, this)
      .off('shutdown', this.sceneShutdown, this)
      .off('destroy', this.sceneDestroy, this);

    this.scene = null;
    this.systems = null;
  };

  DebugDrawPlugin.prototype.drawDisabledInputs = function drawDisabledInputs (objs) {
    this.graphic
      .fillStyle(this.inputDisabledColor, this.alpha)
      .lineStyle(this.lineWidth, this.inputDisabledColor, this.alpha);

    objs.forEach(this.drawObjInput, this);
  };

  DebugDrawPlugin.prototype.drawInputs = function drawInputs (objs) {
    this.graphic
      .fillStyle(this.inputColor, this.alpha)
      .lineStyle(this.lineWidth, this.inputColor, this.alpha);

    objs.forEach(this.drawObjInput, this);
  };

  DebugDrawPlugin.prototype.drawMasks = function drawMasks (objs) {
    this.graphic
      .fillStyle(this.maskColor, this.alpha)
      .lineStyle(this.lineWidth, this.maskColor, this.alpha);

    objs.forEach(this.drawObjMask, this);
  };

  DebugDrawPlugin.prototype.drawObj = function drawObj (obj) {
    var width = obj.displayWidth || obj.width;
    var height = obj.displayHeight || obj.height;
    var left = obj.originX ? (obj.x - obj.originX * width) : obj.x;
    var top = obj.originY ? (obj.y - obj.originY * height) : obj.y;

    this.graphic.fillPoint(obj.x, obj.y, 3 * this.lineWidth);

    if (width || height) {
      this.graphic.strokeRect(left, top, width, height);
    }

    if (obj.rotation && this.showRotation) {
      this.drawObjRotation(obj);
    }
  };

  DebugDrawPlugin.prototype.drawObjRotation = function drawObjRotation (obj) {
    var length = 0.5 * max((obj.displayWidth || obj.width), (obj.displayHeight || obj.height));

    this.graphic.lineBetween(
      obj.x,
      obj.y,
      obj.x + cos(obj.rotation) * length,
      obj.y + sin(obj.rotation) * length);
  };

  DebugDrawPlugin.prototype.drawObjInput = function drawObjInput (obj) {
    this.drawObj(obj);
  };

  DebugDrawPlugin.prototype.drawObjMask = function drawObjMask (obj) {
    if (obj.mask.bitmapMask) { this.drawObj(obj.mask.bitmapMask); }
  };

  DebugDrawPlugin.prototype.drawPointers = function drawPointers (pointers) {
    pointers.forEach(this.drawPointer, this);
  };

  DebugDrawPlugin.prototype.drawPointer = function drawPointer (pointer) {
    if (!pointer.active && !this.showInactivePointers) { return; }

    var ref = this.systems.cameras.main;
    var x = ref.x;
    var y = ref.y;
    var worldX = pointer.worldX - x;
    var worldY = pointer.worldY - y;

    this.graphic.lineStyle(this.lineWidth, this.getColorForPointer(pointer), this.alpha);

    if (pointer.locked) {
      this.graphic
        .strokeRect(worldX - POINTER_RADIUS, worldY - POINTER_RADIUS, 2 * POINTER_RADIUS, 2 * POINTER_RADIUS)
        .lineBetween(worldX, worldY, worldX + pointer.movementX, worldY + pointer.movementY);
    } else {
      this.graphic.strokeCircle(worldX, worldY, POINTER_RADIUS);
    }
  };

  DebugDrawPlugin.prototype.drawCamera = function drawCamera (camera) {
    if (camera.useBounds) {
      this.graphic
        .lineStyle(this.lineWidth, this.cameraBoundsColor, this.alpha)
        .strokeRectShape(camera._bounds);
    }

    if (camera.deadzone) {
      this.graphic
        .lineStyle(this.lineWidth, this.cameraDeadzoneColor, this.alpha)
        .strokeRectShape(camera.deadzone);
    }

    if (camera._follow) {
      var x = camera._follow.x - camera.followOffset.x;
      var y = camera._follow.y - camera.followOffset.y;

      this.graphic
        .lineStyle(this.lineWidth, this.cameraFollowColor, this.alpha)
        .lineBetween(x - FOLLOW_RADIUS, y, x + FOLLOW_RADIUS, y)
        .lineBetween(x, y - FOLLOW_RADIUS, x, y + FOLLOW_RADIUS);
    }
  };

  DebugDrawPlugin.prototype.getColorForPointer = function getColorForPointer (pointer) {
    switch (true) {
      case (pointer.isDown): return this.pointerDownColor;
      case (!pointer.active): return this.pointerInactiveColor;
      default: return this.pointerColor;
    }
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
  lineWidth: 1,
  maskColor: colors.red,
  pointerColor: colors.yellow,
  pointerDownColor: colors.lime,
  pointerInactiveColor: colors.silver,
  showInactivePointers: false,
  showInput: true,
  showPointers: true,
  showRotation: true
});

export default DebugDrawPlugin;
