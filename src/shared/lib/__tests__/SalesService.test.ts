import { describe, it, expect } from 'vitest';
import { SalesService } from '../SalesService';
import { BackupPayloadSchema } from '../../../entities';
import { ProductionBatch, Sale } from '../../../entities';

describe('SalesService', () => {
  it('calcula totales de ítems y venta con y sin impuestos', () => {
    const item = SalesService.calculateSaleItemTotals({
      quantity: 4,
      unitCost: 5,
      unitPrice: 12,
    });

    expect(item).toEqual({
      totalCost: 20,
      totalPrice: 48,
      unitProfit: 7,
      totalProfit: 28,
    });

    const totalsWithTax = SalesService.calculateSaleTotals(
      [{ quantity: 4, unitCost: 5, unitPrice: 12 }],
      19
    );

    expect(totalsWithTax.subtotal).toBe(48);
    expect(totalsWithTax.taxAmount).toBe(9.12);
    expect(totalsWithTax.totalAmount).toBe(57.12);
    expect(totalsWithTax.totalCost).toBe(20);
    expect(totalsWithTax.netProfit).toBe(28);

    const emptyTotals = SalesService.calculateSaleTotals([], 19);
    expect(emptyTotals).toEqual({
      subtotal: 0,
      taxAmount: 0,
      totalAmount: 0,
      totalCost: 0,
      netProfit: 0,
    });
  });

  it('maneja venta superior al stock disponible sin dejar unidades vendidas por encima del lote', () => {
    const batches: ProductionBatch[] = [
      {
        id: 'b-1',
        batchCode: 'LOTE-01',
        date: '2026-11-20',
        productId: 'p-1',
        productName: 'Galletas',
        numberOfBatches: 1,
        unitsPerBatch: 5,
        totalUnitsProduced: 5,
        totalSuppliesCost: 25,
        costPerUnit: 5,
        unitsSold: 3,
        status: 'completado',
      },
    ];

    const sale: Sale = {
      id: 's-1',
      saleNumber: 'VTA-001',
      date: '2026-11-20',
      customerName: 'Cliente',
      items: [
        {
          productId: 'p-1',
          productName: 'Galletas',
          quantity: 10,
          unitCost: 5,
          unitPrice: 12,
          totalPrice: 120,
          unitProfit: 7,
        },
      ],
      subtotal: 120,
      taxRatePercent: 0,
      taxAmount: 0,
      totalAmount: 120,
      totalCost: 50,
      netProfit: 70,
      paymentMethod: 'Efectivo',
      paymentStatus: 'Pagado',
    };

    const after = SalesService.applySaleToBatches(sale, batches);
    expect(after[0]?.unitsSold).toBe(5);
    expect(after[0]?.status).toBe('agotado');

    const reverted = SalesService.revertSaleFromBatches(sale, after);
    expect(reverted[0]?.unitsSold).toBe(0);
    expect(reverted[0]?.status).toBe('completado');
  });

  it('rechaza respaldos JSON corruptos o inválidos mediante BackupPayloadSchema', () => {
    const invalidPayload = {
      ingredients: [{ id: '', name: '', purchaseCost: -10 }],
    };
    const result = BackupPayloadSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
