import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  DollarSign,
  HelpCircle,
  Sparkles,
  Info,
  Scale,
  Cake,
  Boxes
} from 'lucide-react';
import {
  BusinessProfile,
  Ingredient,
  Product,
  RecipeIngredient,
  UnitOfMeasure
} from '../../types/bakery';
import {
  formatCurrency,
  formatPercent,
  getUnitLabel
} from '../../utils/units';
import { CostCalculator } from '../../domain/services/CostCalculator';

interface ProductFormModalProps {
  product: Product | null; // null if creating new
  ingredients: Ingredient[];
  business: BusinessProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  ingredients,
  business,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Product['category']>('Galletas');
  const [description, setDescription] = useState('');
  const [batchYieldUnits, setBatchYieldUnits] = useState<number>(15);
  const [yieldUnitName, setYieldUnitName] = useState<string>('unidades');
  const [otherDirectCosts, setOtherDirectCosts] = useState<number>(10);
  const [recipeItems, setRecipeItems] = useState<RecipeIngredient[]>([]);
  const [sellingPrice, setSellingPrice] = useState<number>(12);
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(55);
  const [notes, setNotes] = useState('');

  // Selected ingredient dropdown temporary state
  const [selectedIngId, setSelectedIngId] = useState<string>('');
  const [inputQty, setInputQty] = useState<number>(100);
  const [inputUnit, setInputUnit] = useState<UnitOfMeasure>('g');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setDescription(product.description || '');
      setBatchYieldUnits(product.batchYieldUnits);
      setYieldUnitName(product.yieldUnitName);
      setOtherDirectCosts(product.otherDirectCosts || 0);
      setRecipeItems(product.ingredients || []);
      setSellingPrice(product.sellingPrice);
      setTargetMarginPercent(product.suggestedMarginPercent || 50);
      setNotes(product.notes || '');
    } else {
      // Default template for a new product
      setName('');
      setCategory('Galletas');
      setDescription('');
      setBatchYieldUnits(15);
      setYieldUnitName('galletas');
      setOtherDirectCosts(10);
      setSellingPrice(12);
      setTargetMarginPercent(55);
      setNotes('');
      // If we have default ingredients, pick first as preset
      if (ingredients.length > 0) {
        setSelectedIngId(ingredients[0].id);
      }
      setRecipeItems([]);
    }
  }, [product, isOpen, ingredients]);

  if (!isOpen) return null;

  // Recalculate all recipe items dynamically using CostCalculator
  const safeYield = Number(batchYieldUnits) > 0 ? Number(batchYieldUnits) : 1;
  const {
    ingredientsCostSum,
    totalBatchCost,
    costPerUnit,
    profitPerUnit,
    profitMarginPercent,
    totalBatchProfit,
    totalBatchRevenue,
    suggestedPrice: suggestedPriceFromMargin,
  } = CostCalculator.calculateProductMetrics({
    ingredients: recipeItems,
    otherDirectCosts: Number(otherDirectCosts || 0),
    batchYieldUnits: safeYield,
    sellingPrice: Number(sellingPrice),
    suggestedMarginPercent: Number(targetMarginPercent),
  });

  const handleAddIngredient = () => {
    if (!selectedIngId || inputQty <= 0) return;
    const ingObj = ingredients.find((i) => i.id === selectedIngId);
    if (!ingObj) return;

    const calculatedCost = CostCalculator.calculateIngredientRecipeCost(
      inputQty,
      inputUnit,
      ingObj.purchasePackageQuantity,
      ingObj.purchasePackageUnit,
      ingObj.purchaseCost
    );

    const newItem: RecipeIngredient = {
      ingredientId: ingObj.id,
      name: ingObj.name,
      quantity: Number(inputQty),
      recipeUnit: inputUnit,
      calculatedCost,
    };

    setRecipeItems([...recipeItems, newItem]);
    // Reset inputs
    setInputQty(100);
  };

  const handleRemoveItem = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  const handleApplySuggestedPrice = () => {
    setSellingPrice(suggestedPriceFromMargin);
  };

  const handlePriceChange = (newPrice: number) => {
    setSellingPrice(newPrice);
    if (newPrice > 0 && costPerUnit > 0) {
      const margin = CostCalculator.calculateMargin(newPrice, costPerUnit);
      setTargetMarginPercent(Math.max(0, Math.round(margin)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const savedProduct: Product = {
      id: product?.id || `prod-${Date.now()}`,
      name: name.trim(),
      category,
      description: description.trim(),
      ingredients: recipeItems,
      otherDirectCosts: Number(otherDirectCosts || 0),
      batchYieldUnits: safeYield,
      yieldUnitName: yieldUnitName.trim() || 'unidades',
      suggestedMarginPercent: Number(targetMarginPercent),
      sellingPrice: Number(sellingPrice),
      notes: notes.trim(),
    };

    onSave(savedProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-700 to-rose-700 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-serif">
              {product ? 'Editar Receta y Costeo del Producto' : 'Crear Nuevo Producto / Receta'}
            </h3>
            <p className="text-xs text-amber-100">
              Desglose exacto de insumos, rendimiento por lote y cálculo de utilidad por porción
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* General Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">Nombre del Producto / Pastel / Galletas *</label>
              <input
                type="text"
                required
                placeholder="Ej: Pastel Supreme de Tres Leches, Galletas Chispas de Chocolate"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="Pasteles">Pasteles</option>
                <option value="Galletas">Galletas</option>
                <option value="Cupcakes">Cupcakes</option>
                <option value="Postres Fríos">Postres Fríos</option>
                <option value="Panadería">Panadería</option>
                <option value="Bocaditos y Tartas">Bocaditos y Tartas</option>
              </select>
            </div>
          </div>

          {/* Batch Yield and Other Costs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70">
            <div>
              <label className="block font-bold text-amber-950 mb-1">
                Rendimiento del Lote (Unidades / Porciones) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={batchYieldUnits}
                onChange={(e) => setBatchYieldUnits(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono font-bold"
              />
              <span className="text-[10px] text-amber-800 mt-1 block">
                Ej: 15 galletas, 10 porciones de pastel, 12 cupcakes
              </span>
            </div>

            <div>
              <label className="block font-bold text-amber-950 mb-1">
                Nombre de la Unidad
              </label>
              <input
                type="text"
                placeholder="ej: galletas, porciones, piezas"
                value={yieldUnitName}
                onChange={(e) => setYieldUnitName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <span className="text-[10px] text-amber-800 mt-1 block">
                Para el texto de facturas y lotes
              </span>
            </div>

            <div>
              <label className="block font-bold text-amber-950 mb-1">
                Otros Gastos del Lote ({business.currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={otherDirectCosts}
                onChange={(e) => setOtherDirectCosts(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono font-bold"
              />
              <span className="text-[10px] text-amber-800 mt-1 block">
                Cajas, cintas, gas/luz estimado
              </span>
            </div>
          </div>

          {/* Recipe Ingredients Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900 font-serif flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-600" />
                  <span>Ingredientes de la Receta (Lote Base)</span>
                </h4>
                <p className="text-[11px] text-gray-500">
                  Agrega cada insumo y su cantidad en gramos, mililitros o piezas. El costo se calcula automáticamente.
                </p>
              </div>
              <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                Subtotal Insumos: {formatCurrency(ingredientsCostSum, business.currencySymbol)}
              </span>
            </div>

            {/* Add ingredient row */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 w-full sm:w-auto">
                <select
                  value={selectedIngId}
                  onChange={(e) => {
                    setSelectedIngId(e.target.value);
                    const selected = ingredients.find((i) => i.id === e.target.value);
                    if (selected) {
                      setInputUnit(selected.purchasePackageUnit);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Seleccionar insumo del catálogo --</option>
                  {Array.from(new Set(ingredients.map((i) => i.category))).map((cat) => (
                    <optgroup key={cat} label={`📂 ${cat}`}>
                      {ingredients
                        .filter((i) => i.category === cat)
                        .map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({ing.purchasePackageQuantity} {ing.purchasePackageUnit} - {formatCurrency(ing.purchaseCost, business.currencySymbol)})
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  placeholder="Cantidad"
                  value={inputQty}
                  onChange={(e) => setInputQty(Number(e.target.value))}
                  className="w-24 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                />

                <select
                  value={inputUnit}
                  onChange={(e) => setInputUnit(e.target.value as any)}
                  className="w-24 px-2 py-2 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="g">g (gramos)</option>
                  <option value="kg">kg (kilos)</option>
                  <option value="ml">ml (mililitros)</option>
                  <option value="l">L (litros)</option>
                  <option value="pza">pza (piezas)</option>
                  <option value="cda">cda (cucharada)</option>
                  <option value="cdta">cdta (cucharadita)</option>
                </select>

                <button
                  type="button"
                  onClick={handleAddIngredient}
                  disabled={!selectedIngId || inputQty <= 0}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir</span>
                </button>
              </div>
            </div>

            {/* Ingredients Table */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-amber-50/40 text-gray-500 uppercase text-[10px] font-semibold border-b border-gray-100">
                    <th className="py-2.5 px-3">Ingrediente</th>
                    <th className="py-2.5 px-3">Cantidad en Receta</th>
                    <th className="py-2.5 px-3 text-right">Costo Calculado</th>
                    <th className="py-2.5 px-3 text-center w-12">Quitar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recipeItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-400">
                        No has añadido ingredientes a esta receta aún.
                      </td>
                    </tr>
                  ) : (
                    recipeItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-semibold text-gray-800">{item.name}</td>
                        <td className="py-2.5 px-3 text-gray-600 font-medium">
                          {item.quantity} {getUnitLabel(item.recipeUnit)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                          {formatCurrency(item.calculatedCost, business.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-gray-400 hover:text-rose-600 p-1 rounded-md"
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

          {/* PROFITABILITY BREAKDOWN & PRICING WIDGET */}
          <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/80 p-5 rounded-3xl border-2 border-amber-300/80 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded-full">
                  Fórmula y Análisis de Rentabilidad
                </span>
                <h4 className="text-base font-bold text-gray-900 font-serif mt-1">
                  Cálculo Exacto por Unidad y por Lote Completo
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Margen Objetivo:</span>
                <div className="flex items-center gap-1 font-bold text-amber-900">
                  <input
                    type="number"
                    min="1"
                    max="95"
                    value={targetMarginPercent}
                    onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                    className="w-14 px-2 py-1 rounded-lg border border-amber-300 text-center text-xs font-mono"
                  />
                  <span>%</span>
                </div>
                <button
                  type="button"
                  onClick={handleApplySuggestedPrice}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold cursor-pointer"
                  title="Fijar precio de venta calculado por margen deseado"
                >
                  Aplicar Sugerido ({formatCurrency(suggestedPriceFromMargin, business.currencySymbol)})
                </button>
              </div>
            </div>

            {/* 4 Interactive Result Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Total Batch Cost */}
              <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase">1. Inversión del Lote</span>
                <div className="text-lg font-bold text-gray-900 font-mono mt-0.5">
                  {formatCurrency(totalBatchCost, business.currencySymbol)}
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Insumos ({formatCurrency(ingredientsCostSum, business.currencySymbol)}) + Gastos ({formatCurrency(otherDirectCosts, business.currencySymbol)})
                </p>
              </div>

              {/* Cost Per Unit */}
              <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase">2. Costo por {yieldUnitName.slice(0, -1) || 'Unidad'}</span>
                <div className="text-lg font-bold text-amber-900 font-mono mt-0.5">
                  {formatCurrency(costPerUnit, business.currencySymbol)}
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Fórmula: {totalBatchCost} ÷ {safeYield} unidades
                </p>
              </div>

              {/* Selling Price */}
              <div className="bg-white p-3 rounded-2xl border-2 border-amber-500 shadow-2xs">
                <span className="text-[10px] font-bold text-amber-800 uppercase flex items-center justify-between">
                  <span>3. Precio de Venta *</span>
                  <span className="text-[9px] text-amber-600">Editable</span>
                </span>
                <div className="mt-1 flex items-center gap-1 font-mono">
                  <span className="text-gray-500 font-bold">{business.currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={sellingPrice}
                    onChange={(e) => handlePriceChange(Number(e.target.value))}
                    className="w-full text-lg font-bold text-gray-900 bg-amber-50/50 rounded-lg px-2 py-0.5 border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Sugerido: {formatCurrency(suggestedPriceFromMargin, business.currencySymbol)}
                </p>
              </div>

              {/* Profit per Unit & Total */}
              <div className="bg-white p-3 rounded-2xl border border-emerald-300 shadow-2xs">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">
                  4. Utilidad Neta
                </span>
                <div className="text-lg font-bold text-emerald-700 font-mono mt-0.5">
                  +{formatCurrency(profitPerUnit, business.currencySymbol)}
                </div>
                <div className="flex items-center justify-between text-[10px] text-emerald-800 font-semibold mt-1">
                  <span>Margen: {formatPercent(profitMarginPercent)}</span>
                  <span>Lote: +{formatCurrency(totalBatchProfit, business.currencySymbol)}</span>
                </div>
              </div>
            </div>

            {/* Explanation box */}
            <div className="p-3 bg-white/90 rounded-2xl border border-amber-200 text-[11px] text-gray-600 leading-relaxed">
              💡 <strong>Explicación del cálculo:</strong> Cada porción te cuesta{' '}
              <strong className="text-gray-900">{formatCurrency(costPerUnit, business.currencySymbol)}</strong> en materias primas y empaque. Al vender a{' '}
              <strong className="text-gray-900">{formatCurrency(sellingPrice, business.currencySymbol)}</strong>, obtienes{' '}
              <strong className="text-emerald-700">{formatCurrency(profitPerUnit, business.currencySymbol)}</strong> de ganancia líquida ({formatPercent(profitMarginPercent)} de margen de ganancia). Si vendes el lote completo de {safeYield} {yieldUnitName}, recaudas{' '}
              <strong className="text-gray-900">{formatCurrency(totalBatchRevenue, business.currencySymbol)}</strong>, recuperas tus{' '}
              <strong className="text-gray-900">{formatCurrency(totalBatchCost, business.currencySymbol)}</strong> invertidos y te quedan{' '}
              <strong className="text-emerald-700">{formatCurrency(totalBatchProfit, business.currencySymbol)}</strong> limpios.
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Notas Adicionales de la Receta (Tiempos de horneado, temperatura, consejos)</label>
            <textarea
              rows={2}
              placeholder="Ej: Hornear a 175°C durante 14 minutos. Dejar enfriar sobre rejilla 10 min antes de empaquetar."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 font-medium text-xs cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Guardar Producto y Costeo
          </button>
        </div>
      </div>
    </div>
  );
};
