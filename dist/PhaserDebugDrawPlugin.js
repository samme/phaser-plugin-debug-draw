(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('phaser-plugin-debug-draw', ['exports', 'phaser'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('phaser'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.Phaser);
    global.phaserPluginDebugDraw = mod.exports;
  }
})(this, function (exports, _phaser) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _phaser2 = _interopRequireDefault(_phaser);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var _shapes2, _methods2;

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var _Phaser$Geom = _phaser2.default.Geom,
      CIRCLE = _Phaser$Geom.CIRCLE,
      ELLIPSE = _Phaser$Geom.ELLIPSE,
      LINE = _Phaser$Geom.LINE,
      POINT = _Phaser$Geom.POINT,
      POLYGON = _Phaser$Geom.POLYGON,
      RECTANGLE = _Phaser$Geom.RECTANGLE,
      TRIANGLE = _Phaser$Geom.TRIANGLE;

  var _inputs = [];
  var _masks = [];
  var _shapes = (_shapes2 = {}, _defineProperty(_shapes2, CIRCLE, new _phaser2.default.Geom.Circle()), _defineProperty(_shapes2, ELLIPSE, new _phaser2.default.Geom.Ellipse()), _defineProperty(_shapes2, LINE, new _phaser2.default.Geom.Line()), _defineProperty(_shapes2, POLYGON, new _phaser2.default.Geom.Polygon()), _defineProperty(_shapes2, RECTANGLE, new _phaser2.default.Geom.Rectangle()), _defineProperty(_shapes2, TRIANGLE, new _phaser2.default.Geom.Triangle()), _shapes2);
  var _methods = (_methods2 = {}, _defineProperty(_methods2, CIRCLE, 'strokeCircleShape'), _defineProperty(_methods2, ELLIPSE, 'strokeEllipseShape'), _defineProperty(_methods2, LINE, 'strokeLineShape'), _defineProperty(_methods2, RECTANGLE, 'strokeRectShape'), _defineProperty(_methods2, TRIANGLE, 'strokeTriangleShape'), _methods2);

  function copyPoly(source, dest, ox, oy) {
    var len = source.points.length;

    dest.points.length = len;

    for (var i = len; i--; i >= 0) {
      var p = dest.points[i];
      var q = source.points[i];

      if (p) {
        p.x = q.x + ox;p.y = q.y + oy;
      } else {
        dest.points[i] = { x: q.x + ox, y: q.y + oy };
      }
    }
  }

  function getLeft(obj) {
    return obj.originX ? obj.x - obj.originX * obj.displayWidth : obj.x;
  }

  function getTop(obj) {
    return obj.originY ? obj.y - obj.originY * obj.displayHeight : obj.y;
  }

  var DebugDrawPlugin = function (_Phaser$Plugins$Scene) {
    _inherits(DebugDrawPlugin, _Phaser$Plugins$Scene);

    function DebugDrawPlugin() {
      _classCallCheck(this, DebugDrawPlugin);

      return _possibleConstructorReturn(this, (DebugDrawPlugin.__proto__ || Object.getPrototypeOf(DebugDrawPlugin)).apply(this, arguments));
    }

    _createClass(DebugDrawPlugin, [{
      key: 'boot',
      value: function boot() {
        this.systems.events.on('start', this.sceneStart, this).on('create', this.bringToTop, this).on('render', this.sceneRender, this).on('shutdown', this.sceneShutdown, this).once('destroy', this.sceneDestroy, this);
      }
    }, {
      key: 'sceneStart',
      value: function sceneStart() {
        this.graphic = this.scene.add.graphics();
      }
    }, {
      key: 'sceneShutdown',
      value: function sceneShutdown() {
        this.graphic.destroy();
        this.graphic = null;
      }
    }, {
      key: 'sceneRender',
      value: function sceneRender() {
        this.drawAll();
      }
    }, {
      key: 'drawAll',
      value: function drawAll() {
        var inputs = _inputs;
        var masks = _masks;
        var displayList = this.systems.displayList;


        if (!displayList.length) return;

        inputs.length = 0;
        masks.length = 0;

        this.graphic.clear().lineStyle(this.lineWidth, this.color, this.alpha);

        displayList.each(this.processObj, this, inputs, masks);
        if (inputs.length) this.drawObjsInputs(inputs);
        if (masks.length) this.drawObjsMasks(masks);
      }
    }, {
      key: 'processObj',
      value: function processObj(obj, inputs, masks) {
        this.drawObj(obj);

        if (obj.input) {
          inputs[inputs.length] = obj;
        }

        if (obj.mask && masks.indexOf(obj) === -1) {
          masks[masks.length] = obj;
        }
      }
    }, {
      key: 'sceneDestroy',
      value: function sceneDestroy() {
        this.systems.events.off('start', this.sceneStart, this).off('render', this.sceneRender, this).off('shutdown', this.sceneShutdown, this).off('destroy', this.sceneDestroy, this);

        this.scene = null;
        this.systems = null;
      }
    }, {
      key: 'drawObjsInputs',
      value: function drawObjsInputs(objs) {
        this.graphic.lineStyle(this.lineWidth, this.inputColor, this.alpha);
        objs.forEach(this.drawObjInput, this);
      }
    }, {
      key: 'drawObjsMasks',
      value: function drawObjsMasks(objs) {
        this.graphic.fillStyle(this.maskColor, this.alpha).lineStyle(this.lineWidth, this.maskColor, this.alpha);
        objs.forEach(this.drawObjMask, this);
      }
    }, {
      key: 'drawObj',
      value: function drawObj(obj) {
        this.graphic.strokeRect(getLeft(obj), getTop(obj), obj.displayWidth, obj.displayHeight);
      }
    }, {
      key: 'drawObjInput',
      value: function drawObjInput(obj) {
        var hitArea = obj.input.hitArea;

        var ctor = hitArea.constructor;
        var shape = _shapes[hitArea.type] || _shapes[RECTANGLE];

        if (shape.type === POLYGON) {
          copyPoly(hitArea, shape, getLeft(obj), getTop(obj));

          this.graphic.strokePoints(shape.points, true);
        } else {
          ctor.CopyFrom(hitArea, shape);
          ctor.Offset(shape, getLeft(obj), getTop(obj));

          this.graphic[_methods[shape.type]](shape);
        }
      }
    }, {
      key: 'drawObjMask',
      value: function drawObjMask(obj) {
        if (obj.mask.bitmapMask) this.drawObjBitmapMask(obj);
      }
    }, {
      key: 'drawObjBitmapMask',
      value: function drawObjBitmapMask(obj) {
        this.drawObj(obj.mask.bitmapMask);
      }
    }, {
      key: 'bringToTop',
      value: function bringToTop() {
        this.systems.displayList.bringToTop(this.graphic);
      }
    }]);

    return DebugDrawPlugin;
  }(_phaser2.default.Plugins.ScenePlugin);

  Object.assign(DebugDrawPlugin.prototype, {
    alpha: 0.5,
    color: 0x00ddff,
    inputColor: 0xffcc00,
    lineWidth: 2,
    maskColor: 0xff0022
  });

  if (typeof window !== 'undefined') {
    window.PhaserDebugDrawPlugin = DebugDrawPlugin;
  }

  exports.default = DebugDrawPlugin;
});

//# sourceMappingURL=PhaserDebugDrawPlugin.js.map