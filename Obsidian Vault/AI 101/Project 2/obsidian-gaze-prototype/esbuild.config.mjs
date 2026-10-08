import esbuild from 'esbuild';

const production = process.argv[2] === 'production';
const context = await esbuild.context({
  entryPoints: ['main.ts'],
  outfile: 'main.js',
  bundle: true,
  external: ['obsidian'],
  format: 'cjs',
  platform: 'browser',
  target: 'es2021',
  sourcemap: production ? false : 'inline',
  minify: production,
  logLevel: 'info',
});

if (production) {
  await context.rebuild();
  await context.dispose();
} else {
  await context.watch();
  console.log('Watching obsidian-gaze source files...');
}
