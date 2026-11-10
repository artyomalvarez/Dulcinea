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
} from './types/bakery';
import { storageAdapter } from './infrastructure/storage/LocalStorageAdapter';
import {
  LoadAppDataUseCase,
  SaveProductUseCase,
  DeleteProductUseCase,
  SaveIngredientUseCase,
  DeleteIngredientUseCase,
  SaveBatchUseCase,
  DeleteBatchUseCase,
  SaveSaleUseCase,
  DeleteSaleUseCase,
  SaveInvoiceUseCase,
  DeleteInvoiceUseCase,
  UpdateInvoiceStatusUseCase,
  SaveBusinessProfileUseCase,
} from './application/useCases';
import { Header, ActiveTab } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ProductList } from './components/Products/ProductList';
import { ProductFormModal } from './components/Products/ProductFormModal';
import { IngredientManager } from './components/Ingredients/IngredientManager';
import { ProductionList } from './components/Production/ProductionList';
import { SalesList } from './components/Sales/SalesList';
import { InvoiceList } from './components/Invoices/InvoiceList';
import { InvoiceModal } from './components/Invoices/InvoiceModal';
import { InvoiceViewer } from './components/Invoices/InvoiceViewer';
import { ProfitabilityCalculatorModal } from './components/Profitability/ProfitabilityCalculatorModal';
import { SettingsModal } from './components/SettingsModal';

const loadAppDataUseCase = new LoadAppDataUseCase(storageAdapter);
const saveProductUseCase = new SaveProductUseCase(storageAdapter);
const deleteProductUseCase = new DeleteProductUseCase(storageAdapter);
const saveIngredientUseCase = new SaveIngredientUseCase(storageAdapter);
const deleteIngredientUseCase = new DeleteIngredientUseCase(storageAdapter);
const saveBatchUseCase = new SaveBatchUseCase(storageAdapter);
const deleteBatchUseCase = new DeleteBatchUseCase(storageAdapter);
const saveSaleUseCaseInstance = new SaveSaleUseCase(storageAdapter);
const deleteSaleUseCaseInstance = new DeleteSaleUseCase(storageAdapter);
const saveInvoiceUseCase = new SaveInvoiceUseCase(storageAdapter);
const deleteInvoiceUseCase = new DeleteInvoiceUseCase(storageAdapter);
const updateInvoiceStatusUseCase = new UpdateInvoiceStatusUseCase(storageAdapter);
const saveBusinessProfileUseCase = new SaveBusinessProfileUseCase(storageAdapter);

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Application Data initialized via UseCase
  const [initialSnapshot] = useState(() => loadAppDataUseCase.execute());
  const [business, setBusiness] = useState<BusinessProfile>(initialSnapshot.business);
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialSnapshot.ingredients);
  const [products, setProducts] = useState<Product[]>(initialSnapshot.products);
  const [batches, setBatches] = useState<ProductionBatch[]>(initialSnapshot.batches);
  const [sales, setSales] = useState<Sale[]>(initialSnapshot.sales);
  const [invoices, setInvoices] = useState<Invoice[]>(initialSnapshot.invoices);

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

  // Sync from storage via UseCase
  const reloadDataFromStorage = () => {
    const snapshot = loadAppDataUseCase.execute();
    setBusiness(snapshot.business);
    setIngredients(snapshot.ingredients);
    setProducts(snapshot.products);
    setBatches(snapshot.batches);
    setSales(snapshot.sales);
    setInvoices(snapshot.invoices);
  };

  // Products CRUD via UseCases
  const handleSaveProduct = (newProd: Product) => {
    const updated = saveProductUseCase.execute(newProd);
    setProducts(updated);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = deleteProductUseCase.execute(id);
    setProducts(updated);
  };

  // Ingredients CRUD via UseCases
  const handleSaveIngredient = (newIng: Ingredient) => {
    const updated = saveIngredientUseCase.execute(newIng);
    setIngredients(updated);
  };

  const handleDeleteIngredient = (id: string) => {
    const updated = deleteIngredientUseCase.execute(id);
    setIngredients(updated);
  };

  // Batches CRUD via UseCases
  const handleSaveBatch = (newBatch: ProductionBatch) => {
    const updated = saveBatchUseCase.execute(newBatch);
    setBatches(updated);
  };

  const handleDeleteBatch = (id: string) => {
    const updated = deleteBatchUseCase.execute(id);
    setBatches(updated);
  };

  // Sales CRUD via UseCases (Immutable multi-batch stock deduction & restoration)
  const handleSaveSale = (newSale: Sale) => {
    const result = saveSaleUseCaseInstance.execute(newSale);
    setSales(result.sales);
    setBatches(result.batches);
  };

  const handleDeleteSale = (id: string) => {
    const result = deleteSaleUseCaseInstance.execute(id);
    setSales(result.sales);
    setBatches(result.batches);
  };

  // Invoices CRUD via UseCases
  const handleSaveInvoice = (newInv: Invoice) => {
    const result = saveInvoiceUseCase.execute(newInv);
    setInvoices(result.invoices);
    setBusiness(result.business);
    setSales(result.sales);

    // Immediately open viewer for print / PDF
    setViewingInvoice(newInv);
    setIsViewerOpen(true);
  };

  const handleDeleteInvoice = (id: string) => {
    const updated = deleteInvoiceUseCase.execute(id);
    setInvoices(updated);
  };

  const handleUpdateInvoiceStatus = (id: string, status: Invoice['status']) => {
    const updated = updateInvoiceStatusUseCase.execute(id, status);
    setInvoices(updated);
    if (viewingInvoice && viewingInvoice.id === id) {
      setViewingInvoice({ ...viewingInvoice, status });
    }
  };

  // Business profile save via UseCase
  const handleSaveBusiness = (newBiz: BusinessProfile) => {
    const updated = saveBusinessProfileUseCase.execute(newBiz);
    setBusiness(updated);
  };

  // Actions from various components
  const handleMakeBatchFromProduct = (product: Product) => {
    setPreselectedProductForBatch(product);
    setIsBatchModalOpen(true);
  };

  const handleSaleFromProduct = (product: Product, batch?: ProductionBatch) => {
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
