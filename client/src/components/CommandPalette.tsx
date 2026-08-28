import React, { useState, useEffect } from "react";
import {
  Search, Building2, Users, Receipt, HandCoins,
  ShieldAlert, ArrowUpRight, Landmark, LifeBuoy, Bell,
  Sparkles, X, ArrowRight, CornerDownLeft, ShieldCheck,
  CheckCircle2, CreditCard, Wrench, FileText
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { AppModule } from "@/types";
import { formatCurrency } from "@/utils/formatters";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: AppModule) => void;
  onSelectUnit?: (unitId: string) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onSelectUnit,
}: CommandPaletteProps) {
  const { activeSiteUnits, activeSitePeople, activeSiteCollections, activeSiteRequests, activeSite } = useApp();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredUnits = query.trim()
    ? activeSiteUnits.filter(
        (u) =>
          u.unitNumber.toLowerCase().includes(query.toLowerCase()) ||
          u.blockName.toLowerCase().includes(query.toLowerCase()) ||
          u.ownerName.toLowerCase().includes(query.toLowerCase()) ||
          (u.tenantName && u.tenantName.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5)
    : [];

  const filteredPeople = query.trim()
    ? activeSitePeople.filter(
        (p) =>
          p.fullName.toLowerCase().includes(query.toLowerCase()) ||
          p.phone.includes(query) ||
          p.email.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4)
    : [];

  const modulesList: { id: AppModule; name: string; category: string; icon: any }[] = [
    { id: "DASHBOARD", name: "Yönetici Kokpiti", category: "Genel", icon: Sparkles },
    { id: "UNITS", name: "Bağımsız Bölümler & Daireler", category: "Mülk", icon: Building2 },
    { id: "RESIDENTS", name: "Kat Malikleri & Kiracılar", category: "Mülk", icon: Users },
    { id: "DUES_TAHAKKUK", name: "Toplu Aidat & Borçlandırma", category: "Finans", icon: Receipt },
    { id: "COLLECTIONS", name: "Tahsilat & Resmi Makbuz Girişi", category: "Finans", icon: HandCoins },
    { id: "DEBTORS_AGING", name: "Borçlu Takibi & Yaşlandırma (%5 Faiz)", category: "Finans", icon: ShieldAlert },
    { id: "INCOME_EXPENSE", name: "Gelir-Gider & Fatura Yönetimi", category: "Finans", icon: ArrowUpRight },
    { id: "CASH_BANK", name: "Kasa, Banka & Virman Transferleri", category: "Finans", icon: Landmark },
    { id: "VENDORS", name: "Tedarikçi & Hizmet Sözleşmeleri", category: "Finans", icon: HandCoins },
    { id: "BUDGET", name: "İşletme Projesi & Bütçe Planlama", category: "Finans", icon: FileText },
    { id: "REPORTS", name: "10+ Resmi ve Mali Rapor Dökümü", category: "Raporlar", icon: FileText },
    { id: "REQUESTS", name: "Arıza & Talep Kanban Takibi", category: "Operasyon", icon: Wrench },
    { id: "ANNOUNCEMENTS", name: "Duyuru ve SMS/E-posta Bildirim", category: "İletişim", icon: Bell },
    { id: "RESIDENT_PORTAL", name: "Sakin Portalı & Online Kart Ödeme", category: "Sakin", icon: CreditCard },
  ];

  const filteredModules = modulesList.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#e4eae3] overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e4eae3] bg-[#fafcfa]">
          <Search size={20} className="text-emerald-700 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Daire no, sakin adı, telefon, modül veya işlem arayın... (örn: 14, Mehmet, aidat, kasa)"
            className="w-full bg-transparent text-sm font-semibold text-[#172b2b] placeholder:text-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-400"
            >
              <X size={16} />
            </button>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 bg-white border border-[#e4eae3] px-2 py-0.5 rounded-md shadow-xs">
              ESC
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 scrollbar-thin">
          {/* Quick Daire / Unit Matches */}
          {filteredUnits.length > 0 && (
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7a8c88] px-3 block mb-1.5">
                BAĞIMSIZ BÖLÜMLER ({filteredUnits.length})
              </span>
              <div className="space-y-1">
                {filteredUnits.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onNavigate("UNITS");
                      if (onSelectUnit) onSelectUnit(u.id);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-emerald-50 text-left transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#d5f1d2] text-[#2b6534] font-bold text-xs flex items-center justify-center">
                        {u.unitNumber}
                      </div>
                      <div>
                        <strong className="text-xs text-[#172b2b] block group-hover:text-emerald-900">
                          {u.blockName} Blok - No: {u.unitNumber} ({u.type})
                        </strong>
                        <span className="text-[11px] text-slate-500">
                          Malik: {u.ownerName} {u.tenantName ? `· Kiracı: ${u.tenantName}` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-bold ${u.currentBalance > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                        {u.currentBalance > 0 ? `Borç: ${formatCurrency(u.currentBalance)}` : "Borçsuz"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{u.grossM2} m²</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick People Matches */}
          {filteredPeople.length > 0 && (
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7a8c88] px-3 block mb-1.5">
                SAKİNLER & KİŞİLER ({filteredPeople.length})
              </span>
              <div className="space-y-1">
                {filteredPeople.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onNavigate("RESIDENTS");
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-blue-50 text-left transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                        {p.fullName.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <strong className="text-xs text-[#172b2b] block group-hover:text-blue-900">
                          {p.fullName} ({p.type === "MALIK" ? "Kat Maliki" : "Kiracı"})
                        </strong>
                        <span className="text-[11px] text-slate-500">
                          {p.phone} · {p.email}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded-md">
                      {p.units.join(", ")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* System Modules */}
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7a8c88] px-3 block mb-1.5">
              {query ? `EŞLEŞEN MODÜLLER (${filteredModules.length})` : "SİSTEM MODÜLLERİ & HIZLI ERİŞİM"}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {filteredModules.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      onNavigate(m.id);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-[#f4f7f4] border border-transparent hover:border-[#e2ebe1] text-left transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#edf5ec] text-emerald-800 flex items-center justify-center">
                        <Icon size={15} />
                      </div>
                      <div>
                        <strong className="text-xs text-[#172b2b] block group-hover:text-emerald-900">
                          {m.name}
                        </strong>
                        <span className="text-[10px] text-slate-400">{m.category}</span>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-slate-300 group-hover:text-emerald-700 transition" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-[#fafcfa] border-t border-[#e4eae3] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span><strong>{activeSite.name}</strong> portföyünde aranıyor</span>
            <span>·</span>
            <span className="text-emerald-700 font-bold">%100 Ücretsiz SaaS</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span>Seçmek için</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[9px]">↵ Enter</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
