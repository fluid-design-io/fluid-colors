export type RawColor = {
  h: number;
  s: number;
  l: number;
  a: number;
};

export type BaseColorTypes = "primary" | "secondary" | "accent" | "gray";

export type BaseColors = Omit<Record<BaseColorTypes, RawColor>, "gray">;

export type ColorValue =
  | {
      step: number;
      color: string;
      raw: RawColor;
    }
  | undefined;

export type ColorPalettes = Record<BaseColorTypes, ColorValue[]>;

export enum PluginStatus {
  LOADING = "loading",
  COMPLETED = "completed",
  ERROR = "error",
  CLOSE = "close",
  FIND_PALETTES = "find-palettes",
  FOUND_PALETTES = "found-palettes",
  CREATE_PALETTES = "create-palettes",
  PAID_FEATURE = "paid-feature",
  UPGRADE = "upgrade",
  GET_USER_EXISTING_COLLECTIONS = "get-user-existing-collections",
}

export type CreatePaletteOptions = {
  enabled?: boolean;
  collectionName?: string;
  /**
   * If collectionId is provided, the plugin will update the palettes to the existing collection
   * instead of creating a new collection.
   * @default undefined
   */
  collectionId?: string;
  darkMode?: boolean;
  addSpacing?: boolean;
};

export enum Step {
  URL = "url",
  SELECT_PALETTES = "palettes",
  VARIABLES = "variables",
  COMPLETED = "done",
}

export const steps = [
  {
    step: Step.URL,
    order: 0,
  },
  {
    step: Step.SELECT_PALETTES,
    order: 1,
  },
  {
    step: Step.VARIABLES,
    order: 2,
  },
  {
    step: Step.COMPLETED,
    order: 3,
  },
];

export enum Tier {
  FREE = "FREE",
  PREMIUM = "PREMIUM",
}

export type CustomVariableCollection = {
  searchId: string;
  id: string;
  name: string;
  count: number;
};