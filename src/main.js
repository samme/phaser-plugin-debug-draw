import Phaser from 'phaser';

import colors from './colors';

const { cos, max, sin } = Math;

const POINTER_RADIUS = 20;

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
    const { cameras, displayList } = this.systems;

    if (!displayList.length) return;

    const disabledInputs = [];
    const inputs = [];
    const masks = [];
    const showInput = this.showInput && this.systems.input.isActive();

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
  }

  processObj (obj, disabledInputs, inputs, masks, showInput) {
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
  }

  sceneDestroy () {
    this.systems.events
      .off('start', this.sceneStart, this)
      .off('create', this.bringToTop, this)
      .off('render', this.sceneRender, this)
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

  drawObj (obj) {
    const width = obj.displayWidth || obj.width;
    const height = obj.displayHeight || obj.height;
    const left = obj.originX ? (obj.x - obj.originX * width) : obj.x;
    const top = obj.originY ? (obj.y - obj.originY * height) : obj.y;

    this.graphic.fillPoint(obj.x, obj.y, 3 * this.lineWidth);

    if (width || height) {
      this.graphic.strokeRect(left, top, width, height);
    }

    if (obj.rotation && this.showRotation) {
      this.drawObjRotation(obj);
    }
  }

  drawObjRotation (obj) {
    const length = 0.5 * max((obj.displayWidth || obj.width), (obj.displayHeight || obj.height));

    this.graphic.lineBetween(
      obj.x,
      obj.y,
      obj.x + cos(obj.rotation) * length,
      obj.y + sin(obj.rotation) * length);
  }

  drawObjInput (obj) {
    this.drawObj(obj);
  }

  drawObjMask (obj) {
    if (obj.mask.bitmapMask) this.drawObj(obj.mask.bitmapMask);
  }

  drawPointers (pointers) {
    pointers.forEach(this.drawPointer, this);
  }

  drawPointer (pointer) {
    if (!pointer.active && !this.showInactivePointers) return;

    const { x, y } = this.systems.cameras.main;
    const worldX = pointer.worldX - x;
    const worldY = pointer.worldY - y;

    this.graphic.lineStyle(this.lineWidth, this.getColorForPointer(pointer), this.alpha);

    if (pointer.locked) {
      this.graphic
        .strokeRect(worldX - POINTER_RADIUS, worldY - POINTER_RADIUS, 2 * POINTER_RADIUS, 2 * POINTER_RADIUS)
        .lineBetween(worldX, worldY, worldX + pointer.movementX, worldY + pointer.movementY);
    } else {
      this.graphic.strokeCircle(worldX, worldY, POINTER_RADIUS);
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
}

Object.assign(DebugDrawPlugin.prototype, {
  alpha: 1,
  color: colors.blue,
  inputColor: colors.yellow,
  inputDisabledColor: colors.gray,
  cameraBoundsColor: 0xff8800,
  cameraDeadzoneColor: 0x88ff00,
  lineWidth: 1,
  maskColor: colors.red,
  pointerColor: colors.yellow,
  pointerDownColor: colors.lime,
  pointerInactiveColor: colors.gray,
  showInactivePointers: false,
  showInput: true,
  showPointers: true,
  showRotation: true
});

export default DebugDrawPlugin;
