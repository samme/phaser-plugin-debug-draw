console.assert(Phaser, 'Phaser');
console.assert(PhaserDebugDrawPlugin, 'Phaser.Plugins.DebugDrawPlugin');

var GREEN = 0x00ffff;
var RED = 0xff0000;
var Geom = Phaser.Geom;
var IncX = Phaser.Actions.IncX;
var WrapInRectangle = Phaser.Actions.WrapInRectangle;
var images = ['blue-planet', 'elephant', 'mask', 'nebula', 'starfield']
  .map(function (name) { return { key: name }; });
var sprites, maskImage, nebula, starfield, planet, controls, bounds;

function dragStart (pointer, gameObject) {
  gameObject.setTint(GREEN, GREEN, RED, RED);
}

function drag (pointer, gameObject, dragX, dragY) {
  gameObject.setPosition(dragX, dragY);
}

function dragEnd (pointer, gameObject) {
  gameObject.clearTint();
}

var scene = {

  preload: function () {
    this.load.image(images);
  },

  create: function () {
    bounds = Geom.Rectangle.Clone(this.sys.game.config);
    starfield = this.add.tileSprite(512, 384, 1024, 1024, 'starfield').setBlendMode(1);
    nebula = this.add.tileSprite(512, 384, 1024, 1024, 'nebula').setBlendMode(1);
    planet = this.add.image(512, 384, 'blue-planet').setScaleMode(Phaser.ScaleModes.LINEAR);
    maskImage = this.make.image({ key: 'mask', add: false });

    planet.setMask(maskImage.createBitmapMask());

    var group = this.add.group({
      key: 'elephant',
      frameQuantity: 5,
      setXY: { x: 128, y: 64, stepX: 128, stepY: 128 }
    });

    sprites = group.getChildren();

    sprites[0]
      .setName('triangularElephant')
      .setOrigin(0.5, 0)
      .setInteractive(new Geom.Triangle(0, 96, 48, 0, 96, 96), Geom.Triangle.Contains);

    sprites[1]
      .setName('circularElephant')
      .setOrigin(0.5, 0.5)
      .setInteractive(new Geom.Circle(48, 48, 48), Geom.Circle.Contains);

    sprites[2]
      .setName('ellipsoidElephant')
      .setOrigin(0, 0.5)
      .setInteractive(new Geom.Ellipse(48, 48, 96, 64), Geom.Ellipse.Contains);

    sprites[3]
      .setName('rectangularElephant')
      .setOrigin(0.5, 1)
      .setInteractive(new Geom.Rectangle(-16, 16, 128, 64), Geom.Rectangle.Contains);

    sprites[4]
      .setName('invisibleElephant')
      .setInteractive()
      .setVisible(false);

    Phaser.Actions.PropertyValueSet(sprites, 'angle', -5);

    this.input
      .setDraggable(sprites, true)
      .on('drag', drag)
      .on('dragstart', dragStart)
      .on('dragend', dragEnd);

    this.add.tween({
      targets: sprites,
      angle: 5,
      duration: 1000,
      ease: 'Sine.easeInOut',
      loop: -1,
      yoyo: true
    });

    this.add.text(0, 0, 'Drag the elephants around');

    this.debugDraw.bringToTop();

    var graphic = this.debugDraw.graphic;

    this.input.keyboard
      .on('keyup_D',
        function () {
          graphic.setVisible(!graphic.visible);
        }, this)
      .on('keyup_R',
        function () {
          this.scene.restart();
        }, this)
      .on('keyup_T',
        function () {
          this.scene.remove();
        }, this)
      .on('keyup_W',
        function () {
          this.cameras.main.setScroll(0, 0).setZoom(1);
        }, this);

    var cursors = this.input.keyboard.createCursorKeys();

    controls = new Phaser.Cameras.Controls.FixedKeyControl({
      camera: this.cameras.main,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      speed: 0.2
    });
  },

  update: function (time, delta) {
    var pointer = this.input.activePointer;

    maskImage.setPosition(pointer.x, pointer.y);
    nebula.tilePositionX -= 0.5;
    starfield.tilePositionX -= 0.25;
    planet.angle += 0.1;
    IncX(sprites, -1);
    WrapInRectangle(sprites, bounds, 50);
    controls.update(delta);
  }

};

window.game = new Phaser.Game({
  scene: scene,
  plugins: {
    scene: [{ key: 'DebugDrawPlugin', plugin: PhaserDebugDrawPlugin, mapping: 'debugDraw' }]
  },
  loader: { path: 'assets/' }
});
