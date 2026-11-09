import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Package,
  Layers,
  Sparkles,
  Milk,
  Wheat,
  FolderTree,
  ListFilter,
  DollarSign
} from 'lucide-react';
import { BusinessProfile, Ingredient, IngredientCategory, UnitOfMeasure } from '../../types/bakery';
import { convertToBaseUnit, formatCurrency, getUnitLabel } from '../../utils/units';

interface IngredientManagerProps {
  ingredients: Ingredient[];
  onSaveIngredient: (ingredient: Ingredient) => void;
  onDeleteIngredient: (id: string) => void;
  business: BusinessProfile;
}

export const CATEGORY_DEFINITIONS: {
  id: IngredientCategory;
  name: string;
  icon: string;
  badgeColor: string;
  accentBg: string;
}[] = [
  {
    id: 'Harinas y Polvos',
    name: 'Harinas y Polvos',
    icon: '🌾',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    accentBg: 'bg-amber-50/60 border-amber-200',
  },
  {
    id: 'Lácteos y Grasas',
    name: 'Lácteos y Grasas',
    icon: '🥛',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
    accentBg: 'bg-blue-50/50 border-blue-200',
  },
  {
    id: 'Decoraciones y Coberturas',
    name: 'Decoraciones y Coberturas',
    icon: '✨',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
    accentBg: 'bg-purple-50/50 border-purple-200',
  },
  {
    id: 'Azúcares y Endulzantes',
    name: 'Azúcares y Endulzantes',
    icon: '🍬',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-200',
    accentBg: 'bg-rose-50/50 border-rose-200',
  },
  {
    id: 'Chocolates y Cacaos',
    name: 'Chocolates y Cacaos',
    icon: '🍫',
    badgeColor: 'bg-stone-200 text-stone-900 border-stone-300',
    accentBg: 'bg-stone-50 border-stone-200',
  },
  {
    id: 'Huevos',
    name: 'Huevos',
    icon: '🥚',
    badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-200',
    accentBg: 'bg-yellow-50/50 border-yellow-200',
  },
  {
    id: 'Esencias, Frutas y Sabores',
    name: 'Esencias, Frutas y Sabores',
    icon: '🍓',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    accentBg: 'bg-emerald-50/50 border-emerald-200',
  },
  {
    id: 'Empaque y Presentación',
    name: 'Empaque y Presentación',
    icon: '📦',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-200',
    accentBg: 'bg-orange-50/50 border-orange-200',
  },
  {
    id: 'Otros',
    name: 'Otros',
    icon: '🧂',
    badgeColor: 'bg-gray-100 text-gray-800 border-gray-200',
    accentBg: 'bg-gray-50 border-gray-200',
  },
];

// Helper to normalize legacy category names
export function normalizeCategoryName(raw: string): IngredientCategory {
  if (raw === 'Harinas y Granos') return 'Harinas y Polvos';
  if (raw === 'Azúcares') return 'Azúcares y Endulzantes';
  if (raw === 'Esencias y Frutas') return 'Esencias, Frutas y Sabores';
  return (raw as IngredientCategory) || 'Otros';
}

export const IngredientManager: React.FC<IngredientManagerProps> = ({
  ingredients,
  onSaveIngredient,
  onDeleteIngredient,
  business,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<IngredientCategory>('Lácteos y Grasas');
  const [purchasePackageQuantity, setPurchasePackageQuantity] = useState<number>(1000);
  const [purchasePackageUnit, setPurchasePackageUnit] = useState<UnitOfMeasure>('g');
  const [purchaseCost, setPurchaseCost] = useState<number>(30);
  const [currentStock, setCurrentStock] = useState<number>(1000);
  const [minStockAlert, setMinStockAlert] = useState<number>(500);
  const [notes, setNotes] = useState('');

  // Count items per category
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

  // Filtered ingredients
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

  // Grouped by category
  const groupedCategories = useMemo(() => {
    const groups: {
      categoryDef: typeof CATEGORY_DEFINITIONS[0];
      items: Ingredient[];
    }[] = [];

    CATEGORY_DEFINITIONS.forEach((catDef) => {
      const itemsInGroup = filteredIngredients.filter(
        (ing) => normalizeCategoryName(ing.category) === catDef.id
      );

      if (itemsInGroup.length > 0) {
        groups.push({
          categoryDef: catDef,
          items: itemsInGroup,
        });
      }
    });

    return groups;
  }, [filteredIngredients]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setCategory('Harinas y Polvos');
    setPurchasePackageQuantity(1000);
    setPurchasePackageUnit('g');
    setPurchaseCost(30);
    setCurrentStock(1000);
    setMinStockAlert(500);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ing: Ingredient) => {
    setEditingId(ing.id);
    setName(ing.name);
    setCategory(normalizeCategoryName(ing.category));
    setPurchasePackageQuantity(ing.purchasePackageQuantity);
    setPurchasePackageUnit(ing.purchasePackageUnit);
    setPurchaseCost(ing.purchaseCost);
    setCurrentStock(ing.currentStock !== undefined ? ing.currentStock : ing.purchasePackageQuantity);
    setMinStockAlert(ing.minStockAlert !== undefined ? ing.minStockAlert : 500);
    setNotes(ing.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || purchasePackageQuantity <= 0 || purchaseCost <= 0) return;

    const newIngredient: Ingredient = {
      id: editingId || `ing-${Date.now()}`,
      name: name.trim(),
      category,
      purchasePackageQuantity: Number(purchasePackageQuantity),
      purchasePackageUnit,
      purchaseCost: Number(purchaseCost),
      currentStock: Number(currentStock),
      minStockAlert: Number(minStockAlert),
      notes: notes.trim(),
    };

    onSaveIngredient(newIngredient);
    setIsModalOpen(false);
  };

  // Live preview unit cost in form modal
  const liveBase = convertToBaseUnit(purchasePackageQuantity, purchasePackageUnit);
  const liveCostPerBaseUnit = liveBase.baseValue > 0 ? purchaseCost / liveBase.baseValue : 0;
  const baseUnitDisplay =
    liveBase.baseType === 'mass' ? '1 gramo' : liveBase.baseType === 'volume' ? '1 ml' : '1 unidad';

  return (
    <div className="space-y-6">
      {/* Top Header & New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif flex items-center gap-2">
            <span>Catálogo de Insumos y Materias Primas</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Organiza tus insumos agrupados por categorías (harinas, lácteos, decoraciones) y calcula automáticamente el costo unitario de compra.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Insumo</span>
        </button>
      </div>

      {/* Filter Bar: Category Pills with Count Badges */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar insumo (ej: Harina, Mantequilla, Perlas)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* View mode toggle (Grouped vs Plain List) */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-gray-400 font-medium">Modo de visualización:</span>
            <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'grouped'
                    ? 'bg-white text-amber-900 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Agrupar ingredientes por categoría en bloques visuales"
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>Agrupado</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-amber-900 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Lista corrida de ingredientes"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategoryFilter('todos')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategoryFilter === 'todos'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              <span>Todos los Insumos</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategoryFilter === 'todos'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {categoryCounts['todos'] || 0}
              </span>
            </button>

            {CATEGORY_DEFINITIONS.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategoryFilter === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200/80 text-gray-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Ingredients View: Grouped vs List */}
      {filteredIngredients.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400 space-y-3 shadow-xs">
          <Boxes className="w-12 h-12 mx-auto text-amber-300" />
          <p className="text-sm font-medium">
            No se encontraron insumos para la categoría o búsqueda seleccionada.
          </p>
          <button
            onClick={() => {
              setSelectedCategoryFilter('todos');
              setSearchTerm('');
            }}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700"
          >
            Ver todos los insumos
          </button>
        </div>
      ) : viewMode === 'grouped' ? (
        /* VISTA AGRUPADA POR CATEGORÍAS */
        <div className="space-y-6">
          {groupedCategories.map(({ categoryDef, items }) => (
            <div
              key={categoryDef.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden"
            >
              {/* Category Header Banner */}
              <div
                className={`px-5 py-3.5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${categoryDef.accentBg}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{categoryDef.icon}</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 font-serif">
                      {categoryDef.name}
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      {items.length} {items.length === 1 ? 'insumo registrado' : 'insumos registrados'} en este grupo
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${categoryDef.badgeColor}`}
                  >
                    Categoría Activa
                  </span>
                </div>
              </div>

              {/* Items Table for this Category */}
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
                      const base = convertToBaseUnit(ing.purchasePackageQuantity, ing.purchasePackageUnit);
                      const costPerBaseUnit = base.baseValue > 0 ? ing.purchaseCost / base.baseValue : 0;
                      const unitText =
                        base.baseType === 'mass' ? '/ g' : base.baseType === 'volume' ? '/ ml' : '/ pza';
                      const isLowStock =
                        ing.minStockAlert !== undefined &&
                        ing.minStockAlert > 0 &&
                        ing.currentStock !== undefined &&
                        ing.currentStock <= ing.minStockAlert;

                      return (
                        <tr key={ing.id} className="hover:bg-amber-50/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-gray-900 text-xs">{ing.name}</div>
                            {ing.notes && (
                              <p className="text-[11px] text-gray-400 mt-0.5">{ing.notes}</p>
                            )}
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-700">
                            {ing.purchasePackageQuantity} {getUnitLabel(ing.purchasePackageUnit)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                            {formatCurrency(ing.purchaseCost, business.currencySymbol)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-mono font-bold text-amber-900 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200">
                              {formatCurrency(costPerBaseUnit, business.currencySymbol)} {unitText}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="font-mono text-xs font-bold text-gray-800">
                                {ing.currentStock !== undefined ? `${ing.currentStock} ${ing.purchasePackageUnit}` : '—'}
                              </div>
                              {ing.minStockAlert !== undefined && ing.minStockAlert > 0 && (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isLowStock
                                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {isLowStock ? '⚠️ Bajo Stock' : '✓ Óptimo'}
                                  <span className="text-[9px] font-normal opacity-80">(Mín: {ing.minStockAlert})</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(ing)}
                                title="Editar insumo"
                                className="p-1.5 text-gray-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`¿Seguro que deseas eliminar "${ing.name}"?`)) {
                                    onDeleteIngredient(ing.id);
                                  }
                                }}
                                title="Eliminar insumo"
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VISTA LISTA PLENA TRADICIONAL */
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-amber-50/50 border-b border-amber-100 text-gray-500 font-semibold uppercase text-[10px] tracking-wider">
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
                  const base = convertToBaseUnit(ing.purchasePackageQuantity, ing.purchasePackageUnit);
                  const costPerBaseUnit = base.baseValue > 0 ? ing.purchaseCost / base.baseValue : 0;
                  const unitText =
                    base.baseType === 'mass' ? '/ g' : base.baseType === 'volume' ? '/ ml' : '/ pza';
                  const catDef = CATEGORY_DEFINITIONS.find(
                    (c) => c.id === normalizeCategoryName(ing.category)
                  );
                  const isLowStock =
                    ing.minStockAlert !== undefined &&
                    ing.minStockAlert > 0 &&
                    ing.currentStock !== undefined &&
                    ing.currentStock <= ing.minStockAlert;

                  return (
                    <tr key={ing.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{ing.name}</div>
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
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                        {formatCurrency(ing.purchaseCost, business.currencySymbol)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {formatCurrency(costPerBaseUnit, business.currencySymbol)} {unitText}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="font-mono text-xs font-bold text-gray-800">
                            {ing.currentStock !== undefined ? `${ing.currentStock} ${ing.purchasePackageUnit}` : '—'}
                          </div>
                          {ing.minStockAlert !== undefined && ing.minStockAlert > 0 && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isLowStock
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {isLowStock ? '⚠️ Bajo Stock' : '✓ Óptimo'}
                              <span className="text-[9px] font-normal opacity-80">(Mín: {ing.minStockAlert})</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(ing)}
                            title="Editar insumo"
                            className="p-1.5 text-gray-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Seguro que deseas eliminar "${ing.name}"?`)) {
                                onDeleteIngredient(ing.id);
                              }
                            }}
                            title="Eliminar insumo"
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 font-serif">
                    {editingId ? 'Editar Insumo de Repostería' : 'Registrar Nuevo Insumo'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Asigna su categoría y presentación para automatizar tus recetas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nombre del Insumo / Ingrediente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Mantequilla Gloria, Perlas Doradas, Harina de Trigo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Categoría del Insumo *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IngredientCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                  >
                    {CATEGORY_DEFINITIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Costo de Compra del Paquete ({business.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Cantidad del Paquete de Compra *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    required
                    value={purchasePackageQuantity}
                    onChange={(e) => setPurchasePackageQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Unidad de Medida del Paquete</label>
                  <select
                    value={purchasePackageUnit}
                    onChange={(e) => setPurchasePackageUnit(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="g">Gramos (g)</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="l">Litros (L)</option>
                    <option value="pza">Piezas (pza)</option>
                    <option value="docena">Docena (12 pza)</option>
                  </select>
                </div>
              </div>

              {/* Automatic calculation preview */}
              <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-1">Cálculo de Costo Base:</span>
                <p className="text-gray-600 leading-relaxed">
                  Comprando {purchasePackageQuantity} {purchasePackageUnit} por{' '}
                  <strong className="text-gray-900">{formatCurrency(purchaseCost, business.currencySymbol)}</strong>, cada{' '}
                  <strong className="text-amber-950">{baseUnitDisplay}</strong> cuesta exactamente:{' '}
                  <span className="font-mono font-extrabold text-amber-800 text-sm">
                    {formatCurrency(liveCostPerBaseUnit, business.currencySymbol)}
                  </span>
                </p>
              </div>

              {/* Stock and Purchase Alert Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Stock Actual en Taller ({purchasePackageUnit}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    Cantidad física disponible actualmente
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Stock Mínimo para Alerta ({purchasePackageUnit}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white font-mono font-bold text-rose-800 focus:outline-none focus:border-rose-500"
                  />
                  <span className="text-[10px] text-rose-700 mt-0.5 block">
                    Dispara alerta en Dashboard al estar en o por debajo
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Notas / Marca / Proveedor (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Proveedor Central de Abastos, marca Lurpak, color dorado"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Guardar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
