import { BusinessProfile } from '../../domain/entities/BusinessProfile';
import { Invoice } from '../../domain/entities/Invoice';
import { Sale } from '../../domain/entities/Sale';
import { StoragePort } from '../../domain/ports/StoragePort';

export interface SaveInvoiceResult {
  invoices: Invoice[];
  business: BusinessProfile;
  sales: Sale[];
}

export class SaveInvoiceUseCase {
  constructor(private readonly storage: StoragePort) {}

  execute(newInv: Invoice): SaveInvoiceResult {
    const currentInvoices = this.storage.getInvoices();
    const currentBusiness = this.storage.getBusinessProfile();
    const currentSales = this.storage.getSales();

    const updatedInvoices = [newInv, ...currentInvoices];
    this.storage.saveInvoices(updatedInvoices);

    const updatedBusiness: BusinessProfile = {
      ...currentBusiness,
      nextInvoiceNumber: (currentBusiness.nextInvoiceNumber || 100) + 1,
    };
    this.storage.saveBusinessProfile(updatedBusiness);

    let updatedSales = currentSales;
    if (newInv.saleId) {
      updatedSales = currentSales.map((s) =>
        s.id === newInv.saleId ? { ...s, invoiceId: newInv.id } : s
      );
      this.storage.saveSales(updatedSales);
    }

    return {
      invoices: updatedInvoices,
      business: updatedBusiness,
      sales: updatedSales,
    };
  }
}

export class DeleteInvoiceUseCase {
  constructor(private readonly storage: StoragePort) {}

  execute(invoiceId: string): Invoice[] {
    const currentInvoices = this.storage.getInvoices();
    const updatedInvoices = currentInvoices.filter((i) => i.id !== invoiceId);
    this.storage.saveInvoices(updatedInvoices);
    return updatedInvoices;
  }
}

export class UpdateInvoiceStatusUseCase {
  constructor(private readonly storage: StoragePort) {}

  execute(invoiceId: string, status: Invoice['status']): Invoice[] {
    const currentInvoices = this.storage.getInvoices();
    const updatedInvoices = currentInvoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, status } : inv
    );
    this.storage.saveInvoices(updatedInvoices);
    return updatedInvoices;
  }
}
