import Phaser from 'phaser';

const { cos, max, sin } = Math;
const _disabledInputs = [];
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
    const { displayList } = this.systems;

    if (!displayList.length) return;

    _disabledInputs.length = 0;
    _inputs.length = 0;
    _masks.length = 0;

    this.graphic.clear()
      .fillStyle(this.color, this.alpha)
      .lineStyle(this.lineWidth, this.color, this.alpha);

    const showInput = this.showInput && this.systems.input.isActive();

    displayList.each(this.processObj, this, _disabledInputs, _inputs, _masks, showInput);

    if (_disabledInputs.length) this.drawDisabledInputs(_disabledInputs);
    if (_inputs.length) this.drawInputs(_inputs);
    if (_masks.length) this.drawMasks(_masks);
    if (showInput && this.showPointers) this.drawPointers(this.getPointers());
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
    this.graphic
      .strokeRect(getLeft(obj), getTop(obj), (obj.displayWidth || obj.width), (obj.displayHeight || obj.height))
      .fillPoint(obj.x, obj.y, 3 * this.lineWidth);

    if (obj.rotation && this.showRotation) {
      this.drawObjRotation(obj);
    }

    if ((obj.tilePositionX || obj.tilePositionY) && this.showTilePosition) {
      this.drawObjTilePosition(obj);
    }
  }

  drawObjTilePosition (obj) {
    let { tilePositionX, tilePositionY } = obj;

    const x = obj.x - tilePositionX;
    const y = obj.y - tilePositionY;

    this.graphic
      .lineBetween(x - 5, y - 5, x + 5, y + 5)
      .lineBetween(x - 5, y + 5, x + 5, y - 5);
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

    if (pointer.isDown) {
      this.graphic.lineBetween(pointer.downX - x, pointer.downY - y, worldX, worldY);
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
  inputDisabledColor: 0x886600,
  lineWidth: 1,
  maskColor: 0xff0022,
  pointerColor: 0xffcc00,
  pointerDownColor: 0x00ff22,
  pointerInactiveColor: 0x888888,
  showInactivePointers: true,
  showInput: true,
  showPointers: true,
  showRotation: true,
  showTilePosition: true
});

if (typeof window !== 'undefined') {
  window.PhaserDebugDrawPlugin = DebugDrawPlugin;
}

export default DebugDrawPlugin;
