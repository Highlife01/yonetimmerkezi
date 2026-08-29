import React, { useState } from "react";
import {
  ArrowUpRight, ArrowDownRight, Plus, Search, Filter,
  Download, FileText, CheckCircle2, Clock, CalendarDays,
  CreditCard, Wallet, Tag, X
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { ExpenseRecord, ExpenseCategory } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { exportToCSV } from "@/utils/exportUtils";
import { toast } from "sonner";

interface IncomeExpenseViewProps {
  initialOpenModal?: boolean;
}

export default function IncomeExpenseView({ initialOpenModal = false }: IncomeExpenseViewProps) {
  const {
    activeSite, activeSiteExpenses, activeSiteAccounts,
    activeSiteVendors, activeSiteCollections, addExpense
  } = useApp();
  const { hasPermission } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialOpenModal);
  const [selectedReceiptExpense, setSelectedReceiptExpense] = useState<ExpenseRecord | null>(null);

  // New Expense Form
  const [newExpData, setNewExpData] = useState({
    category: "ELEKTRIK" as ExpenseCategory,
    title: "",
    description: "",
    amount: 1000,
    date: new Date().toISOString().split("T")[0],
    invoiceNumber: "",
    
    vendorId: "",
    paymentStatus: "ODENDI" as "ODENDI" | "BEKLIYOR",
    paidFromAccountId: activeSiteAccounts[0]?.id || "",
    attachmentName: "",
  });

  const filteredExpenses = activeSiteExpenses.filter((e) => {
    if (selectedCategory !== "ALL" && e.category !== selectedCategory) return false;
    const q = search.toLocaleLowerCase("tr-TR").trim();
    if (q) {
      const matchText = `${e.title} ${e.category} ${e.invoiceNumber || ""} ${e.vendorName || ""} ${e.description}`.toLocaleLowerCase("tr-TR");
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = activeSiteCollections.reduce((sum, c) => sum + c.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpData.title || newExpData.amount <= 0) {
      toast.error("Lütfen gider başlığı ve tutarı giriniz.");
      return;
    }

    const vendor = activeSiteVendors.find((v) => v.id === newExpData.vendorId);
    const account = activeSiteAccounts.find((a) => a.id === newExpData.paidFromAccountId);

    addExpense({
      siteId: activeSite.id,
      category: newExpData.category,
      title: newExpData.title,
      description: newExpData.description,
      amount: Number(newExpData.amount),
      date: newExpData.date,
      invoiceNumber: newExpData.invoiceNumber,
      vendorId: newExpData.vendorId || undefined,
      vendorName: vendor?.companyName,
      paymentStatus: newExpData.paymentStatus,
      paidFromAccountId: newExpData.paymentStatus === "ODENDI" ? newExpData.paidFromAccountId : undefined,
      paidFromAccountName: newExpData.paymentStatus === "ODENDI" ? account?.name : undefined,
    });

    setIsAddModalOpen(false);
    toast.success("Gider kaydı başarıyla oluşturuldu ve hesaplara işlendi.");
  };

  const handleExportCSV = () => {
    const headers = [
      "Tarih", "Kategori", "Gider Başlığı", "Fatura No",
      "Tedarikçi", "Tutar (TL)", "Ödeme Durumu", "Ödenen Hesap", "Açıklama"
    ];
    const rows = filteredExpenses.map((e) => [
      e.date,
      e.category,
      e.title,
      e.invoiceNumber || "-",
      e.vendorName || "-",
      e.amount,
      e.paymentStatus === "ODENDI" ? "Ödendi" : "Bekliyor",
      e.paidFromAccountName || "-",
      e.description
    ]);
    exportToCSV(`${activeSite.name}_Giderler_Listesi`, headers, rows);
    toast.success("Giderler listesi Excel (CSV) olarak indirildi.");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">Gelir ve Gider Yönetimi</h2>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              Site işletme giderleri, faturalar, personel maaşları, bakım maliyetleri ve gelir-gider dengesi.
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
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#172b2b] text-white text-xs font-bold hover:bg-[#294342] transition shadow-sm"
              >
                <Plus size={16} /> Yeni Gider / Fatura Ekle
              </button>
            )}
          </div>
        </div>

        {/* Summary Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 border-t border-[#f0f4f1]">
          <div className="bg-[#f8faf7] p-4 rounded-xl border border-[#e4eae3] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7c8a87]">TOPLAM GELİR (TAHSİLAT)</span>
              <h4 className="text-xl font-bold text-emerald-700 mt-1">{formatCurrency(totalIncome)}</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ArrowDownRight size={20} />
            </div>
          </div>

          <div className="bg-[#f8faf7] p-4 rounded-xl border border-[#e4eae3] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7c8a87]">TOPLAM GİDER (HARCAMA)</span>
              <h4 className="text-xl font-bold text-rose-600 mt-1">{formatCurrency(totalExpense)}</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <ArrowUpRight size={20} />
            </div>
          </div>

          <div className="bg-[#edf3eb] p-4 rounded-xl border border-[#dce7da] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7a8a84]">GELİR / GİDER FARKI (NET)</span>
              <h4 className={`text-xl font-bold mt-1 ${netBalance >= 0 ? "text-emerald-800" : "text-rose-700"}`}>
                {formatCurrency(netBalance)}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#d9f3d7] text-[#559e65] flex items-center justify-center font-bold">
              {netBalance >= 0 ? "+" : "-"}
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa7a2]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Gider ara: başlık, fatura no, tedarikçi..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="ALL">Tüm Gider Kategorileri</option>
              <option value="PERSONEL">Personel (Maaş & SGK)</option>
              <option value="ELEKTRIK">Elektrik (Ortak Alan)</option>
              <option value="SU">Su Faturası</option>
              <option value="DOGALGAZ">Doğalgaz / Isınma</option>
              <option value="ASANSOR">Asansör Bakım & Servis</option>
              <option value="TEMIZLIK">Temizlik Malzemesi & Hizmeti</option>
              <option value="HAVUZ">Havuz Bakımı & Kimyasalı</option>
              <option value="PEYZAJ">Peyzaj & Bahçe</option>
              <option value="BAKIM_ONARIM">Tesisat & Genel Onarım</option>
              <option value="SIGORTA">Bina Sigortası</option>
              <option value="YONETIM">Yönetim & Hizmet</option>
            </select>
          </div>

          <div className="flex items-center justify-end text-xs text-[#7c8a87]">
            <span>Listelenen Gider: <strong>{filteredExpenses.length}</strong> kalem</span>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Gider / Fatura Başlığı</th>
                <th className="py-3 px-4">Tedarikçi Firma</th>
                <th className="py-3 px-4">Fatura No</th>
                <th className="py-3 px-4">Ödenen Hesap</th>
                <th className="py-3 px-4 text-right">Tutar</th>
                <th className="py-3 px-4 text-center">Durum</th>
                <th className="py-3 px-4 text-center">Makbuz / Fiş</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4f1]">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {formatDate(exp.date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#172b2b]">
                      {exp.title}
                      {exp.description && <span className="block text-[11px] font-normal text-[#87928e] mt-0.5">{exp.description}</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {exp.vendorName || "-"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {exp.invoiceNumber || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {exp.paidFromAccountName || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-600 text-sm">
                      − {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        exp.paymentStatus === "ODENDI" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                      }`}>
                        {exp.paymentStatus === "ODENDI" ? "Ödendi" : "Bekliyor"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedReceiptExpense(exp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#172b2b] text-slate-700 hover:text-white text-[10px] font-bold transition shadow-xs cursor-pointer"
                      >
                        <FileText size={12} /> Makbuz Gör
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Aramanızla eşleşen gider kaydı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW EXPENSE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172b2b]">Yeni Gider / Fatura Kaydet</h3>
                  <p className="text-xs text-[#7c8a87]">Site harcamalarını ve faturaları kayda alın.</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Gider Kategorisi *</label>
                  <select
                    value={newExpData.category}
                    onChange={(e) => setNewExpData({ ...newExpData, category: e.target.value as ExpenseCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="ELEKTRIK">Elektrik</option>
                    <option value="SU">Su</option>
                    <option value="DOGALGAZ">Doğalgaz</option>
                    <option value="PERSONEL">Personel Maaş & SGK</option>
                    <option value="ASANSOR">Asansör Bakım</option>
                    <option value="TEMIZLIK">Temizlik</option>
                    <option value="HAVUZ">Havuz</option>
                    <option value="PEYZAJ">Peyzaj & Bahçe</option>
                    <option value="BAKIM_ONARIM">Bakım-Onarım</option>
                    <option value="SIGORTA">Sigorta</option>
                    <option value="YONETIM">Yönetim Hizmeti</option>
                    <option value="DIGER">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Fatura / İşlem Tarihi *</label>
                  <input
                    type="date"
                    required
                    value={newExpData.date}
                    onChange={(e) => setNewExpData({ ...newExpData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Gider Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: BEDAŞ Ortak Alan Elektrik Faturası"
                  value={newExpData.title}
                  onChange={(e) => setNewExpData({ ...newExpData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Tutar (TL) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₺</span>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newExpData.amount}
                      onChange={(e) => setNewExpData({ ...newExpData, amount: Number(e.target.value) })}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#e4eae3] font-bold text-base text-rose-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Fatura No</label>
                  <input
                    type="text"
                    placeholder="FAT-2026-..."
                    value={newExpData.invoiceNumber}
                    onChange={(e) => setNewExpData({ ...newExpData, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Tedarikçi Firma</label>
                  <select
                    value={newExpData.vendorId}
                    onChange={(e) => setNewExpData({ ...newExpData, vendorId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="">-- Tedarikçi Seç (Opsiyonel) --</option>
                    {activeSiteVendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.companyName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Ödemenin Yapıldığı Hesap *</label>
                  <select
                    required
                    value={newExpData.paidFromAccountId}
                    onChange={(e) => setNewExpData({ ...newExpData, paidFromAccountId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    {activeSiteAccounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance)})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Açıklama & Detaylar</label>
                <textarea
                  rows={2}
                  placeholder="Gidere ilişkin açıklama..."
                  value={newExpData.description}
                  onChange={(e) => setNewExpData({ ...newExpData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#e4eae3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#172b2b] text-white font-bold hover:bg-[#294342] transition shadow-sm"
                >
                  Gideri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HARCAMA / TEDİYE MAKBUZU ÖNİZLEME & YAZDIRMA MODALI */}
      {selectedReceiptExpense && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#e4eae3] space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172b2b]">Resmi Gider / Tediye Makbuzu</h3>
                  <p className="text-xs text-[#7c8a87]">Kat Mülkiyeti Kanunu ve Muhasebe Kayıt Belgesi</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceiptExpense(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Printable Receipt Box */}
            <div className="p-6 bg-[#fcfdfc] border-2 border-dashed border-[#d2dbd7] rounded-2xl space-y-5 font-sans">
              {/* Top site & receipt title */}
              <div className="flex items-start justify-between border-b border-[#e4eae3] pb-4">
                <div>
                  <h4 className="text-base font-black text-[#172b2b] uppercase tracking-tight">
                    {activeSite.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">{activeSite.address}</p>
                  <p className="text-[11px] text-slate-500 font-semibold">{activeSite.district} / {activeSite.city}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    TEDİYE MAKBUZU
                  </span>
                  <strong className="block text-xs font-mono font-bold text-slate-700 mt-1">
                    BELGE: {selectedReceiptExpense.invoiceNumber || `MKB-GDR-${selectedReceiptExpense.id.slice(-6).toUpperCase()}`}
                  </strong>
                  <span className="text-[10px] text-slate-400 block font-mono">{formatDate(selectedReceiptExpense.date)}</span>
                </div>
              </div>

              {/* Receipt details table */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Harcama Kalemi / Kategori:</span>
                  <strong className="text-[#172b2b]">{selectedReceiptExpense.category}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Gider / Fatura Açıklaması:</span>
                  <strong className="text-[#172b2b] text-right max-w-xs">{selectedReceiptExpense.title}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Ödeme Yapılan Firma / Kişi:</span>
                  <strong className="text-[#172b2b]">{selectedReceiptExpense.vendorName || "Muhtelif Harcama"}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Ödemenin Çıkış Hesabı:</span>
                  <strong className="text-[#172b2b]">{selectedReceiptExpense.paidFromAccountName || "Site Ana Kasası"}</strong>
                </div>
                {selectedReceiptExpense.description && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Ek Açıklama:</span>
                    <span className="text-slate-700 text-right max-w-xs">{selectedReceiptExpense.description}</span>
                  </div>
                )}
              </div>

              {/* Total Amount Box */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 uppercase">ÖDENEN NET TUTAR:</span>
                <strong className="text-xl font-black text-emerald-900">
                  {formatCurrency(selectedReceiptExpense.amount)}
                </strong>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-6 pt-4 text-center text-xs">
                <div className="space-y-8">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">ÖDEMEYİ YAPAN (YÖNETİCİ)</span>
                  <div className="border-t border-slate-300 pt-1">
                    <strong className="text-slate-800 text-[11px] block">{activeSite.managerName}</strong>
                    <span className="text-[10px] text-slate-400">İmza / Kaşe</span>
                  </div>
                </div>

                <div className="space-y-8">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">TESLİM ALAN (FİRMA / ALICI)</span>
                  <div className="border-t border-slate-300 pt-1">
                    <strong className="text-slate-800 text-[11px] block">{selectedReceiptExpense.vendorName || "Yetkili Kişi"}</strong>
                    <span className="text-[10px] text-slate-400">İmza / Kaşe</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Sistem Kayıt ID: {selectedReceiptExpense.id}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReceiptExpense(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    toast.success("Makbuz yazdırma penceresi açıldı.");
                  }}
                  className="px-5 py-2 rounded-xl bg-[#172b2b] hover:bg-[#294342] text-white font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText size={14} /> Makbuzu Yazdır / PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


