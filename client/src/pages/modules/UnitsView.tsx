import React, { useState } from "react";
import {
  Building2, Search, Filter, Plus, FileText, UserCheck, Users,
  Car, Download, Printer, ArrowUpRight, ArrowDownRight, MoreVertical,
  CheckCircle2, AlertCircle, Eye, Edit, Trash2, X, CreditCard,
  Phone, Mail, KeyRound, Clock, Percent, Layers, ShieldAlert
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Unit, UnitType, UnitPaymentRatio } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { exportToCSV, printReceipt } from "@/utils/exportUtils";
import { toast } from "sonner";
import ExcelBulkImportModal from "@/components/ExcelBulkImportModal";

interface UnitsViewProps {
  onOpenCollectionForUnit?: (unitId: string) => void;
}

export default function UnitsView({ onOpenCollectionForUnit }: UnitsViewProps) {
  const {
    activeSite, activeSiteUnits, activeSiteCollections, blocks, people,
    addBlock, deleteBlock, addUnit, updateUnit, deleteUnit, getUnitLedger, vacateTenantFromUnit
  } = useApp();
  const { hasPermission } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedDebtFilter, setSelectedDebtFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Selected Unit for Detail Drawer
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [confirmVacateUnitId, setConfirmVacateUnitId] = useState<string | null>(null);
  const [confirmDeleteUnitId, setConfirmDeleteUnitId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [ratioUnit, setRatioUnit] = useState<Unit | null>(null);

  const [newBlockData, setNewBlockData] = useState({
    name: "",
    floorsCount: 8,
    unitsCount: 16,
  });

  const [ratioForm, setRatioForm] = useState<UnitPaymentRatio>({
    duesTenantRatio: 100,
    duesOwnerRatio: 0,
    extraTenantRatio: 0,
    extraOwnerRatio: 100,
  });

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
    duesTenantRatio: 100,
    extraTenantRatio: 0,
  });

  const siteBlocks = blocks.filter((b) => b.siteId === activeSite.id);

  // Open Ratio Modal
  const handleOpenRatioModal = (unit: Unit, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const r = unit.paymentRatio || {
      duesTenantRatio: 100,
      duesOwnerRatio: 0,
      extraTenantRatio: 0,
      extraOwnerRatio: 100,
    };
    setRatioForm(r);
    setRatioUnit(unit);
  };

  const handleSaveRatio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratioUnit) return;
    updateUnit(ratioUnit.id, { paymentRatio: ratioForm });
    if (selectedUnit?.id === ratioUnit.id) {
      setSelectedUnit({ ...selectedUnit, paymentRatio: ratioForm });
    }
    toast.success(`${ratioUnit.blockName} D:${ratioUnit.unitNumber} borç paylaşım oranları güncellendi.`);
    setRatioUnit(null);
  };

  // Open Edit Unit Modal
  const handleOpenEditUnit = (unit: Unit, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingUnit(unit);
  };

  const handleSaveEditUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    const block = blocks.find((b) => b.id === editingUnit.blockId);
    updateUnit(editingUnit.id, {
      ...editingUnit,
      blockName: block?.name || editingUnit.blockName,
    });
    if (selectedUnit?.id === editingUnit.id) {
      setSelectedUnit({ ...editingUnit, blockName: block?.name || editingUnit.blockName });
    }
    toast.success(`${editingUnit.blockName} D:${editingUnit.unitNumber} bilgileri güncellendi.`);
    setEditingUnit(null);
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockData.name.trim()) {
      toast.error("Lütfen blok adını giriniz.");
      return;
    }
    addBlock({
      siteId: activeSite.id,
      name: newBlockData.name.trim(),
      floorsCount: Number(newBlockData.floorsCount),
      unitsCount: Number(newBlockData.unitsCount),
    });
    setNewBlockData({ name: "", floorsCount: 8, unitsCount: 16 });
    setIsBlockModalOpen(false);
    toast.success(`${newBlockData.name} bloğu başarıyla oluşturuldu.`);
  };

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
      "Malik", "Kiracı", "Durum", "Aidat Oranı (K/M)", "Demirbaş Oranı (K/M)",
      "Kişi Sayısı", "Plakalar", "Otopark", "Güncel Bakiye (TL)"
    ];
    const rows = filteredUnits.map((u) => {
      const owner = people.find((p) => p.id === u.ownerId);
      const tenant = u.tenantId ? people.find((p) => p.id === u.tenantId) : null;
      const r = u.paymentRatio || { duesTenantRatio: 100, duesOwnerRatio: 0, extraTenantRatio: 0, extraOwnerRatio: 100 };
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
        `%${r.duesTenantRatio} K / %${r.duesOwnerRatio} M`,
        `%${r.extraTenantRatio} K / %${r.extraOwnerRatio} M`,
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
      paymentRatio: {
        duesTenantRatio: newUnitData.duesTenantRatio,
        duesOwnerRatio: 100 - newUnitData.duesTenantRatio,
        extraTenantRatio: newUnitData.extraTenantRatio,
        extraOwnerRatio: 100 - newUnitData.extraTenantRatio,
      },
      notes: newUnitData.notes,
    });
    setIsAddModalOpen(false);
    toast.success(`${block?.name || "Blok"} No:${newUnitData.unitNumber} dairesi başarıyla eklendi.`);
  };

  return (
    <div className="space-y-6">
      {/* BLOK YÖNETİMİ & BLOK FİNANSAL KARNESİ (Yoneticim & mumindonmez17-cell esinlenmesi) */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers size={17} className="text-emerald-700" />
              <h3 className="text-sm font-bold text-[#172b2b]">Blok Yönetimi & Blok Finansal Karnesi</h3>
            </div>
            <p className="text-[11px] text-[#7c8a87] mt-0.5">
              Blok bazında doluluk, ödenen aidat tahsilatı ve bekleyen alacak dağılımı. Filtrelemek için bloğa tıklayın.
            </p>
          </div>
          {hasPermission("canManageResidents") && (
            <button
              onClick={() => setIsBlockModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#edf3eb] text-[#172b2b] text-xs font-bold hover:bg-[#dce8d8] transition cursor-pointer"
            >
              <Plus size={14} /> Yeni Blok Tanımla
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {siteBlocks.map((block) => {
            const blockUnits = activeSiteUnits.filter((u) => u.blockId === block.id);
            const occupiedCount = blockUnits.filter((u) => u.residentType !== "BOS").length;
            const unpaidTotal = blockUnits.reduce((sum, u) => sum + (u.currentBalance > 0 ? u.currentBalance : 0), 0);
            const blockUnitIds = new Set(blockUnits.map((u) => u.id));
            const paidTotal = activeSiteCollections
              .filter((c) => blockUnitIds.has(c.unitId))
              .reduce((sum, c) => sum + c.amount, 0);
            const isSelected = selectedBlock === block.id;

            return (
              <div
                key={block.id}
                onClick={() => setSelectedBlock(isSelected ? "ALL" : block.id)}
                className={`rounded-xl p-3.5 border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500"
                    : "bg-[#f8faf7] border-[#e4eae3] hover:border-emerald-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Building2 size={15} className="text-emerald-700" />
                      <strong className="text-sm font-bold text-[#172b2b]">{block.name}</strong>
                    </div>
                    <span className="text-[11px] text-[#7c8a87] block mt-0.5">
                      {block.floorsCount} Kat · {occupiedCount}/{blockUnits.length} Dolu Daire
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                        Seçili
                      </span>
                    )}
                    {blockUnits.length === 0 && hasPermission("canManageResidents") && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBlock(block.id);
                          toast.success(`${block.name} silindi.`);
                        }}
                        className="p-1 rounded text-rose-500 hover:bg-rose-50"
                        title="Boş Bloğu Sil"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-[#e4eae3]/80 text-[11px]">
                  <div>
                    <span className="text-[#87928e] block text-[10px]">Ödenen Aidat</span>
                    <strong className="text-emerald-700 font-bold">{formatCurrency(paidTotal)}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[#87928e] block text-[10px]">Ödenmeyen Borç</span>
                    <strong className={unpaidTotal > 0 ? "text-rose-600 font-bold" : "text-slate-600 font-bold"}>
                      {formatCurrency(unpaidTotal)}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Header & Search / Filters */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">Bağımsız Bölümler (Daireler & İşyerleri)</h2>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              {activeSite.name} bünyesindeki tüm konut, işyeri, kat m², arsa payı, kiracı/malik borç paylaşım oranları ve sakin kayıtları.
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
              {siteBlocks.map((b) => (
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
            const ratio = unit.paymentRatio || {
              duesTenantRatio: 100,
              duesOwnerRatio: 0,
              extraTenantRatio: 0,
              extraOwnerRatio: 100,
            };

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

                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        unit.residentType === "MALIK_OTURUYOR" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                        unit.residentType === "KIRACI_OTURUYOR" ? "bg-blue-50 text-blue-800 border border-blue-200" :
                        "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}>
                        {unit.residentType === "MALIK_OTURUYOR" ? "Malik Oturuyor" :
                         unit.residentType === "KIRACI_OTURUYOR" ? "Kiracı Oturuyor" : "Boş Daire"}
                      </span>
                      <button
                        onClick={(e) => handleOpenRatioModal(unit, e)}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition"
                        title="Kiracı / Ev Sahibi Borç Paylaşım Oranlarını Düzenle"
                      >
                        <Percent size={10} /> Aidat %{ratio.duesTenantRatio}K · Ekstra %{ratio.extraOwnerRatio}M
                      </button>
                    </div>
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
                    {hasDebt && tenant && (unit.tenantBalance !== undefined || unit.ownerBalance !== undefined) && (
                      <span className="block text-[10px] text-slate-500">
                        K: {formatCurrency(unit.tenantBalance || 0)} · M: {formatCurrency(unit.ownerBalance || 0)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasDebt && onOpenCollectionForUnit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCollectionForUnit(unit.id);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 rounded-lg transition shadow-2xs"
                      >
                        <CreditCard size={12} /> Ödeme Al
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUnit(unit);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition"
                    >
                      Ekstre <ArrowUpRight size={13} />
                    </button>
                  </div>
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
                  <th className="py-3 px-4">Paylaşım Oranı (K/M)</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">Güncel Bakiye</th>
                  <th className="py-3 px-4 text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4f1]">
                {filteredUnits.map((unit) => {
                  const owner = people.find((p) => p.id === unit.ownerId);
                  const tenant = unit.tenantId ? people.find((p) => p.id === unit.tenantId) : null;
                  const hasDebt = unit.currentBalance > 0;
                  const ratio = unit.paymentRatio || {
                    duesTenantRatio: 100,
                    duesOwnerRatio: 0,
                    extraTenantRatio: 0,
                    extraOwnerRatio: 100,
                  };

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
                        <button
                          onClick={(e) => handleOpenRatioModal(unit, e)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 text-[10px] font-bold text-slate-700 hover:text-emerald-800 transition"
                        >
                          <Percent size={11} /> Aidat: %{ratio.duesTenantRatio}K · Ek: %{ratio.extraOwnerRatio}M
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          unit.residentType === "MALIK_OTURUYOR" ? "bg-emerald-50 text-emerald-800" :
                          unit.residentType === "KIRACI_OTURUYOR" ? "bg-blue-50 text-blue-800" : "bg-amber-50 text-amber-800"
                        }`}>
                          {unit.residentType === "MALIK_OTURUYOR" ? "Malik" : unit.residentType === "KIRACI_OTURUYOR" ? "Kiracı" : "Boş"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <strong className={`font-bold ${hasDebt ? "text-rose-600" : unit.currentBalance < 0 ? "text-emerald-700" : "text-[#172b2b]"}`}>
                          {formatCurrency(unit.currentBalance)}
                        </strong>
                        {hasDebt && tenant && (unit.tenantBalance !== undefined || unit.ownerBalance !== undefined) && (
                          <span className="block text-[10px] text-slate-400">
                            K: {formatCurrency(unit.tenantBalance || 0)} | M: {formatCurrency(unit.ownerBalance || 0)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          {hasDebt && onOpenCollectionForUnit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenCollectionForUnit(unit.id);
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 transition"
                              title="Hızlı Ödeme Al"
                            >
                              Ödeme Al
                            </button>
                          )}
                          <button
                            onClick={(e) => handleOpenEditUnit(unit, e)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                            title="Daireyi Düzenle"
                          >
                            <Edit size={14} />
                          </button>
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
                        </div>
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
                <div className="flex items-center gap-2">
                  {hasPermission("canManageResidents") && (
                    <>
                      <button
                        onClick={() => handleOpenRatioModal(selectedUnit)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#e4eae3] text-xs font-bold text-[#294342] hover:bg-slate-50 transition"
                      >
                        <Percent size={13} /> % Oranlar
                      </button>
                      <button
                        onClick={() => handleOpenEditUnit(selectedUnit)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#e4eae3] text-xs font-bold text-[#294342] hover:bg-slate-50 transition"
                      >
                        <Edit size={13} /> Düzenle
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setSelectedUnit(null);
                      setConfirmVacateUnitId(null);
                      setConfirmDeleteUnitId(null);
                    }}
                    className="w-8 h-8 rounded-full border border-[#e4eae3] flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
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
                      confirmVacateUnitId === selectedUnit.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              vacateTenantFromUnit(selectedUnit.id);
                              toast.success("Kiracı daireden tahliye edildi.");
                              setSelectedUnit({ ...selectedUnit, tenantId: undefined, residentType: "BOS" });
                              setConfirmVacateUnitId(null);
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white"
                          >
                            Onayla
                          </button>
                          <button
                            onClick={() => setConfirmVacateUnitId(null)}
                            className="text-[10px] font-bold text-slate-500"
                          >
                            Vazgeç
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmVacateUnitId(selectedUnit.id)}
                          className="text-[10px] font-bold text-rose-600 hover:underline"
                        >
                          Tahliye Et
                        </button>
                      )
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

              {/* Kiracı / Malik Ödeme Oranları Özeti */}
              {(() => {
                const r = selectedUnit.paymentRatio || {
                  duesTenantRatio: 100,
                  duesOwnerRatio: 0,
                  extraTenantRatio: 0,
                  extraOwnerRatio: 100,
                };
                return (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Percent size={15} className="text-emerald-700" />
                      <div>
                        <span className="font-bold text-[#172b2b] block">Borç Paylaşım Oranları (Kiracı / Ev Sahibi)</span>
                        <span className="text-[11px] text-[#7c8a87]">
                          Aylık Aidat: <strong>%{r.duesTenantRatio} Kiracı / %{r.duesOwnerRatio} Malik</strong> · Demirbaş/Ekstra: <strong>%{r.extraTenantRatio} Kiracı / %{r.extraOwnerRatio} Malik</strong>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenRatioModal(selectedUnit)}
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      Değiştir
                    </button>
                  </div>
                );
              })()}

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

            <div className="pt-4 border-t border-[#e4eae3] flex items-center justify-between">
              {hasPermission("canManageResidents") ? (
                confirmDeleteUnitId === selectedUnit.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-rose-600 font-bold">Daire kaydı silinsin mi?</span>
                    <button
                      onClick={() => {
                        deleteUnit(selectedUnit.id);
                        toast.success("Bağımsız bölüm kaydı silindi.");
                        setSelectedUnit(null);
                        setConfirmDeleteUnitId(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                    >
                      Evet, Sil
                    </button>
                    <button
                      onClick={() => setConfirmDeleteUnitId(null)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold"
                    >
                      İptal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteUnitId(selectedUnit.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition"
                  >
                    <Trash2 size={14} /> Daireyi Sil
                  </button>
                )
              ) : <div />}

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

      {/* KİRACI / EV SAHİBİ BORÇ PAYLAŞIM ORANLARI MODALI */}
      {ratioUnit && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div>
                <h3 className="text-base font-bold text-[#172b2b]">
                  {ratioUnit.blockName} D:{ratioUnit.unitNumber} · Borç Paylaşım Oranları
                </h3>
                <p className="text-xs text-[#7c8a87]">
                  Kiracı ve Ev Sahibi (Kat Maliki) arasındaki aidat ve demirbaş paylaşım yüzdeleri
                </p>
              </div>
              <button onClick={() => setRatioUnit(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRatio} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#f8faf7] border border-[#e4eae3] space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-[#172b2b]">Aylık İşletme Aidatı Paylaşımı</label>
                  <span className="text-[11px] font-bold text-emerald-700">
                    %{ratioForm.duesTenantRatio} Kiracı / %{ratioForm.duesOwnerRatio} Ev Sahibi
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={ratioForm.duesTenantRatio}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setRatioForm({
                      ...ratioForm,
                      duesTenantRatio: val,
                      duesOwnerRatio: 100 - val,
                    });
                  }}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#7c8a87]">
                  <span>%100 Ev Sahibi</span>
                  <span>%50 / %50 Ortak</span>
                  <span>%100 Kiracı (Varsayılan)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#f8faf7] border border-[#e4eae3] space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-[#172b2b]">Demirbaş & Ekstra Borç Paylaşımı</label>
                  <span className="text-[11px] font-bold text-blue-700">
                    %{ratioForm.extraTenantRatio} Kiracı / %{ratioForm.extraOwnerRatio} Ev Sahibi
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={ratioForm.extraTenantRatio}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setRatioForm({
                      ...ratioForm,
                      extraTenantRatio: val,
                      extraOwnerRatio: 100 - val,
                    });
                  }}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#7c8a87]">
                  <span>%100 Ev Sahibi (KMK Md. 20)</span>
                  <span>%50 / %50 Ortak</span>
                  <span>%100 Kiracı</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#e4eae3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRatioUnit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#172b2b] text-white font-bold hover:bg-[#294342] transition shadow-sm"
                >
                  Oranları Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT UNIT MODAL */}
      {editingUnit && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div>
                <h3 className="text-base font-bold text-[#172b2b]">Daire Bilgilerini Düzenle</h3>
                <p className="text-xs text-[#7c8a87]">{editingUnit.blockName} Daire {editingUnit.unitNumber}</p>
              </div>
              <button onClick={() => setEditingUnit(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditUnit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Blok</label>
                  <select
                    value={editingUnit.blockId}
                    onChange={(e) => setEditingUnit({ ...editingUnit, blockId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    {siteBlocks.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Daire / Kapı No</label>
                  <input
                    type="text"
                    required
                    value={editingUnit.unitNumber}
                    onChange={(e) => setEditingUnit({ ...editingUnit, unitNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Kat</label>
                  <input
                    type="number"
                    value={editingUnit.floor}
                    onChange={(e) => setEditingUnit({ ...editingUnit, floor: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Daire Tipi</label>
                  <select
                    value={editingUnit.type}
                    onChange={(e) => setEditingUnit({ ...editingUnit, type: e.target.value as UnitType })}
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
                    value={editingUnit.grossSquareMeters}
                    onChange={(e) => setEditingUnit({ ...editingUnit, grossSquareMeters: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Kat Maliki</label>
                  <select
                    value={editingUnit.ownerId}
                    onChange={(e) => setEditingUnit({ ...editingUnit, ownerId: e.target.value })}
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
                    value={editingUnit.residentType}
                    onChange={(e) => setEditingUnit({ ...editingUnit, residentType: e.target.value as Unit["residentType"] })}
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
                    value={editingUnit.vehiclePlates.join(", ")}
                    onChange={(e) =>
                      setEditingUnit({
                        ...editingUnit,
                        vehiclePlates: e.target.value.split(",").map((p) => p.trim()).filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Tahsisli Park Yeri No</label>
                  <input
                    type="text"
                    value={editingUnit.parkingLotNumber || ""}
                    onChange={(e) => setEditingUnit({ ...editingUnit, parkingLotNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#e4eae3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUnit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#172b2b] text-white font-bold hover:bg-[#294342] transition shadow-sm"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW BLOCK MODAL */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div>
                <h3 className="text-base font-bold text-[#172b2b]">Yeni Blok Tanımla</h3>
                <p className="text-xs text-[#7c8a87]">{activeSite.name} bünyesine yeni blok ekleyin.</p>
              </div>
              <button onClick={() => setIsBlockModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddBlock} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Blok Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: D Blok, Güney Kule"
                  value={newBlockData.name}
                  onChange={(e) => setNewBlockData({ ...newBlockData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Kat Sayısı</label>
                  <input
                    type="number"
                    min={1}
                    value={newBlockData.floorsCount}
                    onChange={(e) => setNewBlockData({ ...newBlockData, floorsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Planlanan Daire Sayısı</label>
                  <input
                    type="number"
                    min={1}
                    value={newBlockData.unitsCount}
                    onChange={(e) => setNewBlockData({ ...newBlockData, unitsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#e4eae3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#172b2b] text-white font-bold hover:bg-[#294342] transition shadow-sm"
                >
                  Bloğu Ekle
                </button>
              </div>
            </form>
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
                    {siteBlocks.map(b => (
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

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#f8faf7] border border-[#e4eae3]">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Aidat Kiracı Payı (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newUnitData.duesTenantRatio}
                    onChange={(e) => setNewUnitData({ ...newUnitData, duesTenantRatio: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#e4eae3] bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Demirbaş Kiracı Payı (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newUnitData.extraTenantRatio}
                    onChange={(e) => setNewUnitData({ ...newUnitData, extraTenantRatio: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#e4eae3] bg-white"
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

