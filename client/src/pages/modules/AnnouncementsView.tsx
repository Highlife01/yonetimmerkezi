import React, { useState } from "react";
import {
  Bell, Plus, Search, Pin, CalendarDays, User,
  AlertTriangle, CheckCircle2, ShieldCheck, X
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Announcement } from "@/types";
import { toast } from "sonner";

interface AnnouncementsViewProps {
  initialOpenModal?: boolean;
}

export default function AnnouncementsView({ initialOpenModal = false }: AnnouncementsViewProps) {
  const { activeSite, activeSiteAnnouncements, addAnnouncement } = useApp();
  const { hasPermission } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(initialOpenModal);
  const [newAnn, setNewAnn] = useState({
    title: "",
    content: "",
    priority: "NORMAL" as Announcement["priority"],
    targetScope: "TUM_SITE" as Announcement["targetScope"],
    isPinned: false,
  });

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnn.title || !newAnn.content) {
      toast.error("Lütfen başlık ve içerik giriniz.");
      return;
    }

    addAnnouncement(newAnn);
    setIsAddModalOpen(false);
    toast.success("Duyuru tüm sakinlerin portalında başarıyla yayınlandı.");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">Duyuru ve Bilgilendirme Merkezi</h2>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              Tüm site sakinlerine veya belirli bloklara anlık duyuru yayınlayın, sakin portalında gösterin.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#172b2b] text-white text-xs font-bold hover:bg-[#294342] transition shadow-sm"
            >
              <Plus size={16} /> Yeni Duyuru Yayınla
            </button>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeSiteAnnouncements.map((ann) => (
          <div
            key={ann.id}
            className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between ${
              ann.isPinned ? "border-emerald-300 ring-1 ring-emerald-200" : "border-[#e4eae3]"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ann.priority === "ACIL" ? "bg-rose-100 text-rose-800" :
                    ann.priority === "BILGI" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700"
                  }`}>
                    {ann.priority === "ACIL" ? "Acil Duyuru" : ann.priority === "BILGI" ? "Mali Bilgi" : "Genel Bilgi"}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                    {ann.targetScope === "TUM_SITE" ? "Tüm Site" : ann.targetScope}
                  </span>
                </div>

                {ann.isPinned && (
                  <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                    <Pin size={13} /> Sabitlendi
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-[#172b2b] mt-2.5">{ann.title}</h3>
              <p className="text-xs text-[#52635f] leading-relaxed mt-2">{ann.content}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-[#f0f4f1] flex items-center justify-between text-xs text-[#9aa6a1]">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={13} /> {ann.date}
              </span>
              <span>Yayınlayan: <strong>{ann.authorName}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* NEW ANNOUNCEMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <Bell size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172b2b]">Yeni Duyuru Yayınla</h3>
                  <p className="text-xs text-[#7c8a87]">Sakin portalında anında görünecektir.</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Duyuru Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Otopark Epoksi Zemin Bakımı..."
                  value={newAnn.title}
                  onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Öncelik Seviyesi</label>
                  <select
                    value={newAnn.priority}
                    onChange={(e) => setNewAnn({ ...newAnn, priority: e.target.value as Announcement["priority"] })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="ACIL">Acil</option>
                    <option value="BILGI">Bilgilendirme</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Hedef Kitle</label>
                  <select
                    value={newAnn.targetScope}
                    onChange={(e) => setNewAnn({ ...newAnn, targetScope: e.target.value as Announcement["targetScope"] })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="TUM_SITE">Tüm Site</option>
                    <option value="A_BLOK">A Blok</option>
                    <option value="B_BLOK">B Blok</option>
                    <option value="C_BLOK">C Blok</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Duyuru Metni *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Duyuru içeriği ve detaylar..."
                  value={newAnn.content}
                  onChange={(e) => setNewAnn({ ...newAnn, content: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={newAnn.isPinned}
                  onChange={(e) => setNewAnn({ ...newAnn, isPinned: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <label htmlFor="pinCheck" className="text-slate-700 font-semibold cursor-pointer">
                  Bu duyuruyu üstte sabitle (Önemli duyurular için)
                </label>
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
                  Duyuruyu Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
