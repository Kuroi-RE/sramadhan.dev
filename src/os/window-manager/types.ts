import { ComponentType } from "react";
import { LucideIcon } from "lucide-react";
import { TranslationKey } from "@/lib/i18n";

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowInstance {
  id: string; // App ID
  titleKey: TranslationKey;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  bounds: WindowBounds;
  preMaximizedBounds?: WindowBounds;
}

export interface AppMetadata {
  id: string;
  titleKey: TranslationKey;
  icon: LucideIcon;
  defaultBounds: WindowBounds;
  minWidth: number;
  minHeight: number;
  component: ComponentType;
}
