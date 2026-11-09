/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BusinessProfile,
  Ingredient,
  Invoice,
  Product,
  ProductionBatch,
  Sale
} from './types/bakery';
import { storage } from './utils/storage';
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

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Application Data
  const [business, setBusiness] = useState<BusinessProfile>(() => storage.getBusinessProfile());
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => storage.getIngredients());
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [batches, setBatches] = useState<ProductionBatch[]>(() => storage.getBatches());
  const [sales, setSales] = useState<Sale[]>(() => storage.getSales());
  const [invoices, setInvoices] = useState<Invoice[]>(() => storage.getInvoices());

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

  // Sync to localStorage
  const reloadDataFromStorage = () => {
    setBusiness(storage.getBusinessProfile());
    setIngredients(storage.getIngredients());
    setProducts(storage.getProducts());
    setBatches(storage.getBatches());
    setSales(storage.getSales());
    setInvoices(storage.getInvoices());
  };

  // Products CRUD
  const handleSaveProduct = (newProd: Product) => {
    const existingIndex = products.findIndex((p) => p.id === newProd.id);
    let updated: Product[];
    if (existingIndex >= 0) {
      updated = products.map((p) => (p.id === newProd.id ? newProd : p));
    } else {
      updated = [newProd, ...products];
    }
    setProducts(updated);
    storage.saveProducts(updated);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    storage.saveProducts(updated);
  };

  // Ingredients CRUD
  const handleSaveIngredient = (newIng: Ingredient) => {
    const existingIndex = ingredients.findIndex((i) => i.id === newIng.id);
    let updated: Ingredient[];
    if (existingIndex >= 0) {
      updated = ingredients.map((i) => (i.id === newIng.id ? newIng : i));
    } else {
      updated = [newIng, ...ingredients];
    }
    setIngredients(updated);
    storage.saveIngredients(updated);
  };

  const handleDeleteIngredient = (id: string) => {
    const updated = ingredients.filter((i) => i.id !== id);
    setIngredients(updated);
    storage.saveIngredients(updated);
  };

  // Batches CRUD
  const handleSaveBatch = (newBatch: ProductionBatch) => {
    const updated = [newBatch, ...batches];
    setBatches(updated);
    storage.saveBatches(updated);
  };

  const handleDeleteBatch = (id: string) => {
    const updated = batches.filter((b) => b.id !== id);
    setBatches(updated);
    storage.saveBatches(updated);
  };

  // Sales CRUD
  const handleSaveSale = (newSale: Sale) => {
    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    storage.saveSales(updatedSales);

    // Update batch units sold if matches products
    newSale.items.forEach((item) => {
      const activeBatch = batches.find(
        (b) => b.productId === item.productId && b.unitsSold < b.totalUnitsProduced
      );
      if (activeBatch) {
        activeBatch.unitsSold = Math.min(
          activeBatch.totalUnitsProduced,
          activeBatch.unitsSold + item.quantity
        );
        if (activeBatch.unitsSold >= activeBatch.totalUnitsProduced) {
          activeBatch.status = 'agotado';
        }
      }
    });
    setBatches([...batches]);
    storage.saveBatches(batches);
  };

  const handleDeleteSale = (id: string) => {
    const updated = sales.filter((s) => s.id !== id);
    setSales(updated);
    storage.saveSales(updated);
  };

  // Invoices CRUD
  const handleSaveInvoice = (newInv: Invoice) => {
    const updated = [newInv, ...invoices];
    setInvoices(updated);
    storage.saveInvoices(updated);

    // Increment business next invoice number
    const updatedBiz: BusinessProfile = {
      ...business,
      nextInvoiceNumber: (business.nextInvoiceNumber || 100) + 1,
    };
    setBusiness(updatedBiz);
    storage.saveBusinessProfile(updatedBiz);

    // If linked to a sale, update sale invoiceId
    if (newInv.saleId) {
      const updatedSales = sales.map((s) =>
        s.id === newInv.saleId ? { ...s, invoiceId: newInv.id } : s
      );
      setSales(updatedSales);
      storage.saveSales(updatedSales);
    }

    // Immediately open viewer for print / PDF
    setViewingInvoice(newInv);
    setIsViewerOpen(true);
  };

  const handleDeleteInvoice = (id: string) => {
    const updated = invoices.filter((i) => i.id !== id);
    setInvoices(updated);
    storage.saveInvoices(updated);
  };

  const handleUpdateInvoiceStatus = (id: string, status: Invoice['status']) => {
    const updated = invoices.map((inv) => (inv.id === id ? { ...inv, status } : inv));
    setInvoices(updated);
    storage.saveInvoices(updated);
    if (viewingInvoice && viewingInvoice.id === id) {
      setViewingInvoice({ ...viewingInvoice, status });
    }
  };

  // Business profile save
  const handleSaveBusiness = (newBiz: BusinessProfile) => {
    setBusiness(newBiz);
    storage.saveBusinessProfile(newBiz);
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
