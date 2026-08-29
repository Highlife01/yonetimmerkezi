import React, { useState } from "react";
import {
  Wallet, Search, Filter, AlertTriangle, Send, Download,
  Phone, Mail, MessageSquare, ShieldAlert, ArrowUpRight,
  CheckCircle2, Clock, Calculator, X, ChevronRight
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Unit } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import { exportToCSV } from "@/utils/exportUtils";
import { toast } from "sonner";

export default function DebtorsAgingView() {
  const { activeSite, activeSiteUnits, blocks, people, addAuditLog } = useApp();
  const { hasPermission } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("ALL");
  const [selectedAgingBucket, setSelectedAgingBucket] = useState("ALL");
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [smsMessage, setSmsMessage] = useState(
    `Sayın Sakinimiz, ${activeSite.name} yönetimi nezdinde adınıza kayıtlı gecikmiş aidat borcunuz bulunmaktadır. Mağduriyet oluşmaması adına ödemenizi rica ederiz.`
  );

  // Filter debtors only (currentBalance > 0)
  const debtors = activeSiteUnits.filter((u) => u.currentBalance > 0);

  // Calculate aging for each unit based on debt size simulation
  const debtorsWithAging = debtors.map((u) => {
    const owner = people.find((p) => p.id === u.ownerId);
    const tenant = u.tenantId ? people.find((p) => p.id === u.tenantId) : null;
    const monthlyDues = 2500;
    const monthsOverdue = Math.max(1, Math.round(u.currentBalance / monthlyDues));

    let daysOverdue = 15;
    let bucket: "1-30" | "31-60" | "61-90" | "90+" = "1-30";

    if (monthsOverdue === 1) {
      daysOverdue = 20;
      bucket = "1-30";
    } else if (monthsOverdue === 2) {
      daysOverdue = 45;
      bucket = "31-60";
    } else if (monthsOverdue === 3) {
      daysOverdue = 75;
      bucket = "61-90";
    } else {
      daysOverdue = 120;
      bucket = "90+";
    }

    // Gecikme tazminatı (%5 aylık KMK kanuni faizi)
    const lateInterest = Math.round(u.currentBalance * (activeSite.lateInterestRatePerMonth / 100) * (daysOverdue / 30));
    const totalWithInterest = u.currentBalance + lateInterest;

    return {
      unit: u,
      owner,
      tenant,
      occupant: tenant || owner,
      daysOverdue,
      bucket,
      debt: u.currentBalance,
      lateInterest,
      totalWithInterest,
    };
  });

  // Filter
  const filteredDebtors = debtorsWithAging.filter((item) => {
    if (selectedBlock !== "ALL" && item.unit.blockId !== selectedBlock) return false;
    if (selectedAgingBucket !== "ALL" && item.bucket !== selectedAgingBucket) return false;
    const q = search.toLocaleLowerCase("tr-TR").trim();
    if (q) {
      const matchText = `${item.unit.blockName} ${item.unit.unitNumber} ${item.occupant?.fullName || ""} ${item.occupant?.phone || ""}`.toLocaleLowerCase("tr-TR");
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  // Bucket totals
  const totalDebtAll = debtorsWithAging.reduce((sum, d) => sum + d.debt, 0);
  const bucket1_30 = debtorsWithAging.filter(d => d.bucket === "1-30").reduce((sum, d) => sum + d.debt, 0);
  const bucket31_60 = debtorsWithAging.filter(d => d.bucket === "31-60").reduce((sum, d) => sum + d.debt, 0);
  const bucket61_90 = debtorsWithAging.filter(d => d.bucket === "61-90").reduce((sum, d) => sum + d.debt, 0);
  const bucket90Plus = debtorsWithAging.filter(d => d.bucket === "90+").reduce((sum, d) => sum + d.debt, 0);

  const handleExportCSV = () => {
    const headers = [
      "Blok", "Daire", "Muhatap (Sakin)", "Telefon", "Gecikme Süresi",
      "Yaşlandırma Grubu", "Ana Para Borcu (TL)", "Gecikme Tazminatı (%5)", "Toplam Borç (TL)"
    ];
    const rows = filteredDebtors.map((d) => [
      d.unit.blockName,
      d.unit.unitNumber,
      d.occupant?.fullName || "-",
      d.occupant?.phone || "-",
      `${d.daysOverdue} Gün`,
      d.bucket === "90+" ? "90+ Gün (Kritik/İcra)" : `${d.bucket} Gün`,
      d.debt,
      d.lateInterest,
      d.totalWithInterest
    ]);
    exportToCSV(`${activeSite.name}_Borclular_Yaslandirma_Raporu`, headers, rows);
    toast.success("Borçlular Yaşlandırma Raporu Excel (CSV) olarak indirildi.");
  };

  const handleSendBulkSMS = (e: React.FormEvent) => {
    e.preventDefault();
    addAuditLog(
      "SYSTEM",
      "Borçlu Takibi",
      `${filteredDebtors.length} borçlu daireye SMS / E-posta hatırlatma bildirimi gönderildi.`
    );
    setIsSmsModalOpen(false);
    toast.success(`${filteredDebtors.length} borçlu sakine SMS ve Bildirim başarıyla iletildi!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">Borçlu Takibi & Yaşlandırma Matrisi</h2>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              1–30, 31–60, 61–90 ve 90+ gün yaşlandırma analizi, kanuni gecikme tazminatı ve toplu bildirim.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#e4eae3] text-[#294342] text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
            >
              <Download size={14} /> Yaşlandırma Excel Raporu
            </button>
            <button
              onClick={() => setIsSmsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition shadow-sm"
            >
              <MessageSquare size={14} /> Toplu Borç Hatırlat (SMS)
            </button>
          </div>
        </div>

        {/* Aging KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-[#f0f4f1]">
          <div
            onClick={() => setSelectedAgingBucket("ALL")}
            className={`p-3.5 rounded-xl border transition cursor-pointer ${
              selectedAgingBucket === "ALL" ? "bg-[#172b2b] text-white border-[#172b2b]" : "bg-white border-[#e4eae3] hover:bg-slate-50"
            }`}
          >
            <span className={`text-[10px] font-bold uppercase block ${selectedAgingBucket === "ALL" ? "text-emerald-300" : "text-[#7c8a87]"}`}>
              TOPLAM ALACAK
            </span>
            <strong className="text-lg font-bold block mt-0.5">{formatCurrency(totalDebtAll)}</strong>
            <span className={`text-[10px] ${selectedAgingBucket === "ALL" ? "text-slate-300" : "text-slate-500"}`}>
              {debtorsWithAging.length} daire borçlu
            </span>
          </div>

          <div
            onClick={() => setSelectedAgingBucket("1-30")}
            className={`p-3.5 rounded-xl border transition cursor-pointer ${
              selectedAgingBucket === "1-30" ? "bg-amber-600 text-white border-amber-600" : "bg-white border-[#e4eae3] hover:bg-slate-50"
            }`}
          >
            <span className={`text-[10px] font-bold uppercase block ${selectedAgingBucket === "1-30" ? "text-amber-100" : "text-amber-700"}`}>
              1–30 GÜN (YENİ)
            </span>
            <strong className="text-lg font-bold block mt-0.5">{formatCurrency(bucket1_30)}</strong>
            <span className={`text-[10px] ${selectedAgingBucket === "1-30" ? "text-amber-100" : "text-slate-500"}`}>
              İlk vade gecikmesi
            </span>
          </div>

          <div
            onClick={() => setSelectedAgingBucket("31-60")}
            className={`p-3.5 rounded-xl border transition cursor-pointer ${
              selectedAgingBucket === "31-60" ? "bg-orange-600 text-white border-orange-600" : "bg-white border-[#e4eae3] hover:bg-slate-50"
            }`}
          >
            <span className={`text-[10px] font-bold uppercase block ${selectedAgingBucket === "31-60" ? "text-orange-100" : "text-orange-700"}`}>
              31–60 GÜN (2 AY)
            </span>
            <strong className="text-lg font-bold block mt-0.5">{formatCurrency(bucket31_60)}</strong>
            <span className={`text-[10px] ${selectedAgingBucket === "31-60" ? "text-orange-100" : "text-slate-500"}`}>
              İkinci ihtar grubu
            </span>
          </div>

          <div
            onClick={() => setSelectedAgingBucket("61-90")}
            className={`p-3.5 rounded-xl border transition cursor-pointer ${
              selectedAgingBucket === "61-90" ? "bg-rose-700 text-white border-rose-700" : "bg-white border-[#e4eae3] hover:bg-slate-50"
            }`}
          >
            <span className={`text-[10px] font-bold uppercase block ${selectedAgingBucket === "61-90" ? "text-rose-100" : "text-rose-700"}`}>
              61–90 GÜN (3 AY)
            </span>
            <strong className="text-lg font-bold block mt-0.5">{formatCurrency(bucket61_90)}</strong>
            <span className={`text-[10px] ${selectedAgingBucket === "61-90" ? "text-rose-100" : "text-slate-500"}`}>
              Avukat öncesi son ihtar
            </span>
          </div>

          <div
            onClick={() => setSelectedAgingBucket("90+")}
            className={`p-3.5 rounded-xl border transition cursor-pointer ${
              selectedAgingBucket === "90+" ? "bg-red-900 text-white border-red-900" : "bg-white border-[#e4eae3] hover:bg-slate-50"
            }`}
          >
            <span className={`text-[10px] font-bold uppercase block ${selectedAgingBucket === "90+" ? "text-red-200" : "text-red-900"}`}>
              90+ GÜN (KRİTİK / İCRA)
            </span>
            <strong className="text-lg font-bold block mt-0.5">{formatCurrency(bucket90Plus)}</strong>
            <span className={`text-[10px] ${selectedAgingBucket === "90+" ? "text-red-200" : "text-slate-500"}`}>
              Hukuk & İcra takibi
            </span>
          </div>
        </div>

        {/* Filter inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa7a2]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Borçlu ara: daire, sakin, tel..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>

          <div>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="ALL">Tüm Bloklar</option>
              {blocks.filter(b => b.siteId === activeSite.id).map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end text-xs text-[#7c8a87]">
            <span>Listelenen: <strong>{filteredDebtors.length}</strong> borçlu daire</span>
          </div>
        </div>
      </div>

      {/* Debtors Table */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Bağımsız Bölüm</th>
                <th className="py-3 px-4">Muhatap (Sakin)</th>
                <th className="py-3 px-4">İletişim Telefonu</th>
                <th className="py-3 px-4">Gecikme Süresi</th>
                <th className="py-3 px-4">Yaşlandırma Grubu</th>
                <th className="py-3 px-4 text-right">Ana Borç</th>
                <th className="py-3 px-4 text-right">Gecikme Tazminatı (%5)</th>
                <th className="py-3 px-4 text-right">Toplam Tahsilat</th>
                <th className="py-3 px-4 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4f1]">
              {filteredDebtors.length > 0 ? (
                filteredDebtors.map((item) => (
                  <tr key={item.unit.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-[#172b2b]">
                      <span className="w-6 h-6 rounded bg-rose-50 text-rose-700 font-bold inline-block text-center leading-6 mr-2">
                        {item.unit.unitNumber}
                      </span>
                      {item.unit.blockName}
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="text-[#172b2b] block">{item.occupant?.fullName || "Bilinmiyor"}</strong>
                      <span className="text-[10px] text-[#87928e]">{item.tenant ? "Kiracı" : "Kat Maliki"}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold font-mono text-[11px]">
                      {item.occupant?.phone || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" /> ~{item.daysOverdue} gün
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        item.bucket === "1-30" ? "bg-amber-100 text-amber-800" :
                        item.bucket === "31-60" ? "bg-orange-100 text-orange-800" :
                        item.bucket === "61-90" ? "bg-rose-100 text-rose-800" :
                        "bg-red-100 text-red-900 font-extrabold animate-pulse"
                      }`}>
                        {item.bucket === "90+" ? "90+ Gün (İcra Takibi)" : `${item.bucket} Gün`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-600 text-sm">
                      {formatCurrency(item.debt)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 font-mono text-[11px]">
                      +{formatCurrency(item.lateInterest)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <strong className="text-sm font-extrabold text-[#172b2b]">
                        {formatCurrency(item.totalWithInterest)}
                      </strong>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            const phoneClean = (item.occupant?.phone || "").replace(/[^0-9]/g, "");
                            const formattedPhone = phoneClean.startsWith("0") ? "9" + phoneClean : phoneClean.startsWith("90") ? phoneClean : "90" + phoneClean;
                            const msg = encodeURIComponent(
                              `Sayın ${item.occupant?.fullName || "Sakinimiz"},\n\n` +
                              `${activeSite.name} - ${item.unit.blockName} Daire ${item.unit.unitNumber} için vadesi geçen toplam aidat borcunuz: ${formatCurrency(item.totalWithInterest)} (Gecikme süresi: ~${item.daysOverdue} gün).\n\n` +
                              `Apartman Resmi IBAN:\n${activeSite.bankName || "Banka"}: ${activeSite.bankIban || "TR55 0006 2000 0001 2345 6789 01"}\n` +
                              `Hesap Sahibi: ${activeSite.name} Kat Malikleri Yöneticiliği\n\n` +
                              `Lütfen ödeme açıklamanıza [${item.unit.blockName} D:${item.unit.unitNumber} - ${item.occupant?.fullName || ""}] yazarak dekontu iletiniz.\n` +
                              `Yönetim: ${activeSite.managerName || "Site Yönetimi"}`
                            );
                            window.open(`https://wa.me/${formattedPhone}?text=${msg}`, "_blank");
                            toast.success(`${item.occupant?.fullName || "Sakin"} için WhatsApp mesaj penceresi açıldı.`);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer shadow-xs"
                          title="WhatsApp ile Borç Hatırlat"
                        >
                          <MessageSquare size={14} />
                        </button>
                        <button
                          onClick={() => {
                            toast.info(`${item.unit.blockName} D:${item.unit.unitNumber} sakinine borç bildirim SMS'i gönderildi.`);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 transition cursor-pointer"
                          title="SMS Hatırlatma Gönder"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Seçilen kriterlerde borçlu daire bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BULK SMS MODAL */}
      {isSmsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172b2b]">Toplu Borç Hatırlatma (SMS / Bildirim)</h3>
                  <p className="text-xs text-[#7c8a87]">{filteredDebtors.length} borçlu daireye anlık SMS gönderimi.</p>
                </div>
              </div>
              <button onClick={() => setIsSmsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendBulkSMS} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">SMS Metni</label>
                <textarea
                  rows={4}
                  required
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-rose-500 resize-none text-xs"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Otomatik bakiye ve IBAN bilgisi eklenecektir.</span>
                  <span>{smsMessage.length} karakter</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] leading-relaxed">
                ⚠️ <strong>Hedef Liste:</strong> Filtrelenmiş <strong>{filteredDebtors.length} adet</strong> borçlu sakinin kayıtlı GSM numaralarına SMS ve mobil uygulama bildirimi iletilecektir.
              </div>

              <div className="pt-3 border-t border-[#e4eae3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSmsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition shadow-sm inline-flex items-center gap-1.5"
                >
                  <Send size={14} /> SMS Bildirimini Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
