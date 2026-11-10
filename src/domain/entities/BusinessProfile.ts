export interface BusinessProfile {
  businessName: string;
  tagline: string;
  taxId: string; // RFC / RUT / NIT
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  currencySymbol: string; // '$', 'S/.', '€', 'Q', etc.
  currencyCode: string; // 'MXN', 'USD', 'EUR', 'COP', 'PEN', etc.
  defaultTaxRate: number; // 0, 16, 19, 21, etc.
  taxName: string; // 'IVA', 'IGV', 'Impuesto', etc.
  invoicePrefix: string; // 'FACT'
  nextInvoiceNumber: number; // 1
  invoiceFooterMessage: string;
}
