import { Sale, SaleLine, SaleItem, ProductionBatch } from '../entities';

export interface SaleItemTotals {
  totalCost: number;
  totalPrice: number;
  unitProfit: number;
  totalProfit: number;
}

export interface SaleTotals {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  totalCost: number;
  netProfit: number;
}

/**
 * Calculates derived totals for a single SaleItem / SaleLine
 */
export const calculateSaleItemTotals = (
  item: Pick<SaleItem, 'quantity' | 'unitCost' | 'unitPrice'>
): SaleItemTotals => {
  const qty = Number(item.quantity) || 0;
  const unitCost = Number(item.unitCost) || 0;
  const unitPrice = Number(item.unitPrice) || 0;

  const totalCost = Math.round(qty * unitCost * 100) / 100;
  const totalPrice = Math.round(qty * unitPrice * 100) / 100;
  const unitProfit = Math.round((unitPrice - unitCost) * 100) / 100;
  const totalProfit = Math.round((totalPrice - totalCost) * 100) / 100;

  return {
    totalCost,
    totalPrice,
    unitProfit,
    totalProfit,
  };
};

/**
 * Calculates subtotal, taxAmount, totalAmount, totalCost, and netProfit for a Sale
 */
export const calculateSaleTotals = (
  items: Pick<SaleLine, 'quantity' | 'unitCost' | 'unitPrice'>[],
  taxRatePercent: number = 0
): SaleTotals => {
  let subtotal = 0;
  let totalCost = 0;

  for (const item of items) {
    const lineTotals = calculateSaleItemTotals(item);
    subtotal += lineTotals.totalPrice;
    totalCost += lineTotals.totalCost;
  }

  subtotal = Math.round(subtotal * 100) / 100;
  totalCost = Math.round(totalCost * 100) / 100;
  const netProfit = Math.round((subtotal - totalCost) * 100) / 100;
  const safeTaxRate = Number(taxRatePercent) > 0 ? Number(taxRatePercent) : 0;
  const taxAmount = Math.round(subtotal * (safeTaxRate / 100) * 100) / 100;
  const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

  return {
    subtotal,
    taxAmount,
    totalAmount,
    totalCost,
    netProfit,
  };
};

// Reparte la venta entre los lotes disponibles (Sin mutar el estado original)
export const applySaleToBatches = (sale: Sale, batches: ProductionBatch[]): ProductionBatch[] => {
  // Hacemos una copia de los ítems para no modificar la venta original
  const remainingItems = sale.items.map((item) => ({ ...item }));

  return batches.map((batch) => {
    const saleItem = remainingItems.find((item) => item.productId === batch.productId);
    if (!saleItem || saleItem.quantity <= 0) return batch;

    const availableInBatch = batch.totalUnitsProduced - batch.unitsSold;
    if (availableInBatch <= 0) return batch; // Lote ya agotado

    // Cuántas unidades podemos descontar de este lote
    const unitsToDeduct = Math.min(availableInBatch, saleItem.quantity);

    // Restamos de lo que falta por cubrir
    saleItem.quantity -= unitsToDeduct;

    const newUnitsSold = batch.unitsSold + unitsToDeduct;

    return {
      ...batch,
      unitsSold: newUnitsSold,
      status: newUnitsSold >= batch.totalUnitsProduced ? 'agotado' : 'completado',
    } as ProductionBatch;
  });
};

// Devuelve el stock a los lotes cuando se borra una venta
export const revertSaleFromBatches = (sale: Sale, batches: ProductionBatch[]): ProductionBatch[] => {
  const remainingItems = sale.items.map((item) => ({ ...item }));

  return batches.map((batch) => {
    const saleItem = remainingItems.find((item) => item.productId === batch.productId);
    if (!saleItem || saleItem.quantity <= 0 || batch.unitsSold <= 0) return batch;

    const unitsToRestore = Math.min(batch.unitsSold, saleItem.quantity);
    saleItem.quantity -= unitsToRestore;

    const newUnitsSold = Math.max(0, batch.unitsSold - unitsToRestore);

    return {
      ...batch,
      unitsSold: newUnitsSold,
      status: newUnitsSold < batch.totalUnitsProduced ? 'completado' : 'agotado',
    } as ProductionBatch;
  });
};

export const SalesService = {
  calculateSaleItemTotals,
  calculateSaleTotals,
  applySaleToBatches,
  revertSaleFromBatches,
};
