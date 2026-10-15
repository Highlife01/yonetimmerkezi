import React, { useState } from "react";
import {
  ReceiptText, Plus, Search, Filter, CalendarDays, CheckCircle2,
  AlertTriangle, XCircle, ArrowUpRight, Download, Users, Building2,
  Sparkles, Layers, RefreshCw, X, ShieldAlert, Percent
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { TahakkukRecord, DuesCategory, DistributionMethod } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { exportToCSV } from "@/utils/exportUtils";
import { toast } from "sonner";

interface DuesTahakkukViewProps {
  initialOpenWizard?: boolean;
  initialOpenModal?: boolean;
}

export default function DuesTahakkukView({ initialOpenWizard = false, initialOpenModal = false }: DuesTahakkukViewProps) {
  const {
    activeSite, activeSiteUnits, activeSiteTahakkuklar,
    blocks, createBatchTahakkuk, cancelTahakkuk
  } = useApp();
  const { hasPermission } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isWizardOpen, setIsWizardOpen] = useState(initialOpenWizard || initialOpenModal);
  const [selectedTahakkukForDetail, setSelectedTahakkukForDetail] = useState<TahakkukRecord | null>(null);
  const [cancellingTahakkuk, setCancellingTahakkuk] = useState<TahakkukRecord | null>(null);
  const [cancelReason, setCancelReason] = useState("Yönetim kurulu düzeltme kararı");

  // Wizard form state
  const [wizardData, setWizardData] = useState({
    title: "Ekim 2026 Aylık İşletme Aidatı",
    period: "2026-10",
    category: "AIDAT" as DuesCategory,
    dueDate: "2026-10-10",
    distributionMethod: "EQUAL" as DistributionMethod,
    amountInput: 2500, // Daire başı veya toplam bütçe
    targetBlockId: "", // Boş = Tüm site
    responsibilityMode: "AUTO_KMK" as "AUTO_KMK" | "CUSTOM_RATIO" | "OCCUPANT_ONLY" | "OWNER_ONLY",
  });

  const filteredTahakkuklar = activeSiteTahakkuklar.filter((t) => {
    if (selectedCategory !== "ALL" && t.category !== selectedCategory) return false;
    const q = search.toLocaleLowerCase("tr-TR").trim();
    if (q && !t.title.toLocaleLowerCase("tr-TR").includes(q) && !t.period.includes(q)) return false;
    return true;
  });

  // Calculate live preview in wizard
  const targetUnits = activeSiteUnits.filter((u) => {
    if (wizardData.targetBlockId && u.blockId !== wizardData.targetBlockId) return false;
    return true;
  });

  const previewTotal = wizardData.distributionMethod === "EQUAL"
    ? wizardData.amountInput * targetUnits.length
    : wizardData.amountInput;

  // Duplicate period/category warning check
  const duplicatePeriodTahakkuk = activeSiteTahakkuklar.find(
    (t) =>
      t.status === "ACTIVE" &&
      t.period === wizardData.period &&
      t.category === wizardData.category
  );

  // Calculate Kiracı vs Kat Maliki split preview
  const isExtraCategory = ["DEMIRBAS", "BAKIM_ONARIM", "EK_BUTCE"].includes(wizardData.category);
  const previewSplit = targetUnits.reduce(
    (acc, u) => {
      const unitAmt =
        wizardData.distributionMethod === "EQUAL"
          ? wizardData.amountInput
          : Math.round(previewTotal / (targetUnits.length || 1));
      const r = u.paymentRatio || {
        duesTenantRatio: 100,
        duesOwnerRatio: 0,
        extraTenantRatio: 0,
        extraOwnerRatio: 100,
      };
      let tRatio = 0;
      if (u.tenantId && u.residentType === "KIRACI_OTURUYOR") {
        if (wizardData.responsibilityMode === "OWNER_ONLY") tRatio = 0;
        else if (wizardData.responsibilityMode === "OCCUPANT_ONLY") tRatio = 100;
        else tRatio = isExtraCategory ? r.extraTenantRatio : r.duesTenantRatio;
      }
      const tAmt = Math.round((unitAmt * tRatio) / 100);
      acc.tenantTotal += tAmt;
      acc.ownerTotal += unitAmt - tAmt;
      return acc;
    },
    { tenantTotal: 0, ownerTotal: 0 }
  );

  const handleExecuteBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizardData.title || wizardData.amountInput <= 0) {
      toast.error("Lütfen geçerli bir başlık ve tutar giriniz.");
      return;
    }

    createBatchTahakkuk({
      title: wizardData.title,
      period: wizardData.period,
      category: wizardData.category,
      dueDate: wizardData.dueDate,
      distributionMethod: wizardData.distributionMethod,
      totalAmountOrPerUnit: wizardData.amountInput,
      targetBlockId: wizardData.targetBlockId || undefined,
      responsibilityMode: wizardData.responsibilityMode,
    });

    setIsWizardOpen(false);
    toast.success(`Toplu tahakkuk başarıyla oluşturuldu! ${targetUnits.length} daireye toplam ${formatCurrency(previewTotal)} borç yansıtıldı.`);
  };

  const handleExportCSV = (t: TahakkukRecord) => {
    const headers = [
      "Daire", "Muhatap (Sakin)", "Sorumlu Taraf",
      "Kiracı Payı (TL)", "Kat Maliki Payı (TL)",
      "Tahakkuk Tutarı (TL)", "Tahsil Edilen (TL)", "Durum"
    ];
    const rows = t.allocations.map(a => [
      a.unitName,
      a.personName,
      a.payerType === "KIRACI" ? "Kiracı" : a.payerType === "ORTAK" ? "Ortak (K+M)" : "Kat Maliki",
      a.tenantAmount ?? (a.payerType === "KIRACI" ? a.amount : 0),
      a.ownerAmount ?? (a.payerType === "KIRACI" ? 0 : a.amount),
      a.amount,
      a.paidAmount,
      a.isPaid ? "Ödendi" : "Ödenmedi"
    ]);
    exportToCSV(`${t.title}_Dökümü`, headers, rows);
    toast.success("Tahakkuk dökümü Excel (CSV) olarak indirildi.");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">Aidat & Toplu Tahakkuk Yönetimi</h2>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              KMK uyumlu dağıtım modelleri (Eşit, m², Arsa Payı) ve Kiracı / Ev Sahibi borç paylaşım oranlarıyla toplu borçlandırma.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {hasPermission("canCreateTahakkuk") && (
              <button
                onClick={() => setIsWizardOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#172b2b] text-white text-xs font-bold hover:bg-[#294342] transition shadow-sm"
              >
                <Plus size={16} /> Toplu Borçlandırma Sihirbazı
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#f0f4f1]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa7a2]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tahakkuk ara (dönem, başlık)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="ALL">Tüm Borçlandırma Kategorileri</option>
              <option value="AIDAT">Aylık İşletme Aidatı</option>
              <option value="YAKIT">Merkezi Isınma / Yakıt</option>
              <option value="ORTAK_ELEKTRIK">Ortak Alan Elektrik</option>
              <option value="DEMIRBAS">Demirbaş & Yatırım Bütçesi</option>
              <option value="EK_BUTCE">Ek İşletme Bütçesi</option>
            </select>
          </div>

          <div className="flex items-center justify-end text-xs text-[#7c8a87]">
            <span>Toplam <strong>{filteredTahakkuklar.length}</strong> tahakkuk dönemi</span>
          </div>
        </div>
      </div>

      {/* Tahakkuk Listesi */}
      <div className="space-y-4">
        {filteredTahakkuklar.map((tahakkuk) => {
          const collectRate = tahakkuk.totalTargetAmount > 0
            ? Math.round((tahakkuk.totalCollectedAmount / tahakkuk.totalTargetAmount) * 100)
            : 0;

          return (
            <div
              key={tahakkuk.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition ${
                tahakkuk.status === "CANCELLED" ? "border-rose-200 bg-rose-50/20" : "border-[#e4eae3]"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                    tahakkuk.status === "CANCELLED" ? "bg-rose-100 text-rose-700" :
                    tahakkuk.category === "DEMIRBAS" ? "bg-amber-100 text-amber-800" : "bg-[#d5f1d2] text-[#39704c]"
                  }`}>
                    <ReceiptText size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-[#172b2b]">{tahakkuk.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {tahakkuk.period} Dönemi
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ["DEMIRBAS", "BAKIM_ONARIM", "EK_BUTCE"].includes(tahakkuk.category)
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}>
                        {["DEMIRBAS", "BAKIM_ONARIM", "EK_BUTCE"].includes(tahakkuk.category)
                          ? "Demirbaş / Ekstra Borç"
                          : "İşletme / Aidat"}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tahakkuk.status === "CANCELLED" ? "bg-rose-100 text-rose-800" :
                        tahakkuk.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {tahakkuk.status === "CANCELLED" ? "İptal Edildi" :
                         tahakkuk.status === "COMPLETED" ? "Tamamlandı" : "Aktif Tahsilatta"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#7c8a87] mt-1.5 flex-wrap">
                      <span>Son Ödeme: <strong>{formatDate(tahakkuk.dueDate)}</strong></span>
                      <span>Kapsam: <strong>{tahakkuk.unitCount} Daire</strong></span>
                      <span>Dağıtım: <strong>{
                        tahakkuk.distributionMethod === "EQUAL" ? "Eşit Paylaşım" :
                        tahakkuk.distributionMethod === "SQM" ? "m² Bazlı" :
                        tahakkuk.distributionMethod === "LAND_SHARE" ? "Arsa Payı Bazlı" : "Özel"
                      }</strong></span>
                      <span>Oluşturan: <strong>{tahakkuk.createdBy}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Progress & Totals */}
                  <div className="text-right min-w-[140px]">
                    <div className="flex items-baseline justify-end gap-1.5">
                      <strong className="text-lg font-bold text-[#172b2b]">{formatCurrency(tahakkuk.totalCollectedAmount)}</strong>
                      <span className="text-xs text-[#87928e]">/ {formatCurrency(tahakkuk.totalTargetAmount)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, collectRate)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 block mt-1">%{collectRate} Tahsil Edildi</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedTahakkukForDetail(tahakkuk)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                    >
                      Döküm & Liste
                    </button>
                    {tahakkuk.status === "ACTIVE" && hasPermission("canCreateTahakkuk") && (
                      <button
                        onClick={() => {
                          setCancellingTahakkuk(tahakkuk);
                          setCancelReason("Yönetim kurulu düzeltme kararı");
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition"
                        title="Tahakkuku İptal Et"
                      >
                        İptal
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CANCEL TAHAKKUK MODAL */}
      {cancellingTahakkuk && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <h3 className="text-base font-bold text-rose-700">Tahakkuk İptal Onayı</h3>
              <button onClick={() => setCancellingTahakkuk(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-[#7c8a87]">
              <strong>{cancellingTahakkuk.title}</strong> ({cancellingTahakkuk.period}) tahakkukunu iptal etmek üzeresiniz. İlgili tutarlar daire bakiyelerinden düşülecektir.
            </p>
            <div className="text-xs">
              <label className="font-bold text-[#172b2b] block mb-1">İptal Gerekçesi *</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="pt-3 border-t border-[#e4eae3] flex justify-end gap-2 text-xs">
              <button
                onClick={() => setCancellingTahakkuk(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  cancelTahakkuk(cancellingTahakkuk.id, cancelReason);
                  toast.success("Tahakkuk iptal edildi ve daire bakiyelerinden düşüldü.");
                  setCancellingTahakkuk(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700"
              >
                Tahakkuku İptal Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH ACCRUAL WIZARD MODAL */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#d5f1d2] text-[#39704c] flex items-center justify-center font-bold">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172b2b]">Toplu Borçlandırma & Aidat Sihirbazı</h3>
                  <p className="text-xs text-[#7c8a87]">Tüm dairelere tek işlemle KMK esaslarına ve Kiracı/Malik oranlarına göre tahakkuk oluşturun.</p>
                </div>
              </div>
              <button onClick={() => setIsWizardOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {duplicatePeriodTahakkuk && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Mükerrer Dönem Uyarısı</strong>
                  <span>
                    <strong>{wizardData.period}</strong> dönemi için zaten aktif bir <strong>{duplicatePeriodTahakkuk.title}</strong> kaydı bulunuyor. Ek tahakkuk yapmak istiyorsanız başlığı özelleştirebilirsiniz.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleExecuteBatch} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Borçlandırma Başlığı *</label>
                  <input
                    type="text"
                    required
                    value={wizardData.title}
                    onChange={(e) => setWizardData({ ...wizardData, title: e.target.value })}
                    placeholder="Örn: Ekim 2026 Aidatı, Asansör Revizyonu..."
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Dönem (Ay / Yıl)</label>
                  <input
                    type="month"
                    required
                    value={wizardData.period}
                    onChange={(e) => setWizardData({ ...wizardData, period: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Kategori</label>
                  <select
                    value={wizardData.category}
                    onChange={(e) => setWizardData({ ...wizardData, category: e.target.value as DuesCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="AIDAT">Aylık Aidat</option>
                    <option value="YAKIT">Yakıt / Isınma</option>
                    <option value="ORTAK_ELEKTRIK">Ortak Elektrik</option>
                    <option value="ORTAK_SU">Ortak Su</option>
                    <option value="DEMIRBAS">Demirbaş Fonu</option>
                    <option value="BAKIM_ONARIM">Bakım-Onarım</option>
                    <option value="EK_BUTCE">Ek Bütçe</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Son Ödeme Tarihi *</label>
                  <input
                    type="date"
                    required
                    value={wizardData.dueDate}
                    onChange={(e) => setWizardData({ ...wizardData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Hedef Blok</label>
                  <select
                    value={wizardData.targetBlockId}
                    onChange={(e) => setWizardData({ ...wizardData, targetBlockId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="">Tüm Bloklar ({activeSiteUnits.length} Daire)</option>
                    {blocks.filter(b => b.siteId === activeSite.id).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kiracı / Ev Sahibi Borç Sorumluluk Seçimi */}
              <div>
                <label className="font-bold text-[#172b2b] block mb-1.5 flex items-center gap-1.5">
                  <Percent size={13} className="text-emerald-700" />
                  Kiracı / Kat Maliki (Ev Sahibi) Borç Paylaşım Kuralı
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setWizardData({ ...wizardData, responsibilityMode: "AUTO_KMK" })}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      wizardData.responsibilityMode === "AUTO_KMK"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs"
                        : "bg-white border-[#e4eae3] text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <strong className="text-xs font-bold block">Daire Oranları & KMK</strong>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      {isExtraCategory ? "Demirbaş oranına göre (Varsayılan %100 Malik)" : "Aidat oranına göre (Varsayılan %100 Kiracı)"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWizardData({ ...wizardData, responsibilityMode: "OCCUPANT_ONLY" })}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      wizardData.responsibilityMode === "OCCUPANT_ONLY"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs"
                        : "bg-white border-[#e4eae3] text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <strong className="text-xs font-bold block">%100 Oturan Sakin</strong>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Kiracı varsa tamamı kiracıya yansır</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWizardData({ ...wizardData, responsibilityMode: "OWNER_ONLY" })}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      wizardData.responsibilityMode === "OWNER_ONLY"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs"
                        : "bg-white border-[#e4eae3] text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <strong className="text-xs font-bold block">%100 Kat Maliki</strong>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Yatırım/Demirbaş doğrudan ev sahibine</span>
                  </button>
                </div>
              </div>

              {/* Dağıtım Yöntemi Seçimi */}
              <div>
                <label className="font-bold text-[#172b2b] block mb-1.5">KMK Borç Dağıtım Yöntemi *</label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setWizardData({ ...wizardData, distributionMethod: "EQUAL" })}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      wizardData.distributionMethod === "EQUAL"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs"
                        : "bg-white border-[#e4eae3] text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <strong className="text-xs font-bold block">Eşit Dağıtım</strong>
                    <span className="text-[10px] text-slate-500 mt-1">Daire başına sabit tutar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWizardData({ ...wizardData, distributionMethod: "SQM" })}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      wizardData.distributionMethod === "SQM"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs"
                        : "bg-white border-[#e4eae3] text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <strong className="text-xs font-bold block">m²'ye Göre</strong>
                    <span className="text-[10px] text-slate-500 mt-1">Metrekare oranında dağıt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWizardData({ ...wizardData, distributionMethod: "LAND_SHARE" })}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      wizardData.distributionMethod === "LAND_SHARE"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs"
                        : "bg-white border-[#e4eae3] text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <strong className="text-xs font-bold block">Arsa Payına Göre</strong>
                    <span className="text-[10px] text-slate-500 mt-1">Tapu arsa payı oranında</span>
                  </button>
                </div>
              </div>

              {/* Tutar Girişi */}
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">
                  {wizardData.distributionMethod === "EQUAL" ? "Daire Başı Aidat Tutarı (TL) *" : "Toplam Dağıtılacak Bütçe Tutarı (TL) *"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₺</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={wizardData.amountInput}
                    onChange={(e) => setWizardData({ ...wizardData, amountInput: Number(e.target.value) })}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#e4eae3] font-bold text-base text-[#172b2b] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* CANLI HESAPLAMA ÖZETİ */}
              <div className="p-4 rounded-xl bg-[#edf3eb] border border-[#dce7da] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#7a8a84]">TOPLAM TAHAKKUK HEDEFİ</span>
                    <h4 className="text-2xl font-extrabold text-[#172b2b]">{formatCurrency(previewTotal)}</h4>
                    <span className="text-[11px] text-[#7a8a84]">
                      {targetUnits.length} daireye yansıtılacak toplam alacak
                    </span>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-slate-500 block">Daire Başı Ortalama</span>
                    <strong className="text-emerald-800 font-bold text-sm">
                      {formatCurrency(previewTotal / (targetUnits.length || 1))}
                    </strong>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#dce7da] flex items-center justify-between text-[11px] text-[#294342]">
                  <span>Kiracı Sorumluluğu Toplamı: <strong>{formatCurrency(previewSplit.tenantTotal)}</strong></span>
                  <span>Kat Maliki Sorumluluğu Toplamı: <strong>{formatCurrency(previewSplit.ownerTotal)}</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#e4eae3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#172b2b] text-white font-bold hover:bg-[#294342] transition shadow-sm inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 size={15} /> Tahakkuku Onayla ve Dağıt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAHAKKUK ALLOCATIONS DETAIL MODAL */}
      {selectedTahakkukForDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div>
                <h3 className="text-base font-bold text-[#172b2b]">{selectedTahakkukForDetail.title}</h3>
                <p className="text-xs text-[#7c8a87]">Daire bazında Kiracı / Kat Maliki borçlandırma ve tahsilat dökümü.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportCSV(selectedTahakkukForDetail)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
                >
                  <Download size={13} /> Excel
                </button>
                <button onClick={() => setSelectedTahakkukForDetail(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="border border-[#e4eae3] rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] text-[10px] font-bold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Bağımsız Bölüm</th>
                    <th className="py-2.5 px-3">Muhatap (Sakin)</th>
                    <th className="py-2.5 px-3">Sorumlu Taraf</th>
                    <th className="py-2.5 px-3 text-right">Tahakkuk Tutarı</th>
                    <th className="py-2.5 px-3 text-right">Tahsil Edilen</th>
                    <th className="py-2.5 px-3 text-center">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f4f1]">
                  {selectedTahakkukForDetail.allocations?.map((alloc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-[#172b2b]">{alloc.unitName}</td>
                      <td className="py-2.5 px-3 text-slate-700">{alloc.personName}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          alloc.payerType === "KIRACI"
                            ? "bg-blue-50 text-blue-800"
                            : alloc.payerType === "ORTAK"
                            ? "bg-purple-50 text-purple-800"
                            : "bg-emerald-50 text-emerald-800"
                        }`}>
                          {alloc.payerType === "KIRACI"
                            ? "Kiracı"
                            : alloc.payerType === "ORTAK"
                            ? `Ortak (K:₺${alloc.tenantAmount} / M:₺${alloc.ownerAmount})`
                            : "Kat Maliki"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#172b2b]">{formatCurrency(alloc.amount)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{formatCurrency(alloc.paidAmount)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          alloc.isPaid ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                        }`}>
                          {alloc.isPaid ? "Ödendi" : "Ödenmedi"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-[#e4eae3] flex justify-between items-center text-xs">
              <span className="text-slate-500">Toplam Hedef: <strong>{formatCurrency(selectedTahakkukForDetail.totalTargetAmount)}</strong></span>
              <button
                onClick={() => setSelectedTahakkukForDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

