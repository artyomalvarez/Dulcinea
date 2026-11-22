import React, { useState, useMemo } from 'react';
import {
  isValid,
  parseISO,
  isSameDay,
  isAfter,
  subDays,
  isSameMonth,
  subMonths,
} from 'date-fns';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingBag,
  ArrowUpRight,
  AlertTriangle,
  Plus,
  ChefHat,
  PackageCheck,
  AlertCircle,
  ArrowRight,
  Calculator,
  Croissant,
  Flame,
  Boxes,
  Calendar,
  Info,
} from 'lucide-react';
import {
  BusinessProfile,
  Product,
  ProductionBatch,
  Sale,
  Ingredient,
  WasteRecord,
} from '../entities';
import {
  formatCurrency,
  formatPercent,
  CostCalculator,
  StockService,
  AnalyticsService,
} from '../shared/lib';
import { MonthlyComparisonChart } from '../widgets/Dashboard/MonthlyComparisonChart';
import { ProfitabilityReportModal } from '../widgets/Dashboard/ProfitabilityReportModal';

type PeriodFilter = 'todos' | 'hoy' | 'ultimos_7_dias' | 'este_mes' | 'mes_anterior';

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  todos: 'Todo el historial',
  hoy: 'Hoy',
  ultimos_7_dias: 'Últimos 7 días',
  este_mes: 'Este mes',
  mes_anterior: 'Mes anterior',
};

interface DashboardPageProps {
  products: Product[];
  batches: ProductionBatch[];
  sales: Sale[];
  ingredients?: Ingredient[];
  wastes?: WasteRecord[];
  business: BusinessProfile;
  onOpenSaleModal: () => void;
  onOpenBatchModal: () => void;
  onNavigateToIngredients: () => void;
  onNavigateToCatalog: () => void;
  onNavigateToWorkshop: () => void;
  onOpenCalculator: () => void;
  onOpenLossSimulator: () => void;
}

function matchesPeriod(dateStr: string, period: PeriodFilter, now: Date): boolean {
  if (period === 'todos') return true;
  if (!dateStr) return false;
  const parsed = parseISO(dateStr);
  if (!isValid(parsed)) return false;

  switch (period) {
    case 'hoy':
      return isSameDay(parsed, now);
    case 'ultimos_7_dias':
      return isAfter(parsed, subDays(now, 7)) || isSameDay(parsed, subDays(now, 7));
    case 'este_mes':
      return isSameMonth(parsed, now);
    case 'mes_anterior':
      return isSameMonth(parsed, subMonths(now, 1));
    default:
      return true;
  }
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  products,
  batches,
  sales,
  ingredients = [],
  wastes = [],
  business,
  onOpenSaleModal,
  onOpenBatchModal,
  onNavigateToIngredients,
  onNavigateToCatalog,
  onNavigateToWorkshop,
  onOpenCalculator,
  onOpenLossSimulator,
}) => {
  const [period, setPeriod] = useState<PeriodFilter>('todos');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Low stock calculation (always current state)
  const { items: shoppingListItems } = StockService.buildShoppingList(ingredients);
  const lowStockCount = shoppingListItems.length;

  // Period-filtered records for contextual financial KPIs
  const { filteredSales, filteredBatches, filteredWastes } = useMemo(() => {
    const now = new Date();
    return {
      filteredSales: sales.filter((s) => matchesPeriod(s.date, period, now)),
      filteredBatches: batches.filter((b) => matchesPeriod(b.date, period, now)),
      filteredWastes: wastes.filter((w) => matchesPeriod(w.date, period, now)),
    };
  }, [sales, batches, wastes, period]);

  // Aggregate Metrics via AnalyticsService (period-contextualized)
  const {
    totalSalesRevenue,
    totalProductionCost,
    totalLossCost,
    totalLossCount,
    netProfitWithLoss,
    marginWithLoss,
    lowMarginProducts,
  } = AnalyticsService.calculateDashboardMetrics(
    filteredSales,
    filteredBatches,
    products,
    40,
    filteredWastes
  );

  // Active batches with available stock in workshop/vitrina
  const availableBatches = batches.filter(
    (b) => (b.totalUnitsProduced || 0) > (b.unitsSold || 0)
  );

  const periodLabel = PERIOD_LABELS[period];

  return (
    <div className="space-y-6 pb-12">
      {/* Compact Welcome Banner with 2 Primary Actions + Secondary Simulators */}
      <div className="bg-gradient-to-r from-dulcinea-midnight via-[#1F3A52] to-[#142433] rounded-2xl p-5 sm:p-6 text-white shadow-sm relative overflow-hidden border border-dulcinea-copper/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-dulcinea-copper block mb-1">
              Dulcinea · {business.businessName || 'Taller de Repostería'}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-serif text-dulcinea-cream!">
              Hola, {business.ownerName || 'Repostero'} — El control de tu taller, desde la receta hasta la ganancia
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0">
            {/* 2 Primary Everyday Actions */}
            <button
              onClick={onOpenSaleModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-dulcinea-copper hover:bg-[#c88a58] text-dulcinea-midnight font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>+ Registrar venta</span>
            </button>

            <button
              onClick={onOpenBatchModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-dulcinea-blue hover:bg-[#2f698d] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Elaborar lote</span>
            </button>
          </div>
        </div>

        {/* Secondary Simulators Row */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-300">Herramientas de análisis y simulación:</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenCalculator}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-dulcinea-cream font-semibold transition-colors cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-dulcinea-copper" />
              <span>Simulador de Costos</span>
            </button>

            <button
              onClick={onOpenLossSimulator}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dulcinea-cherry/80 hover:bg-dulcinea-cherry text-white font-semibold transition-colors cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-amber-200" />
              <span>Registrar Merma / Pérdida</span>
            </button>
          </div>
        </div>
      </div>

      {/* Period Filter Bar */}
      <div className="bg-white px-4 py-3 rounded-xl border border-dulcinea-copper/25 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-dulcinea-midnight">
          <Calendar className="w-4 h-4 text-dulcinea-copper" />
          <span>Periodo de métricas financieras:</span>
          <span className="px-2 py-0.5 rounded-md bg-dulcinea-blue-soft text-dulcinea-blue font-semibold">
            {periodLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-dulcinea-cream/45 p-1 rounded-xl overflow-x-auto">
          {(Object.keys(PERIOD_LABELS) as PeriodFilter[]).map((key) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                period === key
                  ? 'bg-dulcinea-midnight text-dulcinea-cream shadow-xs'
                  : 'text-dulcinea-muted hover:text-dulcinea-midnight'
              }`}
            >
              {PERIOD_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 ? (
        <div className="bg-dulcinea-cream/70 border border-dulcinea-copper/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-dulcinea-copper/25 text-dulcinea-cherry flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-dulcinea-midnight text-sm">
                {lowStockCount} insumo{lowStockCount > 1 ? 's' : ''} por debajo de lo recomendado
              </span>
              <p className="text-xs text-dulcinea-text mt-0.5">
                Revisa tu inventario para reponer las materias primas críticas antes de tu próxima horneada.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToIngredients}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-dulcinea-midnight hover:bg-[#142433] text-dulcinea-cream font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <span>Ver reposición</span>
            <ArrowRight className="w-3.5 h-3.5 text-dulcinea-copper" />
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-800 shadow-sm">
          <div className="flex items-center gap-2.5">
            <PackageCheck className="w-4 h-4 text-dulcinea-success shrink-0" />
            <span className="font-medium">
              ¡Todo en orden! No tienes insumos por debajo del mínimo recomendado.
            </span>
          </div>
          <button
            onClick={onNavigateToIngredients}
            className="text-emerald-800 font-bold hover:underline cursor-pointer text-xs"
          >
            Ver inventario
          </button>
        </div>
      )}

      {/* KPI Cards with Temporal Context & Microcopy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-xl border border-dulcinea-copper/25 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-dulcinea-muted uppercase tracking-wider flex items-center gap-1">
              <span>Ingresos por Ventas</span>
              <span title="Suma de todas las ventas registradas en el periodo seleccionado (sin impuestos).">
                <Info className="w-3.5 h-3.5 text-stone-400 cursor-help" />
              </span>
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-dulcinea-success flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-dulcinea-midnight font-mono">
              {formatCurrency(totalSalesRevenue, business.currencySymbol)}
            </span>
          </div>
          <p className="mt-1 text-xs text-dulcinea-success flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>
              {filteredSales.length} órdenes · {periodLabel}
            </span>
          </p>
        </div>

        {/* Total Cost of Supplies */}
        <div className="bg-white p-5 rounded-xl border border-dulcinea-copper/25 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-dulcinea-muted uppercase tracking-wider flex items-center gap-1">
              <span>Costo en Insumos</span>
              <span title="Inversión en materias primas usadas para producir los lotes del periodo.">
                <Info className="w-3.5 h-3.5 text-stone-400 cursor-help" />
              </span>
            </span>
            <div className="w-9 h-9 rounded-xl bg-dulcinea-cream text-dulcinea-midnight flex items-center justify-center">
              <Package className="w-5 h-5 text-dulcinea-copper" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-dulcinea-midnight font-mono">
              {formatCurrency(totalProductionCost, business.currencySymbol)}
            </span>
          </div>
          <p className="mt-1 text-xs text-dulcinea-muted">
            {filteredBatches.length} lotes producidos · {periodLabel}
          </p>
        </div>

        {/* Mermas y Pérdidas */}
        <div
          onClick={onOpenLossSimulator}
          className="bg-white p-5 rounded-xl border border-rose-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          title="Abrir Simulador de Pérdidas y Mermas"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-dulcinea-cherry uppercase tracking-wider flex items-center gap-1">
              <span>Mermas y Pérdidas</span>
              <span title="Costo directo perdido por productos dañados o insumos vencidos/derramados.">
                <Info className="w-3.5 h-3.5 text-rose-400 cursor-help" />
              </span>
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-dulcinea-cherry flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-dulcinea-cherry font-mono">
              -{formatCurrency(totalLossCost, business.currencySymbol)}
            </span>
          </div>
          <p className="mt-1 text-xs text-rose-600 font-medium">
            {totalLossCount} eventos · {periodLabel}
          </p>
        </div>

        {/* Real Net Profit (after deducting loss) */}
        <div className="bg-white p-5 rounded-xl border border-dulcinea-copper/25 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-dulcinea-muted uppercase tracking-wider flex items-center gap-1">
              <span>Utilidad Neta Real</span>
              <span title="Porcentaje y ganancia real que queda después de descontar el costo de insumos y mermas.">
                <Info className="w-3.5 h-3.5 text-stone-400 cursor-help" />
              </span>
            </span>
            <div className="w-9 h-9 rounded-xl bg-dulcinea-blue-soft text-dulcinea-blue flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                netProfitWithLoss >= 0 ? 'text-dulcinea-midnight' : 'text-dulcinea-cherry'
              }`}
            >
              {formatCurrency(netProfitWithLoss, business.currencySymbol)}
            </span>
          </div>
          <p className="mt-1 text-xs text-dulcinea-success font-bold">
            Margen de ganancia: {formatPercent(marginWithLoss)}
          </p>
        </div>
      </div>

      {/* Real-time Inventory & Stock Overview */}
      <div className="bg-white rounded-2xl border border-dulcinea-copper/25 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-dulcinea-cream text-dulcinea-midnight flex items-center justify-center">
              <Boxes className="w-5 h-5 text-dulcinea-copper" />
            </div>
            <div>
              <h3 className="text-base font-bold text-dulcinea-midnight font-serif">
                ¿Qué hay en stock hoy? (Vitrina y Almacén)
              </h3>
              <p className="text-xs text-dulcinea-muted">
                Disponibilidad actual de productos listos para vender y materias primas que necesitan reposición
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToIngredients}
            className="text-xs font-bold text-dulcinea-blue hover:text-dulcinea-midnight flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Ir a Inventario</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vitrina de Productos Listos para Vender */}
          <div className="bg-stone-50/70 p-4 rounded-xl border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-dulcinea-midnight font-serif flex items-center gap-1.5">
                <Croissant className="w-4 h-4 text-dulcinea-copper" />
                <span>Vitrina: Productos Disponibles</span>
              </span>
              <span className="text-[11px] font-bold text-dulcinea-muted font-mono">
                {availableBatches.length} lotes activos
              </span>
            </div>

            {availableBatches.length === 0 ? (
              <p className="text-xs text-dulcinea-muted py-4 text-center">
                No hay unidades en vitrina en este momento. Elabora un nuevo lote para abastecer tus ventas.
              </p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {availableBatches.map((b) => {
                  const availableUnits = (b.totalUnitsProduced || 0) - (b.unitsSold || 0);
                  return (
                    <div
                      key={b.id}
                      className="bg-white p-2.5 rounded-lg border border-stone-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-dulcinea-midnight">{b.productName}</span>
                        <span className="text-[10px] text-dulcinea-muted font-mono block">
                          Lote: {b.batchCode} · Disponible
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-dulcinea-success border border-emerald-200">
                          {availableUnits} disp.
                        </span>
                        <button
                          onClick={onOpenLossSimulator}
                          title="Registrar merma o daño"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-dulcinea-cherry hover:bg-rose-100 text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          <Flame className="w-3 h-3" />
                          <span>Merma</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Almacén: Insumos Críticos */}
          <div className="bg-stone-50/70 p-4 rounded-xl border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-dulcinea-midnight font-serif flex items-center gap-1.5">
                <Package className="w-4 h-4 text-dulcinea-copper" />
                <span>Almacén: Reposición Necesaria</span>
              </span>
              <span className="text-[11px] font-bold text-dulcinea-muted font-mono">
                {lowStockCount} alertas
              </span>
            </div>

            {lowStockCount === 0 ? (
              <div className="py-4 text-center space-y-1">
                <p className="text-xs font-bold text-dulcinea-success">
                  ¡Todo en orden! No tienes insumos por debajo del mínimo.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {shoppingListItems.slice(0, 4).map((it) => (
                  <div
                    key={it.ingredient.id}
                    className="bg-white p-2.5 rounded-lg border border-rose-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-dulcinea-midnight">{it.ingredient.name}</span>
                      <span className="text-[10px] text-dulcinea-muted block font-mono">
                        Mínimo: {it.minStockAlert} {it.ingredient.purchasePackageUnit}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-dulcinea-cherry block">
                        Quedan: {it.currentStock} {it.ingredient.purchasePackageUnit}
                      </span>
                      <span className="text-[10px] text-dulcinea-muted font-medium">
                        Reponer: {it.deficit} {it.ingredient.purchasePackageUnit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Cost vs Sales Comparison Chart */}
      <MonthlyComparisonChart
        sales={sales}
        batches={batches}
        wastes={wastes}
        business={business}
        onOpenReport={() => setIsReportModalOpen(true)}
      />

      {/* Low Margin Warning Alert if any */}
      {lowMarginProducts.length > 0 && (
        <div className="bg-dulcinea-cherry/10 border border-dulcinea-cherry/30 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-dulcinea-cherry shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold text-dulcinea-cherry">Alerta de Margen Bajo: </span>
            <span className="text-dulcinea-midnight">
              Hay {lowMarginProducts.length} producto(s) con margen inferior al 40% (
              {lowMarginProducts.map((p) => p.name).join(', ')}). Considera ajustar su precio de venta o revisar el costo de sus insumos.
            </span>
          </div>
        </div>
      )}

      {/* Products Profitability Comparison & Workshop Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Profitability Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-dulcinea-copper/25 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-dulcinea-midnight font-serif">
                Rentabilidad por Producto del Catálogo
              </h3>
              <p className="text-xs text-dulcinea-muted">
                Comparativa directa de costo por porción, precio establecido y ganancia
              </p>
            </div>
            <button
              onClick={onNavigateToCatalog}
              className="text-xs font-bold text-dulcinea-blue hover:text-dulcinea-midnight flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
            >
              <span>Ver productos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/80 text-stone-400 font-semibold uppercase text-[10px]">
                  <th className="pb-2.5">Producto / Receta</th>
                  <th className="pb-2.5 text-center">Rinde</th>
                  <th className="pb-2.5 text-right">Costo / U</th>
                  <th className="pb-2.5 text-right">Precio Venta</th>
                  <th className="pb-2.5 text-right">Utilidad / U</th>
                  <th className="pb-2.5 text-right">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.slice(0, 6).map((p) => {
                  const metrics = CostCalculator.calculateProductMetrics(p);
                  const isHealthy = metrics.profitMarginPercent >= 50;
                  return (
                    <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 pr-2">
                        <div className="font-semibold text-dulcinea-midnight">{p.name}</div>
                        <span className="text-[10px] text-dulcinea-muted">{p.category}</span>
                      </td>
                      <td className="py-3 text-center text-stone-600 font-medium">
                        {p.batchYieldUnits} {p.yieldUnitName}
                      </td>
                      <td className="py-3 text-right font-mono text-stone-700 font-medium">
                        {formatCurrency(metrics.costPerUnit, business.currencySymbol)}
                      </td>
                      <td className="py-3 text-right font-mono text-dulcinea-midnight font-bold">
                        {formatCurrency(p.sellingPrice, business.currencySymbol)}
                      </td>
                      <td className="py-3 text-right font-mono text-dulcinea-success font-bold">
                        +{formatCurrency(metrics.profitPerUnit, business.currencySymbol)}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                            isHealthy
                              ? 'bg-emerald-50 text-dulcinea-success border border-emerald-200'
                              : 'bg-rose-50 text-dulcinea-cherry border border-rose-200'
                          }`}
                        >
                          {formatPercent(metrics.profitMarginPercent)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Batches */}
        <div className="bg-white rounded-2xl border border-dulcinea-copper/25 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-dulcinea-midnight font-serif flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-dulcinea-copper" />
              <span>Últimos Lotes de Producción</span>
            </h3>
            <button
              onClick={onNavigateToWorkshop}
              className="text-[11px] font-bold text-dulcinea-blue hover:text-dulcinea-midnight cursor-pointer transition-colors"
            >
              Ver producción
            </button>
          </div>

          <div className="space-y-3">
            {batches.slice(0, 4).map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl bg-dulcinea-cream/35 border border-dulcinea-copper/25 flex flex-col gap-1 hover:border-dulcinea-copper transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-dulcinea-midnight line-clamp-1">{b.productName}</span>
                  <span className="text-[10px] text-dulcinea-muted font-mono">{b.batchCode}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-600 mt-1">
                  <span>
                    {b.totalUnitsProduced} unidades ({b.unitsSold} vendidas)
                  </span>
                  <span className="font-bold text-dulcinea-midnight font-mono">
                    Costo: {formatCurrency(b.totalSuppliesCost, business.currencySymbol)}
                  </span>
                </div>
                <div className="w-full bg-dulcinea-cream rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className="bg-dulcinea-midnight h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(100, (b.unitsSold / b.totalUnitsProduced) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {batches.length === 0 && (
              <p className="text-xs text-dulcinea-muted text-center py-6">
                No hay lotes horneados registrados todavía.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Connected Profitability Report PDF Modal */}
      <ProfitabilityReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        sales={sales}
        batches={batches}
        products={products}
        business={business}
      />
    </div>
  );
};
