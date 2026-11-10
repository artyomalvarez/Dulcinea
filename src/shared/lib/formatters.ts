import { UnitOfMeasure } from '../../entities/ingredient/model/types';

/**
 * Currency formatter with symbol (Colombia - COP default)
 * Formato estándar: $ 14.772 o $ 1.250.000 (sin decimales para COP habituales, con separador de miles con punto)
 */
export function formatCurrency(amount: number, symbol: string = '$'): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  const formattedNumber = Math.round(safeAmount).toLocaleString('es-CO');
  return `${symbol} ${formattedNumber}`;
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
