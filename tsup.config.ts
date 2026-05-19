import { readFile, writeFile } from 'node:fs/promises';
import { defineConfig } from 'tsup';

const NODE_BUILTINS = ['crypto', 'fs/promises', 'path', 'os', 'util', 'stream'];

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  minify: false,
  target: 'es2022',
  // `node` platform keeps node builtins external; the post-build hook below
  // restores the `node:` protocol prefix that esbuild strips, so consumers
  // (and lint rules like `n/prefer-node-protocol`) see correct imports.
  platform: 'node',
  outExtension: ({ format }) => ({ js: format === 'cjs' ? '.cjs' : '.js' }),
  async onSuccess() {
    for (const file of ['dist/index.js', 'dist/index.cjs']) {
      const src = await readFile(file, 'utf8');
      let out = src;
      for (const name of NODE_BUILTINS) {
        out = out
          .replaceAll(`from "${name}"`, `from "node:${name}"`)
          .replaceAll(`from '${name}'`, `from 'node:${name}'`)
          .replaceAll(`require("${name}")`, `require("node:${name}")`)
          .replaceAll(`require('${name}')`, `require('node:${name}')`);
      }
      if (out !== src) await writeFile(file, out);
    }
  },
});
