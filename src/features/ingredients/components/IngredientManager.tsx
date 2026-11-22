import React, { useState, useMemo } from 'react';
import { Plus, Search, FolderTree, ListFilter, AlertTriangle, Boxes, DollarSign } from 'lucide-react';
import { BusinessProfile, Ingredient } from '../../../entities';
import { normalizeCategoryName, StockService, formatCurrency } from '../../../shared/lib';
import { CATEGORY_DEFINITIONS, CategoryDefinition } from './ingredientCategories';
import { IngredientCategoryPills } from './IngredientCategoryPills';
import { IngredientTable } from './IngredientTable';
import { IngredientFormModal } from './IngredientFormModal';

export { CATEGORY_DEFINITIONS, normalizeCategoryName };

interface IngredientManagerProps {
  ingredients: Ingredient[];
  onSaveIngredient: (ingredient: Ingredient) => void;
  onDeleteIngredient: (id: string) => void;
  onUpdateStock?: (id: string, newStock: number) => void;
  business: BusinessProfile;
}

export const IngredientManager: React.FC<IngredientManagerProps> = ({
  ingredients,
  onSaveIngredient,
  onDeleteIngredient,
  onUpdateStock,
  business,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  const lowStockCount = useMemo(() => {
    return ingredients.filter(StockService.isLowStock).length;
  }, [ingredients]);

  const totalInventoryValue = useMemo(() => {
    return (
      Math.round(
        ingredients.reduce((acc, ing) => {
          const stock = ing.currentStock ?? 0;
          const pkgQty = ing.purchasePackageQuantity > 0 ? ing.purchasePackageQuantity : 1;
          const unitCost = ing.purchaseCost / pkgQty;
          return acc + stock * unitCost;
        }, 0) * 100
      ) / 100
    );
  }, [ingredients]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: ingredients.length };
    CATEGORY_DEFINITIONS.forEach((cat) => {
      counts[cat.id] = 0;
    });
    ingredients.forEach((ing) => {
      const normalized = normalizeCategoryName(ing.category);
      counts[normalized] = (counts[normalized] || 0) + 1;
    });
    return counts;
  }, [ingredients]);

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing) => {
      const normalized = normalizeCategoryName(ing.category);
      const matchesSearch =
        ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ing.notes && ing.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCat =
        selectedCategoryFilter === 'todos' || normalized === selectedCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [ingredients, searchTerm, selectedCategoryFilter]);

  const groupedCategories = useMemo(() => {
    const groups: { categoryDef: CategoryDefinition; items: Ingredient[] }[] = [];
    CATEGORY_DEFINITIONS.forEach((catDef) => {
      const itemsInGroup = filteredIngredients.filter(
        (ing) => normalizeCategoryName(ing.category) === catDef.id
      );
      if (itemsInGroup.length > 0) {
        groups.push({ categoryDef: catDef, items: itemsInGroup });
      }
    });
    return groups;
  }, [filteredIngredients]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-dulcinea-midnight font-serif">
            Catálogo de Insumos y Materias Primas
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Control de inventario, conteo físico rápido y alertas de stock mínimo para repostería.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingIngredient(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-dulcinea-midnight hover:bg-[#142433] text-dulcinea-cream font-bold text-xs sm:text-sm shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-dulcinea-copper" />
          <span>Nuevo Insumo</span>
        </button>
      </div>

      {/* Inventory Health & Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-dulcinea-copper/25 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Insumos en Catálogo
            </span>
            <span className="text-xl font-bold font-serif text-dulcinea-midnight">
              {ingredients.length} variedades
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-dulcinea-cream flex items-center justify-center text-dulcinea-copper">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-dulcinea-copper/25 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Alertas de Stock Mínimo
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-xl font-bold font-mono ${
                  lowStockCount > 0 ? 'text-dulcinea-cherry' : 'text-emerald-700'
                }`}
              >
                {lowStockCount} {lowStockCount === 1 ? 'crítico' : 'críticos'}
              </span>
              {lowStockCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-dulcinea-cherry/15 text-dulcinea-cherry">
                  Reabastecer
                </span>
              )}
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              lowStockCount > 0
                ? 'bg-dulcinea-cherry/10 text-dulcinea-cherry'
                : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-dulcinea-copper/25 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Valor Total en Almacén
            </span>
            <span className="text-xl font-bold font-mono text-dulcinea-midnight">
              {formatCurrency(totalInventoryValue, business.currencySymbol)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-dulcinea-copper/25 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar insumo (ej: Harina, Mantequilla, Perlas)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-dulcinea-copper/30 focus:border-dulcinea-copper"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-stone-400 font-medium">Modo de visualización:</span>
            <div className="flex items-center bg-dulcinea-cream/55 p-1 rounded-xl text-xs">
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'grouped'
                    ? 'bg-white text-dulcinea-midnight shadow-sm'
                    : 'text-stone-500 hover:text-dulcinea-midnight'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5 text-dulcinea-copper" />
                <span>Agrupado</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-dulcinea-midnight shadow-sm'
                    : 'text-stone-500 hover:text-dulcinea-midnight'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5 text-dulcinea-copper" />
                <span>Lista</span>
              </button>
            </div>
          </div>
        </div>

        <IngredientCategoryPills
          selectedCategoryFilter={selectedCategoryFilter}
          onSelectCategory={setSelectedCategoryFilter}
          categoryCounts={categoryCounts}
        />
      </div>

      <IngredientTable
        viewMode={viewMode}
        filteredIngredients={filteredIngredients}
        groupedCategories={groupedCategories}
        business={business}
        onEdit={(ing) => {
          setEditingIngredient(ing);
          setIsModalOpen(true);
        }}
        onDelete={onDeleteIngredient}
        onUpdateStock={onUpdateStock}
        onResetFilters={() => {
          setSelectedCategoryFilter('todos');
          setSearchTerm('');
        }}
      />

      <IngredientFormModal
        isOpen={isModalOpen}
        editingIngredient={editingIngredient}
        business={business}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveIngredient}
      />
    </div>
  );
};
