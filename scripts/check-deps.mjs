// Linear route: tracks in TRACK_ORDER, inside a track the groups in GROUP_ORDER,
// inside a group sidebar.order. A lesson may only require something strictly earlier.
import { loadPages, LOCALES } from './lib/content.mjs';

const TRACK_ORDER = ['core', 'practice', 'lab', 'project', 'troubleshooting', 'reference'];
const GROUP_ORDER = ['start', 'basics', 'practice', 'labs', 'projects', 'why-failed', 'reference'];

const pages = loadPages();
const mermaid = process.argv.includes('--mermaid');
const localeArg = process.argv.find((x) => x.startsWith('--locale='));
const errors = [];
const warnings = [];

function position(p) {
  const group = GROUP_ORDER.indexOf(p.rel.split('/')[0]);
  return [TRACK_ORDER.indexOf(p.track), group === -1 ? 99 : group, p.order ?? 9999];
}
function compare(x, y) {
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

function lessonIn(locale, id) {
  for (const p of pages.get(locale).values()) if (p.lessonId === id) return p;
  return undefined;
}

function analyse(locale) {
  const byId = new Map();
  for (const p of pages.get(locale).values()) {
    if (!p.lessonId) continue;
    if (byId.has(p.lessonId)) {
      errors.push(`[${locale}] lessonId ${p.lessonId} повторяется: ${byId.get(p.lessonId).file} и ${p.file}`);
      continue;
    }
    byId.set(p.lessonId, p);
  }

  for (const p of byId.values()) {
    for (const req of p.requires) {
      const target = byId.get(req);
      if (!target) {
        const other = LOCALES.filter((l) => l !== locale).map((l) => lessonIn(l, req)).find(Boolean);
        const msg = `[${locale}] ${p.file}: requires "${req}" — такого lessonId нет`;
        (other?.status === 'draft' ? warnings : errors).push(msg);
        continue;
      }
      if (target === p) {
        errors.push(`[${locale}] ${p.file}: урок ${p.lessonId} требует сам себя`);
        continue;
      }
      if (p.track === 'core' && target.track !== 'core') {
        errors.push(`[${locale}] ${p.file}: урок core ${p.lessonId} требует ${req} (track: ${target.track})`);
      } else if (compare(position(target), position(p)) >= 0) {
        errors.push(`[${locale}] ${p.file}: ${p.lessonId} требует ${req}, который стоит позже в маршруте (${target.file})`);
      }
    }
  }

  const state = new Map();
  const stack = [];
  const visit = (id) => {
    state.set(id, 1);
    stack.push(id);
    for (const req of byId.get(id).requires) {
      if (!byId.has(req)) continue;
      if (state.get(req) === 1) {
        errors.push(`[${locale}] цикл зависимостей: ${[...stack.slice(stack.indexOf(req)), req].join(' -> ')}`);
      } else if (!state.has(req)) visit(req);
    }
    stack.pop();
    state.set(id, 2);
  };
  for (const id of byId.keys()) if (!state.has(id)) visit(id);
  return byId;
}

const graphs = new Map(LOCALES.map((l) => [l, analyse(l)]));

// Both languages must carry the same lessons; a draft is allowed to lag behind.
for (const [from, to] of [LOCALES, [...LOCALES].reverse()]) {
  for (const p of graphs.get(from).values()) {
    if (graphs.get(to).has(p.lessonId)) continue;
    const msg = `${p.lessonId} есть в "${from}" (${p.file}), но нет в "${to}", status: ${p.status}`;
    (p.status === 'draft' ? warnings : errors).push(msg);
  }
}

if (mermaid) {
  const locale = localeArg ? localeArg.split('=')[1] : LOCALES[0];
  const byId = graphs.get(locale);
  if (!byId) {
    console.error(`Неизвестная локаль: ${locale}`);
    process.exit(2);
  }
  const lines = ['graph TD'];
  for (const p of byId.values()) lines.push(`  ${p.lessonId}["${p.lessonId}: ${String(p.title).replace(/"/g, "'")}"]`);
  for (const p of byId.values()) for (const req of p.requires) if (byId.has(req)) lines.push(`  ${req} --> ${p.lessonId}`);
  console.log(lines.join('\n'));
  process.exit(errors.length ? 1 : 0);
}

if (warnings.length) {
  console.warn(`check:deps: ПРЕДУПРЕЖДЕНИЯ (не роняют проверку): ${warnings.length}`);
  for (const w of warnings) console.warn(`  ~ ${w}`);
}
if (errors.length) {
  console.error(`check:deps: ОШИБКИ: ${errors.length}`);
  for (const e of errors) console.error(`  ! ${e}`);
  process.exit(1);
}
console.log(`check:deps: OK (${[...graphs].map(([l, m]) => `${l}: ${m.size} уроков`).join(', ')}${warnings.length ? `, предупреждений: ${warnings.length}` : ''})`);
