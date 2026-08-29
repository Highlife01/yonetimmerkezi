import React, { useState } from "react";
import {
  Shield, Plus, Search, ShieldCheck, Lock, CheckCircle2,
  XCircle, Building2, UserCog, History, RefreshCcw, X, KeyRound
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_DEFINITIONS } from "@/data/rolesData";
import { UserRole } from "@/types";
import { formatDateTime } from "@/utils/formatters";
import { toast } from "sonner";

export default function AuditLogsSettingsView() {
  const {
    sites, activeSite, activeSiteAuditLogs,
    addSite, updateSite, resetToDefaults
  } = useApp();
  const { currentUser, activeRole, roleDef, switchRole, allUsers, switchUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"AUDIT" | "ROLES" | "SITES" | "SITE_SETTINGS">("SITE_SETTINGS");
  const [logSearch, setLogSearch] = useState("");
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);

  // Active Site Settings State
  const [siteSettings, setSiteSettings] = useState({
    name: activeSite.name,
    address: activeSite.address,
    city: activeSite.city,
    district: activeSite.district,
    managerName: activeSite.managerName,
    managerPhone: activeSite.managerPhone,
    bankName: activeSite.bankName || "Garanti BBVA",
    bankIban: activeSite.bankIban || "TR55 0006 2000 0001 2345 6789 01",
    monthlyDuesDueDay: activeSite.monthlyDuesDueDay || 10,
    lateInterestRatePerMonth: activeSite.lateInterestRatePerMonth || 5,
    whatsappGroupUrl: activeSite.whatsappGroupUrl || "https://chat.whatsapp.com/invite-ornek",
    autoDuesEnabled: activeSite.autoDuesEnabled ?? true,
  });

  // Sync state if activeSite changes
  React.useEffect(() => {
    setSiteSettings({
      name: activeSite.name,
      address: activeSite.address,
      city: activeSite.city,
      district: activeSite.district,
      managerName: activeSite.managerName,
      managerPhone: activeSite.managerPhone,
      bankName: activeSite.bankName || "Garanti BBVA",
      bankIban: activeSite.bankIban || "TR55 0006 2000 0001 2345 6789 01",
      monthlyDuesDueDay: activeSite.monthlyDuesDueDay || 10,
      lateInterestRatePerMonth: activeSite.lateInterestRatePerMonth || 5,
      whatsappGroupUrl: activeSite.whatsappGroupUrl || "https://chat.whatsapp.com/invite-ornek",
      autoDuesEnabled: activeSite.autoDuesEnabled ?? true,
    });
  }, [activeSite]);

  // New site form
  const [newSiteData, setNewSiteData] = useState({
    name: "",
    address: "",
    city: "İstanbul",
    district: "Kadıköy",
    totalUnits: 40,
    totalBlocks: 2,
    bankIban: "TR55 0006 2000 0001 2345 6789 01",
    monthlyDuesDefault: 2500,
    lateInterestRatePerMonth: 5,
  });

  const filteredLogs = activeSiteAuditLogs.filter((log) => {
    const q = logSearch.toLocaleLowerCase("tr-TR").trim();
    if (q) {
      const matchText = `${log.userName} ${log.action} ${log.entity} ${log.details}`.toLocaleLowerCase("tr-TR");
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const handleSaveSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteData.name || !newSiteData.address) {
      toast.error("Lütfen site adı ve adresini giriniz.");
      return;
    }

    addSite({
      name: newSiteData.name,
      address: newSiteData.address,
      city: newSiteData.city,
      district: newSiteData.district,
      totalUnits: Number(newSiteData.totalUnits),
      totalBlocks: Number(newSiteData.totalBlocks),
      managementCompanyName: "Elya Profesyonel Tesis & Site Yönetimi A.Ş.",
      bankIban: newSiteData.bankIban,
      monthlyDuesDefault: Number(newSiteData.monthlyDuesDefault),
      lateInterestRatePerMonth: Number(newSiteData.lateInterestRatePerMonth),
    });

    setIsAddSiteModalOpen(false);
    toast.success(`"${newSiteData.name}" portföye başarıyla eklendi!`);
  };

  const handleResetData = () => {
    if (window.confirm("Tüm değişiklikleri sıfırlayıp fabrika demo verilerine dönmek istediğinizden emin misiniz?")) {
      resetToDefaults();
      toast.success("Demo verileri başarıyla sıfırlandı.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">Sistem Ayarları & Güvenlik Denetimi</h2>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              Silinemez denetim izleri (Audit Log), 10 seviyeli RBAC rol matrisi ve çoklu site yönetimi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              <RefreshCcw size={14} /> Demo Verileri Sıfırla
            </button>
            <button
              onClick={() => setIsAddSiteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#172b2b] text-white text-xs font-bold hover:bg-[#294342] transition shadow-sm"
            >
              <Plus size={16} /> Yeni Site / Apartman Ekle
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#f0f4f1]">
          <div className="inline-flex rounded-xl border border-[#e4eae3] p-1 bg-slate-50 flex-wrap">
            <button
              onClick={() => setActiveTab("SITE_SETTINGS")}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === "SITE_SETTINGS" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Building2 size={14} /> Site & IBAN / Banka Ayarları
            </button>
            <button
              onClick={() => setActiveTab("AUDIT")}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === "AUDIT" ? "bg-white text-[#172b2b] shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <History size={14} /> Denetim İzi (Audit Log) ({activeSiteAuditLogs.length})
            </button>
            <button
              onClick={() => setActiveTab("ROLES")}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === "ROLES" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <KeyRound size={14} /> Rol & Yetki Matrisi (10 Rol)
            </button>
            <button
              onClick={() => setActiveTab("SITES")}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === "SITES" ? "bg-white text-blue-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Building2 size={14} /> Yönetilen Siteler ({sites.length})
            </button>
          </div>
        </div>
      </div>

      {/* SITE & IBAN SETTINGS TAB */}
      {activeTab === "SITE_SETTINGS" && (
        <div className="bg-white border border-[#e4eae3] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#f0f4f1]">
            <div>
              <h3 className="text-base font-bold text-[#172b2b]">Site, Yönetici ve Resmi IBAN Ayarları</h3>
              <p className="text-xs text-[#7c8a87]">
                Buraya girdiğiniz IBAN, banka adı ve hesap sahibi bilgisi sakin portalında ve borç bildirimlerinde görünür.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {activeSite.name}
            </span>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await updateSite(activeSite.id, {
                name: siteSettings.name,
                address: siteSettings.address,
                city: siteSettings.city,
                district: siteSettings.district,
                managerName: siteSettings.managerName,
                managerPhone: siteSettings.managerPhone,
                bankName: siteSettings.bankName,
                bankIban: siteSettings.bankIban,
                monthlyDuesDueDay: Number(siteSettings.monthlyDuesDueDay),
                lateInterestRatePerMonth: Number(siteSettings.lateInterestRatePerMonth),
              });
              toast.success("Site ayarları ve IBAN bilgileri başarıyla güncellendi!");
            }}
            className="space-y-4 text-xs"
          >
            {/* Bank & IBAN highlight box */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <Building2 size={18} className="text-emerald-700" />
                <span>Apartman / Site Resmi Banka & IBAN Bilgileri</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Sakinlerinizin aidat ve demirbaş ödemelerini havale/EFT yaparken göreceği resmi banka hesabıdır.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Banka Adı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Garanti BBVA, Ziraat Bankası, İş Bankası"
                    value={siteSettings.bankName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, bankName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-emerald-300 focus:outline-none focus:border-emerald-600 bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">IBAN Numarası *</label>
                  <input
                    type="text"
                    required
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    value={siteSettings.bankIban}
                    onChange={(e) => setSiteSettings({ ...siteSettings, bankIban: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-emerald-300 focus:outline-none focus:border-emerald-600 bg-white font-mono font-bold text-emerald-900 tracking-wider"
                  />
                </div>
              </div>
            </div>

            {/* Site & Manager details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Site / Apartman Adı</label>
                <input
                  type="text"
                  required
                  value={siteSettings.name}
                  onChange={(e) => setSiteSettings({ ...siteSettings, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Yönetici Adı & Soyadı</label>
                <input
                  type="text"
                  required
                  value={siteSettings.managerName}
                  onChange={(e) => setSiteSettings({ ...siteSettings, managerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Yönetici İletişim Telefonu</label>
                <input
                  type="text"
                  required
                  placeholder="0532 000 00 00"
                  value={siteSettings.managerPhone}
                  onChange={(e) => setSiteSettings({ ...siteSettings, managerPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Açık Adres</label>
                <input
                  type="text"
                  required
                  value={siteSettings.address}
                  onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Her Ayın Aidat Son Ödeme Günü</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={siteSettings.monthlyDuesDueDay}
                  onChange={(e) => setSiteSettings({ ...siteSettings, monthlyDuesDueDay: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Resmi Apartman WhatsApp Duyuru Grubu Linki</label>
                <input
                  type="url"
                  placeholder="https://chat.whatsapp.com/..."
                  value={siteSettings.whatsappGroupUrl}
                  onChange={(e) => setSiteSettings({ ...siteSettings, whatsappGroupUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-mono text-emerald-900"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <strong className="block text-[#172b2b]">Otomatik Aylık Aidat Tahakkuku</strong>
                  <span className="text-[11px] text-slate-500">Her ayın 1'inde sabit aidatları otomatik işlet</span>
                </div>
                <input
                  type="checkbox"
                  checked={siteSettings.autoDuesEnabled}
                  onChange={(e) => setSiteSettings({ ...siteSettings, autoDuesEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#f0f4f1] flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#172b2b] hover:bg-[#294342] text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Ayarları ve IBAN'ı Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AUDIT LOG TAB */}
      {activeTab === "AUDIT" && (
        <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa7a2]" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Log ara: kullanıcı, işlem, detay..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-1.5">
              <ShieldCheck size={15} /> Silinemez ve Değiştirilemez Denetim Kaydı
            </div>
          </div>

          <div className="border border-[#e4eae3] rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Tarih & Saat</th>
                  <th className="py-2.5 px-3">Kullanıcı & Rol</th>
                  <th className="py-2.5 px-3">İşlem / Modül</th>
                  <th className="py-2.5 px-3">Detay Açıklaması</th>
                  <th className="py-2.5 px-3">IP Adresi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4f1]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-bold text-[#172b2b]">
                      {log.userName}
                      <span className="block text-[10px] text-slate-400 font-normal">{log.userRole}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {log.action} · {log.entity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">{log.details}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ROLES & PERMISSIONS MATRIX TAB */}
      {activeTab === "ROLES" && (
        <div className="bg-white border border-[#e4eae3] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#e4eae3] bg-[#f8faf7]">
            <h3 className="text-sm font-bold text-[#172b2b]">Rol & İzin Matrisi (Role-Based Access Control)</h3>
            <p className="text-xs text-[#7c8a87]">Sistemdeki 10 kullanıcı rolünün yetki sınırları.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Rol Tanımı</th>
                  <th className="py-3 px-3 text-center">Toplu Aidat</th>
                  <th className="py-3 px-3 text-center">Tahsilat</th>
                  <th className="py-3 px-3 text-center">Gider Girişi</th>
                  <th className="py-3 px-3 text-center">Virman</th>
                  <th className="py-3 px-3 text-center">Sakin Ekle</th>
                  <th className="py-3 px-3 text-center">Mali Rapor</th>
                  <th className="py-3 px-3 text-center">Duyuru</th>
                  <th className="py-3 px-3 text-center">Denetim İzi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4f1]">
                {Object.entries(ROLE_DEFINITIONS).map(([key, def]) => {
                  const p = def.permissions;

                  return (
                    <tr key={key} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <strong className="text-[#172b2b] block">{def.name}</strong>
                        <span className="text-[10px] text-[#7c8a87]">{def.description}</span>
                      </td>
                      <td className="py-3 px-3 text-center">{p.canAccrueDues ? <CheckCircle2 size={16} className="text-emerald-600 mx-auto" /> : <XCircle size={16} className="text-slate-300 mx-auto" />}</td>
                      <td className="py-3 px-3 text-center">{p.canCollectPayments ? <CheckCircle2 size={16} className="text-emerald-600 mx-auto" /> : <XCircle size={16} className="text-slate-300 mx-auto" />}</td>
                      <td className="py-3 px-3 text-center">{p.canManageExpenses ? <CheckCircle2 size={16} className="text-emerald-600 mx-auto" /> : <XCircle size={16} className="text-slate-300 mx-auto" />}</td>
                      <td className="py-3 px-3 text-center">{p.canManageBankAccounts ? <CheckCircle2 size={16} className="text-emerald-600 mx-auto" /> : <XCircle size={16} className="text-slate-300 mx-auto" />}</td>
                      <td className="py-3 px-3 text-center">{p.canManageUnitsAndResidents ? <CheckCircle2 size={16} className="text-emerald-600 mx-auto" /> : <XCircle size={16} className="text-slate-300 mx-auto" />}</td>
                      <td className="py-3 px-3 text-center">{p.canViewFinancialReports ? <CheckCircle2 size={16} className="text-emerald-600 mx-auto" /> : <XCircle size={16} className="text-slate-300 mx-auto" />}</td>
                      <td className="py-3 px-3 text-center">{p.canPostAnnouncements ? <CheckCircle2 size={16} className="text-emerald-600 mx-auto" /> : <XCircle size={16} className="text-slate-300 mx-auto" />}</td>
                      <td className="py-3 px-3 text-center">{p.canViewAuditLogs ? <CheckCircle2 size={16} className="text-emerald-600 mx-auto" /> : <XCircle size={16} className="text-slate-300 mx-auto" />}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SITES PORTFOLIO TAB */}
      {activeTab === "SITES" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sites.map((site) => (
            <div
              key={site.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm space-y-3 ${
                site.id === activeSite.id ? "border-emerald-500 ring-2 ring-emerald-200" : "border-[#e4eae3]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-base font-bold text-[#172b2b]">{site.name}</strong>
                    {site.id === activeSite.id && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Aktif Çalışılan Site
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#7c8a87] mt-0.5">{site.address} ({site.district} / {site.city})</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#f0f4f1] grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block">Daire Sayısı</span>
                  <strong className="text-sm font-bold text-[#172b2b]">{site.totalUnits}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block">Blok Sayısı</span>
                  <strong className="text-sm font-bold text-[#172b2b]">{site.totalBlocks}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 block">Sabit Aidat</span>
                  <strong className="text-sm font-bold text-emerald-800">₺{site.monthlyDuesDefault}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NEW SITE MODAL */}
      {isAddSiteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <h3 className="text-base font-bold text-[#172b2b]">Portföye Yeni Site / Apartman Ekle</h3>
              <button onClick={() => setIsAddSiteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSite} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Site / Apartman Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ihlamur Konakları Sitesi"
                  value={newSiteData.name}
                  onChange={(e) => setNewSiteData({ ...newSiteData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Şehir</label>
                  <input
                    type="text"
                    value={newSiteData.city}
                    onChange={(e) => setNewSiteData({ ...newSiteData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">İlçe</label>
                  <input
                    type="text"
                    value={newSiteData.district}
                    onChange={(e) => setNewSiteData({ ...newSiteData, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Açık Adres *</label>
                <input
                  type="text"
                  required
                  placeholder="Mahalle, cadde, sokak no..."
                  value={newSiteData.address}
                  onChange={(e) => setNewSiteData({ ...newSiteData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Toplam Bağımsız Bölüm Sayısı</label>
                  <input
                    type="number"
                    min={1}
                    value={newSiteData.totalUnits}
                    onChange={(e) => setNewSiteData({ ...newSiteData, totalUnits: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Varsayılan Aylık Aidat (TL)</label>
                  <input
                    type="number"
                    min={100}
                    value={newSiteData.monthlyDuesDefault}
                    onChange={(e) => setNewSiteData({ ...newSiteData, monthlyDuesDefault: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#e4eae3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSiteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#172b2b] text-white font-bold hover:bg-[#294342] transition shadow-sm"
                >
                  Siteyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
