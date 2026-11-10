import { Ingredient, IngredientCategory } from '../../entities/ingredient/model/types';

export interface ShoppingListItem {
  ingredient: Ingredient;
  currentStock: number;
  minStockAlert: number;
  deficit: number;
  packagesNeeded: number;
  estimatedCost: number;
  percentOfMin: number;
}

export interface ShoppingListSummary {
  items: ShoppingListItem[];
  totalEstimatedRestockCost: number;
}

/**
 * Normalizes legacy ingredient category names to current standard categories
 */
export function normalizeCategoryName(raw: string): IngredientCategory {
  if (raw === 'Harinas y Granos') return 'Harinas y Polvos';
  if (raw === 'Azúcares') return 'Azúcares y Endulzantes';
  if (raw === 'Esencias y Frutas') return 'Esencias, Frutas y Sabores';
  return (raw as IngredientCategory) || 'Otros';
}

/**
 * Checks whether an ingredient is at or below its minimum stock alert threshold
 */
export function isLowStock(ingredient: Ingredient): boolean {
  if (ingredient.minStockAlert === undefined || ingredient.minStockAlert <= 0) {
    return false;
  }
  const current = ingredient.currentStock ?? 0;
  return current <= ingredient.minStockAlert;
}

/**
 * Calculates how much stock is missing to reach the minimum alert threshold
 */
export function calculateDeficit(ingredient: Ingredient): number {
  const current = ingredient.currentStock ?? 0;
  const min = ingredient.minStockAlert ?? 0;
  if (min <= 0) return 0;
  return Math.max(0, Math.round((min - current) * 100) / 100);
}

/**
 * Calculates how many purchase packages are needed to cover the deficit
 */
export function calculatePackagesNeeded(ingredient: Ingredient): number {
  const deficit = calculateDeficit(ingredient);
  if (deficit <= 0) return 0;
  const pkgQty = ingredient.purchasePackageQuantity > 0 ? ingredient.purchasePackageQuantity : 1;
  return Math.ceil(deficit / pkgQty);
}

/**
 * Builds the low-stock shopping list with deficit, package suggestions, and estimated restock cost
 */
export function buildShoppingList(ingredients: Ingredient[]): ShoppingListSummary {
  const lowStock = ingredients.filter(isLowStock);

  const items: ShoppingListItem[] = lowStock.map((ing) => {
    const currentStock = ing.currentStock ?? 0;
    const minStockAlert = ing.minStockAlert ?? 0;
    const deficit = calculateDeficit(ing);
    const pkgQty = ing.purchasePackageQuantity > 0 ? ing.purchasePackageQuantity : 1;
    const packagesNeeded = Math.ceil(deficit / pkgQty);
    const estimatedCost = Math.round(packagesNeeded * ing.purchaseCost * 100) / 100;
    const percentOfMin =
      minStockAlert > 0 ? Math.min(100, Math.round((currentStock / minStockAlert) * 100)) : 0;

    return {
      ingredient: ing,
      currentStock,
      minStockAlert,
      deficit,
      packagesNeeded,
      estimatedCost,
      percentOfMin,
    };
  });

  const totalEstimatedRestockCost =
    Math.round(items.reduce((sum, item) => sum + item.estimatedCost, 0) * 100) / 100;

  return {
    items,
    totalEstimatedRestockCost,
  };
}

export const StockService = {
  normalizeCategoryName,
  isLowStock,
  calculateDeficit,
  calculatePackagesNeeded,
  buildShoppingList,
};
