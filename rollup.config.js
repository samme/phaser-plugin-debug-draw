import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';
import pkg from './package.json';

export default [
  {
    input: 'src/main.js',
    output: [
      { file: pkg.browser, format: 'umd', name: 'PhaserDebugDrawPlugin', globals: { phaser: 'Phaser' } },
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    external: ['phaser'],
    plugins: [
      resolve(),
      commonjs(),
      buble({ exclude: ['node_modules/**'] })
    ]
  }
];
