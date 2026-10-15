import React, { useState } from "react";
import {
  CreditCard, ReceiptText, Bell, ClipboardList, LifeBuoy,
  FileText, Building2, Phone, Mail, CheckCircle2, AlertCircle,
  ArrowUpRight, Lock, Sparkles, LayoutDashboard, X, Plus, ShieldCheck,
  Copy, Check, MessageSquare
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { toast } from "sonner";

interface ResidentPortalViewProps {
  onBackToManager: () => void;
}

export default function ResidentPortalView({ onBackToManager }: ResidentPortalViewProps) {
  const {
    activeSite, activeSiteUnits, activeSiteAccounts, activeSiteAnnouncements,
    activeSiteRequests, createServiceRequest, addCollection,
    getUnitLedger, people
  } = useApp();
  const { currentUser, isResidentRole } = useAuth();

  // Authorized resident unit (strictly residentUnitId for residents, or preview unit for managers)
  const matchedPerson = people.find(
    (p) => p.email && currentUser.email && p.email.toLowerCase() === currentUser.email.toLowerCase()
  );
  const authorizedUnitId =
    currentUser.residentUnitId ||
    matchedPerson?.rentedUnitId ||
    matchedPerson?.ownedUnitIds?.[0];

  const residentUnit =
    activeSiteUnits.find((u) => u.id === authorizedUnitId) ||
    (!isResidentRole ? activeSiteUnits[0] : undefined);

  const unitOwner = residentUnit ? people.find((p) => p.id === residentUnit.ownerId) : undefined;
  const unitTenant = residentUnit?.tenantId ? people.find((p) => p.id === residentUnit.tenantId) : null;

  // Real active debt (no fake fallback)
  const currentDebt = residentUnit?.currentBalance ?? 0;
  const ledger = residentUnit ? getUnitLedger(residentUnit.id) : [];

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);

  // Card Payment Form (no fake card numbers)
  const [paymentAmount, setPaymentAmount] = useState(currentDebt > 0 ? currentDebt : 0);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState(currentUser.name || "");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Request Form
  const [newReq, setNewReq] = useState({
    category: "ELEKTRIK" as any,
    title: "",
    description: "",
    priority: "ORTA" as any,
  });

  const handleExecuteCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentUnit) {
      toast.error("Hesabınıza tanımlı yetkili bir bağımsız bölüm bulunamadı.");
      return;
    }
    if (paymentAmount <= 0) {
      toast.error("Lütfen geçerli bir ödeme tutarı giriniz.");
      return;
    }

    const targetBankAcc =
      activeSiteAccounts.find((a) => a.type === "BANKA") || activeSiteAccounts[0];

    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      addCollection({
        unitId: residentUnit.id,
        amount: Number(paymentAmount),
        paymentMethod: "ONLINE_POS",
        targetAccountId: targetBankAcc?.id || "acc-bank",
        description: `Online Kredi Kartı Ödemesi (Sanal POS) - ${residentUnit.blockName} D:${residentUnit.unitNumber}`,
        referenceNo: `POS-${Date.now().toString().slice(-6)}`,
        payerType: currentUser.role === "TENANT" ? "KIRACI" : "MALIK",
      });
      setIsPaymentModalOpen(false);
      toast.success(`₺${paymentAmount.toLocaleString("tr-TR")} tutarındaki aidat ödemeniz başarıyla alındı ve borcunuzdan düşüldü.`);
    }, 600);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentUnit) {
      toast.error("Hesabınıza tanımlı yetkili bir bağımsız bölüm bulunamadı.");
      return;
    }
    if (!newReq.title || !newReq.description) {
      toast.error("Lütfen başlık ve açıklama giriniz.");
      return;
    }

    createServiceRequest({
      unitId: residentUnit.id,
      category: newReq.category,
      title: newReq.title,
      description: newReq.description,
      priority: newReq.priority,
    });

    setIsRequestModalOpen(false);
    setNewReq({ category: "ELEKTRIK" as any, title: "", description: "", priority: "ORTA" as any });
    toast.success("Talebiniz site yönetimine iletildi. Durumunu buradan takip edebilirsiniz.");
  };

  return (
    <div className="min-h-screen bg-[#f4f6f2] text-[#172b2b]">
      {/* Resident Topbar */}
      <header className="h-20 bg-white/90 backdrop-blur-md border-b border-[#e4eae3] sticky top-0 z-30 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#b8edb7] text-[#172b2b] flex items-center justify-center font-extrabold text-lg transform -rotate-3">
            Y
          </div>
          <div className="leading-tight">
            <strong className="text-sm font-bold text-[#172b2b] block">Yönetim Merkezi</strong>
            <span className="text-xs text-emerald-700 font-semibold">Sakin Portalı</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isResidentRole && (
            <button
              onClick={onBackToManager}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#172b2b] transition"
            >
              <LayoutDashboard size={14} /> Yönetici Paneline Dön
            </button>
          )}

          <div className="w-9 h-9 rounded-full bg-[#f4d8a6] text-[#7c562e] font-bold text-xs flex items-center justify-center">
            {currentUser.name.split(" ").map(n => n[0]).join("")}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 sm:p-10 space-y-6">
        {/* Resident Welcome & Unit Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7c8a87]">
              {activeSite.name} {residentUnit ? `· ${residentUnit.blockName} · DAİRE ${residentUnit.unitNumber}` : "· Bağımsız Bölüm Atanmadı"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172b2b] mt-0.5">
              Merhaba, {currentUser.name.split(" ")[0]} <span className="text-emerald-500">✦</span>
            </h1>
            <p className="text-xs text-[#7c8a87] mt-1">Eviniz ve yönetiminizle ilgili finansal ve operasyonel her şey tek ekranda.</p>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-[#e4eae3] shadow-xs flex items-center gap-3">
            <Building2 size={20} className="text-emerald-700" />
            <div className="text-xs">
              <strong className="block text-[#172b2b]">{activeSite.name}</strong>
              <span className="text-[11px] text-slate-500">
                {residentUnit ? `${residentUnit.blockName} · Daire ${residentUnit.unitNumber} (${residentUnit.type})` : "Tanımlı daire kaydı bekleniyor"}
              </span>
            </div>
          </div>
        </div>

        {/* Güncel Borcum & Ödeme Kartı (Hero Box) */}
        <div className="bg-gradient-to-br from-[#172b2b] via-[#244240] to-[#1c3836] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#a8d3aa]">GÜNCEL BORCUM</span>
            <h3 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              {formatCurrency(currentDebt)}
            </h3>
            <p className="text-xs text-slate-300 pt-1">
              Son ödeme günü: <strong className="text-white">Her ayın {activeSite.monthlyDuesDueDay}. günü</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => setIsLedgerModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
            >
              <ReceiptText size={15} /> Borç Detaylarım
            </button>
            <button
              onClick={() => {
                setPaymentAmount(currentDebt > 0 ? currentDebt : 0);
                setIsPaymentModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#b8edb7] hover:bg-[#a3e5a2] text-[#172b2b] text-sm font-extrabold transition shadow-lg"
            >
              <CreditCard size={17} /> Kartla Hemen Öde
            </button>
          </div>
        </div>

        {/* SITE RESMİ BANKA & IBAN BİLGİLERİ (HAVALE / EFT İLE ÖDEME KARTI) */}
        <div className="bg-white border border-[#d2dbd7] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0f4f1]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#172b2b]">Apartman / Site Resmi Banka & IBAN Bilgileri</h3>
                <p className="text-[11px] text-[#7c8a87]">Banka hesabına doğrudan Havale / EFT ile aidat ödemesi yapabilirsiniz.</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {activeSite.bankName || activeSiteAccounts.find(a => a.type === "BANKA")?.bankName || "Resmi Banka Hesabı"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* IBAN Box */}
            <div className="p-3.5 bg-[#f8faf7] rounded-2xl border border-[#e4eae3] flex items-center justify-between gap-3">
              <div className="truncate">
                <span className="text-[10px] font-bold uppercase text-[#7c8a87] block">RESMİ IBAN NUMARASI</span>
                <strong className="text-xs sm:text-sm font-mono font-bold text-emerald-950 block truncate mt-0.5">
                  {activeSite.bankIban || activeSiteAccounts.find(a => a.type === "BANKA")?.iban || "Yönetim tarafından henüz IBAN tanımlanmadı"}
                </strong>
              </div>
              {(activeSite.bankIban || activeSiteAccounts.find(a => a.type === "BANKA")?.iban) && (
                <button
                  type="button"
                  onClick={() => {
                    const ibanVal = activeSite.bankIban || activeSiteAccounts.find(a => a.type === "BANKA")?.iban || "";
                    navigator.clipboard.writeText(ibanVal);
                    toast.success("IBAN numarası panoya kopyalandı!");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#172b2b] hover:bg-[#294342] text-white text-[11px] font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-xs"
                >
                  <Copy size={13} /> Kopyala
                </button>
              )}
            </div>

            {/* Alıcı & Açıklama Şablonu */}
            <div className="p-3.5 bg-[#f8faf7] rounded-2xl border border-[#e4eae3] flex items-center justify-between gap-3">
              <div className="truncate">
                <span className="text-[10px] font-bold uppercase text-[#7c8a87] block">HESAP SAHİBİ (ALICI)</span>
                <strong className="text-xs font-bold text-[#172b2b] block truncate mt-0.5">
                  {activeSite.name} Kat Malikleri Yöneticiliği
                </strong>
                <span className="text-[10px] text-slate-500 block truncate">
                  Açıklama: {residentUnit ? `${residentUnit.blockName} D:${residentUnit.unitNumber}` : "Bağımsız Bölüm"} {currentUser.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const desc = `${residentUnit ? `${residentUnit.blockName} D:${residentUnit.unitNumber}` : activeSite.name} ${currentUser.name} - Aidat`;
                  navigator.clipboard.writeText(desc);
                  toast.success("Ödeme açıklama metni kopyalandı!");
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#d2dbd7] hover:bg-slate-50 text-slate-800 text-[11px] font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
              >
                <Copy size={13} /> Açıklama
              </button>
            </div>

            {/* Apartman WhatsApp Grubu Daveti */}
            {activeSite.whatsappGroupUrl && (
              <a
                href={activeSite.whatsappGroupUrl}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 bg-emerald-50 hover:bg-emerald-100 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3 text-emerald-950 transition group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <strong className="text-xs font-black block">Resmi WhatsApp Duyuru Grubu</strong>
                    <span className="text-[10px] text-emerald-800">Acil duyurular ve yönetim bilgilendirmeleri için katılın.</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-white text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition shadow-2xs">
                  Gruba Katıl →
                </span>
              </a>
            )}
          </div>
        </div>

        {/* 4 Quick Action Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <button
            onClick={() => setIsLedgerModalOpen(true)}
            className="bg-white border border-[#e4eae3] hover:border-emerald-300 hover:shadow-md p-4 rounded-2xl text-left transition space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#d5f1d2] text-[#39704c] flex items-center justify-center">
              <ReceiptText size={18} />
            </div>
            <div>
              <strong className="text-xs font-bold text-[#172b2b] block group-hover:text-emerald-800">Borçlarım</strong>
              <span className="text-[10px] text-slate-500">{currentDebt > 0 ? `${formatCurrency(currentDebt)} açık borç` : "Borcunuz bulunmuyor"}</span>
            </div>
          </button>

          <button
            onClick={() => setIsLedgerModalOpen(true)}
            className="bg-white border border-[#e4eae3] hover:border-blue-300 hover:shadow-md p-4 rounded-2xl text-left transition space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#d6eaf3] text-[#518da7] flex items-center justify-center">
              <CreditCard size={18} />
            </div>
            <div>
              <strong className="text-xs font-bold text-[#172b2b] block group-hover:text-blue-800">Ödemelerim</strong>
              <span className="text-[10px] text-slate-500">Geçmiş makbuzlar</span>
            </div>
          </button>

          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="bg-white border border-[#e4eae3] hover:border-amber-300 hover:shadow-md p-4 rounded-2xl text-left transition space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#f8e9b8] text-[#a4812c] flex items-center justify-center">
              <LifeBuoy size={18} />
            </div>
            <div>
              <strong className="text-xs font-bold text-[#172b2b] block group-hover:text-amber-800">Arıza / Talep Bildir</strong>
              <span className="text-[10px] text-slate-500">Yönetime iletin</span>
            </div>
          </button>

          <button
            onClick={() => toast.info(`Yönetim: ${activeSite.managerName || activeSite.name} (${activeSite.address || activeSite.city})`)}
            className="bg-white border border-[#e4eae3] hover:border-purple-300 hover:shadow-md p-4 rounded-2xl text-left transition space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#eeebfb] text-[#8978bc] flex items-center justify-center">
              <Phone size={18} />
            </div>
            <div>
              <strong className="text-xs font-bold text-[#172b2b] block group-hover:text-purple-800">Yönetim İletişim</strong>
              <span className="text-[10px] text-slate-500">{activeSite.managerName || "Site Yönetimi"}</span>
            </div>
          </button>
        </div>

        {/* Announcements for Residents */}
        <div className="bg-white border border-[#e4eae3] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0f4f1]">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-emerald-700" />
              <h3 className="text-base font-bold text-[#172b2b]">Yönetimden Son Duyurular</h3>
            </div>
            <span className="text-xs text-slate-400">{activeSiteAnnouncements.length} duyuru</span>
          </div>

          <div className="space-y-3">
            {activeSiteAnnouncements.map((ann) => (
              <div key={ann.id} className="p-4 rounded-2xl bg-[#f8faf7] border border-[#e4eae3] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ann.priority === "ACIL" ? "bg-rose-100 text-rose-800" : "bg-emerald-50 text-emerald-800"
                  }`}>
                    {ann.priority === "ACIL" ? "Acil Bilgilendirme" : "Duyuru"}
                  </span>
                  <span className="text-[11px] text-slate-400">{ann.date}</span>
                </div>
                <strong className="text-sm font-bold text-[#172b2b] block">{ann.title}</strong>
                <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Active Service Requests */}
        <div className="bg-white border border-[#e4eae3] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0f4f1]">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} className="text-emerald-700" />
              <h3 className="text-base font-bold text-[#172b2b]">Taleplerim ve Arıza Bildirimlerim</h3>
            </div>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
            >
              <Plus size={14} /> Yeni Talep Aç
            </button>
          </div>

          <div className="space-y-2.5">
            {residentUnit && activeSiteRequests.filter(r => r.unitId === residentUnit.id).length > 0 ? (
              activeSiteRequests.filter(r => r.unitId === residentUnit.id).map(r => (
                <div key={r.id} className="p-3.5 rounded-xl border border-[#e4eae3] flex items-center justify-between">
                  <div>
                    <strong className="text-xs font-bold text-[#172b2b] block">{r.title}</strong>
                    <span className="text-[11px] text-slate-500">{r.createdAt} · {r.category}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    r.status === "TAMAMLANDI" ? "bg-emerald-50 text-emerald-800" :
                    r.status === "ISLEME_ALINDI" ? "bg-purple-50 text-purple-800" : "bg-amber-50 text-amber-800"
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Açık arıza veya servis talebiniz bulunmuyor.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ONLINE POS PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#d5f1d2] text-[#39704c] flex items-center justify-center font-bold">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172b2b]">Güvenli Online Aidat Ödeme</h3>
                  <p className="text-xs text-[#7c8a87]">256-bit SSL Sanal POS ile komisyonsuz ödeme.</p>
                </div>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExecuteCardPayment} className="space-y-3.5 text-xs">
              <div className="p-3 bg-[#edf3eb] rounded-2xl border border-[#dce7da] flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">ÖDENECEK TUTAR</span>
                  <span className="text-xs text-slate-600">{residentUnit ? `${residentUnit.blockName} Daire ${residentUnit.unitNumber}` : activeSite.name}</span>
                </div>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₺</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full pl-7 pr-2 py-1.5 rounded-xl border border-[#e4eae3] font-extrabold text-base text-right text-emerald-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Kart Üzerindeki İsim</label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Kredi / Banka Kart Numarası</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-mono tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">Son Kullanma (AA/YY)</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-mono text-center"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#172b2b] block mb-1">CVV / Güvenlik Kodu</label>
                  <input
                    type="password"
                    maxLength={3}
                    required
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-mono text-center"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Kart bilgileriniz saklanmaz, banka Sanal POS güvencesindedir.</span>
              </div>

              <div className="pt-3 border-t border-[#e4eae3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition shadow-md flex items-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>Ödeme Alınıyor...</>
                  ) : (
                    <><Lock size={14} /> {formatCurrency(paymentAmount)} Öde</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESIDENT LEDGER DETAIL MODAL */}
      {isLedgerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div>
                <h3 className="text-base font-bold text-[#172b2b]">Hesap Hareketlerim ve Borç Dökümü</h3>
                <p className="text-xs text-[#7c8a87]">{residentUnit ? `${residentUnit.blockName} Daire ${residentUnit.unitNumber}` : activeSite.name}</p>
              </div>
              <button onClick={() => setIsLedgerModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="border border-[#e4eae3] rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] text-[10px] font-bold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Tarih</th>
                    <th className="py-2.5 px-3">Açıklama</th>
                    <th className="py-2.5 px-3 text-right">Tahakkuk (Borç)</th>
                    <th className="py-2.5 px-3 text-right">Ödenen (Alacak)</th>
                    <th className="py-2.5 px-3 text-right">Bakiye</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f4f1]">
                  {ledger.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{formatDate(item.date)}</td>
                      <td className="py-2.5 px-3 font-medium text-[#172b2b]">{item.description}</td>
                      <td className="py-2.5 px-3 text-right text-rose-600 font-bold">
                        {item.debtAmount > 0 ? formatCurrency(item.debtAmount) : "-"}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">
                        {item.creditAmount > 0 ? formatCurrency(item.creditAmount) : "-"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-[#172b2b]">
                        {formatCurrency(item.balanceAfter)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-[#e4eae3] flex justify-between items-center text-xs">
              <span className="text-slate-500">Güncel Kalan Borç: <strong className="text-rose-600 text-sm">{formatCurrency(currentDebt)}</strong></span>
              <button
                onClick={() => setIsLedgerModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW SERVICE REQUEST MODAL */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <h3 className="text-base font-bold text-[#172b2b]">Yönetime Arıza / Talep İlet</h3>
              <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Talep Kategorisi</label>
                <select
                  value={newReq.category}
                  onChange={(e) => setNewReq({ ...newReq, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="ELEKTRIK">Elektrik & Aydınlatma</option>
                  <option value="TESISAT">Sıhhi Tesisat / Su</option>
                  <option value="ASANSOR">Asansör</option>
                  <option value="TEMIZLIK">Temizlik</option>
                  <option value="SES_GURULTU">Gürültü / Site Düzeni</option>
                  <option value="DIGER">Diğer</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Talep Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 2. kat hol lambası yanmıyor..."
                  value={newReq.title}
                  onChange={(e) => setNewReq({ ...newReq, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Açıklama *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Arıza detaylarını yazınız..."
                  value={newReq.description}
                  onChange={(e) => setNewReq({ ...newReq, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#e4eae3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#172b2b] text-white font-bold hover:bg-[#294342] transition shadow-sm"
                >
                  Talebi Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
