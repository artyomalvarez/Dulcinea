import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
  AlertTriangle,
  Plus,
  Percent,
  ChefHat,
  PackageCheck,
  AlertCircle,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { BusinessProfile, Product, ProductionBatch, Sale, Ingredient } from '../entities';
import {
  formatCurrency,
  formatPercent,
  CostCalculator,
  StockService,
  AnalyticsService,
} from '../shared/lib';
import { MonthlyComparisonChart } from '../widgets/Dashboard/MonthlyComparisonChart';

interface DashboardPageProps {
  products: Product[];
  batches: ProductionBatch[];
  sales: Sale[];
  ingredients?: Ingredient[];
  business: BusinessProfile;
  onOpenSaleModal: () => void;
  onOpenBatchModal: () => void;
  onNavigateToIngredients: () => void;
  onNavigateToCatalog: () => void;
  onNavigateToWorkshop: () => void;
  onOpenCalculator: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  products,
  batches,
  sales,
  ingredients = [],
  business,
  onOpenSaleModal,
  onOpenBatchModal,
  onNavigateToIngredients,
  onNavigateToCatalog,
  onNavigateToWorkshop,
  onOpenCalculator,
}) => {
  // Low stock calculation
  const { items: shoppingListItems } = StockService.buildShoppingList(ingredients);
  const lowStockCount = shoppingListItems.length;

  // Aggregate Metrics via AnalyticsService
  const {
    totalSalesRevenue,
    totalProductionCost,
    totalNetProfit,
    averageMargin,
    totalUnitsProduced,
    totalUnitsSold,
    lowMarginProducts,
  } = AnalyticsService.calculateDashboardMetrics(sales, batches, products, 40);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Fast Actions Hero Card */}
      <div className="bg-gradient-to-r from-[#1A2E40] via-[#1F3A52] to-[#142433] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-[#D4A373]/20">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <ChefHat className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A373]/20 backdrop-blur-xs text-xs font-semibold text-[#D4A373] mb-3 border border-[#D4A373]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>Taller de Repostería Artesanal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-[#FAF8F5]">
            Bienvenido al Taller, {business.ownerName || 'Repostero'}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-2xl">
            Control de insumos, costos exactos por lote y facturación para <strong className="text-[#D4A373]">{business.businessName || 'Dulcinea'}</strong>.
          </p>

          {/* Large Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenSaleModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#D4A373] hover:bg-[#c88a58] text-[#1A2E40] font-bold text-sm shadow-md transition-all cursor-pointer hover:scale-102 active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Registrar Venta</span>
            </button>

            <button
              onClick={onOpenBatchModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1A2E40] hover:bg-[#142433] text-white font-bold text-sm transition-all border border-[#D4A373]/40 shadow-sm cursor-pointer hover:scale-102 active:scale-98"
            >
              <Plus className="w-4 h-4 text-[#D4A373]" />
              <span>Elaborar Lote</span>
            </button>

            <button
              onClick={onOpenCalculator}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs sm:text-sm font-medium transition-all border border-white/10 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-[#D4A373]" />
              <span>Simulador de Costeo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Alert - Compact Card Requirement */}
      {lowStockCount > 0 ? (
        <div className="bg-[#FAF4ED] border border-[#D4A373]/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4A373]/20 text-[#C88A58] flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-[#1A2E40] text-sm">
                ⚠️ {lowStockCount} insumo{lowStockCount > 1 ? 's' : ''} bajo stock
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                Existen materias primas por debajo de su umbral mínimo de seguridad.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToIngredients}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A2E40] hover:bg-[#142433] text-[#FAF8F5] font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <span>Ver lista</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-800">
          <div className="flex items-center gap-2.5">
            <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              Inventario al día: todos los insumos tienen stock por encima del umbral mínimo.
            </span>
          </div>
          <button
            onClick={onNavigateToIngredients}
            className="text-emerald-800 font-bold hover:underline cursor-pointer text-xs"
          >
            Ver insumos
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ingresos por Ventas
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1A2E40] font-mono">
              {formatCurrency(totalSalesRevenue, business.currencySymbol)}
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{sales.length} órdenes registradas</span>
          </p>
        </div>

        {/* Total Cost of Supplies */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Gasto en Insumos (Lotes)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1A2E40] font-mono">
              {formatCurrency(totalProductionCost, business.currencySymbol)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
            <span>Invertido en {batches.length} lotes elaborados</span>
          </p>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Utilidad Neta Real
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#1A2E40]/10 text-[#1A2E40] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1A2E40] font-mono">
              {formatCurrency(totalNetProfit, business.currencySymbol)}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#C88A58] font-bold flex items-center gap-1">
            <span>Ganancia líquida sobre ventas</span>
          </p>
        </div>

        {/* Average Profit Margin */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Margen Promedio
            </span>
            <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1A2E40] font-mono">
              {formatPercent(averageMargin)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {totalUnitsSold} de {totalUnitsProduced} unidades colocadas
          </p>
        </div>
      </div>

      {/* Monthly Cost vs Sales Comparison Chart */}
      <MonthlyComparisonChart
        sales={sales}
        batches={batches}
        business={business}
        onOpenReport={() => {}}
      />

      {/* Low Margin Warning Alert if any */}
      {lowMarginProducts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold text-rose-900">Alerta de Margen Bajo: </span>
            <span className="text-rose-800">
              Hay {lowMarginProducts.length} producto(s) con margen inferior al 40% (
              {lowMarginProducts.map((p) => p.name).join(', ')}). Considera ajustar su precio de venta o revisar el costo de sus insumos.
            </span>
          </div>
        </div>
      )}

      {/* Products Profitability Comparison & Workshop Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Profitability Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-stone-800 font-serif">
                Rentabilidad por Producto del Catálogo
              </h3>
              <p className="text-xs text-stone-500">
                Comparativa directa de costo por porción, precio establecido y ganancia
              </p>
            </div>
            <button
              onClick={onNavigateToCatalog}
              className="text-xs font-bold text-rose-800 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver catálogo</span>
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
                        <div className="font-semibold text-stone-800">{p.name}</div>
                        <span className="text-[10px] text-stone-400">{p.category}</span>
                      </td>
                      <td className="py-3 text-center text-stone-600 font-medium">
                        {p.batchYieldUnits} {p.yieldUnitName}
                      </td>
                      <td className="py-3 text-right font-mono text-stone-700 font-medium">
                        {formatCurrency(metrics.costPerUnit, business.currencySymbol)}
                      </td>
                      <td className="py-3 text-right font-mono text-stone-800 font-bold">
                        {formatCurrency(p.sellingPrice, business.currencySymbol)}
                      </td>
                      <td className="py-3 text-right font-mono text-emerald-700 font-bold">
                        +{formatCurrency(metrics.profitPerUnit, business.currencySymbol)}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isHealthy
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
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
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-800 font-serif flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-rose-700" />
              <span>Últimos Lotes en Taller</span>
            </h3>
            <button
              onClick={onNavigateToWorkshop}
              className="text-[11px] font-bold text-rose-800 hover:text-rose-900 cursor-pointer"
            >
              Ver taller
            </button>
          </div>

          <div className="space-y-3">
            {batches.slice(0, 4).map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col gap-1 hover:border-rose-300 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800 line-clamp-1">{b.productName}</span>
                  <span className="text-[10px] text-stone-400 font-mono">{b.batchCode}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1">
                  <span>
                    {b.totalUnitsProduced} unidades ({b.unitsSold} vendidas)
                  </span>
                  <span className="font-bold text-stone-800 font-mono">
                    Gasto: {formatCurrency(b.totalSuppliesCost, business.currencySymbol)}
                  </span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className="bg-rose-700 h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(100, (b.unitsSold / b.totalUnitsProduced) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {batches.length === 0 && (
              <p className="text-xs text-stone-400 text-center py-6">
                No hay lotes horneados registrados todavía.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
