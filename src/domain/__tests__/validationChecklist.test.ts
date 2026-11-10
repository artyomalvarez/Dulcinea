import { describe, it, expect } from 'vitest';
import { applySaleToBatches, revertSaleFromBatches, calculateSaleTotals } from '../services/SalesService';
import { CostCalculator } from '../services/CostCalculator';
import { AnalyticsService } from '../services/AnalyticsService';
import { StockService } from '../services/StockService';
import { INITIAL_BATCHES, INITIAL_INGREDIENTS, INITIAL_PRODUCTS, INITIAL_SALES } from '../../infrastructure/seeds/initialData';
import { ProductionBatch, Sale } from '../entities';

describe('Checklist de Validación (Clean Architecture)', () => {
  it('1. Bug de Inventario: descuenta de múltiples lotes de forma inmutable y revierte al borrar la venta', () => {
    // Dos lotes disponibles de galletas: Lote A tiene 3 disponibles (12/15 vendidas), Lote B tiene 15 disponibles (0/15 vendidas)
    const initialBatches: ProductionBatch[] = [
      {
        id: 'batch-a',
        batchCode: 'LOTE-A',
        date: '2026-11-08',
        productId: 'prod-cookies-15',
        productName: 'Galletas',
        numberOfBatches: 3,
        unitsPerBatch: 5,
        totalUnitsProduced: 15,
        totalSuppliesCost: 75,
        costPerUnit: 5,
        unitsSold: 12, // Quedan 3 disponibles
        status: 'completado',
      },
      {
        id: 'batch-b',
        batchCode: 'LOTE-B',
        date: '2026-11-09',
        productId: 'prod-cookies-15',
        productName: 'Galletas',
        numberOfBatches: 3,
        unitsPerBatch: 5,
        totalUnitsProduced: 15,
        totalSuppliesCost: 75,
        costPerUnit: 5,
        unitsSold: 0, // Quedan 15 disponibles
        status: 'completado',
      },
    ];

    // Venta de 10 galletas (más de las 3 que quedan en el Lote A)
    const sale: Sale = {
      id: 'sale-test',
      saleNumber: 'VTA-TEST',
      date: '2026-11-09',
      customerName: 'Cliente Prueba',
      items: [
        {
          productId: 'prod-cookies-15',
          productName: 'Galletas',
          quantity: 10,
          unitCost: 5,
          unitPrice: 12,
          totalPrice: 120,
          unitProfit: 7,
        },
      ],
      subtotal: 120,
      taxRatePercent: 16,
      taxAmount: 19.2,
      totalAmount: 139.2,
      totalCost: 50,
      netProfit: 70,
      paymentMethod: 'Efectivo',
      paymentStatus: 'Pagado',
    };

    const afterSaleBatches = applySaleToBatches(sale, initialBatches);

    // Verificar inmutabilidad (el arreglo original no fue mutado)
    expect(initialBatches[0].unitsSold).toBe(12);
    expect(initialBatches[1].unitsSold).toBe(0);

    // Verificar reparto multi-lote: 3 del Lote A (queda en 15/15 agotado) + 7 del Lote B (queda en 7/15 completado)
    expect(afterSaleBatches[0].unitsSold).toBe(15);
    expect(afterSaleBatches[0].status).toBe('agotado');
    expect(afterSaleBatches[1].unitsSold).toBe(7);
    expect(afterSaleBatches[1].status).toBe('completado');

    // Borrar la venta y verificar que las 10 galletas regresan al inventario
    const afterRevertBatches = revertSaleFromBatches(sale, afterSaleBatches);
    const totalAvailableBefore = initialBatches.reduce((acc, b) => acc + (b.totalUnitsProduced - b.unitsSold), 0);
    const totalAvailableAfterRevert = afterRevertBatches.reduce((acc, b) => acc + (b.totalUnitsProduced - b.unitsSold), 0);

    expect(totalAvailableAfterRevert).toBe(totalAvailableBefore); // 18 disponibles nuevamente
    expect(afterRevertBatches.every((b) => b.status === 'completado')).toBe(true);
  });

  it('2. Dashboard y Gráficas: calcula métricas reales sin NaN ni $0.00 sobre la data inicial', () => {
    const dashboardMetrics = AnalyticsService.calculateDashboardMetrics(
      INITIAL_SALES,
      INITIAL_BATCHES,
      INITIAL_PRODUCTS
    );

    expect(Number.isNaN(dashboardMetrics.totalSalesRevenue)).toBe(false);
    expect(dashboardMetrics.totalSalesRevenue).toBeGreaterThan(0);
    expect(Number.isNaN(dashboardMetrics.totalNetProfit)).toBe(false);
    expect(dashboardMetrics.totalNetProfit).toBeGreaterThan(0);
    expect(Number.isNaN(dashboardMetrics.averageMargin)).toBe(false);
    expect(dashboardMetrics.averageMargin).toBeGreaterThan(0);

    const monthly = AnalyticsService.groupMonthlyProfitability(INITIAL_SALES, INITIAL_BATCHES, 'lotes');
    expect(monthly.length).toBeGreaterThan(0);
    monthly.forEach((m) => {
      expect(Number.isNaN(m.ventasTotales)).toBe(false);
      expect(Number.isNaN(m.costosTotales)).toBe(false);
      expect(Number.isNaN(m.utilidadNeta)).toBe(false);
      expect(Number.isNaN(m.margenPorcentaje)).toBe(false);
    });

    const shoppingList = StockService.buildShoppingList(INITIAL_INGREDIENTS);
    expect(shoppingList.items.length).toBe(3);
    expect(shoppingList.totalEstimatedRestockCost).toBeGreaterThan(0);

    INITIAL_PRODUCTS.forEach((p) => {
      const pm = CostCalculator.calculateProductMetrics(p);
      expect(pm.costPerUnit).toBeGreaterThan(0);
      expect(pm.profitPerUnit).toBeGreaterThan(0);
      expect(pm.profitMarginPercent).toBeGreaterThan(0);
    });
  });
});
