export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export type InvoiceStatus = 'Emitida' | 'Pagada' | 'Anulada';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. FACT-2026-001
  issueDate: string;
  dueDate: string;
  businessName: string;
  businessTaxId: string; // RFC / NIT / RUT / CUIT
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  customerName: string;
  customerTaxId?: string;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRatePercent: number;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  status: InvoiceStatus;
  notes?: string;
  saleId?: string;
}
