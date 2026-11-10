import { watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig, refreshProjectContext, sourceFingerprint } from './context.mjs';

// fs.watch handles quick changes; polling catches editor atomic saves and missed
// Windows events. Neither mechanism writes back to source notes or the registry.
export async function watchProjectContext(options = {}) {
  const config = await loadConfig(options);
  let closed = false;
  let busy = false;
  let rerun = false;
  let debounce;
  let fingerprint = await sourceFingerprint(options);
  const watchers = [];
  const report = error => options.onError?.(error);
  const run = async (force = false) => {
    if (closed) return;
    if (busy) { rerun = true; return; }
    busy = true;
    try {
      const next = await sourceFingerprint(options);
      if (force || next !== fingerprint) {
        const data = await refreshProjectContext(options);
        fingerprint = next;
        await options.onUpdate?.(data);
      }
    } catch (error) { report(error); }
    finally {
      busy = false;
      if (rerun && !closed) { rerun = false; schedule(); }
    }
  };
  const schedule = () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => run(), config.debounceMs);
  };
  for (const [directory, predicate] of [
    [config.notesDirectory, name => name.endsWith('.md')],
    [path.dirname(config.registry), name => name === path.basename(config.registry)],
    [path.dirname(config.configPath), name => name === path.basename(config.configPath)],
  ]) {
    try {
      const watcher = watch(directory, (_event, filename) => { if (!filename || predicate(String(filename))) schedule(); });
      watcher.on('error', report);
      watchers.push(watcher);
    } catch (error) { report(error); }
  }
  const poll = setInterval(() => run(), config.pollIntervalMs);
  await run(true);
  return {
    refresh: () => run(true),
    close() { closed = true; clearTimeout(debounce); clearInterval(poll); for (const watcher of watchers) watcher.close(); },
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const monitor = await watchProjectContext({
    onUpdate: data => console.log(`Project context updated: ${data.projects.length} notes.`),
    onError: error => console.error(`Project context: ${error.message}`),
  });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { monitor.close(); process.exit(); });
}
