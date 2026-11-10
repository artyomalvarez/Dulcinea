import {
  BusinessProfile,
  Ingredient,
  Invoice,
  Product,
  ProductionBatch,
  Sale,
} from '../../domain/entities';
import { StoragePort } from '../../domain/ports/StoragePort';

export interface AppStateSnapshot {
  business: BusinessProfile;
  ingredients: Ingredient[];
  products: Product[];
  batches: ProductionBatch[];
  sales: Sale[];
  invoices: Invoice[];
}

export class LoadAppDataUseCase {
  constructor(private readonly storage: StoragePort) {}

  execute(): AppStateSnapshot {
    return {
      business: this.storage.getBusinessProfile(),
      ingredients: this.storage.getIngredients(),
      products: this.storage.getProducts(),
      batches: this.storage.getBatches(),
      sales: this.storage.getSales(),
      invoices: this.storage.getInvoices(),
    };
  }
}

export class SaveBusinessProfileUseCase {
  constructor(private readonly storage: StoragePort) {}

  execute(profile: BusinessProfile): BusinessProfile {
    this.storage.saveBusinessProfile(profile);
    return profile;
  }
}

export class BackupUseCases {
  constructor(private readonly storage: StoragePort) {}

  exportBackup(): string {
    return this.storage.exportBackup();
  }

  importBackup(jsonString: string): boolean {
    return this.storage.importBackup(jsonString);
  }

  resetToDefaults(): void {
    this.storage.resetToDefaults();
  }
}
