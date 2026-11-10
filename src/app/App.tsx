/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BusinessProfile,
  Ingredient,
  Invoice,
  Product,
  ProductionBatch,
  Sale,
} from '../entities';
import { storageAdapter } from '../shared/api/localStorage';
import { applySaleToBatches, revertSaleFromBatches } from '../shared/lib';
import { Header, ActiveTab } from '../widgets/Header';
import { SettingsModal } from '../widgets/SettingsModal';
import { ProductFormModal } from '../features/products/components/ProductFormModal';
import { ProductionBatchModal } from '../features/production/components/ProductionList';
import { SaleFormModal } from '../features/sales/components/SalesList';
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

  // Application Data initialized via localStorage adapter
  const [business, setBusiness] = useState<BusinessProfile>(() => storageAdapter.getBusinessProfile());
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => storageAdapter.getIngredients());
  const [products, setProducts] = useState<Product[]>(() => storageAdapter.getProducts());
  const [batches, setBatches] = useState<ProductionBatch[]>(() => storageAdapter.getBatches());
  const [sales, setSales] = useState<Sale[]>(() => storageAdapter.getSales());
  const [invoices, setInvoices] = useState<Invoice[]>(() => storageAdapter.getInvoices());

  // Modal States
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

  // Sync from storage
  const reloadDataFromStorage = () => {
    setBusiness(storageAdapter.getBusinessProfile());
    setIngredients(storageAdapter.getIngredients());
    setProducts(storageAdapter.getProducts());
    setBatches(storageAdapter.getBatches());
    setSales(storageAdapter.getSales());
    setInvoices(storageAdapter.getInvoices());
  };

  // Products CRUD
  const handleSaveProduct = (newProd: Product) => {
    const current = storageAdapter.getProducts();
    const exists = current.some((p) => p.id === newProd.id);
    const updated = exists
      ? current.map((p) => (p.id === newProd.id ? newProd : p))
      : [newProd, ...current];
    storageAdapter.saveProducts(updated);
    setProducts(updated);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = storageAdapter.getProducts().filter((p) => p.id !== id);
    storageAdapter.saveProducts(updated);
    setProducts(updated);
  };

  // Ingredients CRUD
  const handleSaveIngredient = (newIng: Ingredient) => {
    const current = storageAdapter.getIngredients();
    const exists = current.some((i) => i.id === newIng.id);
    const updated = exists
      ? current.map((i) => (i.id === newIng.id ? newIng : i))
      : [newIng, ...current];
    storageAdapter.saveIngredients(updated);
    setIngredients(updated);
  };

  const handleDeleteIngredient = (id: string) => {
    const updated = storageAdapter.getIngredients().filter((i) => i.id !== id);
    storageAdapter.saveIngredients(updated);
    setIngredients(updated);
  };

  // Batches CRUD
  const handleSaveBatch = (newBatch: ProductionBatch) => {
    const current = storageAdapter.getBatches();
    const exists = current.some((b) => b.id === newBatch.id);
    const updated = exists
      ? current.map((b) => (b.id === newBatch.id ? newBatch : b))
      : [newBatch, ...current];
    storageAdapter.saveBatches(updated);
    setBatches(updated);
  };

  const handleDeleteBatch = (id: string) => {
    const updated = storageAdapter.getBatches().filter((b) => b.id !== id);
    storageAdapter.saveBatches(updated);
    setBatches(updated);
  };

  // Sales CRUD & Stock reconciliation
  const handleSaveSale = (newSale: Sale) => {
    const currentSales = storageAdapter.getSales();
    const currentBatches = storageAdapter.getBatches();

    const existingSale = currentSales.find((s) => s.id === newSale.id);

    let workingBatches = currentBatches;
    if (existingSale) {
      workingBatches = revertSaleFromBatches(existingSale, workingBatches);
    }

    const updatedBatches = applySaleToBatches(newSale, workingBatches);

    storageAdapter.saveBatches(updatedBatches);
    setBatches(updatedBatches);

    const updatedSales = existingSale
      ? currentSales.map((s) => (s.id === newSale.id ? newSale : s))
      : [newSale, ...currentSales];

    storageAdapter.saveSales(updatedSales);
    setSales(updatedSales);
  };

  const handleDeleteSale = (saleId: string) => {
    const currentSales = storageAdapter.getSales();
    const saleToDelete = currentSales.find((s) => s.id === saleId);
    if (!saleToDelete) return;

    const currentBatches = storageAdapter.getBatches();
    const restoredBatches = revertSaleFromBatches(saleToDelete, currentBatches);

    storageAdapter.saveBatches(restoredBatches);
    setBatches(restoredBatches);

    const updatedSales = currentSales.filter((s) => s.id !== saleId);
    storageAdapter.saveSales(updatedSales);
    setSales(updatedSales);
  };

  // Invoices CRUD
  const handleSaveInvoice = (newInv: Invoice) => {
    const current = storageAdapter.getInvoices();
    const exists = current.some((i) => i.id === newInv.id);
    const updated = exists
      ? current.map((i) => (i.id === newInv.id ? newInv : i))
      : [newInv, ...current];
    storageAdapter.saveInvoices(updated);
    setInvoices(updated);
  };

  const handleDeleteInvoice = (id: string) => {
    const updated = storageAdapter.getInvoices().filter((i) => i.id !== id);
    storageAdapter.saveInvoices(updated);
    setInvoices(updated);
  };

  const handleUpdateInvoiceStatus = (id: string, status: Invoice['status']) => {
    const updated = storageAdapter.getInvoices().map((inv) =>
      inv.id === id ? { ...inv, status } : inv
    );
    storageAdapter.saveInvoices(updated);
    setInvoices(updated);
    if (viewingInvoice && viewingInvoice.id === id) {
      setViewingInvoice({ ...viewingInvoice, status });
    }
  };

  const handleGenerateInvoiceFromSale = (sale: Sale) => {
    setSaleForInvoice(sale);
    setIsInvoiceModalOpen(true);
  };

  // Business settings
  const handleSaveBusiness = (updated: BusinessProfile) => {
    storageAdapter.saveBusinessProfile(updated);
    setBusiness(updated);
  };

  // Handlers for fast production from catalog
  const handleMakeBatchFromProduct = (product: Product) => {
    setPreselectedProductForBatch(product);
    setIsBatchModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C3E50] flex flex-col font-sans selection:bg-[#D4A373]/30 selection:text-[#1A2E40]">
      {/* Rebranded Header (Dulcinea - 4 tabs) */}
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

      {/* Main Content Area */}
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
            onMakeBatch={handleMakeBatchFromProduct}
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
            onGenerateInvoiceFromSale={handleGenerateInvoiceFromSale}
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

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200/80 py-4 text-center text-xs text-stone-400 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-stone-600">
            {business.businessName || 'Dulcinea'} &bull; Taller de Repostería Artesanal
          </span>
          <span className="font-mono text-[11px] text-stone-400">
            Costo Unitario = Insumos ÷ Rendimiento | Utilidad = Venta - Costo
          </span>
        </div>
      </footer>

      {/* Global Modals */}
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
        onDataReload={reloadDataFromStorage}
        initialTab={settingsInitialTab}
      />
    </div>
  );
}
