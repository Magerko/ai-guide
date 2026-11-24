// Pre-publication gate: fails while any page is still marked as a draft.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadPages, LOCALES, ROOT } from './lib/content.mjs';

const MARKER = /^\s*[*_]*\s*(Черновик|Чернетка)\b/im;
const pages = loadPages();
const problems = [];

for (const locale of LOCALES) {
  for (const page of pages.get(locale).values()) {
    if (page.status === 'draft') problems.push(`${page.file}: status: draft`);
    const text = readFileSync(join(ROOT, page.file), 'utf8').replace(/^---[\s\S]*?\r?\n---/, '');
    if (MARKER.test(text)) problems.push(`${page.file}: в тексте есть пометка «Черновик»/«Чернетка»`);
  }
}

if (problems.length) {
  console.error(`check:release: страниц с черновыми признаками: ${problems.length}`);
  for (const p of problems) console.error(`  ! ${p}`);
  process.exit(1);
}
console.log('check:release: OK (черновиков нет)');
