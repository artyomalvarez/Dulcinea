import React from 'react';
import { BusinessProfile, Sale } from '../../../entities';
import { SaleRow } from './SaleRow';

interface SalesTableProps {
  sales: Sale[];
  business: BusinessProfile;
  onGenerateInvoiceFromSale: (sale: Sale) => void;
  onDeleteSale: (id: string) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  business,
  onGenerateInvoiceFromSale,
  onDeleteSale,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-dulcinea-copper/25 shadow-sm overflow-hidden">
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
            {sales.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-stone-400">
                  No se han registrado ventas. Haz clic en "Registrar Venta" para anotar un pedido.
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <SaleRow
                  key={sale.id}
                  sale={sale}
                  business={business}
                  onGenerateInvoiceFromSale={onGenerateInvoiceFromSale}
                  onDeleteSale={onDeleteSale}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
