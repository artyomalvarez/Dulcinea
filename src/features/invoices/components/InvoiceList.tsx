import React, { useState } from 'react';
import {
  Plus,
  Search,
  Printer,
  Trash2,
  Calendar
} from 'lucide-react';
import { BusinessProfile, Invoice } from '../../../entities';
import { formatCurrency } from '../../../shared/lib';

interface InvoiceListProps {
  invoices: Invoice[];
  business: BusinessProfile;
  onOpenCreateModal: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onUpdateInvoiceStatus: (id: string, status: Invoice['status']) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  business,
  onOpenCreateModal,
  onViewInvoice,
  onDeleteInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const filtered = invoices.filter((inv) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(term) ||
      inv.customerName.toLowerCase().includes(term) ||
      (inv.customerTaxId && inv.customerTaxId.toLowerCase().includes(term));
    const matchesStatus = statusFilter === 'todos' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-800 font-serif">
            Facturas y Comprobantes Fiscales
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Genera comprobantes para tus clientes con desglose de productos, {business.taxName} y opción de imprimir o guardar en PDF.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A2E40] hover:bg-[#142433] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D4A373]" />
          <span>Nueva Factura</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por folio, cliente o NIT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-stone-400 font-medium">Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-stone-200 bg-white text-stone-700 focus:outline-none focus:border-rose-600"
          >
            <option value="todos">Todos los estados</option>
            <option value="Emitida">Emitida</option>
            <option value="Pagada">Pagada</option>
            <option value="Anulada">Anulada</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200/80 text-stone-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Folio / Fecha</th>
                <th className="py-3 px-4">Cliente / Nombre del Negocio</th>
                <th className="py-3 px-4">Conceptos</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">{business.taxName}</th>
                <th className="py-3 px-4 text-right">Total Facturado</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No se encontraron facturas registradas.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-gray-900">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{inv.issueDate}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{inv.customerName}</div>
                      {inv.customerTaxId && (
                        <div className="text-[10px] text-gray-400 font-mono">{inv.customerTaxId}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-gray-700 font-medium">
                        {inv.items.length} concepto(s)
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-gray-700">
                      {formatCurrency(inv.subtotal, business.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-gray-500">
                      {formatCurrency(inv.taxAmount, business.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-amber-950">
                      {formatCurrency(inv.total, business.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'Pagada'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'Emitida'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewInvoice(inv)}
                          className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          title="Ver e Imprimir / Descargar PDF"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-400" />
                          <span>Imprimir</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`¿Deseas eliminar la factura ${inv.invoiceNumber}?`)) {
                              onDeleteInvoice(inv.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
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
    </div>
  );
};
