import { Product } from '../entities/Product';
import { ProductionBatch } from '../entities/ProductionBatch';
import { Sale } from '../entities/Sale';
import { calculateProductMetrics } from './CostCalculator';
import { calculateSaleItemTotals, calculateSaleTotals } from './SalesService';

export type CostBasis = 'lotes' | 'ventas';

export interface MonthlyProfitabilityPoint {
  key: string; // e.g. "2026-06"
  monthKey: string; // alias for chart compatibility ("2026-06")
  label: string; // e.g. "Jun 2026" or "Junio 2026"
  shortLabel: string; // e.g. "Jun 2026"
  longLabel: string; // e.g. "Junio 2026"
  ventasTotales: number;
  costosTotales: number;
  utilidadNeta: number;
  margenPorcentaje: number;
  unidadesVendidas: number;
  lotesElaborados: number;
}

export interface DashboardMetrics {
  totalSalesRevenue: number;
  totalProductionCost: number;
  totalCostOfSoldItems: number;
  totalNetProfit: number;
  averageMargin: number;
  totalUnitsProduced: number;
  totalUnitsSold: number;
  lowMarginProducts: Product[];
}

export interface ProductPerformanceSummary {
  product: Product;
  unitsSold: number;
  revenue: number;
  profit: number;
}

const SHORT_MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

const LONG_MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/**
 * Groups sales and production batches by month (YYYY-MM) and calculates profitability metrics
 */
export function groupMonthlyProfitability(
  sales: readonly Sale[],
  batches: readonly ProductionBatch[],
  costBasis: CostBasis = 'lotes',
  useLongMonthNames: boolean = false
): MonthlyProfitabilityPoint[] {
  const map = new Map<
    string,
    {
      ventas: number;
      costoLotes: number;
      costoVentas: number;
      unidades: number;
      lotes: number;
    }
  >();

  sales.forEach((s) => {
    if (!s.date) return;
    const key = s.date.slice(0, 7); // "YYYY-MM"
    const current = map.get(key) || {
      ventas: 0,
      costoLotes: 0,
      costoVentas: 0,
      unidades: 0,
      lotes: 0,
    };

    const saleTotals = calculateSaleTotals(s.items, s.taxRatePercent);
    current.ventas += s.subtotal !== undefined ? s.subtotal : saleTotals.subtotal;
    current.costoVentas += s.totalCost !== undefined ? s.totalCost : saleTotals.totalCost;

    const unitsCount = s.items.reduce((acc, it) => acc + (it.quantity || 0), 0);
    current.unidades += unitsCount;
    map.set(key, current);
  });

  batches.forEach((b) => {
    if (!b.date) return;
    const key = b.date.slice(0, 7); // "YYYY-MM"
    const current = map.get(key) || {
      ventas: 0,
      costoLotes: 0,
      costoVentas: 0,
      unidades: 0,
      lotes: 0,
    };
    current.costoLotes += b.totalSuppliesCost || 0;
    current.lotes += b.numberOfBatches || 1;
    map.set(key, current);
  });

  const sortedKeys = Array.from(map.keys()).sort();

  return sortedKeys.map((key) => {
    const entry = map.get(key)!;
    const [year, monthStr] = key.split('-');
    const monthIdx = parseInt(monthStr, 10) - 1;
    const shortLabel = `${SHORT_MONTH_NAMES[monthIdx] || monthStr} ${year}`;
    const longLabel = `${LONG_MONTH_NAMES[monthIdx] || monthStr} ${year}`;
    const label = useLongMonthNames ? longLabel : shortLabel;

    const costosTotales =
      Math.round((costBasis === 'lotes' ? entry.costoLotes : entry.costoVentas) * 100) / 100;
    const ventasTotales = Math.round(entry.ventas * 100) / 100;
    const utilidadNeta = Math.round((ventasTotales - costosTotales) * 100) / 100;
    const margenPorcentaje =
      ventasTotales > 0 ? Math.round(((utilidadNeta / ventasTotales) * 100) * 10) / 10 : 0;

    return {
      key,
      monthKey: key,
      label,
      shortLabel,
      longLabel,
      ventasTotales,
      costosTotales,
      utilidadNeta,
      margenPorcentaje,
      unidadesVendidas: entry.unidades,
      lotesElaborados: entry.lotes,
    };
  });
}

/**
 * Computes global KPIs and alerts for the Dashboard
 */
export function calculateDashboardMetrics(
  sales: readonly Sale[],
  batches: readonly ProductionBatch[],
  products: readonly Product[],
  lowMarginThreshold: number = 40
): DashboardMetrics {
  const totalSalesRevenue =
    Math.round(
      sales.reduce((acc, s) => {
        const sub =
          s.subtotal !== undefined
            ? s.subtotal
            : calculateSaleTotals(s.items, s.taxRatePercent).subtotal;
        return acc + sub;
      }, 0) * 100
    ) / 100;

  const totalProductionCost =
    Math.round(batches.reduce((acc, b) => acc + (b.totalSuppliesCost || 0), 0) * 100) / 100;

  const totalCostOfSoldItems =
    Math.round(
      sales.reduce((acc, s) => {
        const cost =
          s.totalCost !== undefined
            ? s.totalCost
            : calculateSaleTotals(s.items, s.taxRatePercent).totalCost;
        return acc + cost;
      }, 0) * 100
    ) / 100;

  const totalNetProfit =
    Math.round(
      sales.reduce((acc, s) => {
        const profit =
          s.netProfit !== undefined
            ? s.netProfit
            : calculateSaleTotals(s.items, s.taxRatePercent).netProfit;
        return acc + profit;
      }, 0) * 100
    ) / 100;

  const averageMargin =
    totalSalesRevenue > 0 ? Math.round(((totalNetProfit / totalSalesRevenue) * 100) * 10) / 10 : 0;

  const totalUnitsProduced = batches.reduce((acc, b) => acc + (b.totalUnitsProduced || 0), 0);
  const totalUnitsSold = batches.reduce((acc, b) => acc + (b.unitsSold || 0), 0);

  const lowMarginProducts = products.filter((p) => {
    const metrics = calculateProductMetrics(p);
    return metrics.profitMarginPercent < lowMarginThreshold;
  });

  return {
    totalSalesRevenue,
    totalProductionCost,
    totalCostOfSoldItems,
    totalNetProfit,
    averageMargin,
    totalUnitsProduced,
    totalUnitsSold,
    lowMarginProducts,
  };
}

/**
 * Aggregates historical sales units, revenue, and profit per catalog product
 */
export function calculateProductPerformance(
  products: readonly Product[],
  sales: readonly Sale[]
): ProductPerformanceSummary[] {
  return products.map((p) => {
    let unitsSold = 0;
    let revenue = 0;
    let profit = 0;

    sales.forEach((s) => {
      s.items.forEach((it) => {
        if (it.productId === p.id) {
          const itemTotals = calculateSaleItemTotals(it);
          unitsSold += it.quantity;
          revenue += itemTotals.totalPrice;
          profit += itemTotals.totalProfit;
        }
      });
    });

    return {
      product: p,
      unitsSold,
      revenue: Math.round(revenue * 100) / 100,
      profit: Math.round(profit * 100) / 100,
    };
  });
}

export const AnalyticsService = {
  groupMonthlyProfitability,
  calculateDashboardMetrics,
  calculateProductPerformance,
};
