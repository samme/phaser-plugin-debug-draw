import Phaser from 'phaser';

const { CIRCLE, ELLIPSE, LINE, POLYGON, RECTANGLE, TRIANGLE } = Phaser.Geom;
const _inputs = [];
const _masks = [];
const _shapes = {
  [CIRCLE]: new Phaser.Geom.Circle(),
  [ELLIPSE]: new Phaser.Geom.Ellipse(),
  [LINE]: new Phaser.Geom.Line(),
  [POLYGON]: new Phaser.Geom.Polygon(),
  [RECTANGLE]: new Phaser.Geom.Rectangle(),
  [TRIANGLE]: new Phaser.Geom.Triangle()
};
const _methods = {
  [CIRCLE]: 'strokeCircleShape',
  [ELLIPSE]: 'strokeEllipseShape',
  [LINE]: 'strokeLineShape',
  [RECTANGLE]: 'strokeRectShape',
  [TRIANGLE]: 'strokeTriangleShape'
};

function copyPoly (source, dest, ox, oy) {
  const len = source.points.length;

  dest.points.length = len;

  for (let i = len; i--; i >= 0) {
    const p = dest.points[i];
    const q = source.points[i];

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

class DebugDrawPlugin extends Phaser.Plugins.ScenePlugin {
  boot () {
    this.systems.events
      .on('start', this.sceneStart, this)
      .on('create', this.bringToTop, this)
      .on('render', this.sceneRender, this)
      .on('shutdown', this.sceneShutdown, this)
      .once('destroy', this.sceneDestroy, this);
  }

  sceneStart () {
    this.graphic = this.scene.add.graphics();
  }

  sceneShutdown () {
    this.graphic.destroy();
    this.graphic = null;
  }

  sceneRender () {
    this.drawAll();
  }

  drawAll () {
    const inputs = _inputs;
    const masks = _masks;
    const { displayList } = this.systems;

    if (!displayList.length) return;

    inputs.length = 0;
    masks.length = 0;

    this.graphic.clear()
      .fillStyle(this.color, this.alpha)
      .lineStyle(this.lineWidth, this.color, this.alpha);

    displayList.each(this.processObj, this, inputs, masks);

    if (inputs.length) this.drawObjsInputs(inputs);
    if (masks.length) this.drawObjsMasks(masks);
  }

  processObj (obj, inputs, masks) {
    this.drawObj(obj);

    if (obj.input) {
      inputs[inputs.length] = obj;
    }

    if (obj.mask && masks.indexOf(obj) === -1) {
      masks[masks.length] = obj;
    }
  }

  sceneDestroy () {
    this.systems.events
      .off('start', this.sceneStart, this)
      .off('render', this.sceneRender, this)
      .off('shutdown', this.sceneShutdown, this)
      .off('destroy', this.sceneDestroy, this);

    this.scene = null;
    this.systems = null;
  }

  drawObjsInputs (objs) {
    this.graphic.lineStyle(this.lineWidth, this.inputColor, this.alpha);
    objs.forEach(this.drawObjInput, this);
  }

  drawObjsMasks (objs) {
    this.graphic.lineStyle(this.lineWidth, this.maskColor, this.alpha);
    objs.forEach(this.drawObjMask, this);
  }

  drawObj (obj) {
    this.graphic
      .strokeRect(getLeft(obj), getTop(obj), obj.displayWidth || obj.width, obj.displayHeight || obj.height)
      .fillPoint(obj.x, obj.y, this.lineWidth + 2);

    if (obj.rotation) {
      this.graphic.lineBetween(
        obj.x,
        obj.y,
        obj.x + 0.5 * Math.cos(obj.rotation) * (obj.displayWidth || obj.width),
        obj.y + 0.5 * Math.sin(obj.rotation) * (obj.displayHeight || obj.height));
    }
  }

  drawObjInput (obj) {
    const { hitArea } = obj.input;
    const ctor = hitArea.constructor;
    const shape = _shapes[hitArea.type] || _shapes[RECTANGLE];

    if (shape.type === POLYGON) {
      copyPoly(hitArea, shape, getLeft(obj), getTop(obj));

      this.graphic.strokePoints(shape.points, true);
    } else {
      ctor.CopyFrom(hitArea, shape);
      ctor.Offset(shape, getLeft(obj), getTop(obj));

      this.graphic[_methods[shape.type]](shape);
    }
  }

  drawObjMask (obj) {
    if (obj.mask.bitmapMask) this.drawObjBitmapMask(obj);
  }

  drawObjBitmapMask (obj) {
    this.drawObj(obj.mask.bitmapMask);
  }

  bringToTop () {
    this.systems.displayList.bringToTop(this.graphic);
  }
}

Object.assign(DebugDrawPlugin.prototype, {
  alpha: 1,
  color: 0x00ddff,
  inputColor: 0xffcc00,
  lineWidth: 1,
  maskColor: 0xff0022
});

if (typeof window !== 'undefined') {
  window.PhaserDebugDrawPlugin = DebugDrawPlugin;
}

export default DebugDrawPlugin;
