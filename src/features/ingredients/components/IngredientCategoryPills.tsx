import React from 'react';
import { CATEGORY_DEFINITIONS } from './ingredientCategories';

interface IngredientCategoryPillsProps {
  selectedCategoryFilter: string;
  onSelectCategory: (category: string) => void;
  categoryCounts: Record<string, number>;
}

export const IngredientCategoryPills: React.FC<IngredientCategoryPillsProps> = ({
  selectedCategoryFilter,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <div className="pt-2 border-t border-stone-100">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => onSelectCategory('todos')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
            selectedCategoryFilter === 'todos'
              ? 'bg-dulcinea-midnight text-dulcinea-cream shadow-sm'
              : 'bg-dulcinea-cream/40 hover:bg-dulcinea-cream text-stone-700 border border-dulcinea-copper/25'
          }`}
        >
          <span>Todos los Insumos</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              selectedCategoryFilter === 'todos'
                ? 'bg-white/20 text-white'
                : 'bg-stone-200 text-stone-700'
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
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-dulcinea-midnight text-dulcinea-cream shadow-sm'
                  : 'bg-dulcinea-cream/40 hover:bg-dulcinea-cream text-stone-700 border border-dulcinea-copper/25'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-stone-200/80 text-stone-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
