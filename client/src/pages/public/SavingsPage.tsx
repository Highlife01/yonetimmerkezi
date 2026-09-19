import React, { useState } from "react";
import { Link } from "wouter";
import {
  Calculator, TrendingUp, Check, X, ShieldCheck,
  Zap, ArrowRight, DollarSign, PieChart, Award, Sparkles
} from "lucide-react";
import SeoHead from "@/components/SeoHead";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { formatCurrency } from "@/utils/formatters";

export default function SavingsPage() {
  const [calcUnits, setCalcUnits] = useState<number>(48);
  const [calcDues, setCalcDues] = useState<number>(2500);
  const competitorMonthlyPerUnit = 55; // Sektör ortalaması daire başı aylık ücret

  const monthlyTotalCollected = calcUnits * calcDues;
  const annualTotalCollected = monthlyTotalCollected * 12;
  const competitorAnnualCost = calcUnits * competitorMonthlyPerUnit * 12;
  const fiveYearSavings = competitorAnnualCost * 5;

  const comparisonRows = [
    { feature: "Yıllık Lisans & Kullanım Bedeli", us: "ÖMÜR BOYU %100 ÜCRETSİZ (₺0)", others: "₺18.000 - ₺75.000 / Yıl", highlight: true },
    { feature: "Daire & Blok Ekleme Sınırı", us: "SINIRSIZ Daire & Site", others: "Paket kotaları ile kısıtlı", highlight: true },
    { feature: "Kurulum & Aktivasyon Masrafı", us: "₺0 (Sıfır Kurulum Maliyeti)", others: "₺2.500 - ₺10.000 Açılış Ücreti", highlight: true },
    { feature: "Kredi Kartı Zorunluluğu", us: "Asla İstenmez", others: "Zorunlu abonelik kartı", highlight: false },
    { feature: "KMK 20. Madde Toplu Tahakkuk", us: "Eşit, m², Arsa Payı, Daire Tipi", others: "Yalnızca Temel Dağıtım", highlight: false },
    { feature: "QR Kodlu Resmi Makbuz (PDF)", us: "Standart & Dahili (Tek Tık)", others: "Ek Ücretli Modül", highlight: false },
    { feature: "Borç Yaşlandırma & %5 KMK Faizi", us: "Anlık Otomatik Hesaplama", others: "Manuel ya da Kısıtlı", highlight: false },
    { feature: "Malik & Kiracı Çift Cari Takibi", us: "Eski Kiracı Geçmişi Asla Silinmez", others: "Sadece tek cari (üstüne yazılır)", highlight: false },
    { feature: "Sakin Mobil Portalı & Sanal POS", us: "256-Bit SSL Güvenli Sanal POS Dahil", others: "Ekstra Komisyon / Aylık Bedel", highlight: false },
    { feature: "Silinemez Denetim İzi (Audit Log)", us: "IP & Kullanıcı Değiştirilemez Kayıt", others: "Sadece En Üst Kurumsal Pakette", highlight: false },
    { feature: "Canlı WhatsApp Desteği", us: "Doğrudan WhatsApp İletişimi (0532 055 09 45)", others: "Ticket Sistemi (Geç Yanıt)", highlight: false },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf8] text-[#172b2b] font-sans antialiased selection:bg-[#b8edb7] selection:text-[#172b2b]">
      <SeoHead
        title="Tasarruf Hesaplama & Rakip Karşılaştırma · Apartman Yazılım Maliyeti"
        description="Apartmanınızın yıllık yazılım lisans maliyetini ve Yönetim Merkezi ile elde edeceğiniz 5 yıllık tasarrufu interaktif hesaplayın. %100 ücretsiz vs ücretli rakipler."
        canonicalPath="/tasarruf-hesapla"
        keywords="apartman yönetim yazılımı fiyatları, ücretsiz apartman programı karşılaştırma, aidat takip yazılımı maliyeti, apartman bütçesi tasarruf hesaplama, apsiyon alternatifi ücretsiz"
      />

      <PublicNavbar />

      {/* Header */}
      <section className="pt-16 pb-12 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-white to-[#f4f7f4] border-b border-[#e2eae3]">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black uppercase tracking-wider font-mono shadow-2xs">
            <Calculator size={14} className="text-emerald-700" />
            YAZILIM BÜTÇESİ TASARRUF SİMÜLATÖRÜ
          </span>

          <h1 className="text-3xl sm:text-5xl font-black text-[#172b2b] tracking-tight font-heading leading-tight">
            Apartmanınızın Kasasında <span className="text-emerald-700">On Binlerce Lira</span> Kalsın.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
            Ücretli apartman yazılımlarına her yıl on binlerce lira ödemeye son verin. Sitenizin daire sayısını girin, Yönetim Merkezi ile ne kadar tasarruf edeceğinizi anında görün.
          </p>
        </div>
      </section>

      {/* Calculator Widget */}
      <section className="py-14 px-4 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#e2eae3] shadow-xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Controls (Left 7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  PARAMETRELERİ BELİRLEYİN
                </span>
                <span className="text-xs text-slate-400 font-medium">Anlık Canlı Hesaplama</span>
              </div>

              {/* Slider 1: Daire Sayısı */}
              <div className="space-y-2 bg-[#f8faf8] p-5 rounded-2xl border border-slate-200/80">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#172b2b]">
                    Apartman / Sitedeki Daire Sayısı:
                  </label>
                  <span className="text-base font-black text-emerald-800 font-mono">
                    {calcUnits} Daire
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="500"
                  step="2"
                  value={calcUnits}
                  onChange={(e) => setCalcUnits(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>8 Daire</span>
                  <span>100 Daire</span>
                  <span>250 Daire</span>
                  <span>500+ Daire</span>
                </div>
              </div>

              {/* Slider 2: Aylık Aidat */}
              <div className="space-y-2 bg-[#f8faf8] p-5 rounded-2xl border border-slate-200/80">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#172b2b]">
                    Ortalama Daire Başı Aylık Aidat:
                  </label>
                  <span className="text-base font-black text-emerald-800 font-mono">
                    {formatCurrency(calcDues)}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="20000"
                  step="250"
                  value={calcDues}
                  onChange={(e) => setCalcDues(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>₺500</span>
                  <span>₺5.000</span>
                  <span>₺10.000</span>
                  <span>₺20.000</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 font-medium">
                * Rakip ücret hesaplaması, Türkiye piyasasındaki ücretli apartman yazılımlarının ortalama daire başı aylık ₺55 lisans bedeli baz alınarak hesaplanmıştır.
              </p>
            </div>

            {/* Results Card (Right 5 Cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#172b2b] via-[#203e3b] to-[#122826] text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-[#2d5551]">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-mono">
                  YÖNETİM MERKEZİ İLE
                </span>
                <h3 className="text-lg font-black font-heading text-white">
                  Kazanacağınız Net Tasarruf
                </h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-300 font-medium block">1 Yıllık Yazılım Tasarrufu</span>
                  <strong className="text-2xl sm:text-3xl font-black text-[#b8edb7] font-mono block mt-1">
                    {formatCurrency(competitorAnnualCost)}
                  </strong>
                  <span className="text-[10px] text-slate-400">Rakiplerin sizden alacağı yıllık aidat payı</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40">
                  <span className="text-[10px] text-emerald-300 font-bold block">5 Yıllık Kümülatif Tasarruf</span>
                  <strong className="text-3xl sm:text-4xl font-black text-white font-mono block mt-1">
                    {formatCurrency(fiveYearSavings)}
                  </strong>
                  <span className="text-[10px] text-emerald-200/80">Binanızın demirbaş ve peyzaj bütçesine kalsın</span>
                </div>
              </div>

              <Link
                href="/giris"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[#b8edb7] hover:bg-[#a0e89f] text-[#172b2b] text-xs font-black shadow-lg transition cursor-pointer font-heading"
              >
                <Zap size={15} className="fill-[#172b2b]" />
                <span>Bu Tasarrufla Hemen Başlayın</span>
                <ArrowRight size={15} />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 bg-white border-t border-[#e2eae3]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-[#172b2b]">
              Yönetim Merkezi ve Diğer Ücretli Programların Karşılaştırması
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Aynı özellikleri ve daha fazlasını neden sıfır lira ödeyerek kullanabileceğinizi inceleyin:
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[#e2eae3] shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#e2eae3]">
                  <th className="p-4 sm:p-5 font-black text-slate-700">Özellik / Hizmet</th>
                  <th className="p-4 sm:p-5 font-black text-emerald-900 bg-emerald-50/80 border-x border-emerald-200">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={14} className="text-emerald-700" />
                      <span>Yönetim Merkezi</span>
                      <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-mono">%100 ÜCRETSİZ</span>
                    </div>
                  </th>
                  <th className="p-4 sm:p-5 font-black text-slate-500">Ücretli Diğer Yazılımlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className={row.highlight ? "bg-emerald-50/20 font-bold" : "hover:bg-slate-50/80"}>
                    <td className="p-4 sm:p-5 text-slate-800 font-medium">
                      {row.feature}
                    </td>
                    <td className="p-4 sm:p-5 font-extrabold text-emerald-900 bg-emerald-50/60 border-x border-emerald-100 flex items-center gap-1.5">
                      <Check size={15} className="text-emerald-700 flex-shrink-0" />
                      <span>{row.us}</span>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500">
                      {row.others}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <PublicFooter />
      <WhatsAppFloatingButton phoneNumber="905320550945" />
    </div>
  );
}
