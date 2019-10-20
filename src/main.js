import Phaser from 'phaser';

const { cos, sin } = Math;
const _inputs = [];
const _masks = [];
const POINTER_RADIUS = 20;

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
    const { displayList, input } = this.systems;

    if (!displayList.length) return;

    inputs.length = 0;
    masks.length = 0;

    this.graphic.clear()
      .fillStyle(this.color, this.alpha)
      .lineStyle(this.lineWidth, this.color, this.alpha);

    displayList.each(this.processObj, this, inputs, masks);

    if (inputs.length) this.drawInputs(inputs);
    if (masks.length) this.drawMasks(masks);
    if (input.enabled && this.showPointers) this.drawPointers(this.getPointers());
  }

  processObj (obj, inputs, masks) {
    this.drawObj(obj);

    if (obj.input && this.showInput) {
      inputs[inputs.length] = obj;
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
      .off('render', this.sceneRender, this)
      .off('shutdown', this.sceneShutdown, this)
      .off('destroy', this.sceneDestroy, this);

    this.scene = null;
    this.systems = null;
  }

  drawInputs (objs) {
    this.graphic.lineStyle(this.lineWidth, this.inputColor, this.alpha);
    objs.forEach(this.drawObjInput, this);
  }

  drawMasks (objs) {
    this.graphic.lineStyle(this.lineWidth, this.maskColor, this.alpha);
    objs.forEach(this.drawObjMask, this);
  }

  drawObj (obj) {
    this.graphic
      .strokeRect(getLeft(obj), getTop(obj), obj.displayWidth || obj.width, obj.displayHeight || obj.height)
      .fillPoint(obj.x, obj.y, 3 * this.lineWidth);

    if (obj.rotation && this.showRotation) {
      this.drawObjRotation(obj);
    }
  }

  drawObjRotation (obj) {
    this.graphic.lineBetween(
      obj.x,
      obj.y,
      obj.x + 0.5 * cos(obj.rotation) * (obj.displayWidth || obj.width),
      obj.y + 0.5 * sin(obj.rotation) * (obj.displayHeight || obj.height));
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

    const { worldX, worldY } = pointer;

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
  }

  getColorForPointer (pointer) {
    switch (true) {
      case (pointer.isDown): return this.pointerDownColor;
      case (!pointer.active): return this.pointerInactiveColor;
      default: return this.pointerColor;
    }
  }

  getPointers () {
    const { mousePointer, pointer1, pointer2, pointer3, pointer4, pointer5, pointer6, pointer7, pointer8, pointer9 } = this.systems.input;

    return [mousePointer, pointer1, pointer2, pointer3, pointer4, pointer5, pointer6, pointer7, pointer8, pointer9].filter(Boolean);
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
  color: 0x00ddff,
  inputColor: 0xffcc00,
  lineWidth: 1,
  maskColor: 0xff0022,
  pointerColor: 0xffcc00,
  pointerDownColor: 0x00ff22,
  pointerInactiveColor: 0x888888,
  showPointers: true,
  showInactivePointers: true,
  showInput: true,
  showRotation: true
});

if (typeof window !== 'undefined') {
  window.PhaserDebugDrawPlugin = DebugDrawPlugin;
}

export default DebugDrawPlugin;
