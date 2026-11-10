import { Ingredient, Product, ProductionBatch, Sale, Invoice, BusinessProfile } from '../entities';

export interface StoragePort {
  getIngredients(): Ingredient[];
  saveIngredients(ingredients: Ingredient[]): void;

  getProducts(): Product[];
  saveProducts(products: Product[]): void;

  getBatches(): ProductionBatch[];
  saveBatches(batches: ProductionBatch[]): void;

  getSales(): Sale[];
  saveSales(sales: Sale[]): void;

  getInvoices(): Invoice[];
  saveInvoices(invoices: Invoice[]): void;

  getBusinessProfile(): BusinessProfile;
  saveBusinessProfile(profile: BusinessProfile): void;

  // Utilidades
  exportBackup(): string;
  importBackup(json: string): boolean;
  resetToDefaults(): void;
}
