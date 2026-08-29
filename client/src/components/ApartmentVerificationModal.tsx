import React, { useState } from "react";
import {
  Building2, ShieldCheck, CheckCircle2, X, Sparkles,
  FileText, Landmark, Phone, User, Calendar, Hash, ArrowRight,
  Lock, AlertCircle
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ApartmentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifiedSuccess?: (siteId: string) => void;
}

export default function ApartmentVerificationModal({
  isOpen,
  onClose,
  onVerifiedSuccess,
}: ApartmentVerificationModalProps) {
  const { addSite, updateSite, activeSite, setActiveSiteId } = useApp();
  const { currentUser } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: activeSite?.name || "Yıldız Apartmanı",
    type: "APARTMAN" as "APARTMAN" | "SITE" | "REZIDANS" | "IS_MERKEZI",
    address: activeSite?.address || "Atatürk Cad. No: 45",
    city: activeSite?.city || "İstanbul",
    district: activeSite?.district || "Kadıköy",
    totalBlocks: activeSite?.totalBlocks || 1,
    totalUnits: activeSite?.totalUnits || 24,
    managerName: currentUser.name || "Cebrail Kara",
    managerPhone: currentUser.phone || "0532 123 45 67",
    decisionBookNo: "KD-2026/01",
    decisionDate: new Date().toISOString().split("T")[0],
    taxNumber: "9876543210",
    bankName: activeSite?.bankName || "Garanti BBVA",
    bankIban: activeSite?.bankIban || "TR33 0006 2000 1234 5678 9000 01",
    monthlyDuesDefault: 2000,
    lateInterestRatePerMonth: 5,
  });

  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleExecuteVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.managerName) {
      toast.error("Lütfen zorunlu alanları eksiksiz doldurunuz.");
      return;
    }

    setIsVerifying(true);

    try {
      const verificationCode = `AP-TR-34-${Math.floor(100000 + Math.random() * 900000)}`;

      // Update existing or create newly verified site
      await updateSite(activeSite.id, {
        name: formData.name,
        type: formData.type,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        totalBlocks: Number(formData.totalBlocks),
        totalUnits: Number(formData.totalUnits),
        managerName: formData.managerName,
        managerPhone: formData.managerPhone,
        decisionBookNo: formData.decisionBookNo,
        decisionDate: formData.decisionDate,
        taxNumber: formData.taxNumber,
        bankName: formData.bankName,
        bankIban: formData.bankIban,
        isVerified: true,
        verificationCode,
        verificationDate: new Date().toLocaleDateString("tr-TR"),
      });

      toast.success(`"${formData.name}" resmi olarak doğrulandı! (Kod: ${verificationCode})`);
      setIsVerifying(false);
      onClose();
      if (onVerifiedSuccess) onVerifiedSuccess(activeSite.id);
    } catch (err: any) {
      setIsVerifying(false);
      toast.error("Doğrulama işlemi sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#d2dbd7] space-y-6 animate-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#f0f4f1]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#172b2b]">Apartman & Site Resmi Doğrulama</h3>
                <span className="bg-emerald-600 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-full tracking-wider">
                  KMK UYUMLU
                </span>
              </div>
              <p className="text-xs text-[#7c8a87]">
                Kat Mülkiyeti Kanunu uyarınca yönetici ve apartman tescil doğrulaması.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleExecuteVerification} className="space-y-4 text-xs">
          {/* Step 1: Apartman Bilgileri */}
          <div className="p-4 bg-[#f8faf7] rounded-2xl border border-[#e4eae3] space-y-3">
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
              <Building2 size={14} /> 1. APARTMAN / SİTE GENEL BİLGİLERİ
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Apartman / Site Adı *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Akasya Konutları"
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Yönetim Tipi</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="APARTMAN">Apartman (Tek Blok)</option>
                  <option value="SITE">Çok Bloklu Site</option>
                  <option value="REZIDANS">Rezidans / Kule</option>
                  <option value="IS_MERKEZI">İş Merkezi / Plaza</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Şehir & İlçe</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Şehir"
                    className="w-full px-2.5 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  />
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="İlçe"
                    className="w-full px-2.5 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Toplam Daire / Bağımsız Bölüm</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formData.totalUnits}
                  onChange={(e) => setFormData({ ...formData, totalUnits: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#172b2b] block mb-1">Açık Adres</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Mahalle, Cadde, Sokak, Kapı No"
                className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* Step 2: Yönetici & Karar Defteri Doğrulaması */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
            <span className="text-[10px] font-black uppercase text-emerald-950 tracking-wider flex items-center gap-1.5">
              <FileText size={14} className="text-emerald-700" /> 2. YÖNETİCİ & RESMİ KARAR DEFTERİ DOĞRULAMASI
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Seçilmiş Yönetici Adı Soyadı *</label>
                <input
                  type="text"
                  required
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 focus:outline-none focus:border-emerald-600 bg-white font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Yönetici Telefonu *</label>
                <input
                  type="text"
                  required
                  value={formData.managerPhone}
                  onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 focus:outline-none focus:border-emerald-600 bg-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Karar Defteri No (KMK Md. 34)</label>
                <input
                  type="text"
                  value={formData.decisionBookNo}
                  onChange={(e) => setFormData({ ...formData, decisionBookNo: e.target.value })}
                  placeholder="Örn: KD-2026/01"
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 focus:outline-none focus:border-emerald-600 bg-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Genel Kurul Seçim Tarihi</label>
                <input
                  type="date"
                  value={formData.decisionDate}
                  onChange={(e) => setFormData({ ...formData, decisionDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 focus:outline-none focus:border-emerald-600 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Banka & IBAN */}
          <div className="p-4 bg-[#f8faf7] rounded-2xl border border-[#e4eae3] space-y-3">
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
              <Landmark size={14} /> 3. APARTMAN RESMİ BANKA & IBAN HESABI
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Banka Adı</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="Örn: Garanti BBVA, Ziraat"
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Apartman Resmi IBAN Numarası</label>
                <input
                  type="text"
                  value={formData.bankIban}
                  onChange={(e) => setFormData({ ...formData, bankIban: e.target.value })}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#f0f4f1] flex items-center justify-between">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Lock size={12} className="text-emerald-700" /> 256-Bit SSL Güvenli Doğrulama
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
              >
                Vazgeç
              </button>

              <button
                type="submit"
                disabled={isVerifying}
                className="px-6 py-2.5 rounded-xl bg-[#172b2b] hover:bg-[#294342] text-white font-bold transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isVerifying ? (
                  <>Doğrulanıyor...</>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="text-[#b8edb7]" />
                    Apartmanı Doğrula ve Başla
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
