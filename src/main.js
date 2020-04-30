import Phaser from 'phaser';

import colors from './colors';

const { cos, max, sin } = Math;

const POINTER_RADIUS = 20;

class DebugDrawPlugin extends Phaser.Plugins.ScenePlugin {
  boot () {
    this.systems.events
      .on('start', this.sceneStart, this)
      .on('create', this.bringToTop, this)
      .on('postupdate', this.scenePostUpdate, this)
      .on('shutdown', this.sceneShutdown, this)
      .once('destroy', this.sceneDestroy, this);

    if (this.systems.settings.isBooted) {
      this.sceneStart();
    }
  }

  sceneStart () {
    this.graphic = this.scene.add.graphics();
  }

  sceneShutdown () {
    this.graphic.destroy();
    this.graphic = null;
  }

  scenePostUpdate () {
    this.drawAll();
  }

  drawAll () {
    const { cameras, displayList } = this.systems;

    if (!displayList.length) return;

    const disabledInputs = [];
    const inputs = [];
    const masks = [];
    const vertices = [];
    const points = [];
    const showInput = this.showInput && this.systems.input.isActive();

    this.graphic
      .clear()
      .fillStyle(this.color, this.alpha)
      .lineStyle(this.lineWidth, this.color, this.alpha);

    displayList.each(this.processObj, this, disabledInputs, inputs, masks, vertices, points, showInput, this.showVertices, this.showPoints);

    if (vertices.length) {
      this.drawVertices(vertices);
    }

    if (points.length) {
      this.drawPoints(points);
    }

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
  }

  processObj (obj, disabledInputs, inputs, masks, vertices, points, showInput, showVertices, showPoints) {
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

    if (obj.vertices && showVertices) {
      vertices[vertices.length] = obj;
    }

    if (obj.points && showPoints) {
      points[points.length] = obj;
    }
  }

  sceneDestroy () {
    this.systems.events
      .off('start', this.sceneStart, this)
      .off('create', this.bringToTop, this)
      .off('postupdate', this.scenePostUpdate, this)
      .off('shutdown', this.sceneShutdown, this)
      .off('destroy', this.sceneDestroy, this);

    this.scene = null;
    this.systems = null;
  }

  drawDisabledInputs (objs) {
    this.graphic
      .fillStyle(this.inputDisabledColor, this.alpha)
      .lineStyle(this.lineWidth, this.inputDisabledColor, this.alpha);

    objs.forEach(this.drawObjInput, this);
  }

  drawInputs (objs) {
    this.graphic
      .fillStyle(this.inputColor, this.alpha)
      .lineStyle(this.lineWidth, this.inputColor, this.alpha);

    objs.forEach(this.drawObjInput, this);
  }

  drawMasks (objs) {
    this.graphic
      .fillStyle(this.maskColor, this.alpha)
      .lineStyle(this.lineWidth, this.maskColor, this.alpha);

    objs.forEach(this.drawObjMask, this);
  }

  drawVertices (objs) {
    this.graphic
      .lineStyle(this.lineWidth, this.verticesColor, this.alpha);

    objs.forEach(this.drawObjVertices, this);
  }

  drawPoints (objs) {
    this.graphic
      .lineStyle(this.lineWidth, this.pointsColor, this.alpha);

    objs.forEach(this.drawObjPoints, this);
  }

  drawObj (obj) {
    const width = obj.displayWidth || obj.width;
    const height = obj.displayHeight || obj.height;

    this.dot(obj.x, obj.y);

    if ((width || height) && ('originX' in obj)) {
      this.graphic.strokeRect(obj.x - obj.originX * width, obj.y - obj.originY * height, width, height);
    }

    if (obj.rotation && this.showRotation) {
      this.drawObjRotation(obj);
    }
  }

  drawObjRotation (obj) {
    const length = 0.5 * max((obj.displayWidth || obj.width), (obj.displayHeight || obj.height));

    this.line(obj.x, obj.y, cos(obj.rotation) * length, sin(obj.rotation) * length);
  }

  drawObjInput (obj) {
    this.drawObj(obj);
  }

  drawObjMask (obj) {
    if (obj.mask.bitmapMask) this.drawObj(obj.mask.bitmapMask);
  }

  drawObjVertices (obj) {
    const { x, y, scaleX, scaleY } = obj;
    const v = obj.vertices;
    const half = 0.5 * v.length;
    const points = [];

    for (let i = 0; i < half; i += 1) {
      points[i] = { x: x + scaleX * v[2 * i], y: y + scaleY * v[2 * i + 1] };
    }

    this.graphic.strokePoints(points);
  }

  drawObjPoints (obj) {
    const { x, y, scaleX, scaleY } = obj;

    this.graphic.strokePoints(obj.points.map(p => ({ x: x + scaleX * p.x, y: y + scaleY * p.y })));
  }

  drawPointers (pointers) {
    pointers.forEach(this.drawPointer, this);
  }

  drawPointer (pointer) {
    if (!pointer.active && !this.showInactivePointers) return;

    const { x, y, zoom } = this.systems.cameras.main;
    const worldX = pointer.worldX - x;
    const worldY = pointer.worldY - y;

    this.graphic.lineStyle(this.lineWidth, this.getColorForPointer(pointer), this.alpha);

    if (pointer.locked) {
      this.graphic.strokeRect(worldX - POINTER_RADIUS, worldY - POINTER_RADIUS, 2 * POINTER_RADIUS, 2 * POINTER_RADIUS);
      this.line(worldX, worldY, pointer.movementX, pointer.movementY);
    } else {
      this.graphic.strokeCircle(worldX, worldY, POINTER_RADIUS);
    }

    if (pointer.isDown) {
      this.line(worldX, worldY, (pointer.downX - pointer.x) / zoom, (pointer.downY - pointer.y) / zoom);
    }
  }

  drawCamera (camera) {
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

    const { _follow } = camera;

    if (_follow) {
      const { followOffset } = camera;

      this.graphic
        .fillStyle(this.cameraFollowColor, this.alpha)
        .lineStyle(this.lineWidth, this.cameraFollowColor, this.alpha);
      this.dot(_follow.x, _follow.y);
      this.lineDelta(_follow, followOffset, -1);
    }
  }

  getColorForPointer (pointer) {
    switch (true) {
      case (pointer.isDown): return this.pointerDownColor;
      case (!pointer.active): return this.pointerInactiveColor;
      default: return this.pointerColor;
    }
  }

  getPointers () {
    const { input } = this.systems;

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
  }

  bringToTop () {
    this.systems.displayList.bringToTop(this.graphic);
  }

  toggle () {
    this.graphic.setVisible(!this.graphic.visible);
  }

  line (x, y, dx, dy) {
    if (!dx && !dy) return;
    this.graphic.lineBetween(x, y, x + dx, y + dy);
  }

  lineDelta (start, delta, scale = 1) {
    this.line(start.x, start.y, scale * delta.x, scale * delta.y);
  }

  cross (x, y, dx, dy) {
    const rx = 0.5 * dx;
    const ry = 0.5 * dy;

    this.line(x - rx, y - ry, dx, dy);
    this.line(x - rx, y + ry, dx, -dy);
  }

  diamond (x, y, dx, dy) {
    const rx = 0.5 * dx;
    const ry = 0.5 * dy;

    this.graphic.strokePoints([{ x: x - rx, y: y }, { x: x, y: y - ry }, { x: x + rx, y: y }, { x: x, y: y + ry }], true, true);
  }

  dot (x, y) {
    this.graphic.fillPoint(x, y, 3 * this.lineWidth);
  }

  dotPoint (p) {
    this.dot(p.x, p.y);
  }
}

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
