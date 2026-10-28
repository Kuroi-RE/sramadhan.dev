"use client";

import { useState } from "react";
import { useSettingsStore, ACCENT_PRESETS } from "@/lib/stores/settings-store";
import { defaultWallpapers } from "@/lib/manifests";
import { profile } from "../../../content/profile";
import { socials } from "../../../content/socials";
import { useT, useLocalized } from "@/lib/i18n";
import {
  Image as ImageIcon,
  Palette,
  Languages,
  User,
  Check,
  ExternalLink,
} from "lucide-react";

type SettingsSection = "wallpaper" | "appearance" | "language" | "about";

export function SettingsApp() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("wallpaper");
  const {
    locale,
    setLocale,
    accentColor,
    setAccentColor,
    wallpaperId,
    setWallpaperId,
  } = useSettingsStore();
  const t = useT();
  const localized = useLocalized();

  const navItems: {
    id: SettingsSection;
    label: string;
    icon: typeof ImageIcon;
  }[] = [
    { id: "wallpaper", label: t("settings.wallpaper"), icon: ImageIcon },
    { id: "appearance", label: t("settings.accentColor"), icon: Palette },
    { id: "language", label: t("settings.language"), icon: Languages },
    { id: "about", label: t("settings.about"), icon: User },
  ];

  return (
    <div
      data-testid="settings-app"
      className="flex h-full w-full select-none bg-[var(--linux-surface)] text-[var(--linux-text)]"
    >
      {/* Linux Control Center Sidebar */}
      <aside className="w-48 border-r border-[var(--linux-border)] bg-[var(--linux-bg)] p-2.5 flex flex-col gap-1">
        <div className="px-2.5 py-2 border-b border-[var(--linux-border)] mb-1 flex items-center justify-between">
          <span className="linux-mono-label">{t("settings.title")}</span>
          <span className="text-[10px] font-mono text-[var(--linux-accent)]">
            ctl
          </span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              data-testid={`settings-nav-${item.id}`}
              onClick={() => setActiveSection(item.id)}
              className={`linux-focus-ring relative flex items-center gap-2.5 rounded-[5px] px-2.5 py-2 text-xs font-medium transition-colors text-left border ${
                isActive
                  ? "bg-[var(--linux-surface-raised)] text-[var(--linux-text)] border-[var(--linux-border-strong)]"
                  : "border-transparent text-[var(--linux-text-muted)] hover:bg-[var(--linux-surface-hover)] hover:text-[var(--linux-text)]"
              }`}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r"
                  style={{ backgroundColor: accentColor }}
                />
              )}
              <Icon
                className="h-3.5 w-3.5 shrink-0"
                style={isActive ? { color: accentColor } : {}}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* SECTION: WALLPAPER (Appearance) */}
        {activeSection === "wallpaper" && (
          <section
            data-testid="settings-section-wallpaper"
            className="space-y-4"
          >
            <div className="border-b border-[var(--linux-border)] pb-3">
              <div className="linux-mono-label mb-0.5">Appearance</div>
              <h2 className="text-base font-semibold">
                {t("settings.wallpaper")}
              </h2>
              <p className="text-xs text-[var(--linux-text-muted)] mt-0.5">
                Pilih latar belakang untuk desktop dan layar kunci.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              {defaultWallpapers.map((wp) => {
                const isSelected =
                  wallpaperId === wp.id ||
                  (!wallpaperId && wp.id === "default-gradient");
                return (
                  <button
                    key={wp.id}
                    type="button"
                    data-testid={`wallpaper-item-${wp.id}`}
                    onClick={() => setWallpaperId(wp.id)}
                    className={`linux-focus-ring group relative flex flex-col overflow-hidden rounded-md border text-left transition-colors ${
                      isSelected
                        ? "border-[var(--linux-accent)] bg-[var(--linux-surface-raised)]"
                        : "border-[var(--linux-border)] bg-[var(--linux-bg)] hover:border-[var(--linux-border-strong)]"
                    }`}
                  >
                    <div
                      className="h-24 w-full bg-[var(--linux-surface-raised)] bg-cover bg-center"
                      style={
                        wp.path
                          ? { backgroundImage: `url(${wp.path})` }
                          : {
                              background:
                                "radial-gradient(circle at 50% 30%, #1e1b4b 0%, #09090b 100%)",
                            }
                      }
                    />
                    <div className="flex items-center justify-between p-2 bg-[var(--linux-surface-raised)] border-t border-[var(--linux-border)]">
                      <span className="text-xs font-mono text-[var(--linux-text)] truncate">
                        {wp.label}
                      </span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-[var(--linux-accent)] shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION: SYSTEM ACCENT */}
        {activeSection === "appearance" && (
          <section
            data-testid="settings-section-appearance"
            className="space-y-4"
          >
            <div className="border-b border-[var(--linux-border)] pb-3">
              <div className="linux-mono-label mb-0.5">System Accent</div>
              <h2 className="text-base font-semibold">
                {t("settings.accentColor")}
              </h2>
              <p className="text-xs text-[var(--linux-text-muted)] mt-0.5">
                Pilih warna aksen sistem untuk border jendela aktif, workspace,
                dan sorotan UI.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {ACCENT_PRESETS.map((preset) => {
                const isSelected = accentColor === preset.color;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    data-testid={`accent-item-${preset.id}`}
                    onClick={() => setAccentColor(preset.color)}
                    className={`linux-focus-ring flex items-center gap-2.5 p-2.5 rounded-md border transition-colors ${
                      isSelected
                        ? "border-[var(--linux-accent)] bg-[var(--linux-surface-raised)]"
                        : "border-[var(--linux-border)] bg-[var(--linux-bg)] hover:bg-[var(--linux-surface-hover)]"
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-[3px] border border-black/40 shrink-0"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span className="text-xs font-mono text-[var(--linux-text)]">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 ml-auto text-[var(--linux-accent)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION: LANGUAGE (Session) */}
        {activeSection === "language" && (
          <section
            data-testid="settings-section-language"
            className="space-y-4"
          >
            <div className="border-b border-[var(--linux-border)] pb-3">
              <div className="linux-mono-label mb-0.5">Session</div>
              <h2 className="text-base font-semibold">
                {t("settings.language")}
              </h2>
              <p className="text-xs text-[var(--linux-text-muted)] mt-0.5">
                {t("settings.languageSelect")}
              </p>
            </div>

            <div className="space-y-2 pt-1 max-w-sm">
              <button
                type="button"
                data-testid="language-select-id"
                onClick={() => setLocale("id")}
                className={`linux-focus-ring flex w-full items-center justify-between p-3 rounded-md border transition-colors text-left ${
                  locale === "id"
                    ? "border-[var(--linux-accent)] bg-[var(--linux-surface-raised)] text-[var(--linux-text)]"
                    : "border-[var(--linux-border)] bg-[var(--linux-bg)] text-[var(--linux-text-muted)] hover:bg-[var(--linux-surface-hover)]"
                }`}
              >
                <div>
                  <div className="text-xs font-mono font-semibold">
                    Bahasa Indonesia (id_ID.UTF-8)
                  </div>
                  <div className="text-[11px] text-[var(--linux-text-subtle)] mt-0.5">
                    Bahasa sistem Indonesia
                  </div>
                </div>
                {locale === "id" && (
                  <Check className="h-4 w-4 text-[var(--linux-accent)]" />
                )}
              </button>

              <button
                type="button"
                data-testid="language-select-en"
                onClick={() => setLocale("en")}
                className={`linux-focus-ring flex w-full items-center justify-between p-3 rounded-md border transition-colors text-left ${
                  locale === "en"
                    ? "border-[var(--linux-accent)] bg-[var(--linux-surface-raised)] text-[var(--linux-text)]"
                    : "border-[var(--linux-border)] bg-[var(--linux-bg)] text-[var(--linux-text-muted)] hover:bg-[var(--linux-surface-hover)]"
                }`}
              >
                <div>
                  <div className="text-xs font-mono font-semibold">
                    English (en_US.UTF-8)
                  </div>
                  <div className="text-[11px] text-[var(--linux-text-subtle)] mt-0.5">
                    System language English
                  </div>
                </div>
                {locale === "en" && (
                  <Check className="h-4 w-4 text-[var(--linux-accent)]" />
                )}
              </button>
            </div>
          </section>
        )}

        {/* SECTION: ABOUT (Profile & System Info) */}
        {activeSection === "about" && (
          <section data-testid="settings-section-about" className="space-y-5">
            <div className="border-b border-[var(--linux-border)] pb-3">
              <div className="linux-mono-label mb-0.5">Profile</div>
              <h2 className="text-base font-semibold">{t("settings.about")}</h2>
              <p className="text-xs font-mono text-[var(--linux-text-muted)] mt-0.5">
                {t("settings.version")}
              </p>
            </div>

            <div className="flex items-start gap-4 rounded-md border border-[var(--linux-border)] bg-[var(--linux-bg)] p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-[var(--linux-surface-raised)] border border-[var(--linux-accent)]/50 text-lg font-mono font-bold text-[var(--linux-accent)] shrink-0">
                {profile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-[var(--linux-text)]">
                  {profile.name}
                </h3>
                <p className="text-xs font-mono text-[var(--linux-accent)]">
                  {profile.role}
                </p>
                <p className="text-xs text-[var(--linux-text-muted)] mt-1.5 max-w-md leading-relaxed">
                  {localized(profile.bio)}
                </p>
                <div className="mt-3 pt-2.5 border-t border-[var(--linux-border)] grid grid-cols-2 gap-2 text-[11px] font-mono text-[var(--linux-text-subtle)]">
                  <div>WM: Hyprland (Wayland)</div>
                  <div>Shell: Waybar + syswidget</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="linux-mono-label">Tautan Profil</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {socials.linkedin && (
                  <a
                    href={socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-md border border-[var(--linux-border)] bg-[var(--linux-bg)] hover:bg-[var(--linux-surface-hover)] transition-colors text-xs font-mono text-[var(--linux-text-muted)] hover:text-[var(--linux-text)]"
                  >
                    <span>LinkedIn</span>
                    <ExternalLink className="h-3.5 w-3.5 text-[var(--linux-text-subtle)]" />
                  </a>
                )}
                {socials.instagram && (
                  <a
                    href={socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-md border border-[var(--linux-border)] bg-[var(--linux-bg)] hover:bg-[var(--linux-surface-hover)] transition-colors text-xs font-mono text-[var(--linux-text-muted)] hover:text-[var(--linux-text)]"
                  >
                    <span>Instagram</span>
                    <ExternalLink className="h-3.5 w-3.5 text-[var(--linux-text-subtle)]" />
                  </a>
                )}
                {socials.threads && (
                  <a
                    href={socials.threads}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-md border border-[var(--linux-border)] bg-[var(--linux-bg)] hover:bg-[var(--linux-surface-hover)] transition-colors text-xs font-mono text-[var(--linux-text-muted)] hover:text-[var(--linux-text)]"
                  >
                    <span>Threads</span>
                    <ExternalLink className="h-3.5 w-3.5 text-[var(--linux-text-subtle)]" />
                  </a>
                )}
                <a
                  href={`https://github.com/${profile.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-md border border-[var(--linux-border)] bg-[var(--linux-bg)] hover:bg-[var(--linux-surface-hover)] transition-colors text-xs font-mono text-[var(--linux-text-muted)] hover:text-[var(--linux-text)]"
                >
                  <span>GitHub (@{profile.githubUsername})</span>
                  <ExternalLink className="h-3.5 w-3.5 text-[var(--linux-text-subtle)]" />
                </a>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
