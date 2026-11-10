import React, { useState } from 'react';
import {
  X,
  Settings,
  DatabaseBackup,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  DollarSign,
  Building,
  FileText
} from 'lucide-react';
import { BusinessProfile } from '../types/bakery';
import { storageAdapter } from '../infrastructure/storage/LocalStorageAdapter';
import { BackupUseCases } from '../application/useCases';

const backupUseCases = new BackupUseCases(storageAdapter);

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: BusinessProfile;
  onSaveBusiness: (profile: BusinessProfile) => void;
  onDataReload: () => void;
  initialTab?: 'settings' | 'backup';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  business,
  onSaveBusiness,
  onDataReload,
  initialTab = 'settings',
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'backup'>(initialTab);

  // Form State
  const [businessName, setBusinessName] = useState(business.businessName);
  const [tagline, setTagline] = useState(business.tagline);
  const [taxId, setTaxId] = useState(business.taxId);
  const [ownerName, setOwnerName] = useState(business.ownerName);
  const [phone, setPhone] = useState(business.phone);
  const [whatsapp, setWhatsapp] = useState(business.whatsapp);
  const [email, setEmail] = useState(business.email);
  const [address, setAddress] = useState(business.address);
  const [city, setCity] = useState(business.city);
  const [currencySymbol, setCurrencySymbol] = useState(business.currencySymbol);
  const [currencyCode, setCurrencyCode] = useState(business.currencyCode);
  const [defaultTaxRate, setDefaultTaxRate] = useState(business.defaultTaxRate);
  const [taxName, setTaxName] = useState(business.taxName);
  const [invoicePrefix, setInvoicePrefix] = useState(business.invoicePrefix);
  const [invoiceFooterMessage, setInvoiceFooterMessage] = useState(business.invoiceFooterMessage);

  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  React.useEffect(() => {
    setActiveTab(initialTab);
    setBusinessName(business.businessName);
    setTagline(business.tagline);
    setTaxId(business.taxId);
    setOwnerName(business.ownerName);
    setPhone(business.phone);
    setWhatsapp(business.whatsapp);
    setEmail(business.email);
    setAddress(business.address);
    setCity(business.city);
    setCurrencySymbol(business.currencySymbol);
    setCurrencyCode(business.currencyCode);
    setDefaultTaxRate(business.defaultTaxRate);
    setTaxName(business.taxName);
    setInvoicePrefix(business.invoicePrefix);
    setInvoiceFooterMessage(business.invoiceFooterMessage);
  }, [isOpen, initialTab, business]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BusinessProfile = {
      ...business,
      businessName: businessName.trim(),
      tagline: tagline.trim(),
      taxId: taxId.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      currencySymbol: currencySymbol.trim() || '$',
      currencyCode: currencyCode.trim() || 'MXN',
      defaultTaxRate: Number(defaultTaxRate),
      taxName: taxName.trim() || 'IVA',
      invoicePrefix: invoicePrefix.trim() || 'FACT-2026',
      invoiceFooterMessage: invoiceFooterMessage.trim(),
    };
    onSaveBusiness(updated);
    onClose();
  };

  const handleDownloadBackup = () => {
    const jsonStr = backupUseCases.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dulcecosto_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = () => {
    if (!importText.trim()) return;
    const ok = backupUseCases.importBackup(importText.trim());
    if (ok) {
      setImportStatus('success');
      onDataReload();
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 1200);
    } else {
      setImportStatus('error');
    }
  };

  const handleResetData = () => {
    if (
      window.confirm(
        '¿Deseas restablecer los datos de ejemplo del taller de repostería? Esto recargará las recetas modelo de pastel, galletas y cupcakes.'
      )
    ) {
      backupUseCases.resetToDefaults();
      onDataReload();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 my-auto max-h-[92vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-serif">Configuración y Datos</h3>
              <p className="text-xs text-gray-500">
                Personaliza la información de tu negocio, moneda, impuestos y respalda tu información
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex space-x-2 border-b border-gray-100 pb-2">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Datos del Negocio y Moneda
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <DatabaseBackup className="w-3.5 h-3.5" />
            <span>Copia de Seguridad y Restauración</span>
          </button>
        </div>

        {/* Tab 1: Settings Form */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nombre de la Repostería *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Eslogan o Subtítulo</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Pastelería fina y bocadillos artesanales"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  RFC / NIT / RUT / CUIT (Fiscal) *
                </label>
                <input
                  type="text"
                  required
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="Ej: CAN-891023-R55"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Símbolo de Moneda *</label>
                <input
                  type="text"
                  required
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  placeholder="$, €, S/., Q, L"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500 font-bold text-center"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Código de Moneda</label>
                <input
                  type="text"
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  placeholder="MXN, USD, EUR, COP"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500 font-mono text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/60">
              <div>
                <label className="block font-bold text-amber-950 mb-1">Nombre del Impuesto</label>
                <input
                  type="text"
                  value={taxName}
                  onChange={(e) => setTaxName(e.target.value)}
                  placeholder="IVA, IGV, ITBIS"
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-950 mb-1">Tasa de Impuesto por Defecto (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={defaultTaxRate}
                  onChange={(e) => setDefaultTaxRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-amber-800 mt-0.5 block">Usa 0% si tus postres están exentos</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Titular / Chef Repostero</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Dirección del Taller / Local</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Ciudad / Código Postal</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Mensaje al Pie de Facturas</label>
              <input
                type="text"
                value={invoiceFooterMessage}
                onChange={(e) => setInvoiceFooterMessage(e.target.value)}
                placeholder="¡Gracias por permitirnos endulzar sus mejores momentos!"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md cursor-pointer"
              >
                Guardar Ajustes
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Backup & Restore */}
        {activeTab === 'backup' && (
          <div className="space-y-5 text-xs">
            {/* Export */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <Download className="w-4 h-4 text-amber-700" />
                <span>Exportar Copia de Seguridad Completa</span>
              </h4>
              <p className="text-gray-500 leading-relaxed">
                Descarga un archivo JSON con todas tus recetas, costos de insumos, historial de lotes horneados, ventas y facturas emitidas. Puedes guardarlo en tu computadora o enviarlo por correo.
              </p>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Archivo JSON de Respaldo</span>
              </button>
            </div>

            {/* Import */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-700" />
                <span>Restaurar Copia de Seguridad</span>
              </h4>
              <p className="text-gray-500">
                Pega el contenido del archivo JSON respaldado para restaurar todos tus datos:
              </p>
              <textarea
                rows={4}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='Pega aquí el JSON {"version": "1.0", ...}'
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
              />

              {importStatus === 'success' && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>¡Datos restaurados con éxito!</span>
                </div>
              )}

              {importStatus === 'error' && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                  El texto ingresado no es un archivo de respaldo JSON válido. Verifica el contenido.
                </div>
              )}

              <button
                type="button"
                onClick={handleImportBackup}
                disabled={!importText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importar y Aplicar Respaldo</span>
              </button>
            </div>

            {/* Reset to defaults */}
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
              <div>
                <strong className="text-gray-800 block">Restablecer Ejemplos de Fábrica</strong>
                <span className="text-gray-400">
                  Recarga las recetas modelo (pastel, galletas y cupcakes)
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetData}
                className="px-3.5 py-1.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
              >
                Restablecer Ejemplos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
