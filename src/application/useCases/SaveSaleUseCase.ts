import { Sale, ProductionBatch } from '../../domain/entities';
import { StoragePort } from '../../domain/ports/StoragePort';
import { applySaleToBatches } from '../../domain/services/SalesService';

export const saveSaleUseCase = (sale: Sale, storage: StoragePort): Sale => {
  // 1. Guardar la venta
  const sales = storage.getSales();
  const newSales = [sale, ...sales];
  storage.saveSales(newSales);

  // 2. Descontar el inventario de los lotes usando la lógica pura
  const batches = storage.getBatches();
  const updatedBatches = applySaleToBatches(sale, batches);
  storage.saveBatches(updatedBatches);

  return sale;
};

export class SaveSaleUseCase {
  constructor(private readonly storage: StoragePort) {}

  execute(sale: Sale): { sales: Sale[]; batches: ProductionBatch[] } {
    saveSaleUseCase(sale, this.storage);
    return {
      sales: this.storage.getSales(),
      batches: this.storage.getBatches(),
    };
  }
}
