import React, { useState } from "react";
import {
  ShieldCheck, Package, Car, Users, Plus, Search,
  Clock, CheckCircle2, AlertCircle, ArrowRight, X, Phone
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { ParcelLog, VisitorLog } from "@/types";
import { formatDateTime } from "@/utils/formatters";
import { toast } from "sonner";

export default function SecurityGateView() {
  const {
    activeSite, activeSiteUnits, activeSiteVisitors,
    activeSiteParcels, addVisitorLog, markVisitorExit,
    addParcelLog, updateParcelStatus, people
  } = useApp();
  const { currentUser, hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<"VISITORS" | "PARCELS" | "VEHICLES">("VISITORS");
  const [vehicleSearch, setVehicleSearch] = useState("");

  // Modals
  const [isAddVisitorModalOpen, setIsAddVisitorModalOpen] = useState(false);
  const [isAddParcelModalOpen, setIsAddParcelModalOpen] = useState(false);

  // Forms
  const [newVisitor, setNewVisitor] = useState({
    visitorName: "",
    unitId: activeSiteUnits[0]?.id || "",
    vehiclePlate: "",
    notes: "",
  });

  const [newParcel, setNewParcel] = useState({
    unitId: activeSiteUnits[0]?.id || "",
    recipientName: "",
    cargoCompany: "Trendyol Express" as ParcelLog["cargoCompany"],
    trackingNumber: "",
  });

  // Handle Save Visitor
  const handleSaveVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitor.visitorName || !newVisitor.unitId) {
      toast.error("Lütfen ziyaretçi adı ve daire seçiniz.");
      return;
    }
    const unit = activeSiteUnits.find((u) => u.id === newVisitor.unitId);
    addVisitorLog({
      siteId: activeSite.id,
      visitorName: newVisitor.visitorName,
      unitId: newVisitor.unitId,
      unitName: unit ? `${unit.blockName} D:${unit.unitNumber}` : "Daire",
      vehiclePlate: newVisitor.vehiclePlate,
      notes: newVisitor.notes,
    });
    setIsAddVisitorModalOpen(false);
    toast.success("Ziyaretçi girişi başarıyla kaydedildi.");
  };

  // Handle Save Parcel
  const handleSaveParcel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParcel.unitId || !newParcel.recipientName) {
      toast.error("Lütfen daire ve teslim alacak kişi adını giriniz.");
      return;
    }
    const unit = activeSiteUnits.find((u) => u.id === newParcel.unitId);
    addParcelLog({
      siteId: activeSite.id,
      unitId: newParcel.unitId,
      unitName: unit ? `${unit.blockName} D:${unit.unitNumber}` : "Daire",
      recipientName: newParcel.recipientName,
      cargoCompany: newParcel.cargoCompany,
      trackingNumber: newParcel.trackingNumber,
    });
    setIsAddParcelModalOpen(false);
    toast.success("Kargo teslim alındı ve sakine SMS/Bildirim iletildi.");
  };

  // Filtered vehicles for search
  const filteredVehicles = activeSiteUnits.flatMap((u) => {
    const occupant = u.tenantId ? people.find(p => p.id === u.tenantId) : people.find(p => p.id === u.ownerId);
    return u.vehiclePlates.map((plate) => ({
      plate,
      unit: u,
      occupant,
    }));
  }).filter((v) => {
    const q = vehicleSearch.toLocaleLowerCase("tr-TR").trim();
    if (q && !v.plate.toLocaleLowerCase("tr-TR").includes(q) && !v.occupant?.fullName.toLocaleLowerCase("tr-TR").includes(q)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">Güvenlik, Ziyaretçi ve Kargo Paneli</h2>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              Nizamiye kapısı ziyaretçi kayıtları, emanet kargolar ve otopark araç plaka sorgulama.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {activeTab === "VISITORS" && (
              <button
                onClick={() => setIsAddVisitorModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#172b2b] text-white text-xs font-bold hover:bg-[#294342] transition shadow-sm"
              >
                <Plus size={16} /> Ziyaretçi Girişi Kaydet
              </button>
            )}
            {activeTab === "PARCELS" && (
              <button
                onClick={() => setIsAddParcelModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition shadow-sm"
              >
                <Package size={16} /> Yeni Kargo Teslim Al
              </button>
            )}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#f0f4f1]">
          <div className="inline-flex rounded-xl border border-[#e4eae3] p-1 bg-slate-50">
            <button
              onClick={() => setActiveTab("VISITORS")}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === "VISITORS" ? "bg-white text-[#172b2b] shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users size={14} /> Ziyaretçiler ({activeSiteVisitors.length})
            </button>
            <button
              onClick={() => setActiveTab("PARCELS")}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === "PARCELS" ? "bg-white text-blue-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Package size={14} /> Kargolar ({activeSiteParcels.filter(p => p.status !== "TESLIM_EDILDI").length} Bekleyen)
            </button>
            <button
              onClick={() => setActiveTab("VEHICLES")}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === "VEHICLES" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Car size={14} /> Araç / Plaka Sorgulama
            </button>
          </div>
        </div>
      </div>

      {/* VISITORS TAB */}
      {activeTab === "VISITORS" && (
        <div className="bg-white border border-[#e4eae3] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Giriş Saati</th>
                <th className="py-3 px-4">Ziyaretçi Adı</th>
                <th className="py-3 px-4">Ziyaret Edilen Daire</th>
                <th className="py-3 px-4">Araç Plakası</th>
                <th className="py-3 px-4">Çıkış Saati</th>
                <th className="py-3 px-4">Kayıt Yapan Görevli</th>
                <th className="py-3 px-4 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4f1]">
              {activeSiteVisitors.map((vis) => (
                <tr key={vis.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{vis.entryTime}</td>
                  <td className="py-3.5 px-4 font-bold text-[#172b2b]">{vis.visitorName}</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-800">{vis.unitName}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">{vis.vehiclePlate || "-"}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    {vis.exitTime ? (
                      <span className="text-slate-500">{vis.exitTime}</span>
                    ) : (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                        İçeride
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{vis.guardName}</td>
                  <td className="py-3.5 px-4 text-center">
                    {!vis.exitTime && (
                      <button
                        onClick={() => {
                          markVisitorExit(vis.id);
                          toast.success("Ziyaretçi çıkışı kaydedildi.");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
                      >
                        Çıkış Yap
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PARCELS TAB */}
      {activeTab === "PARCELS" && (
        <div className="bg-white border border-[#e4eae3] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Teslim Alınma Zamanı</th>
                <th className="py-3 px-4">Daire</th>
                <th className="py-3 px-4">Alıcı Sakin</th>
                <th className="py-3 px-4">Kargo Firması</th>
                <th className="py-3 px-4">Takip No</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4f1]">
              {activeSiteParcels.map((parcel) => (
                <tr key={parcel.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{parcel.receivedTime}</td>
                  <td className="py-3.5 px-4 font-bold text-[#172b2b]">{parcel.unitName}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{parcel.recipientName}</td>
                  <td className="py-3.5 px-4 text-slate-700">{parcel.cargoCompany}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{parcel.trackingNumber || "-"}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      parcel.status === "TESLIM_EDILDI" ? "bg-slate-100 text-slate-700" :
                      parcel.status === "BILDIRILDI" ? "bg-blue-50 text-blue-800" : "bg-amber-50 text-amber-800"
                    }`}>
                      {parcel.status === "TESLIM_EDILDI" ? "Sakine Teslim Edildi" :
                       parcel.status === "BILDIRILDI" ? "Sakine Bildirildi" : "Güvenlikte Bekliyor"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {parcel.status !== "TESLIM_EDILDI" && (
                      <button
                        onClick={() => {
                          updateParcelStatus(parcel.id, "TESLIM_EDILDI");
                          toast.success("Kargo sakine teslim edildi olarak işaretlendi.");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                      >
                        Sakine Teslim Et
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VEHICLES SEARCH TAB */}
      {activeTab === "VEHICLES" && (
        <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa7a2]" />
            <input
              type="text"
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
              placeholder="Plaka veya sakin adı girin (Örn: 34 AB)..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredVehicles.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-[#e4eae3] bg-[#f8faf7] flex items-center justify-between">
                <div>
                  <span className="font-mono text-base font-extrabold text-[#172b2b] bg-white px-2.5 py-1 rounded-lg border border-[#e4eae3] inline-block mb-2">
                    {item.plate}
                  </span>
                  <strong className="text-xs font-bold text-[#172b2b] block">{item.unit.blockName} Daire {item.unit.unitNumber}</strong>
                  <span className="text-[11px] text-slate-600 block">{item.occupant?.fullName} (Tel: {item.occupant?.phone || "-"})</span>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span>Park: <strong>{item.unit.parkingLotNumber || "Genel"}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW VISITOR MODAL */}
      {isAddVisitorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <h3 className="text-base font-bold text-[#172b2b]">Ziyaretçi Girişi Kaydet</h3>
              <button onClick={() => setIsAddVisitorModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveVisitor} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Ziyaretçi Ad Soyad *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Burak Kaya"
                  value={newVisitor.visitorName}
                  onChange={(e) => setNewVisitor({ ...newVisitor, visitorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Ziyaret Edilen Daire *</label>
                <select
                  required
                  value={newVisitor.unitId}
                  onChange={(e) => setNewVisitor({ ...newVisitor, unitId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                >
                  {activeSiteUnits.map(u => (
                    <option key={u.id} value={u.id}>{u.blockName} Daire {u.unitNumber}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Araç Plakası (Varsa)</label>
                <input
                  type="text"
                  placeholder="Örn: 34 AB 1234"
                  value={newVisitor.vehiclePlate}
                  onChange={(e) => setNewVisitor({ ...newVisitor, vehiclePlate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-[#e4eae3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddVisitorModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#172b2b] text-white font-bold hover:bg-[#294342] transition shadow-sm"
                >
                  Girişi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW PARCEL MODAL */}
      {isAddParcelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <h3 className="text-base font-bold text-[#172b2b]">Emanet Kargo Teslim Al</h3>
              <button onClick={() => setIsAddParcelModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveParcel} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Daire *</label>
                <select
                  required
                  value={newParcel.unitId}
                  onChange={(e) => setNewParcel({ ...newParcel, unitId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                >
                  {activeSiteUnits.map(u => (
                    <option key={u.id} value={u.id}>{u.blockName} Daire {u.unitNumber}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Alıcı Sakin Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Selin Yılmaz"
                  value={newParcel.recipientName}
                  onChange={(e) => setNewParcel({ ...newParcel, recipientName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Kargo Firması</label>
                <select
                  value={newParcel.cargoCompany}
                  onChange={(e) => setNewParcel({ ...newParcel, cargoCompany: e.target.value as ParcelLog["cargoCompany"] })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="Trendyol Express">Trendyol Express</option>
                  <option value="Yurtiçi Kargo">Yurtiçi Kargo</option>
                  <option value="Aras Kargo">Aras Kargo</option>
                  <option value="Hepsijet">Hepsijet</option>
                  <option value="MNG Kargo">MNG Kargo</option>
                  <option value="Sürat Kargo">Sürat Kargo</option>
                  <option value="PTT Kargo">PTT Kargo</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Takip / Paket No</label>
                <input
                  type="text"
                  placeholder="Kargo takip kodu..."
                  value={newParcel.trackingNumber}
                  onChange={(e) => setNewParcel({ ...newParcel, trackingNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-[#e4eae3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddParcelModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800 transition shadow-sm"
                >
                  Kargoyu Kaydet ve Bildir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
