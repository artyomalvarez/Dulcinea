import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Calculator,
  Flame,
  FileText,
  AlertTriangle,
  Trash2,
  DollarSign,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import {
  BusinessProfile,
  Product,
  ProductionBatch,
  Sale,
  WasteRecord,
} from '../entities';
import {
  formatCurrency,
  formatPercent,
  AnalyticsService,
  CostCalculator,
} from '../shared/lib';
import { MonthlyComparisonChart } from '../widgets/Dashboard/MonthlyComparisonChart';
import { ProfitabilityReportModal } from '../widgets/Dashboard/ProfitabilityReportModal';
import { ProfitabilityCalculatorModal } from '../features/profitability/components/ProfitabilityCalculatorModal';

interface FinancesPageProps {
  products: Product[];
  batches: ProductionBatch[];
  sales: Sale[];
  wastes: WasteRecord[];
  business: BusinessProfile;
  initialSubTab?: 'rentabilidad' | 'costos' | 'mermas';
  onOpenLossSimulator: () => void;
  onDeleteWaste: (id: string) => void;
}

export const FinancesPage: React.FC<FinancesPageProps> = ({
  products,
  batches,
  sales,
  wastes,
  business,
  initialSubTab = 'rentabilidad',
  onOpenLossSimulator,
  onDeleteWaste,
}) => {
  const [subTab, setSubTab] = useState<'rentabilidad' | 'costos' | 'mermas'>(initialSubTab);
  const [isProfitReportOpen, setIsProfitReportOpen] = useState(false);

  React.useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  const metrics = useMemo(() => {
    return AnalyticsService.calculateDashboardMetrics(sales, batches, products, 40, wastes);
  }, [sales, batches, products, wastes]);

  const totalDirectCostLost = useMemo(() => {
    return Math.round(wastes.reduce((acc, w) => acc + (w.directCostLost || 0), 0) * 100) / 100;
  }, [wastes]);

  const totalPotentialRevenueLost = useMemo(() => {
    return (
      Math.round(wastes.reduce((acc, w) => acc + (w.potentialRevenueLost || 0), 0) * 100) / 100
    );
  }, [wastes]);

  return (
    <div className="space-y-6 pb-12">
      {/* Sub-navigation bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-dulcinea-copper/25 shadow-sm">
        <div className="flex items-center bg-dulcinea-cream/55 p-1 rounded-xl overflow-x-auto">
          <button
            onClick={() => setSubTab('rentabilidad')}
            className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              subTab === 'rentabilidad'
                ? 'bg-white text-dulcinea-midnight shadow-sm'
                : 'text-dulcinea-muted hover:text-dulcinea-midnight'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-dulcinea-copper" />
            <span>Rentabilidad y Flujo</span>
          </button>

          <button
            onClick={() => setSubTab('costos')}
            className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              subTab === 'costos'
                ? 'bg-white text-dulcinea-midnight shadow-sm'
                : 'text-dulcinea-muted hover:text-dulcinea-midnight'
            }`}
          >
            <Calculator className="w-4 h-4 text-dulcinea-copper" />
            <span>Simulador de Costeo</span>
          </button>

          <button
            onClick={() => setSubTab('mermas')}
            className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              subTab === 'mermas'
                ? 'bg-white text-dulcinea-midnight shadow-sm'
                : 'text-dulcinea-muted hover:text-dulcinea-midnight'
            }`}
          >
            <Flame className="w-4 h-4 text-dulcinea-cherry" />
            <span>Mermas y Pérdidas</span>
            {wastes.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-dulcinea-cherry/15 text-dulcinea-cherry font-mono">
                {wastes.length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={() => setIsProfitReportOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-dulcinea-midnight hover:bg-[#142433] text-dulcinea-cream font-bold text-xs transition-all cursor-pointer shadow-2xs"
        >
          <FileText className="w-3.5 h-3.5 text-dulcinea-copper" />
          <span>Reporte PDF Detallado</span>
        </button>
      </div>

      {/* Tab 1: Rentabilidad y Flujo */}
      {subTab === 'rentabilidad' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs font-bold text-dulcinea-muted uppercase tracking-wider block">
                Ingresos Totales
              </span>
              <div className="mt-2 text-2xl font-bold font-mono text-dulcinea-midnight">
                {formatCurrency(metrics.totalSalesRevenue, business.currencySymbol)}
              </div>
              <span className="text-xs text-dulcinea-success font-semibold mt-1 block">
                {sales.length} ventas registradas
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs font-bold text-dulcinea-muted uppercase tracking-wider block">
                Costo de Producción
              </span>
              <div className="mt-2 text-2xl font-bold font-mono text-dulcinea-midnight">
                {formatCurrency(metrics.totalProductionCost, business.currencySymbol)}
              </div>
              <span className="text-xs text-dulcinea-muted mt-1 block">
                {batches.length} lotes horneados
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs">
              <span className="text-xs font-bold text-dulcinea-cherry uppercase tracking-wider block">
                Mermas Descontadas
              </span>
              <div className="mt-2 text-2xl font-bold font-mono text-dulcinea-cherry">
                -{formatCurrency(metrics.totalLossCost, business.currencySymbol)}
              </div>
              <span className="text-xs text-rose-600 mt-1 block">
                {metrics.totalLossCount} eventos registrados
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-dulcinea-copper/35 shadow-xs">
              <span className="text-xs font-bold text-dulcinea-muted uppercase tracking-wider block">
                Utilidad Neta Real
              </span>
              <div className="mt-2 text-2xl font-bold font-mono text-dulcinea-midnight">
                {formatCurrency(metrics.netProfitWithLoss, business.currencySymbol)}
              </div>
              <span className="text-xs text-dulcinea-success font-bold mt-1 flex items-center gap-1">
                <Percent className="w-3 h-3" />
                Margen neto: {formatPercent(metrics.marginWithLoss)}
              </span>
            </div>
          </div>

          <MonthlyComparisonChart
            sales={sales}
            batches={batches}
            wastes={wastes}
            business={business}
            onOpenReport={() => setIsProfitReportOpen(true)}
          />

          {/* Análisis de Margen por Producto */}
          <div className="bg-white rounded-2xl border border-dulcinea-copper/25 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-dulcinea-midnight font-serif">
                  Análisis de Rentabilidad por Producto
                </h3>
                <p className="text-xs text-dulcinea-muted">
                  Productos ordenados por margen de ganancia. Se resaltan en alerta los que están por debajo del 40%.
                </p>
              </div>
              {metrics.lowMarginProducts.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dulcinea-cherry/10 text-dulcinea-cherry text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{metrics.lowMarginProducts.length} con margen bajo (&lt; 40%)</span>
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3 text-right">Costo Lote</th>
                    <th className="py-2.5 px-3 text-right">Costo / U</th>
                    <th className="py-2.5 px-3 text-right">Precio Venta</th>
                    <th className="py-2.5 px-3 text-right">Utilidad / U</th>
                    <th className="py-2.5 px-3 text-right">Margen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((p) => {
                    const pm = CostCalculator.calculateProductMetrics(p);
                    const isLow = pm.profitMarginPercent < 40;
                    return (
                      <tr key={p.id} className={isLow ? 'bg-rose-50/40' : 'hover:bg-stone-50'}>
                        <td className="py-3 px-3">
                          <div className="font-bold text-dulcinea-midnight">{p.name}</div>
                          <span className="text-[10px] text-dulcinea-muted">{p.category}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-stone-700">
                          {formatCurrency(pm.totalBatchCost, business.currencySymbol)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-stone-700">
                          {formatCurrency(pm.costPerUnit, business.currencySymbol)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-dulcinea-midnight">
                          {formatCurrency(p.sellingPrice, business.currencySymbol)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-dulcinea-success">
                          +{formatCurrency(pm.profitPerUnit, business.currencySymbol)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                              isLow
                                ? 'bg-dulcinea-cherry/15 text-dulcinea-cherry border border-dulcinea-cherry/30'
                                : 'bg-emerald-50 text-dulcinea-success border border-emerald-200'
                            }`}
                          >
                            {formatPercent(pm.profitMarginPercent)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Simulador de Costeo */}
      {subTab === 'costos' && (
        <div className="bg-white rounded-2xl border border-dulcinea-copper/25 p-5 sm:p-6 shadow-sm">
          <ProfitabilityCalculatorModal
            business={business}
            products={products}
            isStandaloneTab={true}
          />
        </div>
      )}

      {/* Tab 3: Mermas y Pérdidas */}
      {subTab === 'mermas' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-dulcinea-copper/25 shadow-sm">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-dulcinea-midnight font-serif">
                Mermas y Pérdidas del Taller
              </h2>
              <p className="text-xs sm:text-sm text-dulcinea-muted mt-0.5">
                Diferenciamos claramente el dinero invertido perdido en insumos respecto a los ingresos potenciales no cobrados para evitar doble contabilización.
              </p>
            </div>
            <button
              onClick={onOpenLossSimulator}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dulcinea-cherry hover:bg-[#a02c20] text-white font-bold text-xs sm:text-sm shadow-sm cursor-pointer shrink-0"
            >
              <Flame className="w-4 h-4" />
              <span>Abrir Simulador y Registrar Merma</span>
            </button>
          </div>

          {/* Separated Loss Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-dulcinea-cherry uppercase tracking-wider">
                  Costo Directo Perdido
                </span>
                <DollarSign className="w-4 h-4 text-dulcinea-cherry" />
              </div>
              <div className="text-2xl font-bold font-mono text-rose-900">
                {formatCurrency(totalDirectCostLost, business.currencySymbol)}
              </div>
              <p className="text-[11px] text-rose-700">
                Dinero real salido de caja en ingredientes y materiales desperdiciados. Este valor se descuenta de tu utilidad neta.
              </p>
            </div>

            <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Venta Potencial No Realizada
                </span>
                <ShieldAlert className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-900">
                {formatCurrency(totalPotentialRevenueLost, business.currencySymbol)}
              </div>
              <p className="text-[11px] text-amber-800">
                Ingreso bruto que no se pudo cobrar al cliente por productos terminados dañados. (No se suma al costo directo).
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-dulcinea-muted uppercase tracking-wider">
                  Incidentes Registrados
                </span>
                <Flame className="w-4 h-4 text-dulcinea-copper" />
              </div>
              <div className="text-2xl font-bold font-mono text-dulcinea-midnight">
                {wastes.length} registros
              </div>
              <p className="text-[11px] text-dulcinea-muted">
                Incluye productos quemados, rotos y mermas de materias primas.
              </p>
            </div>
          </div>

          {/* Waste History Table */}
          <div className="bg-white rounded-2xl border border-dulcinea-copper/25 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px]">
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Producto / Insumo</th>
                    <th className="py-3 px-4 text-center">Cantidad</th>
                    <th className="py-3 px-4 text-right">Costo Directo</th>
                    <th className="py-3 px-4 text-right">Venta Perdida</th>
                    <th className="py-3 px-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {wastes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-dulcinea-muted">
                        No hay mermas ni pérdidas registradas.
                      </td>
                    </tr>
                  ) : (
                    wastes.map((w) => (
                      <tr key={w.id} className="hover:bg-stone-50">
                        <td className="py-3 px-4 font-mono text-stone-500">{w.date}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-dulcinea-cream text-dulcinea-midnight">
                            {w.type === 'producto_danado'
                              ? 'Producto Dañado'
                              : w.type === 'insumo_vencido'
                              ? 'Insumo Perdido'
                              : 'Merma Proceso'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-dulcinea-midnight">{w.itemName}</div>
                          {w.notes && <span className="text-[10px] text-dulcinea-muted">{w.notes}</span>}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {w.quantity} {w.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-dulcinea-cherry">
                          -{formatCurrency(w.directCostLost, business.currencySymbol)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-amber-700">
                          {w.potentialRevenueLost > 0
                            ? formatCurrency(w.potentialRevenueLost, business.currencySymbol)
                            : '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => onDeleteWaste(w.id)}
                            title="Eliminar registro de merma"
                            className="p-1.5 text-stone-400 hover:text-dulcinea-cherry cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ProfitabilityReportModal
        isOpen={isProfitReportOpen}
        onClose={() => setIsProfitReportOpen(false)}
        sales={sales}
        batches={batches}
        products={products}
        business={business}
      />
    </div>
  );
};
