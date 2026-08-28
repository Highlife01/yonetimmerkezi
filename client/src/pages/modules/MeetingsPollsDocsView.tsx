import React, { useState } from "react";
import {
  CalendarDays, Vote, FileText, Plus, Download,
  CheckCircle2, AlertCircle, FileCheck2, Lock, Eye, X
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function MeetingsPollsDocsView() {
  const { activeSite, activeSiteMeetings, activeSitePolls, activeSiteDocuments, votePoll } = useApp();
  const { currentUser, hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<"MEETINGS" | "POLLS" | "DOCS">("MEETINGS");

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">Toplantılar, Anketler ve Dijital Belge Arşivi</h2>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              Genel kurul tutanakları, kat malikleri karar defteri, sakin anketleri ve yönetim planı arşivi.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#f0f4f1]">
          <div className="inline-flex rounded-xl border border-[#e4eae3] p-1 bg-slate-50">
            <button
              onClick={() => setActiveTab("MEETINGS")}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === "MEETINGS" ? "bg-white text-[#172b2b] shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <CalendarDays size={14} /> Genel Kurul Toplantıları ({activeSiteMeetings.length})
            </button>
            <button
              onClick={() => setActiveTab("POLLS")}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === "POLLS" ? "bg-white text-purple-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Vote size={14} /> Sakin Anketleri ({activeSitePolls.length})
            </button>
            <button
              onClick={() => setActiveTab("DOCS")}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === "DOCS" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText size={14} /> Resmi Belge Arşivi ({activeSiteDocuments.length})
            </button>
          </div>
        </div>
      </div>

      {/* MEETINGS TAB */}
      {activeTab === "MEETINGS" && (
        <div className="space-y-4">
          {activeSiteMeetings.map((meeting) => (
            <div key={meeting.id} className="bg-white border border-[#e4eae3] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e4eae3]">
                <div>
                  <h3 className="text-base font-bold text-[#172b2b]">{meeting.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-[#7c8a87] mt-1">
                    <span>Tarih: <strong>{meeting.date}</strong></span>
                    <span>Konum: <strong>{meeting.location}</strong></span>
                  </div>
                </div>
                <button
                  onClick={() => toast.info("İmzalı Genel Kurul Tutanağı PDF olarak indiriliyor...")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#172b2b] transition"
                >
                  <Download size={14} /> İmzalı Tutanağı İndir (PDF)
                </button>
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
                <span>{meeting.quorumInfo}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <strong className="text-[#172b2b] font-bold block">Gündem Maddeleri:</strong>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                    {meeting.agendaItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <strong className="text-[#172b2b] font-bold block text-emerald-900">Alınan Kararlar:</strong>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-800">
                    {meeting.decisions.map((dec, i) => (
                      <li key={i}>{dec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POLLS TAB */}
      {activeTab === "POLLS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeSitePolls.map((poll) => (
            <div key={poll.id} className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800">
                    {poll.status === "AKTIF" ? "Aktif Oylama" : "Sonuçlandı"}
                  </span>
                  <span className="text-xs text-slate-400">Bitiş: {poll.endDate}</span>
                </div>
                <h3 className="text-base font-bold text-[#172b2b] mt-2">{poll.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{poll.description}</p>
              </div>

              {/* Options & Voting */}
              <div className="space-y-2 pt-2 border-t border-[#f0f4f1]">
                {poll.options.map((opt) => {
                  const percent = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        votePoll(poll.id, opt.id);
                        toast.success(`Oyunuz kaydedildi: "${opt.text}"`);
                      }}
                      className="p-3 rounded-xl border border-[#e4eae3] hover:border-purple-300 hover:bg-purple-50/30 transition cursor-pointer space-y-1.5"
                    >
                      <div className="flex justify-between text-xs font-bold text-[#172b2b]">
                        <span>{opt.text}</span>
                        <span>%{percent} ({opt.votes} Oy)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-xs text-slate-400 text-right">
                Toplam <strong>{poll.totalVotes}</strong> oy kullanıldı.
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DOCS TAB */}
      {activeTab === "DOCS" && (
        <div className="bg-white border border-[#e4eae3] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Belge Başlığı</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Dosya Adı</th>
                <th className="py-3 px-4">Boyut</th>
                <th className="py-3 px-4">Yükleme Tarihi</th>
                <th className="py-3 px-4 text-center">İndir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4f1]">
              {activeSiteDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-[#172b2b] flex items-center gap-2">
                    <FileText size={16} className="text-emerald-700" /> {doc.title}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">{doc.fileName}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">{doc.fileSize}</td>
                  <td className="py-3.5 px-4 text-slate-500">{doc.uploadedAt}</td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => toast.success(`${doc.fileName} başarıyla indirildi.`)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title="Belgeyi İndir"
                    >
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
