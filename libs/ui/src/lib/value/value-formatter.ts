import { getLocale } from '@ghostfolio/common/helper';

export interface NumericFormatOptions {
  colorizeSign?: boolean;
  isAbsolute?: boolean;
  isCurrency?: boolean;
  isPercent?: boolean;
  locale?: string;
  precision?: number;
}

export const formatNumericValue = (
  value: number,
  {
    colorizeSign = false,
    isAbsolute = false,
    isCurrency = false,
    isPercent = false,
    locale = getLocale(),
    precision
  }: NumericFormatOptions
): string => {
  const precisionToUse = precision ?? 2;
  const absoluteValue = Math.abs(value);
  const target = colorizeSign ? absoluteValue : value;
  const formatOptions = {
    maximumFractionDigits: precisionToUse,
    minimumFractionDigits: precisionToUse
  };

  let formattedValue: string;

  try {
    if (isCurrency) {
      formattedValue = target.toLocaleString(locale, formatOptions);
    } else if (isPercent) {
      formattedValue = (target * 100).toLocaleString(locale, formatOptions);
    } else if (precisionToUse >= 0) {
      formattedValue = target.toLocaleString(locale, formatOptions);
    } else {
      formattedValue = target.toLocaleString(locale);
    }
  } catch {
    formattedValue = target.toString();
  }

  return isAbsolute && value < 0 ? formattedValue.replace(/^-/, '') : formattedValue;
};

export const formatDateValue = (
  value: string | number | Date,
  locale: string,
  deviceType?: string
) => {
  return new Date(value).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: deviceType === 'mobile' ? '2-digit' : 'numeric'
  });
};
