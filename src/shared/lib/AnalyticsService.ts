import { format, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Product, ProductionBatch, Sale, WasteRecord } from '../../entities';
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
  perdidasTotales: number;
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
  totalLossCost: number;
  totalLossRevenue: number;
  totalLossCount: number;
  netProfitWithLoss: number;
  marginWithLoss: number;
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
  useLongMonthNames: boolean = false,
  wastes: readonly WasteRecord[] = []
): MonthlyProfitabilityPoint[] {
  const map = new Map<
    string,
    {
      ventas: number;
      costoLotes: number;
      costoVentas: number;
      perdidas: number;
      unidades: number;
      lotes: number;
    }
  >();

  sales.forEach((s) => {
    if (!s.date) return;
    const parsedDate = parseISO(s.date);
    const key = isValid(parsedDate) ? format(parsedDate, 'yyyy-MM') : s.date.slice(0, 7);
    const current = map.get(key) || {
      ventas: 0,
      costoLotes: 0,
      costoVentas: 0,
      perdidas: 0,
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
    const parsedDate = parseISO(b.date);
    const key = isValid(parsedDate) ? format(parsedDate, 'yyyy-MM') : b.date.slice(0, 7);
    const current = map.get(key) || {
      ventas: 0,
      costoLotes: 0,
      costoVentas: 0,
      perdidas: 0,
      unidades: 0,
      lotes: 0,
    };
    current.costoLotes += b.totalSuppliesCost || 0;
    current.lotes += b.numberOfBatches || 1;
    map.set(key, current);
  });

  wastes.forEach((w) => {
    if (!w.date) return;
    const parsedDate = parseISO(w.date);
    const key = isValid(parsedDate) ? format(parsedDate, 'yyyy-MM') : w.date.slice(0, 7);
    const current = map.get(key) || {
      ventas: 0,
      costoLotes: 0,
      costoVentas: 0,
      perdidas: 0,
      unidades: 0,
      lotes: 0,
    };
    current.perdidas += w.directCostLost || 0;
    map.set(key, current);
  });

  const sortedKeys = Array.from(map.keys()).sort();

  return sortedKeys.map((key) => {
    const entry = map.get(key)!;
    const [year = '', monthStr = '01'] = key.split('-');
    const monthIdx = parseInt(monthStr, 10) - 1;
    const shortLabel = `${SHORT_MONTH_NAMES[monthIdx] || monthStr} ${year}`;
    const longLabel = `${LONG_MONTH_NAMES[monthIdx] || monthStr} ${year}`;
    const label = useLongMonthNames ? longLabel : shortLabel;

    const costosTotales =
      Math.round((costBasis === 'lotes' ? entry.costoLotes : entry.costoVentas) * 100) / 100;
    const ventasTotales = Math.round(entry.ventas * 100) / 100;
    const perdidasTotales = Math.round((entry.perdidas || 0) * 100) / 100;
    const utilidadNeta = Math.round((ventasTotales - costosTotales - perdidasTotales) * 100) / 100;
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
      perdidasTotales,
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
  lowMarginThreshold: number = 40,
  wastes: readonly WasteRecord[] = []
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

  const totalLossCost =
    Math.round(wastes.reduce((acc, w) => acc + (w.directCostLost || 0), 0) * 100) / 100;

  const totalLossRevenue =
    Math.round(wastes.reduce((acc, w) => acc + (w.potentialRevenueLost || 0), 0) * 100) / 100;

  const totalLossCount = wastes.length;

  const netProfitWithLoss = Math.round((totalNetProfit - totalLossCost) * 100) / 100;

  const marginWithLoss =
    totalSalesRevenue > 0
      ? Math.round(((netProfitWithLoss / totalSalesRevenue) * 100) * 10) / 10
      : 0;

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
    totalLossCost,
    totalLossRevenue,
    totalLossCount,
    netProfitWithLoss,
    marginWithLoss,
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
