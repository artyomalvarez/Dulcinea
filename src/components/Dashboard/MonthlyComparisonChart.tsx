import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  DollarSign,
  ArrowUpRight,
  Package,
  Layers,
  Sparkles,
  Info,
  FileText
} from 'lucide-react';
import { BusinessProfile, ProductionBatch, Sale } from '../../types/bakery';
import { formatCurrency, formatPercent } from '../../utils/units';
import { AnalyticsService, MonthlyProfitabilityPoint } from '../../domain/services/AnalyticsService';

interface MonthlyComparisonChartProps {
  sales: Sale[];
  batches: ProductionBatch[];
  business: BusinessProfile;
  onOpenReport?: () => void;
}

type MonthlyDataPoint = MonthlyProfitabilityPoint;

export const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({
  sales,
  batches,
  business,
  onOpenReport,
}) => {
  const [chartType, setChartType] = useState<'barras' | 'area'>('barras');
  const [costBasis, setCostBasis] = useState<'lotes' | 'ventas'>('lotes');

  // Process and group monthly data via AnalyticsService
  const monthlyData: MonthlyDataPoint[] = useMemo(() => {
    return AnalyticsService.groupMonthlyProfitability(sales, batches, costBasis, false);
  }, [sales, batches, costBasis]);

  // Overall totals in the period
  const totalPeriodSales = monthlyData.reduce((acc, m) => acc + m.ventasTotales, 0);
  const totalPeriodCosts = monthlyData.reduce((acc, m) => acc + m.costosTotales, 0);
  const totalPeriodProfit = totalPeriodSales - totalPeriodCosts;
  const averagePeriodMargin =
    totalPeriodSales > 0 ? (totalPeriodProfit / totalPeriodSales) * 100 : 0;

  // Best month
  const bestMonth = [...monthlyData].sort((a, b) => b.ventasTotales - a.ventasTotales)[0];

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as MonthlyDataPoint;
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-amber-200/80 text-xs min-w-56 space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
            <span className="font-bold text-gray-900 font-serif text-sm">{label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                data.utilidadNeta >= 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              Margen: {formatPercent(data.margenPorcentaje)}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                <span>Ventas Totales:</span>
              </span>
              <span className="font-mono font-bold text-gray-950">
                {formatCurrency(data.ventasTotales, business.currencySymbol)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Costos Totales:</span>
              </span>
              <span className="font-mono font-bold text-rose-700">
                {formatCurrency(data.costosTotales, business.currencySymbol)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>Utilidad Neta:</span>
              </span>
              <span className="font-mono font-bold text-emerald-700">
                +{formatCurrency(data.utilidadNeta, business.currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 font-serif">
                Comparativa Mensual: Costos Totales vs Ventas
              </h3>
              <p className="text-xs text-gray-500">
                Evolución histórica mes a mes de ingresos por ventas frente al gasto en materias primas y utilidades
              </p>
            </div>
          </div>
        </div>

        {/* View toggles & filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Basis selector */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setCostBasis('lotes')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                costBasis === 'lotes'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Compara ventas con el total de insumos invertidos en lotes horneados"
            >
              Insumos de Lotes
            </button>
            <button
              onClick={() => setCostBasis('ventas')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                costBasis === 'ventas'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Compara ventas con el costo de insumos de los productos vendidos"
            >
              Costo de Ventas
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-amber-50 p-1 rounded-xl text-xs border border-amber-200/60">
            <button
              onClick={() => setChartType('barras')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                chartType === 'barras'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              Barras
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                chartType === 'area'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              Área
            </button>
          </div>

          {/* Download PDF Report button */}
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Descargar reporte resumen consolidado en PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Reporte PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Mini KPI Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-r from-amber-50/70 via-stone-50/50 to-rose-50/70 p-3.5 rounded-2xl border border-amber-200/50 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 block">
            Ventas Acumuladas
          </span>
          <span className="text-sm sm:text-base font-bold text-gray-900 font-mono mt-0.5 block">
            {formatCurrency(totalPeriodSales, business.currencySymbol)}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 block">
            Costos Acumulados
          </span>
          <span className="text-sm sm:text-base font-bold text-rose-700 font-mono mt-0.5 block">
            {formatCurrency(totalPeriodCosts, business.currencySymbol)}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">
            Utilidad Neta Total
          </span>
          <span className="text-sm sm:text-base font-bold text-emerald-700 font-mono mt-0.5 block">
            +{formatCurrency(totalPeriodProfit, business.currencySymbol)}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 block">
            Mes con Mayor Venta
          </span>
          <span className="text-xs sm:text-sm font-bold text-amber-900 mt-0.5 block truncate">
            {bestMonth ? `${bestMonth.label} (${formatCurrency(bestMonth.ventasTotales, business.currencySymbol)})` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="h-72 sm:h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'barras' ? (
            <ComposedChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tick={{ fontSize: 11, fill: '#6b7280' }}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={(val) => `${business.currencySymbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                formatter={(value) => {
                  if (value === 'ventasTotales') return 'Ventas Totales';
                  if (value === 'costosTotales') return 'Costos Totales';
                  if (value === 'utilidadNeta') return 'Utilidad Neta (Línea)';
                  return value;
                }}
              />
              {/* Bars: Ventas vs Costos */}
              <Bar
                dataKey="ventasTotales"
                name="ventasTotales"
                fill="#d97706"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                dataKey="costosTotales"
                name="costosTotales"
                fill="#f43f5e"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
              {/* Line: Utilidad Neta */}
              <Line
                type="monotone"
                dataKey="utilidadNeta"
                name="utilidadNeta"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          ) : (
            <AreaChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorCostos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorUtilidad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tick={{ fontSize: 11, fill: '#6b7280' }}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={(val) => `${business.currencySymbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                formatter={(value) => {
                  if (value === 'ventasTotales') return 'Ventas Totales';
                  if (value === 'costosTotales') return 'Costos Totales';
                  if (value === 'utilidadNeta') return 'Utilidad Neta';
                  return value;
                }}
              />
              <Area
                type="monotone"
                dataKey="ventasTotales"
                name="ventasTotales"
                stroke="#d97706"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorVentas)"
              />
              <Area
                type="monotone"
                dataKey="costosTotales"
                name="costosTotales"
                stroke="#f43f5e"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCostos)"
              />
              <Area
                type="monotone"
                dataKey="utilidadNeta"
                name="utilidadNeta"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorUtilidad)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Explanatory footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100 gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>
            {costBasis === 'lotes'
              ? 'Los costos reflejan el gasto en insumos invertido en cada lote horneado en el mes seleccionado.'
              : 'Los costos reflejan el costo de las materias primas correspondientes a los productos efectivamente vendidos.'}
          </span>
        </div>
        <span className="font-medium text-amber-900">
          Margen Promedio Histórico: <strong>{formatPercent(averagePeriodMargin)}</strong>
        </span>
      </div>
    </div>
  );
};
