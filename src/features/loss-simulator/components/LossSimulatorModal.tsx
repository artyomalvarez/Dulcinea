import React, { useState, useMemo } from 'react';
import {
  AlertOctagon,
  Trash2,
  Plus,
  Flame,
  X,
  TrendingDown,
  RefreshCw,
  Info,
  DollarSign,
  Package,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { BusinessProfile, Ingredient, Product, WasteReason, WasteRecord, WasteType } from '../../../entities';
import {
  formatCurrency,
  formatPercent,
  CostCalculator,
  calculateIngredientRecipeCost
} from '../../../shared/lib';

interface LossSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  ingredients: Ingredient[];
  wastes: WasteRecord[];
  business: BusinessProfile;
  onSaveWaste: (waste: WasteRecord) => void;
  onDeleteWaste: (id: string) => void;
}

const REASON_LABELS: Record<WasteReason, string> = {
  quemado: 'Quemado en horno',
  roto_deforme: 'Roto / Deforme / Accidente',
  caducado: 'Caducado / Vencido',
  derrame_accidente: 'Derrame / Rotura de empaque',
  error_pesaje: 'Error de pesaje / Mezcla',
  merma_horneado: 'Merma de cocción / Recorte',
  otro: 'Otro motivo',
};

export const LossSimulatorModal: React.FC<LossSimulatorModalProps> = ({
  isOpen,
  onClose,
  products,
  ingredients,
  wastes,
  business,
  onSaveWaste,
  onDeleteWaste,
}) => {
  const [activeTab, setActiveTab] = useState<'producto' | 'insumo' | 'proceso'>('producto');

  // Product Loss Simulator State
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [damagedUnits, setDamagedUnits] = useState<number>(3);
  const [productReason, setProductReason] = useState<WasteReason>('quemado');
  const [productNotes, setProductNotes] = useState<string>('');

  // Ingredient Loss Simulator State
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>(ingredients[0]?.id || '');
  const [wastedQty, setWastedQty] = useState<number>(250);
  const [ingredientReason, setIngredientReason] = useState<WasteReason>('derrame_accidente');
  const [ingredientNotes, setIngredientNotes] = useState<string>('');

  // Process Waste State
  const [processProductId, setProcessProductId] = useState<string>(products[0]?.id || '');
  const [processLossPercent, setProcessLossPercent] = useState<number>(10);

  // Selected entities
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || products[0],
    [products, selectedProductId]
  );

  const selectedIngredient = useMemo(
    () => ingredients.find((i) => i.id === selectedIngredientId) || ingredients[0],
    [ingredients, selectedIngredientId]
  );

  const processProduct = useMemo(
    () => products.find((p) => p.id === processProductId) || products[0],
    [products, processProductId]
  );

  // Product Loss Calculations via CostCalculator
  const productMetrics = useMemo(() => {
    if (!selectedProduct) return null;
    return CostCalculator.calculateLossMetrics(selectedProduct, damagedUnits);
  }, [selectedProduct, damagedUnits]);

  // Ingredient Loss Calculations
  const ingredientLossCost = useMemo(() => {
    if (!selectedIngredient || wastedQty <= 0) return 0;
    return calculateIngredientRecipeCost(
      wastedQty,
      selectedIngredient.purchasePackageUnit,
      selectedIngredient.purchasePackageQuantity,
      selectedIngredient.purchasePackageUnit,
      selectedIngredient.purchaseCost
    );
  }, [selectedIngredient, wastedQty]);

  // Process Merma Calculations
  const processMermaMetrics = useMemo(() => {
    if (!processProduct) return null;
    const baseMetrics = CostCalculator.calculateProductMetrics(processProduct);
    const effectiveYield = Math.max(1, processProduct.batchYieldUnits * (1 - processLossPercent / 100));
    const inflatedCostPerUnit = Math.round((baseMetrics.totalBatchCost / effectiveYield) * 100) / 100;
    const unitCostIncrease = Math.round((inflatedCostPerUnit - baseMetrics.costPerUnit) * 100) / 100;
    const marginLoss = Math.round((baseMetrics.profitMarginPercent - CostCalculator.calculateMargin(processProduct.sellingPrice, inflatedCostPerUnit)) * 10) / 10;

    return {
      baseCostPerUnit: baseMetrics.costPerUnit,
      inflatedCostPerUnit,
      unitCostIncrease,
      marginLoss,
      annualLossEstimate: Math.round(unitCostIncrease * processProduct.batchYieldUnits * 52 * 100) / 100, // Asumiendo 1 lote semanal
    };
  }, [processProduct, processLossPercent]);

  // Total accumulated loss cost in the system
  const totalAccumulatedLoss = useMemo(() => {
    return Math.round(wastes.reduce((sum, w) => sum + (w.directCostLost || 0), 0) * 100) / 100;
  }, [wastes]);

  if (!isOpen) return null;

  const handleRegisterProductLoss = () => {
    if (!selectedProduct || !productMetrics || damagedUnits <= 0) return;

    const record: WasteRecord = {
      id: `waste-prod-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      type: 'producto_danado',
      itemId: selectedProduct.id,
      itemName: selectedProduct.name,
      quantity: damagedUnits,
      unit: selectedProduct.yieldUnitName || 'unidades',
      directCostLost: productMetrics.directCostLost,
      potentialRevenueLost: productMetrics.potentialRevenueLost,
      reason: productReason,
      notes: productNotes || `Pérdida de ${damagedUnits} unidades de ${selectedProduct.name}`,
    };

    onSaveWaste(record);
    setProductNotes('');
  };

  const handleRegisterIngredientLoss = () => {
    if (!selectedIngredient || wastedQty <= 0) return;

    const record: WasteRecord = {
      id: `waste-ing-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      type: 'insumo_vencido',
      itemId: selectedIngredient.id,
      itemName: selectedIngredient.name,
      quantity: wastedQty,
      unit: selectedIngredient.purchasePackageUnit,
      directCostLost: ingredientLossCost,
      potentialRevenueLost: 0,
      reason: ingredientReason,
      notes: ingredientNotes || `Merma de ${wastedQty} ${selectedIngredient.purchasePackageUnit} de ${selectedIngredient.name}`,
    };

    onSaveWaste(record);
    setIngredientNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-dulcinea-midnight/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-dulcinea-copper/30 flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-dulcinea-midnight via-[#1F3A52] to-[#142433] text-white rounded-t-3xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dulcinea-cherry/25 border border-dulcinea-cherry/40 text-xs font-bold text-dulcinea-cream mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
              <span>Simulador de Pérdidas y Mermas</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-dulcinea-cream!">
              Control de Merma y Daño en el Proceso
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Calcula con precisión de centavo cuánto dinero se pierde por panes quemados, pasteles rotos o materias primas vencidas.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Summary Alert if losses exist */}
        {totalAccumulatedLoss > 0 && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center justify-between text-xs text-rose-800">
            <span className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>
                Pérdidas totales acumuladas en tu taller: <strong>{wastes.length} registros</strong>
              </span>
            </span>
            <span className="font-mono font-bold text-rose-900 bg-rose-200/70 px-2 py-0.5 rounded-lg">
              Total perdido: {formatCurrency(totalAccumulatedLoss, business.currencySymbol)}
            </span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-2 border-b border-gray-100 flex items-center gap-2 bg-stone-50/50">
          <button
            onClick={() => setActiveTab('producto')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'producto'
                ? 'bg-dulcinea-midnight text-dulcinea-cream shadow-sm'
                : 'text-stone-600 hover:text-dulcinea-midnight hover:bg-stone-200/60'
            }`}
          >
            <Flame className="w-4 h-4 text-dulcinea-copper" />
            <span>1. Pan o Pastel Dañado</span>
          </button>

          <button
            onClick={() => setActiveTab('insumo')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'insumo'
                ? 'bg-dulcinea-midnight text-dulcinea-cream shadow-sm'
                : 'text-stone-600 hover:text-dulcinea-midnight hover:bg-stone-200/60'
            }`}
          >
            <Package className="w-4 h-4 text-dulcinea-copper" />
            <span>2. Insumo Desperdiciado</span>
          </button>

          <button
            onClick={() => setActiveTab('proceso')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'proceso'
                ? 'bg-dulcinea-midnight text-dulcinea-cream shadow-sm'
                : 'text-stone-600 hover:text-dulcinea-midnight hover:bg-stone-200/60'
            }`}
          >
            <Layers className="w-4 h-4 text-dulcinea-copper" />
            <span>3. Merma de Proceso (%)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* TAB 1: PRODUCT LOSS */}
          {activeTab === 'producto' && selectedProduct && productMetrics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Inputs Column */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-4">
                  <h3 className="text-sm font-bold text-dulcinea-midnight font-serif">
                    Parámetros del Producto Afectado
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Selecciona la Receta / Producto
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-dulcinea-copper focus:outline-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Rinde: {p.batchYieldUnits} {p.yieldUnitName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Unidades Dañadas / Rotas
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={selectedProduct.batchYieldUnits * 3}
                        value={damagedUnits}
                        onChange={(e) => setDamagedUnits(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-gray-300 bg-white text-center focus:ring-2 focus:ring-dulcinea-cherry focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Causa Principal
                      </label>
                      <select
                        value={productReason}
                        onChange={(e) => setProductReason(e.target.value as WasteReason)}
                        className="w-full px-2.5 py-2 text-xs rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-dulcinea-copper focus:outline-none"
                      >
                        {Object.entries(REASON_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nota o Detalle (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Se cayó la bandeja al sacar del horno..."
                      value={productNotes}
                      onChange={(e) => setProductNotes(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 bg-white focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleRegisterProductLoss}
                    className="w-full py-2.5 rounded-xl bg-dulcinea-cherry text-white font-bold text-xs sm:text-sm hover:bg-[#a02c20] transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <AlertOctagon className="w-4 h-4" />
                    <span>Registrar Pérdida en el Sistema</span>
                  </button>
                </div>

                {/* Financial Impact Cards */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-dulcinea-midnight font-serif flex items-center justify-between">
                    <span>Impacto Financiero del Daño</span>
                    <span className="text-xs font-normal text-stone-500">
                      Lote de {selectedProduct.batchYieldUnits} {selectedProduct.yieldUnitName}
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 space-y-1">
                      <span className="text-[11px] font-bold text-rose-700 block">
                        Costo Directo Tirado a la Basura
                      </span>
                      <div className="text-xl sm:text-2xl font-mono font-extrabold text-rose-900">
                        {formatCurrency(productMetrics.directCostLost, business.currencySymbol)}
                      </div>
                      <span className="text-[10px] text-rose-600 block">
                        Harina, manteca, azúcar y gas invertidos sin retorno.
                      </span>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-1">
                      <span className="text-[11px] font-bold text-amber-800 block">
                        Venta Potencial Perdida
                      </span>
                      <div className="text-xl sm:text-2xl font-mono font-extrabold text-amber-900">
                        {formatCurrency(productMetrics.potentialRevenueLost, business.currencySymbol)}
                      </div>
                      <span className="text-[10px] text-amber-700 block">
                        Ingreso que el cliente habría pagado ({formatCurrency(selectedProduct.sellingPrice, business.currencySymbol)} c/u).
                      </span>
                    </div>
                  </div>

                  {/* Profitability Drop Indicator */}
                  <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                      <span>Caída del Margen del Lote:</span>
                      <span className="flex items-center gap-1.5 font-mono">
                        <span className="text-emerald-700">{formatPercent(productMetrics.originalMarginPercent)}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                        <span className={productMetrics.adjustedMarginPercent >= 0 ? 'text-amber-700' : 'text-rose-700'}>
                          {formatPercent(productMetrics.adjustedMarginPercent)}
                        </span>
                      </span>
                    </div>

                    {/* Progress Bar comparison */}
                    <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${Math.max(0, Math.min(100, productMetrics.adjustedMarginPercent))}%` }}
                      ></div>
                      <div
                        className="bg-rose-400 h-full opacity-60 transition-all duration-300"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(100, productMetrics.originalMarginPercent - Math.max(0, productMetrics.adjustedMarginPercent))
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Por culpa de {damagedUnits} unidades dañadas, la utilidad de la horneada cayó de{' '}
                      <strong>{formatCurrency(productMetrics.originalBatchProfit, business.currencySymbol)}</strong> a{' '}
                      <strong className={productMetrics.adjustedBatchProfit < 0 ? 'text-rose-700' : 'text-stone-800'}>
                        {formatCurrency(productMetrics.adjustedBatchProfit, business.currencySymbol)}
                      </strong>.
                    </p>
                  </div>

                  {/* Recovery Rule Callout */}
                  <div className="bg-dulcinea-cream/60 border border-dulcinea-copper/40 p-3.5 rounded-2xl flex items-start gap-3">
                    <TrendingDown className="w-5 h-5 text-dulcinea-cherry shrink-0 mt-0.5" />
                    <div className="text-xs text-dulcinea-midnight">
                      <strong className="block font-serif font-bold text-sm">
                        Esfuerzo de Recuperación Dulcinea:
                      </strong>
                      <span>
                        Debes vender al menos{' '}
                        <strong className="font-mono text-dulcinea-cherry font-extrabold text-sm">
                          {productMetrics.unitsToRecoverLoss} {selectedProduct.yieldUnitName}
                        </strong>{' '}
                        buenos solo para empatar y absorber el costo de las unidades que se rompieron o quemaron.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INGREDIENT LOSS */}
          {activeTab === 'insumo' && selectedIngredient && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Inputs */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-4">
                  <h3 className="text-sm font-bold text-dulcinea-midnight font-serif">
                    Materia Prima Afectada
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Insumo de Almacén
                    </label>
                    <select
                      value={selectedIngredientId}
                      onChange={(e) => setSelectedIngredientId(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-dulcinea-copper focus:outline-none"
                    >
                      {ingredients.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name} (Stock: {i.currentStock ?? 0} {i.purchasePackageUnit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Cantidad Desperdiciada ({selectedIngredient.purchasePackageUnit})
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={wastedQty}
                        onChange={(e) => setWastedQty(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-gray-300 bg-white text-center focus:ring-2 focus:ring-dulcinea-cherry focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Causa
                      </label>
                      <select
                        value={ingredientReason}
                        onChange={(e) => setIngredientReason(e.target.value as WasteReason)}
                        className="w-full px-2.5 py-2 text-xs rounded-xl border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-dulcinea-copper focus:outline-none"
                      >
                        {Object.entries(REASON_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nota
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Caducó en refrigeración o rotura de envase..."
                      value={ingredientNotes}
                      onChange={(e) => setIngredientNotes(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 bg-white focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleRegisterIngredientLoss}
                    className="w-full py-2.5 rounded-xl bg-dulcinea-cherry text-white font-bold text-xs sm:text-sm hover:bg-[#a02c20] transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Descontar de Stock y Registrar Merma</span>
                  </button>
                </div>

                {/* Ingredient Loss Metrics */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-dulcinea-midnight font-serif">
                    Valor Monetario Perdido
                  </h3>

                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
                    <span className="text-xs font-bold text-rose-700">
                      Dinero Directo Perdido en este Insumo
                    </span>
                    <div className="text-3xl font-mono font-extrabold text-rose-900">
                      {formatCurrency(ingredientLossCost, business.currencySymbol)}
                    </div>
                    <p className="text-xs text-rose-700 leading-relaxed">
                      Representa {wastedQty} {selectedIngredient.purchasePackageUnit} de{' '}
                      <strong>{selectedIngredient.name}</strong> a un costo de compra de{' '}
                      {formatCurrency(selectedIngredient.purchaseCost, business.currencySymbol)} por paquete.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-stone-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Stock Actual en Almacén:</span>
                      <span className="font-mono font-bold text-stone-800">
                        {selectedIngredient.currentStock ?? 0} {selectedIngredient.purchasePackageUnit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Stock Resultante tras la Merma:</span>
                      <span className="font-mono font-bold text-dulcinea-cherry">
                        {Math.max(0, (selectedIngredient.currentStock ?? 0) - wastedQty)}{' '}
                        {selectedIngredient.purchasePackageUnit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROCESS MERMA */}
          {activeTab === 'proceso' && processProduct && processMermaMetrics && (
            <div className="space-y-6">
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-dulcinea-midnight font-serif">
                      Simulador de Merma Oculta en Cocción o Recorte
                    </h3>
                    <p className="text-xs text-stone-500">
                      La evaporación en horno o recortes de masa hacen que cada porción real cueste más de lo previsto.
                    </p>
                  </div>

                  <select
                    value={processProductId}
                    onChange={(e) => setProcessProductId(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-xl border border-gray-300 bg-white font-medium"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1">
                    <span>Porcentaje de Merma Estimada en Masa / Horneado:</span>
                    <span className="font-mono text-sm text-dulcinea-cherry">{processLossPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={processLossPercent}
                    onChange={(e) => setProcessLossPercent(Number(e.target.value))}
                    className="w-full accent-dulcinea-cherry cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                    <span>1% (Mínima)</span>
                    <span>10% (Típica en bizcochos)</span>
                    <span>20% (Recortes de hojaldre o fondant)</span>
                    <span>30% (Alta)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white p-3 rounded-xl border border-stone-200">
                    <span className="text-[11px] text-stone-500 block">Costo Teórico Unitario</span>
                    <span className="text-lg font-mono font-bold text-stone-800">
                      {formatCurrency(processMermaMetrics.baseCostPerUnit, business.currencySymbol)}
                    </span>
                  </div>

                  <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                    <span className="text-[11px] text-rose-700 block">Costo Real Inflado</span>
                    <span className="text-lg font-mono font-bold text-rose-900">
                      {formatCurrency(processMermaMetrics.inflatedCostPerUnit, business.currencySymbol)}
                    </span>
                    <span className="text-[10px] text-rose-600 block">
                      +{formatCurrency(processMermaMetrics.unitCostIncrease, business.currencySymbol)} por unidad
                    </span>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                    <span className="text-[11px] text-amber-800 block">Fuga Anual Estimada</span>
                    <span className="text-lg font-mono font-bold text-amber-900">
                      {formatCurrency(processMermaMetrics.annualLossEstimate, business.currencySymbol)}
                    </span>
                    <span className="text-[10px] text-amber-700 block">
                      En 52 hornadas anuales
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REGISTERED WASTES HISTORY TABLE */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-dulcinea-midnight font-serif flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-dulcinea-cherry" />
                <span>Historial de Mermas Registradas ({wastes.length})</span>
              </h3>
              {wastes.length > 0 && (
                <span className="text-xs font-mono font-bold text-rose-700">
                  Total Pérdidas: {formatCurrency(totalAccumulatedLoss, business.currencySymbol)}
                </span>
              )}
            </div>

            {wastes.length === 0 ? (
              <div className="bg-stone-50 rounded-2xl p-6 text-center text-stone-400 text-xs">
                No hay registros de mermas ni productos dañados. ¡Excelente control de calidad!
              </div>
            ) : (
              <div className="border border-stone-200 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-600 font-bold border-b border-stone-200">
                    <tr>
                      <th className="py-2 px-3">Fecha</th>
                      <th className="py-2 px-3">Ítem Afectado</th>
                      <th className="py-2 px-3">Cantidad</th>
                      <th className="py-2 px-3">Causa</th>
                      <th className="py-2 px-3 text-right">Costo Perdido</th>
                      <th className="py-2 px-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {wastes.map((w) => (
                      <tr key={w.id} className="hover:bg-stone-50">
                        <td className="py-2 px-3 text-stone-500 font-mono">{w.date}</td>
                        <td className="py-2 px-3 font-medium text-stone-800">
                          {w.itemName}
                          {w.notes && (
                            <span className="block text-[10px] text-stone-400">{w.notes}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono">
                          {w.quantity} {w.unit}
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {REASON_LABELS[w.reason] || w.reason}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-rose-700">
                          {formatCurrency(w.directCostLost, business.currencySymbol)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => onDeleteWaste(w.id)}
                            className="p-1 text-stone-400 hover:text-dulcinea-cherry transition-colors cursor-pointer"
                            title="Eliminar registro de merma"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-dulcinea-midnight text-dulcinea-cream font-bold text-xs sm:text-sm hover:bg-[#142433] transition-all cursor-pointer"
          >
            Cerrar Simulador
          </button>
        </div>
      </div>
    </div>
  );
};
