import React from 'react';
import { Edit2, Trash2, Boxes } from 'lucide-react';
import { BusinessProfile, Ingredient } from '../../../entities';
import {
  formatCurrency,
  getUnitLabel,
  CostCalculator,
  StockService,
  normalizeCategoryName,
} from '../../../shared/lib';
import { CATEGORY_DEFINITIONS, CategoryDefinition } from './ingredientCategories';

interface IngredientGroup {
  categoryDef: CategoryDefinition;
  items: Ingredient[];
}

interface IngredientTableProps {
  viewMode: 'grouped' | 'list';
  filteredIngredients: Ingredient[];
  groupedCategories: IngredientGroup[];
  business: BusinessProfile;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (id: string) => void;
  onResetFilters: () => void;
}

export const IngredientTable: React.FC<IngredientTableProps> = ({
  viewMode,
  filteredIngredients,
  groupedCategories,
  business,
  onEdit,
  onDelete,
  onResetFilters,
}) => {
  if (filteredIngredients.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dulcinea-copper/25 p-12 text-center text-gray-400 space-y-3 shadow-sm">
        <Boxes className="w-12 h-12 mx-auto text-dulcinea-copper/70" />
        <p className="text-sm font-medium">
          No se encontraron insumos para la categoría o búsqueda seleccionada.
        </p>
        <button
          onClick={onResetFilters}
          className="px-4 py-2 rounded-2xl bg-dulcinea-midnight text-dulcinea-cream font-bold text-xs hover:bg-[#142433] transition-all active:scale-95 cursor-pointer"
        >
          Ver todos los insumos
        </button>
      </div>
    );
  }

  const renderStockBadge = (ing: Ingredient) => {
    const isLowStock = StockService.isLowStock(ing);
    return (
      <div className="space-y-1">
        <div className="font-mono text-xs font-bold text-gray-800">
          {ing.currentStock !== undefined ? `${ing.currentStock} ${ing.purchasePackageUnit}` : '—'}
        </div>
        {ing.minStockAlert !== undefined && ing.minStockAlert > 0 && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isLowStock
                ? 'bg-dulcinea-cherry/10 text-dulcinea-cherry border border-dulcinea-cherry/30'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {isLowStock ? '⚠️ Bajo Stock' : '✓ Óptimo'}
            <span className="text-[9px] font-normal opacity-80">(Mín: {ing.minStockAlert})</span>
          </span>
        )}
      </div>
    );
  };

  const renderRowActions = (ing: Ingredient) => (
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={() => onEdit(ing)}
        title="Editar insumo"
        className="p-1.5 text-gray-500 hover:text-dulcinea-midnight hover:bg-dulcinea-cream/70 rounded-lg transition-all active:scale-95 cursor-pointer"
      >
        <Edit2 className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => {
          if (window.confirm(`¿Seguro que deseas eliminar "${ing.name}"?`)) {
            onDelete(ing.id);
          }
        }}
        title="Eliminar insumo"
        className="p-1.5 text-gray-400 hover:text-dulcinea-cherry hover:bg-dulcinea-cherry/10 rounded-lg transition-all active:scale-95 cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  if (viewMode === 'grouped') {
    return (
      <div className="space-y-6">
        {groupedCategories.map(({ categoryDef, items }) => (
          <div
            key={categoryDef.id}
            className="bg-white rounded-2xl border border-dulcinea-copper/25 shadow-sm overflow-hidden"
          >
            <div
              className={`px-5 py-3.5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${categoryDef.accentBg}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{categoryDef.icon}</span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-dulcinea-midnight font-serif">
                    {categoryDef.name}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {items.length} {items.length === 1 ? 'insumo registrado' : 'insumos registrados'} en este grupo
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border self-start sm:self-auto ${categoryDef.badgeColor}`}
              >
                Categoría Activa
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/60 border-b border-gray-100 text-gray-400 uppercase text-[10px] font-semibold tracking-wider">
                    <th className="py-2.5 px-4">Insumo</th>
                    <th className="py-2.5 px-4">Presentación de Compra</th>
                    <th className="py-2.5 px-4 text-right">Precio Paquete</th>
                    <th className="py-2.5 px-4 text-right">Costo Unitario Calculado</th>
                    <th className="py-2.5 px-4">Stock en Taller</th>
                    <th className="py-2.5 px-4 text-center w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((ing) => {
                    const base = CostCalculator.convertToBaseUnit(
                      ing.purchasePackageQuantity,
                      ing.purchasePackageUnit
                    );
                    const costPerBaseUnit = base.baseValue > 0 ? ing.purchaseCost / base.baseValue : 0;
                    const unitText =
                      base.baseType === 'mass' ? '/ g' : base.baseType === 'volume' ? '/ ml' : '/ pza';

                    return (
                      <tr key={ing.id} className="hover:bg-dulcinea-cream/25 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-dulcinea-midnight text-xs">{ing.name}</div>
                          {ing.notes && <p className="text-[11px] text-gray-400 mt-0.5">{ing.notes}</p>}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-700">
                          {ing.purchasePackageQuantity} {getUnitLabel(ing.purchasePackageUnit)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-dulcinea-midnight">
                          {formatCurrency(ing.purchaseCost, business.currencySymbol)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-bold text-dulcinea-midnight bg-dulcinea-cream/70 px-2 py-0.5 rounded-md border border-dulcinea-copper/35">
                            {formatCurrency(costPerBaseUnit, business.currencySymbol)} {unitText}
                          </span>
                        </td>
                        <td className="py-3 px-4">{renderStockBadge(ing)}</td>
                        <td className="py-3 px-4 text-center">{renderRowActions(ing)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-dulcinea-copper/25 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-dulcinea-cream/40 border-b border-dulcinea-copper/20 text-gray-500 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Insumo</th>
              <th className="py-3 px-4">Categoría</th>
              <th className="py-3 px-4">Presentación de Compra</th>
              <th className="py-3 px-4 text-right">Costo Paquete</th>
              <th className="py-3 px-4 text-right">Costo Calculado</th>
              <th className="py-3 px-4">Stock en Taller</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredIngredients.map((ing) => {
              const base = CostCalculator.convertToBaseUnit(
                ing.purchasePackageQuantity,
                ing.purchasePackageUnit
              );
              const costPerBaseUnit = base.baseValue > 0 ? ing.purchaseCost / base.baseValue : 0;
              const unitText =
                base.baseType === 'mass' ? '/ g' : base.baseType === 'volume' ? '/ ml' : '/ pza';
              const catDef = CATEGORY_DEFINITIONS.find(
                (c) => c.id === normalizeCategoryName(ing.category)
              );

              return (
                <tr key={ing.id} className="hover:bg-dulcinea-cream/25 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-dulcinea-midnight">{ing.name}</div>
                    {ing.notes && <p className="text-[11px] text-gray-400 mt-0.5">{ing.notes}</p>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                        catDef ? catDef.badgeColor : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <span>{catDef?.icon}</span>
                      <span>{catDef?.name || ing.category}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-700">
                    {ing.purchasePackageQuantity} {getUnitLabel(ing.purchasePackageUnit)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-dulcinea-midnight">
                    {formatCurrency(ing.purchaseCost, business.currencySymbol)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-mono font-bold text-dulcinea-midnight bg-dulcinea-cream/70 px-2 py-0.5 rounded-md border border-dulcinea-copper/35">
                      {formatCurrency(costPerBaseUnit, business.currencySymbol)} {unitText}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">{renderStockBadge(ing)}</td>
                  <td className="py-3.5 px-4 text-center">{renderRowActions(ing)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
