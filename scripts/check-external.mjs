// Slow, network-bound check; it never fails the build (exit code is always 0).
import { readdirSync, readFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { DOCS_DIR } from './lib/content.mjs';

const TIMEOUT_MS = 10_000;
const PAUSE_MS = 400;
const dirArg = process.argv.find((x) => x.startsWith('--dir='));
const dir = dirArg ? dirArg.slice(6) : DOCS_DIR;

function walk(d) {
  return readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : /\.mdx?$/.test(e.name) ? [join(d, e.name)] : [],
  );
}

const urls = new Map();
for (const file of walk(dir)) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/https?:\/\/[^\s<>"'`)\]}]+/g)) {
    const url = m[0].replace(/[.,;:!?]+$/, '');
    if (!urls.has(url)) urls.set(url, file);
  }
}

async function probe(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS), headers: { 'user-agent': 'link-checker' } });
      if (res.ok) return null;
      if (method === 'GET') return `HTTP ${res.status}`;
    } catch (err) {
      if (method === 'GET') return err.name === 'TimeoutError' ? 'таймаут' : (err.cause?.code ?? err.message);
    }
  }
  return 'неизвестная ошибка';
}

const broken = [];
let i = 0;
for (const [url, file] of urls) {
  const problem = await probe(url);
  console.log(`[${++i}/${urls.size}] ${problem ? 'FAIL' : 'ok  '} ${url}`);
  if (problem) broken.push({ url, file, problem });
  await new Promise((r) => setTimeout(r, PAUSE_MS));
}

const lines = [`check:external: проверено ссылок: ${urls.size}, недоступных: ${broken.length}`];
for (const b of broken) lines.push(`  - ${b.url} (${b.problem}) — ${b.file}`);
console.log(lines.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
