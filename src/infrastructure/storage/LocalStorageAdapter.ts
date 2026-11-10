import { StoragePort } from '../../domain/ports/StoragePort';
import { Ingredient, Product, ProductionBatch, Sale, Invoice, BusinessProfile } from '../../domain/entities';
import {
  INITIAL_INGREDIENTS,
  INITIAL_PRODUCTS,
  INITIAL_BATCHES,
  INITIAL_SALES,
  INITIAL_INVOICES,
  INITIAL_BUSINESS_PROFILE,
} from '../seeds/initialData';

// Claves de localStorage
export const KEYS = {
  INGREDIENTS: 'dulcecosto_ingredients_v3',
  PRODUCTS: 'dulcecosto_products_v1',
  BATCHES: 'dulcecosto_batches_v2',
  SALES: 'dulcecosto_sales_v2',
  INVOICES: 'dulcecosto_invoices_v1',
  BUSINESS: 'dulcecosto_business_v1',
};

export const STORAGE_KEYS = KEYS;

export class LocalStorageAdapter implements StoragePort {
  getIngredients(): Ingredient[] {
    const data = localStorage.getItem(KEYS.INGREDIENTS);
    return data ? JSON.parse(data) : INITIAL_INGREDIENTS;
  }

  saveIngredients(ingredients: Ingredient[]): void {
    localStorage.setItem(KEYS.INGREDIENTS, JSON.stringify(ingredients));
  }

  getProducts(): Product[] {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  }

  saveProducts(products: Product[]): void {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  }

  getBatches(): ProductionBatch[] {
    const data = localStorage.getItem(KEYS.BATCHES);
    return data ? JSON.parse(data) : INITIAL_BATCHES;
  }

  saveBatches(batches: ProductionBatch[]): void {
    localStorage.setItem(KEYS.BATCHES, JSON.stringify(batches));
  }

  getSales(): Sale[] {
    const data = localStorage.getItem(KEYS.SALES);
    return data ? JSON.parse(data) : INITIAL_SALES;
  }

  saveSales(sales: Sale[]): void {
    localStorage.setItem(KEYS.SALES, JSON.stringify(sales));
  }

  getInvoices(): Invoice[] {
    const data = localStorage.getItem(KEYS.INVOICES);
    return data ? JSON.parse(data) : INITIAL_INVOICES;
  }

  saveInvoices(invoices: Invoice[]): void {
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
  }

  getBusinessProfile(): BusinessProfile {
    const data = localStorage.getItem(KEYS.BUSINESS);
    return data ? JSON.parse(data) : INITIAL_BUSINESS_PROFILE;
  }

  saveBusinessProfile(profile: BusinessProfile): void {
    localStorage.setItem(KEYS.BUSINESS, JSON.stringify(profile));
  }

  exportBackup(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      business: this.getBusinessProfile(),
      ingredients: this.getIngredients(),
      products: this.getProducts(),
      batches: this.getBatches(),
      sales: this.getSales(),
      invoices: this.getInvoices(),
    };
    return JSON.stringify(backup, null, 2);
  }

  importBackup(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (data.business) this.saveBusinessProfile(data.business);
      if (data.ingredients) this.saveIngredients(data.ingredients);
      if (data.products) this.saveProducts(data.products);
      if (data.batches) this.saveBatches(data.batches);
      if (data.sales) this.saveSales(data.sales);
      if (data.invoices) this.saveInvoices(data.invoices);
      return true;
    } catch (err) {
      console.error('Error importing backup:', err);
      return false;
    }
  }

  resetToDefaults(): void {
    this.saveIngredients(INITIAL_INGREDIENTS);
    this.saveProducts(INITIAL_PRODUCTS);
    this.saveBatches(INITIAL_BATCHES);
    this.saveSales(INITIAL_SALES);
    this.saveInvoices(INITIAL_INVOICES);
    this.saveBusinessProfile(INITIAL_BUSINESS_PROFILE);
  }
}

// Exportamos una instancia única para usarla en los casos de uso
export const storageAdapter = new LocalStorageAdapter();
export const localStorageAdapter = storageAdapter;
export const storage = storageAdapter;
