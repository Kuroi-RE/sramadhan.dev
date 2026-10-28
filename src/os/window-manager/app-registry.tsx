"use client";

import dynamic from "next/dynamic";
import {
  Music,
  Settings,
  Terminal,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { AppMetadata } from "./types";

// Dynamic placeholders for the 5 MVP apps
const MusicApp = dynamic(
  () => import("@/apps/music/MusicApp").then((m) => m.MusicApp),
  { ssr: false }
);

const SettingsApp = dynamic(
  () => import("@/apps/settings/SettingsApp").then((m) => m.SettingsApp),
  { ssr: false }
);

const TerminalApp = dynamic(
  () => import("@/apps/terminal/TerminalApp").then((m) => m.TerminalApp),
  { ssr: false }
);

const CalendarApp = dynamic(
  () => import("@/apps/calendar/CalendarApp").then((m) => m.CalendarApp),
  { ssr: false }
);

const MessageApp = dynamic(
  () => import("@/apps/message/MessageApp").then((m) => m.MessageApp),
  { ssr: false }
);

export const APP_REGISTRY: Record<string, AppMetadata> = {
  music: {
    id: "music",
    titleKey: "music.title",
    icon: Music,
    defaultBounds: { x: 80, y: 50, width: 680, height: 460 },
    minWidth: 400,
    minHeight: 300,
    component: MusicApp,
  },
  settings: {
    id: "settings",
    titleKey: "settings.title",
    icon: Settings,
    defaultBounds: { x: 120, y: 70, width: 620, height: 440 },
    minWidth: 420,
    minHeight: 320,
    component: SettingsApp,
  },
  terminal: {
    id: "terminal",
    titleKey: "terminal.title",
    icon: Terminal,
    defaultBounds: { x: 140, y: 80, width: 640, height: 400 },
    minWidth: 380,
    minHeight: 250,
    component: TerminalApp,
  },
  calendar: {
    id: "calendar",
    titleKey: "calendar.title",
    icon: Calendar,
    defaultBounds: { x: 100, y: 60, width: 650, height: 450 },
    minWidth: 400,
    minHeight: 320,
    component: CalendarApp,
  },
  message: {
    id: "message",
    titleKey: "message.title",
    icon: MessageSquare,
    defaultBounds: { x: 160, y: 60, width: 580, height: 480 },
    minWidth: 360,
    minHeight: 350,
    component: MessageApp,
  },
};

export const APP_LIST: AppMetadata[] = Object.values(APP_REGISTRY);
