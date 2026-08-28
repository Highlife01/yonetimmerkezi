import React, { useState } from "react";
import {
  Gauge, Plus, Download, CheckCircle2, Calculator,
  CalendarDays, Flame, Droplets, Zap, X
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { MeterReading } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { exportToCSV } from "@/utils/exportUtils";
import { toast } from "sonner";

export default function MetersView() {
  const { activeSite, activeSiteMeters, activeSiteUnits, addMeterReading } = useApp();
  const { hasPermission } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newReading, setNewReading] = useState({
    unitId: activeSiteUnits[0]?.id || "",
    meterType: "SICAK_SU" as MeterReading["meterType"],
    readingDate: new Date().toISOString().split("T")[0],
    previousIndex: 100,
    currentIndex: 112.5,
    unitPrice: 85,
  });

  const calculatedConsumption = Math.max(0, newReading.currentIndex - newReading.previousIndex);
  const calculatedTotal = calculatedConsumption * newReading.unitPrice;

  const handleSaveReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReading.currentIndex < newReading.previousIndex) {
      toast.error("Son endeks ilk endeksten küçük olamaz.");
      return;
    }
    const unit = activeSiteUnits.find((u) => u.id === newReading.unitId);
    addMeterReading({
      siteId: activeSite.id,
      unitId: newReading.unitId,
      unitName: unit ? `${unit.blockName} D:${unit.unitNumber}` : "Daire",
      meterType: newReading.meterType,
      readingDate: newReading.readingDate,
      previousIndex: Number(newReading.previousIndex),
      currentIndex: Number(newReading.currentIndex),
      unitPrice: Number(newReading.unitPrice),
    });

    setIsAddModalOpen(false);
    toast.success("Sayaç okuma kaydı başarıyla oluşturuldu.");
  };

  const handleExportCSV = () => {
    const headers = ["Daire", "Sayaç Türü", "Okuma Tarihi", "İlk Endeks", "Son Endeks", "Tüketim", "Birim Fiyat (TL)", "Toplam Tutar (TL)", "Faturalandı"];
    const rows = activeSiteMeters.map(m => [
      m.unitName, m.meterType, m.readingDate, m.previousIndex, m.currentIndex, m.consumption, m.unitPrice, m.totalAmount, m.isBilled ? "Evet" : "Hayır"
    ]);
    exportToCSV(`${activeSite.name}_Sayac_Okumalari`, headers, rows);
    toast.success("Sayaç listesi Excel (CSV) olarak indirildi.");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">Sayaç Okuma ve Tüketim Paylaşımı</h2>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              Daire bazında sıcak su, soğuk su, doğalgaz ve ısı pay ölçer endeks okuma ve otomatik hesaplama.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#e4eae3] text-[#294342] text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
            >
              <Download size={14} /> Excel'e Aktar
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#172b2b] text-white text-xs font-bold hover:bg-[#294342] transition shadow-sm"
            >
              <Plus size={16} /> Yeni Endeks Oku / Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Meters Table */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] text-[10px] uppercase font-bold tracking-wider">
            <tr>
              <th className="py-3 px-4">Daire</th>
              <th className="py-3 px-4">Sayaç Türü</th>
              <th className="py-3 px-4">Okuma Tarihi</th>
              <th className="py-3 px-4 text-right">İlk Endeks</th>
              <th className="py-3 px-4 text-right">Son Endeks</th>
              <th className="py-3 px-4 text-right">Tüketim Miktarı</th>
              <th className="py-3 px-4 text-right">Birim Fiyat</th>
              <th className="py-3 px-4 text-right">Hesaplanan Tutar</th>
              <th className="py-3 px-4 text-center">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f4f1]">
            {activeSiteMeters.map((mtr) => (
              <tr key={mtr.id} className="hover:bg-slate-50 transition">
                <td className="py-3.5 px-4 font-bold text-[#172b2b]">{mtr.unitName}</td>
                <td className="py-3.5 px-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800">
                    {mtr.meterType}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{formatDate(mtr.readingDate)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-600">{mtr.previousIndex}</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-[#172b2b]">{mtr.currentIndex}</td>
                <td className="py-3.5 px-4 text-right font-bold text-emerald-800">{mtr.consumption} m³ / kW</td>
                <td className="py-3.5 px-4 text-right text-slate-600">{formatCurrency(mtr.unitPrice)}</td>
                <td className="py-3.5 px-4 text-right font-extrabold text-sm text-[#172b2b]">{formatCurrency(mtr.totalAmount)}</td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    mtr.isBilled ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                  }`}>
                    {mtr.isBilled ? "Tahakkuk Etti" : "Beklemede"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* NEW METER READING MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <h3 className="text-base font-bold text-[#172b2b]">Sayaç Endeksi Kaydet</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveReading} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Daire *</label>
                <select
                  required
                  value={newReading.unitId}
                  onChange={(e) => setNewReading({ ...newReading, unitId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                >
                  {activeSiteUnits.map(u => (
                    <option key={u.id} value={u.id}>{u.blockName} Daire {u.unitNumber}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Sayaç Türü</label>
                  <select
                    value={newReading.meterType}
                    onChange={(e) => setNewReading({ ...newReading, meterType: e.target.value as MeterReading["meterType"] })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="SICAK_SU">Merkezi Sıcak Su</option>
                    <option value="ISI_PAY_OLCER">Isı Pay Ölçer (Kalorimetre)</option>
                    <option value="SU">Soğuk Su</option>
                    <option value="DOGALGAZ">Doğalgaz</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Okuma Tarihi</label>
                  <input
                    type="date"
                    required
                    value={newReading.readingDate}
                    onChange={(e) => setNewReading({ ...newReading, readingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">İlk Endeks</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newReading.previousIndex}
                    onChange={(e) => setNewReading({ ...newReading, previousIndex: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Son Endeks *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newReading.currentIndex}
                    onChange={(e) => setNewReading({ ...newReading, currentIndex: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Birim Fiyat</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newReading.unitPrice}
                    onChange={(e) => setNewReading({ ...newReading, unitPrice: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Calculated preview */}
              <div className="p-3 bg-[#edf3eb] rounded-xl border border-[#dce7da] flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">Hesaplanan Tüketim</span>
                  <strong className="text-emerald-800 text-sm font-bold">{calculatedConsumption.toFixed(1)} birim</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Toplam Tutar</span>
                  <strong className="text-base font-extrabold text-[#172b2b]">{formatCurrency(calculatedTotal)}</strong>
                </div>
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
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
