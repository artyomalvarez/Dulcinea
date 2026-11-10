import { Sale, ProductionBatch } from '../../domain/entities';
import { StoragePort } from '../../domain/ports/StoragePort';
import { revertSaleFromBatches } from '../../domain/services/SalesService';

export const deleteSaleUseCase = (saleId: string, storage: StoragePort): void => {
  const sales = storage.getSales();
  const saleToDelete = sales.find((s) => s.id === saleId);

  if (!saleToDelete) return;

  // 1. Borrar la venta
  const newSales = sales.filter((s) => s.id !== saleId);
  storage.saveSales(newSales);

  // 2. Devolver el stock a los lotes
  const batches = storage.getBatches();
  const updatedBatches = revertSaleFromBatches(saleToDelete, batches);
  storage.saveBatches(updatedBatches);
};

export class DeleteSaleUseCase {
  constructor(private readonly storage: StoragePort) {}

  execute(saleId: string): { sales: Sale[]; batches: ProductionBatch[] } {
    deleteSaleUseCase(saleId, this.storage);
    return {
      sales: this.storage.getSales(),
      batches: this.storage.getBatches(),
    };
  }
}
