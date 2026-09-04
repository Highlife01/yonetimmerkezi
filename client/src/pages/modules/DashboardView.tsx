import React, { useState } from "react";
import {
  Building2, ReceiptText, Gauge, Wallet, ArrowUpRight, ArrowDownRight,
  Blocks, ShieldCheck, Search, Bell, Wrench, Plus, CalendarDays,
  FileCheck2, HandCoins, CreditCard, Sparkles, Filter, ChevronRight,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Landmark
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { toast } from "sonner";

interface DashboardViewProps {
  onNavigate: (moduleName: string) => void;
  onOpenBatchTahakkuk: () => void;
  onOpenCollection: () => void;
  onOpenExpense: () => void;
  onOpenAnnouncement: () => void;
}

export default function DashboardView({
  onNavigate,
  onOpenBatchTahakkuk,
  onOpenCollection,
  onOpenExpense,
  onOpenAnnouncement,
}: DashboardViewProps) {
  const {
    activeSite, activeSiteUnits, activeSiteTahakkuklar,
    activeSiteCollections, activeSiteExpenses, activeSiteAccounts,
    activeSiteRequests, activeSiteAssets, activeSiteAuditLogs
  } = useApp();
  const { currentUser, roleDef } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");

  // KPIs
  const totalUnits = activeSiteUnits.length || activeSite.totalUnits;
  const currentMonthTahakkuk = activeSiteTahakkuklar.reduce((sum, t) => sum + (t.status === "ACTIVE" ? t.totalTargetAmount : 0), 0);
  const totalCollections = activeSiteCollections.reduce((sum, c) => sum + c.amount, 0);
  const totalDebt = activeSiteUnits.reduce((sum, u) => sum + (u.currentBalance > 0 ? u.currentBalance : 0), 0);
  const totalCash = activeSiteAccounts.filter(a => a.type === "KASA").reduce((sum, a) => sum + a.balance, 0);
  const totalBank = activeSiteAccounts.filter(a => a.type === "BANKA").reduce((sum, a) => sum + a.balance, 0);
  const openRequests = activeSiteRequests.filter(r => r.status !== "TAMAMLANDI").length;
  const collectionRate = currentMonthTahakkuk > 0 ? Math.min(100, Math.round((totalCollections / currentMonthTahakkuk) * 100 * 10) / 10) : 89.9;

  // Filtered recent activities
  const recentActivities = activeSiteCollections.slice(0, 5).map(c => ({
    id: c.id,
    name: c.personName,
    detail: c.unitName,
    type: c.category,
    amount: `+ ${formatCurrency(c.amount)}`,
    time: c.paymentDate.split(" ")[1] || "09:30",
    date: c.paymentDate.split(" ")[0] || "",
    tone: "mint",
    receiptNo: c.receiptNumber,
  }));

  return (
    <div className="space-y-6">
      {/* ===================== SITE INFO BANNER ===================== */}
      <div className="bg-white border border-[#e2eae3] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-50/50 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-800 flex items-center justify-center font-black text-2xl shadow-sm border border-emerald-200/60">
            <Building2 size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-[#172b2b] tracking-tight font-heading">
                {activeSite.name}
              </h2>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {activeSite.city} / {activeSite.district}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                KMK STANDARDI
              </span>
            </div>
            <p className="text-xs text-[#667a75] mt-1 font-medium">
              {activeSite.totalBlocks} Blok · {totalUnits} Bağımsız Bölüm · Yönetici: <strong className="text-[#172b2b]">{activeSite.managerName}</strong> ({activeSite.managerPhone})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap relative z-10 w-full md:w-auto">
          <button
            onClick={onOpenBatchTahakkuk}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#172b2b] via-[#213f3d] to-[#172b2b] hover:from-[#213f3d] hover:to-[#2e5754] text-white text-xs font-black shadow-md shadow-[#172b2b]/15 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus size={15} className="text-[#b8edb7]" /> Toplu Tahakkuk
          </button>
          <button
            onClick={onOpenCollection}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-md shadow-emerald-800/15 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <HandCoins size={15} /> Tahsilat Gir
          </button>
          <button
            onClick={onOpenExpense}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#d6e0d8] hover:border-slate-400 text-slate-800 text-xs font-bold transition shadow-2xs hover:bg-slate-50 cursor-pointer"
          >
            <ArrowUpRight size={15} className="text-slate-500" /> Gider Kaydet
          </button>
        </div>
      </div>

      {/* ===================== KPI CARDS GRID ===================== */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Toplam Daire */}
        <div className="bg-white border border-[#e2eae3] rounded-3xl p-5 shadow-xs hover:shadow-lg transition-all transform hover:-translate-y-0.5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100/80 group-hover:scale-105 transition-transform">
              <Building2 size={20} />
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ArrowUpRight size={13} /> {activeSite.totalBlocks} Blok
            </span>
          </div>
          <p className="text-xs text-[#788581] font-semibold">Toplam Daire Sayısı</p>
          <strong className="text-2xl sm:text-3xl font-black text-[#172b2b] mt-1 block font-heading">{totalUnits}</strong>
          <span className="text-[11px] text-[#98a39f] mt-1 block font-medium">Aktif bağımsız bölüm</span>
        </div>

        {/* Card 2: Bu Ay Tahakkuk */}
        <div className="bg-white border border-[#e2eae3] rounded-3xl p-5 shadow-xs hover:shadow-lg transition-all transform hover:-translate-y-0.5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100/80 group-hover:scale-105 transition-transform">
              <ReceiptText size={20} />
            </div>
            <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Eylül 2026
            </span>
          </div>
          <p className="text-xs text-[#788581] font-semibold">Bu Ay Toplam Tahakkuk</p>
          <strong className="text-2xl sm:text-3xl font-black text-[#172b2b] mt-1 block font-heading">{formatCurrency(currentMonthTahakkuk || 300000)}</strong>
          <span className="text-[11px] text-[#98a39f] mt-1 block font-medium">Tüm bağımsız bölümler</span>
        </div>

        {/* Card 3: Tahsilat Oranı */}
        <div className="bg-white border border-[#e2eae3] rounded-3xl p-5 shadow-xs hover:shadow-lg transition-all transform hover:-translate-y-0.5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100/80 group-hover:scale-105 transition-transform">
              <Gauge size={20} />
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Hedef: %90
            </span>
          </div>
          <p className="text-xs text-[#788581] font-semibold">Dönem Tahsilat Oranı</p>
          <strong className="text-2xl sm:text-3xl font-black text-[#172b2b] mt-1 block font-heading">%{collectionRate}</strong>
          <span className="text-[11px] text-[#98a39f] mt-1 block font-medium">{formatCurrency(totalCollections)} tahsil edildi</span>
        </div>

        {/* Card 4: Toplam Alacak (Borçlar) */}
        <div className="bg-white border border-[#e2eae3] rounded-3xl p-5 shadow-xs hover:shadow-lg transition-all transform hover:-translate-y-0.5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100/80 group-hover:scale-105 transition-transform">
              <Wallet size={20} />
            </div>
            <button
              onClick={() => onNavigate("Borçlular")}
              className="text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1 transition cursor-pointer"
            >
              Listele <ChevronRight size={12} />
            </button>
          </div>
          <p className="text-xs text-[#788581] font-semibold">Toplam Alacak (Borçlar)</p>
          <strong className="text-2xl sm:text-3xl font-black text-rose-600 mt-1 block font-heading">{formatCurrency(totalDebt || 348750)}</strong>
          <span className="text-[11px] text-[#98a39f] mt-1 block font-medium">Geciken ödemeler</span>
        </div>
      </section>

      {/* ===================== CASH & BANK BALANCES CARDS ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Banka Hesapları */}
        <div className="bg-gradient-to-br from-[#0c1c1b] via-[#142d2a] to-[#0c1a19] text-white rounded-3xl p-6 shadow-md border border-[#214742] flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#a8d3aa] block">BANKA HESAPLARI</span>
            <h4 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">{formatCurrency(totalBank)}</h4>
            <p className="text-xs text-slate-300 font-medium">Garanti BBVA & Ziraat Bankası</p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15 relative z-10">
            <Landmark size={24} className="text-[#b8edb7]" />
          </div>
        </div>

        {/* Site Yönetim Kasası */}
        <div className="bg-gradient-to-br from-[#12302a] via-[#18423a] to-[#122e28] text-white rounded-3xl p-6 shadow-md border border-[#27594f] flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#a8d3aa] block">SİTE YÖNETİM KASASI</span>
            <h4 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">{formatCurrency(totalCash)}</h4>
            <p className="text-xs text-slate-300 font-medium">Nakit ofis kasası</p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15 relative z-10">
            <Wallet size={24} className="text-[#b8edb7]" />
          </div>
        </div>

        {/* Açık Talepler & Arızalar */}
        <div className="bg-white border border-[#e2eae3] rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#7c8a87] block">AÇIK TALEPLER & ARIZALAR</span>
            <h4 className="text-2xl sm:text-3xl font-black text-[#172b2b] font-heading tracking-tight">{openRequests} Açık Talep</h4>
            <button
              onClick={() => onNavigate("Talep & Arızalar")}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 cursor-pointer"
            >
              Talepleri Yönet <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/80">
            <Wrench size={24} />
          </div>
        </div>
      </div>

      {/* ===================== MAIN CONTENT GRID: PERFORMANCE CHART + QUICK ACTIONS ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Financial Rhythm & Collection Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#e2eae3] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black tracking-widest text-[#94a19d] uppercase">TAHSİLAT PERFORMANSI</p>
              <h3 className="text-lg font-bold text-[#172b2b] font-heading">Aylık Finansal Akış & Tahsilat Ritmi</h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Tahsilat
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Tahakkuk Hedefi
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-3 pt-1">
            <strong className="text-3xl font-black text-[#172b2b] tracking-tight font-heading">{formatCurrency(totalCollections)}</strong>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <TrendingUp size={14} /> +%8,4 artış
            </span>
            <span className="text-xs text-[#a1ada8] ml-auto font-medium">Son 6 ay performansı</span>
          </div>

          {/* SVG Line & Bar Chart */}
          <div className="pt-2">
            <div className="h-44 w-full relative">
              <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Grid lines */}
                <line x1="0" y1="30" x2="600" y2="30" stroke="#f0f4f1" strokeDasharray="3 3" />
                <line x1="0" y1="75" x2="600" y2="75" stroke="#f0f4f1" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="#f0f4f1" strokeDasharray="3 3" />
                <line x1="0" y1="165" x2="600" y2="165" stroke="#e4eae3" />

                {/* Area Fill */}
                <path
                  d="M 0,140 Q 60,130 120,110 T 240,95 T 360,70 T 480,50 T 600,25 L 600,165 L 0,165 Z"
                  fill="url(#chartGrad)"
                />
                {/* Line */}
                <path
                  d="M 0,140 Q 60,130 120,110 T 240,95 T 360,70 T 480,50 T 600,25"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Points */}
                <circle cx="120" cy="110" r="4.5" fill="#172b2b" stroke="#b8edb7" strokeWidth="2.5" />
                <circle cx="240" cy="95" r="4.5" fill="#172b2b" stroke="#b8edb7" strokeWidth="2.5" />
                <circle cx="360" cy="70" r="4.5" fill="#172b2b" stroke="#b8edb7" strokeWidth="2.5" />
                <circle cx="480" cy="50" r="4.5" fill="#172b2b" stroke="#b8edb7" strokeWidth="2.5" />
                <circle cx="600" cy="25" r="6" fill="#172b2b" stroke="#059669" strokeWidth="3" />
              </svg>
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-[#8a9893] mt-2 px-1">
              <span>Nisan (₺210K)</span>
              <span>Mayıs (₺235K)</span>
              <span>Haziran (₺250K)</span>
              <span>Temmuz (₺275K)</span>
              <span>Ağustos (₺292K)</span>
              <span className="text-emerald-800 font-bold">Eylül (₺270K+)</span>
            </div>
          </div>

          <div className="border-t border-[#f0f4f1] pt-3 flex items-center justify-between text-xs text-[#7c8a87]">
            <span><strong>%{collectionRate}</strong> gerçekleşen tahsilat</span>
            <span><strong>{formatCurrency(totalDebt)}</strong> tahsil bekleyen borç</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Hedef üzerinde
            </span>
          </div>
        </div>

        {/* Right: Quick Launch & Hub (1 col) */}
        <div className="bg-[#edf4ee] border border-[#dce8dd] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black tracking-widest text-[#7f8f89] uppercase">HIZLI İŞLEMLER</p>
                <h3 className="text-base font-bold text-[#172b2b] font-heading">Sık Kullanılan Menüler</h3>
              </div>
              <Blocks size={20} className="text-[#8e9f98]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onOpenBatchTahakkuk}
                className="bg-white hover:bg-white border border-[#e2ebe1] hover:border-emerald-300 hover:shadow-md p-3.5 rounded-2xl text-left transition-all flex flex-col gap-2 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-[#d5f1d2] text-[#4f9c5a] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ReceiptText size={18} />
                </div>
                <div>
                  <strong className="text-xs text-[#172b2b] block group-hover:text-emerald-800 font-bold">Aidat Tahakkuku</strong>
                  <span className="text-[10px] text-[#7a8a84]">Toplu borçlandır</span>
                </div>
              </button>

              <button
                onClick={onOpenCollection}
                className="bg-white hover:bg-white border border-[#e2ebe1] hover:border-sky-300 hover:shadow-md p-3.5 rounded-2xl text-left transition-all flex flex-col gap-2 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-[#d6eaf3] text-[#518da7] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <HandCoins size={18} />
                </div>
                <div>
                  <strong className="text-xs text-[#172b2b] block group-hover:text-sky-800 font-bold">Tahsilat Kaydet</strong>
                  <span className="text-[10px] text-[#7a8a84]">Makbuz oluştur</span>
                </div>
              </button>

              <button
                onClick={onOpenAnnouncement}
                className="bg-white hover:bg-white border border-[#e2ebe1] hover:border-rose-300 hover:shadow-md p-3.5 rounded-2xl text-left transition-all flex flex-col gap-2 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-[#ffddd4] text-[#ad6b5d] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Bell size={18} />
                </div>
                <div>
                  <strong className="text-xs text-[#172b2b] block group-hover:text-rose-800 font-bold">Duyuru Yayınla</strong>
                  <span className="text-[10px] text-[#7a8a84]">Sakine ilet</span>
                </div>
              </button>

              <button
                onClick={() => onNavigate("Raporlar")}
                className="bg-white hover:bg-white border border-[#e2ebe1] hover:border-amber-300 hover:shadow-md p-3.5 rounded-2xl text-left transition-all flex flex-col gap-2 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-[#f8e9b8] text-[#a4812c] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <strong className="text-xs text-[#172b2b] block group-hover:text-amber-800 font-bold">Mali Raporlar</strong>
                  <span className="text-[10px] text-[#7a8a84]">Excel & PDF</span>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#dce7da] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#d9f3d7] text-[#5caa63] flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={19} />
            </div>
            <div className="text-xs">
              <strong className="text-[#172b2b] block font-bold">Tüm Muhasebe Kayıtları Korumada</strong>
              <p className="text-[11px] text-[#7d8f86] leading-snug">Denetim iziyle her işlem güvenle kayıt altında.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== BOTTOM GRID: RECENT ACTIVITY + MAINTENANCE CALENDAR ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#e2eae3] rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-black tracking-widest text-[#94a19d] uppercase">SON İŞLEMLER</p>
              <h3 className="text-base font-bold text-[#172b2b] font-heading">Finansal Tahsilat ve Hareketler</h3>
            </div>
            <button
              onClick={() => onNavigate("Tahsilatlar")}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition cursor-pointer"
            >
              Tümünü Gör <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="divide-y divide-[#f0f4f1]">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-900 font-black text-xs flex items-center justify-center flex-shrink-0 border border-emerald-200">
                    {act.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <strong className="text-xs text-[#172b2b] block font-bold">{act.name}</strong>
                    <span className="text-[11px] text-[#869691]">{act.detail} · Makbuz: <span className="font-mono text-slate-600">{act.receiptNo}</span></span>
                  </div>
                </div>

                <div className="text-right">
                  <strong className="text-xs font-bold text-emerald-700 block">{act.amount}</strong>
                  <span className="text-[10px] text-[#aab4b0]">{act.date} {act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance & Asset Calendar (1 col) */}
        <div className="bg-white border border-[#e2eae3] rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-black tracking-widest text-[#94a19d] uppercase">OPERASYONEL TAKVİM</p>
              <h3 className="text-base font-bold text-[#172b2b] font-heading">Yaklaşan Bakımlar</h3>
            </div>
            <button
              onClick={() => onNavigate("Teknik Bakım")}
              className="w-8 h-8 rounded-xl border border-[#e4eae3] hover:bg-slate-50 flex items-center justify-center text-emerald-800 transition cursor-pointer"
            >
              <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="space-y-3">
            {activeSiteAssets.map((asset) => (
              <div key={asset.id} className="flex items-center gap-3 p-3 rounded-2xl border border-[#f0f4f1] hover:bg-[#fbfdfb] transition">
                <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-center font-heading ${
                  asset.status === "BAKIM_GEREKIYOR" ? "bg-amber-100 text-amber-900 border border-amber-200" : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                }`}>
                  <strong className="text-sm font-black leading-none">{asset.nextMaintenanceDate.split("-")[2]}</strong>
                  <span className="text-[8px] uppercase mt-0.5 font-bold">EYL</span>
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="text-xs font-bold text-[#172b2b] block truncate">{asset.name}</strong>
                  <span className="text-[10px] text-[#87928e] block truncate">{asset.serviceVendorName}</span>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  asset.status === "BAKIM_GEREKIYOR" ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                }`}>
                  {asset.status === "BAKIM_GEREKIYOR" ? "Gerekiyor" : "Planlandı"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
