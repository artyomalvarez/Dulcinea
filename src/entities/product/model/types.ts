import { UnitOfMeasure } from '../../ingredient/model/types';

export type ProductCategory =
  | 'Pasteles'
  | 'Galletas'
  | 'Cupcakes'
  | 'Postres Fríos'
  | 'Panadería'
  | 'Bocaditos y Tartas';

export interface RecipeIngredient {
  ingredientId: string;
  name: string;
  quantity: number; // quantity in recipeUnit
  recipeUnit: UnitOfMeasure;
  calculatedCost: number; // computed based on ingredient's purchase unit cost
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description?: string;
  ingredients: RecipeIngredient[];
  otherDirectCosts: number; // Empaque, cintas, capacillos, gas/luz estimado por lote
  batchYieldUnits: number; // How many sellable units/portions the recipe yields
  yieldUnitName: string; // e.g., 'unidades', 'porciones', 'cajas', 'docenas'
  suggestedMarginPercent: number; // e.g., 50%
  sellingPrice: number; // Established selling price per unit
  notes?: string;
  imageUrl?: string;
}
