export type Lang = 'ru' | 'uk';

export const ui = {
  ru: {
    requires: 'Перед этим уроком полезно пройти:',
    verified: 'Содержание проверено:',
    draft: 'Черновик',
    evidenceLabel: 'Категория доказательности',
    evidenceMore: 'Что означают категории',
    levels: {
      A: 'Сильная научная база',
      B: 'Подтверждённый технический факт (документация, спецификация, воспроизводимая проверка)',
      C: 'Ограниченная база (отдельные исследования и наблюдения с заметными ограничениями)',
      D: 'Неподтверждённое утверждение',
    },
    check: 'Проверь себя',
    visits: 'Визитов:',
    visitsTotal: 'всего',
    visitsToday: 'сегодня',
  },
  uk: {
    requires: 'Перед цим уроком корисно пройти:',
    verified: 'Зміст перевірено:',
    draft: 'Чернетка',
    evidenceLabel: 'Категорія доказовості',
    evidenceMore: 'Що означають категорії',
    levels: {
      A: 'Сильна наукова база',
      B: 'Підтверджений технічний факт (документація, специфікація, відтворювана перевірка)',
      C: 'Обмежена база (окремі дослідження та спостереження з помітними обмеженнями)',
      D: 'Непідтверджене твердження',
    },
    check: 'Перевір себе',
    visits: 'Візитів:',
    visitsTotal: 'усього',
    visitsToday: 'сьогодні',
  },
} as const;

export function langOf(locale: string | undefined): Lang {
  return locale === 'uk' ? 'uk' : 'ru';
}

export function pageUrl(lang: Lang, path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${lang}/${path}/`;
}
