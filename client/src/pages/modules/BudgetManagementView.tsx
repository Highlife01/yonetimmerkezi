import React, { useState } from "react";
import {
  PieChart, Plus, Download, CheckCircle2, TrendingUp,
  AlertCircle, ArrowUpRight, ArrowDownRight, Edit2, X
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { AnnualBudget } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import { exportToCSV } from "@/utils/exportUtils";
import { toast } from "sonner";

export default function BudgetManagementView() {
  const { activeSite, budget, updateBudgetItem } = useApp();
  const { hasPermission } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    category: "",
    type: "GIDER" as "GELIR" | "GIDER",
    plannedAnnual: 50000,
  });

  const totalPlannedIncome = budget.items.filter(i => i.type === "GELIR").reduce((sum, i) => sum + i.plannedAnnual, 0);
  const totalActualIncome = budget.items.filter(i => i.type === "GELIR").reduce((sum, i) => sum + i.actualAnnual, 0);

  const totalPlannedExpense = budget.items.filter(i => i.type === "GIDER").reduce((sum, i) => sum + i.plannedAnnual, 0);
  const totalActualExpense = budget.items.filter(i => i.type === "GIDER").reduce((sum, i) => sum + i.actualAnnual, 0);

  const netPlannedSurplus = totalPlannedIncome - totalPlannedExpense;
  const netActualSurplus = totalActualIncome - totalActualExpense;

  const handleExportCSV = () => {
    const headers = ["Tür", "Bütçe Kalemi", "Yıllık Planlanan Bütçe (TL)", "Gerçekleşen Tutar (TL)", "Fark / Sapma (TL)", "Gerçekleşme %"];
    const rows = budget.items.map(i => {
      const diff = i.actualAnnual - i.plannedAnnual;
      const rate = i.plannedAnnual > 0 ? Math.round((i.actualAnnual / i.plannedAnnual) * 100) : 0;
      return [
        i.type === "GELIR" ? "Gelir" : "Gider",
        i.category,
        i.plannedAnnual,
        i.actualAnnual,
        diff,
        `%${rate}`
      ];
    });
    exportToCSV(`${activeSite.name}_${budget.year}_Isletme_Projesi_Butcesi`, headers, rows);
    toast.success("Bütçe raporu Excel (CSV) olarak indirildi.");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">{budget.year} Yılı İşletme Projesi & Bütçe Yönetimi</h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Genel Kurul Onaylı
              </span>
            </div>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              Kat Mülkiyeti Kanunu (KMK Madde 37) uyarınca hazırlanan tahmini işletme bütçesi ve gerçekleşen sapma analizi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#e4eae3] text-[#294342] text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
            >
              <Download size={14} /> Bütçeyi Excel'e Aktar
            </button>
          </div>
        </div>

        {/* Budget vs Actual Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 border-t border-[#f0f4f1]">
          <div className="bg-[#f8faf7] p-4.5 rounded-2xl border border-[#e4eae3]">
            <span className="text-[10px] uppercase font-bold text-emerald-800">YILLIK GELİR BÜTÇESİ</span>
            <div className="flex items-baseline justify-between mt-1">
              <h4 className="text-xl font-bold text-[#172b2b]">{formatCurrency(totalPlannedIncome)}</h4>
              <span className="text-xs text-emerald-700 font-semibold">Gerçekleşen: {formatCurrency(totalActualIncome)}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.round((totalActualIncome / totalPlannedIncome) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              %{Math.round((totalActualIncome / totalPlannedIncome) * 100)} tahsilat oranı
            </span>
          </div>

          <div className="bg-[#f8faf7] p-4.5 rounded-2xl border border-[#e4eae3]">
            <span className="text-[10px] uppercase font-bold text-rose-800">YILLIK GİDER BÜTÇESİ</span>
            <div className="flex items-baseline justify-between mt-1">
              <h4 className="text-xl font-bold text-[#172b2b]">{formatCurrency(totalPlannedExpense)}</h4>
              <span className="text-xs text-rose-600 font-semibold">Harcama: {formatCurrency(totalActualExpense)}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.round((totalActualExpense / totalPlannedExpense) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Bütçenin %{Math.round((totalActualExpense / totalPlannedExpense) * 100)} kısmı harcandı
            </span>
          </div>

          <div className="bg-[#edf3eb] p-4.5 rounded-2xl border border-[#dce7da] flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7a8a84]">YIL SONU TAHMİNİ REZERV / FON</span>
              <h4 className="text-xl font-extrabold text-[#172b2b] mt-1">{formatCurrency(netPlannedSurplus)}</h4>
            </div>
            <div className="text-xs text-slate-600 mt-2">
              Mevcut Net Fark: <strong className="text-emerald-800 font-bold">{formatCurrency(netActualSurplus)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Items Table */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e4eae3]">
          <h3 className="text-base font-bold text-[#172b2b]">İşletme Projesi Kalemleri ve Sapma Analizi</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Tür</th>
                <th className="py-3 px-4">Bütçe Kalemi / Açıklama</th>
                <th className="py-3 px-4 text-right">Yıllık Planlanan Bütçe</th>
                <th className="py-3 px-4 text-right">Dönem İçi Gerçekleşen</th>
                <th className="py-3 px-4 text-right">Kalan / Sapma Tutarı</th>
                <th className="py-3 px-4 text-center">Gerçekleşme %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4f1]">
              {budget.items.map((item) => {
                const diff = item.actualAnnual - item.plannedAnnual;
                const percentage = item.plannedAnnual > 0 ? Math.round((item.actualAnnual / item.plannedAnnual) * 100) : 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.type === "GELIR" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                      }`}>
                        {item.type === "GELIR" ? "Gelir" : "Gider"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#172b2b]">
                      {item.category}
                      {item.notes && <span className="block text-[10px] text-slate-400 font-normal">{item.notes}</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#172b2b]">
                      {formatCurrency(item.plannedAnnual)}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-bold ${
                      item.type === "GELIR" ? "text-emerald-700" : "text-rose-600"
                    }`}>
                      {formatCurrency(item.actualAnnual)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-600">
                      {formatCurrency(Math.abs(item.plannedAnnual - item.actualAnnual))} {item.actualAnnual > item.plannedAnnual ? "(Aşıldı)" : "(Kalan)"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        percentage <= 100 ? "bg-slate-100 text-slate-700" : "bg-rose-100 text-rose-800"
                      }`}>
                        %{percentage}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
