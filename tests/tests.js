console.assert(Phaser, 'Missing Phaser');
console.assert(Phaser.VERSION === '3.19.0', 'Phaser VERSION is not 3.19.0');
console.assert(PhaserDebugDrawPlugin, 'Missing PhaserDebugDrawPlugin');

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
    planet = this.add.image(512, 384, 'blue-planet');
    maskImage = this.make.image({ key: 'mask', add: false });

    planet.setMask(maskImage.createBitmapMask());

    var group = this.add.group({
      key: 'elephant',
      frameQuantity: 6,
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

    sprites[5]
      .setName('polyElephant')
      .setInteractive(new Geom.Polygon([0, 48, 48, 0, 96, 48, 48, 96]), Geom.Polygon.Contains);

    Phaser.Actions.PropertyValueSet(sprites, 'angle', -15);

    this.input
      .setDraggable(sprites, true)
      .on('drag', drag)
      .on('dragstart', dragStart)
      .on('dragend', dragEnd);

    this.add.tween({
      targets: sprites,
      angle: 15,
      duration: 2000,
      ease: 'Sine.easeInOut',
      loop: -1,
      yoyo: true
    });

    this.add.text(0, 0, 'Drag the elephants around');

    var graphic = this.debugDraw.graphic;

    this.input.keyboard
      .on('keyup-T',
        function () {
          graphic.setVisible(!graphic.visible);
        }, this)
      .on('keyup-R',
        function () {
          this.scene.restart();
        }, this)
      .on('keyup-U',
        function () {
          this.scene.remove();
        }, this)
      .on('keyup-C',
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
