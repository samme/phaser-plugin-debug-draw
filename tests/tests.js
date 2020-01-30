console.assert(Phaser, 'Phaser', Phaser);
console.assert(Phaser.VERSION === '3.22.0', 'Phaser VERSION is 3.22.0', Phaser.VERSION);
console.assert(PhaserDebugDrawPlugin, 'PhaserDebugDrawPlugin', PhaserDebugDrawPlugin);

var GREEN = 0x00ffff;
var RED = 0xff0000;
var Geom = Phaser.Geom;
var IncX = Phaser.Actions.IncX;
var WrapInRectangle = Phaser.Actions.WrapInRectangle;
var images = ['blue-planet', 'elephant', 'mask', 'nebula', 'starfield']
  .map(function (name) { return { key: name }; });
var sprites, maskImage, nebula, starfield, planet, controls, bounds, quad;

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

    var mask = maskImage.createBitmapMask();

    planet.setMask(mask);

    var group = this.add.group({
      key: 'elephant',
      frameQuantity: 5,
      setXY: { x: 128, y: 64, stepX: 128, stepY: 128 },
      hitArea: new Geom.Rectangle(-16, 16, 128, 64),
      hitAreaCallback: Geom.Rectangle.Contains
    });

    sprites = group.getChildren();

    sprites[0]
      .setName('inertElephant')
      .disableInteractive();

    sprites[1]
      .setName('invisibleElephant')
      .setVisible(false);

    sprites[2]
      .setName('maskedElephant')
      .setMask(mask);

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

    quad = this.add.quad(128, 640, 'elephant')
      .setName('quadraticElephant');

    sprites.push(quad);

    this.add.text(0, 0, 'Drag the elephants around');

    this.input.keyboard
      .on('keyup-T',
        function () {
          this.debugDraw.toggle();
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
        }, this)
      .on('keyup-I',
        function () {
          this.debugDraw.showInput = !this.debugDraw.showInput;
        }, this)
      .on('keyup-P',
        function () {
          this.debugDraw.showPointers = !this.debugDraw.showPointers;
        }, this)
      .on('keyup-O',
        function () {
          this.debugDraw.showRotation = !this.debugDraw.showRotation;
        }, this)
      .once('keyup-S', function () {
        this.game.renderer.snapshot(function (image) {
          image.style.width = '200px';
          image.style.height = '150px';

          document.body.appendChild(image);
        });
      });

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

    console.log('this.debugDraw', this.debugDraw);
  },

  update: function (time, delta) {
    var pointer = this.input.activePointer;

    maskImage.setPosition(pointer.x, pointer.y);
    nebula.tilePositionX -= 0.5;
    starfield.tilePositionX -= 0.25;
    planet.angle += 0.1;

    IncX(sprites, -1);
    WrapInRectangle(sprites, bounds, 50);

    quad.topLeftY = quad.y - 40 + 10 * Math.sin(0.02 * quad.x);
    quad.bottomLeftY = quad.y + 40 + 10 * Math.sin(0.04 * quad.x);
    quad.topRightY = quad.y - 40 + 10 * Math.sin(0.03 * quad.x);
    quad.bottomRightY = quad.y + 40 + 10 * Math.sin(0.05 * quad.x);

    controls.update(delta);
  }

};

window.game = new Phaser.Game({
  scene: scene,
  plugins: {
    scene: [{ key: 'DebugDrawPlugin', plugin: PhaserDebugDrawPlugin, mapping: 'debugDraw' }]
  },
  loader: { path: 'assets/' },
  audio: { noAudio: true }
});
