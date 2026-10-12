import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const screenshot = path.resolve(here, '../preview-narrow.png');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'idea-quest-chat-browser-'));
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const child = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  const portFile = path.join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 50 && !fs.existsSync(portFile); i++) await delay(100);
  if (!fs.existsSync(portFile)) throw new Error('Chrome debugging port did not open.');
  const port = Number(fs.readFileSync(portFile, 'utf8').split('\n')[0]);
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const target = targets.find((item) => item.type === 'page');
  if (!target) throw new Error('Chrome page target not found.');
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let nextId = 0;
  const pending = new Map();
  socket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (!data.id || !pending.has(data.id)) return;
    const { resolve, reject } = pending.get(data.id);
    pending.delete(data.id);
    if (data.error) reject(new Error(data.error.message)); else resolve(data.result);
  };
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await call('Page.enable');
  await call('Page.navigate', { url: 'http://127.0.0.1:4189/' });
  await delay(2500);
  if (process.argv.includes('--chat')) {
    await call('Runtime.evaluate', { expression: 'document.querySelector("#prompt").value = "Which idea.quest gates are approved?"; document.querySelector("#chat-form").requestSubmit();' });
    let answered = false;
    for (let i = 0; i < 80; i++) {
      await delay(500);
      const result = await call('Runtime.evaluate', { expression: 'document.querySelector(".message.assistant")?.innerText || ""', returnByValue: true });
      if (result.result.value?.includes('2/5')) { answered = true; break; }
    }
    if (!answered) throw new Error('Browser chat did not produce a grounded 2/5 answer.');
    console.log('Browser chat produced a grounded 2/5 answer.');
  }
  const metrics = await call('Runtime.evaluate', { expression: '({width: innerWidth, scrollWidth: document.documentElement.scrollWidth, projectButtons: document.querySelectorAll(".project-button").length, firstText: document.querySelector(".project-button")?.innerText, firstColor: getComputedStyle(document.querySelector(".project-button .project-name")).color, firstOpacity: getComputedStyle(document.querySelector(".project-button .project-name")).opacity, firstNameRect: document.querySelector(".project-button .project-name").getBoundingClientRect().toJSON(), firstIconRect: document.querySelector(".project-button .project-icon").getBoundingClientRect().toJSON()})', returnByValue: true });
  const capture = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(screenshot, Buffer.from(capture.data, 'base64'));
  console.log(JSON.stringify(metrics.result.value));
  if (metrics.result.value.scrollWidth > metrics.result.value.width) process.exitCode = 1;
  socket.close();
} finally {
  child.kill();
  await delay(500);
  if (path.resolve(profile).startsWith(path.resolve(os.tmpdir()) + path.sep)) {
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome may still hold a temporary file. */ }
  }
}
