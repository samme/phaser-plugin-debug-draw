'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Phaser = _interopDefault(require('phaser'));

var cos = Math.cos;
var sin = Math.sin;
var ref = Phaser.Geom;
var CIRCLE = ref.CIRCLE;
var ELLIPSE = ref.ELLIPSE;
var LINE = ref.LINE;
var POLYGON = ref.POLYGON;
var RECTANGLE = ref.RECTANGLE;
var TRIANGLE = ref.TRIANGLE;
var _inputs = [];
var _masks = [];
var _shapes = {};
_shapes[CIRCLE] = new Phaser.Geom.Circle();
_shapes[ELLIPSE] = new Phaser.Geom.Ellipse();
_shapes[LINE] = new Phaser.Geom.Line();
_shapes[POLYGON] = new Phaser.Geom.Polygon();
_shapes[RECTANGLE] = new Phaser.Geom.Rectangle();
_shapes[TRIANGLE] = new Phaser.Geom.Triangle();
var _methods = {};
_methods[CIRCLE] = 'strokeCircleShape';
_methods[ELLIPSE] = 'strokeEllipseShape';
_methods[LINE] = 'strokeLineShape';
_methods[RECTANGLE] = 'strokeRectShape';
_methods[TRIANGLE] = 'strokeTriangleShape';
var POINTER_RADIUS = 20;

function copyPoly (source, dest, ox, oy) {
  var len = source.points.length;

  dest.points.length = len;

  for (var i = len; i--; i >= 0) {
    var p = dest.points[i];
    var q = source.points[i];

    if (p) {
      p.x = q.x + ox; p.y = q.y + oy;
    } else {
      dest.points[i] = { x: q.x + ox, y: q.y + oy };
    }
  }
}

function getLeft (obj) {
  return obj.originX ? (obj.x - obj.originX * obj.displayWidth) : obj.x;
}

function getTop (obj) {
  return obj.originY ? (obj.y - obj.originY * obj.displayHeight) : obj.y;
}

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
      .on('render', this.sceneRender, this)
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

  DebugDrawPlugin.prototype.sceneRender = function sceneRender () {
    this.drawAll();
  };

  DebugDrawPlugin.prototype.drawAll = function drawAll () {
    var inputs = _inputs;
    var masks = _masks;
    var ref = this.systems;
    var displayList = ref.displayList;
    var input = ref.input;

    if (!displayList.length) { return; }

    inputs.length = 0;
    masks.length = 0;

    this.graphic.clear()
      .fillStyle(this.color, this.alpha)
      .lineStyle(this.lineWidth, this.color, this.alpha);

    displayList.each(this.processObj, this, inputs, masks);

    if (inputs.length) { this.drawObjsInputs(inputs); }
    if (masks.length) { this.drawObjsMasks(masks); }
    if (input.enabled && this.showPointers) { this.drawPointers(this.getPointers()); }
  };

  DebugDrawPlugin.prototype.processObj = function processObj (obj, inputs, masks) {
    this.drawObj(obj);

    if (obj.input) {
      inputs[inputs.length] = obj;
    }

    if (obj.mask && masks.indexOf(obj) === -1) {
      masks[masks.length] = obj;
    }
  };

  DebugDrawPlugin.prototype.sceneDestroy = function sceneDestroy () {
    this.systems.events
      .off('start', this.sceneStart, this)
      .off('render', this.sceneRender, this)
      .off('shutdown', this.sceneShutdown, this)
      .off('destroy', this.sceneDestroy, this);

    this.scene = null;
    this.systems = null;
  };

  DebugDrawPlugin.prototype.drawObjsInputs = function drawObjsInputs (objs) {
    this.graphic.lineStyle(this.lineWidth, this.inputColor, this.alpha);
    objs.forEach(this.drawObjInput, this);
  };

  DebugDrawPlugin.prototype.drawObjsMasks = function drawObjsMasks (objs) {
    this.graphic.lineStyle(this.lineWidth, this.maskColor, this.alpha);
    objs.forEach(this.drawObjMask, this);
  };

  DebugDrawPlugin.prototype.drawObj = function drawObj (obj) {
    this.graphic
      .strokeRect(getLeft(obj), getTop(obj), obj.displayWidth || obj.width, obj.displayHeight || obj.height)
      .fillPoint(obj.x, obj.y, 3 * this.lineWidth);

    if (obj.rotation) {
      this.drawObjRotation(obj);
    }
  };

  DebugDrawPlugin.prototype.drawObjRotation = function drawObjRotation (obj) {
    this.graphic.lineBetween(
      obj.x,
      obj.y,
      obj.x + 0.5 * cos(obj.rotation) * (obj.displayWidth || obj.width),
      obj.y + 0.5 * sin(obj.rotation) * (obj.displayHeight || obj.height));
  };

  DebugDrawPlugin.prototype.drawObjInput = function drawObjInput (obj) {
    var ref = obj.input;
    var hitArea = ref.hitArea;
    var ctor = hitArea.constructor;
    var shape = _shapes[hitArea.type] || _shapes[RECTANGLE];

    if (shape.type === POLYGON) {
      copyPoly(hitArea, shape, getLeft(obj), getTop(obj));

      this.graphic.strokePoints(shape.points, true);
    } else {
      ctor.CopyFrom(hitArea, shape);
      ctor.Offset(shape, getLeft(obj), getTop(obj));

      this.graphic[_methods[shape.type]](shape);
    }
  };

  DebugDrawPlugin.prototype.drawObjMask = function drawObjMask (obj) {
    if (obj.mask.bitmapMask) { this.drawObjBitmapMask(obj); }
  };

  DebugDrawPlugin.prototype.drawObjBitmapMask = function drawObjBitmapMask (obj) {
    this.drawObj(obj.mask.bitmapMask);
  };

  DebugDrawPlugin.prototype.drawPointers = function drawPointers (pointers) {
    pointers.forEach(this.drawPointer, this);
  };

  DebugDrawPlugin.prototype.drawPointer = function drawPointer (pointer) {
    if (!pointer.active && !this.showInactivePointers) { return; }

    var worldX = pointer.worldX;
    var worldY = pointer.worldY;

    this.graphic.lineStyle(this.lineWidth, this.getColorForPointer(pointer), this.alpha);

    if (pointer.locked) {
      this.graphic
        .strokeRect(worldX - POINTER_RADIUS, worldY - POINTER_RADIUS, 2 * POINTER_RADIUS, 2 * POINTER_RADIUS)
        .lineBetween(worldX, worldY, worldX + pointer.movementX, worldY + pointer.movementY);
    } else {
      this.graphic.strokeCircle(worldX, worldY, POINTER_RADIUS);
    }

    if (pointer.isDown) {
      this.graphic.lineBetween(pointer.downX, pointer.downY, worldX, worldY);
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
    var ref = this.systems.input;
    var mousePointer = ref.mousePointer;
    var pointer1 = ref.pointer1;
    var pointer2 = ref.pointer2;
    var pointer3 = ref.pointer3;
    var pointer4 = ref.pointer4;
    var pointer5 = ref.pointer5;
    var pointer6 = ref.pointer6;
    var pointer7 = ref.pointer7;
    var pointer8 = ref.pointer8;
    var pointer9 = ref.pointer9;

    return [mousePointer, pointer1, pointer2, pointer3, pointer4, pointer5, pointer6, pointer7, pointer8, pointer9].filter(Boolean);
  };

  DebugDrawPlugin.prototype.bringToTop = function bringToTop () {
    this.systems.displayList.bringToTop(this.graphic);
  };

  return DebugDrawPlugin;
}(Phaser.Plugins.ScenePlugin));

Object.assign(DebugDrawPlugin.prototype, {
  alpha: 1,
  color: 0x00ddff,
  inputColor: 0xffcc00,
  lineWidth: 1,
  maskColor: 0xff0022,
  pointerColor: 0x00ff22,
  pointerDownColor: 0xff2200,
  pointerInactiveColor: 0x888888,
  showPointers: true,
  showInactivePointers: true
});

if (typeof window !== 'undefined') {
  window.PhaserDebugDrawPlugin = DebugDrawPlugin;
}

module.exports = DebugDrawPlugin;
