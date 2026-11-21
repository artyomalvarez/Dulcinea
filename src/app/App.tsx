/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  BusinessProfile,
  Ingredient,
  Invoice,
  Product,
  ProductionBatch,
  Sale,
} from '../entities';
import { useAppStore } from '../shared/store/useAppStore';
import { Header, ActiveTab } from '../widgets/Header';
import { SettingsModal } from '../widgets/SettingsModal';
import { ProductFormModal } from '../features/products/components/ProductFormModal';
import { ProductionBatchModal } from '../features/production/components/ProductionList';
import { SaleFormModal } from '../features/sales/components/SaleFormModal';
import { InvoiceModal } from '../features/invoices/components/InvoiceModal';
import { InvoiceViewer } from '../features/invoices/components/InvoiceViewer';
import { ProfitabilityCalculatorModal } from '../features/profitability/components/ProfitabilityCalculatorModal';
import {
  DashboardPage,
  CatalogPage,
  WorkshopPage,
  AdminPage,
} from '../pages';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [catalogSubTab, setCatalogSubTab] = useState<'recipes' | 'ingredients'>('recipes');

  // Global Zustand Store
  const {
    business,
    ingredients,
    products,
    batches,
    sales,
    invoices,
    saveProduct,
    deleteProduct,
    saveIngredient,
    deleteIngredient,
    saveBatch,
    deleteBatch,
    saveSale,
    deleteSale,
    saveInvoice,
    deleteInvoice,
    updateInvoiceStatus,
    saveBusiness,
  } = useAppStore();

  // Modal UI States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [preselectedProductForBatch, setPreselectedProductForBatch] = useState<Product | null>(null);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [preselectedProductForSale, setPreselectedProductForSale] = useState<Product | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [saleForInvoice, setSaleForInvoice] = useState<Sale | null>(null);

  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'settings' | 'backup'>('settings');

  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);

  const handleSaveProduct = (prod: Product) => {
    saveProduct(prod);
    toast.success(`Receta "${prod.name}" guardada correctamente.`);
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    toast.info('Producto eliminado del catálogo.');
  };

  const handleSaveIngredient = (ing: Ingredient) => {
    saveIngredient(ing);
    toast.success(`Insumo "${ing.name}" guardado.`);
  };

  const handleDeleteIngredient = (id: string) => {
    deleteIngredient(id);
    toast.info('Insumo eliminado.');
  };

  const handleSaveBatch = (batch: ProductionBatch) => {
    saveBatch(batch);
    toast.success(`Lote ${batch.batchCode} registrado.`);
  };

  const handleDeleteBatch = (id: string) => {
    deleteBatch(id);
    toast.info('Lote eliminado.');
  };

  const handleSaveSale = (sale: Sale) => {
    saveSale(sale);
    toast.success(`Venta ${sale.saleNumber} guardada con éxito.`);
  };

  const handleDeleteSale = (id: string) => {
    deleteSale(id);
    toast.info('Venta eliminada y stock restaurado.');
  };

  const handleSaveInvoice = (inv: Invoice) => {
    saveInvoice(inv);
    toast.success(`Factura ${inv.invoiceNumber} generada.`);
  };

  const handleDeleteInvoice = (id: string) => {
    deleteInvoice(id);
    toast.info('Factura eliminada.');
  };

  const handleUpdateInvoiceStatus = (id: string, status: Invoice['status']) => {
    updateInvoiceStatus(id, status);
    if (viewingInvoice && viewingInvoice.id === id) {
      setViewingInvoice({ ...viewingInvoice, status });
    }
    toast.success(`Estado actualizado a "${status}".`);
  };

  const handleSaveBusiness = (updated: BusinessProfile) => {
    saveBusiness(updated);
    toast.success('Configuración del negocio actualizada.');
  };

  return (
    <div className="min-h-screen bg-dulcinea-dots text-dulcinea-midnight flex flex-col font-sans selection:bg-dulcinea-copper/30 selection:text-dulcinea-midnight">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        business={business}
        onOpenSettings={() => {
          setSettingsInitialTab('settings');
          setIsSettingsOpen(true);
        }}
        onOpenBackup={() => {
          setSettingsInitialTab('backup');
          setIsSettingsOpen(true);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {activeTab === 'dashboard' && (
          <DashboardPage
            products={products}
            batches={batches}
            sales={sales}
            ingredients={ingredients}
            business={business}
            onOpenSaleModal={() => {
              setPreselectedProductForSale(null);
              setIsSaleModalOpen(true);
            }}
            onOpenBatchModal={() => {
              setPreselectedProductForBatch(null);
              setIsBatchModalOpen(true);
            }}
            onNavigateToIngredients={() => {
              setCatalogSubTab('ingredients');
              setActiveTab('catalog');
            }}
            onNavigateToCatalog={() => {
              setCatalogSubTab('recipes');
              setActiveTab('catalog');
            }}
            onNavigateToWorkshop={() => {
              setActiveTab('workshop');
            }}
            onOpenCalculator={() => setIsCalculatorModalOpen(true)}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogPage
            products={products}
            ingredients={ingredients}
            business={business}
            initialSubTab={catalogSubTab}
            onOpenCreateProduct={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            onEditProduct={(product) => {
              setEditingProduct(product);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
            onMakeBatch={(product) => {
              setPreselectedProductForBatch(product);
              setIsBatchModalOpen(true);
            }}
            onSaveIngredient={handleSaveIngredient}
            onDeleteIngredient={handleDeleteIngredient}
            onOpenCalculator={() => setIsCalculatorModalOpen(true)}
          />
        )}

        {activeTab === 'workshop' && (
          <WorkshopPage
            products={products}
            batches={batches}
            sales={sales}
            business={business}
            onSaveBatch={handleSaveBatch}
            onDeleteBatch={handleDeleteBatch}
            isOpenBatchModal={isBatchModalOpen}
            onCloseBatchModal={() => {
              setIsBatchModalOpen(false);
              setPreselectedProductForBatch(null);
            }}
            onOpenNewBatchModal={() => {
              setPreselectedProductForBatch(null);
              setIsBatchModalOpen(true);
            }}
            preselectedProductForBatch={preselectedProductForBatch}
            onSaveSale={handleSaveSale}
            onDeleteSale={handleDeleteSale}
            onGenerateInvoiceFromSale={(sale) => {
              setSaleForInvoice(sale);
              setIsInvoiceModalOpen(true);
            }}
            isOpenSaleModal={isSaleModalOpen}
            onCloseSaleModal={() => {
              setIsSaleModalOpen(false);
              setPreselectedProductForSale(null);
            }}
            onOpenNewSaleModal={() => {
              setPreselectedProductForSale(null);
              setIsSaleModalOpen(true);
            }}
            preselectedProductForSale={preselectedProductForSale}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPage
            invoices={invoices}
            products={products}
            batches={batches}
            sales={sales}
            business={business}
            onOpenCreateInvoice={() => {
              setSaleForInvoice(null);
              setIsInvoiceModalOpen(true);
            }}
            onViewInvoice={(inv) => {
              setViewingInvoice(inv);
              setIsViewerOpen(true);
            }}
            onDeleteInvoice={handleDeleteInvoice}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            onOpenSettings={() => {
              setSettingsInitialTab('settings');
              setIsSettingsOpen(true);
            }}
          />
        )}
      </main>

      <footer className="bg-white/90 backdrop-blur-xs border-t border-dulcinea-copper/25 py-4 text-center text-xs text-stone-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-dulcinea-midnight font-serif">
            {business.businessName || 'Dulcinea'} &bull; Taller de Repostería Artesanal
          </span>
          <span className="font-mono text-[11px] text-stone-500 bg-dulcinea-cream/50 px-3 py-1 rounded-full border border-dulcinea-copper/20">
            Costo Unitario = Insumos ÷ Rendimiento | Utilidad = Venta - Costo
          </span>
        </div>
      </footer>

      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        ingredients={ingredients}
        business={business}
        onSave={handleSaveProduct}
      />

      <ProductionBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => {
          setIsBatchModalOpen(false);
          setPreselectedProductForBatch(null);
        }}
        onSaveBatch={handleSaveBatch}
        products={products}
        batchesCount={batches.length}
        business={business}
        preselectedProduct={preselectedProductForBatch}
      />

      <SaleFormModal
        isOpen={isSaleModalOpen}
        onClose={() => {
          setIsSaleModalOpen(false);
          setPreselectedProductForSale(null);
        }}
        onSaveSale={handleSaveSale}
        products={products}
        salesCount={sales.length}
        business={business}
        preselectedProduct={preselectedProductForSale}
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSaleForInvoice(null);
        }}
        onSaveInvoice={handleSaveInvoice}
        business={business}
        products={products}
        initialSale={saleForInvoice}
      />

      {viewingInvoice && (
        <InvoiceViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          invoice={viewingInvoice}
          business={business}
          onUpdateStatus={(st) => handleUpdateInvoiceStatus(viewingInvoice.id, st)}
        />
      )}

      {isCalculatorModalOpen && (
        <ProfitabilityCalculatorModal
          business={business}
          isOpen={isCalculatorModalOpen}
          onClose={() => setIsCalculatorModalOpen(false)}
          isStandaloneTab={false}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        business={business}
        onSaveBusiness={handleSaveBusiness}
        onDataReload={() => {}}
        initialTab={settingsInitialTab}
      />
    </div>
  );
}
