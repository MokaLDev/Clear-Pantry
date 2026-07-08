export { I18nProvider, useI18n } from './I18nProvider';
export { translations } from './translations';
export type { Language } from './translations';

import { Language, translations } from './translations';

function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value == null || typeof value !== 'object') return undefined;
    value = value[key];
  }
  return typeof value === 'string' ? value : undefined;
}

export function translate(
  language: Language,
  key: string,
  vars?: Record<string, string | number>
): string {
  const dict = (translations as any)[language] || translations.en;
  let text = getNestedValue(dict, key);
  if (text === undefined) {
    text = getNestedValue(translations.en, key) ?? key;
  }
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      text = text!.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return text!;
}
