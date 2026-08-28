import React, { useState } from "react";
import {
  Users, UserCheck, Search, Filter, Plus, Phone, Mail,
  Building2, Home, CheckCircle2, AlertCircle, Edit, Trash2,
  KeyRound, Shield, Clock, ArrowUpRight, Download, X
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Person } from "@/types";
import { exportToCSV } from "@/utils/exportUtils";
import { toast } from "sonner";

export default function ResidentsView() {
  const {
    activeSite, activeSitePeople, activeSiteUnits,
    addPerson, updatePerson, assignTenantToUnit, vacateTenantFromUnit
  } = useApp();
  const { hasPermission } = useAuth();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "MALIK" | "KIRACI">("ALL");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignTenantModalOpen, setIsAssignTenantModalOpen] = useState(false);
  const [selectedUnitForTenant, setSelectedUnitForTenant] = useState<string>("");
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");

  const [newPersonData, setNewPersonData] = useState({
    type: "MALIK" as "MALIK" | "KIRACI",
    fullName: "",
    tcOrTaxNo: "",
    phone: "",
    email: "",
    emergencyPhone: "",
    notes: "",
  });

  const filteredPeople = activeSitePeople.filter((p) => {
    if (activeTab !== "ALL" && p.type !== activeTab) return false;
    const q = search.toLocaleLowerCase("tr-TR").trim();
    if (q) {
      const matchText = `${p.fullName} ${p.phone} ${p.email} ${p.tcOrTaxNo}`.toLocaleLowerCase("tr-TR");
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ["Tür", "Ad Soyad", "Telefon", "E-Posta", "TC / Vergi No", "Sahip Olduğu / Oturduğu Daireler", "Notlar"];
    const rows = filteredPeople.map((p) => {
      const ownedUnits = activeSiteUnits.filter(u => p.ownedUnitIds?.includes(u.id)).map(u => `${u.blockName} D:${u.unitNumber}`).join(", ");
      const rentedUnit = activeSiteUnits.find(u => u.id === p.rentedUnitId);
      const unitSummary = p.type === "MALIK" ? (ownedUnits || "-") : (rentedUnit ? `${rentedUnit.blockName} D:${rentedUnit.unitNumber}` : "-");

      return [
        p.type === "MALIK" ? "Kat Maliki" : "Kiracı",
        p.fullName,
        p.phone,
        p.email || "-",
        p.tcOrTaxNo || "-",
        unitSummary,
        p.notes || "-"
      ];
    });
    exportToCSV(`${activeSite.name}_Sakinler_Listesi`, headers, rows);
    toast.success("Sakin listesi Excel (CSV) olarak indirildi.");
  };

  const handleSavePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonData.fullName || !newPersonData.phone) {
      toast.error("Lütfen ad soyad ve telefon numarasını doldurunuz.");
      return;
    }
    addPerson({
      siteId: activeSite.id,
      type: newPersonData.type,
      fullName: newPersonData.fullName,
      tcOrTaxNo: newPersonData.tcOrTaxNo,
      phone: newPersonData.phone,
      email: newPersonData.email,
      emergencyPhone: newPersonData.emergencyPhone,
      ownedUnitIds: [],
      isActive: true,
      notes: newPersonData.notes,
    });
    setIsAddModalOpen(false);
    toast.success(`${newPersonData.fullName} başarıyla kaydedildi.`);
  };

  const handleAssignTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitForTenant || !selectedTenantId) {
      toast.error("Lütfen daire ve kiracı seçiniz.");
      return;
    }
    assignTenantToUnit(selectedUnitForTenant, selectedTenantId);
    setIsAssignTenantModalOpen(false);
    toast.success("Kiracı daireye başarıyla atandı.");
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">Malik ve Kiracı Yönetimi</h2>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              Kat malikleri, kiracılar, iletişim bilgileri ve çoklu daire sahipliklerinin merkezi yönetimi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#e4eae3] text-[#294342] text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
            >
              <Download size={14} /> Excel'e Aktar
            </button>
            {hasPermission("canManageResidents") && (
              <>
                <button
                  onClick={() => setIsAssignTenantModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold hover:bg-blue-100 transition shadow-sm"
                >
                  <KeyRound size={14} /> Kiracı Ata / Değiştir
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#172b2b] text-white text-xs font-semibold hover:bg-[#294342] transition shadow-sm"
                >
                  <Plus size={15} /> Yeni Malik / Kiracı Ekle
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#f0f4f1]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="inline-flex rounded-xl border border-[#e4eae3] p-1 bg-slate-50">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition ${
                  activeTab === "ALL" ? "bg-white text-[#172b2b] shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Tümü ({activeSitePeople.length})
              </button>
              <button
                onClick={() => setActiveTab("MALIK")}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition ${
                  activeTab === "MALIK" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Kat Malikleri ({activeSitePeople.filter(p => p.type === "MALIK").length})
              </button>
              <button
                onClick={() => setActiveTab("KIRACI")}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition ${
                  activeTab === "KIRACI" ? "bg-white text-blue-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Kiracılar ({activeSitePeople.filter(p => p.type === "KIRACI").length})
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa7a2]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kişi ara: ad, telefon, TC..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Residents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPeople.map((person) => {
          const ownedUnits = activeSiteUnits.filter((u) => person.ownedUnitIds?.includes(u.id));
          const rentedUnit = activeSiteUnits.find((u) => u.id === person.rentedUnitId);

          return (
            <div
              key={person.id}
              className="bg-white border border-[#e4eae3] rounded-2xl p-5 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full font-bold text-sm flex items-center justify-center ${
                      person.type === "MALIK" ? "bg-[#c1edc4] text-[#39704c]" : "bg-[#c2e4f2] text-[#376c83]"
                    }`}>
                      {person.fullName.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <strong className="text-sm font-bold text-[#172b2b] block">{person.fullName}</strong>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        person.type === "MALIK" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-blue-50 text-blue-800 border border-blue-200"
                      }`}>
                        {person.type === "MALIK" ? "Kat Maliki (Ev Sahibi)" : "Kiracı"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f0f4f1] space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone size={13} className="text-[#87928e]" />
                    <span className="font-semibold">{person.phone}</span>
                  </div>

                  {person.email && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail size={13} className="text-[#87928e]" />
                      <span>{person.email}</span>
                    </div>
                  )}

                  {person.tcOrTaxNo && (
                    <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                      <Shield size={13} className="text-[#87928e]" />
                      <span>TC: {person.tcOrTaxNo}</span>
                    </div>
                  )}

                  {/* Units info */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                      {person.type === "MALIK" ? "Mülkiyetindeki Daireler" : "İkamet Ettiği Daire"}
                    </span>
                    {person.type === "MALIK" ? (
                      ownedUnits.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {ownedUnits.map((u) => (
                            <span key={u.id} className="bg-white border border-[#e4eae3] px-2 py-0.5 rounded-md text-xs font-bold text-[#172b2b]">
                              {u.blockName} D:{u.unitNumber} ({u.type})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Tanımlı daire yok</span>
                      )
                    ) : (
                      rentedUnit ? (
                        <span className="bg-white border border-blue-200 px-2 py-0.5 rounded-md text-xs font-bold text-blue-900">
                          {rentedUnit.blockName} D:{rentedUnit.unitNumber} ({rentedUnit.type})
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Atanmış aktif daire yok</span>
                      )
                    )}
                  </div>

                  {person.notes && (
                    <p className="text-[11px] text-[#87928e] italic mt-1">"{person.notes}"</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f0f4f1] flex items-center justify-between text-xs text-slate-400">
                <span>Kayıt: 2026</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Aktif Sakin
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW RESIDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div>
                <h3 className="text-base font-bold text-[#172b2b]">Yeni Kişi (Malik / Kiracı) Ekle</h3>
                <p className="text-xs text-[#7c8a87]">Sistemde yeni kat maliki veya kiracı kartı oluşturun.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePerson} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Kişi Türü</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPersonData({ ...newPersonData, type: "MALIK" })}
                    className={`py-2 text-center rounded-xl font-bold border transition ${
                      newPersonData.type === "MALIK"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                        : "bg-white border-[#e4eae3] text-slate-600"
                    }`}
                  >
                    Kat Maliki (Ev Sahibi)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPersonData({ ...newPersonData, type: "KIRACI" })}
                    className={`py-2 text-center rounded-xl font-bold border transition ${
                      newPersonData.type === "KIRACI"
                        ? "bg-blue-50 border-blue-300 text-blue-900"
                        : "bg-white border-[#e4eae3] text-slate-600"
                    }`}
                  >
                    Kiracı
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Ad Soyad / Firma Ünvanı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={newPersonData.fullName}
                  onChange={(e) => setNewPersonData({ ...newPersonData, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Telefon Numarası *</label>
                  <input
                    type="tel"
                    required
                    placeholder="05XX XXX XX XX"
                    value={newPersonData.phone}
                    onChange={(e) => setNewPersonData({ ...newPersonData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">E-Posta Adresi</label>
                  <input
                    type="email"
                    placeholder="ornek@email.com"
                    value={newPersonData.email}
                    onChange={(e) => setNewPersonData({ ...newPersonData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">TC Kimlik / Vergi No</label>
                  <input
                    type="text"
                    maxLength={11}
                    placeholder="11 haneli TC No"
                    value={newPersonData.tcOrTaxNo}
                    onChange={(e) => setNewPersonData({ ...newPersonData, tcOrTaxNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Acil Durum İletişim Tel</label>
                  <input
                    type="tel"
                    placeholder="Yakını tel no"
                    value={newPersonData.emergencyPhone}
                    onChange={(e) => setNewPersonData({ ...newPersonData, emergencyPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Özel Notlar</label>
                <textarea
                  rows={2}
                  placeholder="Kişiye dair özel yönetim notları..."
                  value={newPersonData.notes}
                  onChange={(e) => setNewPersonData({ ...newPersonData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 resize-none"
                />
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

      {/* ASSIGN TENANT MODAL */}
      {isAssignTenantModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div>
                <h3 className="text-base font-bold text-[#172b2b]">Daireye Kiracı Ata / Değiştir</h3>
                <p className="text-xs text-[#7c8a87]">Eski kiracı geçmişi korunarak daireye yeni kiracı tanımlanır.</p>
              </div>
              <button onClick={() => setIsAssignTenantModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignTenant} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Hedef Daireyi Seçin *</label>
                <select
                  required
                  value={selectedUnitForTenant}
                  onChange={(e) => setSelectedUnitForTenant(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="">-- Daire Seçiniz --</option>
                  {activeSiteUnits.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.blockName} Daire {u.unitNumber} ({u.residentType === "KIRACI_OTURUYOR" ? "Mevcut Kiracı Var" : "Malik / Boş"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Kiracı Kişisini Seçin *</label>
                <select
                  required
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="">-- Kiracı Seçiniz --</option>
                  {activeSitePeople.filter(p => p.type === "KIRACI").map(p => (
                    <option key={p.id} value={p.id}>{p.fullName} ({p.phone})</option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 text-blue-900 border border-blue-100 text-[11px] leading-relaxed">
                ℹ️ <strong>Geçmiş Korunur:</strong> Yeni kiracı atandığında eski kiracının borç ve ödeme ekstreleri bozulmaz; yeni dönemin borçları yeni kiracı hesabına yansıtılır.
              </div>

              <div className="pt-3 border-t border-[#e4eae3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignTenantModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800 transition shadow-sm"
                >
                  Kiracıyı Daireye Ata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
