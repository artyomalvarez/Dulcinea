import React, { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { BusinessProfile, Product, ProductionBatch, Sale } from '../../../entities';
import { formatCurrency } from '../../../shared/lib';
import { SalesTable } from './SalesTable';
import { SaleFormModal } from './SaleFormModal';

export { SaleFormModal };

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

  const { totalRevenue, totalNetProfit, averageTicket } = useMemo(() => {
    const revenue = Math.round(sales.reduce((acc, s) => acc + (s.subtotal ?? s.totalAmount), 0) * 100) / 100;
    const profit = Math.round(sales.reduce((acc, s) => acc + (s.netProfit || 0), 0) * 100) / 100;
    const avg = sales.length > 0 ? Math.round((revenue / sales.length) * 100) / 100 : 0;
    return { totalRevenue: revenue, totalNetProfit: profit, averageTicket: avg };
  }, [sales]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-dulcinea-copper/25 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-dulcinea-midnight font-serif">
            Ventas y Pedidos
          </h2>
          <p className="text-xs text-dulcinea-muted mt-0.5">
            Registra tus ventas rápidamente y consulta los ingresos reales de tu taller.
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dulcinea-copper hover:bg-[#c88a58] text-dulcinea-midnight font-bold text-xs sm:text-sm shadow-sm transition-all duration-150 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-dulcinea-midnight" />
          <span>+ Registrar venta</span>
        </button>
      </div>

      {/* Operational Sales KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-bold text-dulcinea-muted uppercase tracking-wider block">
            Operaciones
          </span>
          <span className="text-xl font-bold font-mono text-dulcinea-midnight mt-1 block">
            {sales.length} ventas
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-bold text-dulcinea-muted uppercase tracking-wider block">
            Ingresos Totales
          </span>
          <span className="text-xl font-bold font-mono text-dulcinea-midnight mt-1 block">
            {formatCurrency(totalRevenue, business.currencySymbol)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-bold text-dulcinea-muted uppercase tracking-wider block">
            Ticket Promedio
          </span>
          <span className="text-xl font-bold font-mono text-dulcinea-blue mt-1 block">
            {formatCurrency(averageTicket, business.currencySymbol)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs">
          <span className="text-[11px] font-bold text-dulcinea-success uppercase tracking-wider block">
            Ganancia Neta
          </span>
          <span className="text-xl font-bold font-mono text-dulcinea-success mt-1 block">
            +{formatCurrency(totalNetProfit, business.currencySymbol)}
          </span>
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-2xl border border-dulcinea-copper/25 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, folio o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-dulcinea-copper/30 focus:border-dulcinea-copper"
          />
        </div>
        <span className="text-xs text-stone-400 hidden sm:block">
          {filteredSales.length} venta(s) encontradas
        </span>
      </div>

      <SalesTable
        sales={filteredSales}
        business={business}
        onGenerateInvoiceFromSale={onGenerateInvoiceFromSale}
        onDeleteSale={onDeleteSale}
      />

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
