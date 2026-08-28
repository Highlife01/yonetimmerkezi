import React, { useState } from "react";
import {
  LifeBuoy, Plus, Search, Filter, CheckCircle2, Clock,
  AlertTriangle, Wrench, ArrowUpRight, User, Phone,
  Camera, MessageSquare, X, ShieldAlert
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { ServiceRequest, RequestStatus, RequestPriority } from "@/types";
import { formatDateTime } from "@/utils/formatters";
import { toast } from "sonner";

interface RequestsComplaintsViewProps {
  initialOpenModal?: boolean;
}

export default function RequestsComplaintsView({ initialOpenModal = false }: RequestsComplaintsViewProps) {
  const {
    activeSite, activeSiteRequests, activeSiteUnits,
    createServiceRequest, updateRequestStatus, staff
  } = useApp();
  const { currentUser, hasPermission } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialOpenModal);
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<ServiceRequest | null>(null);

  // New Request state
  const [newReqData, setNewReqData] = useState({
    unitId: activeSiteUnits[0]?.id || "",
    category: "ELEKTRIK" as ServiceRequest["category"],
    title: "",
    description: "",
    priority: "ORTA" as RequestPriority,
  });

  const filteredRequests = activeSiteRequests.filter((r) => {
    if (selectedStatus !== "ALL" && r.status !== selectedStatus) return false;
    if (selectedCategory !== "ALL" && r.category !== selectedCategory) return false;
    const q = search.toLocaleLowerCase("tr-TR").trim();
    if (q) {
      const matchText = `${r.title} ${r.unitName} ${r.reportedByName} ${r.description}`.toLocaleLowerCase("tr-TR");
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const handleSaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqData.title || !newReqData.description) {
      toast.error("Lütfen başlık ve açıklama giriniz.");
      return;
    }

    createServiceRequest(newReqData);
    setIsAddModalOpen(false);
    toast.success("Arıza / servis talebi başarıyla açıldı.");
  };

  const handleStatusChange = (requestId: string, newStatus: RequestStatus) => {
    updateRequestStatus(requestId, newStatus);
    if (selectedRequestForDetail?.id === requestId) {
      setSelectedRequestForDetail({ ...selectedRequestForDetail, status: newStatus });
    }
    toast.success(`Talep durumu "${newStatus}" olarak güncellendi.`);
  };

  const statuses: { id: RequestStatus; label: string; color: string; bg: string }[] = [
    { id: "YENI", label: "Yeni Bildirildi", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    { id: "INCELENIYOR", label: "İnceleniyor", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    { id: "ISLEME_ALINDI", label: "İşleme Alındı", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
    { id: "TAMAMLANDI", label: "Tamamlandı", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">Arıza ve Servis Talepleri</h2>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              Sakinlerden veya personelden gelen arıza bildirimleri, iş emri atamaları ve aşama takibi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#172b2b] text-white text-xs font-bold hover:bg-[#294342] transition shadow-sm"
            >
              <Plus size={16} /> Yeni Talep Bildir
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-[#f0f4f1]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa7a2]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Talep ara: başlık, daire, sakin..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 bg-white"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="ALL">Tüm Durumlar</option>
              <option value="YENI">Yeni Bildirildi</option>
              <option value="INCELENIYOR">İnceleniyor</option>
              <option value="ISLEME_ALINDI">İşleme Alındı</option>
              <option value="TAMAMLANDI">Tamamlandı</option>
            </select>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="ALL">Tüm Kategoriler</option>
              <option value="ELEKTRIK">Elektrik & Aydınlatma</option>
              <option value="TESISAT">Sıhhi Tesisat & Su</option>
              <option value="ASANSOR">Asansör</option>
              <option value="PEYZAJ">Bahçe & Peyzaj</option>
              <option value="TEMIZLIK">Temizlik</option>
              <option value="GUVENLIK">Güvenlik</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-1.5">
            <div className="inline-flex rounded-lg border border-[#e4eae3] p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-2.5 py-1 text-xs rounded-md font-semibold ${viewMode === "kanban" ? "bg-white text-[#172b2b] shadow-xs" : "text-slate-500"}`}
              >
                Kanban Panosu
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

      {/* KANBAN VIEW */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {statuses.map((col) => {
            const colRequests = filteredRequests.filter((r) => r.status === col.id);

            return (
              <div key={col.id} className="bg-[#f8faf7] border border-[#e4eae3] rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      col.id === "YENI" ? "bg-blue-500" :
                      col.id === "INCELENIYOR" ? "bg-amber-500" :
                      col.id === "ISLEME_ALINDI" ? "bg-purple-500" : "bg-emerald-500"
                    }`} />
                    <strong className="text-xs font-bold text-[#172b2b]">{col.label}</strong>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#e4eae3] text-slate-700">
                    {colRequests.length}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[300px]">
                  {colRequests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequestForDetail(req)}
                      className="bg-white border border-[#e4eae3] hover:border-emerald-300 rounded-xl p-3.5 shadow-xs hover:shadow-md transition cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {req.category}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          req.priority === "ACIL" ? "bg-rose-100 text-rose-800" :
                          req.priority === "YUKSEK" ? "bg-orange-100 text-orange-800" : "bg-slate-100 text-slate-600"
                        }`}>
                          {req.priority}
                        </span>
                      </div>

                      <strong className="text-xs font-bold text-[#172b2b] block leading-snug">{req.title}</strong>
                      <p className="text-[11px] text-[#7c8a87] line-clamp-2">{req.description}</p>

                      <div className="pt-2 border-t border-[#f0f4f1] flex items-center justify-between text-[10px] text-[#9aa7a2]">
                        <span>{req.unitName}</span>
                        <span>{req.createdAt.split(" ")[0]}</span>
                      </div>
                    </div>
                  ))}

                  {colRequests.length === 0 && (
                    <div className="py-12 text-center text-xs text-slate-400 italic">
                      Bu aşamada talep yok.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white border border-[#e4eae3] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-4">Bağımsız Bölüm</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Talep Başlığı</th>
                <th className="py-3 px-4">Bildiren</th>
                <th className="py-3 px-4">Öncelik</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4 text-center">İncele</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4f1]">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => setSelectedRequestForDetail(req)}>
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{req.createdAt}</td>
                  <td className="py-3.5 px-4 font-bold text-[#172b2b]">{req.unitName}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{req.category}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#172b2b]">{req.title}</td>
                  <td className="py-3.5 px-4 text-slate-700">{req.reportedByName}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      req.priority === "ACIL" ? "bg-rose-100 text-rose-800" :
                      req.priority === "YUKSEK" ? "bg-orange-100 text-orange-800" : "bg-slate-100 text-slate-600"
                    }`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      req.status === "YENI" ? "bg-blue-50 text-blue-800" :
                      req.status === "INCELENIYOR" ? "bg-amber-50 text-amber-800" :
                      req.status === "ISLEME_ALINDI" ? "bg-purple-50 text-purple-800" : "bg-emerald-50 text-emerald-800"
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button className="text-xs font-bold text-emerald-700 hover:underline">Detay</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REQUEST DETAIL MODAL */}
      {selectedRequestForDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {selectedRequestForDetail.category} · {selectedRequestForDetail.unitName}
                </span>
                <h3 className="text-base font-bold text-[#172b2b] mt-1">{selectedRequestForDetail.title}</h3>
              </div>
              <button onClick={() => setSelectedRequestForDetail(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#f8faf7] rounded-xl border border-[#e4eae3] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bildiren Sakin:</span>
                  <strong>{selectedRequestForDetail.reportedByName} ({selectedRequestForDetail.reportedByPhone})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bildirim Tarihi:</span>
                  <span className="font-mono">{selectedRequestForDetail.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Öncelik:</span>
                  <span className="font-bold text-rose-600">{selectedRequestForDetail.priority}</span>
                </div>
              </div>

              <div>
                <strong className="text-slate-700 block mb-1">Açıklama:</strong>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-800 leading-relaxed border border-slate-100">
                  {selectedRequestForDetail.description}
                </p>
              </div>

              {/* Status Update Buttons */}
              <div className="pt-2">
                <strong className="text-slate-700 block mb-2">Durumu Güncelle:</strong>
                <div className="grid grid-cols-4 gap-1.5">
                  {statuses.map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleStatusChange(selectedRequestForDetail.id, st.id)}
                      className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition ${
                        selectedRequestForDetail.status === st.id
                          ? "bg-[#172b2b] text-white border-[#172b2b] shadow-xs"
                          : "bg-white border-[#e4eae3] text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e4eae3] flex justify-end">
              <button
                onClick={() => setSelectedRequestForDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition text-xs"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW REQUEST MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <h3 className="text-base font-bold text-[#172b2b]">Yeni Arıza / Talep Bildirimi</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRequest} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Daire / Alan *</label>
                  <select
                    value={newReqData.unitId}
                    onChange={(e) => setNewReqData({ ...newReqData, unitId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    {activeSiteUnits.map(u => (
                      <option key={u.id} value={u.id}>{u.blockName} Daire {u.unitNumber}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Kategori</label>
                  <select
                    value={newReqData.category}
                    onChange={(e) => setNewReqData({ ...newReqData, category: e.target.value as ServiceRequest["category"] })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="ELEKTRIK">Elektrik</option>
                    <option value="TESISAT">Sıhhi Tesisat</option>
                    <option value="ASANSOR">Asansör</option>
                    <option value="PEYZAJ">Bahçe / Peyzaj</option>
                    <option value="TEMIZLIK">Temizlik</option>
                    <option value="GUVENLIK">Güvenlik</option>
                    <option value="SES_GURULTU">Gürültü / Düzen</option>
                    <option value="DIGER">Diğer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Öncelik Seviyesi</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["DUSUK", "ORTA", "YUKSEK", "ACIL"] as RequestPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewReqData({ ...newReqData, priority: p })}
                      className={`py-2 rounded-xl text-center font-bold border transition ${
                        newReqData.priority === p
                          ? p === "ACIL" ? "bg-rose-600 text-white border-rose-600" : "bg-[#172b2b] text-white border-[#172b2b]"
                          : "bg-white border-[#e4eae3] text-slate-700"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Talep / Arıza Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 4. kat holü lamba çalışmıyor"
                  value={newReqData.title}
                  onChange={(e) => setNewReqData({ ...newReqData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Detaylı Açıklama *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Arızaya dair detaylar..."
                  value={newReqData.description}
                  onChange={(e) => setNewReqData({ ...newReqData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 resize-none"
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
                  Talebi Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
