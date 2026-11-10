import React, { useState } from 'react';
import {
  Printer,
  X,
  Scale,
  Calendar,
  BookOpen,
  Filter
} from 'lucide-react';
import { BusinessProfile, Product } from '../../../entities';
import {
  formatCurrency,
  formatPercent,
  CostCalculator
} from '../../../shared/lib';

interface RecipeBookPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  business: BusinessProfile;
}

export const RecipeBookPdfModal: React.FC<RecipeBookPdfModalProps> = ({
  isOpen,
  onClose,
  products,
  business,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [showFinancials, setShowFinancials] = useState<boolean>(true);
  const [includeNotes] = useState<boolean>(true);

  if (!isOpen) return null;

  const categories = ['todos', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter(
    (p) => selectedCategory === 'todos' || p.category === selectedCategory
  );

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const avgCostPerUnit =
    filteredProducts.length > 0
      ? filteredProducts.reduce(
          (sum, p) => sum + CostCalculator.calculateProductMetrics(p).costPerUnit,
          0
        ) / filteredProducts.length
      : 0;

  const avgMargin =
    filteredProducts.length > 0
      ? filteredProducts.reduce(
          (sum, p) => sum + CostCalculator.calculateProductMetrics(p).profitMarginPercent,
          0
        ) / filteredProducts.length
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full my-auto shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Controls Bar (Hidden during Print via .no-print) */}
        <div className="px-5 py-4 bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base font-serif text-amber-200">
                  Exportar Recetario a PDF
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-400/30">
                  {filteredProducts.length} recetas
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Fichas técnicas con ingredientes, porciones y costos unitarios calculados
              </p>
            </div>
          </div>

          {/* Quick Filter and Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-stone-800 px-2.5 py-1.5 rounded-xl border border-stone-700 text-xs">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-stone-200 text-xs font-medium focus:outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-stone-800 text-white">
                    {cat === 'todos' ? 'Todas las Categorías' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Financial Toggle */}
            <label className="flex items-center gap-1.5 bg-stone-800 px-2.5 py-1.5 rounded-xl border border-stone-700 text-xs text-stone-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showFinancials}
                onChange={(e) => setShowFinancials(e.target.checked)}
                className="rounded accent-amber-500 cursor-pointer"
              />
              <span>Incluir Costos & Margen</span>
            </label>

            {/* Print/Download Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-102"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Recipe Book Document Content */}
        <div className="printable-recipe-book p-6 sm:p-10 overflow-y-auto flex-1 bg-white space-y-8">
          
          {/* Document Cover Header */}
          <div className="border-b-2 border-amber-900/20 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-800 text-white flex items-center justify-center font-serif text-base font-bold shadow-xs">
                    {business.businessName.charAt(0)}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    {business.businessName}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif tracking-tight">
                  Recetario Maestro y Costeo de Producción
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
                  {business.tagline || 'Manual técnico de repostería artesanal con formulaciones, rendimiento en porciones y desglose de costo unitario.'}
                </p>
              </div>

              {/* Business & Generation Meta */}
              <div className="text-left sm:text-right text-xs text-stone-600 space-y-1 shrink-0 font-sans">
                <div className="font-bold text-stone-900">{business.ownerName || 'Taller de Repostería'}</div>
                {business.taxId && <div>{business.taxName}: <span className="font-mono">{business.taxId}</span></div>}
                {business.phone && <div>Tel: {business.phone}</div>}
                {business.address && <div>{business.address}</div>}
                <div className="pt-1 text-[11px] text-amber-800 font-semibold flex items-center sm:justify-end gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Emisión: {currentDate}</span>
                </div>
              </div>
            </div>

            {/* Document Metrics Bar */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Recetas Listadas</span>
                <span className="text-lg font-bold text-stone-900 mt-0.5 block font-serif">
                  {filteredProducts.length} recetas
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Categoría Filtro</span>
                <span className="text-xs font-bold text-amber-800 mt-1 block">
                  {selectedCategory === 'todos' ? 'Catálogo Completo' : selectedCategory}
                </span>
              </div>
              {showFinancials && (
                <>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Costo Promedio / U</span>
                    <span className="text-lg font-bold text-stone-900 mt-0.5 block font-mono">
                      {formatCurrency(avgCostPerUnit, business.currencySymbol)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Margen Promedio</span>
                    <span className="text-lg font-bold text-emerald-700 mt-0.5 block font-mono">
                      {formatPercent(avgMargin)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Recipes List */}
          <div className="space-y-6">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-stone-400 bg-stone-50 rounded-2xl border border-stone-200">
                No hay recetas que coincidan con la categoría seleccionada.
              </div>
            ) : (
              filteredProducts.map((product, index) => {
                const totalRecipeItems = product.ingredients.length;
                const metrics = CostCalculator.calculateProductMetrics(product);
                const batchProfit = metrics.totalBatchProfit;

                return (
                  <div
                    key={product.id}
                    className="page-break-inside-avoid border border-stone-200 rounded-2xl p-5 bg-white shadow-xs space-y-4"
                  >
                    {/* Recipe Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-amber-800 text-white text-xs font-bold flex items-center justify-center font-mono">
                            {index + 1}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                            {product.category}
                          </span>
                          <span className="text-xs text-stone-500 font-medium">
                            Rinde: <strong className="text-stone-800">{product.batchYieldUnits} {product.yieldUnitName}</strong> por lote
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-serif mt-1">
                          {product.name}
                        </h3>

                        {product.description && (
                          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Yield Badge */}
                      <div className="shrink-0 sm:text-right bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60">
                        <span className="text-[10px] uppercase font-bold text-amber-900 block">Rendimiento</span>
                        <span className="text-sm font-extrabold text-stone-900 font-mono">
                          {product.batchYieldUnits} {product.yieldUnitName}
                        </span>
                      </div>
                    </div>

                    {/* Financial Summary Strip (if showFinancials is checked) */}
                    {showFinancials && (
                      <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-200/60 space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                          <div className="bg-white p-2 rounded-lg border border-amber-200/50">
                            <span className="text-[10px] font-bold text-stone-500 uppercase block">Costo Total Lote</span>
                            <span className="text-xs font-bold text-stone-900 font-mono mt-0.5 block">
                              {formatCurrency(metrics.totalBatchCost, business.currencySymbol)}
                            </span>
                          </div>

                          <div className="bg-amber-100/60 p-2 rounded-lg border border-amber-300/60">
                            <span className="text-[10px] font-extrabold text-amber-950 uppercase block">Costo / Porción</span>
                            <span className="text-sm font-black text-amber-900 font-mono mt-0.5 block">
                              {formatCurrency(metrics.costPerUnit, business.currencySymbol)}
                            </span>
                          </div>

                          <div className="bg-white p-2 rounded-lg border border-amber-200/50">
                            <span className="text-[10px] font-bold text-stone-500 uppercase block">Precio Venta Sug.</span>
                            <span className="text-xs font-bold text-stone-900 font-mono mt-0.5 block">
                              {formatCurrency(product.sellingPrice, business.currencySymbol)}
                            </span>
                          </div>

                          <div className="bg-white p-2 rounded-lg border border-amber-200/50">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Utilidad / Porción</span>
                            <span className="text-xs font-bold text-emerald-700 font-mono mt-0.5 block">
                              +{formatCurrency(metrics.profitPerUnit, business.currencySymbol)} ({formatPercent(metrics.profitMarginPercent)})
                            </span>
                          </div>
                        </div>

                        {/* Exact Formula explanation */}
                        <div className="text-[11px] text-stone-600 bg-white/70 px-2.5 py-1.5 rounded-lg border border-amber-200/40 flex items-center justify-between">
                          <span>
                            <strong>Fórmula de Costeo:</strong> Gasto total de insumos ({formatCurrency(metrics.totalBatchCost, business.currencySymbol)}) ÷ {product.batchYieldUnits} {product.yieldUnitName} = <strong className="text-amber-900 font-mono">{formatCurrency(metrics.costPerUnit, business.currencySymbol)}</strong> por porción.
                          </span>
                          <span className="text-emerald-800 font-bold hidden sm:inline">
                            Ganancia neta por lote: +{formatCurrency(batchProfit, business.currencySymbol)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Ingredients Table */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                        <span className="flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-amber-700" />
                          <span>Ingredientes y Formulación ({totalRecipeItems} insumos)</span>
                        </span>
                        <span className="text-[11px] text-stone-500 font-normal">
                          Medidas para 1 lote ({product.batchYieldUnits} {product.yieldUnitName})
                        </span>
                      </div>

                      <div className="border border-stone-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-stone-100/80 text-stone-600 font-bold border-b border-stone-200 text-[11px]">
                              <th className="py-2 px-3">#</th>
                              <th className="py-2 px-3">Ingrediente / Insumo</th>
                              <th className="py-2 px-3 text-right">Cantidad Requerida</th>
                              <th className="py-2 px-3 text-center">Unidad</th>
                              {showFinancials && (
                                <th className="py-2 px-3 text-right">Costo Calculado</th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {product.ingredients.map((ing, i) => (
                              <tr key={i} className="hover:bg-amber-50/30">
                                <td className="py-1.5 px-3 text-stone-400 font-mono text-[11px] w-8">
                                  {i + 1}
                                </td>
                                <td className="py-1.5 px-3 font-semibold text-stone-800">
                                  {ing.name}
                                </td>
                                <td className="py-1.5 px-3 text-right font-mono font-bold text-stone-900">
                                  {ing.quantity.toLocaleString()}
                                </td>
                                <td className="py-1.5 px-3 text-center text-stone-500 font-mono text-[11px]">
                                  {ing.recipeUnit}
                                </td>
                                {showFinancials && (
                                  <td className="py-1.5 px-3 text-right font-mono font-medium text-amber-950">
                                    {formatCurrency(ing.calculatedCost, business.currencySymbol)}
                                  </td>
                                )}
                              </tr>
                            ))}

                            {/* Direct Costs (Packaging, ribbon, utilities) */}
                            {product.otherDirectCosts > 0 && (
                              <tr className="bg-stone-50/60 text-stone-700 font-medium">
                                <td className="py-1.5 px-3 text-stone-400 font-mono text-[11px]">
                                  +
                                </td>
                                <td className="py-1.5 px-3" colSpan={3}>
                                  Empaques, capacillos, cintas e insumos directos estimados
                                </td>
                                {showFinancials && (
                                  <td className="py-1.5 px-3 text-right font-mono font-bold text-stone-900">
                                    {formatCurrency(product.otherDirectCosts, business.currencySymbol)}
                                  </td>
                                )}
                              </tr>
                            )}
                          </tbody>
                          {showFinancials && (
                            <tfoot>
                              <tr className="bg-stone-100/90 font-bold text-stone-900 border-t border-stone-200">
                                <td colSpan={4} className="py-2 px-3 text-right text-[11px] uppercase">
                                  Costo Total del Lote:
                                </td>
                                <td className="py-2 px-3 text-right font-mono text-sm text-amber-900">
                                  {formatCurrency(metrics.totalBatchCost, business.currencySymbol)}
                                </td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    </div>

                    {/* Notes & Tips if available */}
                    {includeNotes && product.notes && (
                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 text-[11px] text-stone-600">
                        <strong className="text-stone-800 font-semibold">Notas de Preparación y Taller:</strong>{' '}
                        {product.notes}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Document Signoff and Footer */}
          <div className="pt-8 border-t-2 border-stone-200 page-break-inside-avoid">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-stone-500">
              <div className="text-center sm:text-left space-y-1">
                <p className="font-semibold text-stone-700">
                  {business.businessName} &bull; Manual de Estandarización y Costos
                </p>
                <p className="text-[11px] text-stone-400">
                  Cálculo de costo unitario verificado: Gasto en insumos ÷ Unidades producidas.
                </p>
              </div>

              {/* Signature Line */}
              <div className="w-56 text-center space-y-1">
                <div className="border-b border-stone-400 pb-12" />
                <span className="text-[10px] uppercase font-bold text-stone-600 tracking-wider block">
                  Firma / Responsable de Pastelería
                </span>
                <span className="text-[10px] text-stone-400 block font-serif">
                  {business.ownerName || 'Maestro Repostero'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
