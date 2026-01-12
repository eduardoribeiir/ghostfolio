export interface ValueComponentConfig {
  deviceType: string;
  locale: string;
  precision: number;
  size: 'large' | 'medium' | 'small';
}

export interface ValueComponentData {
  icon: string;
  position: string;
  subLabel: string;
  unit: string;
  value: number | string;
}

export interface ValueComponentOptions {
  colorizeSign: boolean;
  isAbsolute: boolean;
  isCurrency: boolean;
  isDate: boolean;
  isPercent: boolean;
}
