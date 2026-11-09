import React from 'react';
import {
  Printer,
  Download,
  X,
  Cake,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { BusinessProfile, Invoice } from '../../types/bakery';
import { formatCurrency, formatPercent } from '../../utils/units';

interface InvoiceViewerProps {
  invoice: Invoice;
  business: BusinessProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (status: Invoice['status']) => void;
}

export const InvoiceViewer: React.FC<InvoiceViewerProps> = ({
  invoice,
  business,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-2 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Controls Bar (Hidden during Print via .no-print) */}
        <div className="px-6 py-3.5 bg-stone-900 text-white flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-amber-400 font-bold">{invoice.invoiceNumber}</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                invoice.status === 'Pagada'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onUpdateStatus && invoice.status !== 'Pagada' && (
              <button
                onClick={() => onUpdateStatus('Pagada')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Marcar Pagada</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-md cursor-pointer"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Descargar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-8 sm:p-12 overflow-y-auto printable-invoice bg-white text-gray-800 text-xs">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-gray-200">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center font-bold shadow-xs">
                  <Cake className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif tracking-tight">
                    {invoice.businessName || business.businessName}
                  </h1>
                  <p className="text-[11px] text-amber-900 font-medium">
                    {business.tagline || 'Taller de Repostería Artesanal'}
                  </p>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-gray-500 space-y-0.5">
                <div>
                  <strong>Identificación Fiscal:</strong> {invoice.businessTaxId || business.taxId}
                </div>
                <div>
                  <strong>Dirección:</strong> {invoice.businessAddress || business.address}, {business.city}
                </div>
                <div>
                  <strong>Contacto:</strong> {invoice.businessPhone || business.phone} | {invoice.businessEmail || business.email}
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 sm:min-w-64">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest block">
                Comprobante / Factura
              </span>
              <div className="text-xl font-extrabold text-gray-900 font-mono">
                {invoice.invoiceNumber}
              </div>
              <div className="pt-1 text-[11px] text-gray-600 space-y-0.5">
                <div>
                  <strong>Fecha de Emisión:</strong> {invoice.issueDate}
                </div>
                <div>
                  <strong>Vencimiento:</strong> {invoice.dueDate}
                </div>
                <div>
                  <strong>Método de Pago:</strong> {invoice.paymentMethod}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info Box */}
          <div className="my-6 p-4 rounded-2xl bg-gray-50 border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Datos del Cliente
              </span>
              <div className="text-sm font-bold text-gray-900">{invoice.customerName}</div>
              {invoice.customerTaxId && (
                <div className="text-[11px] text-gray-600 mt-0.5">
                  <strong>RFC / ID Fiscal:</strong> {invoice.customerTaxId}
                </div>
              )}
              {invoice.customerAddress && (
                <div className="text-[11px] text-gray-500 mt-0.5">{invoice.customerAddress}</div>
              )}
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Contacto del Cliente
              </span>
              {invoice.customerPhone && (
                <div className="text-[11px] text-gray-700">
                  <strong>Tel:</strong> {invoice.customerPhone}
                </div>
              )}
              {invoice.customerEmail && (
                <div className="text-[11px] text-gray-700">
                  <strong>Email:</strong> {invoice.customerEmail}
                </div>
              )}
              <div className="mt-1">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    invoice.status === 'Pagada'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Estado: {invoice.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden mb-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-amber-50/60 border-b border-amber-200 text-gray-700 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Descripción del Producto / Servicio</th>
                  <th className="py-3 px-4 text-center w-24">Cantidad</th>
                  <th className="py-3 px-4 text-right w-32">Precio Unitario</th>
                  <th className="py-3 px-4 text-right w-32">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium text-gray-900">{item.description}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-gray-800">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-700">
                      {formatCurrency(item.unitPrice, business.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                      {formatCurrency(item.amount, business.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
            <div className="sm:max-w-xs space-y-2 text-[11px] text-gray-500">
              {invoice.notes && (
                <div>
                  <strong className="text-gray-700">Notas:</strong>
                  <p className="mt-0.5 italic">{invoice.notes}</p>
                </div>
              )}
              <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 text-amber-900">
                {business.invoiceFooterMessage ||
                  'Agradecemos su preferencia. Todos nuestros postres son elaborados con ingredientes de la más alta calidad.'}
              </div>
            </div>

            <div className="sm:w-72 space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-gray-900">
                  {formatCurrency(invoice.subtotal, business.currencySymbol)}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>{business.taxName} ({invoice.taxRatePercent}%):</span>
                <span className="font-mono font-bold text-gray-900">
                  {formatCurrency(invoice.taxAmount, business.currencySymbol)}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-extrabold text-amber-950">
                <span>TOTAL:</span>
                <span className="font-mono text-base font-extrabold text-amber-900">
                  {formatCurrency(invoice.total, business.currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Stamp / Signature Block */}
          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-400 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gray-100 border border-gray-300 flex items-center justify-center font-bold text-gray-500 font-mono">
                ✓
              </div>
              <span>Comprobante generado electrónicamente por DulceCosto Repostería</span>
            </div>

            <div className="text-center sm:text-right">
              <div className="border-b border-gray-300 w-44 mb-1"></div>
              <span>Firma / Sello del Taller Artesanal</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
