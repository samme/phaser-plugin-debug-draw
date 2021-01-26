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

    const disabledInputObjs = [];
    const inputObjs = [];
    const maskedObjs = [];
    const vertexesObjs = [];
    const pointsObjs = [];
    const otherObjs = [];
    const showInput = this.showInput && this.systems.input.isActive();

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
  }

  processObj (obj, disabledInputObjs, inputObjs, masks, verticesObjs, pointsObjs, otherObjs, showInput, showVertices, showPoints) {
    if (obj.input && showInput) {
      if (obj.input.enabled) {
        inputObjs[inputObjs.length] = obj;
      } else {
        disabledInputObjs[disabledInputObjs.length] = obj;
      }
    } else {
      otherObjs[otherObjs.length] = obj;
    }

    const bitmapMask = obj.mask ? obj.mask.bitmapMask : null;

    if (bitmapMask && masks.indexOf(bitmapMask) === -1) {
      masks[masks.length] = bitmapMask;
    }

    if (obj.vertices && obj.vertices.length && showVertices) {
      verticesObjs[verticesObjs.length] = obj;
    }

    if (obj.points && obj.points.length && showPoints) {
      pointsObjs[pointsObjs.length] = obj;
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

  drawOthers (objs) {
    this.setColor(this.color);

    objs.forEach(this.drawObj, this);
  }

  drawDisabledInputs (objs) {
    this.setColor(this.inputDisabledColor);

    objs.forEach(this.drawObjInput, this);
  }

  drawInputs (objs) {
    this.setColor(this.inputColor);

    objs.forEach(this.drawObjInput, this);
  }

  drawMasks (objs) {
    this.setColor(this.maskColor);

    objs.forEach(this.drawObj, this);
  }

  drawVertices (objs) {
    this.setColor(this.verticesColor);

    objs.forEach(this.drawObjVertices, this);
  }

  drawPoints (objs) {
    this.setColor(this.pointsColor);

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

  setColor (color) {
    this.graphic.fillStyle(color, this.alpha).lineStyle(this.lineWidth, color, this.alpha);
  }

  line (x, y, dx, dy) {
    if (!dx && !dy) return;
    this.graphic.lineBetween(x, y, x + dx, y + dy);
  }

  lineDelta (start, delta, scale = 1) {
    this.line(start.x, start.y, scale * delta.x, scale * delta.y);
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
