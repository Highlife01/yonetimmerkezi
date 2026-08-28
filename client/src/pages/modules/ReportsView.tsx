import React, { useState } from "react";
import {
  FileText, Download, Printer, CalendarDays, Filter,
  Building2, Users, Wallet, HandCoins, ArrowUpRight,
  ArrowDownRight, CheckCircle2, PieChart, ShieldAlert
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { exportToCSV, printReceipt } from "@/utils/exportUtils";
import { toast } from "sonner";

type ReportType =
  | "BORCLULAR"
  | "TAHSILAT"
  | "AIDAT_TAHAKKUK"
  | "GELIR_GIDER"
  | "KASA_BANKA"
  | "DAIRE_EKSTRELERI"
  | "TEDARIKCI_CARI"
  | "BUTCE_GERCEKLESME"
  | "GECIKME_FAIZI"
  | "SAYAC_TUKETIM";

export default function ReportsView() {
  const {
    activeSite, activeSiteUnits, activeSiteCollections,
    activeSiteTahakkuklar, activeSiteExpenses, activeSiteAccounts,
    activeSiteVendors, budget, people, activeSiteMeters, ledgerItems
  } = useApp();
  const { hasPermission } = useAuth();

  const [activeReport, setActiveReport] = useState<ReportType>("BORCLULAR");
  const [selectedPeriod, setSelectedPeriod] = useState("2026-08");

  // Export handlers for each report
  const handleExportCurrentReport = () => {
    if (activeReport === "BORCLULAR") {
      const debtors = activeSiteUnits.filter(u => u.currentBalance > 0);
      const headers = ["Blok", "Daire No", "Kat Maliki", "Kiracı", "Telefon", "Borç Tutarı (TL)"];
      const rows = debtors.map(u => {
        const owner = people.find(p => p.id === u.ownerId);
        const tenant = u.tenantId ? people.find(p => p.id === u.tenantId) : null;
        return [
          u.blockName,
          u.unitNumber,
          owner?.fullName || "-",
          tenant?.fullName || "-",
          tenant?.phone || owner?.phone || "-",
          u.currentBalance
        ];
      });
      exportToCSV(`${activeSite.name}_Borclular_Raporu`, headers, rows);
    } else if (activeReport === "TAHSILAT") {
      const headers = ["Makbuz No", "Tarih", "Daire", "Sakin", "Ödeme Yöntemi", "Hesap", "Tutar (TL)"];
      const rows = activeSiteCollections.map(c => [
        c.receiptNumber, c.paymentDate, c.unitName, c.personName, c.paymentMethod, c.targetAccountName, c.amount
      ]);
      exportToCSV(`${activeSite.name}_Tahsilat_Raporu`, headers, rows);
    } else if (activeReport === "GELIR_GIDER") {
      const headers = ["Tarih", "Tür", "Kategori", "Başlık / Açıklama", "Fatura No", "Tutar (TL)"];
      const expRows = activeSiteExpenses.map(e => [
        e.date, "Gider", e.category, e.title, e.invoiceNumber || "-", -e.amount
      ]);
      const incRows = activeSiteCollections.map(c => [
        c.paymentDate.split(" ")[0], "Gelir (Tahsilat)", "Aidat", `${c.unitName} ${c.personName}`, c.receiptNumber, c.amount
      ]);
      exportToCSV(`${activeSite.name}_Gelir_Gider_Mali_Raporu`, headers, [...incRows, ...expRows]);
    } else if (activeReport === "KASA_BANKA") {
      const headers = ["Hesap Adı", "Hesap Türü", "IBAN / Detay", "Güncel Bakiye (TL)"];
      const rows = activeSiteAccounts.map(a => [
        a.name, a.type === "BANKA" ? "Banka Hesabı" : "Nakit Kasa", a.iban || "-", a.balance
      ]);
      exportToCSV(`${activeSite.name}_Kasa_Banka_Mevcut_Raporu`, headers, rows);
    } else if (activeReport === "TEDARIKCI_CARI") {
      const headers = ["Firma Adı", "Hizmet Alanı", "Yetkili", "Telefon", "Vergi No", "IBAN", "Cari Bakiye (TL)"];
      const rows = activeSiteVendors.map(v => [
        v.companyName, v.serviceType, v.contactPerson, v.phone, v.taxNumber, v.iban, v.currentBalance
      ]);
      exportToCSV(`${activeSite.name}_Tedarikci_Cari_Raporu`, headers, rows);
    } else if (activeReport === "BUTCE_GERCEKLESME") {
      const headers = ["Tür", "Bütçe Kalemi", "Planlanan Bütçe", "Gerçekleşen Tutar", "Fark"];
      const rows = budget.items.map(i => [
        i.type === "GELIR" ? "Gelir" : "Gider", i.category, i.plannedAnnual, i.actualAnnual, i.actualAnnual - i.plannedAnnual
      ]);
      exportToCSV(`${activeSite.name}_Butce_Gerceklesme_Raporu`, headers, rows);
    } else if (activeReport === "GECIKME_FAIZI") {
      const debtors = activeSiteUnits.filter(u => u.currentBalance > 0);
      const headers = ["Daire", "Sakin", "Ana Borç", "Gecikme Süresi", "Aylık %5 Faiz", "Toplam Tahsilat"];
      const rows = debtors.map(u => {
        const occupant = u.tenantId ? people.find(p => p.id === u.tenantId) : people.find(p => p.id === u.ownerId);
        const interest = Math.round(u.currentBalance * 0.05 * 1.5);
        return [
          `${u.blockName} D:${u.unitNumber}`, occupant?.fullName || "-", u.currentBalance, "45 Gün", interest, u.currentBalance + interest
        ];
      });
      exportToCSV(`${activeSite.name}_Gecikme_Faizi_Raporu`, headers, rows);
    } else {
      toast.info("Rapor dışa aktarılıyor...");
    }
    toast.success("Rapor Excel (CSV) formatında başarıyla indirildi.");
  };

  const handlePrintCurrentReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">Raporlar & Mali Dökümler Merkezi</h2>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              Kat Malikleri Kurulu, Denetçiler ve Yönetim için anlık oluşturulan Excel ve PDF resmi raporlar.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handlePrintCurrentReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#e4eae3] text-[#294342] text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
            >
              <Printer size={14} /> Yazdır / PDF
            </button>
            <button
              onClick={handleExportCurrentReport}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#172b2b] text-white text-xs font-bold hover:bg-[#294342] transition shadow-sm"
            >
              <Download size={14} /> Excel İndir (.csv)
            </button>
          </div>
        </div>

        {/* Report Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-[#f0f4f1]">
          {[
            { id: "BORCLULAR", label: "Borçlu Listesi & Yaşlandırma", icon: Wallet },
            { id: "TAHSILAT", label: "Tahsilat Raporu", icon: HandCoins },
            { id: "GELIR_GIDER", label: "Gelir & Gider Denge Tablosu", icon: ArrowUpRight },
            { id: "KASA_BANKA", label: "Kasa & Banka Raporu", icon: Building2 },
            { id: "TEDARIKCI_CARI", label: "Tedarikçi Cari Ekstreleri", icon: Users },
            { id: "BUTCE_GERCEKLESME", label: "Bütçe Gerçekleşme Raporu", icon: PieChart },
            { id: "GECIKME_FAIZI", label: "Gecikme Faizi & Tazminat", icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeReport === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id as ReportType)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  active ? "bg-[#172b2b] text-white shadow-xs" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* REPORT CONTENT VIEW */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-6 shadow-sm space-y-4">
        {/* Report Header for Print */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e4eae3]">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#7c8a87] tracking-widest">{activeSite.name} RESMİ RAPORU</span>
            <h3 className="text-lg font-bold text-[#172b2b]">
              {activeReport === "BORCLULAR" && "Ayrıntılı Borçlu Listesi ve Yaşlandırma Dökümü"}
              {activeReport === "TAHSILAT" && "Dönemsel Tahsilatlar ve Makbuz Listesi"}
              {activeReport === "GELIR_GIDER" && "Gelir ve Gider Denge Tablosu (Mizan)"}
              {activeReport === "KASA_BANKA" && "Kasa ve Banka Hesapları Mevcut Durum Raporu"}
              {activeReport === "TEDARIKCI_CARI" && "Tedarikçi Cari Hesap Bakiyeleri"}
              {activeReport === "BUTCE_GERCEKLESME" && "Yıllık İşletme Projesi Bütçe ve Gerçekleşme"}
              {activeReport === "GECIKME_FAIZI" && "Kanuni Gecikme Tazminatı (%5) Hesaplama Cetveli"}
            </h3>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            Tarih: {new Date().toLocaleDateString("tr-TR")}
          </div>
        </div>

        {/* Report Table based on selection */}
        {activeReport === "BORCLULAR" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2.5 px-3">Bağımsız Bölüm</th>
                  <th className="py-2.5 px-3">Kat Maliki</th>
                  <th className="py-2.5 px-3">Kiracı</th>
                  <th className="py-2.5 px-3">İletişim</th>
                  <th className="py-2.5 px-3 text-right">Borç Tutarı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4f1]">
                {activeSiteUnits.filter(u => u.currentBalance > 0).map(u => {
                  const owner = people.find(p => p.id === u.ownerId);
                  const tenant = u.tenantId ? people.find(p => p.id === u.tenantId) : null;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-[#172b2b]">{u.blockName} Daire {u.unitNumber}</td>
                      <td className="py-2.5 px-3 text-[#172b2b]">{owner?.fullName || "-"}</td>
                      <td className="py-2.5 px-3 text-blue-900 font-medium">{tenant?.fullName || "-"}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{tenant?.phone || owner?.phone || "-"}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-600 text-sm">{formatCurrency(u.currentBalance)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === "TAHSILAT" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2.5 px-3">Makbuz No</th>
                  <th className="py-2.5 px-3">Tarih</th>
                  <th className="py-2.5 px-3">Daire</th>
                  <th className="py-2.5 px-3">Sakin</th>
                  <th className="py-2.5 px-3">Ödeme Şekli</th>
                  <th className="py-2.5 px-3">Hesap</th>
                  <th className="py-2.5 px-3 text-right">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4f1]">
                {activeSiteCollections.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#172b2b]">{c.receiptNumber}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">{c.paymentDate}</td>
                    <td className="py-2.5 px-3 font-bold">{c.unitName}</td>
                    <td className="py-2.5 px-3 text-slate-800">{c.personName}</td>
                    <td className="py-2.5 px-3">{c.paymentMethod}</td>
                    <td className="py-2.5 px-3 text-slate-600">{c.targetAccountName}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700 text-sm">{formatCurrency(c.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === "GELIR_GIDER" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[#e4eae3] rounded-xl p-4 bg-[#f8faf7]">
                <h4 className="font-bold text-emerald-800 mb-2">Gelir Kalemleri</h4>
                <div className="flex justify-between py-1 text-xs">
                  <span>Aidat & İşletme Tahsilatları:</span>
                  <strong>{formatCurrency(activeSiteCollections.reduce((s, c) => s + c.amount, 0))}</strong>
                </div>
              </div>

              <div className="border border-[#e4eae3] rounded-xl p-4 bg-[#f8faf7]">
                <h4 className="font-bold text-rose-800 mb-2">Gider Kalemleri</h4>
                {activeSiteExpenses.map(e => (
                  <div key={e.id} className="flex justify-between py-1 text-xs border-b border-[#f0f4f1]">
                    <span>{e.title} ({e.category}):</span>
                    <strong>{formatCurrency(e.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeReport === "KASA_BANKA" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2.5 px-3">Hesap Adı</th>
                  <th className="py-2.5 px-3">Hesap Türü</th>
                  <th className="py-2.5 px-3">Banka / IBAN</th>
                  <th className="py-2.5 px-3 text-right">Mevcut Bakiye</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4f1]">
                {activeSiteAccounts.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-[#172b2b]">{a.name}</td>
                    <td className="py-2.5 px-3">{a.type === "BANKA" ? "Banka Vadesiz" : "Nakit Kasa"}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{a.iban || "-"}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-base text-[#172b2b]">{formatCurrency(a.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === "TEDARIKCI_CARI" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2.5 px-3">Firma Adı</th>
                  <th className="py-2.5 px-3">Hizmet Türü</th>
                  <th className="py-2.5 px-3">Yetkili</th>
                  <th className="py-2.5 px-3">Telefon</th>
                  <th className="py-2.5 px-3 text-right">Cari Bakiye</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4f1]">
                {activeSiteVendors.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-[#172b2b]">{v.companyName}</td>
                    <td className="py-2.5 px-3 text-slate-700">{v.serviceType}</td>
                    <td className="py-2.5 px-3">{v.contactPerson}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">{v.phone}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#172b2b]">{formatCurrency(v.currentBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === "BUTCE_GERCEKLESME" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2.5 px-3">Tür</th>
                  <th className="py-2.5 px-3">Bütçe Kalemi</th>
                  <th className="py-2.5 px-3 text-right">Yıllık Planlanan</th>
                  <th className="py-2.5 px-3 text-right">Gerçekleşen Tutar</th>
                  <th className="py-2.5 px-3 text-right">Fark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4f1]">
                {budget.items.map(i => (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold">{i.type}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#172b2b]">{i.category}</td>
                    <td className="py-2.5 px-3 text-right font-bold">{formatCurrency(i.plannedAnnual)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{formatCurrency(i.actualAnnual)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{formatCurrency(i.actualAnnual - i.plannedAnnual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === "GECIKME_FAIZI" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2.5 px-3">Daire</th>
                  <th className="py-2.5 px-3">Muhatap (Sakin)</th>
                  <th className="py-2.5 px-3 text-right">Ana Borç</th>
                  <th className="py-2.5 px-3 text-right">Aylık %5 Gecikme Faizi</th>
                  <th className="py-2.5 px-3 text-right">Toplam Borç</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4f1]">
                {activeSiteUnits.filter(u => u.currentBalance > 0).map(u => {
                  const occupant = u.tenantId ? people.find(p => p.id === u.tenantId) : people.find(p => p.id === u.ownerId);
                  const interest = Math.round(u.currentBalance * 0.05 * 1.5);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-[#172b2b]">{u.blockName} D:{u.unitNumber}</td>
                      <td className="py-2.5 px-3 text-[#172b2b]">{occupant?.fullName || "-"}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-600">{formatCurrency(u.currentBalance)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">+{formatCurrency(interest)}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-[#172b2b]">{formatCurrency(u.currentBalance + interest)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
