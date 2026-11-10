import { UnitOfMeasure } from '../values/UnitOfMeasure';

export type IngredientCategory =
  | 'Harinas y Polvos'
  | 'Lácteos y Grasas'
  | 'Decoraciones y Coberturas'
  | 'Azúcares y Endulzantes'
  | 'Chocolates y Cacaos'
  | 'Huevos'
  | 'Esencias, Frutas y Sabores'
  | 'Empaque y Presentación'
  | 'Otros'
  | 'Harinas y Granos'
  | 'Azúcares'
  | 'Esencias y Frutas';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  purchasePackageQuantity: number; // e.g. 1000 for 1kg flour
  purchasePackageUnit: UnitOfMeasure; // 'g', 'kg', 'ml', 'l', 'pza'
  purchaseCost: number; // e.g. $35.00 for 1000g
  currentStock?: number; // current stock in purchasePackageUnit
  minStockAlert?: number; // minimum stock threshold to trigger low stock purchase alert
  notes?: string;
}
