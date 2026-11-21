import React from 'react';
import { Calendar, Receipt, Trash2 } from 'lucide-react';
import { BusinessProfile, Sale } from '../../../entities';
import { formatCurrency, formatPercent } from '../../../shared/lib';

interface SaleRowProps {
  sale: Sale;
  business: BusinessProfile;
  onGenerateInvoiceFromSale: (sale: Sale) => void;
  onDeleteSale: (id: string) => void;
}

export const SaleRow: React.FC<SaleRowProps> = ({
  sale,
  business,
  onGenerateInvoiceFromSale,
  onDeleteSale,
}) => {
  return (
    <tr className="hover:bg-dulcinea-cream/25 transition-colors">
      <td className="py-3.5 px-4">
        <div className="font-mono font-bold text-dulcinea-midnight">{sale.saleNumber}</div>
        <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
          <Calendar className="w-3 h-3" />
          <span>{sale.date}</span>
        </div>
      </td>

      <td className="py-3.5 px-4">
        <div className="font-bold text-dulcinea-midnight">{sale.customerName}</div>
        {sale.customerPhone && <div className="text-[10px] text-stone-400">{sale.customerPhone}</div>}
      </td>

      <td className="py-3.5 px-4">
        <div className="space-y-0.5 max-w-xs">
          {sale.items.map((it, idx) => (
            <div key={idx} className="text-stone-700 flex items-center justify-between gap-2">
              <span className="font-medium truncate">{it.productName}</span>
              <span className="font-mono font-bold text-dulcinea-midnight text-[11px] shrink-0">
                x{it.quantity}
              </span>
            </div>
          ))}
        </div>
      </td>

      <td className="py-3.5 px-4 text-right font-mono text-stone-500 font-medium">
        {formatCurrency(sale.totalCost, business.currencySymbol)}
      </td>

      <td className="py-3.5 px-4 text-right font-mono font-bold text-dulcinea-midnight">
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
              : 'bg-dulcinea-cream text-dulcinea-midnight border border-dulcinea-copper/35'
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
            className="px-2.5 py-1 rounded-xl bg-dulcinea-cream/60 hover:bg-dulcinea-cream text-dulcinea-midnight border border-dulcinea-copper/35 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            title="Generar Factura para esta venta"
          >
            <Receipt className="w-3.5 h-3.5 text-dulcinea-copper" />
            <span>Facturar</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm(`¿Eliminar la venta ${sale.saleNumber}?`)) {
                onDeleteSale(sale.id);
              }
            }}
            className="p-1.5 text-stone-400 hover:text-dulcinea-cherry hover:bg-dulcinea-cherry/10 rounded-lg transition-all active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
