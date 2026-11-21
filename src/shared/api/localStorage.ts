import { z } from 'zod';
import {
  Ingredient,
  Product,
  ProductionBatch,
  Sale,
  Invoice,
  BusinessProfile,
  IngredientSchema,
  ProductSchema,
  ProductionBatchSchema,
  SaleSchema,
  InvoiceSchema,
  BusinessProfileSchema,
  BackupPayloadSchema,
} from '../../entities';
import {
  INITIAL_INGREDIENTS,
  INITIAL_PRODUCTS,
  INITIAL_BATCHES,
  INITIAL_SALES,
  INITIAL_INVOICES,
  INITIAL_BUSINESS_PROFILE,
} from './initialData';

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

function parseStoredWithSchema<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsedJson: unknown = JSON.parse(raw);
    const result = schema.safeParse(parsedJson);
    if (!result.success) {
      console.warn(`Invalid data in localStorage key "${key}", falling back to defaults.`);
      return fallback;
    }
    return result.data;
  } catch (err) {
    console.warn(`Failed to parse localStorage key "${key}":`, err);
    return fallback;
  }
}

export class LocalStorageAdapter {
  getIngredients(): Ingredient[] {
    return parseStoredWithSchema(KEYS.INGREDIENTS, z.array(IngredientSchema), INITIAL_INGREDIENTS);
  }

  saveIngredients(ingredients: Ingredient[]): void {
    localStorage.setItem(KEYS.INGREDIENTS, JSON.stringify(ingredients));
  }

  getProducts(): Product[] {
    return parseStoredWithSchema(KEYS.PRODUCTS, z.array(ProductSchema), INITIAL_PRODUCTS);
  }

  saveProducts(products: Product[]): void {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  }

  getBatches(): ProductionBatch[] {
    return parseStoredWithSchema(KEYS.BATCHES, z.array(ProductionBatchSchema), INITIAL_BATCHES);
  }

  saveBatches(batches: ProductionBatch[]): void {
    localStorage.setItem(KEYS.BATCHES, JSON.stringify(batches));
  }

  getSales(): Sale[] {
    return parseStoredWithSchema(KEYS.SALES, z.array(SaleSchema), INITIAL_SALES);
  }

  saveSales(sales: Sale[]): void {
    localStorage.setItem(KEYS.SALES, JSON.stringify(sales));
  }

  getInvoices(): Invoice[] {
    return parseStoredWithSchema(KEYS.INVOICES, z.array(InvoiceSchema), INITIAL_INVOICES);
  }

  saveInvoices(invoices: Invoice[]): void {
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
  }

  getBusinessProfile(): BusinessProfile {
    const parsed = parseStoredWithSchema(
      KEYS.BUSINESS,
      BusinessProfileSchema,
      INITIAL_BUSINESS_PROFILE
    );
    const updated: BusinessProfile = { ...parsed };
    let changed = false;

    if (
      updated.businessName &&
      (updated.businessName.includes('Dulce Canela') || updated.businessName.includes('DulceCosto'))
    ) {
      updated.businessName = updated.businessName
        .replace(/Dulce Canela/g, 'Dulcinea')
        .replace(/DulceCosto/g, 'Dulcinea');
      if (updated.email === 'contacto@dulcecanela.com') {
        updated.email = 'contacto@dulcinea.com';
      }
      changed = true;
    }

    if (changed) {
      this.saveBusinessProfile(updated);
    }

    return updated;
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
      const raw: unknown = JSON.parse(json);
      const parsed = BackupPayloadSchema.safeParse(raw);
      if (!parsed.success) {
        console.error('Backup validation failed:', parsed.error.flatten());
        return false;
      }

      const data = parsed.data;
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

export const storageAdapter = new LocalStorageAdapter();
