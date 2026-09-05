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

  const todayFormatted = "5 Eylül 2026, Cumartesi";

  return (
    <div className="space-y-6">
      {/* ===================== SITE INFO BANNER ===================== */}
      <div className="glass-luxury rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden border border-[#e2eae3]">
        {/* Subtle decorative mesh */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-100/40 via-teal-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-50/50 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#172b2b] via-[#224441] to-[#122826] text-[#b8edb7] flex items-center justify-center font-black text-2xl shadow-md border border-[#2d5551] flex-shrink-0">
            <Building2 size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-black text-[#172b2b] tracking-tight font-heading">
                {activeSite.name}
              </h2>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                {activeSite.city} / {activeSite.district}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                KMK STANDARDI
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Canlı Bulut
              </span>
            </div>
            <p className="text-xs text-[#5e7773] mt-1.5 font-medium flex items-center gap-2 flex-wrap">
              <span>{activeSite.totalBlocks} Blok · {totalUnits} Bağımsız Bölüm</span>
              <span className="text-slate-300">•</span>
              <span>Yönetici: <strong className="text-[#172b2b]">{activeSite.managerName}</strong> ({activeSite.managerPhone})</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-mono text-[11px]">{todayFormatted}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap relative z-10 w-full lg:w-auto">
          <button
            onClick={onOpenBatchTahakkuk}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#172b2b] via-[#213f3d] to-[#172b2b] hover:from-[#213f3d] hover:to-[#2e5754] text-white text-xs font-black shadow-lg shadow-emerald-950/15 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-[#2d5250] glow-emerald"
          >
            <Plus size={16} className="text-[#b8edb7]" /> Toplu Borçlandır
          </button>
          <button
            onClick={onOpenCollection}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-md shadow-emerald-800/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <HandCoins size={16} /> Tahsilat Gir
          </button>
          <button
            onClick={onOpenExpense}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white border-2 border-[#d6e0d8] hover:border-slate-400 text-slate-800 text-xs font-bold transition shadow-2xs hover:bg-slate-50 cursor-pointer"
          >
            <ArrowUpRight size={16} className="text-slate-500" /> Gider Kaydet
          </button>
        </div>
      </div>

      {/* ===================== 4 EXECUTIVE KPI CARDS GRID ===================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Toplam Daire */}
        <div className="bg-white border-t-4 border-t-emerald-600 border border-[#e2eae3] rounded-3xl p-5 shadow-xs hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80 group-hover:scale-105 transition-transform shadow-2xs">
              <Building2 size={22} />
            </div>
            <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 shadow-2xs">
              <ArrowUpRight size={13} /> {activeSite.totalBlocks} Blok Aktif
            </span>
          </div>
          <p className="text-xs text-[#788581] font-bold uppercase tracking-wider">TOPLAM DAİRE SAYISI</p>
          <strong className="text-3xl sm:text-4xl font-black text-[#172b2b] mt-1.5 block font-heading tracking-tight">{totalUnits}</strong>
          <div className="mt-2.5 pt-2.5 border-t border-[#f0f4f1] flex items-center justify-between text-[11px] text-[#84928e]">
            <span>Aktif Bağımsız Bölüm</span>
            <span className="text-emerald-700 font-bold">%100 Doluluk</span>
          </div>
        </div>

        {/* Card 2: Bu Ay Tahakkuk */}
        <div className="bg-white border-t-4 border-t-sky-600 border border-[#e2eae3] rounded-3xl p-5 shadow-xs hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200/80 group-hover:scale-105 transition-transform shadow-2xs">
              <ReceiptText size={22} />
            </div>
            <span className="text-[11px] font-extrabold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 shadow-2xs">
              Eylül 2026
            </span>
          </div>
          <p className="text-xs text-[#788581] font-bold uppercase tracking-wider">BU AY TOPLAM TAHAKKUK</p>
          <strong className="text-3xl sm:text-4xl font-black text-[#172b2b] mt-1.5 block font-heading tracking-tight">
            {formatCurrency(currentMonthTahakkuk || 300000)}
          </strong>
          <div className="mt-2.5 pt-2.5 border-t border-[#f0f4f1] flex items-center justify-between text-[11px] text-[#84928e]">
            <span>KMK 20. Madde Paylaşımı</span>
            <span className="text-sky-700 font-bold">Eşit / Arsa Payı</span>
          </div>
        </div>

        {/* Card 3: Tahsilat Oranı */}
        <div className="bg-white border-t-4 border-t-teal-600 border border-[#e2eae3] rounded-3xl p-5 shadow-xs hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200/80 group-hover:scale-105 transition-transform shadow-2xs">
              <Gauge size={22} />
            </div>
            <span className="text-[11px] font-extrabold text-teal-900 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 shadow-2xs flex items-center gap-1">
              <TrendingUp size={13} /> Hedef: %90
            </span>
          </div>
          <p className="text-xs text-[#788581] font-bold uppercase tracking-wider">DÖNEM TAHSİLAT ORANI</p>
          <strong className="text-3xl sm:text-4xl font-black text-emerald-800 mt-1.5 block font-heading tracking-tight">
            %{collectionRate}
          </strong>
          <div className="mt-2.5 pt-2.5 border-t border-[#f0f4f1] flex items-center justify-between text-[11px] text-[#84928e]">
            <span>{formatCurrency(totalCollections)} tahsil edildi</span>
            <span className="text-emerald-700 font-bold">Hedef Üzerinde</span>
          </div>
        </div>

        {/* Card 4: Toplam Alacak (Borçlar) */}
        <div className="bg-white border-t-4 border-t-rose-600 border border-[#e2eae3] rounded-3xl p-5 shadow-xs hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200/80 group-hover:scale-105 transition-transform shadow-2xs">
              <Wallet size={22} />
            </div>
            <button
              onClick={() => onNavigate("DEBTORS_AGING")}
              className="text-[11px] font-extrabold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1 transition cursor-pointer shadow-2xs"
            >
              Borçluları Aç <ChevronRight size={12} />
            </button>
          </div>
          <p className="text-xs text-[#788581] font-bold uppercase tracking-wider">TOPLAM ALACAK (BORÇLAR)</p>
          <strong className="text-3xl sm:text-4xl font-black text-rose-600 mt-1.5 block font-heading tracking-tight">
            {formatCurrency(totalDebt || 348750)}
          </strong>
          <div className="mt-2.5 pt-2.5 border-t border-[#f0f4f1] flex items-center justify-between text-[11px] text-[#84928e]">
            <span>Geciken aidat ve avanslar</span>
            <span className="text-rose-700 font-bold">%5 KMK Faizi Devrede</span>
          </div>
        </div>
      </section>

      {/* ===================== CORPORATE BANK & CASH CARDS ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Banka Hesapları (Executive Platin Card) */}
        <div className="bg-gradient-to-br from-[#0c1c1b] via-[#142d2a] to-[#0a1716] text-white rounded-3xl p-6 shadow-xl border border-[#244f49] flex flex-col justify-between relative overflow-hidden group">
          {/* Card subtle shine */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#a8d3aa] block">
                  BANKA HESAPLARI (VADESİZ)
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15 text-[#b8edb7]">
                <Landmark size={20} />
              </div>
            </div>
            <p className="font-mono text-xs text-slate-300 tracking-wider">Garanti BBVA & Ziraat Bankası</p>
            <h4 className="text-3xl font-black font-heading tracking-tight mt-2 text-white">
              {formatCurrency(totalBank)}
            </h4>
          </div>

          <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span className="font-mono text-[10px] text-slate-400">TR92 •••• •••• 4012</span>
            <button
              onClick={() => onNavigate("CASH_BANK")}
              className="text-xs font-bold text-[#b8edb7] hover:text-white inline-flex items-center gap-1 cursor-pointer transition"
            >
              Hesap Hareketleri <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {/* Site Yönetim Nakit Kasası (Vault Card) */}
        <div className="bg-gradient-to-br from-[#12302a] via-[#1a443c] to-[#102924] text-white rounded-3xl p-6 shadow-xl border border-[#2b6155] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-44 h-44 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#a8d3aa] block">
                  SİTE YÖNETİM OFİS KASASI
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15 text-[#b8edb7]">
                <Wallet size={20} />
              </div>
            </div>
            <p className="text-xs text-slate-300 font-medium">Fiziki Nakit Bakiye (Elden Tahsilat)</p>
            <h4 className="text-3xl font-black font-heading tracking-tight mt-2 text-white">
              {formatCurrency(totalCash)}
            </h4>
          </div>

          <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span className="text-[10px] text-slate-400">Günlük Kasa Defteri Aktif</span>
            <button
              onClick={() => onNavigate("CASH_BANK")}
              className="text-xs font-bold text-[#b8edb7] hover:text-white inline-flex items-center gap-1 cursor-pointer transition"
            >
              Kasa Virmanı <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {/* Açık Talepler & Arızalar */}
        <div className="bg-white border border-[#e2eae3] rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#7c8a87] block">
                AÇIK TALEPLER & ARIZALAR
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <Wrench size={20} />
              </div>
            </div>
            <p className="text-xs text-[#6e7e7a] font-medium">Kat Sakini Servis & Arıza Bildirimleri</p>
            <h4 className="text-3xl font-black text-[#172b2b] font-heading tracking-tight mt-2">
              {openRequests} Açık Talep
            </h4>
          </div>

          <div className="mt-5 pt-3 border-t border-[#f0f4f1] flex items-center justify-between text-xs">
            <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              İnceleme Bekliyor
            </span>
            <button
              onClick={() => onNavigate("REQUESTS")}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 cursor-pointer"
            >
              Talepleri Yönet <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ===================== MAIN CONTENT GRID: PERFORMANCE CHART + QUICK ACTIONS ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Financial Rhythm & Collection Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#e2eae3] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-black tracking-widest text-[#94a19d] uppercase">TAHSİLAT PERFORMANSI</p>
              <h3 className="text-lg font-bold text-[#172b2b] font-heading">Aylık Finansal Akış & Tahsilat Ritmi</h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Tahsilat
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Tahakkuk Hedefi
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-3 pt-1">
            <strong className="text-3xl font-black text-[#172b2b] tracking-tight font-heading">
              {formatCurrency(totalCollections)}
            </strong>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <TrendingUp size={14} /> +%8,4 artış
            </span>
            <span className="text-xs text-[#a1ada8] ml-auto font-medium hidden sm:inline">Son 6 ay performansı</span>
          </div>

          {/* SVG Line & Area Chart */}
          <div className="pt-2">
            <div className="h-48 w-full relative">
              <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradLuxury" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Grid lines */}
                <line x1="0" y1="30" x2="600" y2="30" stroke="#f0f4f1" strokeDasharray="4 4" />
                <line x1="0" y1="75" x2="600" y2="75" stroke="#f0f4f1" strokeDasharray="4 4" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="#f0f4f1" strokeDasharray="4 4" />
                <line x1="0" y1="165" x2="600" y2="165" stroke="#e4eae3" />

                {/* Area Fill */}
                <path
                  d="M 0,140 Q 60,130 120,110 T 240,95 T 360,70 T 480,50 T 600,25 L 600,165 L 0,165 Z"
                  fill="url(#chartGradLuxury)"
                />
                {/* Line */}
                <path
                  d="M 0,140 Q 60,130 120,110 T 240,95 T 360,70 T 480,50 T 600,25"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Target line */}
                <path
                  d="M 0,120 L 120,105 L 240,90 L 360,65 L 480,45 L 600,30"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                {/* Points */}
                <circle cx="120" cy="110" r="4.5" fill="#172b2b" stroke="#b8edb7" strokeWidth="2.5" />
                <circle cx="240" cy="95" r="4.5" fill="#172b2b" stroke="#b8edb7" strokeWidth="2.5" />
                <circle cx="360" cy="70" r="4.5" fill="#172b2b" stroke="#b8edb7" strokeWidth="2.5" />
                <circle cx="480" cy="50" r="4.5" fill="#172b2b" stroke="#b8edb7" strokeWidth="2.5" />
                <circle cx="600" cy="25" r="6.5" fill="#172b2b" stroke="#10b981" strokeWidth="3" />
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

          <div className="border-t border-[#f0f4f1] pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#7c8a87]">
            <span><strong>%{collectionRate}</strong> gerçekleşen tahsilat</span>
            <span><strong>{formatCurrency(totalDebt)}</strong> tahsil bekleyen borç</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Hedef üzerinde
            </span>
          </div>
        </div>

        {/* Right: Quick Launch & Hub (1 col) */}
        <div className="glass-card rounded-3xl p-6 shadow-xs flex flex-col justify-between border border-[#dce8dd]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black tracking-widest text-[#7f8f89] uppercase">HIZLI İŞLEMLER</p>
                <h3 className="text-base font-bold text-[#172b2b] font-heading">Sık Kullanılan Menüler</h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <Blocks size={18} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onOpenBatchTahakkuk}
                className="bg-white hover:bg-emerald-50/50 border border-[#e2ebe1] hover:border-emerald-300 hover:shadow-md p-3.5 rounded-2xl text-left transition-all flex flex-col gap-2 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-[#d5f1d2] text-[#3e8648] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ReceiptText size={18} />
                </div>
                <div>
                  <strong className="text-xs text-[#172b2b] block group-hover:text-emerald-800 font-bold">Aidat Tahakkuku</strong>
                  <span className="text-[10px] text-[#7a8a84]">Toplu borçlandır</span>
                </div>
              </button>

              <button
                onClick={onOpenCollection}
                className="bg-white hover:bg-sky-50/50 border border-[#e2ebe1] hover:border-sky-300 hover:shadow-md p-3.5 rounded-2xl text-left transition-all flex flex-col gap-2 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-[#d6eaf3] text-[#427c96] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <HandCoins size={18} />
                </div>
                <div>
                  <strong className="text-xs text-[#172b2b] block group-hover:text-sky-800 font-bold">Tahsilat Kaydet</strong>
                  <span className="text-[10px] text-[#7a8a84]">QR Makbuz kes</span>
                </div>
              </button>

              <button
                onClick={onOpenAnnouncement}
                className="bg-white hover:bg-rose-50/50 border border-[#e2ebe1] hover:border-rose-300 hover:shadow-md p-3.5 rounded-2xl text-left transition-all flex flex-col gap-2 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-[#ffddd4] text-[#9c584a] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bell size={18} />
                </div>
                <div>
                  <strong className="text-xs text-[#172b2b] block group-hover:text-rose-800 font-bold">Duyuru Yayınla</strong>
                  <span className="text-[10px] text-[#7a8a84]">Sakine ilet</span>
                </div>
              </button>

              <button
                onClick={() => onNavigate("REPORTS")}
                className="bg-white hover:bg-amber-50/50 border border-[#e2ebe1] hover:border-amber-300 hover:shadow-md p-3.5 rounded-2xl text-left transition-all flex flex-col gap-2 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-[#f8e9b8] text-[#937122] flex items-center justify-center group-hover:scale-110 transition-transform">
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
            <div className="w-9 h-9 rounded-full bg-[#d9f3d7] text-[#4e9955] flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={19} />
            </div>
            <div className="text-xs">
              <strong className="text-[#172b2b] block font-bold">KMK & Denetim İzi Tam Korumalı</strong>
              <p className="text-[11px] text-[#7d8f86] leading-snug">Sistemdeki her işlem zaman damgasıyla kayıt altında.</p>
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
              onClick={() => onNavigate("COLLECTIONS")}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition cursor-pointer"
            >
              Tümünü Gör <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="divide-y divide-[#f0f4f1]">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-900 font-black text-xs flex items-center justify-center flex-shrink-0 border border-emerald-200">
                    {act.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <strong className="text-xs text-[#172b2b] block font-bold">{act.name}</strong>
                    <span className="text-[11px] text-[#869691] flex items-center gap-2">
                      <span>{act.detail}</span>
                      <span className="text-slate-300">•</span>
                      <span>Makbuz: <span className="font-mono text-slate-700 font-semibold">{act.receiptNo}</span></span>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <strong className="text-sm font-black text-emerald-700 block font-heading">{act.amount}</strong>
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
              onClick={() => onNavigate("MAINTENANCE")}
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
