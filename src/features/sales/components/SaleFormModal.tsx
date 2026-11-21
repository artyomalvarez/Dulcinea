import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import {
  BusinessProfile,
  PaymentMethodSchema,
  PaymentStatusSchema,
  Product,
  Sale,
  SaleItem,
} from '../../../entities';
import { CostCalculator, SalesService, formatCurrency } from '../../../shared/lib';

const SaleFormSchema = z.object({
  customerName: z.string().trim().min(1, 'El nombre del cliente es obligatorio'),
  date: z.string().min(1, 'La fecha es obligatoria'),
  customerPhone: z.string().optional(),
  customerEmail: z
    .string()
    .trim()
    .refine((val) => val === '' || z.string().email().safeParse(val).success, {
      message: 'El correo electrónico no es válido',
    })
    .optional(),
  paymentMethod: PaymentMethodSchema,
  paymentStatus: PaymentStatusSchema,
  notes: z.string().optional(),
});

type SaleFormValues = z.infer<typeof SaleFormSchema>;

export interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  salesCount: number;
  business: BusinessProfile;
  preselectedProduct?: Product | null;
  onSaveSale: (sale: Sale) => void;
}

export const SaleFormModal: React.FC<SaleFormModalProps> = ({
  isOpen,
  onClose,
  products,
  salesCount,
  business,
  preselectedProduct,
  onSaveSale,
}) => {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<number>(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(SaleFormSchema),
    defaultValues: {
      customerName: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      customerPhone: '',
      customerEmail: '',
      paymentMethod: 'Transferencia',
      paymentStatus: 'Pagado',
      notes: '',
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    reset({
      customerName: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      customerPhone: '',
      customerEmail: '',
      paymentMethod: 'Transferencia',
      paymentStatus: 'Pagado',
      notes: '',
    });

    if (preselectedProduct) {
      const metrics = CostCalculator.calculateProductMetrics(preselectedProduct);
      const itemTotals = SalesService.calculateSaleItemTotals({
        quantity: 1,
        unitCost: metrics.costPerUnit,
        unitPrice: preselectedProduct.sellingPrice,
      });
      setSelectedProductId(preselectedProduct.id);
      setCustomPrice(preselectedProduct.sellingPrice);
      setQuantity(1);
      setSaleItems([
        {
          productId: preselectedProduct.id,
          productName: preselectedProduct.name,
          quantity: 1,
          unitCost: metrics.costPerUnit,
          unitPrice: preselectedProduct.sellingPrice,
          totalPrice: itemTotals.totalPrice,
          unitProfit: itemTotals.unitProfit,
        },
      ]);
    } else {
      const firstProduct = products[0];
      if (firstProduct) {
        setSelectedProductId(firstProduct.id);
        setCustomPrice(firstProduct.sellingPrice);
        setQuantity(1);
        setSaleItems([]);
      }
    }
  }, [isOpen, preselectedProduct, products, reset]);

  if (!isOpen) return null;

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setCustomPrice(prod.sellingPrice);
    }
  };

  const handleAddItem = () => {
    if (!selectedProductId || quantity <= 0) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const unitPrice = customPrice > 0 ? customPrice : prod.sellingPrice;
    const { costPerUnit: unitCost } = CostCalculator.calculateProductMetrics(prod);
    const { totalPrice, unitProfit } = SalesService.calculateSaleItemTotals({
      quantity: Number(quantity),
      unitCost,
      unitPrice,
    });

    const newItem: SaleItem = {
      productId: prod.id,
      productName: prod.name,
      quantity: Number(quantity),
      unitCost,
      unitPrice,
      totalPrice,
      unitProfit,
    };

    setSaleItems((prev) => [...prev, newItem]);
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setSaleItems((prev) => prev.filter((_, i) => i !== index));
  };

  const taxRate = business.defaultTaxRate || 0;
  const { subtotal, totalCost, netProfit, taxAmount, totalAmount } =
    SalesService.calculateSaleTotals(saleItems, taxRate);

  const onSubmit = (values: SaleFormValues) => {
    if (saleItems.length === 0) return;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      saleNumber: `VTA-${String(salesCount + 1).padStart(3, '0')}`,
      date: values.date,
      customerName: values.customerName,
      customerPhone: values.customerPhone?.trim() || '',
      customerEmail: values.customerEmail?.trim() || '',
      items: saleItems,
      subtotal,
      taxRatePercent: taxRate,
      taxAmount,
      totalAmount,
      totalCost,
      netProfit,
      paymentMethod: values.paymentMethod,
      paymentStatus: values.paymentStatus,
      notes: values.notes?.trim() || '',
    };

    onSaveSale(newSale);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-dulcinea-copper/30 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-dulcinea-cream text-dulcinea-midnight flex items-center justify-center border border-dulcinea-copper/30">
              <ShoppingBag className="w-5 h-5 text-dulcinea-copper" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-dulcinea-midnight font-serif">
                Registrar Venta / Pedido en Dulcinea
              </h3>
              <p className="text-xs text-stone-500">
                Añade los productos entregados para descontar stock y calcular la ganancia neta
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs" noValidate>
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/70 space-y-3">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Datos del Cliente y Entrega
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-700 mb-1">Nombre del Cliente *</label>
                <input
                  type="text"
                  placeholder="Ej: Carolina Méndez, Restaurante Bistro"
                  {...register('customerName')}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-medium text-stone-800 focus:outline-none focus:border-dulcinea-copper"
                />
                {errors.customerName && (
                  <p className="text-red-600 text-[11px] font-semibold mt-1">
                    {errors.customerName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Fecha de Venta *</label>
                <input
                  type="date"
                  {...register('date')}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-medium text-stone-800 focus:outline-none focus:border-dulcinea-copper"
                />
                {errors.date && (
                  <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.date.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="Ej: +57 300 123 4567"
                  {...register('customerPhone')}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:border-dulcinea-copper"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Correo Electrónico (para factura)
                </label>
                <input
                  type="email"
                  placeholder="cliente@correo.com"
                  {...register('customerEmail')}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:border-dulcinea-copper"
                />
                {errors.customerEmail && (
                  <p className="text-red-600 text-[11px] font-semibold mt-1">
                    {errors.customerEmail.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Productos Vendidos
            </span>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 w-full sm:w-auto">
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 focus:outline-none focus:border-dulcinea-copper"
                >
                  {products.map((p) => {
                    const { costPerUnit } = CostCalculator.calculateProductMetrics(p);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} (Costo: {formatCurrency(costPerUnit, business.currencySymbol)} | Venta:{' '}
                        {formatCurrency(p.sellingPrice, business.currencySymbol)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="w-20">
                  <input
                    type="number"
                    min="1"
                    placeholder="Cant"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-2 py-2 rounded-xl border border-stone-200 bg-white text-xs font-mono font-bold text-center text-stone-800 focus:outline-none focus:border-dulcinea-copper"
                  />
                </div>

                <div className="w-24">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Precio"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    className="w-full px-2 py-2 rounded-xl border border-stone-200 bg-white text-xs font-mono font-bold text-center text-stone-800 focus:outline-none focus:border-dulcinea-copper"
                    title="Precio unitario de venta"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3.5 py-2 rounded-xl bg-dulcinea-midnight hover:bg-[#142433] text-dulcinea-cream font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 text-dulcinea-copper" />
                  <span>Agregar</span>
                </button>
              </div>
            </div>

            <div className="border border-stone-200/80 rounded-2xl overflow-hidden bg-white shadow-sm">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 uppercase text-[10px] font-semibold border-b border-stone-100">
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3 text-center">Cant</th>
                    <th className="py-2.5 px-3 text-right">Precio U</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                    <th className="py-2.5 px-3 text-right">Ganancia</th>
                    <th className="py-2.5 px-3 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {saleItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-stone-400">
                        No has agregado ningún producto a esta venta.
                      </td>
                    </tr>
                  ) : (
                    saleItems.map((item, idx) => {
                      const itemTotals = SalesService.calculateSaleItemTotals(item);
                      return (
                        <tr key={idx} className="hover:bg-stone-50/70">
                          <td className="py-2.5 px-3 font-semibold text-stone-800">
                            {item.productName}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-stone-800">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-stone-700">
                            {formatCurrency(item.unitPrice, business.currencySymbol)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-800">
                            {formatCurrency(itemTotals.totalPrice, business.currencySymbol)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                            +{formatCurrency(itemTotals.totalProfit, business.currencySymbol)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-stone-400 hover:text-dulcinea-cherry p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-dulcinea-cream/40 p-4 rounded-2xl border border-dulcinea-copper/30 grid grid-cols-3 gap-3 text-center">
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-semibold">Total Cobrado</span>
              <div className="text-base font-bold text-dulcinea-midnight font-mono mt-0.5">
                {formatCurrency(subtotal, business.currencySymbol)}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-stone-500 uppercase font-semibold">Costo Insumos</span>
              <div className="text-base font-bold text-dulcinea-cherry font-mono mt-0.5">
                {formatCurrency(totalCost, business.currencySymbol)}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-emerald-800 uppercase font-semibold">Ganancia Neta</span>
              <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
                +{formatCurrency(netProfit, business.currencySymbol)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Método de Pago</label>
              <select
                {...register('paymentMethod')}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:border-dulcinea-copper"
              >
                <option value="Transferencia">Transferencia Bancaria / SPEI</option>
                <option value="Efectivo">Efectivo contra entrega</option>
                <option value="Tarjeta">Tarjeta de Débito / Crédito</option>
                <option value="Link de Pago">Link de Pago / Stripe</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Estado del Pago</label>
              <select
                {...register('paymentStatus')}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:border-dulcinea-copper"
              >
                <option value="Pagado">Pagado Total</option>
                <option value="Anticipo">Anticipo / Seña 50%</option>
                <option value="Pendiente">Pendiente de Cobro</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium cursor-pointer transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saleItems.length === 0}
              className="px-5 py-2 rounded-2xl bg-dulcinea-midnight hover:bg-[#142433] disabled:opacity-50 text-dulcinea-cream font-bold shadow-sm cursor-pointer transition-all active:scale-95"
            >
              Guardar Venta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
