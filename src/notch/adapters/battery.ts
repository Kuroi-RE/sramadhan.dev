import { useState, useEffect } from "react";

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: ((this: BatteryManager, ev: Event) => void) | null;
  onlevelchange: ((this: BatteryManager, ev: Event) => void) | null;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

export interface BatteryState {
  isSupported: boolean;
  level: number | null; // 0 - 100
  charging: boolean;
}

export function useBattery(): BatteryState {
  const [batteryState, setBatteryState] = useState<BatteryState>({
    isSupported: false,
    level: null,
    charging: false,
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined")
      return;

    const nav = navigator as NavigatorWithBattery;
    if (typeof nav.getBattery !== "function") {
      return;
    }

    let isMounted = true;
    let batteryObj: BatteryManager | null = null;

    nav
      .getBattery()
      .then((battery) => {
        if (!isMounted) return;
        batteryObj = battery;

        const updateState = () => {
          setBatteryState({
            isSupported: true,
            level: Math.round(battery.level * 100),
            charging: battery.charging,
          });
        };

        updateState();
        battery.addEventListener("levelchange", updateState);
        battery.addEventListener("chargingchange", updateState);
      })
      .catch(() => {
        if (isMounted) {
          setBatteryState({ isSupported: false, level: null, charging: false });
        }
      });

    return () => {
      isMounted = false;
      if (batteryObj) {
        batteryObj.removeEventListener("levelchange", () => {});
        batteryObj.removeEventListener("chargingchange", () => {});
      }
    };
  }, []);

  return batteryState;
}
