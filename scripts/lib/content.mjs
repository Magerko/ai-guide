import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DOCS_DIR = join(ROOT, 'src', 'content', 'docs');
export const LOCALES = ['ru', 'uk'];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

function headingLevels(body) {
  const levels = [];
  let fence = null;
  for (const line of body.split(/\r?\n/)) {
    const f = line.match(/^\s*(```+|~~~+)/);
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
      continue;
    }
    if (fence) continue;
    const h = line.match(/^(#{2,3})\s+\S/);
    if (h) levels.push(h[1].length);
  }
  return levels;
}

const norm = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v);

/** Returns a Map of locale -> Map(relative path inside the locale -> page info). */
export function loadPages() {
  const result = new Map();
  for (const locale of LOCALES) {
    const pages = new Map();
    const base = join(DOCS_DIR, locale);
    for (const file of walk(base)) {
      const rel = relative(base, file).split('\\').join('/');
      const { data, content } = matter(readFileSync(file, 'utf8'));
      pages.set(rel, {
        file: relative(ROOT, file).split('\\').join('/'),
        rel,
        title: data.title,
        lessonId: norm(data.lessonId),
        track: norm(data.track),
        requires: (data.requires ?? []).map(norm),
        lastVerified: norm(data.lastVerified),
        status: norm(data.status),
        order: data.sidebar?.order,
        headings: headingLevels(content),
      });
    }
    result.set(locale, pages);
  }
  return result;
}
