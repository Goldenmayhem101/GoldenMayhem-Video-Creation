// Stills : node render.mjs out_dir [shot ...]
// Video  : node render.mjs --video <shot> <seconds> <fps> <out_dir> [scale 0.5=preview]   (needs ffmpeg)
import http from 'http'; import fs from 'fs'; import path from 'path'; import { spawnSync } from 'child_process'; import puppeteer from 'puppeteer-core';
const root = path.dirname(new URL(import.meta.url).pathname); const a = process.argv.slice(2);
const video = a[0] === '--video'; const scale = video ? parseFloat(a[5] || '1') : 1;
const mime = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(d); } }); }).listen(0);
const port = srv.address().port;
const chrome = process.env.CHROME || ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(fs.existsSync);
const br = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
const page = await br.newPage(); await page.setViewport({ width: Math.round(1080 * scale), height: Math.round(1920 * scale) });
page.on('pageerror', (e) => console.log('[error]', e.message));
await page.goto(`http://localhost:${port}/index.html?s=${scale}`); await page.waitForFunction('window.ready===true', { timeout: 120000 });
const grab = async () => Buffer.from((await page.evaluate(() => document.getElementById('c').toDataURL('image/png'))).split(',')[1], 'base64');
if (video) {
  const [, shot, secs, fps, out] = a; fs.mkdirSync(out, { recursive: true }); const n = Math.round(parseFloat(secs) * parseFloat(fps));
  for (let i = 0; i < n; i++) { await page.evaluate((s, t) => window.renderShot(s, t), shot, i / fps); fs.writeFileSync(path.join(out, `f_${String(i).padStart(4, '0')}.png`), await grab()); if (i % 10 === 0) console.log('frame', i, '/', n); }
  spawnSync('ffmpeg', ['-y', '-v', 'error', '-framerate', String(fps), '-i', path.join(out, 'f_%04d.png'), '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', path.join(out, shot + '.mp4')], { stdio: 'inherit' });
} else {
  const out = a[0] || 'out'; fs.mkdirSync(out, { recursive: true }); const ids = a.length > 1 ? a.slice(1) : await page.evaluate('window.SHOT_IDS');
  for (const id of ids) { const t0 = Date.now(); await page.evaluate((i) => window.renderShot(i, 1.0), id); fs.writeFileSync(path.join(out, id + '.png'), await grab()); console.log(id, ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
}
await br.close(); srv.close();
