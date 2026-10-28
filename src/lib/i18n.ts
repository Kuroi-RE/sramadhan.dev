import { useCallback } from "react";
import { id, TranslationKeys } from "../../content/i18n/id";
import { en } from "../../content/i18n/en";
import { LocalizedString } from "./schemas";
import { useSettingsStore, Locale } from "./stores/settings-store";

export const dictionaries: Record<Locale, TranslationKeys> = {
  id,
  en,
};

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<TranslationKeys>;

export function getDictionary(locale: Locale): TranslationKeys {
  return dictionaries[locale] || dictionaries.id;
}

export function t(path: TranslationKey, locale?: Locale): string {
  const currentLocale = locale ?? useSettingsStore.getState().locale ?? "id";
  const dict = getDictionary(currentLocale);
  const keys = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = dict;
  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

export function useT() {
  const locale = useSettingsStore((state) => state.locale);
  return useCallback(
    (path: TranslationKey): string => t(path, locale),
    [locale]
  );
}

export function localize(field: LocalizedString, locale?: Locale): string {
  const currentLocale = locale ?? useSettingsStore.getState().locale ?? "id";
  return field[currentLocale] || field.id || "";
}

export function useLocalized() {
  const locale = useSettingsStore((state) => state.locale);
  return useCallback(
    (field: LocalizedString): string => localize(field, locale),
    [locale]
  );
}
