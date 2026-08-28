import React, { useState } from "react";
import {
  LayoutDashboard, Building2, Users, Receipt, HandCoins,
  ShieldAlert, ArrowUpRight, Landmark, Handshake, PieChart,
  FileText, LifeBuoy, Bell, Wrench, UserCheck, ShieldCheck,
  Gauge, Vote, Settings, ChevronDown, Check, LogOut, LogIn,
  Search, Plus, Sparkles, User, HelpCircle, Layers, CheckCircle2,
  CalendarDays, Wallet, CreditCard, ArrowRightLeft, Eye, RefreshCcw
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { AppModule, UserRole } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "sonner";
import LoginModal from "@/components/LoginModal";
import LoginPage from "./LoginPage";

// Import all module views
import DashboardView from "./modules/DashboardView";
import UnitsView from "./modules/UnitsView";
import ResidentsView from "./modules/ResidentsView";
import DuesTahakkukView from "./modules/DuesTahakkukView";
import CollectionsView from "./modules/CollectionsView";
import DebtorsAgingView from "./modules/DebtorsAgingView";
import IncomeExpenseView from "./modules/IncomeExpenseView";
import CashBankView from "./modules/CashBankView";
import VendorAccountsView from "./modules/VendorAccountsView";
import BudgetManagementView from "./modules/BudgetManagementView";
import ReportsView from "./modules/ReportsView";
import RequestsComplaintsView from "./modules/RequestsComplaintsView";
import AnnouncementsView from "./modules/AnnouncementsView";
import MaintenanceAssetsView from "./modules/MaintenanceAssetsView";
import StaffView from "./modules/StaffView";
import SecurityGateView from "./modules/SecurityGateView";
import MetersView from "./modules/MetersView";
import MeetingsPollsDocsView from "./modules/MeetingsPollsDocsView";
import AuditLogsSettingsView from "./modules/AuditLogsSettingsView";
import ResidentPortalView from "./modules/ResidentPortalView";
import CommandPalette from "@/components/CommandPalette";

export default function Home() {
  const {
    sites, activeSite, activeSiteId, setActiveSiteId,
    activeSiteUnits, activeSiteCollections, activeSiteExpenses,
    activeSiteRequests
  } = useApp();

  const {
    currentUser, activeRole, roleDef, switchRole,
    allUsers, switchUser, canAccessModule, isResidentRole,
    isLoginModalOpen, setIsLoginModalOpen, logout, isAuthenticated
  } = useAuth();

  const [activeModule, setActiveModule] = useState<AppModule>("DASHBOARD");
  const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [openModalSignal, setOpenModalSignal] = useState(false);

  // Quick Action Modal states for triggering inside views
  const [quickActionModal, setQuickActionModal] = useState<string | null>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // If currentUser is Kat Maliki or Kiracı and activeModule is DASHBOARD, default to RESIDENT_PORTAL
  const isResidentView = activeModule === "RESIDENT_PORTAL" || (isResidentRole && activeModule === "DASHBOARD");

  const handleNavigate = (module: AppModule) => {
    if (!canAccessModule(module)) {
      toast.error(`"${roleDef.name}" rolünüz bu modüle (${module}) erişim yetkisine sahip değildir.`);
      return;
    }
    setActiveModule(module);
  };

  // Nav categories
  const navCategories = [
    {
      title: "GENEL BAKIŞ",
      items: [
        { id: "DASHBOARD" as AppModule, label: "Yönetici Kokpiti", icon: LayoutDashboard },
        { id: "RESIDENT_PORTAL" as AppModule, label: "Sakin Portalı", icon: Sparkles, badge: "Sakin Görünümü" },
      ]
    },
    {
      title: "MÜLK & SAKİN YÖNETİMİ",
      items: [
        { id: "UNITS" as AppModule, label: "Bağımsız Bölümler (Daireler)", icon: Building2 },
        { id: "RESIDENTS" as AppModule, label: "Kat Malikleri & Kiracılar", icon: Users },
      ]
    },
    {
      title: "FİNANS & MUHASEBE",
      items: [
        { id: "DUES_TAHAKKUK" as AppModule, label: "Aidat & Borçlandırma", icon: Receipt },
        { id: "COLLECTIONS" as AppModule, label: "Tahsilat & Makbuzlar", icon: HandCoins },
        { id: "DEBTORS_AGING" as AppModule, label: "Borçlu Takibi & Yaşlandırma", icon: ShieldAlert, alertCount: activeSiteUnits.filter(u => u.currentBalance > 0).length },
        { id: "INCOME_EXPENSE" as AppModule, label: "Gelir - Gider & Faturalar", icon: ArrowUpRight },
        { id: "CASH_BANK" as AppModule, label: "Kasa & Banka (Virman)", icon: Landmark },
        { id: "VENDORS" as AppModule, label: "Tedarikçi Carileri", icon: Handshake },
        { id: "BUDGET" as AppModule, label: "İşletme Projesi (Bütçe)", icon: PieChart },
        { id: "REPORTS" as AppModule, label: "Raporlar & Mali Dökümler", icon: FileText },
      ]
    },
    {
      title: "OPERASYON & TESİS",
      items: [
        { id: "REQUESTS" as AppModule, label: "Arıza & Servis Talepleri", icon: LifeBuoy, alertCount: activeSiteRequests.filter(r => r.status !== "TAMAMLANDI").length },
        { id: "ANNOUNCEMENTS" as AppModule, label: "Duyurular & Bildirimler", icon: Bell },
        { id: "MAINTENANCE" as AppModule, label: "Teknik Bakım & Demirbaş", icon: Wrench },
        { id: "STAFF" as AppModule, label: "Personel & Vardiyalar", icon: UserCheck },
        { id: "SECURITY" as AppModule, label: "Güvenlik, Ziyaretçi & Kargo", icon: ShieldCheck },
        { id: "METERS" as AppModule, label: "Sayaç Okuma & Paylaşım", icon: Gauge },
        { id: "MEETINGS_POLLS" as AppModule, label: "Genel Kurul, Anket & Belge", icon: Vote },
      ]
    },
    {
      title: "SİSTEM",
      items: [
        { id: "AUDIT_SETTINGS" as AppModule, label: "Rol Matrisi & Denetim İzi", icon: Settings },
      ]
    }
  ];

  // If not authenticated, show full login screen
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // If showing resident portal view
  if (isResidentView) {
    return (
      <ResidentPortalView
        onBackToManager={() => {
          switchRole("SITE_MANAGER");
          setActiveModule("DASHBOARD");
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#f4f6f2] font-sans antialiased text-[#172b2b] overflow-hidden select-none">
      {/* ===================== SIDEBAR ===================== */}
      <aside className="w-68 bg-[#172b2b] text-white flex flex-col justify-between flex-shrink-0 z-20 border-r border-[#244240]">
        {/* Top Logo & Active Site Switcher */}
        <div>
          <div className="p-4 border-b border-[#244240]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#b8edb7] text-[#172b2b] flex items-center justify-center font-black text-xl shadow-xs transform -rotate-3">
                Y
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-white block">
                    Yönetim Merkezi
                  </span>
                  <span className="bg-[#b8edb7] text-[#172b2b] text-[8px] font-black uppercase px-1.5 py-0.2 rounded font-mono">
                    ÜCRETSİZ
                  </span>
                </div>
                <span className="text-[10px] text-[#86af85] font-semibold tracking-wider uppercase">
                  SaaS Apartman Platformu
                </span>
              </div>
            </div>

            {/* Site Switcher Dropdown */}
            <div className="relative mt-3">
              <button
                onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#244240] hover:bg-[#2e5250] text-white transition text-xs font-semibold text-left border border-[#345d5a]"
              >
                <div className="truncate pr-2">
                  <span className="text-[9px] uppercase tracking-wider text-[#a8d3aa] block font-bold">ÇALIŞILAN SİTE</span>
                  <span className="truncate block font-bold text-xs">{activeSite.name}</span>
                </div>
                <ChevronDown size={14} className="text-[#a8d3aa] flex-shrink-0" />
              </button>

              {isSiteDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsSiteDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#1f3837] border border-[#345d5a] rounded-2xl p-1.5 shadow-2xl z-40 space-y-1">
                    <span className="text-[9px] font-bold text-[#86af85] uppercase px-2.5 py-1 block">
                      YÖNETİM ŞİRKETİ PORTFÖYÜ ({sites.length} SİTE)
                    </span>
                    {sites.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActiveSiteId(s.id);
                          setIsSiteDropdownOpen(false);
                          toast.success(`Aktif site değiştirildi: ${s.name}`);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                          s.id === activeSiteId
                            ? "bg-[#b8edb7] text-[#172b2b] font-bold"
                            : "text-slate-200 hover:bg-[#284947]"
                        }`}
                      >
                        <div className="truncate">
                          <strong className="block truncate">{s.name}</strong>
                          <span className="text-[10px] opacity-75">{s.totalUnits} Daire · {s.city}</span>
                        </div>
                        {s.id === activeSiteId && <Check size={14} className="flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-thin">
            {navCategories.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#66908a] px-3 block">
                  {cat.title}
                </span>

                {cat.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  const hasAccess = canAccessModule(item.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      disabled={!hasAccess}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? "bg-[#b8edb7] text-[#172b2b] font-bold shadow-xs"
                          : hasAccess
                          ? "text-slate-300 hover:bg-[#244240] hover:text-white"
                          : "text-slate-500 opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon size={16} className={isActive ? "text-[#172b2b]" : "text-[#86af85]"} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.alertCount !== undefined && item.alertCount > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
                          {item.alertCount}
                        </span>
                      )}

                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#2e5250] text-[#b8edb7]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer with Active Role Indicator */}
        <div className="p-3.5 border-t border-[#244240] bg-[#142626]">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <div className="w-8 h-8 rounded-full bg-[#b8edb7] text-[#172b2b] font-bold flex items-center justify-center text-xs flex-shrink-0">
                {currentUser.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="truncate leading-tight">
                <strong className="block text-white text-xs truncate">{currentUser.name}</strong>
                <span className="text-[10px] text-[#86af85] font-semibold block truncate">
                  {roleDef.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setActiveModule("RESIDENT_PORTAL");
                  toast.info("Sakin portalı görünümüne geçildi.");
                }}
                title="Sakin Portalı Olarak Gör"
                className="p-1.5 rounded-lg bg-[#244240] hover:bg-[#2f5553] text-[#b8edb7] transition"
              >
                <Eye size={14} />
              </button>

              <button
                onClick={async () => {
                  await logout();
                  toast.success("Oturum kapatıldı.");
                }}
                title="Güvenli Çıkış Yap"
                className="p-1.5 rounded-lg bg-[#244240] hover:bg-rose-950 text-rose-300 hover:text-white transition"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT WRAPPER ===================== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TOPBAR */}
        <header className="h-16 bg-white border-b border-[#e4eae3] px-6 flex items-center justify-between flex-shrink-0 z-10">
          {/* Breadcrumb / Slogans */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#7c8a87]">
              <span>{activeSite.name}</span>
              <span>/</span>
              <span className="text-[#172b2b] font-bold">
                {navCategories.flatMap(c => c.items).find(i => i.id === activeModule)?.label || "Modül"}
              </span>
            </div>

            {/* Slogans badge */}
            <div className="hidden xl:flex items-center gap-2 text-[11px] text-[#556b66] bg-[#f4f6f2] px-3 py-1 rounded-full border border-[#e4eae3]">
              <span className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                %100 ÜCRETSİZ
              </span>
              <Sparkles size={13} className="text-emerald-700" />
              <span>Aidattan Yönetime, Her Şey Tek Yerde.</span>
              <span className="text-slate-300">·</span>
              <span className="font-semibold text-emerald-800">Siteniz Kontrol Altında</span>
            </div>
          </div>

          {/* Quick Actions, Search, Login & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Search Button (Command Palette) */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-[#e4eae3] text-xs font-semibold text-slate-600 transition shadow-xs"
            >
              <Search size={14} className="text-emerald-700" />
              <span>Hızlı Arama</span>
              <kbd className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400">Ctrl+K</kbd>
            </button>

            {/* Quick module action button */}
            {activeModule === "DASHBOARD" && (
              <button
                onClick={() => {
                  setActiveModule("DUES_TAHAKKUK");
                  setOpenModalSignal(true);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition"
              >
                <Plus size={14} /> Toplu Borçlandır
              </button>
            )}

            {/* Google / E-Posta Giriş Butonu */}
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#d2dbd7] hover:border-slate-400 text-slate-800 text-xs font-bold transition shadow-xs"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              Giriş / Hesap
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition relative"
              >
                <Bell size={16} />
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
              </button>

              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#e4eae3] p-4 z-40 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#f0f4f1]">
                      <h4 className="text-xs font-bold text-[#172b2b]">Sistem Bildirimleri</h4>
                      <span className="text-[10px] text-slate-400">Canlı Akış</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100">
                        <strong className="block font-bold">Aidat Tahsilatı: ₺2.500</strong>
                        <span className="text-[11px] text-emerald-700">A Blok D:18 Mehmet Kaya online kart ile ödedi.</span>
                      </div>
                      <div className="p-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-100">
                        <strong className="block font-bold">Yeni Servis Talebi</strong>
                        <span className="text-[11px] text-blue-700">B Blok D:14 asansör arıza bildirimi açtı.</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 10 RBAC ROLE SWITCHER POPOVER */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-[#f4f6f2] hover:bg-[#eaece8] border border-[#e4eae3] transition text-xs font-semibold"
              >
                <div className="w-7 h-7 rounded-lg bg-[#172b2b] text-[#b8edb7] flex items-center justify-center font-bold text-xs">
                  {currentUser.role[0]}
                </div>
                <div className="text-left hidden md:block">
                  <span className="text-[10px] text-[#7c8a87] block uppercase font-bold leading-none">TEST ROLÜ DEĞİŞTİR</span>
                  <span className="font-bold text-[#172b2b] leading-tight block">{roleDef.name}</span>
                </div>
                <ChevronDown size={13} className="text-slate-400 ml-1" />
              </button>

              {isRoleDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsRoleDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#e4eae3] p-2 z-40 space-y-1">
                    <div className="px-3 py-2 border-b border-[#f0f4f1]">
                      <span className="text-[10px] font-bold text-[#7c8a87] uppercase tracking-wider block">
                        KULLANICI & ROL TEST MERKEZİ (10 ROL)
                      </span>
                      <p className="text-[11px] text-[#556360] mt-0.5">
                        Farklı rollerin yetki ve ekran kısıtlamalarını anında test edin.
                      </p>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-1 scrollbar-thin p-1">
                      {allUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            switchUser(user.id);
                            setIsRoleDropdownOpen(false);
                            toast.success(`Kullanıcı ve Rol Değiştirildi: ${user.name} (${user.role})`);
                            if (user.role === "OWNER" || user.role === "TENANT") {
                              setActiveModule("RESIDENT_PORTAL");
                            }
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between ${
                            user.id === currentUser.id
                              ? "bg-emerald-50 text-emerald-900 font-bold border border-emerald-200"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div>
                            <strong className="block text-xs">{user.name}</strong>
                            <span className="text-[10px] text-slate-500">{user.siteName || activeSite.name} · {user.role}</span>
                          </div>
                          {user.id === currentUser.id && <CheckCircle2 size={15} className="text-emerald-700" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Command Palette (Ctrl+K) */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigate={(mod) => handleNavigate(mod)}
        />

        {/* Login Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />

        {/* SCROLLABLE MODULE VIEW CONTAINER */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin">
          {activeModule === "DASHBOARD" && (
            <DashboardView
              onNavigate={(mod) => handleNavigate(mod as AppModule)}
              onOpenBatchTahakkuk={() => {
                setActiveModule("DUES_TAHAKKUK");
                setOpenModalSignal(true);
              }}
              onOpenCollection={() => {
                setActiveModule("COLLECTIONS");
                setOpenModalSignal(true);
              }}
              onOpenExpense={() => {
                setActiveModule("INCOME_EXPENSE");
                setOpenModalSignal(true);
              }}
              onOpenAnnouncement={() => {
                setActiveModule("ANNOUNCEMENTS");
                setOpenModalSignal(true);
              }}
            />
          )}

          {activeModule === "UNITS" && <UnitsView />}
          {activeModule === "RESIDENTS" && <ResidentsView />}
          {activeModule === "DUES_TAHAKKUK" && <DuesTahakkukView initialOpenModal={openModalSignal} />}
          {activeModule === "COLLECTIONS" && <CollectionsView initialOpenModal={openModalSignal} />}
          {activeModule === "DEBTORS_AGING" && <DebtorsAgingView />}
          {activeModule === "INCOME_EXPENSE" && <IncomeExpenseView initialOpenModal={openModalSignal} />}
          {activeModule === "CASH_BANK" && <CashBankView />}
          {activeModule === "VENDORS" && <VendorAccountsView />}
          {activeModule === "BUDGET" && <BudgetManagementView />}
          {activeModule === "REPORTS" && <ReportsView />}
          {activeModule === "REQUESTS" && <RequestsComplaintsView initialOpenModal={openModalSignal} />}
          {activeModule === "ANNOUNCEMENTS" && <AnnouncementsView initialOpenModal={openModalSignal} />}
          {activeModule === "MAINTENANCE" && <MaintenanceAssetsView />}
          {activeModule === "STAFF" && <StaffView />}
          {activeModule === "SECURITY" && <SecurityGateView />}
          {activeModule === "METERS" && <MetersView />}
          {activeModule === "MEETINGS_POLLS" && <MeetingsPollsDocsView />}
          {activeModule === "AUDIT_SETTINGS" && <AuditLogsSettingsView />}
        </main>
      </div>
    </div>
  );
}
