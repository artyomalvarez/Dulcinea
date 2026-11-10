import { UnitOfMeasure } from '../../domain/values/UnitOfMeasure';

/**
 * Currency formatter with symbol
 */
export function formatCurrency(amount: number, symbol: string = '$'): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return `${symbol}${safeAmount.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Percentage formatter
 */
export function formatPercent(value: number): string {
  const safeValue = isNaN(value) ? 0 : value;
  return `${safeValue.toFixed(1)}%`;
}

/**
 * Unit label in Spanish
 */
export function getUnitLabel(unit: UnitOfMeasure, plural = false): string {
  switch (unit) {
    case 'g':
      return 'g (gramos)';
    case 'kg':
      return 'kg (kilos)';
    case 'ml':
      return 'ml (mililitros)';
    case 'l':
      return 'L (litros)';
    case 'pza':
      return plural ? 'piezas' : 'pza';
    case 'cda':
      return plural ? 'cucharadas' : 'cda';
    case 'cdta':
      return plural ? 'cucharaditas' : 'cdta';
    case 'docena':
      return plural ? 'docenas' : 'docena';
    default:
      return unit;
  }
}
