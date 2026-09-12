import { SupportedCurrency, CurrencyConfig } from '../types/telematics';

export const CURRENCY_CONFIGS: Record<SupportedCurrency, CurrencyConfig> = {
  DKK: {
    code: 'DKK',
    symbol: 'kr.',
    label: 'Danish Krone (DKK)',
    format: (amount: number) => {
      const formatted = amount.toLocaleString('da-DK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return `${formatted} kr.`;
    }
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    label: 'Euro (EUR)',
    format: (amount: number) => {
      const formatted = amount.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return `€${formatted}`;
    }
  },
  USD: {
    code: 'USD',
    symbol: '$',
    label: 'US Dollar (USD)',
    format: (amount: number) => {
      const formatted = amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return `$${formatted}`;
    }
  }
};

export function formatCurrency(amount: number, currency: SupportedCurrency = 'USD'): string {
  const conf = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.USD;
  return conf.format(amount);
}

export function detectCurrencyFromData(rows: any[]): SupportedCurrency {
  if (!rows || rows.length === 0) return 'USD';

  let dkkPoints = 0;
  let eurPoints = 0;
  let usdPoints = 0;

  // Check columns, values, headers
  for (const row of rows) {
    const rowStr = JSON.stringify(row).toLowerCase();

    if (rowStr.includes('dkk') || rowStr.includes('kr.') || rowStr.includes('kr') || rowStr.includes('kroner')) {
      dkkPoints += 3;
    }
    if (rowStr.includes('eur') || rowStr.includes('€') || rowStr.includes('euro')) {
      eurPoints += 3;
    }
    if (rowStr.includes('usd') || rowStr.includes('$') || rowStr.includes('dollar')) {
      usdPoints += 3;
    }

    if (row.currency) {
      const c = String(row.currency).toUpperCase();
      if (c.includes('DKK') || c.includes('KR')) dkkPoints += 10;
      if (c.includes('EUR')) eurPoints += 10;
      if (c.includes('USD')) usdPoints += 10;
    }
  }

  if (dkkPoints > eurPoints && dkkPoints > usdPoints) return 'DKK';
  if (eurPoints > dkkPoints && eurPoints > usdPoints) return 'EUR';
  return 'USD';
}
