// Single place for the repository address; change it once the repo name is final.
export const REPO_URL = 'https://github.com/Magerko/ai-guide';

// GoatCounter site code (https://<code>.goatcounter.com). Empty string keeps the counter fully off:
// no script, no sidebar block, no requests.
export const GOATCOUNTER_CODE = 'magerdev1';

// Link-preview image (see scripts/make-og.mjs); the same size is declared in the og:image tags.
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_ALT = {
  ru: 'MagerDev AI Guide. Как пользоваться AI-чатами и не верить им вслепую. У каждого совета — источник.',
  uk: 'MagerDev AI Guide. Як користуватися ШІ-чатами й не вірити їм наосліп. У кожної поради — джерело.',
  root: 'MagerDev AI Guide. Як користуватися ШІ-чатами й не вірити їм наосліп. / Как пользоваться AI-чатами и не верить им вслепую.',
} as const;
