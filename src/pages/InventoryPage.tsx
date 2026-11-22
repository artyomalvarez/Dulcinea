import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Boxes,
  ShoppingCart,
  History,
  Copy,
  Check,
  CheckCircle2,
  PlusCircle,
  Flame,
  Package,
  ChefHat,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import {
  BusinessProfile,
  Ingredient,
  ProductionBatch,
  WasteRecord,
} from '../entities';
import { formatCurrency, StockService } from '../shared/lib';
import { IngredientManager } from '../features/ingredients/components/IngredientManager';

interface InventoryPageProps {
  ingredients: Ingredient[];
  batches: ProductionBatch[];
  wastes: WasteRecord[];
  business: BusinessProfile;
  initialSubTab?: 'existencias' | 'reposicion' | 'movimientos';
  onSaveIngredient: (ingredient: Ingredient) => void;
  onDeleteIngredient: (id: string) => void;
  onUpdateIngredientStock: (id: string, newStock: number) => void;
  onOpenLossSimulator: () => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  ingredients,
  batches,
  wastes,
  business,
  initialSubTab = 'existencias',
  onSaveIngredient,
  onDeleteIngredient,
  onUpdateIngredientStock,
  onOpenLossSimulator,
}) => {
  const [subTab, setSubTab] = useState<'existencias' | 'reposicion' | 'movimientos'>(initialSubTab);
  const [copiedList, setCopiedList] = useState(false);

  React.useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  const { items: shoppingListItems, totalEstimatedRestockCost } =
    StockService.buildShoppingList(ingredients);

  const ingredientWastes = wastes.filter((w) => w.type === 'insumo_vencido');

  const handleCopyShoppingList = () => {
    if (shoppingListItems.length === 0) return;
    let text = `LISTA DE REPOSICIÓN DE INVENTARIO - ${business.businessName || 'Dulcinea'}\n`;
    text += `Insumos críticos (${shoppingListItems.length}):\n`;
    text += `----------------------------------------\n`;
    shoppingListItems.forEach((item, idx) => {
      const unit = item.ingredient.purchasePackageUnit;
      text += `${idx + 1}. ${item.ingredient.name}\n`;
      text += `   Actual: ${item.currentStock} ${unit} | Mínimo: ${item.minStockAlert} ${unit}\n`;
      text += `   Sugerido: ${item.packagesNeeded} paq. de ${item.ingredient.purchasePackageQuantity} ${unit} (~${formatCurrency(item.estimatedCost, business.currencySymbol)})\n`;
    });
    text += `----------------------------------------\n`;
    text += `Total estimado: ${formatCurrency(totalEstimatedRestockCost, business.currencySymbol)}\n`;
    navigator.clipboard.writeText(text);
    setCopiedList(true);
    toast.success('Lista de compras copiada al portapapeles.');
    setTimeout(() => setCopiedList(false), 3000);
  };

  const handleRestockEntry = (
    ing: Ingredient,
    currentStock: number,
    packagesNeeded: number
  ) => {
    const pkgQty = ing.purchasePackageQuantity > 0 ? ing.purchasePackageQuantity : 1;
    const addedQty = Math.round(packagesNeeded * pkgQty * 100) / 100;
    const newStock = Math.round((currentStock + addedQty) * 100) / 100;
    onUpdateIngredientStock(ing.id, newStock);
    toast.success(
      `Entrada registrada: +${addedQty} ${ing.purchasePackageUnit} de ${ing.name} (Stock actual: ${newStock} ${ing.purchasePackageUnit}).`
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Sub-navigation tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-dulcinea-copper/25 shadow-sm">
        <div className="flex items-center bg-dulcinea-cream/55 p-1 rounded-xl overflow-x-auto">
          <button
            onClick={() => setSubTab('existencias')}
            className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              subTab === 'existencias'
                ? 'bg-white text-dulcinea-midnight shadow-sm'
                : 'text-dulcinea-muted hover:text-dulcinea-midnight'
            }`}
          >
            <Boxes className="w-4 h-4 text-dulcinea-copper" />
            <span>Existencias</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-dulcinea-cream text-dulcinea-midnight font-mono">
              {ingredients.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('reposicion')}
            className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              subTab === 'reposicion'
                ? 'bg-white text-dulcinea-midnight shadow-sm'
                : 'text-dulcinea-muted hover:text-dulcinea-midnight'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-dulcinea-copper" />
            <span>Reposición</span>
            {shoppingListItems.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-dulcinea-cherry text-white font-mono">
                {shoppingListItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('movimientos')}
            className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              subTab === 'movimientos'
                ? 'bg-white text-dulcinea-midnight shadow-sm'
                : 'text-dulcinea-muted hover:text-dulcinea-midnight'
            }`}
          >
            <History className="w-4 h-4 text-dulcinea-copper" />
            <span>Movimientos y Mermas</span>
          </button>
        </div>

        <button
          onClick={onOpenLossSimulator}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-dulcinea-cherry/10 hover:bg-dulcinea-cherry/15 text-dulcinea-cherry border border-dulcinea-cherry/30 font-bold text-xs transition-colors cursor-pointer"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Registrar Merma de Insumo</span>
        </button>
      </div>

      {/* Tab 1: Existencias */}
      {subTab === 'existencias' && (
        <IngredientManager
          ingredients={ingredients}
          onSaveIngredient={onSaveIngredient}
          onDeleteIngredient={onDeleteIngredient}
          onUpdateStock={onUpdateIngredientStock}
          business={business}
        />
      )}

      {/* Tab 2: Reposición y Compras */}
      {subTab === 'reposicion' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-dulcinea-copper/25 shadow-sm">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-dulcinea-midnight font-serif">
                Lista de Reposición Recomendada
              </h2>
              <p className="text-xs sm:text-sm text-dulcinea-muted mt-0.5">
                Insumos por debajo de su existencia mínima recomendada y presupuesto estimado de compra.
              </p>
            </div>

            {shoppingListItems.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-dulcinea-muted block">
                    Inversión Estimada
                  </span>
                  <span className="text-base font-mono font-bold text-dulcinea-midnight">
                    {formatCurrency(totalEstimatedRestockCost, business.currencySymbol)}
                  </span>
                </div>
                <button
                  onClick={handleCopyShoppingList}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-dulcinea-blue hover:bg-[#2f698d] text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                >
                  {copiedList ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedList ? 'Copiada' : 'Copiar Lista'}</span>
                </button>
              </div>
            )}
          </div>

          {shoppingListItems.length === 0 ? (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-10 text-center space-y-2 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-dulcinea-success mx-auto" />
              <h3 className="text-base font-bold text-dulcinea-midnight font-serif">
                ¡Todo en orden! No tienes insumos por debajo del mínimo recomendado.
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Todas tus materias primas tienen existencias suficientes para continuar operando en el taller.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dulcinea-copper/25 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200/80 text-stone-500 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-4">Insumo</th>
                      <th className="py-3.5 px-4 text-right">Existencia Actual</th>
                      <th className="py-3.5 px-4 text-right">Mínimo</th>
                      <th className="py-3.5 px-4 text-right">Faltante</th>
                      <th className="py-3.5 px-4 text-center">Compra Sugerida</th>
                      <th className="py-3.5 px-4 text-right">Costo Est.</th>
                      <th className="py-3.5 px-4 text-center">Acción Rápida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {shoppingListItems.map((item) => {
                      const unit = item.ingredient.purchasePackageUnit;
                      return (
                        <tr key={item.ingredient.id} className="hover:bg-stone-50/70">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-dulcinea-midnight">
                              {item.ingredient.name}
                            </div>
                            <span className="text-[10px] text-dulcinea-muted">
                              {item.ingredient.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-dulcinea-cherry">
                            {item.currentStock} {unit}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-stone-600">
                            {item.minStockAlert} {unit}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-dulcinea-warning">
                            {item.deficit} {unit}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-dulcinea-cream/70 text-dulcinea-midnight font-mono font-bold">
                              {item.packagesNeeded} paq. × {item.ingredient.purchasePackageQuantity} {unit}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-dulcinea-midnight">
                            {formatCurrency(item.estimatedCost, business.currencySymbol)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() =>
                                handleRestockEntry(
                                  item.ingredient,
                                  item.currentStock,
                                  item.packagesNeeded
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dulcinea-success hover:bg-[#1f6b49] text-white font-bold text-[11px] transition-all active:scale-95 cursor-pointer shadow-2xs"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Registrar entrada (+Stock)</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Movimientos y Mermas */}
      {subTab === 'movimientos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consumo por Producción de Lotes */}
          <div className="bg-white rounded-2xl border border-dulcinea-copper/25 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-dulcinea-copper" />
                <h3 className="text-sm font-bold text-dulcinea-midnight font-serif">
                  Consumo en Lotes de Producción
                </h3>
              </div>
              <span className="text-xs font-mono text-dulcinea-muted">
                {batches.length} lotes
              </span>
            </div>

            {batches.length === 0 ? (
              <p className="text-xs text-dulcinea-muted py-6 text-center">
                No hay lotes producidos registrados aún.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {batches.slice(0, 10).map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-dulcinea-midnight flex items-center gap-1.5">
                        <ArrowUpRight className="w-3.5 h-3.5 text-dulcinea-blue" />
                        <span>{b.productName}</span>
                      </div>
                      <span className="text-[11px] text-dulcinea-muted font-mono">
                        {b.date} · {b.batchCode} ({b.totalUnitsProduced} unidades)
                      </span>
                    </div>
                    <span className="font-mono font-bold text-dulcinea-midnight">
                      -{formatCurrency(b.totalSuppliesCost, business.currencySymbol)} en insumos
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mermas y Ajustes de Insumos */}
          <div className="bg-white rounded-2xl border border-dulcinea-copper/25 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-dulcinea-cherry" />
                <h3 className="text-sm font-bold text-dulcinea-midnight font-serif">
                  Mermas, Caducidad y Derrames de Insumos
                </h3>
              </div>
              <button
                onClick={onOpenLossSimulator}
                className="text-xs font-bold text-dulcinea-blue hover:underline cursor-pointer"
              >
                + Nueva merma
              </button>
            </div>

            {ingredientWastes.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-dulcinea-success mx-auto" />
                <p className="text-xs text-dulcinea-muted">
                  No se han registrado mermas de materias primas.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {ingredientWastes.map((w) => (
                  <div
                    key={w.id}
                    className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-dulcinea-midnight flex items-center gap-1.5">
                        <ArrowDownRight className="w-3.5 h-3.5 text-dulcinea-cherry" />
                        <span>{w.itemName}</span>
                      </div>
                      <span className="text-[11px] text-rose-700 font-mono">
                        {w.date} · -{w.quantity} {w.unit} ({w.reason})
                      </span>
                    </div>
                    <span className="font-mono font-bold text-dulcinea-cherry">
                      -{formatCurrency(w.directCostLost, business.currencySymbol)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
