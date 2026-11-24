import { loadPages, LOCALES } from './lib/content.mjs';

const pages = loadPages();
const errors = [];
const warnings = [];
const FIELDS = ['lessonId', 'track', 'requires', 'lastVerified', 'status', 'order'];
const show = (v) => (v === undefined ? '(не задано)' : JSON.stringify(v));

const [a, b] = LOCALES;
for (const [from, to] of [[a, b], [b, a]]) {
  for (const [rel, page] of pages.get(from)) {
    if (pages.get(to).has(rel)) continue;
    // A draft may lag behind its pair; anything further along must have both languages.
    const msg = `${page.file}: нет пары в "${to}" (ожидается src/content/docs/${to}/${rel}), status: ${page.status}`;
    (page.status === 'draft' ? warnings : errors).push(msg);
  }
}

for (const [rel, ru] of pages.get(a)) {
  const uk = pages.get(b).get(rel);
  if (!uk) continue;
  for (const field of FIELDS) {
    if (JSON.stringify(ru[field]) !== JSON.stringify(uk[field])) {
      const name = field === 'order' ? 'sidebar.order' : field;
      errors.push(`${rel}: расходится ${name}: ${a}=${show(ru[field])}, ${b}=${show(uk[field])}`);
    }
  }
  if (JSON.stringify(ru.headings) !== JSON.stringify(uk.headings)) {
    errors.push(`${rel}: разная структура заголовков (h2/h3): ${a}=[${ru.headings.map((l) => 'h' + l)}], ${b}=[${uk.headings.map((l) => 'h' + l)}]`);
  }
}

if (warnings.length) {
  console.warn(`check:i18n: ПРЕДУПРЕЖДЕНИЯ (не роняют проверку): ${warnings.length}`);
  for (const w of warnings) console.warn(`  ~ ${w}`);
}
const total = pages.get(a).size + pages.get(b).size;
if (errors.length) {
  console.error(`check:i18n: ОШИБКИ: ${errors.length}`);
  for (const e of errors) console.error(`  ! ${e}`);
  process.exit(1);
}
console.log(`check:i18n: OK (${total} страниц${warnings.length ? `, предупреждений: ${warnings.length}` : `, пары ${a}/${b} совпадают`})`);
