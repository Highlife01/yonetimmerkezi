import React, { useState } from "react";
import {
  Building2, ReceiptText, Gauge, Wallet, ArrowUpRight, ArrowDownRight,
  Blocks, ShieldCheck, Bell, Wrench, Plus, HandCoins,
  ChevronRight, TrendingUp, Landmark
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatDate } from "@/utils/formatters";

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
    activeSiteRequests, activeSiteAssets, activeSiteStaff
  } = useApp();
  const { currentUser } = useAuth();

  // KPIs
  const totalUnits = activeSiteUnits.length || activeSite.totalUnits;
  const currentMonthTahakkuk = activeSiteTahakkuklar.reduce((sum, t) => sum + (t.status === "ACTIVE" ? t.totalTargetAmount : 0), 0);
  const totalCollections = activeSiteCollections.reduce((sum, c) => sum + c.amount, 0);
  const totalDebt = activeSiteUnits.reduce((sum, u) => sum + (u.currentBalance > 0 ? u.currentBalance : 0), 0);
  const totalCash = activeSiteAccounts.filter(a => a.type === "KASA").reduce((sum, a) => sum + a.balance, 0);
  const totalBank = activeSiteAccounts.filter(a => a.type === "BANKA").reduce((sum, a) => sum + a.balance, 0);
  const openRequests = activeSiteRequests.filter(r => r.status !== "TAMAMLANDI").length;
  const collectionRate = currentMonthTahakkuk > 0 ? Math.min(100, Math.round((totalCollections / currentMonthTahakkuk) * 100 * 10) / 10) : 89.9;

  // Recent activities
  const recentActivities = activeSiteCollections.slice(0, 5).map(c => ({
    id: c.id,
    name: c.personName,
    detail: c.unitName,
    amount: `+ ${formatCurrency(c.amount)}`,
    date: c.paymentDate.split(" ")[0] || "",
    time: c.paymentDate.split(" ")[1] || "09:30",
    receiptNo: c.receiptNumber,
  }));

  // ---- Blok karnesi (Yoneticim: Site/Details) ----
  const blockStats = Array.from(new Set(activeSiteUnits.map(u => u.blockName))).map(blockName => {
    const units = activeSiteUnits.filter(u => u.blockName === blockName);
    const debt = units.reduce((s, u) => s + (u.currentBalance > 0 ? u.currentBalance : 0), 0);
    const debtors = units.filter(u => u.currentBalance > 0).length;
    const blockUnitIds = new Set(units.map(u => u.id));
    const paid = activeSiteCollections
      .filter(c => blockUnitIds.has(c.unitId))
      .reduce((s, c) => s + c.amount, 0);
    return { blockName, unitCount: units.length, debtors, debt, paid };
  });

  // ---- Kiracı / Malik / Boş dağılımı (apartman-yonetim-sistemi: dashboard) ----
  const occupancy = {
    owner: activeSiteUnits.filter(u => u.residentType === "MALIK_OTURUYOR").length,
    tenant: activeSiteUnits.filter(u => u.residentType === "KIRACI_OTURUYOR").length,
    empty: activeSiteUnits.filter(u => u.residentType === "BOS").length,
  };
  const tenantDebt = activeSiteUnits.reduce((s, u) => s + Math.max(0, u.tenantBalance ?? 0), 0);
  const ownerDebt = activeSiteUnits.reduce((s, u) => s + Math.max(0, u.ownerBalance ?? 0), 0);
  const occupancyTotal = Math.max(1, occupancy.owner + occupancy.tenant + occupancy.empty);

  // ---- Net durum (Kar / Zarar) ----
  const totalExpenses = activeSiteExpenses.reduce((s, e) => s + e.amount, 0);
  const netResult = totalCollections - totalExpenses;

  // ---- Personel dağılımı ----
  const activeStaff = activeSiteStaff.filter(s => s.status !== "AYRILDI");
  const staffByRole = activeStaff.reduce<Record<string, number>>((acc, s) => {
    acc[s.roleTitle] = (acc[s.roleTitle] || 0) + 1;
    return acc;
  }, {});
  const monthlyPayroll = activeStaff.reduce((s, m) => s + m.salary, 0);

  return (
    <div className="space-y-6">
      {/* ===================== HEADER: Site + Quick Actions ===================== */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#172b2b] tracking-tight font-heading">
            Merhaba, {currentUser.name.split(" ")[0]} 👋
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {activeSite.name} · {activeSite.totalBlocks} Blok · {totalUnits} Daire · Yönetici: {activeSite.managerName}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenBatchTahakkuk}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
          >
            <Plus size={15} /> Toplu Borçlandır
          </button>
          <button
            onClick={onOpenCollection}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#172b2b] text-xs font-bold transition cursor-pointer"
          >
            <HandCoins size={15} className="text-emerald-600" /> Tahsilat Gir
          </button>
          <button
            onClick={onOpenExpense}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#172b2b] text-xs font-bold transition cursor-pointer"
          >
            <ArrowUpRight size={15} className="text-slate-500" /> Gider Kaydet
          </button>
        </div>
      </div>

      {/* ===================== 4 KPI CARDS (Sade) ===================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toplam Daire */}
        <button
          onClick={() => onNavigate("UNITS")}
          className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-emerald-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 font-bold">Toplam Daire</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 size={18} />
            </div>
          </div>
          <strong className="text-3xl font-black text-[#172b2b] font-heading tracking-tight">{totalUnits}</strong>
          <p className="text-[11px] text-slate-400 mt-1.5 font-semibold">{activeSite.totalBlocks} blok aktif</p>
        </button>

        {/* Bu Ay Tahakkuk */}
        <button
          onClick={() => onNavigate("DUES_TAHAKKUK")}
          className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-sky-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 font-bold">Bu Ay Tahakkuk</span>
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <ReceiptText size={18} />
            </div>
          </div>
          <strong className="text-3xl font-black text-[#172b2b] font-heading tracking-tight">
            {formatCurrency(currentMonthTahakkuk)}
          </strong>
          <p className="text-[11px] text-slate-400 mt-1.5 font-semibold">KMK 20. madde paylaşımı</p>
        </button>

        {/* Tahsilat Oranı */}
        <button
          onClick={() => onNavigate("COLLECTIONS")}
          className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-teal-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 font-bold">Tahsilat Oranı</span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Gauge size={18} />
            </div>
          </div>
          <strong className="text-3xl font-black text-emerald-700 font-heading tracking-tight">%{collectionRate}</strong>
          <p className="text-[11px] text-slate-400 mt-1.5 font-semibold">{formatCurrency(totalCollections)} tahsil edildi</p>
        </button>

        {/* Toplam Alacak */}
        <button
          onClick={() => onNavigate("DEBTORS_AGING")}
          className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-rose-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 font-bold">Toplam Alacak</span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Wallet size={18} />
            </div>
          </div>
          <strong className="text-3xl font-black text-rose-600 font-heading tracking-tight">
            {formatCurrency(totalDebt)}
          </strong>
          <p className="text-[11px] text-slate-400 mt-1.5 font-semibold">Geciken aidat · %5 KMK faizi</p>
        </button>
      </section>

      {/* ===================== 3 HORIZONTAL STAT CARDS (Sade) ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate("CASH_BANK")}
          className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-emerald-300 transition cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Landmark size={18} />
            </div>
            <span className="text-xs text-slate-500 font-bold">Banka Hesapları</span>
          </div>
          <strong className="text-2xl font-black text-[#172b2b] font-heading">{formatCurrency(totalBank)}</strong>
          <p className="text-[11px] text-slate-400 mt-1 font-semibold">Hesap hareketlerini gör →</p>
        </button>

        <button
          onClick={() => onNavigate("CASH_BANK")}
          className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-emerald-300 transition cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Wallet size={18} />
            </div>
            <span className="text-xs text-slate-500 font-bold">Nakit Kasa</span>
          </div>
          <strong className="text-2xl font-black text-[#172b2b] font-heading">{formatCurrency(totalCash)}</strong>
          <p className="text-[11px] text-slate-400 mt-1 font-semibold">Kasa defterini aç →</p>
        </button>

        <button
          onClick={() => onNavigate("REQUESTS")}
          className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-amber-300 transition cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wrench size={18} />
            </div>
            <span className="text-xs text-slate-500 font-bold">Açık Talepler</span>
          </div>
          <strong className="text-2xl font-black text-[#172b2b] font-heading">{openRequests} Talep</strong>
          <p className="text-[11px] text-slate-400 mt-1 font-semibold">Talepleri yönet →</p>
        </button>
      </div>

      {/* ===================== CHART + QUICK ACTIONS ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-[#172b2b] font-heading">Tahsilat Performansı</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Son 6 ay</p>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Tahsilat
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Hedef
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-3 mb-4">
            <strong className="text-2xl font-black text-[#172b2b] font-heading">{formatCurrency(totalCollections)}</strong>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
              <TrendingUp size={12} /> %{collectionRate}
            </span>
          </div>

          <div className="h-44 w-full relative">
            <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradSimple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="30" x2="600" y2="30" stroke="#f1f5f1" strokeDasharray="4 4" />
              <line x1="0" y1="75" x2="600" y2="75" stroke="#f1f5f1" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f1" strokeDasharray="4 4" />
              <line x1="0" y1="165" x2="600" y2="165" stroke="#e2e8e2" />
              <path
                d="M 0,140 Q 60,130 120,110 T 240,95 T 360,70 T 480,50 T 600,25 L 600,165 L 0,165 Z"
                fill="url(#chartGradSimple)"
              />
              <path
                d="M 0,140 Q 60,130 120,110 T 240,95 T 360,70 T 480,50 T 600,25"
                fill="none"
                stroke="#059669"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 0,120 L 120,105 L 240,90 L 360,65 L 480,45 L 600,30"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2 px-1">
            <span>Nisan</span>
            <span>Mayıs</span>
            <span>Haziran</span>
            <span>Temmuz</span>
            <span>Ağustos</span>
            <span className="text-emerald-700 font-bold">Eylül</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#172b2b] font-heading mb-4">Hızlı İşlemler</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onOpenBatchTahakkuk}
                className="bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 p-3.5 rounded-xl text-left transition cursor-pointer"
              >
                <ReceiptText size={18} className="text-emerald-600 mb-2" />
                <strong className="text-xs text-[#172b2b] block font-bold">Aidat Tahakkuku</strong>
                <span className="text-[10px] text-slate-400">Toplu borçlandır</span>
              </button>

              <button
                onClick={onOpenCollection}
                className="bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200 p-3.5 rounded-xl text-left transition cursor-pointer"
              >
                <HandCoins size={18} className="text-sky-600 mb-2" />
                <strong className="text-xs text-[#172b2b] block font-bold">Tahsilat Kaydet</strong>
                <span className="text-[10px] text-slate-400">QR makbuz kes</span>
              </button>

              <button
                onClick={onOpenAnnouncement}
                className="bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 p-3.5 rounded-xl text-left transition cursor-pointer"
              >
                <Bell size={18} className="text-rose-500 mb-2" />
                <strong className="text-xs text-[#172b2b] block font-bold">Duyuru Yayınla</strong>
                <span className="text-[10px] text-slate-400">Sakinlere ilet</span>
              </button>

              <button
                onClick={() => onNavigate("REPORTS")}
                className="bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 p-3.5 rounded-xl text-left transition cursor-pointer"
              >
                <TrendingUp size={18} className="text-amber-600 mb-2" />
                <strong className="text-xs text-[#172b2b] block font-bold">Mali Raporlar</strong>
                <span className="text-[10px] text-slate-400">Excel & PDF</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2.5">
            <ShieldCheck size={17} className="text-emerald-600 flex-shrink-0" />
            <p className="text-[11px] text-slate-500 font-medium leading-snug">
              <strong className="text-[#172b2b]">KMK uyumlu.</strong> Tüm işlemler denetim izinde kayıtlı.
            </p>
          </div>
        </div>
      </div>

      {/* ===================== RECENT + MAINTENANCE ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent transactions */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#172b2b] font-heading">Son İşlemler</h3>
            <button
              onClick={() => onNavigate("COLLECTIONS")}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition cursor-pointer"
            >
              Tümünü Gör <ChevronRight size={14} />
            </button>
          </div>

          <div className="divide-y divide-slate-50">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 font-black text-xs flex items-center justify-center flex-shrink-0">
                    {act.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <strong className="text-xs text-[#172b2b] block font-bold">{act.name}</strong>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span>{act.detail}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono">{act.receiptNo}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <strong className="text-sm font-black text-emerald-700 block font-heading">{act.amount}</strong>
                  <span className="text-[10px] text-slate-400">{act.date} {act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance calendar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#172b2b] font-heading">Yaklaşan Bakımlar</h3>
            <button
              onClick={() => onNavigate("MAINTENANCE")}
              className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 transition cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="space-y-2.5">
            {activeSiteAssets.map((asset) => (
              <div key={asset.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition">
                <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${asset.status === "BAKIM_GEREKIYOR"
                    ? "bg-amber-50 text-amber-800"
                    : "bg-emerald-50 text-emerald-800"
                  }`}>
                  <strong className="text-sm font-black leading-none">{asset.nextMaintenanceDate.split("-")[2]}</strong>
                  <span className="text-[8px] uppercase mt-0.5 font-bold">Eyl</span>
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="text-xs font-bold text-[#172b2b] block truncate">{asset.name}</strong>
                  <span className="text-[10px] text-slate-400 block truncate">{asset.serviceVendorName}</span>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${asset.status === "BAKIM_GEREKIYOR"
                    ? "bg-amber-50 text-amber-800"
                    : "bg-emerald-50 text-emerald-800"
                  }`}>
                  {asset.status === "BAKIM_GEREKIYOR" ? "Gerekiyor" : "Planlandı"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===================== BLOK KARNESİ + NET DURUM ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Blok finansal karnesi */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#172b2b] font-heading">Blok Finansal Karnesi</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Blok bazında tahsilat ve ödenmeyen borç</p>
            </div>
            <button
              onClick={() => onNavigate("UNITS")}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition cursor-pointer"
            >
              Bloklar <ChevronRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-2 pr-3">Blok</th>
                  <th className="py-2 px-3 text-right">Daire</th>
                  <th className="py-2 px-3 text-right">Borçlu</th>
                  <th className="py-2 px-3 text-right">Ödenen Aidat</th>
                  <th className="py-2 pl-3 text-right">Ödenmeyen Borç</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {blockStats.map(b => (
                  <tr key={b.blockName} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-3 font-bold text-[#172b2b]">{b.blockName}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{b.unitCount}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{b.debtors}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{formatCurrency(b.paid)}</td>
                    <td className="py-2.5 pl-3 text-right font-bold text-rose-600">{formatCurrency(b.debt)}</td>
                  </tr>
                ))}
                {blockStats.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-slate-400">Henüz blok / daire tanımlanmadı.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Net durum */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#172b2b] font-heading mb-4">Net Durum (Kar / Zarar)</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500 font-semibold">Toplam Gelir (Tahsilat)</span><strong className="text-emerald-700">{formatCurrency(totalCollections)}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500 font-semibold">Toplam Gider</span><strong className="text-rose-600">{formatCurrency(totalExpenses)}</strong></div>
            </div>
          </div>
          <div className={`mt-4 p-3.5 rounded-xl flex items-center gap-2.5 ${netResult >= 0 ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
            {netResult >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
            <div>
              <span className="text-[10px] font-bold uppercase block">{netResult >= 0 ? "Net Fazla" : "Net Açık"}</span>
              <strong className="text-lg font-black font-heading">{formatCurrency(Math.abs(netResult))}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== DOLULUK / BORÇ SORUMLULUĞU + PERSONEL ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-base font-bold text-[#172b2b] font-heading mb-4">Doluluk & Borç Sorumluluğu</h3>
          <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 mb-3">
            <div className="bg-emerald-500" style={{ width: `${(occupancy.owner / occupancyTotal) * 100}%` }} />
            <div className="bg-sky-500" style={{ width: `${(occupancy.tenant / occupancyTotal) * 100}%` }} />
            <div className="bg-slate-300" style={{ width: `${(occupancy.empty / occupancyTotal) * 100}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs mb-4">
            <div><span className="flex items-center gap-1.5 text-slate-500 font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Malik Oturuyor</span><strong className="text-lg font-black font-heading">{occupancy.owner}</strong></div>
            <div><span className="flex items-center gap-1.5 text-slate-500 font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" />Kiracı Oturuyor</span><strong className="text-lg font-black font-heading">{occupancy.tenant}</strong></div>
            <div><span className="flex items-center gap-1.5 text-slate-500 font-semibold"><span className="w-2.5 h-2.5 rounded-full bg-slate-300" />Boş Daire</span><strong className="text-lg font-black font-heading">{occupancy.empty}</strong></div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
              <span className="text-[10px] font-bold uppercase text-sky-700 block">Kiracı Sorumluluğundaki Borç</span>
              <strong className="text-base font-black text-sky-900">{formatCurrency(tenantDebt)}</strong>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-[10px] font-bold uppercase text-amber-700 block">Kat Maliki Sorumluluğundaki Borç</span>
              <strong className="text-base font-black text-amber-900">{formatCurrency(ownerDebt)}</strong>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#172b2b] font-heading">Personel</h3>
            <button
              onClick={() => onNavigate("STAFF")}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition cursor-pointer"
            >
              Yönet <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2 text-xs">
            {Object.entries(staffByRole).map(([role, count]) => (
              <div key={role} className="flex justify-between"><span className="text-slate-600 font-semibold">{role}</span><strong>{count}</strong></div>
            ))}
            {activeStaff.length === 0 && <p className="text-slate-400">Kayıtlı personel yok.</p>}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500 font-semibold">Aylık Maaş Yükü</span>
            <strong className="text-[#172b2b]">{formatCurrency(monthlyPayroll)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
