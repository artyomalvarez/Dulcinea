import { ProductionBatch } from '../../domain/entities/ProductionBatch';
import { StoragePort } from '../../domain/ports/StoragePort';

export class SaveBatchUseCase {
  constructor(private readonly storage: StoragePort) {}

  execute(batch: ProductionBatch): ProductionBatch[] {
    const currentBatches = this.storage.getBatches();
    const existingIndex = currentBatches.findIndex((b) => b.id === batch.id);

    const updatedBatches =
      existingIndex >= 0
        ? currentBatches.map((b) => (b.id === batch.id ? batch : b))
        : [batch, ...currentBatches];

    this.storage.saveBatches(updatedBatches);
    return updatedBatches;
  }
}

export class DeleteBatchUseCase {
  constructor(private readonly storage: StoragePort) {}

  execute(batchId: string): ProductionBatch[] {
    const currentBatches = this.storage.getBatches();
    const updatedBatches = currentBatches.filter((b) => b.id !== batchId);
    this.storage.saveBatches(updatedBatches);
    return updatedBatches;
  }
}
