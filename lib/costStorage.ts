/**
 * localStorage handler for operating cost settings
 */

import { OperatingCostSettings, DEFAULT_COST_SETTINGS } from "./costUtils";

const COST_SETTINGS_KEY = "shiproute_cost_settings";

/**
 * Get cost settings from localStorage
 */
export const getCostSettings = (): OperatingCostSettings => {
  if (typeof window === "undefined") {
    return DEFAULT_COST_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(COST_SETTINGS_KEY);
    if (!raw) {
      return DEFAULT_COST_SETTINGS;
    }
    const parsed = JSON.parse(raw) as OperatingCostSettings;
    return parsed;
  } catch (err) {
    console.error("[costStorage] getCostSettings error", err);
    return DEFAULT_COST_SETTINGS;
  }
};

/**
 * Save cost settings to localStorage
 */
export const saveCostSettings = (settings: OperatingCostSettings): void => {
  if (typeof window === "undefined") return;

  try {
    const toSave: OperatingCostSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(COST_SETTINGS_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.error("[costStorage] saveCostSettings error", err);
  }
};

/**
 * Reset cost settings to default
 */
export const resetCostSettings = (): void => {
  if (typeof window === "undefined") return;

  try {
    const defaults: OperatingCostSettings = {
      ...DEFAULT_COST_SETTINGS,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(COST_SETTINGS_KEY, JSON.stringify(defaults));
  } catch (err) {
    console.error("[costStorage] resetCostSettings error", err);
  }
};

/**
 * Clear cost settings
 */
export const clearCostSettings = (): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(COST_SETTINGS_KEY);
  } catch (err) {
    console.error("[costStorage] clearCostSettings error", err);
  }
};
