4.7.0 / 2020-04-30
------------------

- Added: draws camera `followOffset`.
- Changed: draws a dot for camera follow target.

4.6.0 / 2020-02-04
------------------ 

- Changed: draws no box for objects with size but no origin (Blitter, Mesh, Quad, Rope).

4.5.0 / 2020-01-30
------------------

- Added: draws object `points` (e.g., Rope).
- Added: draws a vector for dragged input pointer. 
- Changed: object vertices are scaled.
- Fixed: start by `load.scenePlugin()`.

4.4.0 / 2020-01-22
------------------

- Added drawing object vertices.
- Changed default `pointerDownColor`.

4.3.0 / 2020-01-09
------------------

- Added drawing the camera follow target.
- Changed the default colors. More saturated.
- Switched to the scene's `postupdate` event, from `render`.

4.2.0 / 2020-01-07
------------------

- Changed the default `color` value, now light blue again.

4.1.0 / 2020-01-07
------------------

- Added drawing of camera bounds.
- Added drawing of camera deadzone.
- Changed the default colors slightly.

4.0.0 / 2019-11-26
------------------

- Removed input hit area shapes. This is better done with [input.enableDebug()][1].
- Changed the `dist/` file names.
- Changed: when a scene is inactive (paused) or has input disabled, its input pointers are hidden.
- Changed: when a scene is inactive (paused) or has input disabled, any interactive objects are drawn in `color`, not `inputColor` or `inputDisabedColor`.
- Fixed rotation angle.
- Fixed pointer position for offset cameras.
- Added `inputDisabledColor` for disabled interactive objects.

[1]: https://photonstorm.github.io/phaser3-docs/Phaser.Input.InputPlugin.html#enableDebug

3.4.0 / 2019-10-20
------------------

- Added toggle method.
- Added `showInput` and `showRotation` options.
- Changed the default pointer colors.

3.3.0 / 2019-10-20
------------------

- Added display of input pointers.
- Added display of object rotation.
- Changed the size of the origin point.

3.2.0 / 2019-10-19
------------------

- Changed the default styles to 100% alpha and 1px stroke width.
- Added proper dimensions for objects with no `displayWidth` and `displayHeight`.

3.1.0 / 2019-10-01
------------------

- Added drawing a point for object position (origin).

3.0.0 / 2019-09-24
------------------

- Changed the 'main' file. There are now 3 package builds for 'browser' (UMD), 'main' (CommonJS), and 'module' (ES6).

2.1.0 / 2019-09-24
------------------

- Added polygon hit areas.
- Added automatic bringToTop() call.
- Required Phaser v3.19 or above.

2.0.3 / 2019-09-18
------------------

- Updated dev dependencies.

2.0.2 / 2019-09-17
------------------

- Changed Phaser to a peer dependency.

2.0.1 / 2019-06-13
------------------

- Updated dev dependencies.

2.0.0 / 2019-03-05
------------------

- Changed 'main' file to `src/index.js` (ES6 module).

1.0.3 / 2019-02-19
------------------

- Updated dev dependencies.

1.0.2 / 2019-01-15
------------------

- Fixed error for unknown hitArea constructor.

1.0.1 / 2018-11-18
------------------

- Updated README.

1.0.0 / 2018-11-13
------------------

- npm release.
