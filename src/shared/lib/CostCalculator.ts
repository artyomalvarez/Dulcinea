import { Product, RecipeIngredient } from '../../entities/product/model/types';
import { UnitOfMeasure } from '../../entities/ingredient/model/types';

export interface BaseUnitConversion {
  baseValue: number;
  baseType: 'mass' | 'volume' | 'count';
}

export interface ProductProfitabilityMetrics {
  ingredientsCostSum: number;
  totalBatchCost: number;
  costPerUnit: number;
  profitPerUnit: number;
  profitMarginPercent: number;
  markupPercent: number;
  totalBatchRevenue: number;
  totalBatchProfit: number;
  breakevenUnits: number;
  suggestedPrice: number;
}

/**
 * Standard base units:
 * Weight -> grams ('g')
 * Volume -> milliliters ('ml')
 * Count -> pieces ('pza')
 */
export function convertToBaseUnit(quantity: number, unit: UnitOfMeasure): BaseUnitConversion {
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

  if (pkgBase.baseValue <= 0) return 0;

  const costPerBaseUnit = purchaseCost / pkgBase.baseValue;
  const totalCost = recBase.baseValue * costPerBaseUnit;

  return Math.round(totalCost * 100) / 100;
}

/**
 * Calculates the sum of recipe ingredients + other direct costs per batch
 */
export function calculateBatchCost(
  ingredients: Pick<RecipeIngredient, 'calculatedCost'>[],
  otherDirectCosts: number = 0
): number {
  const ingredientsSum = ingredients.reduce((acc, item) => acc + (item.calculatedCost || 0), 0);
  return Math.round((ingredientsSum + Number(otherDirectCosts || 0)) * 100) / 100;
}

/**
 * Calculates unit cost given total batch cost and batch yield
 */
export function calculateCostPerUnit(totalBatchCost: number, batchYieldUnits: number): number {
  const safeYield = Number(batchYieldUnits) > 0 ? Number(batchYieldUnits) : 1;
  return Math.round((totalBatchCost / safeYield) * 100) / 100;
}

/**
 * Calculates profit per unit (sellingPrice - costPerUnit)
 */
export function calculateProfitPerUnit(sellingPrice: number, costPerUnit: number): number {
  return Math.round((sellingPrice - costPerUnit) * 100) / 100;
}

/**
 * Calculates gross profit margin percentage: ((sellingPrice - costPerUnit) / sellingPrice) * 100
 */
export function calculateMargin(sellingPrice: number, costPerUnit: number): number {
  if (sellingPrice <= 0) return 0;
  const profit = sellingPrice - costPerUnit;
  return Math.round(((profit / sellingPrice) * 100) * 10) / 10;
}

/**
 * Calculates markup percentage over cost: ((sellingPrice - costPerUnit) / costPerUnit) * 100
 */
export function calculateMarkup(sellingPrice: number, costPerUnit: number): number {
  if (costPerUnit <= 0) return 0;
  const profit = sellingPrice - costPerUnit;
  return Math.round(((profit / costPerUnit) * 100) * 10) / 10;
}

/**
 * Calculates suggested selling price given costPerUnit and desired margin percentage
 */
export function calculateSuggestedPrice(costPerUnit: number, targetMarginPercent: number): number {
  if (costPerUnit <= 0) return 0;
  if (targetMarginPercent > 0 && targetMarginPercent < 100) {
    return Math.round((costPerUnit / (1 - targetMarginPercent / 100)) * 100) / 100;
  }
  return Math.round(costPerUnit * 1.5 * 100) / 100;
}

/**
 * Calculates breakeven units needed to recover total batch supplies investment
 */
export function calculateBreakevenUnits(totalBatchCost: number, sellingPrice: number): number {
  if (sellingPrice <= 0 || totalBatchCost <= 0) return 0;
  return Math.ceil(totalBatchCost / sellingPrice);
}

/**
 * Computes all derived cost & profitability metrics for a Product or simulator input
 */
export function calculateProductMetrics(
  product: Pick<
    Product,
    'ingredients' | 'otherDirectCosts' | 'batchYieldUnits' | 'sellingPrice' | 'suggestedMarginPercent'
  >
): ProductProfitabilityMetrics {
  const ingredientsCostSum = Math.round(
    product.ingredients.reduce((acc, item) => acc + (item.calculatedCost || 0), 0) * 100
  ) / 100;
  const totalBatchCost = calculateBatchCost(product.ingredients, product.otherDirectCosts);
  const safeYield = Number(product.batchYieldUnits) > 0 ? Number(product.batchYieldUnits) : 1;
  const costPerUnit = calculateCostPerUnit(totalBatchCost, safeYield);
  const profitPerUnit = calculateProfitPerUnit(product.sellingPrice, costPerUnit);
  const profitMarginPercent = calculateMargin(product.sellingPrice, costPerUnit);
  const markupPercent = calculateMarkup(product.sellingPrice, costPerUnit);
  const totalBatchRevenue = Math.round(product.sellingPrice * safeYield * 100) / 100;
  const totalBatchProfit = Math.round(profitPerUnit * safeYield * 100) / 100;
  const breakevenUnits = calculateBreakevenUnits(totalBatchCost, product.sellingPrice);
  const suggestedPrice = calculateSuggestedPrice(costPerUnit, product.suggestedMarginPercent || 50);

  return {
    ingredientsCostSum,
    totalBatchCost,
    costPerUnit,
    profitPerUnit,
    profitMarginPercent,
    markupPercent,
    totalBatchRevenue,
    totalBatchProfit,
    breakevenUnits,
    suggestedPrice,
  };
}

export const CostCalculator = {
  convertToBaseUnit,
  calculateIngredientRecipeCost,
  calculateBatchCost,
  calculateCostPerUnit,
  calculateProfitPerUnit,
  calculateMargin,
  calculateMarkup,
  calculateSuggestedPrice,
  calculateBreakevenUnits,
  calculateProductMetrics,
};
