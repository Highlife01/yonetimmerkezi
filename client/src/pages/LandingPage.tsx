import React, { useState } from "react";
import {
  Building2, Sparkles, ShieldCheck, CheckCircle2, ArrowRight,
  TrendingUp, ReceiptText, HandCoins, Users, CreditCard,
  PieChart, Wrench, Bell, Lock, Smartphone, ChevronRight,
  Calculator, FileCheck2, HelpCircle, Star, Eye, LogIn,
  ArrowUpRight, Award, Zap, Check, Play, ShieldAlert, Laptop,
  LayoutDashboard, MessageCircle, BarChart3, ChevronDown,
  Layers, Database, FileSpreadsheet, CheckCheck, RefreshCw,
  Wallet, Shield, HelpCircle as QuestionIcon, ArrowRightLeft,
  Coins, PhoneCall, Sparkle, CircleCheck, Mail, Globe
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useAuth } from "@/contexts/AuthContext";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

interface LandingPageProps {
  onGoToApp: () => void;
  onOpenLogin: () => void;
}

export default function LandingPage({ onGoToApp, onOpenLogin }: LandingPageProps) {
  const { isAuthenticated } = useAuth();

  // Interactive Live Cockpit Tab State
  const [activeTab, setActiveTab] = useState<"dashboard" | "dues" | "aging" | "portal" | "budget">("dashboard");

  // Savings / ROI Calculator States
  const [calcUnits, setCalcUnits] = useState<number>(48);
  const [calcDues, setCalcDues] = useState<number>(2500);
  const competitorMonthlyPerUnit = 55; // Average competitor paid cost per apartment per month

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Active Feature Category State
  const [activeCategory, setActiveCategory] = useState<"ALL" | "FINANCE" | "PROPERTY" | "OPERATION" | "LEGAL">("ALL");

  // Calculations
  const monthlyTotal = calcUnits * calcDues;
  const annualTotal = monthlyTotal * 12;
  const competitorAnnualCost = calcUnits * competitorMonthlyPerUnit * 12;
  const fiveYearSavings = competitorAnnualCost * 5;

  const featuresList = [
    {
      id: "dues",
      category: "FINANCE",
      icon: ReceiptText,
      title: "Toplu Aidat & Borçlandırma",
      badge: "KMK 20. Madde",
      desc: "Eşit, m², arsa payı veya daire tipine göre tek tıkla yüzlerce bağımsız bölüme aidat tahakkuku yapın.",
      highlight: "Tek Tıkla Yüzlerce Daire",
      accentBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconColor: "text-emerald-700"
    },
    {
      id: "receipts",
      category: "FINANCE",
      icon: HandCoins,
      title: "QR Kodlu Resmi Makbuz & Tahsilat",
      badge: "Maliye & Denetim Uyumlu",
      desc: "Nakit, Havale, POS veya online kart tahsilatında benzersiz QR kodlu ve seri numaralı tahsilat makbuzunu anında PDF oluşturun.",
      highlight: "QR Doğrulama & PDF Çıktı",
      accentBg: "bg-teal-50 text-teal-700 border-teal-200",
      iconColor: "text-teal-700"
    },
    {
      id: "aging",
      category: "LEGAL",
      icon: ShieldAlert,
      title: "Borç Yaşlandırma & %5 KMK Faizi",
      badge: "Yasal %5 Faiz Motoru",
      desc: "1-30, 31-60, 61-90 ve 90+ gün vadeli borç yaşlandırması ve kanuni %5 gecikme tazminatını kuruşu kuruşuna hesaplayın.",
      highlight: "Gecikme İhtar & SMS Hazır",
      accentBg: "bg-rose-50 text-rose-700 border-rose-200",
      iconColor: "text-rose-700"
    },
    {
      id: "residents",
      category: "PROPERTY",
      icon: Users,
      title: "Malik & Kiracı Çift Cari Takibi",
      badge: "Mülkiyet Geçmişi",
      desc: "Malik ve kiracı hesaplarını bağımsız tutun. Kiracı taşındığında borç ve tahsilat geçmişi asla kaybolmaz.",
      highlight: "Kesintisiz Arşiv",
      accentBg: "bg-blue-50 text-blue-700 border-blue-200",
      iconColor: "text-blue-700"
    },
    {
      id: "portal",
      category: "PROPERTY",
      icon: Smartphone,
      title: "Sakin Portalı & Online Sanal POS",
      badge: "7/24 Mobil Ödeme",
      desc: "Kat sakinleri şifresiz/şifreli mobil giriş ile güncel ekstresini görür, 256-bit SSL güvencesiyle kredi kartıyla aidatını anında öder.",
      highlight: "3D Secure & Hızlı Tahsilat",
      accentBg: "bg-purple-50 text-purple-700 border-purple-200",
      iconColor: "text-purple-700"
    },
    {
      id: "budget",
      category: "FINANCE",
      icon: PieChart,
      title: "İşletme Projesi (Bütçe) & Sapma",
      badge: "KMK 37. Madde",
      desc: "Yıllık tahmini işletme projesi hazırlayın, gerçekleşen gelir-giderleri bütçe kalemi bazında anlık sapma grafikleriyle takip edin.",
      highlight: "Gerçekleşen vs Tahmini",
      accentBg: "bg-lime-50 text-lime-800 border-lime-200",
      iconColor: "text-lime-800"
    },
    {
      id: "bank",
      category: "FINANCE",
      icon: Wallet,
      title: "Kasa & Banka Virman Yönetimi",
      badge: "Çoklu Kasa & Hesap",
      desc: "Nakit kasa, Garanti, Ziraat vb. banka hesaplarını eş zamanlı yönetin. Hesaplar arası virman işlemlerini tek tıkla kaydedin.",
      highlight: "Anlık Bakiye Dengesi",
      accentBg: "bg-sky-50 text-sky-700 border-sky-200",
      iconColor: "text-sky-700"
    },
    {
      id: "requests",
      category: "OPERATION",
      icon: Wrench,
      title: "Arıza & Tesis Bakım Yönetimi",
      badge: "Operasyon Takibi",
      desc: "Sakinlerin arıza ve şikayet taleplerini durum bazlı (Açık, İnceleniyor, Tamamlandı) yönetin; periyodik bakım takvimini aksatmayın.",
      highlight: "Fotoğraflı Talep Bildirimi",
      accentBg: "bg-amber-50 text-amber-800 border-amber-200",
      iconColor: "text-amber-800"
    },
    {
      id: "audit",
      category: "LEGAL",
      icon: ShieldCheck,
      title: "Silinemez Denetim İzi (Audit Log)",
      badge: "Tam Şeffaflık",
      desc: "Sistemdeki her tahsilat, gider, düzenleme ve silme işlemi; IP adresi, kullanıcı adı ve zaman damgasıyla kriptolu olarak kaydedilir.",
      highlight: "Denetçi & Mahkeme Uyumlu",
      accentBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      iconColor: "text-emerald-800"
    }
  ];

  const filteredFeatures = activeCategory === "ALL" 
    ? featuresList 
    : featuresList.filter(f => f.category === activeCategory);

  const comparisonRows = [
    { 
      feature: "Yıllık Lisans & Kullanım Ücreti", 
      us: "ÖMÜR BOYU %100 ÜCRETSİZ (₺0)", 
      others: "₺18.000 - ₺75.000 / Yıl (Daire Başı ₺45-90/Ay)",
      highlight: true 
    },
    { 
      feature: "Daire & Blok / Site Ekleme Sınırı", 
      us: "SINIRSIZ Daire & Sınırsız Site", 
      others: "Paket kotaları ile kısıtlı (Ek ücret)",
      highlight: true 
    },
    { 
      feature: "Kurulum & Aktivasyon Masrafı", 
      us: "₺0 (Sıfır Kurulum Maliyeti)", 
      others: "₺2.500 - ₺10.000 Açılış Ücreti",
      highlight: true 
    },
    { 
      feature: "Kredi Kartı Zorunluluğu", 
      us: "Asla İstenmez", 
      others: "Zorunlu abonelik kartı",
      highlight: false 
    },
    { 
      feature: "KMK 20. Madde Toplu Tahakkuk", 
      us: "Eşit, m², Arsa Payı, Daire Tipi", 
      others: "Yalnızca Temel Dağıtım",
      highlight: false 
    },
    { 
      feature: "QR Kodlu Resmi Makbuz (PDF)", 
      us: "Standart & Dahili (Tek Tık)", 
      others: "Ek Ücretli Modül",
      highlight: false 
    },
    { 
      feature: "Borç Yaşlandırma & %5 Yasal KMK Faizi", 
      us: "Anlık Otomatik Hesaplama", 
      others: "Manuel ya da Kısıtlı",
      highlight: false 
    },
    { 
      feature: "Malik & Kiracı Bağımsız Çift Cari", 
      us: "Eski Kiracı Geçmişi Asla Silinmez", 
      others: "Sadece tek cari (üstüne yazılır)",
      highlight: false 
    },
    { 
      feature: "Sakin Mobil Portalı & Kartla Ödeme", 
      us: "256-Bit SSL Sanal POS Dahil", 
      others: "Ekstra Komisyon / Aylık Bedel",
      highlight: false 
    },
    { 
      feature: "Silinemez Denetim İzi (Audit Log)", 
      us: "IP & Kullanıcı Bazlı Değiştirilemez Kayıt", 
      others: "Sadece En Üst Kurumsal Pakette",
      highlight: false 
    },
    { 
      feature: "Canlı WhatsApp & Hızlı Destek Hattı", 
      us: "Doğrudan WhatsApp İletişimi (0532 055 09 45)", 
      others: "Bilet / Ticket Sistemi (Geç Yanıt)",
      highlight: false 
    },
  ];

  const faqs = [
    {
      q: "Yönetim Merkezi gerçekten ömür boyu tamamen ücretsiz mi?",
      a: "Evet! Yönetim Merkezi, apartmanlar, siteler, iş merkezleri ve profesyonel bina yöneticileri için %100 ücretsiz olarak sunulmaktadır. '30 gün sonra ücretli', 'daire başı 50 TL', 'kredi kartınızı girin' gibi gizli veya sonradan çıkan hiçbir masraf kesinlikle yoktur."
    },
    {
      q: "Sistem nasıl ücretsiz kalabiliyor? Bir kısıtlama var mı?",
      a: "Yönetim Merkezi, yeni nesil optimize edilmiş Google Cloud & Firebase sunucusuz (serverless) mimarisiyle inşa edilmiştir. Bu sayede işletme maliyetlerimiz minimum seviyededir. Misyonumuz; yöneticileri ve kat maliklerini fahiş aylık yazılım aidatlarından kurtararak Türkiye'nin en büyük, şeffaf ve açık dijital apartman topluluğunu oluşturmaktır."
    },
    {
      q: "Kat Mülkiyeti Kanunu (KMK) standartlarına uygun mu?",
      a: "Kesinlikle %100 uyumludur. KMK 20. Madde (ortak giderlerin paylaştırılması - arsa payı, m², eşit vb.), KMK 37. Madde (işletme projesi ve bütçe sapma dökümleri) ve kanuni %5 aylık gecikme tazminatı hesaplama mekanizmaları birebir kanun hükümlerine göre çalışır."
    },
    {
      q: "Eski kiracı çıktığında veya yeni kiracı geldiğinde borç geçmişi ne olur?",
      a: "Yönetim Merkezi benzersiz bir 'Çift Cari Mülkiyet' mimarisine sahiptir. Dairenin mülk sahibi (kat maliki) ile oturan kiracısı birbirinden bağımsız carilere sahiptir. Yeni kiracı girdiğinde eski kiracının borçları ve ödeme makbuzları arşivde güvenle korunur; yeni kiracı sıfır bakiye ile başlar."
    },
    {
      q: "Daire sakinleri aidatlarını online kredi kartı ile ödeyebilir mi?",
      a: "Evet! Kat malikleri ve kiracılar Sakin Portalı üzerinden cep telefonlarından güncel borçlarını inceleyebilir, 256-bit SSL güvenlikli Sanal POS ile kredi kartı veya banka kartıyla anında aidat ödemesi gerçekleştirebilir. Tahsilat yapıldığı an QR kodlu dijital makbuz üretilir."
    },
    {
      q: "Mevcut Excel daire listemi ve geçmiş verilerimi içeri aktarabilir miyim?",
      a: "Evet. Daireler, sakinler, bloklar ve devir bakiyeleri tek tıkla Excel/CSV formatında içeri aktarılabilir. Ayrıca tüm dökümleri, resmi makbuzları, gelir-gider tablolarını ve denetim raporlarını dilediğiniz zaman Excel ve PDF formatında indirebilirsiniz."
    },
    {
      q: "Birden fazla apartman veya site yönetebilir miyim?",
      a: "Evet. Tek bir kullanıcı hesabı ile dilediğiniz kadar apartman, site veya rezidansı tek ekrandan yönetebilir, sol üstteki 'Çalışılan Site' menüsünden saniyeler içinde siteler arasında geçiş yapabilirsiniz."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8faf8] text-[#172b2b] font-sans selection:bg-[#b8edb7] selection:text-[#172b2b] antialiased overflow-x-hidden">
      
      {/* ======================= BACKGROUND LIGHT MESH EFFECTS ======================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-emerald-100/60 via-teal-50/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-[30%] -left-36 w-[500px] h-[500px] bg-emerald-50/70 rounded-full blur-3xl" />
        <div className="absolute top-[60%] -right-36 w-[500px] h-[500px] bg-teal-50/70 rounded-full blur-3xl" />
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#172b2b0a_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* ======================= TOP NAVIGATION (LIGHT GLASS) ======================= */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#e4eae3] px-4 sm:px-8 lg:px-12 py-3.5 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#172b2b] to-[#284947] text-[#b8edb7] flex items-center justify-center font-black text-2xl shadow-md transform -rotate-3 transition hover:rotate-0">
                Y
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-[#172b2b] flex items-center gap-1">
                  Yönetim<span className="text-emerald-700">Merkezi</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-2xs">
                  %100 ÜCRETSİZ
                </span>
              </div>
              <p className="text-[10px] text-[#5e7773] font-bold tracking-wide">
                Bulut Tabanlı Apartman & Site Platformu
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-[#445b57]">
            <a href="#ozellikler" className="hover:text-emerald-700 transition-colors py-1">Özellikler</a>
            <a href="#canli-kokpit" className="hover:text-emerald-700 transition-colors py-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Canlı Önizleme
            </a>
            <a href="#tasarruf" className="hover:text-emerald-700 transition-colors py-1 text-emerald-800 font-extrabold">Tasarruf Hesapla</a>
            <a href="#neden-ucretsiz" className="hover:text-emerald-700 transition-colors py-1">Neden Ücretsiz?</a>
            <a href="#karsilastirma" className="hover:text-emerald-700 transition-colors py-1">Karşılaştırma</a>
            <a href="#sss" className="hover:text-emerald-700 transition-colors py-1">S.S.S.</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* WhatsApp Quick Line */}
            <a
              href="https://wa.me/905320550945?text=Merhaba,%20Y%C3%B6netim%20Merkezi%20hakk%C4%B1nda%20bilgi%20ve%20destek%20almak%20istiyorum."
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 text-xs font-bold transition shadow-2xs cursor-pointer group"
              title="7/24 WhatsApp Destek & Kurulum Hattı"
            >
              <MessageCircle size={15} className="text-[#25D366] group-hover:scale-110 transition-transform" />
              <span className="font-mono text-[11px] font-extrabold">0532 055 09 45</span>
            </a>

            {isAuthenticated ? (
              <button
                onClick={onGoToApp}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#172b2b] hover:bg-[#254643] text-white text-xs font-black shadow-md transition transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <LayoutDashboard size={15} className="text-[#b8edb7]" /> Yönetim Paneline Geç <ArrowRight size={15} />
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenLogin}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#2d4744] hover:text-[#172b2b] hover:bg-slate-100 transition cursor-pointer border border-[#d6e0d8]"
                >
                  <LogIn size={14} /> Giriş Yap
                </button>
                <button
                  onClick={onGoToApp}
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#172b2b] via-[#213f3d] to-[#172b2b] hover:from-[#213f3d] hover:to-[#2e5754] text-white text-xs font-black shadow-md transition transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Zap size={14} className="fill-[#b8edb7] text-[#b8edb7]" />
                  <span>Ücretsiz Başla</span>
                  <ArrowRight size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ======================= HERO SECTION (LIGHT LUXURY) ======================= */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-8 lg:px-12 z-10">
        <div className="max-w-5xl mx-auto text-center space-y-7">
          
          {/* Light Floating Badge */}
          <div className="inline-flex items-center gap-2.5 bg-white border border-emerald-200 text-emerald-900 text-xs font-bold px-4 py-2 rounded-full shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <span>Ömür Boyu %100 Ücretsiz Apartman & Site Yönetim Platformu</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-emerald-700 font-extrabold hidden sm:inline">Sıfır Lisans Maliyeti</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#172b2b] leading-[1.1] max-w-4xl mx-auto">
            Apartman ve Siteler İçin <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-800">
              Türkiye'nin En Kapsamlı ve Ücretsiz
            </span> <br />
            Yönetim Yazılımı.
          </h1>

          {/* Subtitle & Value Proposition */}
          <p className="text-base sm:text-xl text-[#4a635f] max-w-3xl mx-auto font-medium leading-relaxed">
            Daire başı aidat kesintilerine ve fahiş aylık yazılım lisanslarına son. 
            Aidat tahakkukundan <strong className="text-[#172b2b]">QR kodlu resmi makbuza</strong>, 
            <strong className="text-emerald-800"> %5 KMK gecikme tazminatından</strong> sakin mobil portalına kadar tüm ihtiyaçlarınız tek sistemde — 
            <span className="text-emerald-700 font-extrabold"> sınırsız daireyle ömür boyu %100 ücretsiz.</span>
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 pt-3">
            <button
              onClick={onGoToApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#172b2b] via-[#213f3d] to-[#172b2b] hover:from-[#213f3d] hover:to-[#2e5754] text-white text-base font-black shadow-xl shadow-[#172b2b]/15 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-[#2d5250]"
            >
              <Zap size={20} className="fill-[#b8edb7] text-[#b8edb7]" />
              <span>{isAuthenticated ? "Yönetim Paneline Git" : "Hemen Ücretsiz Başlayın"}</span>
              <ArrowRight size={18} />
            </button>

            <a
              href="https://wa.me/905320550945?text=Merhaba,%20Y%C3%B6netim%20Merkezi%20hakk%C4%B1nda%20canl%C4%B1%20destek%20ve%20site%20kurulum%20yard%C4%B1m%C4%B1%20almak%20istiyorum."
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-[#d6e0d8] hover:border-emerald-500 text-[#172b2b] text-base font-extrabold transition-all cursor-pointer shadow-sm"
            >
              <MessageCircle size={19} className="text-[#25D366]" />
              <span>WhatsApp Canlı Destek: 0532 055 09 45</span>
            </a>
          </div>

          {/* Quick Trust Seals (Light Cards) */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-y-3 gap-x-4 text-xs text-[#3d5954] font-bold">
            <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-[#e0e8e2] shadow-2xs">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span className="text-[#172b2b]">₺0 Lisans & Gizli Ücret Yok</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-[#e0e8e2] shadow-2xs">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span className="text-[#172b2b]">Kredi Kartı Asla İstenmez</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-[#e0e8e2] shadow-2xs">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span className="text-[#172b2b]">KMK 20 & 37. Madde Tam Uyumlu</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-[#e0e8e2] shadow-2xs">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span className="text-[#172b2b]">Sınırsız Daire & Blok Kapasitesi</span>
            </div>
          </div>
        </div>

        {/* ======================= LIVE COCKPIT INTERACTIVE WIDGET (LIGHT LUXURY) ======================= */}
        <div id="canli-kokpit" className="max-w-6xl mx-auto mt-14 sm:mt-16 scroll-mt-24">
          <div className="relative rounded-3xl border border-[#d6e0d8] bg-white p-3 sm:p-6 shadow-2xl shadow-emerald-950/5">
            
            {/* Window Top Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-[#e4eae3] gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex items-center gap-2 ml-3 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 font-semibold">
                  <Lock size={11} className="text-emerald-600" />
                  <span>www.yonetimmerkezi.com.tr/kokpit</span>
                </div>
              </div>

              {/* Status pill */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  CANLI İNTERAKTİF SİMÜLATÖR
                </span>
              </div>
            </div>

            {/* Cockpit Interactive Tabs */}
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-[#172b2b] text-white shadow-md font-extrabold"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/70 border border-slate-200"
                }`}
              >
                <LayoutDashboard size={14} className={activeTab === "dashboard" ? "text-[#b8edb7]" : "text-slate-500"} />
                <span>Yönetici Kokpiti</span>
              </button>

              <button
                onClick={() => setActiveTab("dues")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  activeTab === "dues"
                    ? "bg-[#172b2b] text-white shadow-md font-extrabold"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/70 border border-slate-200"
                }`}
              >
                <ReceiptText size={14} className={activeTab === "dues" ? "text-[#b8edb7]" : "text-slate-500"} />
                <span>Toplu Aidat & QR Makbuz</span>
              </button>

              <button
                onClick={() => setActiveTab("aging")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  activeTab === "aging"
                    ? "bg-[#172b2b] text-white shadow-md font-extrabold"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/70 border border-slate-200"
                }`}
              >
                <ShieldAlert size={14} className={activeTab === "aging" ? "text-[#b8edb7]" : "text-slate-500"} />
                <span>Borç Yaşlandırma & %5 Faiz</span>
              </button>

              <button
                onClick={() => setActiveTab("portal")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  activeTab === "portal"
                    ? "bg-[#172b2b] text-white shadow-md font-extrabold"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/70 border border-slate-200"
                }`}
              >
                <Smartphone size={14} className={activeTab === "portal" ? "text-[#b8edb7]" : "text-slate-500"} />
                <span>Sakin Mobil Portalı</span>
              </button>

              <button
                onClick={() => setActiveTab("budget")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  activeTab === "budget"
                    ? "bg-[#172b2b] text-white shadow-md font-extrabold"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/70 border border-slate-200"
                }`}
              >
                <PieChart size={14} className={activeTab === "budget" ? "text-[#b8edb7]" : "text-slate-500"} />
                <span>KMK 37 Bütçe & Kasa</span>
              </button>
            </div>

            {/* Cockpit Content Window */}
            <div className="bg-[#f4f6f2] rounded-2xl p-4 sm:p-6 border border-[#e2e8e3] min-h-[360px]">
              
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === "dashboard" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="bg-white border border-[#e2e8e3] rounded-2xl p-4 shadow-xs">
                      <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider block">Aylık Toplam Tahakkuk</span>
                      <strong className="text-xl sm:text-2xl font-black text-[#172b2b] block mt-1">₺120.000</strong>
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 size={12} /> 48 Daire Tahakkuk Edildi
                      </span>
                    </div>

                    <div className="bg-white border border-[#e2e8e3] rounded-2xl p-4 shadow-xs">
                      <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider block">Dönem Tahsilatı</span>
                      <strong className="text-xl sm:text-2xl font-black text-emerald-700 block mt-1">₺114.500</strong>
                      <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 mt-0.5">
                        <TrendingUp size={12} /> %95.4 Tahsilat Oranı
                      </span>
                    </div>

                    <div className="bg-white border border-[#e2e8e3] rounded-2xl p-4 shadow-xs">
                      <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider block">Toplam Kasa & Banka</span>
                      <strong className="text-xl sm:text-2xl font-black text-sky-700 block mt-1">₺248.650</strong>
                      <span className="text-[11px] text-sky-800 font-semibold flex items-center gap-1 mt-0.5">
                        <Wallet size={12} /> Garanti + Ziraat + Nakit
                      </span>
                    </div>

                    <div className="bg-white border border-[#e2e8e3] rounded-2xl p-4 shadow-xs">
                      <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider block">Geciken Borçlar</span>
                      <strong className="text-xl sm:text-2xl font-black text-rose-600 block mt-1">₺5.500</strong>
                      <span className="text-[11px] text-rose-700 font-semibold flex items-center gap-1 mt-0.5">
                        <ShieldAlert size={12} /> 3 Daire · %5 Faiz Devrede
                      </span>
                    </div>
                  </div>

                  {/* Simulated Data Table */}
                  <div className="bg-white border border-[#e2e8e3] rounded-2xl overflow-hidden text-xs shadow-xs">
                    <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-[#e2e8e3] font-bold text-slate-700">
                      <span>Son Tahsilatlar & Canlı Hareketler</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 font-mono px-2 py-0.5 rounded font-bold">
                        Gerçek Zamanlı Senkronize
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/70">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs">A-12</span>
                          <div>
                            <strong className="text-[#172b2b] block font-bold">Ahmet Yılmaz (Malik)</strong>
                            <span className="text-[11px] text-slate-500">Ağustos 2026 Aidatı · Kredi Kartı Online</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <strong className="text-emerald-700 block font-black text-sm">+₺2.500,00</strong>
                          <span className="text-[10px] text-slate-400 font-mono">Makbuz #MAK-2026-084</span>
                        </div>
                      </div>

                      <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/70">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 font-black flex items-center justify-center text-xs">B-04</span>
                          <div>
                            <strong className="text-[#172b2b] block font-bold">Merve Aksoy (Kiracı)</strong>
                            <span className="text-[11px] text-slate-500">Ağustos 2026 Aidatı · Garanti Bankası Havale</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <strong className="text-emerald-700 block font-black text-sm">+₺2.500,00</strong>
                          <span className="text-[10px] text-slate-400 font-mono">Makbuz #MAK-2026-085</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TOPLU AIDAT & QR MAKBUZ */}
              {activeTab === "dues" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
                  {/* Left: Dues Wizard */}
                  <div className="bg-white border border-[#e2e8e3] rounded-2xl p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#172b2b] flex items-center gap-2">
                        <ReceiptText size={16} className="text-emerald-700" />
                        Toplu Aidat Tahakkuk Sihirbazı
                      </h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                        KMK 20. Madde
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Dağıtım Yöntemi</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button className="p-2 rounded-lg bg-[#172b2b] text-white font-bold text-center">Eşit Dağıtım</button>
                          <button className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-center">Arsa Payı</button>
                          <button className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-center">m² Bazlı</button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Dönem</label>
                          <input readOnly value="Ağustos 2026" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[#172b2b] font-semibold" />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Birim Aidat Tutarı</label>
                          <input readOnly value="₺2.500,00" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-emerald-700 font-bold" />
                        </div>
                      </div>

                      <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#172b2b] to-[#244240] text-white font-black text-xs shadow-md">
                        ✓ 48 Daireye Tek Tıkla Tahakkuk Et (Toplam ₺120.000)
                      </button>
                    </div>
                  </div>

                  {/* Right: QR Code Official Receipt Sample */}
                  <div className="bg-white text-[#172b2b] rounded-2xl p-5 space-y-3 shadow-md border border-slate-200 relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">RESMİ TAHSİLAT MAKBUZU</span>
                        <strong className="block text-sm font-black text-[#172b2b]">YÖNETİM MERKEZİ APARTMANI</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500">NO: MAK-2026-084</span>
                        <span className="block text-[10px] font-bold text-slate-700">Tarih: 30.08.2026</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-1">
                      <div>
                        <span className="text-[10px] text-slate-500 block">ÖDEYEN KAT MALİKİ</span>
                        <strong className="text-xs">Ahmet Yılmaz (Daire: A-12)</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">TAHSİLAT TÜRÜ & TUTAR</span>
                        <strong className="text-sm font-black text-emerald-700">₺2.500,00 (Kredi Kartı)</strong>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between border border-slate-200 text-[10px]">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-[#172b2b] text-[#b8edb7] rounded-lg flex items-center justify-center font-mono font-black text-[9px]">
                          [QR]
                        </div>
                        <div>
                          <strong className="block text-slate-900 font-bold">256-Bit Dijital Doğrulama</strong>
                          <span className="text-slate-500 font-mono">kod: YM-8492-XQ</span>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded">
                        ✓ ONAYLANDI
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AGING & 5% INTEREST */}
              {activeTab === "aging" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#e2e8e3] shadow-xs">
                    <div>
                      <h4 className="text-sm font-bold text-[#172b2b] flex items-center gap-2">
                        <ShieldAlert size={16} className="text-rose-600" />
                        Borç Yaşlandırma Tablosu & %5 Kanuni KMK Faiz Motoru
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">Kat Mülkiyeti Kanunu uyarınca her geciken gün için otomatik %5 faiz dökümü.</p>
                    </div>
                    <span className="bg-rose-100 text-rose-800 text-xs font-black px-3 py-1 rounded-full border border-rose-200">
                      3 Daire Gecikmede
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-center text-xs">
                    <div className="bg-white border border-emerald-200 p-3 rounded-2xl shadow-xs">
                      <span className="text-[10px] text-slate-500 font-bold block">1-30 GÜN</span>
                      <strong className="text-base font-black text-emerald-700 block mt-1">₺2.500</strong>
                      <span className="text-[10px] text-slate-500">1 Daire · Hatırlatma SMS</span>
                    </div>
                    <div className="bg-white border border-amber-200 p-3 rounded-2xl shadow-xs">
                      <span className="text-[10px] text-slate-500 font-bold block">31-60 GÜN</span>
                      <strong className="text-base font-black text-amber-700 block mt-1">₺2.500</strong>
                      <span className="text-[10px] text-amber-700 font-bold">+₺125 (%5 Faiz)</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
                      <span className="text-[10px] text-slate-500 font-bold block">61-90 GÜN</span>
                      <strong className="text-base font-black text-slate-700 block mt-1">₺0</strong>
                      <span className="text-[10px] text-slate-400">Temiz Bakiye</span>
                    </div>
                    <div className="bg-white border border-rose-200 p-3 rounded-2xl shadow-xs">
                      <span className="text-[10px] text-slate-500 font-bold block">90+ GÜN (İCRA)</span>
                      <strong className="text-base font-black text-rose-600 block mt-1">₺500</strong>
                      <span className="text-[10px] text-rose-700 font-bold">İcra Takip Dosyası</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: RESIDENT PORTAL */}
              {activeTab === "portal" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center animate-in fade-in duration-200">
                  <div className="space-y-3 text-xs">
                    <span className="text-xs font-black uppercase text-purple-700 tracking-wider">MOBİL SAKİN PORTALI</span>
                    <h4 className="text-lg font-bold text-[#172b2b]">Sakinler Cepten Görür, 7/24 Kartla Öder</h4>
                    <p className="text-slate-600 leading-relaxed">
                      Kat sakinleriniz cep telefonlarından kendi dairelerinin geçmiş aidat makbuzlarını, güncel borçlarını ve sayaç tüketimlerini şeffaf şekilde inceler.
                    </p>
                    <ul className="space-y-2 text-slate-700 font-medium">
                      <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> 256-Bit SSL 3D Secure Güvenli Kredi Kartı Ödemesi</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Tek Tıkla Arıza & Hizmet Talebi Bildirimi</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Dijital Duyuru ve Karar Defteri İnceleme</li>
                    </ul>
                  </div>

                  <div className="bg-white border border-purple-200 rounded-2xl p-4 text-xs space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Smartphone size={16} className="text-purple-600" />
                        <span className="font-bold text-[#172b2b]">Sakin Cep Ekranı (Daire A-12)</span>
                      </div>
                      <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">Ödendi</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">GÜNCEL BORÇ DURUMU</span>
                      <strong className="text-2xl font-black text-emerald-700 block mt-0.5">₺0,00</strong>
                      <span className="text-[10px] text-slate-500">Ağustos 2026 aidatı ödendi. Teşekkür ederiz!</span>
                    </div>

                    <button className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs">
                      <CreditCard size={14} /> Kredi Kartıyla Online Aidat Öde
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: BUDGET & CASH */}
              {activeTab === "budget" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#e2e8e3] shadow-xs">
                    <div>
                      <h4 className="text-sm font-bold text-[#172b2b] flex items-center gap-2">
                        <PieChart size={16} className="text-emerald-700" />
                        KMK 37. Madde İşletme Projesi (Bütçe) & Kasa Virman Takibi
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">Tahmini bütçe ile gerçekleşen harcamaların sapma analizi ve kasa hareketleri.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white border border-[#e2e8e3] p-4 rounded-2xl shadow-xs">
                      <span className="text-[10px] text-slate-500 font-bold block">ASANSÖR BAKIM GİDERİ</span>
                      <div className="flex items-baseline justify-between mt-1">
                        <strong className="text-[#172b2b] text-sm font-bold">Gerçekleşen: ₺12.000</strong>
                        <span className="text-[10px] text-slate-500">Bütçe: ₺15.000</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: "80%" }} />
                      </div>
                      <span className="text-[9px] text-emerald-700 font-bold block mt-1">✓ Bütçe Dahilinde (%80 Kullanım)</span>
                    </div>

                    <div className="bg-white border border-[#e2e8e3] p-4 rounded-2xl shadow-xs">
                      <span className="text-[10px] text-slate-500 font-bold block">ORTAK ALAN ELEKTRİK</span>
                      <div className="flex items-baseline justify-between mt-1">
                        <strong className="text-[#172b2b] text-sm font-bold">Gerçekleşen: ₺18.500</strong>
                        <span className="text-[10px] text-slate-500">Bütçe: ₺20.000</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: "92%" }} />
                      </div>
                      <span className="text-[9px] text-emerald-700 font-bold block mt-1">✓ Bütçe Dahilinde (%92 Kullanım)</span>
                    </div>

                    <div className="bg-white border border-[#e2e8e3] p-4 rounded-2xl shadow-xs">
                      <span className="text-[10px] text-slate-500 font-bold block">TEMİZLİK & SARF MALZEME</span>
                      <div className="flex items-baseline justify-between mt-1">
                        <strong className="text-[#172b2b] text-sm font-bold">Gerçekleşen: ₺6.200</strong>
                        <span className="text-[10px] text-slate-500">Bütçe: ₺8.000</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: "77%" }} />
                      </div>
                      <span className="text-[9px] text-emerald-700 font-bold block mt-1">✓ Bütçe Dahilinde (%77 Kullanım)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Demo Bar */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#172b2b] text-[#b8edb7] flex items-center justify-center font-black">
                  <Laptop size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#172b2b]">Canlı Paneli Kendi Sitenizle Deneyin</h4>
                  <p className="text-xs text-slate-600">Hiçbir kurulum gerekmez. Tek tıkla tarayıcınızdan yönetim merkezini test edin.</p>
                </div>
              </div>

              <button
                onClick={onGoToApp}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#172b2b] hover:bg-[#254643] text-white text-xs font-black transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                Ücretsiz Demoyu Başlat →
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ======================= LIVE STATS & TRUST BAR (LIGHT) ======================= */}
      <section className="py-12 border-y border-[#e2e8e3] bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">₺0</span>
              <p className="text-xs font-bold text-[#172b2b]">Ömür Boyu Lisans Ücreti</p>
              <span className="text-[10px] text-slate-500 block">Gizli aidat yok</span>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-[#172b2b] tracking-tight">1.450+</span>
              <p className="text-xs font-bold text-[#172b2b]">Aktif Apartman & Site</p>
              <span className="text-[10px] text-slate-500 block">Türkiye geneli</span>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-[#172b2b] tracking-tight">48.000+</span>
              <p className="text-xs font-bold text-[#172b2b]">Yönetilen Bağımsız Bölüm</p>
              <span className="text-[10px] text-slate-500 block">Malik ve kiracı</span>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">%99.8</span>
              <p className="text-xs font-bold text-[#172b2b]">Zamanında Tahsilat Başarısı</p>
              <span className="text-[10px] text-slate-500 block">Otomatik hatırlatmalarla</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= WHY 100% FREE? (TRANSPARENCY MANIFESTO - LIGHT) ======================= */}
      <section id="neden-ucretsiz" className="py-20 px-4 sm:px-8 lg:px-12 bg-[#f4f6f2] border-b border-[#e2e8e3] scroll-mt-20">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-4 py-1.5 rounded-full border border-emerald-300">
              ŞEFFAFLIK & GÜVEN MANİFESTOSU
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#172b2b] tracking-tight">
              Neden %100 Ücretsiz? Sırrımız Ne?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Çoğu yazılım firması sitenizden daire başına aylık ₺45-90 aidat keserken, Yönetim Merkezi'ni nasıl tamamen ücretsiz sunuyoruz?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="bg-white border border-[#e2e8e3] hover:border-emerald-500 rounded-3xl p-6 space-y-3.5 transition group shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Coins size={24} />
              </div>
              <h3 className="text-base font-bold text-[#172b2b] group-hover:text-emerald-800 transition">
                1. Fahiş Ücretleri Reddediyoruz
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apartman bütçelerinin binlerce lirasının yazılım firmalarına gitmesine inanmıyoruz. O para sitenizin asansörüne, güvenliğine ve bakımına harcanmalıdır.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white border border-[#e2e8e3] hover:border-teal-500 rounded-3xl p-6 space-y-3.5 transition group shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Database size={24} />
              </div>
              <h3 className="text-base font-bold text-[#172b2b] group-hover:text-teal-800 transition">
                2. Yeni Nesil Bulut Mimarisi
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Eski hantal sunucular yerine Google Cloud & Firebase altyapısını kullanıyoruz. Maliyetlerimiz son derece düşük, sistemimiz ise ışık hızındadır.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white border border-[#e2e8e3] hover:border-sky-500 rounded-3xl p-6 space-y-3.5 transition group shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-base font-bold text-[#172b2b] group-hover:text-sky-800 transition">
                3. Gizli Sözleşme & Kart Yok
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kredi kartı bilgisi sormuyoruz. 'İlk 14 gün ücretsiz sonra paralı' tuzakları yoktur. Sisteme girdiğiniz ilk gün de, 10 yıl sonra da ücretsizdir.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-white border border-[#e2e8e3] hover:border-purple-500 rounded-3xl p-6 space-y-3.5 transition group shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <FileSpreadsheet size={24} />
              </div>
              <h3 className="text-base font-bold text-[#172b2b] group-hover:text-purple-800 transition">
                4. %100 Veri Bağımsızlığı
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verileriniz sizin mülkünüzdür. Dilediğiniz an tüm sakin listelerini, makbuzları ve bilançoları tek tıkla Excel ve PDF olarak dışa aktarabilirsiniz.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ======================= SAVINGS / ROI CALCULATOR (LIGHT LUXURY) ======================= */}
      <section id="tasarruf" className="py-20 px-4 sm:px-8 lg:px-12 bg-white border-b border-[#e2e8e3] scroll-mt-20">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#f8faf8] via-white to-emerald-50/40 rounded-3xl p-6 sm:p-12 border border-emerald-200 shadow-xl space-y-8 relative overflow-hidden">
          
          {/* Top light glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-2 max-w-2xl mx-auto relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-300">
              TASARRUF & KAZANÇ HESAPLAYICI
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#172b2b]">
              Siteniz Ücretsiz Yazılımla Ne Kadar Kazanır?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Diğer ücretli yönetim yazılımlarına her yıl on binlerce lira ödemek yerine, bütçenizi sitenizin yatırımlarına ayırın.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-2 relative z-10">
            
            {/* Sliders Area */}
            <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Toplam Daire / Bağımsız Bölüm:</span>
                  <strong className="text-base text-emerald-800 font-black">{calcUnits} Daire</strong>
                </div>
                <input
                  type="range"
                  min="6"
                  max="250"
                  step="2"
                  value={calcUnits}
                  onChange={(e) => setCalcUnits(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>6 Daire</span>
                  <span>100 Daire</span>
                  <span>250 Daire</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Daire Başı Ortalama Aidat:</span>
                  <strong className="text-base text-emerald-800 font-black">{formatCurrency(calcDues)} / Ay</strong>
                </div>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="100"
                  value={calcDues}
                  onChange={(e) => setCalcDues(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>₺500</span>
                  <span>₺5.000</span>
                  <span>₺10.000</span>
                </div>
              </div>

              <div className="pt-3 text-xs text-slate-600 border-t border-slate-100 flex items-center justify-between font-semibold">
                <span>Aylık Toplam Aidat Hacminiz:</span>
                <strong className="text-[#172b2b] text-sm">{formatCurrency(monthlyTotal)}</strong>
              </div>
            </div>

            {/* Savings Result Card */}
            <div className="bg-gradient-to-tr from-[#172b2b] via-[#213f3d] to-[#172b2b] text-white rounded-2xl p-7 space-y-4 shadow-xl text-center border border-[#2d5250]">
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#b8edb7] text-[#172b2b] px-3 py-1 rounded-full inline-block shadow-sm">
                YILLIK NET YAZILIM TASARRUFUNUZ
              </span>
              
              <div>
                <strong className="text-4xl sm:text-5xl font-black block tracking-tight text-white">
                  {formatCurrency(competitorAnnualCost)}
                </strong>
                <span className="text-xs font-extrabold text-[#b8edb7] block mt-1">
                  5 Yılda Tam <strong>{formatCurrency(fiveYearSavings)}</strong> Kasada Kalır!
                </span>
              </div>

              <div className="bg-white/10 p-3 rounded-xl text-left text-xs space-y-1 font-medium text-slate-200">
                <strong className="block text-[11px] font-black uppercase text-[#b8edb7]">💡 Bu Tasarrufla Sitenize Ne Yapabilirsiniz?</strong>
                <p>• 1 Yıllık Tam Kapsamlı Asansör Revizyonu & Bakımı</p>
                <p>• Ortak Alan LED Aydınlatma & Bahçe Peyzajı</p>
                <p>• 8 Kameralı IP Güvenlik Sistemi Kurulumu</p>
              </div>

              <button
                onClick={onGoToApp}
                className="w-full py-3.5 rounded-xl bg-[#b8edb7] hover:bg-[#a6e6a5] text-[#172b2b] text-xs font-black shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                Bu Tasarrufu Sitenize Kazandırın →
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ======================= COMPREHENSIVE FEATURES GRID (LIGHT) ======================= */}
      <section id="ozellikler" className="py-20 px-4 sm:px-8 lg:px-12 bg-[#f4f6f2] border-b border-[#e2e8e3] scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-4 py-1.5 rounded-full border border-emerald-300">
              19 ENTEGRE PROFESYONEL MODÜL
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#172b2b] tracking-tight">
              Eksiksiz Yönetim, Sıfır Maliyet.
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Profesyonel yönetim şirketlerinin kullandığı en gelişmiş özelliklerin tamamı parmaklarınızın ucunda.
            </p>
          </div>

          {/* Feature Category Filter Tabs */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { id: "ALL", label: "Tüm Modüller" },
              { id: "FINANCE", label: "Finans & Muhasebe" },
              { id: "PROPERTY", label: "Mülk & Sakin" },
              { id: "OPERATION", label: "Tesis & Operasyon" },
              { id: "LEGAL", label: "KMK & Denetim" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-[#172b2b] text-white font-black shadow-sm"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#e2e8e3] hover:border-emerald-500 rounded-3xl p-7 transition-all transform hover:-translate-y-1 shadow-xs hover:shadow-lg space-y-4 group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 border ${f.accentBg}`}>
                      <Icon size={24} className={f.iconColor} />
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#172b2b] group-hover:text-emerald-800 transition">
                    {f.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {f.desc}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={13} /> {f.highlight}
                    </span>
                    <span className="text-emerald-800 opacity-0 group-hover:opacity-100 transition">Ücretsiz →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================= DETAILED COMPARISON TABLE (LIGHT) ======================= */}
      <section id="karsilastirma" className="py-20 px-4 sm:px-8 lg:px-12 bg-white border-b border-[#e2e8e3] scroll-mt-20">
        <div className="max-w-5xl mx-auto space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-300">
              NET KARŞILAŞTIRMA
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#172b2b]">
              Klasik Ücretli Yazılımlar vs. Yönetim Merkezi
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Neden binlerce site yöneticisi Yönetim Merkezi'ne geçiş yapıyor?
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#d6e0d8] overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[550px]">
                <thead className="bg-[#172b2b] text-white font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4 sm:p-5">Kriter / Modül</th>
                    <th className="p-4 sm:p-5 text-[#172b2b] bg-[#b8edb7] font-black text-center text-xs">
                      ⭐ Yönetim Merkezi (Biz)
                    </th>
                    <th className="p-4 sm:p-5 text-slate-300 text-center">Diğer Ücretli Yazılımlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className={`hover:bg-slate-50 transition ${row.highlight ? "bg-emerald-50/50" : ""}`}>
                      <td className="p-4 sm:p-5 font-bold text-[#172b2b]">
                        {row.feature}
                      </td>
                      <td className="p-4 sm:p-5 font-black text-emerald-900 bg-emerald-100/60 text-center">
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
                          {row.us}
                        </span>
                      </td>
                      <td className="p-4 sm:p-5 text-slate-500 text-center font-medium">
                        {row.others}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= 3-STEP EASY ONBOARDING (LIGHT) ======================= */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 bg-[#f4f6f2] border-b border-[#e2e8e3]">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-800">
              KOLAY BAŞLANGIÇ
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#172b2b]">
              3 Kolay Adımda Sitenizi Yayına Alın
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Karmaşık eğitimler veya teknik personel gerekmez. 5 dakika içinde sisteminiz hazır.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white border border-[#e2e8e3] rounded-3xl p-6 space-y-3 relative shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#172b2b] text-[#b8edb7] font-black text-lg flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-[#172b2b]">Sitenizi & Daireleri Ekleyin</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sitenizin blok ve dairelerini manuel ekleyin veya mevcut Excel listenizi tek tıkla yükleyin.
              </p>
            </div>

            <div className="bg-white border border-[#e2e8e3] rounded-3xl p-6 space-y-3 relative shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#172b2b] text-[#b8edb7] font-black text-lg flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-[#172b2b]">Aidat Tahakkuku Yapın</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aidat tutarınızı ve dağıtım tipini (m², arsa payı veya eşit) seçerek tek tıkla borçlandırın.
              </p>
            </div>

            <div className="bg-white border border-[#e2e8e3] rounded-3xl p-6 space-y-3 relative shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#172b2b] text-[#b8edb7] font-black text-lg flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-bold text-[#172b2b]">Tahsil Edin & Makbuz Üretin</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nakit, havale veya kredi kartı tahsilatlarını işleyin; QR kodlu resmi makbuzları otomatik üretin.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ======================= FAQ ACCORDION SECTION (LIGHT) ======================= */}
      <section id="sss" className="py-20 px-4 sm:px-8 lg:px-12 bg-white border-b border-[#e2e8e3] scroll-mt-20">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-300">
              MERAK EDİLENLER
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#172b2b]">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Aklınıza takılan tüm soruların şeffaf yanıtları.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#f8faf8] rounded-2xl border border-[#e2e8e3] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#172b2b] hover:text-emerald-800 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <QuestionIcon size={16} className="text-emerald-700 flex-shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronRight
                    size={18}
                    className={`transform transition-transform text-slate-400 flex-shrink-0 ${activeFaq === idx ? "rotate-90 text-emerald-800" : ""}`}
                  />
                </button>

                {activeFaq === idx && (
                  <div className="p-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= BOTTOM HIGH-IMPACT CTA BANNER (LIGHT/EMERALD LUXURY) ======================= */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-[#f4f6f2] to-white">
        <div className="max-w-5xl mx-auto text-center space-y-7 bg-gradient-to-r from-[#172b2b] via-[#244643] to-[#172b2b] text-white rounded-3xl p-8 sm:p-16 border border-[#2e5250] shadow-2xl relative overflow-hidden">
          
          <div className="relative z-10 space-y-5">
            <span className="bg-[#b8edb7] text-[#172b2b] text-xs font-black uppercase px-4 py-1.5 rounded-full inline-block shadow-md">
              HİÇBİR MASRAF YOK · %100 ÜCRETSİZ
            </span>
            
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto leading-tight">
              Sitenizi Bugün Geleceğin Yönetim Standardına Taşıyın.
            </h2>
            
            <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto font-medium">
              Kredi kartı gerekmeden, saniyeler içinde ilk sitenizi oluşturun veya Süper Admin olarak tüm modülleri anında canlı test edin.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGoToApp}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#b8edb7] to-[#8ae588] hover:from-[#a4eda3] hover:to-[#73d771] text-[#172b2b] text-sm font-black shadow-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap size={18} className="fill-[#172b2b]" />
                <span>Ücretsiz Yönetim Paneline Geç</span>
                <ArrowRight size={18} />
              </button>

              <a
                href="https://wa.me/905320550945?text=Merhaba,%20Y%C3%B6netim%20Merkezi%20hakk%C4%B1nda%20bilgi%20ve%20kurulum%20deste%C4%9Fi%20almak%20istiyorum."
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-black shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle size={18} />
                <span>WhatsApp'tan Danışın: 0532 055 09 45</span>
              </a>
            </div>

            <div className="pt-2 text-xs text-[#b8edb7] font-semibold flex items-center justify-center gap-2">
              <ShieldCheck size={16} className="text-[#b8edb7]" />
              <span>Kat Mülkiyeti Kanunu (KMK) 20 & 37. Madde Uyum Garantisi</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= FOOTER (LIGHT) ======================= */}
      <footer className="py-12 px-4 sm:px-8 lg:px-12 bg-white border-t border-[#e2e8e3] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#172b2b] text-[#b8edb7] flex items-center justify-center font-black text-xl">
                Y
              </div>
              <div>
                <strong className="text-[#172b2b] block text-sm font-black">Yönetim Merkezi</strong>
                <span className="text-[11px] text-slate-500 font-semibold">Kat Mülkiyeti Kanunu (KMK) Uyumlu %100 Ücretsiz SaaS Platformu</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-700 font-bold">
              <a href="#ozellikler" className="hover:text-emerald-700 transition">Özellikler</a>
              <a href="#canli-kokpit" className="hover:text-emerald-700 transition">Canlı Önizleme</a>
              <a href="#tasarruf" className="hover:text-emerald-700 transition">Tasarruf Hesapla</a>
              <a href="#karsilastirma" className="hover:text-emerald-700 transition">Karşılaştırma</a>
              <a href="#sss" className="hover:text-emerald-700 transition">S.S.S.</a>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div className="flex flex-wrap items-center gap-4">
              <span>© 2026 Yönetim Merkezi. Tüm Hakları Saklıdır.</span>
              <span>·</span>
              <span className="text-emerald-700 font-bold">Ömür Boyu %100 Ücretsiz</span>
              <span>·</span>
              <a
                href="https://www.yonetimmerkezi.com.tr"
                className="hover:text-emerald-700 transition flex items-center gap-1 font-semibold"
              >
                <Globe size={13} className="text-emerald-600" />
                <span>www.yonetimmerkezi.com.tr</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-5 font-semibold">
              <a
                href="mailto:info@yonetimmerkezi.com.tr"
                className="text-slate-700 hover:text-emerald-700 flex items-center gap-1.5 transition font-bold"
              >
                <Mail size={14} className="text-emerald-600" />
                <span>info@yonetimmerkezi.com.tr</span>
              </a>
              <a
                href="https://wa.me/905320550945?text=Merhaba,%20Y%C3%B6netim%20Merkezi%20destek%20talebi."
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:underline flex items-center gap-1.5 font-bold"
              >
                <MessageCircle size={14} className="text-[#25D366]" />
                <span>WhatsApp: 0532 055 09 45</span>
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* FLOATING WHATSAPP BUTTON (7/24 SUPPORT) */}
      <WhatsAppFloatingButton phoneNumber="905320550945" />

    </div>
  );
}
