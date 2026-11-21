import { IngredientCategory } from '../../../entities';

export interface CategoryDefinition {
  id: IngredientCategory;
  name: string;
  icon: string;
  badgeColor: string;
  accentBg: string;
}

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
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
