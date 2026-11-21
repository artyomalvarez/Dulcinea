import React, { useState } from 'react';
import { ChefHat, ShoppingBag } from 'lucide-react';
import { BusinessProfile, Product, ProductionBatch, Sale } from '../entities';
import { ProductionList } from '../features/production/components/ProductionList';
import { SalesList } from '../features/sales/components/SalesList';

interface WorkshopPageProps {
  products: Product[];
  batches: ProductionBatch[];
  sales: Sale[];
  business: BusinessProfile;
  initialSubTab?: 'production' | 'sales';
  // Production props
  onSaveBatch: (batch: ProductionBatch) => void;
  onDeleteBatch: (id: string) => void;
  isOpenBatchModal: boolean;
  onCloseBatchModal: () => void;
  onOpenNewBatchModal: () => void;
  preselectedProductForBatch: Product | null;
  // Sales props
  onSaveSale: (sale: Sale) => void;
  onDeleteSale: (id: string) => void;
  onGenerateInvoiceFromSale: (sale: Sale) => void;
  isOpenSaleModal: boolean;
  onCloseSaleModal: () => void;
  onOpenNewSaleModal: () => void;
  preselectedProductForSale: Product | null;
}

export const WorkshopPage: React.FC<WorkshopPageProps> = ({
  products,
  batches,
  sales,
  business,
  initialSubTab = 'production',
  onSaveBatch,
  onDeleteBatch,
  isOpenBatchModal,
  onCloseBatchModal,
  onOpenNewBatchModal,
  preselectedProductForBatch,
  onSaveSale,
  onDeleteSale,
  onGenerateInvoiceFromSale,
  isOpenSaleModal,
  onCloseSaleModal,
  onOpenNewSaleModal,
  preselectedProductForSale,
}) => {
  const [subTab, setSubTab] = useState<'production' | 'sales'>(initialSubTab);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Toggle Switch */}
      <div className="flex items-center justify-between bg-white p-2.5 sm:p-3 rounded-2xl border border-dulcinea-copper/25 shadow-sm">
        <div className="flex items-center bg-dulcinea-cream/55 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setSubTab('production')}
            className={`flex-1 sm:flex-none px-5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
              subTab === 'production'
                ? 'bg-white text-dulcinea-midnight shadow-sm'
                : 'text-stone-600 hover:text-dulcinea-midnight'
            }`}
          >
            <ChefHat className="w-4 h-4 text-dulcinea-copper" />
            <span>Producción</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                subTab === 'production'
                  ? 'bg-dulcinea-copper/25 text-dulcinea-midnight'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              {batches.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('sales')}
            className={`flex-1 sm:flex-none px-5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
              subTab === 'sales'
                ? 'bg-white text-dulcinea-midnight shadow-sm'
                : 'text-stone-600 hover:text-dulcinea-midnight'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-dulcinea-copper" />
            <span>Ventas</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                subTab === 'sales' ? 'bg-dulcinea-copper/25 text-dulcinea-midnight' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {sales.length}
            </span>
          </button>
        </div>

        <div className="hidden sm:block text-xs text-stone-400 font-medium">
          {subTab === 'production'
            ? 'Registro de horneadas y lotes activos'
            : 'Registro de ventas y descargo de inventario'}
        </div>
      </div>

      {/* Render active sub-view */}
      {subTab === 'production' ? (
        <ProductionList
          batches={batches}
          products={products}
          business={business}
          onSaveBatch={onSaveBatch}
          onDeleteBatch={onDeleteBatch}
          isOpenModal={isOpenBatchModal}
          onCloseModal={onCloseBatchModal}
          onOpenNewModal={onOpenNewBatchModal}
          preselectedProduct={preselectedProductForBatch}
        />
      ) : (
        <SalesList
          sales={sales}
          products={products}
          batches={batches}
          business={business}
          onSaveSale={onSaveSale}
          onDeleteSale={onDeleteSale}
          onGenerateInvoiceFromSale={onGenerateInvoiceFromSale}
          isOpenModal={isOpenSaleModal}
          onCloseModal={onCloseSaleModal}
          onOpenNewModal={onOpenNewSaleModal}
          preselectedProduct={preselectedProductForSale}
        />
      )}
    </div>
  );
};
