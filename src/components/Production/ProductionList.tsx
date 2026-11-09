import React, { useState } from 'react';
import {
  ChefHat,
  Plus,
  Calendar,
  Package,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  X,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { BusinessProfile, Product, ProductionBatch } from '../../types/bakery';
import { formatCurrency, formatPercent } from '../../utils/units';

interface ProductionListProps {
  batches: ProductionBatch[];
  products: Product[];
  business: BusinessProfile;
  onSaveBatch: (batch: ProductionBatch) => void;
  onDeleteBatch: (id: string) => void;
  onOpenSaleModalForProduct?: (product: Product, batch?: ProductionBatch) => void;
  preselectedProduct?: Product | null;
  isOpenModal: boolean;
  onCloseModal: () => void;
  onOpenNewModal: () => void;
}

export const ProductionList: React.FC<ProductionListProps> = ({
  batches,
  products,
  business,
  onSaveBatch,
  onDeleteBatch,
  onOpenSaleModalForProduct,
  preselectedProduct,
  isOpenModal,
  onCloseModal,
  onOpenNewModal,
}) => {
  // Form State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [numberOfBatches, setNumberOfBatches] = useState<number>(3);
  const [unitsPerBatch, setUnitsPerBatch] = useState<number>(5);
  const [totalSuppliesCost, setTotalSuppliesCost] = useState<number>(75);
  const [notes, setNotes] = useState<string>('3 bandejas de 5 unidades. Total 15 galletas.');

  // Pre-fill when modal opens or preselected product changes
  React.useEffect(() => {
    if (preselectedProduct) {
      setSelectedProductId(preselectedProduct.id);
      setUnitsPerBatch(preselectedProduct.batchYieldUnits || 5);
      setNumberOfBatches(3);
      setTotalSuppliesCost(Math.round((preselectedProduct.totalBatchCost || 25) * 3 * 100) / 100);
      setNotes(`Elaboración de 3 lotes de ${preselectedProduct.name}.`);
    } else if (products.length > 0 && !selectedProductId) {
      const first = products[0];
      setSelectedProductId(first.id);
      setUnitsPerBatch(first.batchYieldUnits || 5);
      setNumberOfBatches(3);
      setTotalSuppliesCost(Math.round((first.totalBatchCost || 25) * 3 * 100) / 100);
      setNotes(`Elaboración de lote para ${first.name}.`);
    }
  }, [preselectedProduct, isOpenModal, products]);

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setUnitsPerBatch(prod.batchYieldUnits);
      setTotalSuppliesCost(Math.round(prod.totalBatchCost * numberOfBatches * 100) / 100);
      setNotes(`Elaboración de ${numberOfBatches} lote(s) de ${prod.name}.`);
    }
  };

  const handleBatchCountChange = (count: number) => {
    setNumberOfBatches(count);
    const prod = products.find((p) => p.id === selectedProductId);
    if (prod) {
      setTotalSuppliesCost(Math.round(prod.totalBatchCost * count * 100) / 100);
    }
  };

  // Live Calculations for current form
  const safeBatches = numberOfBatches > 0 ? numberOfBatches : 1;
  const safeUnitsPerBatch = unitsPerBatch > 0 ? unitsPerBatch : 1;
  const totalUnitsProduced = safeBatches * safeUnitsPerBatch;
  const costPerUnit = totalUnitsProduced > 0 ? Math.round((totalSuppliesCost / totalUnitsProduced) * 100) / 100 : 0;

  const currentProduct = products.find((p) => p.id === selectedProductId);
  const sellingPrice = currentProduct ? currentProduct.sellingPrice : 0;
  const profitPerUnit = Math.round((sellingPrice - costPerUnit) * 100) / 100;
  const totalPotentialRevenue = Math.round((sellingPrice * totalUnitsProduced) * 100) / 100;
  const totalPotentialProfit = Math.round((profitPerUnit * totalUnitsProduced) * 100) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || totalUnitsProduced <= 0) return;

    const prod = products.find((p) => p.id === selectedProductId);
    const newBatch: ProductionBatch = {
      id: `batch-${Date.now()}`,
      batchCode: `LOTE-${new Date().getFullYear()}-${String(batches.length + 1).padStart(3, '0')}`,
      date,
      productId: selectedProductId,
      productName: prod ? prod.name : 'Producto',
      numberOfBatches: Number(safeBatches),
      unitsPerBatch: Number(safeUnitsPerBatch),
      totalUnitsProduced: Number(totalUnitsProduced),
      totalSuppliesCost: Number(totalSuppliesCost),
      costPerUnit: Number(costPerUnit),
      unitsSold: 0,
      notes: notes.trim(),
      status: 'completado',
    };

    onSaveBatch(newBatch);
    onCloseModal();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
            Registro y Control de Producción (Lotes)
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Registra cuántos productos elaboras, cuánto gastas en insumos en cada horneada y calcula el costo exacto por unidad.
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Horneada / Lote</span>
        </button>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-amber-50/50 border-b border-amber-100 text-gray-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Lote / Fecha</th>
                <th className="py-3 px-4">Producto Elaborado</th>
                <th className="py-3 px-4 text-center">Producción</th>
                <th className="py-3 px-4 text-right">Gasto Insumos</th>
                <th className="py-3 px-4 text-right">Costo / U</th>
                <th className="py-3 px-4 text-center">Ventas / Stock</th>
                <th className="py-3 px-4 text-right">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No se han registrado lotes de producción aún.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => {
                  const remaining = batch.totalUnitsProduced - batch.unitsSold;
                  const isExhausted = remaining <= 0;
                  const prod = products.find((p) => p.id === batch.productId);

                  return (
                    <tr key={batch.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-gray-900">{batch.batchCode}</div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{batch.date}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{batch.productName}</div>
                        {batch.notes && (
                          <div className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{batch.notes}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="font-bold text-gray-900 font-mono">
                          {batch.totalUnitsProduced} unidades
                        </div>
                        <span className="text-[10px] text-gray-500">
                          ({batch.numberOfBatches} lotes × {batch.unitsPerBatch} u)
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                        {formatCurrency(batch.totalSuppliesCost, business.currencySymbol)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {formatCurrency(batch.costPerUnit, business.currencySymbol)} / u
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="text-gray-900 font-medium font-mono">
                          {batch.unitsSold} / {batch.totalUnitsProduced}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold">
                          {remaining > 0 ? `${remaining} en taller` : 'Agotado'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isExhausted
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isExhausted ? 'Agotado' : 'Disponible'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {prod && remaining > 0 && onOpenSaleModalForProduct && (
                            <button
                              onClick={() => onOpenSaleModalForProduct(prod, batch)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              title="Registrar venta de este lote"
                            >
                              <span>Vender</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Eliminar registro del ${batch.batchCode}?`)) {
                                onDeleteBatch(batch.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register New Batch Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 font-serif">
                    Registrar Lote de Producción
                  </h3>
                  <p className="text-xs text-gray-500">
                    Calcula el costo por unidad dividiendo el gasto total entre las unidades obtenidas
                  </p>
                </div>
              </div>
              <button
                onClick={onCloseModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Product selector */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Producto a Elaborar *</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Rendimiento base: {p.batchYieldUnits} {p.yieldUnitName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Fecha de Horneada *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Cantidad de Recetas / Lotes Horneados *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={numberOfBatches}
                    onChange={(e) => handleBatchCountChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Ej: 3 bandejas o 3 recetas</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Unidades Obtenidas por Receta *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={unitsPerBatch}
                    onChange={(e) => setUnitsPerBatch(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Ej: 5 unidades por bandeja</span>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Gasto Total en Insumos ({business.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={totalSuppliesCost}
                    onChange={(e) => setTotalSuppliesCost(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Total gastado en materias primas</span>
                </div>
              </div>

              {/* Exact Formula Breakdown Box */}
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 space-y-3">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                  Desglose de Costo y Utilidad del Lote:
                </span>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                    <span className="text-[9px] text-gray-400 uppercase font-semibold">Total Unidades</span>
                    <div className="text-sm font-bold text-gray-900 font-mono mt-0.5">
                      {safeBatches} × {safeUnitsPerBatch} = {totalUnitsProduced} u
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                    <span className="text-[9px] text-gray-400 uppercase font-semibold">Costo por Unidad</span>
                    <div className="text-sm font-bold text-amber-900 font-mono mt-0.5">
                      {totalSuppliesCost} ÷ {totalUnitsProduced} = {formatCurrency(costPerUnit, business.currencySymbol)}
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                    <span className="text-[9px] text-emerald-800 uppercase font-semibold">Ganancia / Unidad</span>
                    <div className="text-sm font-bold text-emerald-700 font-mono mt-0.5">
                      +{formatCurrency(profitPerUnit, business.currencySymbol)}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Al vender las <strong className="text-gray-900">{totalUnitsProduced} unidades</strong> al precio de{' '}
                  <strong className="text-gray-900">{formatCurrency(sellingPrice, business.currencySymbol)} c/u</strong>, ingresarás{' '}
                  <strong className="text-gray-900">{formatCurrency(totalPotentialRevenue, business.currencySymbol)}</strong>, recuperas tus{' '}
                  <strong className="text-gray-900">{formatCurrency(totalSuppliesCost, business.currencySymbol)}</strong> de insumos y obtienes{' '}
                  <strong className="text-emerald-700">+{formatCurrency(totalPotentialProfit, business.currencySymbol)} de utilidad neta</strong>.
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Notas / Observaciones del Lote</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Salieron perfectas, horneadas a 170°C"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onCloseModal}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Registrar Lote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
