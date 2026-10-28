import { describe, it, expect, beforeEach } from "vitest";
import { id } from "../../content/i18n/id";
import { en } from "../../content/i18n/en";
import { t, localize } from "./i18n";
import { useSettingsStore } from "./stores/settings-store";

function getAllKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      keys = keys.concat(getAllKeys(val as Record<string, unknown>, fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys.sort();
}

describe("i18n Dictionary and Utilities", () => {
  beforeEach(() => {
    useSettingsStore.setState({ locale: "id" });
  });

  it("has strictly identical keys between ID and EN dictionaries", () => {
    const idKeys = getAllKeys(id as unknown as Record<string, unknown>);
    const enKeys = getAllKeys(en as unknown as Record<string, unknown>);

    expect(idKeys).toEqual(enKeys);
  });

  it("returns translation for active locale via t()", () => {
    useSettingsStore.setState({ locale: "id" });
    expect(t("common.close")).toBe("Tutup");

    useSettingsStore.setState({ locale: "en" });
    expect(t("common.close")).toBe("Close");

    // Explicit locale parameter
    expect(t("common.close", "id")).toBe("Tutup");
    expect(t("common.close", "en")).toBe("Close");
  });

  it("returns localized field correctly via localize()", () => {
    const field = { id: "Teks Indonesia", en: "English Text" };

    useSettingsStore.setState({ locale: "id" });
    expect(localize(field)).toBe("Teks Indonesia");

    useSettingsStore.setState({ locale: "en" });
    expect(localize(field)).toBe("English Text");

    expect(localize(field, "id")).toBe("Teks Indonesia");
    expect(localize(field, "en")).toBe("English Text");
  });
});
