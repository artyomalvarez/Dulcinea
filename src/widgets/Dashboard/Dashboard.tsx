import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
  AlertTriangle,
  Receipt,
  Plus,
  HelpCircle,
  Percent,
  ChefHat,
  FileText,
  BellRing,
  AlertOctagon,
  ShoppingCart,
  Copy,
  Check,
  PackageCheck,
  ArrowRight
} from 'lucide-react';
import { BusinessProfile, Product, ProductionBatch, Sale, Ingredient } from '../../entities';
import {
  formatCurrency,
  formatPercent,
  CostCalculator,
  StockService,
  AnalyticsService
} from '../../shared/lib';
import { MonthlyComparisonChart } from './MonthlyComparisonChart';
import { ProfitabilityReportModal } from './ProfitabilityReportModal';

interface DashboardProps {
  products: Product[];
  batches: ProductionBatch[];
  sales: Sale[];
  ingredients?: Ingredient[];
  business: BusinessProfile;
  onNavigateTab: (tab: any) => void;
  onNewBatch: () => void;
  onNewSale: () => void;
  onOpenCalculator: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  products,
  batches,
  sales,
  ingredients = [],
  business,
  onNavigateTab,
  onNewBatch,
  onNewSale,
  onOpenCalculator,
}) => {
  // Modal State for Profitability PDF Report
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [copiedShoppingList, setCopiedShoppingList] = useState(false);

  // Low stock ingredients & shopping list via StockService
  const { items: shoppingListItems, totalEstimatedRestockCost } =
    StockService.buildShoppingList(ingredients);
  const lowStockIngredients = shoppingListItems.map((it) => it.ingredient);

  // Handle copy shopping list to clipboard
  const handleCopyShoppingList = () => {
    if (shoppingListItems.length === 0) return;

    const dateStr = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    let text = `🛒 LISTA DE COMPRAS - ${business.businessName || 'Mi Repostería'}\n`;
    text += `Fecha: ${dateStr}\n`;
    text += `Insumos críticos con bajo stock (${shoppingListItems.length} ítems):\n`;
    text += `--------------------------------------------------\n\n`;

    shoppingListItems.forEach((item, idx) => {
      const {
        ingredient: ing,
        currentStock: current,
        minStockAlert: min,
        deficit,
        packagesNeeded,
        estimatedCost: cost,
      } = item;
      const pkgQty = ing.purchasePackageQuantity || 1;
      const unitStr = ing.purchasePackageUnit;

      text += `${idx + 1}. ${ing.name} [${ing.category || 'General'}]\n`;
      text += `   - Stock actual: ${current.toLocaleString()} ${unitStr}\n`;
      text += `   - Mínimo requerido: ${min.toLocaleString()} ${unitStr}\n`;
      text += `   - Faltante para umbral: ${deficit.toLocaleString()} ${unitStr}\n`;
      text += `   - Sugerencia de compra: ${packagesNeeded} paquete(s) de ${pkgQty} ${unitStr} (Aprox. ${formatCurrency(cost, business.currencySymbol)})\n\n`;
    });

    text += `--------------------------------------------------\n`;
    text += `Presupuesto estimado de reposición: ${formatCurrency(totalEstimatedRestockCost, business.currencySymbol)}\n`;

    navigator.clipboard.writeText(text);
    setCopiedShoppingList(true);
    setTimeout(() => setCopiedShoppingList(false), 3000);
  };

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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-rose-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <ChefHat className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-medium text-amber-100 mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Sistema Integral de Costeo y Rentabilidad</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
            Bienvenido al Taller, {business.ownerName || 'Repostero'}
          </h2>
          <p className="mt-2 text-sm text-amber-100 leading-relaxed max-w-2xl">
            Monitorea el costo real de tus ingredientes por porción, calcula utilidades netas exactas y emite facturas profesionales para tus clientes.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={onNewSale}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-amber-900 font-bold text-xs sm:text-sm hover:bg-amber-50 transition-all shadow-md cursor-pointer hover:scale-102"
            >
              <ShoppingBag className="w-4 h-4 text-amber-700" />
              <span>Registrar Venta</span>
            </button>
            <button
              onClick={onNewBatch}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-900/60 hover:bg-amber-900/80 text-white font-medium text-xs sm:text-sm transition-all border border-amber-300/30 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Elaborar Nuevo Lote</span>
            </button>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-950 text-amber-200 font-bold text-xs sm:text-sm transition-all border border-amber-300/40 cursor-pointer shadow-md"
              title="Descargar reporte resumen consolidado de rentabilidad en PDF"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>Descargar Reporte PDF</span>
            </button>
            <button
              onClick={onOpenCalculator}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm transition-all border border-white/20 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-200" />
              <span>¿Cómo se calculan mis costos?</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Ingresos por Ventas
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalSalesRevenue, business.currencySymbol)}
            </span>
            <span className="text-xs text-gray-400">subtotal</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{sales.length} órdenes registradas</span>
          </p>
        </div>

        {/* Total Cost of Supplies */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Gasto en Insumos (Lotes)
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalProductionCost, business.currencySymbol)}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
            <span>Invertido en {batches.length} lotes de producción</span>
          </p>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Utilidad Neta Real
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-900">
              {formatCurrency(totalNetProfit, business.currencySymbol)}
            </span>
          </div>
          <p className="mt-1 text-xs text-amber-800 font-semibold flex items-center gap-1">
            <span>Ganancia líquida sobre ventas realizadas</span>
          </p>
        </div>

        {/* Average Profit Margin */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Margen Promedio
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatPercent(averageMargin)}
            </span>
            <span className="text-xs text-gray-400">utilidad / venta</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {totalUnitsSold} de {totalUnitsProduced} unidades colocadas
          </p>
        </div>
      </div>

      {/* Low Stock Notification System */}
      {lowStockIngredients.length > 0 ? (
        <div className="bg-gradient-to-br from-amber-50 via-rose-50/50 to-orange-50 border-2 border-amber-300/80 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-200/70">
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md animate-pulse">
                  <BellRing className="w-5 h-5" />
                </div>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs border-2 border-white">
                  {lowStockIngredients.length}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-gray-900 font-serif">
                    Alerta de Compras: {lowStockIngredients.length} insumo{lowStockIngredients.length > 1 ? 's' : ''} bajo el stock mínimo
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase tracking-wide border border-rose-200">
                    Reabastecimiento Urgente
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  Las existencias actuales no alcanzan el umbral de seguridad fijado para tus recetas. Genera la lista de compras o actualiza tus compras.
                </p>
              </div>
            </div>

            {/* Actions: Copy shopping list and go to ingredients */}
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <button
                onClick={handleCopyShoppingList}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100/60 text-amber-900 text-xs font-bold transition-all border border-amber-300 shadow-xs cursor-pointer active:scale-95"
                title="Copiar lista de compras detallada con faltantes al portapapeles"
              >
                {copiedShoppingList ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">¡Lista Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-700" />
                    <span>Copiar Lista de Compras</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onNavigateTab('ingredients')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-102"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Gestionar en Insumos</span>
                <ArrowRight className="w-3 h-3 opacity-70" />
              </button>
            </div>
          </div>

          {/* Cards for each low stock ingredient */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shoppingListItems.map((item) => {
              const {
                ingredient: ing,
                currentStock: current,
                minStockAlert: min,
                deficit,
                packagesNeeded,
                estimatedCost,
                percentOfMin,
              } = item;
              const pkgQty = ing.purchasePackageQuantity || 1;
              const unitStr = ing.purchasePackageUnit;

              return (
                <div
                  key={ing.id}
                  className="bg-white/95 rounded-xl p-3.5 border border-amber-200 shadow-xs flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1.5 mb-1.5">
                      <div>
                        <div className="font-bold text-gray-900 text-xs line-clamp-1 group-hover:text-amber-800 transition-colors">
                          {ing.name}
                        </div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200/60">
                          {ing.category || 'General'}
                        </span>
                      </div>
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                        {percentOfMin}% del mínimo
                      </span>
                    </div>

                    {/* Stock level bar */}
                    <div className="my-2 space-y-1">
                      <div className="flex justify-between text-[11px] text-gray-600">
                        <span>
                          Stock: <strong className="text-rose-700 font-bold">{current.toLocaleString()}</strong> / {min.toLocaleString()} {unitStr}
                        </span>
                        <span className="text-rose-600 font-bold">
                          Faltan {deficit.toLocaleString()} {unitStr}
                        </span>
                      </div>
                      <div className="w-full bg-rose-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-rose-500 to-amber-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentOfMin}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Restock suggestion */}
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="text-gray-600">
                      Comprar: <strong>{packagesNeeded} paq.</strong> ({pkgQty} {unitStr})
                    </span>
                    <span className="font-bold text-amber-900 font-mono">
                      ~{formatCurrency(estimatedCost, business.currencySymbol)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-3 pt-3 border-t border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-900 font-medium">
            <span className="flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>
                Presupuesto estimado total de reposición:{' '}
                <strong className="font-bold font-mono text-sm text-gray-900">
                  {formatCurrency(totalEstimatedRestockCost, business.currencySymbol)}
                </strong>
              </span>
            </span>
            <button
              onClick={() => onNavigateTab('ingredients')}
              className="text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer text-[11px]"
            >
              Configurar o editar alertas de stock en el módulo de Insumos &rarr;
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-emerald-950 text-sm">
                Inventario de Insumos en Óptimas Condiciones
              </span>
              <p className="text-emerald-800 text-xs mt-0.5">
                Todos tus ingredientes con umbral configurado cuentan con existencias suficientes para la producción.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('ingredients')}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100/50 text-emerald-800 font-bold border border-emerald-300 shadow-2xs transition-all cursor-pointer"
          >
            Ver inventario de insumos
          </button>
        </div>
      )}

      {/* Monthly Cost vs Sales Comparison Chart (Recharts) */}
      <MonthlyComparisonChart
        sales={sales}
        batches={batches}
        business={business}
        onOpenReport={() => setIsReportModalOpen(true)}
      />

      {/* Educational Formula Card: Direct reference to user example */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-wider">
                Cálculo Didáctico de Costeo
              </span>
              <span className="text-xs text-amber-800 font-semibold">Ejemplo Real del Taller</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 font-serif">
              ¿Cómo calcula el sistema tu costo por unidad y tu ganancia?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Si elaboras <strong className="text-gray-900">3 bandejas de 5 galletas (15 unidades en total)</strong> e invertiste <strong className="text-amber-800">{formatCurrency(75, business.currencySymbol)} en insumos</strong>:
            </p>
          </div>
          <button
            onClick={onOpenCalculator}
            className="self-start md:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Abrir Simulador Interactivo</span>
          </button>
        </div>

        {/* Step-by-step formula breakdown boxes */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-amber-200/60 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase">1. Costo Unitario</span>
            <div className="mt-1 text-sm font-bold text-gray-900 font-mono">
              75 ÷ 15 = {formatCurrency(5, business.currencySymbol)}
            </div>
            <p className="mt-1 text-gray-500 text-[11px]">
              Gasto total ÷ Total unidades obtenidas
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-amber-200/60 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase">2. Precio de Venta</span>
            <div className="mt-1 text-sm font-bold text-gray-900 font-mono">
              {formatCurrency(12, business.currencySymbol)} / unidad
            </div>
            <p className="mt-1 text-gray-500 text-[11px]">
              Fijado para cubrir insumos + mano de obra
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-amber-200/60 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase">3. Utilidad por Unidad</span>
            <div className="mt-1 text-sm font-bold text-emerald-700 font-mono">
              $12 - $5 = {formatCurrency(7, business.currencySymbol)}
            </div>
            <p className="mt-1 text-gray-500 text-[11px]">
              Margen de ganancia: <strong>58.3%</strong>
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-amber-200/60 shadow-2xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase">4. Utilidad del Lote Completo</span>
            <div className="mt-1 text-sm font-bold text-amber-800 font-mono">
              15 × $7 = {formatCurrency(105, business.currencySymbol)}
            </div>
            <p className="mt-1 text-gray-500 text-[11px]">
              Ingreso $180 - Costo $75 = $105 ganancia neta
            </p>
          </div>
        </div>
      </div>

      {/* Low Margin Warning Alert if any */}
      {lowMarginProducts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
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

      {/* Two Column Layout: Product Profitability vs Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Products Profitability Comparison (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 font-serif">
                Rentabilidad por Producto del Catálogo
              </h3>
              <p className="text-xs text-gray-500">
                Comparativa directa de costo por porción, precio establecido y ganancia
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver catálogo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px]">
                  <th className="pb-2.5">Producto / Receta</th>
                  <th className="pb-2.5 text-center">Rinde</th>
                  <th className="pb-2.5 text-right">Costo / U</th>
                  <th className="pb-2.5 text-right">Precio Venta</th>
                  <th className="pb-2.5 text-right">Utilidad / U</th>
                  <th className="pb-2.5 text-right">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => {
                  const metrics = CostCalculator.calculateProductMetrics(p);
                  const isHealthy = metrics.profitMarginPercent >= 50;
                  return (
                    <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 pr-2">
                        <div className="font-semibold text-gray-900">{p.name}</div>
                        <span className="text-[10px] text-gray-400">{p.category}</span>
                      </td>
                      <td className="py-3 text-center text-gray-600 font-medium">
                        {p.batchYieldUnits} {p.yieldUnitName}
                      </td>
                      <td className="py-3 text-right font-mono text-gray-700 font-medium">
                        {formatCurrency(metrics.costPerUnit, business.currencySymbol)}
                      </td>
                      <td className="py-3 text-right font-mono text-gray-900 font-bold">
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
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
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

        {/* Recent Batches & Quick Actions (1 col) */}
        <div className="space-y-6">
          {/* Recent Batches */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 font-serif flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-amber-600" />
                <span>Últimos Lotes Horneados</span>
              </h3>
              <button
                onClick={() => onNavigateTab('production')}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-3">
              {batches.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-1 hover:border-amber-200 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800 line-clamp-1">{b.productName}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{b.batchCode}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                    <span>
                      {b.totalUnitsProduced} unidades ({b.unitsSold} vendidas)
                    </span>
                    <span className="font-bold text-amber-900">
                      Gasto: {formatCurrency(b.totalSuppliesCost, business.currencySymbol)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div
                      className="bg-amber-600 h-1.5 rounded-full"
                      style={{
                        width: `${Math.min(100, (b.unitsSold / b.totalUnitsProduced) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Invoice shortcut card */}
          <div className="bg-gradient-to-br from-stone-900 to-amber-950 rounded-2xl p-5 text-white shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-serif">Facturación Rápida</h3>
            </div>
            <p className="mt-2 text-xs text-stone-300 leading-relaxed">
              Emite comprobantes con desglose de productos, {business.taxName} ({business.defaultTaxRate}%) y datos fiscales listos para imprimir o guardar en PDF.
            </p>
            <button
              onClick={() => onNavigateTab('invoices')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Gestionar Facturas</span>
            </button>
          </div>

        </div>

      </div>

      {/* Profitability Consolidated Report Modal (Print / PDF) */}
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
