import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  BackupPayloadSchema,
  BusinessProfile,
  Ingredient,
  Invoice,
  Product,
  ProductionBatch,
  Sale,
} from '../../entities';
import {
  INITIAL_BATCHES,
  INITIAL_BUSINESS_PROFILE,
  INITIAL_INGREDIENTS,
  INITIAL_INVOICES,
  INITIAL_PRODUCTS,
  INITIAL_SALES,
} from '../api/initialData';
import { storageAdapter } from '../api/localStorage';
import { applySaleToBatches, revertSaleFromBatches } from '../lib';

export interface AppStoreState {
  business: BusinessProfile;
  ingredients: Ingredient[];
  products: Product[];
  batches: ProductionBatch[];
  sales: Sale[];
  invoices: Invoice[];

  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  saveIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (id: string) => void;

  saveBatch: (batch: ProductionBatch) => void;
  deleteBatch: (id: string) => void;

  saveSale: (sale: Sale) => void;
  deleteSale: (saleId: string) => void;

  saveInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;

  saveBusiness: (profile: BusinessProfile) => void;

  exportBackup: () => string;
  importBackup: (json: string) => boolean;
  resetToDefaults: () => void;
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set, get) => ({
      business: storageAdapter.getBusinessProfile(),
      ingredients: storageAdapter.getIngredients(),
      products: storageAdapter.getProducts(),
      batches: storageAdapter.getBatches(),
      sales: storageAdapter.getSales(),
      invoices: storageAdapter.getInvoices(),

      saveProduct: (newProd) =>
        set((state) => {
          const exists = state.products.some((p) => p.id === newProd.id);
          const products = exists
            ? state.products.map((p) => (p.id === newProd.id ? newProd : p))
            : [newProd, ...state.products];
          return { products };
        }),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      saveIngredient: (newIng) =>
        set((state) => {
          const exists = state.ingredients.some((i) => i.id === newIng.id);
          const ingredients = exists
            ? state.ingredients.map((i) => (i.id === newIng.id ? newIng : i))
            : [newIng, ...state.ingredients];
          return { ingredients };
        }),

      deleteIngredient: (id) =>
        set((state) => ({
          ingredients: state.ingredients.filter((i) => i.id !== id),
        })),

      saveBatch: (newBatch) =>
        set((state) => {
          const exists = state.batches.some((b) => b.id === newBatch.id);
          const batches = exists
            ? state.batches.map((b) => (b.id === newBatch.id ? newBatch : b))
            : [newBatch, ...state.batches];
          return { batches };
        }),

      deleteBatch: (id) =>
        set((state) => ({
          batches: state.batches.filter((b) => b.id !== id),
        })),

      saveSale: (newSale) =>
        set((state) => {
          const existingSale = state.sales.find((s) => s.id === newSale.id);
          let workingBatches = state.batches;
          if (existingSale) {
            workingBatches = revertSaleFromBatches(existingSale, workingBatches);
          }
          const updatedBatches = applySaleToBatches(newSale, workingBatches);

          const sales = existingSale
            ? state.sales.map((s) => (s.id === newSale.id ? newSale : s))
            : [newSale, ...state.sales];

          return { batches: updatedBatches, sales };
        }),

      deleteSale: (saleId) =>
        set((state) => {
          const saleToDelete = state.sales.find((s) => s.id === saleId);
          if (!saleToDelete) return state;

          const restoredBatches = revertSaleFromBatches(saleToDelete, state.batches);
          const sales = state.sales.filter((s) => s.id !== saleId);
          return { batches: restoredBatches, sales };
        }),

      saveInvoice: (newInv) =>
        set((state) => {
          const exists = state.invoices.some((i) => i.id === newInv.id);
          const invoices = exists
            ? state.invoices.map((i) => (i.id === newInv.id ? newInv : i))
            : [newInv, ...state.invoices];
          return { invoices };
        }),

      deleteInvoice: (id) =>
        set((state) => ({
          invoices: state.invoices.filter((i) => i.id !== id),
        })),

      updateInvoiceStatus: (id, status) =>
        set((state) => ({
          invoices: state.invoices.map((inv) => (inv.id === id ? { ...inv, status } : inv)),
        })),

      saveBusiness: (profile) => set({ business: profile }),

      exportBackup: () => {
        const state = get();
        return JSON.stringify(
          {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            business: state.business,
            ingredients: state.ingredients,
            products: state.products,
            batches: state.batches,
            sales: state.sales,
            invoices: state.invoices,
          },
          null,
          2
        );
      },

      importBackup: (json) => {
        try {
          const raw: unknown = JSON.parse(json);
          const parsed = BackupPayloadSchema.safeParse(raw);
          if (!parsed.success) {
            return false;
          }
          const data = parsed.data;
          set((state) => ({
            business: data.business ?? state.business,
            ingredients: data.ingredients ?? state.ingredients,
            products: data.products ?? state.products,
            batches: data.batches ?? state.batches,
            sales: data.sales ?? state.sales,
            invoices: data.invoices ?? state.invoices,
          }));
          return true;
        } catch {
          return false;
        }
      },

      resetToDefaults: () =>
        set({
          business: INITIAL_BUSINESS_PROFILE,
          ingredients: INITIAL_INGREDIENTS,
          products: INITIAL_PRODUCTS,
          batches: INITIAL_BATCHES,
          sales: INITIAL_SALES,
          invoices: INITIAL_INVOICES,
        }),
    }),
    {
      name: 'dulcinea_app_store_v1',
      partialize: (state) => ({
        business: state.business,
        ingredients: state.ingredients,
        products: state.products,
        batches: state.batches,
        sales: state.sales,
        invoices: state.invoices,
      }),
    }
  )
);
