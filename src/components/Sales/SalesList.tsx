import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Receipt,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  X,
  ArrowUpRight
} from 'lucide-react';
import { BusinessProfile, Product, ProductionBatch, Sale, SaleItem } from '../../types/bakery';
import { formatCurrency, formatPercent } from '../../utils/units';

interface SalesListProps {
  sales: Sale[];
  products: Product[];
  batches: ProductionBatch[];
  business: BusinessProfile;
  onSaveSale: (sale: Sale) => void;
  onDeleteSale: (id: string) => void;
  onGenerateInvoiceFromSale: (sale: Sale) => void;
  isOpenModal: boolean;
  onCloseModal: () => void;
  onOpenNewModal: () => void;
  preselectedProduct?: Product | null;
}

export const SalesList: React.FC<SalesListProps> = ({
  sales,
  products,
  batches,
  business,
  onSaveSale,
  onDeleteSale,
  onGenerateInvoiceFromSale,
  isOpenModal,
  onCloseModal,
  onOpenNewModal,
  preselectedProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('Transferencia');
  const [paymentStatus, setPaymentStatus] = useState<Sale['paymentStatus']>('Pagado');
  const [notes, setNotes] = useState('');

  // Items in Sale
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<number>(0);

  // Initialize or reset form
  React.useEffect(() => {
    if (isOpenModal) {
      if (preselectedProduct) {
        setSelectedProductId(preselectedProduct.id);
        setCustomPrice(preselectedProduct.sellingPrice);
        setQuantity(1);
        setSaleItems([
          {
            productId: preselectedProduct.id,
            productName: preselectedProduct.name,
            quantity: 1,
            unitCost: preselectedProduct.costPerUnit,
            unitPrice: preselectedProduct.sellingPrice,
            totalCost: preselectedProduct.costPerUnit,
            totalPrice: preselectedProduct.sellingPrice,
            unitProfit: preselectedProduct.profitPerUnit,
            totalProfit: preselectedProduct.profitPerUnit,
          },
        ]);
      } else if (products.length > 0) {
        setSelectedProductId(products[0].id);
        setCustomPrice(products[0].sellingPrice);
        setQuantity(1);
        setSaleItems([]);
      }
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [isOpenModal, preselectedProduct, products]);

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
    const unitCost = prod.costPerUnit;
    const totalPrice = unitPrice * quantity;
    const totalCost = unitCost * quantity;
    const unitProfit = unitPrice - unitCost;
    const totalProfit = totalPrice - totalCost;

    const newItem: SaleItem = {
      productId: prod.id,
      productName: prod.name,
      quantity: Number(quantity),
      unitCost,
      unitPrice,
      totalCost,
      totalPrice,
      unitProfit,
      totalProfit,
    };

    setSaleItems([...saleItems, newItem]);
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  // Calculations for current sale
  const subtotal = saleItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const totalCost = saleItems.reduce((acc, item) => acc + item.totalCost, 0);
  const netProfit = subtotal - totalCost;
  const taxRate = business.defaultTaxRate || 0;
  const taxAmount = Math.round((subtotal * (taxRate / 100)) * 100) / 100;
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || saleItems.length === 0) return;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      saleNumber: `VTA-${String(sales.length + 1).padStart(3, '0')}`,
      date,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      items: saleItems,
      subtotal,
      taxRatePercent: taxRate,
      taxAmount,
      totalAmount,
      totalCost,
      netProfit,
      paymentMethod,
      paymentStatus,
      notes: notes.trim(),
    };

    onSaveSale(newSale);
    onCloseModal();
  };

  const filteredSales = sales.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.customerName.toLowerCase().includes(term) ||
      s.saleNumber.toLowerCase().includes(term) ||
      s.items.some((it) => it.productName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
            Registro de Ventas y Entregas
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Control de productos entregados, cobros a clientes y cálculo de utilidad real de cada pedido.
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Venta</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, folio o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
        <span className="text-xs text-gray-400 hidden sm:block">
          {filteredSales.length} venta(s) encontradas
        </span>
      </div>

      {/* Sales List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-amber-50/50 border-b border-amber-100 text-gray-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Folio / Fecha</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Productos / Cantidad</th>
                <th className="py-3 px-4 text-right">Costo Insumos</th>
                <th className="py-3 px-4 text-right">Venta (Subtotal)</th>
                <th className="py-3 px-4 text-right">Utilidad Neta</th>
                <th className="py-3 px-4 text-center">Pago</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No se han registrado ventas. Haz clic en "Nueva Venta" para registrar un pedido.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-gray-900">{sale.saleNumber}</div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{sale.date}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{sale.customerName}</div>
                      {sale.customerPhone && (
                        <div className="text-[10px] text-gray-400">{sale.customerPhone}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 max-w-xs">
                        {sale.items.map((it, idx) => (
                          <div key={idx} className="text-gray-700 flex items-center justify-between gap-2">
                            <span className="font-medium truncate">{it.productName}</span>
                            <span className="font-mono font-bold text-gray-900 text-[11px] shrink-0">
                              x{it.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-gray-500 font-medium">
                      {formatCurrency(sale.totalCost, business.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                      {formatCurrency(sale.subtotal, business.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-emerald-700">
                        +{formatCurrency(sale.netProfit, business.currencySymbol)}
                      </div>
                      <span className="text-[10px] text-emerald-800 font-medium">
                        {sale.subtotal > 0 ? formatPercent((sale.netProfit / sale.subtotal) * 100) : '0%'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          sale.paymentStatus === 'Pagado'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {sale.paymentStatus}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-0.5">{sale.paymentMethod}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onGenerateInvoiceFromSale(sale)}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Generar Factura para esta venta"
                        >
                          <Receipt className="w-3.5 h-3.5 text-amber-700" />
                          <span>Facturar</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar la venta ${sale.saleNumber}?`)) {
                              onDeleteSale(sale.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Sale Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 font-serif">
                    Registrar Venta / Pedido de Repostería
                  </h3>
                  <p className="text-xs text-gray-500">
                    Añade productos vendidos para calcular la ganancia neta obtenida
                  </p>
                </div>
              </div>
              <button onClick={onCloseModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Customer details */}
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-3">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Datos del Cliente y Entrega
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">Nombre del Cliente *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Carolina Méndez, Restaurante Bistro"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Fecha de Venta *</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Teléfono / WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="Ej: 55 1234 5678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Correo Electrónico (para factura)</label>
                    <input
                      type="email"
                      placeholder="cliente@correo.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Add Product Items */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Productos Vendidos
                </span>

                <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/70 flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex-1 w-full sm:w-auto">
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Costo: {formatCurrency(p.costPerUnit, business.currencySymbol)} | Venta: {formatCurrency(p.sellingPrice, business.currencySymbol)})
                        </option>
                      ))}
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
                        className="w-full px-2 py-2 rounded-xl border border-amber-200 bg-white text-xs font-mono font-bold text-center focus:outline-none focus:border-amber-500"
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
                        className="w-full px-2 py-2 rounded-xl border border-amber-200 bg-white text-xs font-mono font-bold text-center focus:outline-none focus:border-amber-500"
                        title="Precio unitario de venta"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>

                {/* Items in Sale Table */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold border-b border-gray-100">
                        <th className="py-2.5 px-3">Producto</th>
                        <th className="py-2.5 px-3 text-center">Cant</th>
                        <th className="py-2.5 px-3 text-right">Precio U</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                        <th className="py-2.5 px-3 text-right">Ganancia</th>
                        <th className="py-2.5 px-3 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {saleItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-gray-400">
                            No has agregado ningún producto a esta venta.
                          </td>
                        </tr>
                      ) : (
                        saleItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="py-2.5 px-3 font-semibold text-gray-800">{item.productName}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-gray-700">
                              {formatCurrency(item.unitPrice, business.currencySymbol)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                              {formatCurrency(item.totalPrice, business.currencySymbol)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                              +{formatCurrency(item.totalProfit, business.currencySymbol)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="text-gray-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Profitability Summary Box */}
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Total Cobrado</span>
                  <div className="text-base font-bold text-gray-900 font-mono mt-0.5">
                    {formatCurrency(subtotal, business.currencySymbol)}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Costo Insumos</span>
                  <div className="text-base font-bold text-rose-700 font-mono mt-0.5">
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

              {/* Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Método de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Transferencia">Transferencia Bancaria / SPEI</option>
                    <option value="Efectivo">Efectivo contra entrega</option>
                    <option value="Tarjeta">Tarjeta de Débito / Crédito</option>
                    <option value="Link de Pago">Link de Pago / Stripe</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Estado del Pago</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Pagado">Pagado Total</option>
                    <option value="Anticipo">Anticipo / Seña 50%</option>
                    <option value="Pendiente">Pendiente de Cobro</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onCloseModal}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saleItems.length === 0}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold shadow-md cursor-pointer"
                >
                  Guardar Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
