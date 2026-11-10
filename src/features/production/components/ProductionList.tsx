import React, { useState } from 'react';
import {
  ChefHat,
  Plus,
  Calendar,
  X,
  ArrowRight
} from 'lucide-react';
import { BusinessProfile, Product, ProductionBatch } from '../../../entities';
import {
  formatCurrency,
  CostCalculator
} from '../../../shared/lib';

interface ProductionListProps {
  batches: ProductionBatch[];
  products: Product[];
  business: BusinessProfile;
  onSaveBatch: (batch: ProductionBatch) => void;
  onDeleteBatch: (id: string) => void;
  onOpenSaleModalForProduct?: (product: Product, batch?: ProductionBatch) => void;
  preselectedProduct?: Product | null;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
  onOpenNewModal: () => void;
}

interface ProductionBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  batchesCount: number;
  business: BusinessProfile;
  preselectedProduct?: Product | null;
  onSaveBatch: (batch: ProductionBatch) => void;
}

export const ProductionBatchModal: React.FC<ProductionBatchModalProps> = ({
  isOpen,
  onClose,
  products,
  batchesCount,
  business,
  preselectedProduct,
  onSaveBatch,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [numberOfBatches, setNumberOfBatches] = useState<number>(3);
  const [unitsPerBatch, setUnitsPerBatch] = useState<number>(5);
  const [totalSuppliesCost, setTotalSuppliesCost] = useState<number>(75);
  const [notes, setNotes] = useState<string>('3 bandejas de 5 unidades. Total 15 galletas.');

  React.useEffect(() => {
    if (preselectedProduct) {
      const batchCost = CostCalculator.calculateBatchCost(
        preselectedProduct.ingredients,
        preselectedProduct.otherDirectCosts
      );
      setSelectedProductId(preselectedProduct.id);
      setUnitsPerBatch(preselectedProduct.batchYieldUnits || 5);
      setNumberOfBatches(3);
      setTotalSuppliesCost(Math.round((batchCost || 25) * 3 * 100) / 100);
      setNotes(`Elaboración de 3 lotes de ${preselectedProduct.name}.`);
    } else if (products.length > 0 && !selectedProductId) {
      const first = products[0];
      const batchCost = CostCalculator.calculateBatchCost(
        first.ingredients,
        first.otherDirectCosts
      );
      setSelectedProductId(first.id);
      setUnitsPerBatch(first.batchYieldUnits || 5);
      setNumberOfBatches(3);
      setTotalSuppliesCost(Math.round((batchCost || 25) * 3 * 100) / 100);
      setNotes(`Elaboración de lote para ${first.name}.`);
    }
  }, [preselectedProduct, isOpen, products]);

  if (!isOpen) return null;

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      const batchCost = CostCalculator.calculateBatchCost(
        prod.ingredients,
        prod.otherDirectCosts
      );
      setUnitsPerBatch(prod.batchYieldUnits);
      setTotalSuppliesCost(Math.round(batchCost * numberOfBatches * 100) / 100);
      setNotes(`Elaboración de ${numberOfBatches} lote(s) de ${prod.name}.`);
    }
  };

  const handleBatchCountChange = (count: number) => {
    setNumberOfBatches(count);
    const prod = products.find((p) => p.id === selectedProductId);
    if (prod) {
      const batchCost = CostCalculator.calculateBatchCost(
        prod.ingredients,
        prod.otherDirectCosts
      );
      setTotalSuppliesCost(Math.round(batchCost * count * 100) / 100);
    }
  };

  const safeBatches = numberOfBatches > 0 ? numberOfBatches : 1;
  const safeUnitsPerBatch = unitsPerBatch > 0 ? unitsPerBatch : 1;
  const totalUnitsProduced = safeBatches * safeUnitsPerBatch;

  const currentProduct = products.find((p) => p.id === selectedProductId);
  const sellingPrice = currentProduct ? currentProduct.sellingPrice : 0;
  const {
    costPerUnit,
    profitPerUnit,
    totalBatchRevenue: totalPotentialRevenue,
    totalBatchProfit: totalPotentialProfit,
  } = CostCalculator.calculateProductMetrics({
    ingredients: [],
    otherDirectCosts: totalSuppliesCost,
    batchYieldUnits: totalUnitsProduced,
    sellingPrice,
    suggestedMarginPercent: currentProduct?.suggestedMarginPercent || 50,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || totalUnitsProduced <= 0) return;

    const prod = products.find((p) => p.id === selectedProductId);
    const newBatch: ProductionBatch = {
      id: `batch-${Date.now()}`,
      batchCode: `LOTE-${new Date().getFullYear()}-${String(batchesCount + 1).padStart(3, '0')}`,
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-100 space-y-4 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800 font-serif">
                Elaborar Nuevo Lote de Producción
              </h3>
              <p className="text-xs text-stone-500">
                Calcula el costo por unidad dividiendo el gasto total entre las unidades obtenidas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Producto a Elaborar *</label>
            <select
              required
              value={selectedProductId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
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
              <label className="block font-bold text-stone-700 mb-1">Fecha de Horneada *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Cantidad de Recetas / Lotes Horneados *
              </label>
              <input
                type="number"
                min="1"
                required
                value={numberOfBatches}
                onChange={(e) => handleBatchCountChange(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 font-mono font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">Ej: 3 bandejas o 3 recetas</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Unidades Obtenidas por Receta *
              </label>
              <input
                type="number"
                min="1"
                required
                value={unitsPerBatch}
                onChange={(e) => setUnitsPerBatch(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 font-mono font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">Ej: 5 unidades por bandeja</span>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Gasto Total en Insumos ({business.currencySymbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={totalSuppliesCost}
                onChange={(e) => setTotalSuppliesCost(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 font-mono font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">Total gastado en materias primas</span>
            </div>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
              Desglose de Costo y Utilidad del Lote:
            </span>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="text-[9px] text-stone-400 uppercase font-semibold">Total Unidades</span>
                <div className="text-sm font-bold text-stone-800 font-mono mt-0.5">
                  {safeBatches} × {safeUnitsPerBatch} = {totalUnitsProduced} u
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="text-[9px] text-stone-400 uppercase font-semibold">Costo por Unidad</span>
                <div className="text-sm font-bold text-rose-800 font-mono mt-0.5">
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

            <p className="text-[11px] text-stone-600 leading-relaxed">
              Al vender las <strong className="text-stone-800">{totalUnitsProduced} unidades</strong> al precio de{' '}
              <strong className="text-stone-800">{formatCurrency(sellingPrice, business.currencySymbol)} c/u</strong>, ingresarás{' '}
              <strong className="text-stone-800">{formatCurrency(totalPotentialRevenue, business.currencySymbol)}</strong>, recuperas tus{' '}
              <strong className="text-stone-800">{formatCurrency(totalSuppliesCost, business.currencySymbol)}</strong> de insumos y obtienes{' '}
              <strong className="text-emerald-700">+{formatCurrency(totalPotentialProfit, business.currencySymbol)} de utilidad neta</strong>.
            </p>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Notas / Observaciones del Lote</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Salieron perfectas, horneadas a 170°C"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold shadow-sm cursor-pointer"
            >
              Registrar Lote
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ProductionList: React.FC<ProductionListProps> = ({
  batches,
  products,
  business,
  onSaveBatch,
  onDeleteBatch,
  onOpenSaleModalForProduct,
  preselectedProduct,
  isOpenModal = false,
  onCloseModal,
  onOpenNewModal,
}) => {
  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-800 font-serif">
            Historial de Lotes Horneados
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Registra tus horneadas, controla el stock disponible por tanda y calcula el costo real por unidad.
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Elaborar Nuevo Lote</span>
        </button>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200/80 text-stone-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Lote / Fecha</th>
                <th className="py-3.5 px-4">Producto Elaborado</th>
                <th className="py-3.5 px-4 text-center">Producción</th>
                <th className="py-3.5 px-4 text-right">Gasto Insumos</th>
                <th className="py-3.5 px-4 text-right">Costo / U</th>
                <th className="py-3.5 px-4 text-center">Ventas / Stock</th>
                <th className="py-3.5 px-4 text-right">Estado</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-stone-400">
                    No se han registrado lotes de producción aún.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => {
                  const remaining = batch.totalUnitsProduced - batch.unitsSold;
                  const isExhausted = remaining <= 0;
                  const prod = products.find((p) => p.id === batch.productId);

                  return (
                    <tr key={batch.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-stone-800">{batch.batchCode}</div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{batch.date}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-800">{batch.productName}</div>
                        {batch.notes && (
                          <div className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">{batch.notes}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="font-bold text-stone-800 font-mono">
                          {batch.totalUnitsProduced} unidades
                        </div>
                        <span className="text-[10px] text-stone-500">
                          ({batch.numberOfBatches} lotes × {batch.unitsPerBatch} u)
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-800">
                        {formatCurrency(batch.totalSuppliesCost, business.currencySymbol)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/70">
                          {formatCurrency(batch.costPerUnit, business.currencySymbol)} / u
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="text-stone-800 font-medium font-mono">
                          {batch.unitsSold} / {batch.totalUnitsProduced}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold">
                          {remaining > 0 ? `${remaining} en taller` : 'Agotado'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isExhausted
                              ? 'bg-stone-100 text-stone-500'
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
                              className="px-2.5 py-1 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
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
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
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

      {isOpenModal && onCloseModal && (
        <ProductionBatchModal
          isOpen={isOpenModal}
          onClose={onCloseModal}
          products={products}
          batchesCount={batches.length}
          business={business}
          preselectedProduct={preselectedProduct}
          onSaveBatch={onSaveBatch}
        />
      )}
    </div>
  );
};
