import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { BusinessProfile, Product, ProductionBatch, Sale } from '../../../entities';
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

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-dulcinea-copper/25 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-dulcinea-midnight font-serif">
            Registro de Ventas y Pedidos
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Control de productos entregados, cobros a clientes y utilidad real obtenida en cada pedido.
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-dulcinea-copper hover:bg-[#c88a58] text-dulcinea-midnight font-bold text-xs sm:text-sm shadow-sm transition-all duration-150 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-dulcinea-midnight" />
          <span>Registrar Venta</span>
        </button>
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
