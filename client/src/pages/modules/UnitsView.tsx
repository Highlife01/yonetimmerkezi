import React, { useState } from "react";
import {
  Building2, Search, Filter, Plus, FileText, UserCheck, Users,
  Car, Download, Printer, ArrowUpRight, ArrowDownRight, MoreVertical,
  CheckCircle2, AlertCircle, Eye, Edit, Trash2, X, CreditCard,
  Phone, Mail, KeyRound, Clock
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Unit, UnitType } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { exportToCSV, printReceipt } from "@/utils/exportUtils";
import { toast } from "sonner";
import ExcelBulkImportModal from "@/components/ExcelBulkImportModal";

interface UnitsViewProps {
  onOpenCollectionForUnit?: (unitId: string) => void;
}

export default function UnitsView({ onOpenCollectionForUnit }: UnitsViewProps) {
  const {
    activeSite, activeSiteUnits, blocks, people,
    addUnit, updateUnit, getUnitLedger, vacateTenantFromUnit
  } = useApp();
  const { hasPermission } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedDebtFilter, setSelectedDebtFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Selected Unit for Detail Drawer
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [newUnitData, setNewUnitData] = useState({
    blockId: blocks[0]?.id || "",
    unitNumber: "",
    floor: 1,
    type: "3+1" as UnitType,
    grossSquareMeters: 140,
    shareOfLand: 15,
    ownerId: people[0]?.id || "",
    residentType: "MALIK_OTURUYOR" as Unit["residentType"],
    residentCount: 3,
    vehiclePlates: "",
    parkingLotNumber: "",
    notes: "",
  });

  // Filter units
  const filteredUnits = activeSiteUnits.filter((u) => {
    const owner = people.find((p) => p.id === u.ownerId);
    const tenant = u.tenantId ? people.find((p) => p.id === u.tenantId) : null;
    const q = search.toLocaleLowerCase("tr-TR").trim();

    if (q) {
      const matchText = `${u.blockName} ${u.unitNumber} ${owner?.fullName || ""} ${tenant?.fullName || ""} ${u.vehiclePlates.join(" ")} ${u.parkingLotNumber || ""}`.toLocaleLowerCase("tr-TR");
      if (!matchText.includes(q)) return false;
    }

    if (selectedBlock !== "ALL" && u.blockId !== selectedBlock) return false;
    if (selectedStatus !== "ALL" && u.residentType !== selectedStatus) return false;
    if (selectedDebtFilter === "DEBTORS" && u.currentBalance <= 0) return false;
    if (selectedDebtFilter === "PAID" && u.currentBalance > 0) return false;

    return true;
  });

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Blok", "Daire No", "Kat", "Tip", "m²", "Arsa Payı",
      "Malik", "Kiracı", "Durum", "Kişi Sayısı", "Plakalar", "Otopark", "Güncel Bakiye (TL)"
    ];
    const rows = filteredUnits.map((u) => {
      const owner = people.find((p) => p.id === u.ownerId);
      const tenant = u.tenantId ? people.find((p) => p.id === u.tenantId) : null;
      return [
        u.blockName,
        u.unitNumber,
        u.floor,
        u.type,
        u.grossSquareMeters,
        u.shareOfLand,
        owner?.fullName || "-",
        tenant?.fullName || "-",
        u.residentType === "MALIK_OTURUYOR" ? "Malik Oturuyor" : u.residentType === "KIRACI_OTURUYOR" ? "Kiracı Oturuyor" : "Boş",
        u.residentCount,
        u.vehiclePlates.join(", "),
        u.parkingLotNumber || "-",
        u.currentBalance,
      ];
    });
    exportToCSV(`${activeSite.name}_Daireler_Listesi`, headers, rows);
    toast.success("Daireler listesi Excel (CSV) formatında indirildi.");
  };

  // Handle Print Unit Statement
  const handlePrintStatement = (unit: Unit) => {
    const owner = people.find((p) => p.id === unit.ownerId);
    const tenant = unit.tenantId ? people.find((p) => p.id === unit.tenantId) : null;
    const ledger = getUnitLedger(unit.id);

    const rowsHtml = ledger.map(item => `
      <div class="row">
        <span>${formatDate(item.date)}</span>
        <span>${item.description}</span>
        <span style="color: ${item.type === 'BORC' ? '#b91c1c' : '#15803d'}">
          ${item.type === 'BORC' ? formatCurrency(item.debtAmount) : '-'}
        </span>
        <span style="color: #15803d">
          ${item.type === 'ALACAK' ? formatCurrency(item.creditAmount) : '-'}
        </span>
        <strong>${formatCurrency(item.balanceAfter)}</strong>
      </div>
    `).join("");

    const statementHtml = `
      <div class="receipt-box">
        <div class="header">
          <div>
            <div class="logo">${activeSite.name}</div>
            <div style="font-size:12px; color:#666;">${activeSite.address}</div>
          </div>
          <div class="title">
            <div>DAİRE HESAP EKSTRESİ</div>
            <div style="font-size:11px; color:#666; font-weight:normal;">Tarih: ${new Date().toLocaleDateString("tr-TR")}</div>
          </div>
        </div>

        <div style="background:#f8faf7; padding:12px; border-radius:6px; margin: 15px 0; font-size:12px;">
          <div><strong>Bağımsız Bölüm:</strong> ${unit.blockName} - No: ${unit.unitNumber} (${unit.type}, ${unit.grossSquareMeters} m²)</div>
          <div><strong>Kat Maliki:</strong> ${owner?.fullName || '-'} (Tel: ${owner?.phone || '-'})</div>
          ${tenant ? `<div><strong>Kiracı:</strong> ${tenant.fullName} (Tel: ${tenant.phone || '-'})</div>` : ''}
        </div>

        <div style="font-weight:bold; font-size:12px; border-bottom:1px solid #172b2b; padding-bottom:4px; margin-bottom:8px; display:flex; justify-content:space-between;">
          <span>Tarih</span>
          <span>Açıklama</span>
          <span>Borç</span>
          <span>Alacak</span>
          <span>Bakiye</span>
        </div>

        ${rowsHtml || '<div style="padding:15px; text-align:center; color:#999;">Henüz hesap hareketi bulunmuyor.</div>'}

        <div class="total-row">
          <span>GÜNCEL TOPLAM BAKİYE:</span>
          <span style="color: ${unit.currentBalance > 0 ? '#b91c1c' : '#15803d'}">
            ${formatCurrency(unit.currentBalance)} ${unit.currentBalance > 0 ? '(Borç)' : unit.currentBalance < 0 ? '(Avans)' : '(Borçsuz)'}
          </span>
        </div>

        <div class="footer">
          <div>Düzenleyen: Site Yönetimi</div>
          <div class="sign">Yönetici Kaşe / İmza</div>
        </div>
      </div>
    `;

    printReceipt(statementHtml);
  };

  const handleSaveNewUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitData.unitNumber) {
      toast.error("Lütfen daire numarasını giriniz.");
      return;
    }
    const block = blocks.find((b) => b.id === newUnitData.blockId);
    addUnit({
      siteId: activeSite.id,
      blockId: newUnitData.blockId,
      blockName: block?.name || "A Blok",
      unitNumber: newUnitData.unitNumber,
      floor: Number(newUnitData.floor),
      type: newUnitData.type,
      grossSquareMeters: Number(newUnitData.grossSquareMeters),
      shareOfLand: Number(newUnitData.shareOfLand),
      ownerId: newUnitData.ownerId,
      residentType: newUnitData.residentType,
      residentCount: Number(newUnitData.residentCount),
      vehiclePlates: newUnitData.vehiclePlates.split(",").map((p) => p.trim()).filter(Boolean),
      parkingLotNumber: newUnitData.parkingLotNumber,
      currentBalance: 0,
      notes: newUnitData.notes,
    });
    setIsAddModalOpen(false);
    toast.success(`${block?.name || "Blok"} No:${newUnitData.unitNumber} dairesi başarıyla eklendi.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search / Filters */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">Bağımsız Bölümler (Daireler & İşyerleri)</h2>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              {activeSite.name} bünyesindeki tüm konut, işyeri, kat m², arsa payı ve sakin kayıtları.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsBulkImportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition shadow-xs cursor-pointer"
            >
              <FileText size={14} className="text-emerald-700" /> Excel'den Toplu Yükle
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#e4eae3] text-[#294342] text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
            >
              <Download size={14} /> Excel'e Aktar
            </button>
            {hasPermission("canManageResidents") && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#172b2b] text-white text-xs font-semibold hover:bg-[#294342] transition shadow-sm cursor-pointer"
              >
                <Plus size={15} /> Yeni Daire Ekle
              </button>
            )}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-[#f0f4f1]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa7a2]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ara: daire no, malik, kiracı, plaka..."
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

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="ALL">Tüm Kullanım Durumları</option>
              <option value="MALIK_OTURUYOR">Malik Oturuyor</option>
              <option value="KIRACI_OTURUYOR">Kiracı Oturuyor</option>
              <option value="BOS">Boş Daire</option>
            </select>
          </div>

          <div>
            <select
              value={selectedDebtFilter}
              onChange={(e) => setSelectedDebtFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="ALL">Tüm Bakiyeler</option>
              <option value="DEBTORS">Yalnızca Borçlular</option>
              <option value="PAID">Borcu Olmayanlar / Avans</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-1.5">
            <span className="text-xs text-[#7c8a87] mr-2">
              <strong>{filteredUnits.length}</strong> daire listelendi
            </span>
            <div className="inline-flex rounded-lg border border-[#e4eae3] p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-2.5 py-1 text-xs rounded-md font-semibold ${viewMode === "grid" ? "bg-white text-[#172b2b] shadow-xs" : "text-slate-500"}`}
              >
                Kartlar
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-2.5 py-1 text-xs rounded-md font-semibold ${viewMode === "table" ? "bg-white text-[#172b2b] shadow-xs" : "text-slate-500"}`}
              >
                Tablo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.map((unit) => {
            const owner = people.find((p) => p.id === unit.ownerId);
            const tenant = unit.tenantId ? people.find((p) => p.id === unit.tenantId) : null;
            const hasDebt = unit.currentBalance > 0;

            return (
              <div
                key={unit.id}
                onClick={() => setSelectedUnit(unit)}
                className="bg-white border border-[#e4eae3] rounded-2xl p-4.5 hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-[#edf3eb] text-[#294342] font-bold text-base flex items-center justify-center group-hover:bg-[#d5f1d2] group-hover:text-[#39704c] transition">
                        {unit.unitNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-sm font-bold text-[#172b2b]">{unit.blockName}</strong>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">{unit.type}</span>
                        </div>
                        <span className="text-[11px] text-[#87928e]">{unit.floor}. Kat · {unit.grossSquareMeters} m² ({unit.shareOfLand}/240 Pay)</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      unit.residentType === "MALIK_OTURUYOR" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                      unit.residentType === "KIRACI_OTURUYOR" ? "bg-blue-50 text-blue-800 border border-blue-200" :
                      "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}>
                      {unit.residentType === "MALIK_OTURUYOR" ? "Malik Oturuyor" :
                       unit.residentType === "KIRACI_OTURUYOR" ? "Kiracı Oturuyor" : "Boş Daire"}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f0f4f1] space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#87928e]">Kat Maliki:</span>
                      <strong className="text-[#172b2b] font-medium truncate max-w-[150px]">{owner?.fullName || "Kayıtsız"}</strong>
                    </div>

                    {tenant && (
                      <div className="flex justify-between">
                        <span className="text-[#87928e]">Kiracı:</span>
                        <strong className="text-blue-900 font-medium truncate max-w-[150px]">{tenant.fullName}</strong>
                      </div>
                    )}

                    {unit.vehiclePlates.length > 0 && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#87928e] flex items-center gap-1"><Car size={12} /> Plakalar:</span>
                        <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded text-slate-700 font-bold">{unit.vehiclePlates.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f0f4f1] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#9aa6a1] block">GÜNCEL BAKİYE</span>
                    <strong className={`text-base font-bold ${hasDebt ? "text-rose-600" : unit.currentBalance < 0 ? "text-emerald-700" : "text-[#172b2b]"}`}>
                      {formatCurrency(unit.currentBalance)}
                    </strong>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUnit(unit);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition"
                  >
                    Detay & Ekstre <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-[#e4eae3] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Bağımsız Bölüm</th>
                  <th className="py-3 px-4">Kat / Tip / m²</th>
                  <th className="py-3 px-4">Kat Maliki</th>
                  <th className="py-3 px-4">Kiracı</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4">Araç / Plaka</th>
                  <th className="py-3 px-4 text-right">Güncel Bakiye</th>
                  <th className="py-3 px-4 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4f1]">
                {filteredUnits.map((unit) => {
                  const owner = people.find((p) => p.id === unit.ownerId);
                  const tenant = unit.tenantId ? people.find((p) => p.id === unit.tenantId) : null;
                  const hasDebt = unit.currentBalance > 0;

                  return (
                    <tr key={unit.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => setSelectedUnit(unit)}>
                      <td className="py-3.5 px-4 font-bold text-[#172b2b]">
                        <span className="w-6 h-6 rounded bg-[#edf3eb] text-center inline-block leading-6 mr-2 font-bold">{unit.unitNumber}</span>
                        {unit.blockName}
                      </td>
                      <td className="py-3.5 px-4 text-[#788581]">
                        {unit.floor}. Kat · {unit.type} · {unit.grossSquareMeters} m²
                      </td>
                      <td className="py-3.5 px-4 text-[#172b2b] font-medium">
                        {owner?.fullName || "-"}
                        <span className="block text-[10px] text-[#9aa6a1]">{owner?.phone}</span>
                      </td>
                      <td className="py-3.5 px-4 text-blue-900 font-medium">
                        {tenant?.fullName || "-"}
                        {tenant && <span className="block text-[10px] text-blue-600">{tenant.phone}</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          unit.residentType === "MALIK_OTURUYOR" ? "bg-emerald-50 text-emerald-800" :
                          unit.residentType === "KIRACI_OTURUYOR" ? "bg-blue-50 text-blue-800" : "bg-amber-50 text-amber-800"
                        }`}>
                          {unit.residentType === "MALIK_OTURUYOR" ? "Malik" : unit.residentType === "KIRACI_OTURUYOR" ? "Kiracı" : "Boş"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                        {unit.vehiclePlates.join(", ") || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <strong className={`font-bold ${hasDebt ? "text-rose-600" : unit.currentBalance < 0 ? "text-emerald-700" : "text-[#172b2b]"}`}>
                          {formatCurrency(unit.currentBalance)}
                        </strong>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUnit(unit);
                          }}
                          className="p-1.5 rounded-lg text-[#559e65] hover:bg-[#edf8ed] transition"
                          title="Detay ve Ekstre"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* UNIT DETAIL DRAWER / MODAL */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end" role="dialog" aria-modal="true">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-4 border-b border-[#e4eae3]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[#172b2b]">{selectedUnit.blockName} · Daire {selectedUnit.unitNumber}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#edf3eb] text-[#294342]">
                      {selectedUnit.type} · {selectedUnit.grossSquareMeters} m²
                    </span>
                  </div>
                  <p className="text-xs text-[#7c8a87] mt-0.5">{activeSite.name}</p>
                </div>
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="w-8 h-8 rounded-full border border-[#e4eae3] flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Daire Bilgi Özeti */}
              <div className="grid grid-cols-2 gap-3 my-5">
                <div className="bg-[#f8faf7] p-3.5 rounded-xl border border-[#e4eae3]">
                  <span className="text-[10px] text-[#87928e] uppercase font-bold block">KAT MALİKİ</span>
                  {(() => {
                    const owner = people.find((p) => p.id === selectedUnit.ownerId);
                    return (
                      <div className="mt-1">
                        <strong className="text-sm font-bold text-[#172b2b] block">{owner?.fullName || "Tanımlanmamış"}</strong>
                        <div className="flex items-center gap-2 text-xs text-[#666] mt-1">
                          <Phone size={12} /> {owner?.phone || "-"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#666] mt-0.5">
                          <Mail size={12} /> {owner?.email || "-"}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="bg-[#f8faf7] p-3.5 rounded-xl border border-[#e4eae3]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#87928e] uppercase font-bold block">KİRACI BİLGİSİ</span>
                    {selectedUnit.tenantId && hasPermission("canManageResidents") && (
                      <button
                        onClick={() => {
                          if (confirm("Kiracıyı bu daireden tahliye edip daireyi boşa çıkarmak istiyor musunuz? Geçmiş hesap hareketleri korunacaktır.")) {
                            vacateTenantFromUnit(selectedUnit.id);
                            toast.success("Kiracı daireden tahliye edildi.");
                            setSelectedUnit({ ...selectedUnit, tenantId: undefined, residentType: "BOS" });
                          }
                        }}
                        className="text-[10px] font-bold text-rose-600 hover:underline"
                      >
                        Tahliye Et
                      </button>
                    )}
                  </div>
                  {(() => {
                    const tenant = selectedUnit.tenantId ? people.find((p) => p.id === selectedUnit.tenantId) : null;
                    return tenant ? (
                      <div className="mt-1">
                        <strong className="text-sm font-bold text-blue-900 block">{tenant.fullName}</strong>
                        <div className="flex items-center gap-2 text-xs text-[#666] mt-1">
                          <Phone size={12} /> {tenant.phone || "-"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#666] mt-0.5">
                          <Mail size={12} /> {tenant.email || "-"}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-slate-400 italic">Kiracı bulunmuyor (Malik oturuyor veya boş)</div>
                    );
                  })()}
                </div>
              </div>

              {/* Unit Meta Cards */}
              <div className="grid grid-cols-4 gap-2 mb-5 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Kat</span>
                  <strong className="font-bold">{selectedUnit.floor}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Arsa Payı</span>
                  <strong className="font-bold">{selectedUnit.shareOfLand} / 240</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Park Yeri</span>
                  <strong className="font-bold">{selectedUnit.parkingLotNumber || "Açık"}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Oturan Sayısı</span>
                  <strong className="font-bold">{selectedUnit.residentCount} Kişi</strong>
                </div>
              </div>

              {/* Bakiye ve Hızlı Aksiyonlar */}
              <div className="p-4 rounded-xl bg-[#edf3eb] border border-[#e2ebe1] flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#7a8a84]">GÜNCEL HESAP BAKİYESİ</span>
                  <h4 className={`text-2xl font-extrabold ${selectedUnit.currentBalance > 0 ? "text-rose-600" : selectedUnit.currentBalance < 0 ? "text-emerald-700" : "text-[#172b2b]"}`}>
                    {formatCurrency(selectedUnit.currentBalance)}
                  </h4>
                  <span className="text-[11px] text-[#7a8a84]">
                    {selectedUnit.currentBalance > 0 ? "Ödenmemiş aidat/borç bakiyesi" : "Hesapta borç bulunmuyor"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintStatement(selectedUnit)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#e4eae3] text-xs font-bold text-[#172b2b] hover:bg-slate-50 transition shadow-xs"
                  >
                    <Printer size={14} /> Ekstre Yazdır / PDF
                  </button>
                  {onOpenCollectionForUnit && (
                    <button
                      onClick={() => {
                        onOpenCollectionForUnit(selectedUnit.id);
                        setSelectedUnit(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs"
                    >
                      <CreditCard size={14} /> Tahsilat Gir
                    </button>
                  )}
                </div>
              </div>

              {/* Daire Cari Hesap Ekstresi Tablosu */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-[#172b2b]">Daire Cari Hesap Hareketleri</h4>
                  <span className="text-xs text-[#87928e]">{getUnitLedger(selectedUnit.id).length} hareket</span>
                </div>

                <div className="border border-[#e4eae3] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] text-[10px] font-bold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Tarih</th>
                        <th className="py-2.5 px-3">Açıklama</th>
                        <th className="py-2.5 px-3 text-right">Borç</th>
                        <th className="py-2.5 px-3 text-right">Alacak</th>
                        <th className="py-2.5 px-3 text-right">Bakiye</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f4f1]">
                      {getUnitLedger(selectedUnit.id).length > 0 ? (
                        getUnitLedger(selectedUnit.id).map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{formatDate(item.date)}</td>
                            <td className="py-2.5 px-3 text-[#172b2b] font-medium">
                              {item.description}
                              {item.receiptNo && <span className="block text-[10px] text-[#9aa6a1] font-mono">Makbuz: {item.receiptNo}</span>}
                            </td>
                            <td className="py-2.5 px-3 text-right text-rose-600 font-semibold">
                              {item.debtAmount > 0 ? formatCurrency(item.debtAmount) : "-"}
                            </td>
                            <td className="py-2.5 px-3 text-right text-emerald-600 font-semibold">
                              {item.creditAmount > 0 ? formatCurrency(item.creditAmount) : "-"}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-[#172b2b]">
                              {formatCurrency(item.balanceAfter)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400">
                            Bu daireye ait henüz cari hareket bulunmamaktadır.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#e4eae3] flex justify-end">
              <button
                onClick={() => setSelectedUnit(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW UNIT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div>
                <h3 className="text-base font-bold text-[#172b2b]">Yeni Bağımsız Bölüm Tanımla</h3>
                <p className="text-xs text-[#7c8a87]">Apartman / Siteye yeni daire veya dükkan kaydı ekleyin.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewUnit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Blok</label>
                  <select
                    value={newUnitData.blockId}
                    onChange={(e) => setNewUnitData({ ...newUnitData, blockId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    {blocks.filter(b => b.siteId === activeSite.id).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Daire / Kapı No</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: 25, D-4"
                    value={newUnitData.unitNumber}
                    onChange={(e) => setNewUnitData({ ...newUnitData, unitNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Kat</label>
                  <input
                    type="number"
                    value={newUnitData.floor}
                    onChange={(e) => setNewUnitData({ ...newUnitData, floor: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Daire Tipi</label>
                  <select
                    value={newUnitData.type}
                    onChange={(e) => setNewUnitData({ ...newUnitData, type: e.target.value as UnitType })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="1+1">1+1</option>
                    <option value="2+1">2+1</option>
                    <option value="3+1">3+1</option>
                    <option value="4+1">4+1</option>
                    <option value="5+1">5+1</option>
                    <option value="Dubleks">Dubleks</option>
                    <option value="Villa">Villa</option>
                    <option value="Dükkan">Dükkan</option>
                    <option value="Ofis">Ofis</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Brüt m²</label>
                  <input
                    type="number"
                    value={newUnitData.grossSquareMeters}
                    onChange={(e) => setNewUnitData({ ...newUnitData, grossSquareMeters: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Kat Maliki (Sahibi)</label>
                  <select
                    value={newUnitData.ownerId}
                    onChange={(e) => setNewUnitData({ ...newUnitData, ownerId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    {people.filter(p => p.type === "MALIK").map(p => (
                      <option key={p.id} value={p.id}>{p.fullName} ({p.phone})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Kullanım Durumu</label>
                  <select
                    value={newUnitData.residentType}
                    onChange={(e) => setNewUnitData({ ...newUnitData, residentType: e.target.value as Unit["residentType"] })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="MALIK_OTURUYOR">Malik Oturuyor</option>
                    <option value="KIRACI_OTURUYOR">Kiracı Oturuyor</option>
                    <option value="BOS">Boş Daire</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Araç Plakaları (Virgülle)</label>
                  <input
                    type="text"
                    placeholder="Örn: 34 AB 123, 34 CD 456"
                    value={newUnitData.vehiclePlates}
                    onChange={(e) => setNewUnitData({ ...newUnitData, vehiclePlates: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Tahsisli Park Yeri No</label>
                  <input
                    type="text"
                    placeholder="Örn: A-25"
                    value={newUnitData.parkingLotNumber}
                    onChange={(e) => setNewUnitData({ ...newUnitData, parkingLotNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
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

      {/* EXCEL BULK IMPORT MODAL */}
      <ExcelBulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
      />
    </div>
  );
}
