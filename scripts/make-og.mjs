// Generates public/og/{ru,uk,root}.png (1200x630). Run by hand: node scripts/make-og.mjs
// The PNGs are committed; CI does not run this.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// sharp is a dependency of astro, not of this package, so I resolve it from astro's location.
const fromAstro = createRequire(createRequire(path.join(root, 'package.json')).resolve('astro/package.json'));
const sharp = fromAstro('sharp');

const W = 1200;
const H = 630;
const FONT = "'Segoe UI', 'Noto Sans', 'DejaVu Sans', Arial, sans-serif";

const slogans = {
  ru: ['Как пользоваться AI-чатами и не верить им', 'вслепую. У каждого совета — источник.'],
  uk: ['Як користуватися ШІ-чатами й не вірити їм', 'наосліп. У кожної поради — джерело.'],
  root: [
    'Як користуватися ШІ-чатами й не вірити їм наосліп.',
    'Как пользоваться AI-чатами и не верить им вслепую.',
  ],
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function svg(lines, size) {
  const text = lines
    .map((l, i) => `<text x="90" y="${340 + i * (size * 1.4)}" font-size="${size}" fill="#3a3d48">${esc(l)}</text>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="${FONT}">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <rect width="18" height="${H}" fill="#3b5bdb"/>
  <text x="90" y="215" font-size="96" font-weight="700" fill="#1b1b1f">MagerDev AI Guide</text>
  <rect x="90" y="250" width="140" height="8" rx="4" fill="#3b5bdb"/>
  ${text}
  <text x="90" y="560" font-size="30" fill="#3b5bdb">magerko.github.io/ai-guide</text>
</svg>`;
}

const outDir = path.join(root, 'public', 'og');
fs.mkdirSync(outDir, { recursive: true });
for (const [name, lines] of Object.entries(slogans)) {
  const file = path.join(outDir, `${name}.png`);
  await sharp(Buffer.from(svg(lines, name === 'root' ? 36 : 40))).png().toFile(file);
  console.log('wrote', file);
}
