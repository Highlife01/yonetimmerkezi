import React, { useState } from "react";
import { Link } from "wouter";
import {
  Scale, BookOpen, ShieldCheck, CheckCircle2, AlertTriangle,
  Calculator, FileText, ArrowRight, Sparkles, HelpCircle,
  TrendingUp, Stamp, Clock, Check, ChevronRight
} from "lucide-react";
import SeoHead from "@/components/SeoHead";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { formatCurrency } from "@/utils/formatters";

export default function KmkGuidePage() {
  // Interactive %5 KMK Delay Interest Simulator
  const [sampleDebt, setSampleDebt] = useState<number>(3000);
  const [delayMonths, setDelayMonths] = useState<number>(3);
  const monthlyInterestRate = 0.05; // KMK 20/c kanuni aylık %5

  const totalInterest = sampleDebt * monthlyInterestRate * delayMonths;
  const totalPayable = sampleDebt + totalInterest;

  const kmkArticles = [
    {
      badge: "KMK Madde 20",
      title: "Ortak Giderlerin Paylaştırılması ve Kat Maliklerinin Sorumlulukları",
      summary: "Kat maliklerinden her biri, ortak yer veya tesisler üzerindeki kullanma hakkından vazgeçmek veya kendi bağımsız bölümünün durumundan ötürü bu yerlerden faydalanmaya lüzum bulunmadığını ileri sürmek suretiyle gider ve avans payını ödemekten kaçınamaz.",
      rules: [
        "Kapıcı, kaloriferci, bahçıvan ve bekçi giderlerine ve bunlar için toplanacak avansa bütün kat malikleri EŞİT oranda katılır.",
        "Anagayrimenkulün sigorta primlerine ve bütün ortak yerlerin bakım, koruma, güçlendirme ve onarım giderleri ile yönetici aylığı gibi diğer giderlere ise ARSA PAYI oranında katılır.",
        "Gider ve avans payını ödemeyen kat maliki hakkında, diğer kat maliklerinden her biri veya yönetici tarafından dava açılabilir ve icra takibi başlatılabilir."
      ]
    },
    {
      badge: "KMK Madde 20/c",
      title: "Kanuni %5 Aylık Gecikme Tazminatı (Faiz Motoru)",
      summary: "Gider ve avans borcunun tamamını veya bir kısmını ödemeyen kat maliki, ödemede geciktiği günler için aylık yüzde beş (%5) hesabıyla gecikme tazminatı ödemekle yükümlüdür.",
      rules: [
        "Yönetim Merkezi yazılımı, vadesi geçen her bir aidat kalemi için günlük esaslı aylık %5 gecikme faizini kuruşu kuruşuna otomatik işletir.",
        "Mahkeme ve icra daireleri nezdinde kanuni faiz başlangıç tarihi, aidat tebliğ tarihi veya işletme projesinde belirlenen son ödeme günüdür.",
        "Gecikme faizi ana para ile birleşerek toplam icra takip matrahını teşkil eder."
      ]
    },
    {
      badge: "KMK Madde 37",
      title: "İşletme Projesi (Bütçe) ve Kesinleşme Süreci",
      summary: "Kat malikleri kurulunca kabul edilmiş bir işletme projesi yoksa, yönetici gecikmeksizin bir işletme projesi yapar ve kat maliklerine tebliğ eder.",
      rules: [
        "İşletme projesinde anagayrimenkulün bir yıllık tahmini gelir ve gider tutarları gösterilir.",
        "Tüm giderlerden her kat malikine düşecek tahmini tutar (arsa payı ve eşit dağılım) açıkça belirtilir.",
        "Proje kat maliklerine taahhütlü mektupla veya imza karşılığı bildirilir. 7 gün içinde itiraz edilmezse proje kesinleşir.",
        "Kesinleşen işletme projeleri, İcra ve İflas Kanunu'nun 68. maddesinin 1. fıkrasında belirtilen resmi senet niteliğindedir."
      ]
    },
    {
      badge: "KMK Madde 35",
      title: "Yöneticinin Görevleri ve Hesap Verme Zorunluluğu",
      summary: "Yöneticinin görevleri borçlar kanununun vekalet akdi hükümlerine tabidir. Yönetici, kat malikleri kuruluna karşı aynen bir vekil gibi sorumludur.",
      rules: [
        "Yönetici, ortak gider avanslarını toplamak, borçları takip etmek ve gerektiğinde icra takibi açmakla yükümlüdür.",
        "Toplanan paraların yöneticinin şahsi hesabına değil, apartman/site adına açılmış banka hesabına yatırılması zorunludur.",
        "Yönetici, kat malikleri kurulunun olağan toplantısında o tarihe kadar sağlanan gelir ile yapılan giderlerin hesabını vermek zorundadır."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8faf8] text-[#172b2b] font-sans antialiased selection:bg-[#b8edb7] selection:text-[#172b2b]">
      <SeoHead
        title="KMK Hukuki Mevzuat Rehberi · Kat Mülkiyeti Kanunu ve Aidat Hukuku"
        description="Kat Mülkiyeti Kanunu (KMK) 20. ve 37. maddeleri, kanuni %5 aylık gecikme faizi hesaplama formülü, işletme projesi tebligatı ve yönetici sorumlulukları rehberi."
        canonicalPath="/kmk-mevzuat-rehberi"
        keywords="kmk mevzuat rehberi, kat mülkiyeti kanunu 20 madde, kat mülkiyeti kanunu 37 madde, kmk 5 gecikme tazminatı, apartman gecikme faizi hesaplama, işletme projesi tebliği, apartman yöneticisi sorumlulukları"
      />

      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-white to-[#f4f7f4] border-b border-[#e2eae3]">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black uppercase tracking-wider font-mono shadow-2xs">
            <Scale size={14} className="text-emerald-700" />
            634 SAYILI KAT MÜLKİYETİ KANUNU REHBERİ
          </span>

          <h1 className="text-3xl sm:text-5xl font-black text-[#172b2b] tracking-tight font-heading leading-tight">
            Apartman ve Sitelerde <span className="text-emerald-700">Hukuki Standartlar</span> ve KMK Uyumu.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
            Yönetim Merkezi, 634 Sayılı Kat Mülkiyeti Kanunu'nun tüm emredici hükümlerine %100 uyumlu olarak geliştirilmiştir. Aidat tahakkuku, gecikme faizi ve bütçe planlamanızı yasal güvence altına alın.
          </p>
        </div>
      </section>

      {/* Interactive %5 KMK Interest Calculator Widget */}
      <section className="py-12 px-4 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#e2eae3] shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Calculator size={17} />
                </span>
                <h2 className="text-lg font-black text-[#172b2b] font-heading">
                  İnteraktif KMK %5 Gecikme Tazminatı Simülatörü
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                KMK Madde 20/c hükmü gereğince vadesinde ödenmeyen aidatlara aylık %5 faiz işletilir.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black uppercase font-mono">
              Yasal Oran: Aylık %5
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* Input 1: Borç Tutarı */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Geciken Aidat Tutarı (TL)
              </label>
              <input
                type="number"
                min="100"
                max="100000"
                step="100"
                value={sampleDebt}
                onChange={(e) => setSampleDebt(Number(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-[#172b2b] focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <span className="text-[10px] text-slate-400">Örnek: ₺3.000</span>
            </div>

            {/* Input 2: Gecikme Süresi (Ay) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Gecikme Süresi (Ay): <span className="text-emerald-700 font-extrabold">{delayMonths} Ay</span>
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={delayMonths}
                onChange={(e) => setDelayMonths(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 Ay</span>
                <span>6 Ay</span>
                <span>12 Ay</span>
              </div>
            </div>

            {/* Result Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">
                  Hesaplanan Yasal Faiz
                </span>
                <strong className="text-xl font-black text-rose-600 block mt-1">
                  +{formatCurrency(totalInterest)}
                </strong>
                <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                  Toplam Tahsil Edilecek: <strong className="text-[#172b2b]">{formatCurrency(totalPayable)}</strong>
                </span>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 mt-2 text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                <Check size={12} />
                <span>Yönetim Merkezi'nde Otomatik İşler</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Legal Articles Section */}
      <section className="py-12 px-4 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[#172b2b] font-heading">
              En Çok İhtiyaç Duyulan Kat Mülkiyeti Kanunu Maddeleri
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Apartman yöneticilerinin ve kat maliklerinin bilmesi gereken temel yasal esaslar:
            </p>
          </div>

          <div className="space-y-6">
            {kmkArticles.map((art, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2eae3] shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black uppercase font-mono">
                    {art.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    634 Sayılı Kanun
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#172b2b] font-heading">
                  {art.title}
                </h3>

                <blockquote className="p-4 rounded-2xl bg-slate-50 border-l-4 border-emerald-500 text-xs text-slate-700 italic leading-relaxed">
                  "{art.summary}"
                </blockquote>

                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Uygulamada Dikkat Edilmesi Gereken Hukuki Noktalar:
                  </h4>
                  {art.rules.map((rule, rIdx) => (
                    <div key={rIdx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed font-medium">
                      <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 bg-white border-t border-[#e2eae3]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck size={24} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-heading text-[#172b2b]">
            Apartmanınızı Hukuka ve Kanuna %100 Uygun Yönetin.
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto">
            Hatasız aidat tahakkuku, kanuni gecikme faizi hesaplaması ve resmi QR kodlu makbuzlar ile denetçi ve mahkeme nezdinde tam şeffaflık sağlayın.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/giris"
              className="px-8 py-3.5 rounded-2xl bg-[#172b2b] hover:bg-[#224441] text-white text-xs font-black shadow-lg transition flex items-center gap-2 cursor-pointer font-heading"
            >
              <span>Ücretsiz Yönetim Merkezine Başla</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/ozellikler"
              className="px-8 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-2"
            >
              <span>Tüm Modülleri İncele</span>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
      <WhatsAppFloatingButton phoneNumber="905320550945" />
    </div>
  );
}
