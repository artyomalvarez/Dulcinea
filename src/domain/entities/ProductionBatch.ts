export interface ProductionBatch {
  id: string;
  batchCode: string; // e.g. LOTE-2026-001
  date: string;
  productId: string;
  productName: string;
  numberOfBatches: number; // e.g. 3 recetas preparadas
  unitsPerBatch: number; // e.g. 5 unidades por receta
  totalUnitsProduced: number; // 3 * 5 = 15 unidades
  totalSuppliesCost: number; // e.g. $75 total cost
  costPerUnit: number; // totalSuppliesCost / totalUnitsProduced = $5
  unitsSold: number; // how many from this batch are sold
  notes?: string;
  status: 'completado' | 'en_proceso' | 'agotado';
}
