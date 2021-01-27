import Phaser from 'phaser';

import colors from './colors';

const { cos, max, sin } = Math;

const { Each } = Phaser.Utils.Array;

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
    const { cameras, displayList, lights } = this.systems;

    if (!displayList.length) return;

    const disabledInputObjs = [];
    const inputObjs = [];
    const maskObjs = [];
    const otherObjs = [];
    const showInput = this.showInput && this.systems.input.isActive();

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
  }

  processObj (obj, disabledInputObjs, inputObjs, maskObjs, otherObjs, showInput) {
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

    const maskObj = obj.mask ? obj.mask.bitmapMask : null;

    if (maskObj && maskObjs.indexOf(maskObj) === -1) {
      maskObjs[maskObjs.length] = maskObj;
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

  drawPointers (pointers) {
    pointers.forEach(this.drawPointer, this);
  }

  drawPointer (pointer) {
    if (!pointer.active && !this.showInactivePointers) return;

    const { x, y, zoom } = this.systems.cameras.main;
    const worldX = pointer.worldX - x;
    const worldY = pointer.worldY - y;

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
  }

  drawCamera (camera) {
    if (camera.useBounds) {
      this.setColor(this.cameraBoundsColor);
      this.graphic.strokeRectShape(camera._bounds);
    }

    if (camera.deadzone) {
      this.setColor(this.cameraDeadzoneColor);
      this.graphic.strokeRectShape(camera.deadzone);
    }

    const { _follow } = camera;

    if (_follow) {
      const { followOffset } = camera;

      this.setColor(this.cameraFollowColor);
      this.dot(_follow.x, _follow.y);
      this.lineDelta(_follow, followOffset, -1);
    }
  }

  drawLights (lights) {
    this.setColor(this.lightColor);

    lights.forEach(this.drawLight, this);
  }

  drawLight (light) {
    this.graphic.strokeCircleShape(light);
  }

  getColorForPointer (pointer) {
    if (pointer.isDown) return this.pointerDownColor;
    if (!pointer.active) return this.pointerInactiveColor;

    return this.pointerColor;
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

export default DebugDrawPlugin;
