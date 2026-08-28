import React, { useState } from "react";
import {
  Building2, ReceiptText, Gauge, Wallet, ArrowUpRight, ArrowDownRight,
  Blocks, ShieldCheck, Search, Bell, Wrench, Plus, CalendarDays,
  FileCheck2, HandCoins, CreditCard, Sparkles, Filter, ChevronRight,
  TrendingUp, AlertTriangle, CheckCircle2, Clock
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
      {/* Site Info Banner & Role Status */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#d9f2d1] text-[#39704c] flex items-center justify-center font-bold text-xl">
            <Building2 size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">{activeSite.name}</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {activeSite.city} / {activeSite.district}
              </span>
            </div>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              {activeSite.totalBlocks} Blok · {totalUnits} Bağımsız Bölüm · Yönetici: <strong>{activeSite.managerName}</strong> ({activeSite.managerPhone})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenBatchTahakkuk}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#172b2b] text-white text-xs font-semibold hover:bg-[#294342] shadow-sm transition"
          >
            <Plus size={15} /> Toplu Tahakkuk
          </button>
          <button
            onClick={onOpenCollection}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition"
          >
            <HandCoins size={15} /> Tahsilat Gir
          </button>
          <button
            onClick={onOpenExpense}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e4eae3] text-[#294342] text-xs font-semibold hover:bg-slate-50 transition"
          >
            <ArrowUpRight size={15} /> Gider Kaydet
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#e4eae3] rounded-2xl p-4.5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building2 size={18} />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ArrowUpRight size={13} /> {activeSite.totalBlocks} Blok
            </span>
          </div>
          <p className="text-xs text-[#788581] font-medium">Toplam Daire</p>
          <strong className="text-2xl font-bold text-[#172b2b] mt-0.5 block">{totalUnits}</strong>
          <span className="text-[11px] text-[#a0aaa6] mt-1 block">Aktif bağımsız bölüm</span>
        </div>

        <div className="bg-white border border-[#e4eae3] rounded-2xl p-4.5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ReceiptText size={18} />
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              Eylül 2026
            </span>
          </div>
          <p className="text-xs text-[#788581] font-medium">Bu Ay Tahakkuk</p>
          <strong className="text-2xl font-bold text-[#172b2b] mt-0.5 block">{formatCurrency(currentMonthTahakkuk || 300000)}</strong>
          <span className="text-[11px] text-[#a0aaa6] mt-1 block">Tüm bağımsız bölümler</span>
        </div>

        <div className="bg-white border border-[#e4eae3] rounded-2xl p-4.5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Gauge size={18} />
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              Hedef: %90
            </span>
          </div>
          <p className="text-xs text-[#788581] font-medium">Tahsilat Oranı</p>
          <strong className="text-2xl font-bold text-[#172b2b] mt-0.5 block">%{collectionRate}</strong>
          <span className="text-[11px] text-[#a0aaa6] mt-1 block">{formatCurrency(totalCollections)} tahsil edildi</span>
        </div>

        <div className="bg-white border border-[#e4eae3] rounded-2xl p-4.5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <Wallet size={18} />
            </div>
            <button
              onClick={() => onNavigate("Borçlular")}
              className="text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1 transition"
            >
              Listele <ChevronRight size={12} />
            </button>
          </div>
          <p className="text-xs text-[#788581] font-medium">Toplam Alacak (Borçlar)</p>
          <strong className="text-2xl font-bold text-rose-600 mt-0.5 block">{formatCurrency(totalDebt || 348750)}</strong>
          <span className="text-[11px] text-[#a0aaa6] mt-1 block">Geciken ödemeler</span>
        </div>
      </section>

      {/* Cash & Bank Balances Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="bg-gradient-to-br from-[#172b2b] to-[#254240] text-white rounded-2xl p-4.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#a8d3aa]">BANKA HESAPLARI</span>
            <h4 className="text-2xl font-bold mt-1">{formatCurrency(totalBank)}</h4>
            <p className="text-xs text-slate-300 mt-0.5">Garanti BBVA & Ziraat Bankası</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
            <CreditCard size={22} className="text-[#b8edb7]" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1b3d36] to-[#28574c] text-white rounded-2xl p-4.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#a8d3aa]">SİTE YÖNETİM KASASI</span>
            <h4 className="text-2xl font-bold mt-1">{formatCurrency(totalCash)}</h4>
            <p className="text-xs text-slate-300 mt-0.5">Nakit ofis kasası</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
            <Wallet size={22} className="text-[#b8edb7]" />
          </div>
        </div>

        <div className="bg-white border border-[#e4eae3] rounded-2xl p-4.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7c8a87]">AÇIK TALEPLER & ARIZALAR</span>
            <h4 className="text-2xl font-bold text-[#172b2b] mt-1">{openRequests} Açık Talep</h4>
            <button
              onClick={() => onNavigate("Talep & Arızalar")}
              className="text-xs font-semibold text-emerald-700 hover:underline mt-0.5 inline-flex items-center gap-1"
            >
              Talepleri Yönet <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Wrench size={22} />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Performance Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Financial Rhythm & Collection Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-[#94a19d] uppercase">TAHSİLAT PERFORMANSI</p>
              <h3 className="text-lg font-bold text-[#172b2b]">Aylık Finansal Akış & Tahsilat Ritmi</h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-[#59a363] font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#59a363]" /> Tahsilat
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Tahakkuk Hedefi
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <strong className="text-3xl font-extrabold text-[#172b2b] tracking-tight">{formatCurrency(totalCollections)}</strong>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 flex items-center gap-1">
              <TrendingUp size={14} /> +%8,4 artış
            </span>
            <span className="text-xs text-[#a1ada8] ml-auto">Son 6 ay performansı</span>
          </div>

          {/* SVG Line & Bar Chart */}
          <div className="mt-4 pt-2">
            <div className="h-44 w-full relative">
              <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b8edb7" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#b8edb7" stopOpacity="0.0" />
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
                  stroke="#5eaa71"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Points */}
                <circle cx="120" cy="110" r="4.5" fill="#172b2b" stroke="#b8edb7" strokeWidth="2.5" />
                <circle cx="240" cy="95" r="4.5" fill="#172b2b" stroke="#b8edb7" strokeWidth="2.5" />
                <circle cx="360" cy="70" r="4.5" fill="#172b2b" stroke="#b8edb7" strokeWidth="2.5" />
                <circle cx="480" cy="50" r="4.5" fill="#172b2b" stroke="#b8edb7" strokeWidth="2.5" />
                <circle cx="600" cy="25" r="6" fill="#172b2b" stroke="#5eaa71" strokeWidth="3" />
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

          <div className="border-t border-[#f0f4f1] mt-4 pt-3 flex items-center justify-between text-xs text-[#7c8a87]">
            <span><strong>%{collectionRate}</strong> gerçekleşen tahsilat</span>
            <span><strong>{formatCurrency(totalDebt)}</strong> tahsil bekleyen borç</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Hedef üzerinde
            </span>
          </div>
        </div>

        {/* Right: Quick Launch & Hub (1 col) */}
        <div className="bg-[#edf3eb] border border-[#e4ede2] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-[#7f8f89] uppercase">HIZLI İŞLEMLER</p>
                <h3 className="text-base font-bold text-[#172b2b]">Sık Kullanılan Menüler</h3>
              </div>
              <Blocks size={20} className="text-[#8e9f98]" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onOpenBatchTahakkuk}
                className="bg-white/80 hover:bg-white border border-[#e2ebe1] hover:shadow-md p-3 rounded-xl text-left transition flex flex-col gap-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#d5f1d2] text-[#4f9c5a] flex items-center justify-center">
                  <ReceiptText size={17} />
                </div>
                <div>
                  <strong className="text-xs text-[#172b2b] block group-hover:text-emerald-800">Aidat Tahakkuku</strong>
                  <span className="text-[10px] text-[#7a8a84]">Toplu borçlandır</span>
                </div>
              </button>

              <button
                onClick={onOpenCollection}
                className="bg-white/80 hover:bg-white border border-[#e2ebe1] hover:shadow-md p-3 rounded-xl text-left transition flex flex-col gap-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#d6eaf3] text-[#518da7] flex items-center justify-center">
                  <HandCoins size={17} />
                </div>
                <div>
                  <strong className="text-xs text-[#172b2b] block group-hover:text-sky-800">Tahsilat Kaydet</strong>
                  <span className="text-[10px] text-[#7a8a84]">Makbuz oluştur</span>
                </div>
              </button>

              <button
                onClick={onOpenAnnouncement}
                className="bg-white/80 hover:bg-white border border-[#e2ebe1] hover:shadow-md p-3 rounded-xl text-left transition flex flex-col gap-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#ffddd4] text-[#ad6b5d] flex items-center justify-center">
                  <Bell size={17} />
                </div>
                <div>
                  <strong className="text-xs text-[#172b2b] block group-hover:text-rose-800">Duyuru Yayınla</strong>
                  <span className="text-[10px] text-[#7a8a84]">Sakine ilet</span>
                </div>
              </button>

              <button
                onClick={() => onNavigate("Raporlar")}
                className="bg-white/80 hover:bg-white border border-[#e2ebe1] hover:shadow-md p-3 rounded-xl text-left transition flex flex-col gap-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#f8e9b8] text-[#a4812c] flex items-center justify-center">
                  <TrendingUp size={17} />
                </div>
                <div>
                  <strong className="text-xs text-[#172b2b] block group-hover:text-amber-800">Mali Raporlar</strong>
                  <span className="text-[10px] text-[#7a8a84]">Excel & PDF</span>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-[#dce7da] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#d9f3d7] text-[#69a96f] flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="text-xs">
              <strong className="text-[#172b2b] block font-semibold">Tüm Muhasebe Kayıtları Korumada</strong>
              <p className="text-[11px] text-[#87978e] leading-snug">Denetim iziyle her işlem kayıt altına alınıyor.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Activity + Maintenance Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-[#94a19d] uppercase">SON İŞLEMLER</p>
              <h3 className="text-base font-bold text-[#172b2b]">Finansal Tahsilat ve Hareketler</h3>
            </div>
            <button
              onClick={() => onNavigate("Tahsilatlar")}
              className="text-xs font-bold text-emerald-700 hover:text-[#172b2b] flex items-center gap-1 transition"
            >
              Tümünü Gör <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="divide-y divide-[#f0f4f1]">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#c1edc4] text-[#39704c] font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {act.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <strong className="text-xs text-[#172b2b] block font-bold">{act.name}</strong>
                    <span className="text-[11px] text-[#9aa6a1]">{act.detail} · Makbuz: {act.receiptNo}</span>
                  </div>
                </div>

                <div className="text-right">
                  <strong className="text-xs font-bold text-[#559e65] block">{act.amount}</strong>
                  <span className="text-[10px] text-[#aab4b0]">{act.date} {act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance & Asset Calendar (1 col) */}
        <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-[#94a19d] uppercase">OPERASYONEL TAKVİM</p>
              <h3 className="text-base font-bold text-[#172b2b]">Yaklaşan Bakımlar</h3>
            </div>
            <button
              onClick={() => onNavigate("Teknik Bakım")}
              className="w-7 h-7 rounded-full border border-[#e4eae3] hover:bg-slate-50 flex items-center justify-center text-emerald-800 transition"
            >
              <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="space-y-3">
            {activeSiteAssets.map((asset) => (
              <div key={asset.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-[#f0f4f1] hover:bg-[#fbfdfb] transition">
                <div className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center flex-shrink-0 text-center ${
                  asset.status === "BAKIM_GEREKIYOR" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                }`}>
                  <strong className="text-sm font-extrabold leading-none">{asset.nextMaintenanceDate.split("-")[2]}</strong>
                  <span className="text-[8px] uppercase mt-0.5">EYL</span>
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="text-xs font-bold text-[#172b2b] block truncate">{asset.name}</strong>
                  <span className="text-[10px] text-[#87928e] block truncate">{asset.serviceVendorName}</span>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  asset.status === "BAKIM_GEREKIYOR" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
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
