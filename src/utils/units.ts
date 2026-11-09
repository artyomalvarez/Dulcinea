import { UnitOfMeasure } from '../types/bakery';

/**
 * Standard base units:
 * Weight -> grams ('g')
 * Volume -> milliliters ('ml')
 * Count -> pieces ('pza')
 */
export function convertToBaseUnit(quantity: number, unit: UnitOfMeasure): { baseValue: number; baseType: 'mass' | 'volume' | 'count' } {
  switch (unit) {
    case 'kg':
      return { baseValue: quantity * 1000, baseType: 'mass' };
    case 'g':
      return { baseValue: quantity, baseType: 'mass' };
    case 'l':
      return { baseValue: quantity * 1000, baseType: 'volume' };
    case 'ml':
      return { baseValue: quantity, baseType: 'volume' };
    case 'docena':
      return { baseValue: quantity * 12, baseType: 'count' };
    case 'pza':
      return { baseValue: quantity, baseType: 'count' };
    case 'cda': // Cucharada (~15g o 15ml)
      return { baseValue: quantity * 15, baseType: 'mass' };
    case 'cdta': // Cucharadita (~5g o 5ml)
      return { baseValue: quantity * 5, baseType: 'mass' };
    default:
      return { baseValue: quantity, baseType: 'count' };
  }
}

/**
 * Calculates the exact cost of a recipe ingredient based on its purchase package
 */
export function calculateIngredientRecipeCost(
  recipeQty: number,
  recipeUnit: UnitOfMeasure,
  purchasePackageQty: number,
  purchasePackageUnit: UnitOfMeasure,
  purchaseCost: number
): number {
  if (purchaseCost <= 0 || purchasePackageQty <= 0 || recipeQty <= 0) return 0;

  const pkgBase = convertToBaseUnit(purchasePackageQty, purchasePackageUnit);
  const recBase = convertToBaseUnit(recipeQty, recipeUnit);

  // If both are mass or both volume or count, or converting tablespoons/teaspoons
  const costPerBaseUnit = purchaseCost / pkgBase.baseValue;
  const totalCost = recBase.baseValue * costPerBaseUnit;

  return Math.round(totalCost * 100) / 100;
}

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
