import React, { useState } from 'react';
import {
  Cake,
  Plus,
  Search,
  Edit2,
  Trash2,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Scale,
  BookOpen
} from 'lucide-react';
import { BusinessProfile, Product } from '../../../entities';
import {
  formatCurrency,
  formatPercent,
  CostCalculator
} from '../../../shared/lib';
import { RecipeBookPdfModal } from './RecipeBookPdfModal';

interface ProductListProps {
  products: Product[];
  onOpenCreateModal: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onMakeBatch: (product: Product) => void;
  business: BusinessProfile;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onOpenCreateModal,
  onEditProduct,
  onDeleteProduct,
  onMakeBatch,
  business,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [isRecipeBookOpen, setIsRecipeBookOpen] = useState(false);

  const categories = ['todos', 'Pasteles', 'Galletas', 'Cupcakes', 'Postres Fríos', 'Panadería', 'Bocaditos y Tartas'];

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'todos' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const toggleExpand = (id: string) => {
    setExpandedRecipeId(expandedRecipeId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-800 font-serif">
            Catálogo de Productos y Recetas
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Administra tus creaciones de repostería, consulta el costo unitario por porción y calcula tus márgenes de ganancia.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsRecipeBookOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-dulcinea-midnight hover:bg-[#142433] text-dulcinea-cream border border-dulcinea-copper/35 font-bold text-xs sm:text-sm shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
            title="Exportar todas las recetas almacenadas a formato PDF profesional"
          >
            <BookOpen className="w-4 h-4 text-dulcinea-copper" />
            <span>Exportar Recetario PDF</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-dulcinea-copper hover:bg-[#c88a58] text-dulcinea-midnight font-bold text-xs sm:text-sm shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-dulcinea-midnight" />
            <span>Crear Producto / Receta</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-dulcinea-copper/25 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar producto por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-dulcinea-copper/30 focus:border-dulcinea-copper"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-dulcinea-midnight text-dulcinea-cream shadow-sm'
                  : 'bg-dulcinea-cream/40 text-stone-700 hover:bg-dulcinea-cream border border-dulcinea-copper/25'
              }`}
            >
              {cat === 'todos' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dulcinea-copper/25 p-12 text-center text-stone-400 space-y-3 shadow-sm">
          <Cake className="w-12 h-12 mx-auto text-dulcinea-copper/70" />
          <p className="text-sm font-medium">No se encontraron productos que coincidan con la búsqueda.</p>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-2xl bg-dulcinea-midnight text-dulcinea-cream font-bold text-xs hover:bg-[#142433] transition-all active:scale-95 cursor-pointer"
          >
            Crear primer producto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((product) => {
            const isExpanded = expandedRecipeId === product.id;
            const metrics = CostCalculator.calculateProductMetrics(product);
            const isHealthy = metrics.profitMarginPercent >= 50;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-dulcinea-copper/25 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Card Top */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-dulcinea-cream text-dulcinea-midnight border border-dulcinea-copper/35 uppercase">
                          {product.category}
                        </span>
                        <span className="text-[11px] text-stone-400 font-medium">
                          Rinde {product.batchYieldUnits} {product.yieldUnitName} por lote
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-dulcinea-midnight font-serif leading-snug">
                        {product.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEditProduct(product)}
                        title="Editar receta"
                        className="p-1.5 text-stone-400 hover:text-dulcinea-midnight hover:bg-dulcinea-cream/70 rounded-xl transition-all active:scale-95 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Deseas eliminar "${product.name}"?`)) {
                            onDeleteProduct(product.id);
                          }
                        }}
                        title="Eliminar producto"
                        className="p-1.5 text-stone-400 hover:text-dulcinea-cherry hover:bg-dulcinea-cherry/10 rounded-xl transition-all active:scale-95 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {product.description && (
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Financial Metrics Strip */}
                  <div className="grid grid-cols-4 gap-2 py-3 px-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-center">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-stone-400 block">Costo / U</span>
                      <span className="text-xs font-mono font-bold text-stone-800 mt-0.5 block">
                        {formatCurrency(metrics.costPerUnit, business.currencySymbol)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-stone-400 block">Precio Venta</span>
                      <span className="text-xs font-mono font-bold text-stone-900 mt-0.5 block">
                        {formatCurrency(product.sellingPrice, business.currencySymbol)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-emerald-800 block">Utilidad / U</span>
                      <span className="text-xs font-mono font-bold text-emerald-700 mt-0.5 block">
                        +{formatCurrency(metrics.profitPerUnit, business.currencySymbol)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-stone-400 block">Margen</span>
                      <span
                        className={`text-xs font-bold mt-0.5 block ${
                          isHealthy ? 'text-emerald-700' : 'text-amber-800'
                        }`}
                      >
                        {formatPercent(metrics.profitMarginPercent)}
                      </span>
                    </div>
                  </div>

                  {/* Batch summary details */}
                  <div className="text-[11px] text-stone-500 flex items-center justify-between border-t border-stone-100 pt-2">
                    <span>
                      Costo total del lote: <strong>{formatCurrency(metrics.totalBatchCost, business.currencySymbol)}</strong>
                    </span>
                    <span className="text-emerald-700 font-semibold">
                      Ganancia por lote: +{formatCurrency(metrics.totalBatchProfit, business.currencySymbol)}
                    </span>
                  </div>

                  {/* Recipe Toggle */}
                  <button
                    onClick={() => toggleExpand(product.id)}
                    className="w-full py-1.5 text-xs text-dulcinea-midnight hover:text-dulcinea-copper font-bold flex items-center justify-center gap-1.5 rounded-xl hover:bg-dulcinea-cream/50 transition-all active:scale-95 cursor-pointer"
                  >
                    <Scale className="w-3.5 h-3.5 text-dulcinea-copper" />
                    <span>
                      {isExpanded ? 'Ocultar ingredientes' : `Ver ${product.ingredients.length} ingredientes de la receta`}
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {/* Expanded Recipe Ingredients Breakdown */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-stone-100 space-y-2">
                      <div className="text-[11px] font-bold text-stone-700">Ingredientes requeridos por lote:</div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {product.ingredients.map((ing, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-stone-50 border border-stone-100"
                          >
                            <span className="text-stone-800 font-medium">{ing.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-stone-500 font-mono">
                                {ing.quantity} {ing.recipeUnit}
                              </span>
                              <span className="font-bold text-stone-900 font-mono text-[11px]">
                                {formatCurrency(ing.calculatedCost, business.currencySymbol)}
                              </span>
                            </div>
                          </div>
                        ))}
                        {product.otherDirectCosts > 0 && (
                          <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-dulcinea-cream/60 border border-dulcinea-copper/30 text-dulcinea-midnight font-medium">
                            <span>Empaques, insumos indirectos y horneado</span>
                            <span className="font-mono font-bold">
                              {formatCurrency(product.otherDirectCosts, business.currencySymbol)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Bottom / Action Button */}
                <div className="p-4 bg-dulcinea-cream/30 border-t border-dulcinea-copper/20 flex items-center justify-between">
                  <div className="text-[11px] text-stone-500">
                    {product.ingredients.length} insumos en fórmula
                  </div>

                  <button
                    onClick={() => onMakeBatch(product)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-dulcinea-midnight hover:bg-[#142433] text-dulcinea-cream font-bold text-xs shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
                  >
                    <ChefHat className="w-3.5 h-3.5 text-dulcinea-copper" />
                    <span>Elaborar Lote</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recipe Book PDF Export Modal */}
      <RecipeBookPdfModal
        isOpen={isRecipeBookOpen}
        onClose={() => setIsRecipeBookOpen(false)}
        products={products}
        business={business}
      />
    </div>
  );
};
