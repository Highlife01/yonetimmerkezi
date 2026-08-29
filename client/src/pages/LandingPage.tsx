import React, { useState } from "react";
import {
  Building2, Sparkles, ShieldCheck, CheckCircle2, ArrowRight,
  TrendingUp, ReceiptText, HandCoins, Users, CreditCard,
  PieChart, Wrench, Bell, Lock, Smartphone, ChevronRight,
  Calculator, FileCheck2, HelpCircle, Star, Eye, LogIn,
  ArrowUpRight, Award, Zap, Check, Play, ShieldAlert, Laptop,
  LayoutDashboard, MessageCircle
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useAuth } from "@/contexts/AuthContext";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

interface LandingPageProps {
  onGoToApp: () => void;
  onOpenLogin: () => void;
}

export default function LandingPage({ onGoToApp, onOpenLogin }: LandingPageProps) {
  const { isAuthenticated, currentUser } = useAuth();
  const [calcUnits, setCalcUnits] = useState<number>(40);
  const [calcDues, setCalcDues] = useState<number>(2000);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const monthlyTotal = calcUnits * calcDues;
  const annualTotal = monthlyTotal * 12;
  const competitorCost = Math.round(calcUnits * 45 * 12); // Average paid competitor cost per year

  const features = [
    {
      icon: ReceiptText,
      title: "Toplu Aidat & Borçlandırma",
      desc: "Eşit, m², arsa payı veya daire tipine göre tek tıkla yüzlerce daireye aidat tahakkuku yapın.",
      tag: "KMK 20. Madde Uyumlu",
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-700",
    },
    {
      icon: HandCoins,
      title: "Tahsilat & Resmi Makbuz",
      desc: "Nakit, Havale, POS veya online kart tahsilatı yapın; QR kodlu resmi tahsilat makbuzunu anında yazdırın.",
      tag: "QR Kod & Seri No",
      color: "from-blue-500/20 to-cyan-500/20 text-blue-700",
    },
    {
      icon: ShieldAlert,
      title: "Borç Yaşlandırma & %5 Faiz",
      desc: "1-30, 31-60, 61-90, 90+ gün vadeli borç yaşlandırması ve kanuni %5 gecikme tazminatını otomatik hesaplayın.",
      tag: "Toplu SMS / E-Posta",
      color: "from-rose-500/20 to-red-500/20 text-rose-700",
    },
    {
      icon: Users,
      title: "Malik & Kiracı Daire Geçmişi",
      desc: "Malik ve kiracıları ayrı yönetin. Yeni kiracı geldiğinde eski kiracının borç ve ödeme geçmişi asla silinmez.",
      tag: "Çoklu Mülkiyet",
      color: "from-amber-500/20 to-orange-500/20 text-amber-700",
    },
    {
      icon: CreditCard,
      title: "Sakin Portalı & Sanal POS",
      desc: "Sakinler cep telefonundan kendi cari ekstresini görür, 256-Bit SSL güvenliğiyle kartla aidatını öder.",
      tag: "Mobil Uyumlu",
      color: "from-purple-500/20 to-indigo-500/20 text-purple-700",
    },
    {
      icon: PieChart,
      title: "İşletme Projesi & Bütçe",
      desc: "Yıllık tahmini bütçe ile gerçekleşen harcamaları karşılaştırın, bütçe sapma analizini anlık grafiklerle izleyin.",
      tag: "KMK 37. Madde",
      color: "from-emerald-500/20 to-green-500/20 text-emerald-800",
    },
  ];

  const comparisonRows = [
    { feature: "Yıllık Lisans & Kullanım Ücreti", us: "TAMAMEN ÜCRETSİZ (₺0)", others: "Daire Başı ₺45-₺90 / Ay" },
    { feature: "Daire & Site Ekleme Sınırı", us: "Sınırsız Site & Daire", others: "Paket kotaları ile sınırlı" },
    { feature: "Toplu Aidat Tahakkuk Sihirbazı", us: "Eşit, m², Arsa Payı, Tip", others: "Temel dağıtım" },
    { feature: "QR Kodlu Resmi Makbuz (PDF/Yazıcı)", us: "Var (Standart)", others: "Ek modül / Ücretli" },
    { feature: "Borç Yaşlandırma & %5 KMK Gecikme Faizi", us: "Var (Anlık Hesaplama)", others: "Kısıtlı" },
    { feature: "Sakin Mobil Portalı & Kartla Ödeme", us: "Var (256-Bit SSL)", others: "Ücretli ek paket" },
    { feature: "Silinemez Denetim İzi (Audit Log)", us: "Var (IP & Kullanıcı Kaydı)", others: "Sadece kurumsal planda" },
    { feature: "10 Seviyeli RBAC Rol Güvenliği", us: "Var (Super Admin, Denetçi, Sakin)", others: "3-4 Rol ile kısıtlı" },
  ];

  const faqs = [
    {
      q: "Yönetim Merkezi gerçekten tamamen ücretsiz mi?",
      a: "Evet! Yönetim Merkezi apartman, site ve profesyonel yönetim şirketleri için %100 ücretsiz olarak sunulmaktadır. Gizli bir abonelik, kurulum ücreti veya kredi kartı zorunluluğu bulunmamaktadır."
    },
    {
      q: "Kat Mülkiyeti Kanunu (KMK) kurallarına uygun mu?",
      a: "Kesinlikle. Sistem; KMK 20. madde (ortak giderlere katılım), KMK 37. madde (işletme projesi) ve %5 gecikme tazminatı hesaplama standartlarına birebir uygun olarak tasarlanmıştır."
    },
    {
      q: "Eski kiracı taşındığında borç ve ödeme geçmişi ne olur?",
      a: "Sistemde malik ve kiracı kayıtları bağımsız tutulur. Kiracı taşındığında borç ve tahsilat dökümü arşivde korunur; yeni kiracı veya malik yeni döneme sıfır veya devir bakiyesiyle başlar."
    },
    {
      q: "Daire sakinleri aidatlarını online kredi kartı ile ödeyebilir mi?",
      a: "Evet. Sakin Portalı üzerinden kat malikleri ve kiracılar güncel borçlarını görerek kredi kartı veya banka kartıyla 7/24 online ödeme yapabilir ve dijital makbuzlarını anında indirebilirler."
    },
    {
      q: "Excel veya CSV formatında veri aktarımı yapabilir miyim?",
      a: "Evet. Daire listesi, sakin rehberi, aidat tahakkukları, tahsilat makbuzları ve 10+ hazır mali rapor tek tıkla Excel/CSV ve yazdırılabilir PDF formatında dışa aktarılabilir."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1c1c] text-white font-sans selection:bg-[#b8edb7] selection:text-[#172b2b]">
      {/* ======================= TOP NAVIGATION ======================= */}
      <header className="sticky top-0 z-40 bg-[#0d1c1c]/90 backdrop-blur-md border-b border-white/10 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#b8edb7] text-[#172b2b] flex items-center justify-center font-black text-2xl shadow-md transform -rotate-3">
              Y
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white">Yönetim Merkezi</span>
                <span className="bg-[#b8edb7] text-[#172b2b] text-[10px] font-black uppercase px-2 py-0.5 rounded-full font-mono">
                  %100 ÜCRETSİZ
                </span>
              </div>
              <p className="text-[10px] text-[#86af85] font-semibold">Apartman & Site Yönetim SaaS</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#ozellikler" className="hover:text-[#b8edb7] transition">Özellikler</a>
            <a href="#karsilastirma" className="hover:text-[#b8edb7] transition">Neden Ücretsiz?</a>
            <a href="#hesaplayici" className="hover:text-[#b8edb7] transition">Tasarruf Hesaplayıcı</a>
            <a href="#sss" className="hover:text-[#b8edb7] transition">Sıkça Sorulanlar</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* WhatsApp Direkt Butonu */}
            <a
              href="https://wa.me/905320550945?text=Merhaba,%20Y%C3%B6netim%20Merkezi%20hakk%C4%B1nda%20bilgi%20ve%20destek%20almak%20istiyorum."
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#4ade80] border border-[#25D366]/40 text-xs font-extrabold transition shadow-xs cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
              <span>WP: 0532 055 09 45</span>
            </a>

            {isAuthenticated ? (
              <button
                onClick={onGoToApp}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b8edb7] hover:bg-[#a6e6a5] text-[#172b2b] text-xs font-extrabold shadow-lg shadow-emerald-900/30 transition transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <LayoutDashboard size={15} /> Yönetim Paneline Geç <ArrowRight size={15} />
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  <LogIn size={15} /> Giriş Yap
                </button>
                <button
                  onClick={onGoToApp}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b8edb7] hover:bg-[#a6e6a5] text-[#172b2b] text-xs font-extrabold shadow-lg shadow-emerald-900/30 transition transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Yönetim Paneline Git <ArrowRight size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ======================= HERO SECTION ======================= */}
      <section className="relative pt-16 pb-24 px-6 lg:px-12 overflow-hidden">
        {/* Background glow elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          {/* Top badges */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-[#b8edb7] text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-md">
            <Sparkles size={14} className="text-[#b8edb7]" />
            <span>Aidattan Yönetime, Her Şey Tek Yerde.</span>
            <span className="text-white/30">·</span>
            <span className="text-white font-extrabold">Siteniz Kontrol Altında</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
            Apartman ve Siteler İçin <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#b8edb7] via-emerald-300 to-teal-200">
              Yönetimin Tek Merkezi.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed">
            Aidat tahakkuku, online kartla tahsilat, resmi makbuz dökümü, %5 gecikme tazminatı,
            kasa/banka virmanları ve sakin portalı tek bir sistemde. <strong>Tamamen ücretsiz, sınırsız ve bulut tabanlı.</strong>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onGoToApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#b8edb7] hover:bg-[#a6e6a5] text-[#172b2b] text-base font-extrabold shadow-xl shadow-emerald-950/50 transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Zap size={20} className="fill-[#172b2b]" /> {isAuthenticated ? "Yönetim Paneline Git" : "Ücretsiz Hemen Başlayın"}
            </button>

            {!isAuthenticated && (
              <button
                onClick={onOpenLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-base font-bold transition cursor-pointer backdrop-blur-md"
              >
                <LogIn size={18} /> Süper Admin / Google Girişi
              </button>
            )}
          </div>

          {/* Trust badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#86af85] font-semibold">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-[#b8edb7]" /> Kredi Kartı Gerekmez</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-[#b8edb7]" /> KMK 20 & 37. Madde Uyumlu</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-[#b8edb7]" /> Sınırsız Blok ve Daire</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-[#b8edb7]" /> Firebase Gerçek Zamanlı Bulut</span>
          </div>
        </div>

        {/* Dashboard Mockup Showcase */}
        <div className="max-w-6xl mx-auto mt-16 relative">
          <div className="rounded-3xl border border-white/15 bg-[#142626] p-3 sm:p-5 shadow-2xl shadow-black/80 backdrop-blur-xl">
            {/* Window bar */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 px-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-slate-400">yonetimmerkezi.web.app/dashboard</span>
              </div>
              <span className="text-[10px] font-bold uppercase text-[#b8edb7] bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                CANLI VERİTABANI BAĞLANTISI
              </span>
            </div>

            {/* Mockup Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[#172b2b]">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400">AYLIK TAHAKKUK</span>
                <strong className="text-xl font-extrabold text-[#172b2b] block mt-1">₺300.000</strong>
                <span className="text-[10px] text-emerald-700 font-bold">120 Bağımsız Bölüm</span>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400">TAHSİLAT ORANI</span>
                <strong className="text-xl font-extrabold text-emerald-700 block mt-1">%94,2</strong>
                <span className="text-[10px] text-slate-500">Hedef Üzerinde Performans</span>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400">KASA & BANKA</span>
                <strong className="text-xl font-extrabold text-[#172b2b] block mt-1">₺445.850</strong>
                <span className="text-[10px] text-blue-700 font-semibold">Garanti & Ziraat & Kasa</span>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400">GECİKEN BORÇLAR</span>
                <strong className="text-xl font-extrabold text-rose-600 block mt-1">₺34.750</strong>
                <span className="text-[10px] text-rose-700 font-semibold">%5 Gecikme Tazminatı</span>
              </div>
            </div>

            {/* Preview Banner */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#172b2b] to-[#213f3d] text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#b8edb7] text-[#172b2b] flex items-center justify-center font-bold">
                  <Laptop size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Kullanıcı Dostu ve Ultra Hızlı Arayüz</h4>
                  <p className="text-xs text-slate-300">19 entegre modül ile apartmanınızın tüm operasyonunu tek ekrandan yönetin.</p>
                </div>
              </div>
              <button
                onClick={onGoToApp}
                className="px-5 py-2.5 rounded-xl bg-[#b8edb7] text-[#172b2b] text-xs font-bold hover:bg-white transition whitespace-nowrap"
              >
                Demoyu Canlı Test Et →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= FEATURES GRID ======================= */}
      <section id="ozellikler" className="py-20 px-6 lg:px-12 bg-[#112424] border-t border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#b8edb7] bg-emerald-950 px-3.5 py-1 rounded-full border border-emerald-800">
              GELİŞMİŞ SAAS ÖZELLİKLERİ
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Kurumsal Standartlarda, Tamamen Ücretsiz.
            </h2>
            <p className="text-sm text-slate-300 font-medium">
              Profesyonel yönetim şirketlerinin ve site yöneticilerinin ihtiyaç duyduğu tüm araçlar eksiksiz ve kullanıma hazır.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#172b2b] border border-white/10 hover:border-[#b8edb7]/40 rounded-3xl p-7 transition transform hover:-translate-y-1 shadow-lg space-y-4 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#244240] group-hover:bg-[#b8edb7] text-[#b8edb7] group-hover:text-[#172b2b] flex items-center justify-center transition">
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase text-[#b8edb7] bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                      {f.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#b8edb7] transition">
                    {f.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================= ROI CALCULATOR ======================= */}
      <section id="hesaplayici" className="py-20 px-6 lg:px-12 bg-[#0d1c1c] border-t border-white/10">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#172b2b] to-[#1c3836] rounded-3xl p-8 sm:p-12 border border-white/15 shadow-2xl space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#b8edb7]">
              TASARRUF VE BÜTÇE HESAPLAYICI
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Siteniz Yönetim Merkezi ile Ne Kadar Kazanır?
            </h2>
            <p className="text-xs text-slate-300">
              Ücretli apartman yazılımlarına her ay binlerce lira ödemek yerine, bütçenizi sitenizin bakımına ayırın.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-4">
            {/* Sliders */}
            <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                  <span>Toplam Daire / Bağımsız Bölüm:</span>
                  <strong className="text-base text-[#b8edb7]">{calcUnits} Daire</strong>
                </div>
                <input
                  type="range"
                  min="5"
                  max="300"
                  step="5"
                  value={calcUnits}
                  onChange={(e) => setCalcUnits(Number(e.target.value))}
                  className="w-full accent-[#b8edb7] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                  <span>Daire Başı Ortalama Aidat:</span>
                  <strong className="text-base text-[#b8edb7]">{formatCurrency(calcDues)} / Ay</strong>
                </div>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="100"
                  value={calcDues}
                  onChange={(e) => setCalcDues(Number(e.target.value))}
                  className="w-full accent-[#b8edb7] cursor-pointer"
                />
              </div>

              <div className="pt-2 text-[11px] text-[#86af85] border-t border-white/10">
                Aylık toplam aidat hacminiz: <strong>{formatCurrency(monthlyTotal)}</strong>
              </div>
            </div>

            {/* Savings Result Card */}
            <div className="bg-[#b8edb7] text-[#172b2b] rounded-2xl p-8 space-y-4 shadow-xl text-center">
              <span className="text-[11px] font-black uppercase tracking-wider bg-[#172b2b] text-white px-3 py-1 rounded-full inline-block">
                YILLIK YAZILIM TASARRUFUNUZ
              </span>
              <strong className="text-4xl sm:text-5xl font-black block tracking-tight">
                {formatCurrency(competitorCost)}
              </strong>
              <p className="text-xs font-bold text-[#172b2b]/80 leading-relaxed">
                Diğer ücretli yönetim yazılımlarına ödenecek olan <strong>{formatCurrency(competitorCost)}</strong> tutar sitenizin kasasında kalır!
              </p>
              <button
                onClick={onGoToApp}
                className="w-full py-3.5 rounded-xl bg-[#172b2b] hover:bg-[#294342] text-white text-xs font-extrabold shadow-md transition"
              >
                Hemen Ücretsiz Başlayın →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= COMPARISON TABLE ======================= */}
      <section id="karsilastirma" className="py-20 px-6 lg:px-12 bg-[#112424] border-t border-white/10">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#b8edb7]">
              NEDEN YÖNETİM MERKEZİ?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Klasik Çözümler vs. Yönetim Merkezi
            </h2>
          </div>

          <div className="bg-[#172b2b] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#142626] border-b border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 sm:p-5">Özellik / Modül</th>
                  <th className="p-4 sm:p-5 text-[#b8edb7] bg-emerald-950/40">Yönetim Merkezi (Biz)</th>
                  <th className="p-4 sm:p-5">Diğer Ücretli Yazılımlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition">
                    <td className="p-4 sm:p-5 font-semibold text-white">{row.feature}</td>
                    <td className="p-4 sm:p-5 font-bold text-[#b8edb7] bg-emerald-950/20 flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-[#b8edb7] flex-shrink-0" />
                      {row.us}
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">{row.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ======================= FAQ SECTION ======================= */}
      <section id="sss" className="py-20 px-6 lg:px-12 bg-[#0d1c1c] border-t border-white/10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#b8edb7]">
              MERAK EDİLENLER
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Sıkça Sorulan Sorular
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#172b2b] rounded-2xl border border-white/10 overflow-hidden transition"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-[#b8edb7] transition"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    size={18}
                    className={`transform transition text-slate-400 ${activeFaq === idx ? "rotate-90 text-[#b8edb7]" : ""}`}
                  />
                </button>

                {activeFaq === idx && (
                  <div className="p-5 pt-0 text-xs text-slate-300 leading-relaxed border-t border-white/5 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= BOTTOM CTA BANNER ======================= */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-b from-[#112424] to-[#0d1c1c] border-t border-white/10">
        <div className="max-w-5xl mx-auto text-center space-y-6 bg-gradient-to-r from-[#172b2b] to-[#254643] rounded-3xl p-10 sm:p-16 border border-white/15 shadow-2xl">
          <span className="bg-[#b8edb7] text-[#172b2b] text-xs font-black uppercase px-3 py-1 rounded-full inline-block">
            HEMEN BAŞLAYIN
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Sitenizi Bugün Yönetim Merkezi'ne Taşıyın.
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto font-medium">
            Kredi kartı gerekmeden, saniyeler içinde ilk sitenizi oluşturun veya Süper Admin olarak tüm özellikleri canlı test edin.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGoToApp}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#b8edb7] hover:bg-[#a6e6a5] text-[#172b2b] text-sm font-extrabold shadow-xl transition transform hover:scale-105 cursor-pointer"
            >
              Yönetim Paneline Giriş Yap →
            </button>
            <a
              href="https://wa.me/905320550945?text=Merhaba,%20Y%C3%B6netim%20Merkezi%20hakk%C4%B1nda%20bilgi%20ve%20destek%20almak%20istiyorum."
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-extrabold shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>WhatsApp'tan Danışın: 0532 055 09 45</span>
            </a>
          </div>
        </div>
      </section>

      {/* ======================= FOOTER ======================= */}
      <footer className="py-12 px-6 lg:px-12 bg-[#0a1515] border-t border-white/10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#b8edb7] text-[#172b2b] flex items-center justify-center font-black text-lg">
              Y
            </div>
            <div>
              <strong className="text-white block text-sm">Yönetim Merkezi</strong>
              <span className="text-[10px] text-[#86af85]">Kat Mülkiyeti Kanunu (KMK) Uyumlu %100 Ücretsiz SaaS</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-400 font-semibold">
            <a
              href="https://wa.me/905320550945?text=Merhaba,%20Y%C3%B6netim%20Merkezi%20destek%20talebi."
              target="_blank"
              rel="noreferrer"
              className="text-[#4ade80] hover:underline flex items-center gap-1.5 font-bold"
            >
              <span>WhatsApp Destek: 0532 055 09 45</span>
            </a>
            <span>·</span>
            <span>© 2026 Yönetim Merkezi</span>
            <span>·</span>
            <span>Tüm Hakları Saklıdır</span>
          </div>
        </div>
      </footer>

      {/* FLOATING WHATSAPP BUTTON */}
      <WhatsAppFloatingButton phoneNumber="905320550945" />
    </div>
  );
}
