import React, { useState } from "react";
import {
  Wrench, Plus, Search, CalendarDays, ShieldCheck,
  AlertTriangle, CheckCircle2, Building2, Phone, Download, X
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { AssetFixture } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { exportToCSV } from "@/utils/exportUtils";
import { toast } from "sonner";

export default function MaintenanceAssetsView() {
  const { activeSite, activeSiteAssets } = useApp();
  const { hasPermission } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const filteredAssets = activeSiteAssets.filter((a) => {
    if (selectedCategory !== "ALL" && a.category !== selectedCategory) return false;
    const q = search.toLocaleLowerCase("tr-TR").trim();
    if (q) {
      const matchText = `${a.name} ${a.serviceVendorName} ${a.location}`.toLocaleLowerCase("tr-TR");
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const totalAssetValue = activeSiteAssets.reduce((sum, a) => sum + a.estimatedValue, 0);

  const handleExportCSV = () => {
    const headers = ["Ekipman / Demirbaş", "Kategori", "Konum", "Sonraki Bakım Tarihi", "Bakım Periyodu", "Yetkili Servis", "Durum", "Değer (TL)"];
    const rows = filteredAssets.map(a => [
      a.name, a.category, a.location, a.nextMaintenanceDate, `${a.maintenanceIntervalDays} Gün`, a.serviceVendorName, a.status, a.estimatedValue
    ]);
    exportToCSV(`${activeSite.name}_Demirbas_ve_Bakim_Listesi`, headers, rows);
    toast.success("Demirbaş listesi Excel (CSV) olarak indirildi.");
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">Teknik Bakım ve Demirbaş Envanteri</h2>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              Asansör, jeneratör, hidrofor, yangın santrali periyodik bakım takvimi ve site demirbaş takibi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#e4eae3] text-[#294342] text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
            >
              <Download size={14} /> Excel'e Aktar
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#f0f4f1]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa7a2]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ekipman veya servis ara..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="ALL">Tüm Kategoriler</option>
              <option value="ASANSOR">Asansörler</option>
              <option value="JENERATOR">Jeneratör</option>
              <option value="HIDROFOR">Hidrofor & Pompalar</option>
              <option value="YANGIN_SISTEMI">Yangın Santrali</option>
            </select>
          </div>

          <div className="flex items-center justify-end text-xs text-[#7c8a87]">
            <span>Toplam Demirbaş Değeri: <strong className="text-[#172b2b] ml-1">{formatCurrency(totalAssetValue)}</strong></span>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white border border-[#e4eae3] rounded-2xl p-5 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold flex-shrink-0">
                    <Wrench size={22} />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-[#172b2b] block">{asset.name}</strong>
                    <span className="text-[11px] text-[#7c8a87]">{asset.location}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  asset.status === "CALISIYOR" ? "bg-emerald-50 text-emerald-800" :
                  asset.status === "BAKIM_GEREKIYOR" ? "bg-amber-50 text-amber-800" : "bg-rose-50 text-rose-800"
                }`}>
                  {asset.status === "CALISIYOR" ? "Faal / Çalışıyor" : asset.status === "BAKIM_GEREKIYOR" ? "Bakım Zamanı Geldi" : "Arızalı"}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f0f4f1] grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">SONRAKİ BAKIM</span>
                  <strong className="text-emerald-800 block mt-0.5">{formatDate(asset.nextMaintenanceDate)}</strong>
                  <span className="text-[10px] text-slate-500">Her {asset.maintenanceIntervalDays} günde bir</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">YETKİLİ SERVİS</span>
                  <strong className="text-[#172b2b] block mt-0.5 truncate">{asset.serviceVendorName}</strong>
                  <span className="text-[10px] text-slate-500">{asset.serviceVendorPhone}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#f0f4f1] flex items-center justify-between text-xs text-slate-500">
              <span>Demirbaş Bedeli: <strong>{formatCurrency(asset.estimatedValue)}</strong></span>
              <button
                onClick={() => toast.success(`${asset.name} için periyodik servis kaydı işlendi.`)}
                className="text-xs font-bold text-emerald-800 hover:underline"
              >
                Bakım Kaydı Gir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
