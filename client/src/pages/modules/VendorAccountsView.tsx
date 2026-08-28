import React, { useState } from "react";
import {
  Handshake, Plus, Search, Phone, Mail, FileText,
  CreditCard, Landmark, CheckCircle2, Download, X
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Vendor } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { exportToCSV } from "@/utils/exportUtils";
import { toast } from "sonner";

export default function VendorAccountsView() {
  const {
    activeSite, activeSiteVendors, activeSiteAccounts,
    addVendor, recordVendorPayment, activeSiteExpenses
  } = useApp();
  const { hasPermission } = useAuth();

  const [search, setSearch] = useState("");
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedVendorForPay, setSelectedVendorForPay] = useState<Vendor | null>(null);

  // Form states
  const [newVenData, setNewVenData] = useState({
    companyName: "",
    serviceType: "Asansör Bakım",
    contactPerson: "",
    phone: "",
    email: "",
    taxNumber: "",
    taxOffice: "",
    iban: "",
    bankName: "Garanti BBVA",
    contractEndDate: "2027-01-01",
    notes: "",
  });

  const [payData, setPayData] = useState({
    amount: 5000,
    accountId: activeSiteAccounts[0]?.id || "",
    description: "Aylık periyodik bakım hak ediş ödemesi",
  });

  const filteredVendors = activeSiteVendors.filter((v) => {
    const q = search.toLocaleLowerCase("tr-TR").trim();
    if (q) {
      const matchText = `${v.companyName} ${v.serviceType} ${v.contactPerson} ${v.phone}`.toLocaleLowerCase("tr-TR");
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenData.companyName || !newVenData.phone) {
      toast.error("Lütfen firma adı ve telefon giriniz.");
      return;
    }

    addVendor({
      siteId: activeSite.id,
      companyName: newVenData.companyName,
      serviceType: newVenData.serviceType,
      contactPerson: newVenData.contactPerson,
      phone: newVenData.phone,
      email: newVenData.email,
      taxNumber: newVenData.taxNumber,
      taxOffice: newVenData.taxOffice,
      iban: newVenData.iban,
      bankName: newVenData.bankName,
      contractEndDate: newVenData.contractEndDate,
      notes: newVenData.notes,
    });

    setIsAddVendorModalOpen(false);
    toast.success("Tedarikçi cari kartı başarıyla açıldı.");
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForPay || payData.amount <= 0 || !payData.accountId) {
      toast.error("Lütfen geçerli ödeme tutarı ve hesap seçiniz.");
      return;
    }

    recordVendorPayment(
      selectedVendorForPay.id,
      Number(payData.amount),
      payData.accountId,
      payData.description
    );

    setIsPayModalOpen(false);
    toast.success(`${selectedVendorForPay.companyName} firmasına ödeme kaydedildi.`);
  };

  const handleExportCSV = () => {
    const headers = [
      "Firma Adı", "Hizmet Alanı", "Yetkili Kişi", "Telefon",
      "E-Posta", "Vergi No", "IBAN", "Sözleşme Bitiş", "Cari Bakiye (TL)"
    ];
    const rows = filteredVendors.map((v) => [
      v.companyName,
      v.serviceType,
      v.contactPerson,
      v.phone,
      v.email,
      v.taxNumber,
      v.iban,
      v.contractEndDate || "-",
      v.currentBalance
    ]);
    exportToCSV(`${activeSite.name}_Tedarikci_Cari_Listesi`, headers, rows);
    toast.success("Tedarikçi listesi Excel (CSV) olarak indirildi.");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">Tedarikçi Cari Hesapları</h2>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              Asansör, güvenlik, temizlik, peyzaj ve bakım firmalarının sözleşmeleri, faturaları ve cari bakiyeleri.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#e4eae3] text-[#294342] text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
            >
              <Download size={14} /> Excel'e Aktar
            </button>
            {hasPermission("canManageExpenses") && (
              <button
                onClick={() => setIsAddVendorModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#172b2b] text-white text-xs font-bold hover:bg-[#294342] transition shadow-sm"
              >
                <Plus size={15} /> Yeni Tedarikçi Tanımla
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#f0f4f1]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa7a2]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tedarikçi firma veya yetkili ara..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>

          <div className="flex items-center justify-end text-xs text-[#7c8a87]">
            <span>Toplam <strong>{filteredVendors.length}</strong> tedarikçi firma</span>
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map((vendor) => {
          const vendorExpenses = activeSiteExpenses.filter(e => e.vendorId === vendor.id);

          return (
            <div
              key={vendor.id}
              className="bg-white border border-[#e4eae3] rounded-2xl p-5 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {vendor.serviceType}
                    </span>
                    <strong className="text-sm font-bold text-[#172b2b] block mt-1.5">{vendor.companyName}</strong>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f0f4f1] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#87928e]">Yetkili:</span>
                    <strong className="text-[#172b2b] font-medium">{vendor.contactPerson}</strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#87928e]">Telefon:</span>
                    <span className="font-semibold text-slate-800">{vendor.phone}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#87928e]">Sözleşme Bitiş:</span>
                    <span className="font-mono text-slate-700">{formatDate(vendor.contractEndDate)}</span>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-lg text-[11px] font-mono text-slate-600 break-all select-all mt-2">
                    {vendor.iban}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#f0f4f1] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">CARİ BAKİYE</span>
                  <strong className="text-base font-extrabold text-[#172b2b]">{formatCurrency(vendor.currentBalance)}</strong>
                </div>

                {hasPermission("canManageExpenses") && (
                  <button
                    onClick={() => {
                      setSelectedVendorForPay(vendor);
                      setIsPayModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
                  >
                    <CreditCard size={13} /> Ödeme Yap
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW VENDOR MODAL */}
      {isAddVendorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <h3 className="text-base font-bold text-[#172b2b]">Yeni Tedarikçi Tanımla</h3>
              <button onClick={() => setIsAddVendorModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Firma / Tedarikçi Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Kone Asansör San. Ltd."
                  value={newVenData.companyName}
                  onChange={(e) => setNewVenData({ ...newVenData, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Hizmet / Uzmanlık Alanı</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Asansör, Güvenlik, Temizlik..."
                    value={newVenData.serviceType}
                    onChange={(e) => setNewVenData({ ...newVenData, serviceType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Yetkili Kişi</label>
                  <input
                    type="text"
                    placeholder="Ad Soyad"
                    value={newVenData.contactPerson}
                    onChange={(e) => setNewVenData({ ...newVenData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Telefon Numarası *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0216 / 05XX"
                    value={newVenData.phone}
                    onChange={(e) => setNewVenData({ ...newVenData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">E-Posta</label>
                  <input
                    type="email"
                    placeholder="info@firma.com"
                    value={newVenData.email}
                    onChange={(e) => setNewVenData({ ...newVenData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">IBAN Numarası</label>
                <input
                  type="text"
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  value={newVenData.iban}
                  onChange={(e) => setNewVenData({ ...newVenData, iban: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-[#e4eae3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddVendorModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#172b2b] text-white font-bold hover:bg-[#294342] transition shadow-sm"
                >
                  Tedarikçiyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VENDOR PAYMENT MODAL */}
      {isPayModalOpen && selectedVendorForPay && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div>
                <h3 className="text-base font-bold text-[#172b2b]">Tedarikçiye Ödeme Yap</h3>
                <p className="text-xs text-[#7c8a87]">{selectedVendorForPay.companyName}</p>
              </div>
              <button onClick={() => setIsPayModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExecutePayment} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Ödenecek Tutar (TL) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={payData.amount}
                  onChange={(e) => setPayData({ ...payData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#e4eae3] font-bold text-base text-[#172b2b] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Ödemenin Çıkacağı Hesap *</label>
                <select
                  required
                  value={payData.accountId}
                  onChange={(e) => setPayData({ ...payData, accountId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                >
                  {activeSiteAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Açıklama</label>
                <input
                  type="text"
                  required
                  value={payData.description}
                  onChange={(e) => setPayData({ ...payData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-[#e4eae3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition shadow-sm"
                >
                  Ödemeyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
