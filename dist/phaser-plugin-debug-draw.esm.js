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

  DebugDrawPlugin.prototype.scenePostUpdate = function scenePostUpdate () {
    this.drawAll();
  };

  DebugDrawPlugin.prototype.drawAll = function drawAll () {
    var ref = this.systems;
    var cameras = ref.cameras;
    var displayList = ref.displayList;

    if (!displayList.length) { return; }

    var disabledInputObjs = [];
    var inputObjs = [];
    var maskedObjs = [];
    var vertexesObjs = [];
    var pointsObjs = [];
    var otherObjs = [];
    var showInput = this.showInput && this.systems.input.isActive();

    this.graphic.clear();

    this.setColor(this.color);

    displayList.each(this.processObj, this, disabledInputObjs, inputObjs, maskedObjs, vertexesObjs, pointsObjs, otherObjs, showInput, this.showVertices, this.showPoints);

    if (otherObjs.length) {
      this.drawOthers(otherObjs);
    }

    if (vertexesObjs.length) {
      this.drawVertices(vertexesObjs);
    }

    if (pointsObjs.length) {
      this.drawPoints(pointsObjs);
    }

    if (disabledInputObjs.length) {
      this.drawDisabledInputs(disabledInputObjs);
    }

    if (inputObjs.length) {
      this.drawInputs(inputObjs);
    }

    if (maskedObjs.length) {
      this.drawMasks(maskedObjs);
    }

    if (showInput && this.showPointers) {
      this.drawPointers(this.getPointers());
    }

    this.drawCamera(cameras.main);
  };

  DebugDrawPlugin.prototype.processObj = function processObj (obj, disabledInputObjs, inputObjs, masks, verticesObjs, pointsObjs, otherObjs, showInput, showVertices, showPoints) {
    if (obj.input && showInput) {
      if (obj.input.enabled) {
        inputObjs[inputObjs.length] = obj;
      } else {
        disabledInputObjs[disabledInputObjs.length] = obj;
      }
    } else {
      otherObjs[otherObjs.length] = obj;
    }

    var bitmapMask = obj.mask ? obj.mask.bitmapMask : null;

    if (bitmapMask && masks.indexOf(bitmapMask) === -1) {
      masks[masks.length] = bitmapMask;
    }

    if (obj.vertices && obj.vertices.length && showVertices) {
      verticesObjs[verticesObjs.length] = obj;
    }

    if (obj.points && obj.points.length && showPoints) {
      pointsObjs[pointsObjs.length] = obj;
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

  DebugDrawPlugin.prototype.drawVertices = function drawVertices (objs) {
    this.setColor(this.verticesColor);

    objs.forEach(this.drawObjVertices, this);
  };

  DebugDrawPlugin.prototype.drawPoints = function drawPoints (objs) {
    this.setColor(this.pointsColor);

    objs.forEach(this.drawObjPoints, this);
  };

  DebugDrawPlugin.prototype.drawObj = function drawObj (obj) {
    var width = obj.displayWidth || obj.width;
    var height = obj.displayHeight || obj.height;

    this.dot(obj.x, obj.y);

    if ((width || height) && ('originX' in obj)) {
      this.graphic.strokeRect(obj.x - obj.originX * width, obj.y - obj.originY * height, width, height);
    }

    if (obj.rotation && this.showRotation) {
      this.drawObjRotation(obj);
    }
  };

  DebugDrawPlugin.prototype.drawObjRotation = function drawObjRotation (obj) {
    var length = 0.5 * max((obj.displayWidth || obj.width), (obj.displayHeight || obj.height));

    this.line(obj.x, obj.y, cos(obj.rotation) * length, sin(obj.rotation) * length);
  };

  DebugDrawPlugin.prototype.drawObjInput = function drawObjInput (obj) {
    this.drawObj(obj);
  };

  DebugDrawPlugin.prototype.drawObjVertices = function drawObjVertices (obj) {
    var x = obj.x;
    var y = obj.y;
    var scaleX = obj.scaleX;
    var scaleY = obj.scaleY;
    var v = obj.vertices;
    var half = 0.5 * v.length;
    var points = [];

    for (var i = 0; i < half; i += 1) {
      points[i] = { x: x + scaleX * v[2 * i], y: y + scaleY * v[2 * i + 1] };
    }

    this.graphic.strokePoints(points);
  };

  DebugDrawPlugin.prototype.drawObjPoints = function drawObjPoints (obj) {
    var x = obj.x;
    var y = obj.y;
    var scaleX = obj.scaleX;
    var scaleY = obj.scaleY;

    this.graphic.strokePoints(obj.points.map(function (p) { return ({ x: x + scaleX * p.x, y: y + scaleY * p.y }); }));
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
      this.graphic
        .lineStyle(this.lineWidth, this.cameraBoundsColor, this.alpha)
        .strokeRectShape(camera._bounds);
    }

    if (camera.deadzone) {
      this.graphic
        .lineStyle(this.lineWidth, this.cameraDeadzoneColor, this.alpha)
        .strokeRectShape(camera.deadzone);
    }

    var _follow = camera._follow;

    if (_follow) {
      var followOffset = camera.followOffset;

      this.graphic
        .fillStyle(this.cameraFollowColor, this.alpha)
        .lineStyle(this.lineWidth, this.cameraFollowColor, this.alpha);
      this.dot(_follow.x, _follow.y);
      this.lineDelta(_follow, followOffset, -1);
    }
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
  lineWidth: 1,
  maskColor: colors.red,
  pointerColor: colors.yellow,
  pointerDownColor: colors.green,
  pointerInactiveColor: colors.silver,
  pointsColor: colors.olive,
  showInactivePointers: false,
  showInput: true,
  showPointers: true,
  showPoints: true,
  showRotation: true,
  showVertices: true,
  verticesColor: colors.blue
});

export default DebugDrawPlugin;
