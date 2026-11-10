import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { BusinessProfile, Ingredient, Product } from '../entities';
import { ProductList } from '../features/products/components/ProductList';
import { IngredientManager } from '../features/ingredients/components/IngredientManager';

interface CatalogPageProps {
  products: Product[];
  ingredients: Ingredient[];
  business: BusinessProfile;
  initialSubTab?: 'recipes' | 'ingredients';
  onOpenCreateProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onMakeBatch: (product: Product) => void;
  onSaveIngredient: (ingredient: Ingredient) => void;
  onDeleteIngredient: (id: string) => void;
  onOpenCalculator: () => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  products,
  ingredients,
  business,
  initialSubTab = 'recipes',
  onOpenCreateProduct,
  onEditProduct,
  onDeleteProduct,
  onMakeBatch,
  onSaveIngredient,
  onDeleteIngredient,
  onOpenCalculator,
}) => {
  const [subTab, setSubTab] = useState<'recipes' | 'ingredients'>(initialSubTab);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar with Toggle and Profitability Simulator Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-200/80 shadow-xs">
        {/* Toggle Switch */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setSubTab('recipes')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
              subTab === 'recipes'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🍰 Mis Recetas</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                subTab === 'recipes' ? 'bg-[#D4A373]/20 text-[#1A2E40]' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('ingredients')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
              subTab === 'ingredients'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🥚 Mis Insumos</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                subTab === 'ingredients' ? 'bg-[#D4A373]/20 text-[#1A2E40]' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {ingredients.length}
            </span>
          </button>
        </div>

        {/* Secondary Action: Simulador de Costeo */}
        <button
          onClick={onOpenCalculator}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-stone-100 text-[#1A2E40] font-bold text-xs sm:text-sm transition-all cursor-pointer border border-[#D4A373]/50 shadow-2xs"
        >
          <Calculator className="w-4 h-4 text-[#D4A373]" />
          <span>Simulador de Costeo</span>
        </button>
      </div>

      {/* Render selected view */}
      {subTab === 'recipes' ? (
        <ProductList
          products={products}
          onOpenCreateModal={onOpenCreateProduct}
          onEditProduct={onEditProduct}
          onDeleteProduct={onDeleteProduct}
          onMakeBatch={onMakeBatch}
          business={business}
        />
      ) : (
        <IngredientManager
          ingredients={ingredients}
          onSaveIngredient={onSaveIngredient}
          onDeleteIngredient={onDeleteIngredient}
          business={business}
        />
      )}
    </div>
  );
};
