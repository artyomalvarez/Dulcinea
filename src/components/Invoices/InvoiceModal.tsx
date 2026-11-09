import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Receipt,
  DollarSign,
  User,
  Calendar,
  Sparkles
} from 'lucide-react';
import { BusinessProfile, Invoice, InvoiceItem, Product, Sale } from '../../types/bakery';
import { formatCurrency } from '../../utils/units';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveInvoice: (invoice: Invoice) => void;
  business: BusinessProfile;
  products: Product[];
  initialSale?: Sale | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSaveInvoice,
  business,
  products,
  initialSale,
}) => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerTaxId, setCustomerTaxId] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transferencia Bancaria');
  const [status, setStatus] = useState<Invoice['status']>('Emitida');
  const [taxRatePercent, setTaxRatePercent] = useState<number>(16);
  const [notes, setNotes] = useState('Gracias por su preferencia.');
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Item input
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const inSevenDays = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      setIssueDate(today.toISOString().split('T')[0]);
      setDueDate(inSevenDays.toISOString().split('T')[0]);
      setTaxRatePercent(business.defaultTaxRate || 16);

      if (initialSale) {
        // Pre-fill from existing sale
        setInvoiceNumber(`${business.invoicePrefix || 'FACT-2026'}-${business.nextInvoiceNumber || 105}`);
        setCustomerName(initialSale.customerName);
        setCustomerPhone(initialSale.customerPhone || '');
        setCustomerEmail(initialSale.customerEmail || '');
        setPaymentMethod(initialSale.paymentMethod);
        setStatus(initialSale.paymentStatus === 'Pagado' ? 'Pagada' : 'Emitida');
        setItems(
          initialSale.items.map((it, idx) => ({
            id: `item-${idx}`,
            description: `${it.productName} (Elaboración artesanal)`,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            amount: it.totalPrice,
          }))
        );
      } else {
        // Fresh invoice
        setInvoiceNumber(`${business.invoicePrefix || 'FACT-2026'}-${business.nextInvoiceNumber || 105}`);
        setCustomerName('');
        setCustomerTaxId('');
        setCustomerAddress('');
        setCustomerPhone('');
        setCustomerEmail('');
        setPaymentMethod('Transferencia Bancaria');
        setStatus('Emitida');
        setItems([]);
      }
    }
  }, [isOpen, initialSale, business]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!newItemDesc.trim() || newItemQty <= 0 || newItemPrice < 0) return;
    const item: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: newItemDesc.trim(),
      quantity: Number(newItemQty),
      unitPrice: Number(newItemPrice),
      amount: Math.round(newItemQty * newItemPrice * 100) / 100,
    };
    setItems([...items, item]);
    setNewItemDesc('');
    setNewItemQty(1);
    setNewItemPrice(0);
  };

  const handleSelectProduct = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setNewItemDesc(`${prod.name} (${prod.batchYieldUnits} ${prod.yieldUnitName})`);
      setNewItemPrice(prod.sellingPrice);
      setNewItemQty(1);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
  };

  const subtotal = items.reduce((acc, it) => acc + it.amount, 0);
  const taxAmount = Math.round((subtotal * (taxRatePercent / 100)) * 100) / 100;
  const total = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || items.length === 0) return;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNumber.trim(),
      issueDate,
      dueDate,
      businessName: business.businessName,
      businessTaxId: business.taxId,
      businessAddress: business.address,
      businessPhone: business.phone,
      businessEmail: business.email,
      customerName: customerName.trim(),
      customerTaxId: customerTaxId.trim(),
      customerAddress: customerAddress.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      items,
      subtotal,
      taxRatePercent,
      taxAmount,
      total,
      paymentMethod,
      status,
      notes: notes.trim(),
      saleId: initialSale?.id,
    };

    onSaveInvoice(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-700 to-rose-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif">Emitir Factura o Comprobante</h3>
              <p className="text-xs text-amber-100">
                Detalle para entrega con datos fiscales y desglose de impuestos
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Invoice Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Folio / Número *</label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Fecha de Emisión *</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Fecha de Vencimiento *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Datos del Cliente / Receptor
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nombre o Razón Social *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carolina Méndez, Restaurante Bistro"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">RFC / NIT / Identificación Fiscal</label>
                <input
                  type="text"
                  placeholder="Ej: MEN-920415-X11"
                  value={customerTaxId}
                  onChange={(e) => setCustomerTaxId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Dirección Fiscal / Entrega</label>
                <input
                  type="text"
                  placeholder="Calle, Número, Colonia, Ciudad"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  placeholder="55 1234 5678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="cliente@dominio.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Conceptos a Facturar
              </span>
              {products.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-400">Rellenar con:</span>
                  <select
                    onChange={(e) => handleSelectProduct(e.target.value)}
                    className="text-xs py-1 px-2 rounded-lg border border-gray-200 bg-white"
                  >
                    <option value="">-- Catálogo de productos --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatCurrency(p.sellingPrice, business.currencySymbol)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Input row */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Descripción del pastel, galletas o servicio..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="number"
                  min="1"
                  placeholder="Cant"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(Number(e.target.value))}
                  className="w-20 px-2 py-2 rounded-xl border border-gray-200 bg-white text-xs font-mono font-bold text-center focus:outline-none focus:border-amber-500"
                />

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Precio U"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(Number(e.target.value))}
                  className="w-24 px-2 py-2 rounded-xl border border-gray-200 bg-white text-xs font-mono font-bold text-center focus:outline-none focus:border-amber-500"
                />

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir</span>
                </button>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold border-b border-gray-100">
                    <th className="py-2.5 px-3">Descripción</th>
                    <th className="py-2.5 px-3 text-center">Cant</th>
                    <th className="py-2.5 px-3 text-right">Precio U</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-400">
                        Agrega al menos un concepto a la factura.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-semibold text-gray-800">{item.description}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-gray-700">
                          {formatCurrency(item.unitPrice, business.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                          {formatCurrency(item.amount, business.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
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

          {/* Totals & Tax rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Método de Pago</label>
                  <input
                    type="text"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="Transferencia SPEI, Efectivo"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Estado de la Factura</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Emitida">Emitida (Por Cobrar)</option>
                    <option value="Pagada">Pagada</option>
                    <option value="Anulada">Anulada</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <label className="block font-bold text-gray-700 mb-1">Notas / Términos de Entrega</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Summary card */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2.5">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-gray-900">
                  {formatCurrency(subtotal, business.currencySymbol)}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span>Tasa Impuesto:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxRatePercent}
                    onChange={(e) => setTaxRatePercent(Number(e.target.value))}
                    className="w-14 px-1.5 py-0.5 rounded border border-gray-300 font-mono text-center font-bold"
                  />
                  <span>%</span>
                </div>
                <span className="font-mono font-bold text-gray-900">
                  {formatCurrency(taxAmount, business.currencySymbol)}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-extrabold text-amber-950">
                <span>TOTAL A PAGAR:</span>
                <span className="font-mono text-lg font-extrabold text-amber-900">
                  {formatCurrency(total, business.currencySymbol)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 font-medium text-xs cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={items.length === 0 || !customerName.trim()}
            className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Emitir Factura
          </button>
        </div>
      </div>
    </div>
  );
};
