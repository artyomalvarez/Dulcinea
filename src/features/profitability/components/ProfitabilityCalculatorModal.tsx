import React, { useState } from 'react';
import {
  Sparkles,
  Calculator,
  RefreshCw,
  BookOpen,
  Info,
  Check
} from 'lucide-react';
import { BusinessProfile, Product } from '../../../entities';
import {
  formatCurrency,
  formatPercent,
  CostCalculator
} from '../../../shared/lib';

interface ProfitabilityCalculatorModalProps {
  business: BusinessProfile;
  products?: Product[];
  isOpen?: boolean;
  onClose?: () => void;
  isStandaloneTab?: boolean;
}

export const ProfitabilityCalculatorModal: React.FC<ProfitabilityCalculatorModalProps> = ({
  business,
  products = [],
  isOpen = true,
  onClose,
  isStandaloneTab = false,
}) => {
  // Simulator inputs - Defaults to 3 batches of $25 each = $75
  const [unitBatchCost, setUnitBatchCost] = useState<number>(25);
  const [totalSupplies, setTotalSupplies] = useState<number>(75);
  const [numberOfBatches, setNumberOfBatches] = useState<number>(3);
  const [unitsPerBatch, setUnitsPerBatch] = useState<number>(5);
  const [sellingPrice, setSellingPrice] = useState<number>(12);
  const [desiredMarginPercent, setDesiredMarginPercent] = useState<number>(55);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');

  // Exact calculations via CostCalculator
  const safeBatches = Math.max(1, numberOfBatches || 1);
  const safeUnitsPerBatch = Math.max(1, unitsPerBatch || 1);
  const totalUnits = safeBatches * safeUnitsPerBatch;
  const {
    costPerUnit,
    profitPerUnit,
    profitMarginPercent: grossMarginPercent,
    totalBatchProfit,
    breakevenUnits,
  } = CostCalculator.calculateProductMetrics({
    ingredients: [],
    otherDirectCosts: totalSupplies,
    batchYieldUnits: totalUnits,
    sellingPrice,
    suggestedMarginPercent: desiredMarginPercent,
  });

  const suggestedPriceForMargin = CostCalculator.calculateSuggestedPrice(
    costPerUnit,
    desiredMarginPercent
  );
  const priceDifference = Math.round((sellingPrice - suggestedPriceForMargin) * 100) / 100;

  const handleResetToUserExample = () => {
    setSelectedRecipeId('');
    setUnitBatchCost(25);
    setNumberOfBatches(3);
    setUnitsPerBatch(5);
    setTotalSupplies(75);
    setSellingPrice(12);
    setDesiredMarginPercent(58);
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-dulcinea-blue-soft text-dulcinea-blue text-xs font-bold uppercase tracking-wider">
              Simulador Interactivo
            </span>
            <span className="text-xs text-dulcinea-muted font-semibold">Fórmulas Paso a Paso</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-dulcinea-midnight font-serif mt-1">
            Simulador de Costeo y Rentabilidad de Repostería
          </h2>
          <p className="text-xs sm:text-sm text-dulcinea-muted">
            Calcula cuánto cuesta producir cada unidad, compara tu precio actual con el sugerido y encuentra tu punto de equilibrio.
          </p>
        </div>

        <button
          onClick={handleResetToUserExample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dulcinea-copper/40 bg-dulcinea-cream/50 text-dulcinea-midnight text-xs font-semibold hover:bg-dulcinea-cream transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-dulcinea-copper" />
          <span>Reiniciar Ejemplo (75 ÷ 15 = 5)</span>
        </button>
      </div>

      {/* Simulation Notice */}
      <div className="bg-dulcinea-blue-soft/70 border border-dulcinea-blue/25 rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-dulcinea-midnight">
        <Info className="w-4 h-4 text-dulcinea-blue shrink-0" />
        <span>
          <strong>Modo Simulación:</strong> los cambios que pruebes aquí te ayudan a tomar decisiones, pero no alteran las recetas ni los precios guardados en <strong>Productos</strong>.
        </span>
      </div>

      {/* Interactive Controls & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Inputs Column (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-dulcinea-midnight font-serif flex items-center gap-2">
            <Calculator className="w-4 h-4 text-dulcinea-copper" />
            <span>Paso 1. Configura tu Producción</span>
          </h3>

          {products.length > 0 && (
            <div className="bg-dulcinea-cream/40 p-3 rounded-xl border border-dulcinea-copper/30 space-y-1.5">
              <label className="block text-xs font-bold text-dulcinea-midnight flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-dulcinea-copper" />
                <span>Simular con una Receta de tu Catálogo</span>
              </label>
              <select
                value={selectedRecipeId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedRecipeId(id);
                  const prod = products.find((p) => p.id === id);
                  if (prod) {
                    const singleBatchCost =
                      CostCalculator.calculateBatchCost(
                        prod.ingredients,
                        prod.otherDirectCosts
                      ) || 20;
                    setUnitBatchCost(singleBatchCost);
                    setNumberOfBatches(1);
                    setUnitsPerBatch(prod.batchYieldUnits || 1);
                    setTotalSupplies(singleBatchCost);
                    setSellingPrice(prod.sellingPrice || 10);
                    setDesiredMarginPercent(prod.suggestedMarginPercent || 50);
                  }
                }}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-dulcinea-copper/40 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-dulcinea-blue/30"
              >
                <option value="">-- Cargar receta existente --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.batchYieldUnits} {p.yieldUnitName})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-dulcinea-text">
                1. Inversión Total en Insumos ({business.currencySymbol})
              </label>
              <span className="text-[11px] font-mono text-dulcinea-muted">
                {formatCurrency(unitBatchCost, business.currencySymbol)} / lote
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold text-stone-400">
                {business.currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                min="0"
                value={totalSupplies}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  setTotalSupplies(val);
                  setUnitBatchCost(Math.round((val / safeBatches) * 100) / 100);
                }}
                className="w-full pl-8 pr-4 py-2 text-sm font-bold font-mono rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-dulcinea-blue/40"
              />
            </div>
            <span className="text-[11px] text-dulcinea-muted mt-0.5 block">
              Se multiplica automáticamente al cambiar la cantidad de lotes.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-dulcinea-text mb-1">
                2. Lotes / Bandejas
              </label>
              <input
                type="number"
                min="1"
                value={numberOfBatches}
                onChange={(e) => {
                  const newBatches = Math.max(1, Number(e.target.value) || 1);
                  setNumberOfBatches(newBatches);
                  setTotalSupplies(Math.round(unitBatchCost * newBatches * 100) / 100);
                }}
                className="w-full px-3 py-2 text-sm font-bold font-mono rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-dulcinea-blue/40 text-center"
              />
              <span className="text-[10px] text-dulcinea-muted mt-0.5 block">Escala insumos ×{safeBatches}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-dulcinea-text mb-1">
                3. Unidades por Lote
              </label>
              <input
                type="number"
                min="1"
                value={unitsPerBatch}
                onChange={(e) => setUnitsPerBatch(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-2 text-sm font-bold font-mono rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-dulcinea-blue/40 text-center"
              />
              <span className="text-[10px] text-dulcinea-muted mt-0.5 block">Por cada tanda</span>
            </div>
          </div>

          <div className="bg-dulcinea-cream/55 p-3 rounded-xl border border-dulcinea-copper/30 text-xs">
            <span className="text-dulcinea-muted">Producción total simulada:</span>
            <div className="text-base font-bold text-dulcinea-midnight font-mono mt-0.5">
              {safeBatches} × {safeUnitsPerBatch} = {totalUnits} unidades
            </div>
          </div>

          <div className="border-t border-stone-100 pt-3 space-y-3">
            <div>
              <label className="block text-xs font-bold text-dulcinea-text mb-1">
                4. Precio de Venta al Público ({business.currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-stone-400">
                  {business.currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2 text-sm font-bold font-mono rounded-lg border border-dulcinea-blue/40 bg-dulcinea-blue-soft/30 focus:outline-none focus:ring-2 focus:ring-dulcinea-blue/40"
                />
              </div>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold text-dulcinea-text">
                <span>5. Margen Objetivo Deseado</span>
                <span className="font-mono px-2 py-0.5 rounded-md bg-dulcinea-blue text-white">
                  {desiredMarginPercent}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="85"
                value={desiredMarginPercent}
                onChange={(e) => setDesiredMarginPercent(Number(e.target.value))}
                className="w-full accent-dulcinea-blue cursor-pointer"
              />

              {/* Price Comparison Card */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-stone-200">
                  <span className="text-dulcinea-muted block">Actual</span>
                  <span className="font-mono font-bold text-dulcinea-midnight">
                    {formatCurrency(sellingPrice, business.currencySymbol)}
                  </span>
                </div>
                <div className="bg-dulcinea-blue-soft/70 p-2 rounded-lg border border-dulcinea-blue/30">
                  <span className="text-dulcinea-blue font-semibold block">Sugerido</span>
                  <span className="font-mono font-bold text-dulcinea-midnight">
                    {formatCurrency(suggestedPriceForMargin, business.currencySymbol)}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-stone-200">
                  <span className="text-dulcinea-muted block">Diferencia</span>
                  <span
                    className={`font-mono font-bold ${
                      priceDifference >= 0 ? 'text-dulcinea-success' : 'text-dulcinea-cherry'
                    }`}
                  >
                    {priceDifference >= 0 ? '+' : ''}
                    {formatCurrency(priceDifference, business.currencySymbol)}
                  </span>
                </div>
              </div>

              {Math.abs(priceDifference) >= 0.01 && (
                <button
                  type="button"
                  onClick={() => setSellingPrice(suggestedPriceForMargin)}
                  className="w-full py-1.5 rounded-lg bg-dulcinea-blue hover:bg-[#2f698d] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Aplicar precio sugerido ({formatCurrency(suggestedPriceForMargin, business.currencySymbol)})</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Detailed Formula Step-by-Step Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Results Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Costo / Unidad</span>
              <div className="text-xl font-extrabold text-amber-900 font-mono mt-1">
                {formatCurrency(costPerUnit, business.currencySymbol)}
              </div>
              <span className="text-[10px] text-gray-500 font-mono">
                {totalSupplies} ÷ {totalUnits}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Precio Venta</span>
              <div className="text-xl font-extrabold text-gray-900 font-mono mt-1">
                {formatCurrency(sellingPrice, business.currencySymbol)}
              </div>
              <span className="text-[10px] text-gray-500">Al cliente</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Utilidad / U</span>
              <div className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
                +{formatCurrency(profitPerUnit, business.currencySymbol)}
              </div>
              <span className="text-[10px] text-emerald-800 font-bold font-mono">
                {formatPercent(grossMarginPercent)} margen
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-amber-300 bg-amber-50/30 shadow-2xs">
              <span className="text-[10px] font-bold text-amber-900 uppercase block">Ganancia Lote</span>
              <div className="text-xl font-extrabold text-amber-800 font-mono mt-1">
                +{formatCurrency(totalBatchProfit, business.currencySymbol)}
              </div>
              <span className="text-[10px] text-amber-800">
                {totalUnits} unidades
              </span>
            </div>
          </div>

          {/* Educational Step-by-Step Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-gray-900 font-serif">
              Desglose Matemático de las Fórmulas Utilizadas:
            </h4>

            <div className="space-y-3 text-xs">
              {/* Formula 1 */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <strong className="text-gray-900 block">Cálculo del Costo por Unidad (Costo Unitario):</strong>
                  <div className="font-mono text-gray-800 bg-white px-2.5 py-1 rounded-lg border border-gray-200 mt-1 inline-block">
                    Costo Unitario = Gasto Total en Insumos ÷ Total Unidades
                  </div>
                  <p className="mt-1 text-gray-600">
                    Sustituyendo con tus datos: <strong>{totalSupplies} ÷ {totalUnits} = {formatCurrency(costPerUnit, business.currencySymbol)} por cada unidad producida</strong>.
                  </p>
                </div>
              </div>

              {/* Formula 2 */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <strong className="text-gray-900 block">Cálculo de la Utilidad Neta por Unidad:</strong>
                  <div className="font-mono text-gray-800 bg-white px-2.5 py-1 rounded-lg border border-gray-200 mt-1 inline-block">
                    Utilidad Unitaria = Precio de Venta - Costo Unitario
                  </div>
                  <p className="mt-1 text-gray-600">
                    Sustituyendo: <strong>{sellingPrice} - {costPerUnit.toFixed(2)} = +{formatCurrency(profitPerUnit, business.currencySymbol)} de ganancia por unidad vendida</strong>.
                  </p>
                </div>
              </div>

              {/* Formula 3 */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <strong className="text-gray-900 block">Cálculo del Margen de Ganancia Porcentual (%):</strong>
                  <div className="font-mono text-gray-800 bg-white px-2.5 py-1 rounded-lg border border-gray-200 mt-1 inline-block">
                    Margen % = (Utilidad ÷ Precio de Venta) × 100
                  </div>
                  <p className="mt-1 text-gray-600">
                    Sustituyendo: ({profitPerUnit.toFixed(2)} ÷ {sellingPrice}) × 100 ={' '}
                    <strong>{formatPercent(grossMarginPercent)}</strong> de margen real sobre venta.
                  </p>
                </div>
              </div>

              {/* Formula 4 */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </div>
                <div>
                  <strong className="text-gray-900 block">Utilidad Total de la Tanda / Lote Completo:</strong>
                  <div className="font-mono text-gray-800 bg-white px-2.5 py-1 rounded-lg border border-gray-200 mt-1 inline-block">
                    Utilidad del Lote = Total Unidades × Utilidad Unitaria
                  </div>
                  <p className="mt-1 text-gray-600">
                    Sustituyendo: {totalUnits} unidades × {profitPerUnit.toFixed(2)} ={' '}
                    <strong className="text-emerald-700">+{formatCurrency(totalBatchProfit, business.currencySymbol)} de utilidad neta final</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Breakeven Point Card */}
          <div className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 p-4 rounded-2xl border border-amber-200/80 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>Punto de Equilibrio (Recuperar la inversión):</span>
              </span>
              <p className="text-gray-600">
                Solo necesitas vender <strong className="text-gray-900 font-mono text-sm">{breakevenUnits} unidades</strong> de las {totalUnits} producidas para recuperar al 100% tus {formatCurrency(totalSupplies, business.currencySymbol)} invertidos.
              </p>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-xl border border-amber-300 font-mono font-bold text-amber-900 shrink-0">
              {breakevenUnits} / {totalUnits} u
            </div>
          </div>

        </div>

      </div>
    </div>
  );

  if (isStandaloneTab) {
    return content;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-gray-100 my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex justify-end mb-2">
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-xl hover:bg-gray-100"
            >
              ✕
            </button>
          )}
        </div>
        {content}
      </div>
    </div>
  );
};
