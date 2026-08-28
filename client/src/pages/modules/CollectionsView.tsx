import React, { useState } from "react";
import {
  HandCoins, Plus, Search, Filter, Printer, Download,
  CreditCard, Wallet, Landmark, ArrowUpRight, CheckCircle2,
  CalendarDays, FileText, X, User
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Collection, PaymentMethod } from "@/types";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/formatters";
import { exportToCSV, printReceipt } from "@/utils/exportUtils";
import { toast } from "sonner";

interface CollectionsViewProps {
  initialOpenModal?: boolean;
  preselectedUnitId?: string;
}

export default function CollectionsView({ initialOpenModal = false, preselectedUnitId }: CollectionsViewProps) {
  const {
    activeSite, activeSiteCollections, activeSiteUnits,
    activeSiteAccounts, activeSiteTahakkuklar, people,
    addCollection
  } = useApp();
  const { hasPermission } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialOpenModal || !!preselectedUnitId);
  const [selectedCollectionForPrint, setSelectedCollectionForPrint] = useState<Collection | null>(null);

  // New Collection Form
  const [newColData, setNewColData] = useState({
    unitId: preselectedUnitId || activeSiteUnits[0]?.id || "",
    amount: 2500,
    paymentMethod: "HAVALE_EFT" as PaymentMethod,
    targetAccountId: activeSiteAccounts[0]?.id || "",
    description: "Eylül 2026 Aidat Ödemesi",
    referenceNo: "",
    settledTahakkukId: activeSiteTahakkuklar[0]?.id || "",
  });

  const filteredCollections = activeSiteCollections.filter((c) => {
    if (selectedMethod !== "ALL" && c.paymentMethod !== selectedMethod) return false;
    const q = search.toLocaleLowerCase("tr-TR").trim();
    if (q) {
      const matchText = `${c.receiptNumber} ${c.unitName} ${c.personName} ${c.description} ${c.referenceNo || ""}`.toLocaleLowerCase("tr-TR");
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const totalCollected = filteredCollections.reduce((sum, c) => sum + c.amount, 0);

  const handleUnitChange = (unitId: string) => {
    const unit = activeSiteUnits.find((u) => u.id === unitId);
    setNewColData({
      ...newColData,
      unitId,
      amount: unit && unit.currentBalance > 0 ? unit.currentBalance : 2500,
    });
  };

  const handleSaveCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColData.unitId || newColData.amount <= 0 || !newColData.targetAccountId) {
      toast.error("Lütfen daire, tutar ve hedef hesap seçiniz.");
      return;
    }

    const createdCol = addCollection({
      unitId: newColData.unitId,
      amount: Number(newColData.amount),
      paymentMethod: newColData.paymentMethod,
      targetAccountId: newColData.targetAccountId,
      description: newColData.description,
      referenceNo: newColData.referenceNo,
      settledTahakkukId: newColData.settledTahakkukId || undefined,
    });

    setIsAddModalOpen(false);
    toast.success(`Tahsilat başarıyla kaydedildi! Makbuz No: ${createdCol.receiptNumber}`);
    setSelectedCollectionForPrint(createdCol);
  };

  const handlePrint = (col: Collection) => {
    const receiptHtml = `
      <div class="receipt-box">
        <div class="header">
          <div>
            <div class="logo">${activeSite.name}</div>
            <div style="font-size:12px; color:#666;">${activeSite.address}</div>
            <div style="font-size:11px; color:#888;">Vergi / Yönetim No: ${activeSite.bankIban || ''}</div>
          </div>
          <div class="title">
            <div style="color:#15803d; font-size:18px;">RESMİ TAHSİLAT MAKBUZU</div>
            <div style="font-size:13px; font-weight:bold; margin-top:4px;">No: ${col.receiptNumber}</div>
            <div style="font-size:11px; color:#666; font-weight:normal;">Tarih: ${col.paymentDate}</div>
          </div>
        </div>

        <div style="background:#f8faf7; padding:14px; border-radius:6px; margin: 15px 0; font-size:13px; line-height:1.6;">
          <div><strong>Bağımsız Bölüm:</strong> ${col.unitName}</div>
          <div><strong>Ödeyen (Sakin):</strong> ${col.personName}</div>
          <div><strong>Ödeme Yöntemi:</strong> ${
            col.paymentMethod === 'NAKIT' ? 'Nakit (Ofis Kasası)' :
            col.paymentMethod === 'HAVALE_EFT' ? 'Banka Havalesi / EFT' :
            col.paymentMethod === 'KREDI_KARTI' ? 'Kredi Kartı / POS' : 'Online Sanal POS'
          } ${col.referenceNo ? `(Ref No: ${col.referenceNo})` : ''}</div>
          <div><strong>Tahsil Edilen Hesap:</strong> ${col.targetAccountName}</div>
          <div><strong>Açıklama:</strong> ${col.description}</div>
        </div>

        <div class="total-row">
          <span>TAHSİL EDİLEN TUTAR:</span>
          <span style="color:#15803d; font-size:20px;">${formatCurrency(col.amount)}</span>
        </div>

        <div style="font-size:11px; color:#777; margin-top:10px;">
          Yalnız: <em># ${col.amount.toLocaleString('tr-TR')} Türk Lirası #</em> tahsil edilmiştir.
        </div>

        <div class="footer">
          <div>
            <div>Tahsil Eden: <strong>${col.createdBy}</strong></div>
            <div style="font-size:10px; color:#999; margin-top:4px;">Elektronik Kayıt No: ${col.id}</div>
          </div>
          <div class="sign">Yetkili İmza / Kaşe</div>
        </div>
      </div>
    `;

    printReceipt(receiptHtml);
  };

  const handleExportCSV = () => {
    const headers = [
      "Makbuz No", "Tarih", "Daire", "Sakin", "Tutar (TL)",
      "Ödeme Yöntemi", "Hesap / Kasa", "Açıklama", "Dekont / Ref No", "Tahsil Eden"
    ];
    const rows = filteredCollections.map((c) => [
      c.receiptNumber,
      c.paymentDate,
      c.unitName,
      c.personName,
      c.amount,
      c.paymentMethod,
      c.targetAccountName,
      c.description,
      c.referenceNo || "-",
      c.createdBy
    ]);
    exportToCSV(`${activeSite.name}_Tahsilatlar_Listesi`, headers, rows);
    toast.success("Tahsilatlar listesi Excel (CSV) olarak indirildi.");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">Tahsilat Yönetimi ve Makbuzlar</h2>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              Nakit, Havale, Kredi Kartı ve Sanal POS aidat tahsilatları, cariye mahsup ve resmi makbuz dökümü.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#e4eae3] text-[#294342] text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
            >
              <Download size={14} /> Excel'e Aktar
            </button>
            {hasPermission("canCollectPayments") && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
              >
                <Plus size={16} /> Yeni Tahsilat Girişi
              </button>
            )}
          </div>
        </div>

        {/* Filters & KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#f0f4f1]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa7a2]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Makbuz no, daire, sakin ara..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>

          <div>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="ALL">Tüm Ödeme Yöntemleri</option>
              <option value="HAVALE_EFT">Banka Havalesi / EFT</option>
              <option value="ONLINE_POS">Online Sanal POS (Kart)</option>
              <option value="NAKIT">Nakit (Ofis Kasası)</option>
              <option value="KREDI_KARTI">Fiziksel POS Cihazı</option>
            </select>
          </div>

          <div className="flex items-center justify-end text-xs text-[#7c8a87]">
            <span>Listelenen Toplam: <strong className="text-emerald-700 text-sm font-bold ml-1">{formatCurrency(totalCollected)}</strong></span>
          </div>
        </div>
      </div>

      {/* Collections Table */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Makbuz No</th>
                <th className="py-3 px-4">Tarih & Saat</th>
                <th className="py-3 px-4">Bağımsız Bölüm</th>
                <th className="py-3 px-4">Ödeyen (Sakin)</th>
                <th className="py-3 px-4">Ödeme Kanalı</th>
                <th className="py-3 px-4">Hesap / Kasa</th>
                <th className="py-3 px-4 text-right">Tahsilat Tutarı</th>
                <th className="py-3 px-4 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4f1]">
              {filteredCollections.length > 0 ? (
                filteredCollections.map((col) => (
                  <tr key={col.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#172b2b]">
                      {col.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {col.paymentDate}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#172b2b]">
                      {col.unitName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {col.personName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        col.paymentMethod === "ONLINE_POS" ? "bg-emerald-50 text-emerald-800" :
                        col.paymentMethod === "HAVALE_EFT" ? "bg-blue-50 text-blue-800" :
                        col.paymentMethod === "NAKIT" ? "bg-amber-50 text-amber-800" : "bg-purple-50 text-purple-800"
                      }`}>
                        {col.paymentMethod === "ONLINE_POS" && <CreditCard size={11} />}
                        {col.paymentMethod === "HAVALE_EFT" && <Landmark size={11} />}
                        {col.paymentMethod === "NAKIT" && <Wallet size={11} />}
                        {col.paymentMethod === "ONLINE_POS" ? "Sanal POS" :
                         col.paymentMethod === "HAVALE_EFT" ? "Havale/EFT" :
                         col.paymentMethod === "NAKIT" ? "Nakit Kasa" : "Kart / POS"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {col.targetAccountName}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <strong className="text-sm font-bold text-emerald-700">
                        {formatCurrency(col.amount)}
                      </strong>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handlePrint(col)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#172b2b] text-xs font-bold transition"
                        title="Makbuzu Yazdır / PDF İndir"
                      >
                        <Printer size={13} /> Makbuz
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aramanızla eşleşen tahsilat kaydı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW COLLECTION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <HandCoins size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172b2b]">Tahsilat Kaydet</h3>
                  <p className="text-xs text-[#7c8a87]">Daire hesabına tahsilat girin ve resmi makbuz üretin.</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Daire Seçin *</label>
                <select
                  required
                  value={newColData.unitId}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                >
                  {activeSiteUnits.map((u) => {
                    const occupant = u.tenantId ? people.find(p => p.id === u.tenantId) : people.find(p => p.id === u.ownerId);
                    return (
                      <option key={u.id} value={u.id}>
                        {u.blockName} Daire {u.unitNumber} - {occupant?.fullName || "Malik"} (Bakiye: {formatCurrency(u.currentBalance)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Tahsilat Tutarı (TL) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₺</span>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newColData.amount}
                      onChange={(e) => setNewColData({ ...newColData, amount: Number(e.target.value) })}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#e4eae3] font-bold text-base text-emerald-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Ödeme Yöntemi</label>
                  <select
                    value={newColData.paymentMethod}
                    onChange={(e) => setNewColData({ ...newColData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="HAVALE_EFT">Banka Havalesi / EFT</option>
                    <option value="NAKIT">Nakit (Ofis Kasası)</option>
                    <option value="KREDI_KARTI">Fiziksel POS (Kart)</option>
                    <option value="ONLINE_POS">Online Sanal POS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Tahsil Edilen Hesap / Kasa *</label>
                  <select
                    required
                    value={newColData.targetAccountId}
                    onChange={(e) => setNewColData({ ...newColData, targetAccountId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    {activeSiteAccounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Dekont / Ref No</label>
                  <input
                    type="text"
                    placeholder="EFT No / POS Onay No"
                    value={newColData.referenceNo}
                    onChange={(e) => setNewColData({ ...newColData, referenceNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Açıklama</label>
                <input
                  type="text"
                  value={newColData.description}
                  onChange={(e) => setNewColData({ ...newColData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] flex items-center justify-between">
                <span>Otomatik resmi makbuz numarası üretilecek ve daire cari ekstresine işlenecektir.</span>
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
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition shadow-sm inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 size={15} /> Tahsilatı Kaydet & Makbuz Al
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
