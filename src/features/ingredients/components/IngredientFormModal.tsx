import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Boxes, X } from 'lucide-react';
import {
  BusinessProfile,
  Ingredient,
  IngredientCategorySchema,
  UnitOfMeasureSchema,
} from '../../../entities';
import { formatCurrency, CostCalculator, normalizeCategoryName } from '../../../shared/lib';
import { CATEGORY_DEFINITIONS } from './ingredientCategories';

const IngredientFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre del insumo es obligatorio'),
  category: IngredientCategorySchema,
  purchasePackageQuantity: z.number().positive('Debe ser mayor a 0'),
  purchasePackageUnit: UnitOfMeasureSchema,
  purchaseCost: z.number().positive('El costo debe ser mayor a 0'),
  currentStock: z.number().min(0, 'No puede ser negativo'),
  minStockAlert: z.number().min(0, 'No puede ser negativo'),
  notes: z.string().optional(),
});

type IngredientFormValues = z.infer<typeof IngredientFormSchema>;

interface IngredientFormModalProps {
  isOpen: boolean;
  editingIngredient: Ingredient | null;
  business: BusinessProfile;
  onClose: () => void;
  onSave: (ingredient: Ingredient) => void;
}

export const IngredientFormModal: React.FC<IngredientFormModalProps> = ({
  isOpen,
  editingIngredient,
  business,
  onClose,
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<IngredientFormValues>({
    resolver: zodResolver(IngredientFormSchema),
    defaultValues: {
      name: '',
      category: 'Harinas y Polvos',
      purchasePackageQuantity: 1000,
      purchasePackageUnit: 'g',
      purchaseCost: 30,
      currentStock: 1000,
      minStockAlert: 500,
      notes: '',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (editingIngredient) {
      reset({
        name: editingIngredient.name,
        category: normalizeCategoryName(editingIngredient.category),
        purchasePackageQuantity: editingIngredient.purchasePackageQuantity,
        purchasePackageUnit: editingIngredient.purchasePackageUnit,
        purchaseCost: editingIngredient.purchaseCost,
        currentStock: editingIngredient.currentStock ?? editingIngredient.purchasePackageQuantity,
        minStockAlert: editingIngredient.minStockAlert ?? 500,
        notes: editingIngredient.notes ?? '',
      });
    } else {
      reset({
        name: '',
        category: 'Harinas y Polvos',
        purchasePackageQuantity: 1000,
        purchasePackageUnit: 'g',
        purchaseCost: 30,
        currentStock: 1000,
        minStockAlert: 500,
        notes: '',
      });
    }
  }, [isOpen, editingIngredient, reset]);

  if (!isOpen) return null;

  const purchasePackageQuantity = watch('purchasePackageQuantity') || 0;
  const purchasePackageUnit = watch('purchasePackageUnit');
  const purchaseCost = watch('purchaseCost') || 0;

  const liveBase = CostCalculator.convertToBaseUnit(purchasePackageQuantity, purchasePackageUnit);
  const liveCostPerBaseUnit = liveBase.baseValue > 0 ? purchaseCost / liveBase.baseValue : 0;
  const baseUnitDisplay =
    liveBase.baseType === 'mass' ? '1 gramo' : liveBase.baseType === 'volume' ? '1 ml' : '1 unidad';

  const onSubmit = (values: IngredientFormValues) => {
    const newIngredient: Ingredient = {
      id: editingIngredient?.id || `ing-${Date.now()}`,
      name: values.name,
      category: values.category,
      purchasePackageQuantity: values.purchasePackageQuantity,
      purchasePackageUnit: values.purchasePackageUnit,
      purchaseCost: values.purchaseCost,
      currentStock: values.currentStock,
      minStockAlert: values.minStockAlert,
      notes: values.notes?.trim() || '',
    };
    onSave(newIngredient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-dulcinea-copper/30 space-y-4 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-dulcinea-cream text-dulcinea-midnight flex items-center justify-center">
              <Boxes className="w-5 h-5 text-dulcinea-copper" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-dulcinea-midnight font-serif">
                {editingIngredient ? 'Editar Insumo de Repostería' : 'Registrar Nuevo Insumo'}
              </h3>
              <p className="text-xs text-gray-500">
                Asigna su categoría y presentación para automatizar tus recetas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs" noValidate>
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Nombre del Insumo / Ingrediente *
            </label>
            <input
              type="text"
              placeholder="Ej: Mantequilla Gloria, Perlas Doradas, Harina de Trigo"
              {...register('name')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dulcinea-copper/30 focus:border-dulcinea-copper font-medium"
            />
            {errors.name && (
              <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Categoría del Insumo *</label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-dulcinea-copper/30 focus:border-dulcinea-copper font-medium"
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
                {...register('purchaseCost', { valueAsNumber: true })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dulcinea-copper/30 focus:border-dulcinea-copper font-mono font-bold"
              />
              {errors.purchaseCost && (
                <p className="text-red-600 text-[11px] font-semibold mt-1">
                  {errors.purchaseCost.message}
                </p>
              )}
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
                {...register('purchasePackageQuantity', { valueAsNumber: true })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dulcinea-copper/30 focus:border-dulcinea-copper font-mono"
              />
              {errors.purchasePackageQuantity && (
                <p className="text-red-600 text-[11px] font-semibold mt-1">
                  {errors.purchasePackageQuantity.message}
                </p>
              )}
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Unidad de Medida del Paquete</label>
              <select
                {...register('purchasePackageUnit')}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-dulcinea-copper/30 focus:border-dulcinea-copper"
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

          <div className="bg-dulcinea-cream/55 rounded-2xl p-3.5 border border-dulcinea-copper/35 text-xs">
            <span className="font-bold text-dulcinea-midnight block mb-1">Cálculo de Costo Base:</span>
            <p className="text-gray-600 leading-relaxed">
              Comprando {purchasePackageQuantity} {purchasePackageUnit} por{' '}
              <strong className="text-gray-900">
                {formatCurrency(purchaseCost, business.currencySymbol)}
              </strong>
              , cada <strong className="text-dulcinea-midnight">{baseUnitDisplay}</strong> cuesta
              exactamente:{' '}
              <span className="font-mono font-extrabold text-dulcinea-midnight text-sm">
                {formatCurrency(liveCostPerBaseUnit, business.currencySymbol)}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Stock Actual en Taller ({purchasePackageUnit}) *
              </label>
              <input
                type="number"
                step="any"
                {...register('currentStock', { valueAsNumber: true })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-mono font-bold focus:outline-none focus:border-dulcinea-copper"
              />
              {errors.currentStock && (
                <p className="text-red-600 text-[11px] font-semibold mt-1">
                  {errors.currentStock.message}
                </p>
              )}
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Stock Mínimo para Alerta ({purchasePackageUnit}) *
              </label>
              <input
                type="number"
                step="any"
                {...register('minStockAlert', { valueAsNumber: true })}
                className="w-full px-3 py-2 rounded-xl border border-dulcinea-cherry/40 bg-white font-mono font-bold text-dulcinea-cherry focus:outline-none focus:border-dulcinea-cherry"
              />
              {errors.minStockAlert && (
                <p className="text-red-600 text-[11px] font-semibold mt-1">
                  {errors.minStockAlert.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Notas / Marca / Proveedor (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Proveedor Central de Abastos, marca Lurpak, color dorado"
              {...register('notes')}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dulcinea-copper/30 focus:border-dulcinea-copper"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium cursor-pointer transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-2xl bg-dulcinea-midnight hover:bg-[#142433] text-dulcinea-cream font-bold shadow-sm cursor-pointer transition-all active:scale-95"
            >
              Guardar Insumo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
