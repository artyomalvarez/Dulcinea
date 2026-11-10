import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  X,
  Cake
} from 'lucide-react';
import { BusinessProfile, Product, ProductionBatch, Sale } from '../../entities';
import {
  formatCurrency,
  formatPercent,
  AnalyticsService,
  CostCalculator
} from '../../shared/lib';

interface ProfitabilityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales: Sale[];
  batches: ProductionBatch[];
  products: Product[];
  business: BusinessProfile;
}

export const ProfitabilityReportModal: React.FC<ProfitabilityReportModalProps> = ({
  isOpen,
  onClose,
  sales,
  batches,
  products,
  business,
}) => {
  const [costBasis, setCostBasis] = useState<'lotes' | 'ventas'>('lotes');

  // Group monthly consolidated data via AnalyticsService
  const monthlyData = useMemo(() => {
    return AnalyticsService.groupMonthlyProfitability(sales, batches, costBasis, true);
  }, [sales, batches, costBasis]);

  // Aggregate totals
  const totalSales = monthlyData.reduce((acc, m) => acc + m.ventasTotales, 0);
  const totalCosts = monthlyData.reduce((acc, m) => acc + m.costosTotales, 0);
  const totalProfit = totalSales - totalCosts;
  const averageMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
  const totalUnitsSold = monthlyData.reduce((acc, m) => acc + m.unidadesVendidas, 0);
  const totalBatchesCount = monthlyData.reduce((acc, m) => acc + m.lotesElaborados, 0);

  // Per-product performance consolidation via AnalyticsService
  const productPerformance = useMemo(() => {
    return AnalyticsService.calculateProductPerformance(products, sales);
  }, [products, sales]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const periodLabel =
    monthlyData.length > 0
      ? `${monthlyData[0].label} – ${monthlyData[monthlyData.length - 1].label}`
      : 'Consolidado Histórico';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-2 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Top Bar (Hidden during Print) */}
        <div className="px-6 py-3.5 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-3 no-print shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-stone-100 font-serif">
                Reporte Resumen de Rentabilidad (PDF)
              </span>
              <p className="text-[11px] text-stone-400">Consolidado mensual de ventas y costos</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Basis selector */}
            <div className="hidden sm:flex items-center bg-stone-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setCostBasis('lotes')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  costBasis === 'lotes' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                Insumos Lotes
              </button>
              <button
                onClick={() => setCostBasis('ventas')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  costBasis === 'ventas' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                Costo Mercancía
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-md cursor-pointer"
              title="Descargar como PDF o Imprimir en papel"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Reporte en PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Container */}
        <div className="p-8 sm:p-12 overflow-y-auto printable-report bg-white text-gray-800 text-xs space-y-6">
          
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-amber-800/20">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-700 text-white flex items-center justify-center font-bold shadow-xs">
                  <Cake className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-stone-900 font-serif tracking-tight">
                    {(business.businessName || 'Dulcinea')
                      .replace(/Dulce Canela/gi, 'Dulcinea')
                      .replace(/DulceCosto/gi, 'Dulcinea')}
                  </h1>
                  <p className="text-xs text-rose-900 font-medium">
                    {business.tagline || 'Taller de Repostería y Pastelería Artesanal'}
                  </p>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-gray-500 space-y-0.5">
                <div>
                  <strong>NIT / ID Fiscal:</strong> {business.taxId} | <strong>Titular:</strong> {business.ownerName}
                </div>
                <div>
                  <strong>Ubicación:</strong> {business.address}, {business.city}
                </div>
                <div>
                  <strong>Contacto:</strong> {business.phone} | {business.email}
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 sm:min-w-64 space-y-1">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest block">
                Informe Ejecutivo
              </span>
              <div className="text-base font-extrabold text-gray-900 font-serif">
                Resumen de Rentabilidad
              </div>
              <div className="text-[11px] text-gray-600 pt-1 space-y-0.5">
                <div>
                  <strong>Período:</strong> {periodLabel}
                </div>
                <div>
                  <strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div>
                  <strong>Moneda:</strong> {business.currencySymbol} ({business.currencyCode})
                </div>
              </div>
            </div>
          </div>

          {/* Consolidated Executive KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 page-break-inside-avoid">
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Ventas Totales
              </span>
              <div className="text-lg sm:text-xl font-extrabold text-gray-900 font-mono mt-0.5">
                {formatCurrency(totalSales, business.currencySymbol)}
              </div>
              <span className="text-[10px] text-gray-500 block mt-0.5">{totalUnitsSold} unidades vendidas</span>
            </div>

            <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-200 text-center">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                Costos Totales
              </span>
              <div className="text-lg sm:text-xl font-extrabold text-rose-700 font-mono mt-0.5">
                {formatCurrency(totalCosts, business.currencySymbol)}
              </div>
              <span className="text-[10px] text-rose-800 block mt-0.5">{totalBatchesCount} tandas/lotes</span>
            </div>

            <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200 text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Utilidad Neta Real
              </span>
              <div className="text-lg sm:text-xl font-extrabold text-emerald-700 font-mono mt-0.5">
                +{formatCurrency(totalProfit, business.currencySymbol)}
              </div>
              <span className="text-[10px] text-emerald-800 block mt-0.5">Ganancia líquida</span>
            </div>

            <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200 text-center">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                Margen Promedio
              </span>
              <div className="text-lg sm:text-xl font-extrabold text-amber-900 font-mono mt-0.5">
                {formatPercent(averageMargin)}
              </div>
              <span className="text-[10px] text-amber-800 block mt-0.5">Utilidad / Ventas</span>
            </div>
          </div>

          {/* Section 1: Monthly Consolidated Table */}
          <div className="space-y-3 page-break-inside-avoid">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 font-serif flex items-center gap-1.5">
                <span>1. Comparativa Mensual Consolidada (Costos vs. Ventas)</span>
              </h2>
              <span className="text-[10px] text-gray-500 italic">
                Base de costeo: {costBasis === 'lotes' ? 'Gasto total de insumos en lotes' : 'Costo de insumos en ventas'}
              </span>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-amber-50/60 border-b border-amber-200 text-gray-700 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Mes / Período</th>
                    <th className="py-2.5 px-3 text-center">Lotes</th>
                    <th className="py-2.5 px-3 text-center">Unidades</th>
                    <th className="py-2.5 px-3 text-right">Costos Totales</th>
                    <th className="py-2.5 px-3 text-right">Ventas Totales</th>
                    <th className="py-2.5 px-3 text-right">Utilidad Neta</th>
                    <th className="py-2.5 px-3 text-right">Margen (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {monthlyData.map((m) => (
                    <tr key={m.key} className="hover:bg-gray-50/50">
                      <td className="py-2 px-3 font-semibold text-gray-900">{m.label}</td>
                      <td className="py-2 px-3 text-center font-mono text-gray-600">{m.lotesElaborados}</td>
                      <td className="py-2 px-3 text-center font-mono text-gray-600">{m.unidadesVendidas}</td>
                      <td className="py-2 px-3 text-right font-mono text-rose-700 font-medium">
                        {formatCurrency(m.costosTotales, business.currencySymbol)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-gray-900">
                        {formatCurrency(m.ventasTotales, business.currencySymbol)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                        +{formatCurrency(m.utilidadNeta, business.currencySymbol)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-gray-800">
                        {formatPercent(m.margenPorcentaje)}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-gray-100/80 font-bold border-t-2 border-gray-300">
                    <td className="py-2.5 px-3 text-gray-900">TOTAL PERÍODO</td>
                    <td className="py-2.5 px-3 text-center font-mono">{totalBatchesCount}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{totalUnitsSold}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                      {formatCurrency(totalCosts, business.currencySymbol)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-900">
                      {formatCurrency(totalSales, business.currencySymbol)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                      +{formatCurrency(totalProfit, business.currencySymbol)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-900">
                      {formatPercent(averageMargin)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Product Profitability Breakdown */}
          <div className="space-y-3 page-break-inside-avoid">
            <h2 className="text-sm font-bold text-gray-900 font-serif">
              2. Desglose de Rentabilidad por Producto de Repostería
            </h2>

            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-amber-50/60 border-b border-amber-200 text-gray-700 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3">Categoría</th>
                    <th className="py-2.5 px-3 text-center">Rendimiento</th>
                    <th className="py-2.5 px-3 text-right">Costo / U</th>
                    <th className="py-2.5 px-3 text-right">Precio Venta</th>
                    <th className="py-2.5 px-3 text-right">Utilidad / U</th>
                    <th className="py-2.5 px-3 text-right">Margen</th>
                    <th className="py-2.5 px-3 text-center">Vendidos</th>
                    <th className="py-2.5 px-3 text-right">Ganancia Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productPerformance.map(({ product: p, unitsSold, profit }) => {
                    const metrics = CostCalculator.calculateProductMetrics(p);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="py-2 px-3 font-semibold text-gray-900">{p.name}</td>
                        <td className="py-2 px-3 text-gray-600">{p.category}</td>
                        <td className="py-2 px-3 text-center text-gray-600 font-mono">
                          {p.batchYieldUnits} {p.yieldUnitName}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-gray-600">
                          {formatCurrency(metrics.costPerUnit, business.currencySymbol)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-gray-900">
                          {formatCurrency(p.sellingPrice, business.currencySymbol)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                          +{formatCurrency(metrics.profitPerUnit, business.currencySymbol)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-amber-900">
                          {formatPercent(metrics.profitMarginPercent)}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-gray-800">
                          {unitsSold}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                          +{formatCurrency(profit, business.currencySymbol)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Formulas and Didactic Verification Note */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 text-[11px] text-gray-700 space-y-1.5 page-break-inside-avoid leading-relaxed">
            <span className="font-bold text-amber-950 block text-xs">
              Notas y Metodología de Cálculo Financiero:
            </span>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <strong>Costo por Unidad:</strong> Determinado dividiendo el gasto total de insumos e insumos directos entre el rendimiento real de unidades o porciones de cada lote (Gasto en Insumos ÷ Unidades Obtenidas).
              </li>
              <li>
                <strong>Utilidad Neta:</strong> Excedente resultante de restar el costo total de materias primas al precio final de venta cobrado (Venta - Costo).
              </li>
              <li>
                <strong>Margen de Ganancia:</strong> Proporción de la venta que representa utilidad líquida ((Utilidad ÷ Venta) × 100).
              </li>
            </ul>
          </div>

          {/* Signature and Approval Block */}
          <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-6 page-break-inside-avoid">
            <div className="text-center sm:text-left space-y-1">
              <div className="border-b border-gray-300 w-52 mb-1"></div>
              <span className="font-bold text-gray-800">{business.ownerName}</span>
              <p className="text-[10px] text-gray-400">Responsable de Producción y Costeo</p>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <div className="border-b border-gray-300 w-52 mb-1"></div>
              <span className="font-bold text-stone-800">Administración y Finanzas</span>
              <p className="text-[10px] text-stone-400">
                {(business.businessName || 'Dulcinea')
                  .replace(/Dulce Canela/gi, 'Dulcinea')
                  .replace(/DulceCosto/gi, 'Dulcinea')}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
