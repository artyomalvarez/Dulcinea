import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Receipt,
  Calendar,
  Trash2,
  Search,
  X
} from 'lucide-react';
import { BusinessProfile, Product, ProductionBatch, Sale, SaleItem } from '../../../entities';
import {
  formatCurrency,
  formatPercent,
  CostCalculator,
  SalesService
} from '../../../shared/lib';

interface SalesListProps {
  sales: Sale[];
  products: Product[];
  batches: ProductionBatch[];
  business: BusinessProfile;
  onSaveSale: (sale: Sale) => void;
  onDeleteSale: (id: string) => void;
  onGenerateInvoiceFromSale: (sale: Sale) => void;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
  onOpenNewModal: () => void;
  preselectedProduct?: Product | null;
}

interface SaleFormModalProps {
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
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('Transferencia');
  const [paymentStatus, setPaymentStatus] = useState<Sale['paymentStatus']>('Pagado');
  const [notes, setNotes] = useState('');

  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<number>(0);

  React.useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, preselectedProduct, products]);

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

    setSaleItems([...saleItems, newItem]);
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const taxRate = business.defaultTaxRate || 0;
  const { subtotal, totalCost, netProfit, taxAmount, totalAmount } =
    SalesService.calculateSaleTotals(saleItems, taxRate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || saleItems.length === 0) return;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      saleNumber: `VTA-${String(salesCount + 1).padStart(3, '0')}`,
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-100 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800 font-serif">
                Registrar Venta / Pedido en Dulcinea
              </h3>
              <p className="text-xs text-stone-500">
                Añade los productos entregados para descontar stock y calcular la ganancia neta
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer details */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/70 space-y-3">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Datos del Cliente y Entrega
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-700 mb-1">Nombre del Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carolina Méndez, Restaurante Bistro"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-medium text-stone-800 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Fecha de Venta *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-medium text-stone-800 focus:outline-none focus:border-rose-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="Ej: +57 300 123 4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Correo Electrónico (para factura)</label>
                <input
                  type="email"
                  placeholder="cliente@correo.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:border-rose-600"
                />
              </div>
            </div>
          </div>

          {/* Add Product Items */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Productos Vendidos
            </span>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 w-full sm:w-auto">
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 focus:outline-none focus:border-rose-600"
                >
                  {products.map((p) => {
                    const { costPerUnit } = CostCalculator.calculateProductMetrics(p);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} (Costo: {formatCurrency(costPerUnit, business.currencySymbol)} | Venta: {formatCurrency(p.sellingPrice, business.currencySymbol)})
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
                    className="w-full px-2 py-2 rounded-xl border border-stone-200 bg-white text-xs font-mono font-bold text-center text-stone-800 focus:outline-none focus:border-rose-600"
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
                    className="w-full px-2 py-2 rounded-xl border border-stone-200 bg-white text-xs font-mono font-bold text-center text-stone-800 focus:outline-none focus:border-rose-600"
                    title="Precio unitario de venta"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar</span>
                </button>
              </div>
            </div>

            {/* Items in Sale Table */}
            <div className="border border-stone-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs">
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
                          <td className="py-2.5 px-3 font-semibold text-stone-800">{item.productName}</td>
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
                              className="text-stone-400 hover:text-rose-600 p-1"
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

          {/* Profitability Summary Box */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 grid grid-cols-3 gap-3 text-center">
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-semibold">Total Cobrado</span>
              <div className="text-base font-bold text-stone-800 font-mono mt-0.5">
                {formatCurrency(subtotal, business.currencySymbol)}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-stone-500 uppercase font-semibold">Costo Insumos</span>
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
              <label className="block font-bold text-stone-700 mb-1">Método de Pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:border-rose-600"
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
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:border-rose-600"
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
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saleItems.length === 0}
              className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white font-bold shadow-sm cursor-pointer"
            >
              Guardar Venta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const SalesList: React.FC<SalesListProps> = ({
  sales,
  products,
  business,
  onSaveSale,
  onDeleteSale,
  onGenerateInvoiceFromSale,
  isOpenModal = false,
  onCloseModal,
  onOpenNewModal,
  preselectedProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSales = sales.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.customerName.toLowerCase().includes(term) ||
      s.saleNumber.toLowerCase().includes(term) ||
      s.items.some((it) => it.productName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-800 font-serif">
            Registro de Ventas y Pedidos
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Control de productos entregados, cobros a clientes y utilidad real obtenida en cada pedido.
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Venta</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, folio o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
          />
        </div>
        <span className="text-xs text-stone-400 hidden sm:block">
          {filteredSales.length} venta(s) encontradas
        </span>
      </div>

      {/* Sales List Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200/80 text-stone-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Folio / Fecha</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Productos / Cantidad</th>
                <th className="py-3.5 px-4 text-right">Costo Insumos</th>
                <th className="py-3.5 px-4 text-right">Venta (Subtotal)</th>
                <th className="py-3.5 px-4 text-right">Utilidad Neta</th>
                <th className="py-3.5 px-4 text-center">Pago</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-stone-400">
                    No se han registrado ventas. Haz clic en "Registrar Venta" para anotar un pedido.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-stone-800">{sale.saleNumber}</div>
                      <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{sale.date}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-800">{sale.customerName}</div>
                      {sale.customerPhone && (
                        <div className="text-[10px] text-stone-400">{sale.customerPhone}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 max-w-xs">
                        {sale.items.map((it, idx) => (
                          <div key={idx} className="text-stone-700 flex items-center justify-between gap-2">
                            <span className="font-medium truncate">{it.productName}</span>
                            <span className="font-mono font-bold text-stone-800 text-[11px] shrink-0">
                              x{it.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-stone-500 font-medium">
                      {formatCurrency(sale.totalCost, business.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-800">
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
                      <div className="text-[10px] text-stone-400 mt-0.5">{sale.paymentMethod}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onGenerateInvoiceFromSale(sale)}
                          className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-800 hover:text-rose-800 border border-stone-200 hover:border-rose-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Generar Factura para esta venta"
                        >
                          <Receipt className="w-3.5 h-3.5 text-rose-700" />
                          <span>Facturar</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar la venta ${sale.saleNumber}?`)) {
                              onDeleteSale(sale.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg cursor-pointer"
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

      {isOpenModal && onCloseModal && (
        <SaleFormModal
          isOpen={isOpenModal}
          onClose={onCloseModal}
          products={products}
          salesCount={sales.length}
          business={business}
          preselectedProduct={preselectedProduct}
          onSaveSale={onSaveSale}
        />
      )}
    </div>
  );
};
