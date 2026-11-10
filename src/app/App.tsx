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
  Sale
} from '../entities';
import { storageAdapter } from '../shared/api/localStorage';
import { applySaleToBatches, revertSaleFromBatches } from '../shared/lib';
import { Header, ActiveTab } from '../widgets/Header';
import { SettingsModal } from '../widgets/SettingsModal';
import { Dashboard } from '../widgets/Dashboard/Dashboard';
import { ProductList } from '../features/products/components/ProductList';
import { ProductFormModal } from '../features/products/components/ProductFormModal';
import { IngredientManager } from '../features/ingredients/components/IngredientManager';
import { ProductionList } from '../features/production/components/ProductionList';
import { SalesList } from '../features/sales/components/SalesList';
import { InvoiceList } from '../features/invoices/components/InvoiceList';
import { InvoiceModal } from '../features/invoices/components/InvoiceModal';
import { InvoiceViewer } from '../features/invoices/components/InvoiceViewer';
import { ProfitabilityCalculatorModal } from '../features/profitability/components/ProfitabilityCalculatorModal';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

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
    const updated = [newBatch, ...storageAdapter.getBatches()];
    storageAdapter.saveBatches(updated);
    setBatches(updated);
  };

  const handleDeleteBatch = (id: string) => {
    const updated = storageAdapter.getBatches().filter((b) => b.id !== id);
    storageAdapter.saveBatches(updated);
    setBatches(updated);
  };

  // Sales CRUD (Immutable multi-batch stock deduction & restoration via SalesService)
  const handleSaveSale = (newSale: Sale) => {
    const updatedSales = [newSale, ...storageAdapter.getSales()];
    storageAdapter.saveSales(updatedSales);

    const updatedBatches = applySaleToBatches(newSale, storageAdapter.getBatches());
    storageAdapter.saveBatches(updatedBatches);

    setSales(updatedSales);
    setBatches(updatedBatches);
  };

  const handleDeleteSale = (id: string) => {
    const currentSales = storageAdapter.getSales();
    const saleToDelete = currentSales.find((s) => s.id === id);
    if (!saleToDelete) return;

    const updatedSales = currentSales.filter((s) => s.id !== id);
    storageAdapter.saveSales(updatedSales);

    const updatedBatches = revertSaleFromBatches(saleToDelete, storageAdapter.getBatches());
    storageAdapter.saveBatches(updatedBatches);

    setSales(updatedSales);
    setBatches(updatedBatches);
  };

  // Invoices CRUD
  const handleSaveInvoice = (newInv: Invoice) => {
    const updatedInvoices = [newInv, ...storageAdapter.getInvoices()];
    storageAdapter.saveInvoices(updatedInvoices);

    const currentBusiness = storageAdapter.getBusinessProfile();
    const updatedBusiness: BusinessProfile = {
      ...currentBusiness,
      nextInvoiceNumber: (currentBusiness.nextInvoiceNumber || 100) + 1,
    };
    storageAdapter.saveBusinessProfile(updatedBusiness);

    let updatedSales = storageAdapter.getSales();
    if (newInv.saleId) {
      updatedSales = updatedSales.map((s) =>
        s.id === newInv.saleId ? { ...s, invoiceId: newInv.id } : s
      );
      storageAdapter.saveSales(updatedSales);
    }

    setInvoices(updatedInvoices);
    setBusiness(updatedBusiness);
    setSales(updatedSales);

    // Immediately open viewer for print / PDF
    setViewingInvoice(newInv);
    setIsViewerOpen(true);
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

  // Business profile save
  const handleSaveBusiness = (newBiz: BusinessProfile) => {
    storageAdapter.saveBusinessProfile(newBiz);
    setBusiness(newBiz);
  };

  // Actions from various components
  const handleMakeBatchFromProduct = (product: Product) => {
    setPreselectedProductForBatch(product);
    setIsBatchModalOpen(true);
  };

  const handleSaleFromProduct = (product: Product) => {
    setPreselectedProductForSale(product);
    setIsSaleModalOpen(true);
  };

  const handleGenerateInvoiceFromSale = (sale: Sale) => {
    setSaleForInvoice(sale);
    setIsInvoiceModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f6] text-gray-800 antialiased selection:bg-amber-200 selection:text-amber-900">
      {/* Top Header */}
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 no-print">
        {activeTab === 'dashboard' && (
          <Dashboard
            products={products}
            batches={batches}
            sales={sales}
            ingredients={ingredients}
            business={business}
            onNavigateTab={setActiveTab}
            onNewBatch={() => {
              setPreselectedProductForBatch(null);
              setIsBatchModalOpen(true);
            }}
            onNewSale={() => {
              setPreselectedProductForSale(null);
              setIsSaleModalOpen(true);
            }}
            onOpenCalculator={() => setIsCalculatorModalOpen(true)}
          />
        )}

        {activeTab === 'products' && (
          <ProductList
            products={products}
            onOpenCreateModal={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
            onMakeBatch={handleMakeBatchFromProduct}
            business={business}
          />
        )}

        {activeTab === 'ingredients' && (
          <IngredientManager
            ingredients={ingredients}
            onSaveIngredient={handleSaveIngredient}
            onDeleteIngredient={handleDeleteIngredient}
            business={business}
          />
        )}

        {activeTab === 'production' && (
          <ProductionList
            batches={batches}
            products={products}
            business={business}
            onSaveBatch={handleSaveBatch}
            onDeleteBatch={handleDeleteBatch}
            onOpenSaleModalForProduct={handleSaleFromProduct}
            preselectedProduct={preselectedProductForBatch}
            isOpenModal={isBatchModalOpen}
            onCloseModal={() => {
              setIsBatchModalOpen(false);
              setPreselectedProductForBatch(null);
            }}
            onOpenNewModal={() => {
              setPreselectedProductForBatch(null);
              setIsBatchModalOpen(true);
            }}
          />
        )}

        {activeTab === 'sales' && (
          <SalesList
            sales={sales}
            products={products}
            batches={batches}
            business={business}
            onSaveSale={handleSaveSale}
            onDeleteSale={handleDeleteSale}
            onGenerateInvoiceFromSale={handleGenerateInvoiceFromSale}
            isOpenModal={isSaleModalOpen}
            onCloseModal={() => {
              setIsSaleModalOpen(false);
              setPreselectedProductForSale(null);
            }}
            onOpenNewModal={() => {
              setPreselectedProductForSale(null);
              setIsSaleModalOpen(true);
            }}
            preselectedProduct={preselectedProductForSale}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoiceList
            invoices={invoices}
            business={business}
            onOpenCreateModal={() => {
              setSaleForInvoice(null);
              setIsInvoiceModalOpen(true);
            }}
            onViewInvoice={(inv) => {
              setViewingInvoice(inv);
              setIsViewerOpen(true);
            }}
            onDeleteInvoice={handleDeleteInvoice}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
          />
        )}

        {activeTab === 'calculator' && (
          <ProfitabilityCalculatorModal
            business={business}
            isOpen={true}
            isStandaloneTab={true}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-4 text-center text-xs text-gray-400 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {business.businessName} &bull; Taller de Repostería y Control de Costos
          </span>
          <span className="font-mono text-[11px]">
            Cálculo exacto: Costo Unitario = Insumos ÷ Rendimiento | Utilidad = Venta - Costo
          </span>
        </div>
      </footer>

      {/* Modals */}
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
