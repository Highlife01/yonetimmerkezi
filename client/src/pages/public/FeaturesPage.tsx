import React, { useState } from "react";
import { Link } from "wouter";
import {
  ReceiptText, HandCoins, ShieldAlert, Users, Smartphone,
  PieChart, Wallet, Wrench, ShieldCheck, Gauge, Vote,
  ArrowRight, CheckCircle2, Sparkles, Zap, Layers, FileCheck,
  UserCheck, Bell, Shield, Lock, Laptop
} from "lucide-react";
import SeoHead from "@/components/SeoHead";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState<"ALL" | "FINANCE" | "PROPERTY" | "OPERATION" | "LEGAL">("ALL");

  const modules = [
    {
      id: "dues",
      category: "FINANCE",
      icon: ReceiptText,
      title: "Toplu Aidat & Borçlandırma Motoru",
      badge: "KMK 20. Madde",
      desc: "Eşit, m², arsa payı veya daire tipine göre tek tıkla yüzlerce bağımsız bölüme aidat tahakkuku yapın. Ek bütçe, demirbaş avansı ve yakıt giderlerini anında dağıtın.",
      features: ["Eşit / m² / Arsa Payı Dağıtımı", "Otomatik Aylık Tekrarlama", "Toplu SMS & E-posta Bildirimi", "Excel'den Hızlı İçe Aktarım"],
      accent: "from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-800"
    },
    {
      id: "receipts",
      category: "FINANCE",
      icon: HandCoins,
      title: "QR Kodlu Resmi Tahsilat Makbuzu",
      badge: "Maliye & Denetim Uyumlu",
      desc: "Nakit, Havale, POS veya online kart tahsilatında benzersiz QR kodlu ve seri numaralı tahsilat makbuzunu anında PDF oluşturup sakine iletin.",
      features: ["Benzersiz QR Kod Doğrulama", "Resmi Seri & Sıra Numarası", "WhatsApp / E-Posta ile Gönderim", "Silinemez Muhasebe Arşivi"],
      accent: "from-teal-500/10 to-cyan-500/10 border-teal-200 text-teal-800"
    },
    {
      id: "aging",
      category: "LEGAL",
      icon: ShieldAlert,
      title: "Borç Yaşlandırma & %5 Yasal KMK Faizi",
      badge: "KMK 20/c Yasal Faiz",
      desc: "1-30, 31-60, 61-90 ve 90+ gün vadeli borç yaşlandırması dökümü alın. Kanuni %5 gecikme tazminatını kuruşu kuruşuna otomatik hesaplayın.",
      features: ["Günlük Hassas Faiz Motoru", "Yaşlandırma Raporları (Excel)", "Hukuki İhtarname Şablonu", "Tek Tıkla Borç Hatırlatma"],
      accent: "from-rose-500/10 to-orange-500/10 border-rose-200 text-rose-800"
    },
    {
      id: "residents",
      category: "PROPERTY",
      icon: Users,
      title: "Malik & Kiracı Çift Cari Takibi",
      badge: "Kesintisiz Mülkiyet",
      desc: "Dairenin kat maliki ile kiracısını bağımsız carilerde takip edin. Kiracı taşındığında ödeme ve borç geçmişi arşivde güvenle korunur.",
      features: ["Ayrıştırılmış Malik/Kiracı Bakiyesi", "Kiracı Tahliye / Giriş Arşivi", "Daire Sakin Bilgi Formu", "Mülkiyet Geçmişi Günlüğü"],
      accent: "from-blue-500/10 to-indigo-500/10 border-blue-200 text-blue-800"
    },
    {
      id: "portal",
      category: "PROPERTY",
      icon: Smartphone,
      title: "Sakin Mobil Portalı & Sanal POS",
      badge: "256-Bit SSL 3D Secure",
      desc: "Kat sakinleri şifresiz/şifreli mobil arayüzle güncel ekstrelerini görüntüler, kredi veya banka kartıyla aidatlarını komisyonsuz ve anında öder.",
      features: ["Mobil Uyumlu Ekstre Görüntüleme", "3D Secure Güvenli Ödeme", "Anında Otomatik Makbuz", "Talep ve Arıza Bildirimi"],
      accent: "from-purple-500/10 to-pink-500/10 border-purple-200 text-purple-800"
    },
    {
      id: "budget",
      category: "FINANCE",
      icon: PieChart,
      title: "İşletme Projesi (Bütçe) & Sapma Analizi",
      badge: "KMK 37. Madde",
      desc: "Yıllık tahmini işletme projesi hazırlayın. Gerçekleşen gelir ve giderleri bütçe kalemi bazında anlık grafikler ve sapma oranlarıyla denetleyin.",
      features: ["Kalem Bazlı Bütçe Planı", "Tahmini vs Gerçekleşen Grafiği", "Genel Kurula Hazır Döküm", "Yıl Sonu Kesin Hesap Cetveli"],
      accent: "from-lime-500/10 to-emerald-500/10 border-lime-200 text-lime-800"
    },
    {
      id: "bank",
      category: "FINANCE",
      icon: Wallet,
      title: "Kasa & Banka Virman Yönetimi",
      badge: "Çoklu Kasa & Hesap",
      desc: "Nakit kasası, Garanti, Ziraat, İş Bankası gibi banka hesaplarını eş zamanlı yönetin. Hesaplar arası virman işlemlerini tek tıkla kaydedin.",
      features: ["Sınırsız Kasa & Banka Hesabı", "Hesaplar Arası Anlık Virman", "Kasa Mutabakat Cetveli", "Banka Hareket Dökümü"],
      accent: "from-sky-500/10 to-blue-500/10 border-sky-200 text-sky-800"
    },
    {
      id: "meters",
      category: "OPERATION",
      icon: Gauge,
      title: "Dijital Sayaç Okuma & Paylaşım",
      badge: "Isı Pay Ölçer & Su",
      desc: "Merkezi sistem kalorifer, sıcak su ve soğuk su sayaçlarını endeks girerek dairelere anında dağıtın; fatura dökümlerini otomatik oluşturun.",
      features: ["İlk / Son Endeks Takibi", "Birim Fiyat Otomatik Dağıtım", "Sakin Bazında Tüketim Fişi", "Kayıp-Kaçak Analizi"],
      accent: "from-amber-500/10 to-yellow-500/10 border-amber-200 text-amber-800"
    },
    {
      id: "requests",
      category: "OPERATION",
      icon: Wrench,
      title: "Arıza, Şikayet & Tesis Bakımı",
      badge: "Canlı Operasyon",
      desc: "Sakinlerden gelen asansör, aydınlatma, hidrofor arızalarını fotoğraf ve konumla alın; bakım personeline atayıp çözüm sürecini izleyin.",
      features: ["Fotoğraflı Arıza Bildirimi", "Durum Takibi (İnceleniyor/Bitti)", "Periyodik Asansör Bakım Takvimi", "Demirbaş & Garanti Takibi"],
      accent: "from-orange-500/10 to-amber-500/10 border-orange-200 text-orange-800"
    },
    {
      id: "staff",
      category: "OPERATION",
      icon: UserCheck,
      title: "Personel, Vardiya & Güvenlik",
      badge: "Bina Görevlileri",
      desc: "Kapıcı, güvenlik, temizlik ve bahçıvan personellerinin maaş, SGK, avans ve izinlerini takip edin; nöbet çizelgelerini düzenleyin.",
      features: ["Maaş & SGK Masraf Kaydı", "Vardiya & İzin Takvimi", "Ziyaretçi & Kargo Kayıt Defteri", "Görev Atama & Takip"],
      accent: "from-emerald-500/10 to-green-500/10 border-emerald-200 text-emerald-800"
    },
    {
      id: "meetings",
      category: "LEGAL",
      icon: Vote,
      title: "Genel Kurul, Karar Defteri & Anket",
      badge: "KMK Genel Kurul",
      desc: "Olağan ve olağanüstü kat malikleri kurulu çağrılarını oluşturun; toplantı nisaplarını, vekaletnameleri ve oylamaları dijital yönetin.",
      features: ["Hazirun Cetveli Hazırlama", "Arsa Payına Göre Nisap Hesabı", "Karar Defteri Dijital Arşivi", "Online Sakin Anketleri"],
      accent: "from-indigo-500/10 to-purple-500/10 border-indigo-200 text-indigo-800"
    },
    {
      id: "audit",
      category: "LEGAL",
      icon: ShieldCheck,
      title: "Silinemez Kriptografik Denetim İzi (Audit Log)",
      badge: "Tam Şeffaflık",
      desc: "Sistemdeki her aidat tahakkuku, tahsilat, gider ve silme işlemi; kullanıcı adı, IP adresi ve zaman damgasıyla değiştirilemez biçimde kaydedilir.",
      features: ["IP & Kullanıcı Bazlı Loglama", "Geriye Dönük Değiştirilemezlik", "Denetçi Kurulu İçin Tek Tık Döküm", "KVKK Uyumlu Güvenlik"],
      accent: "from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-800"
    }
  ];

  const filtered = activeCategory === "ALL" 
    ? modules 
    : modules.filter(m => m.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#f8faf8] text-[#172b2b] font-sans antialiased selection:bg-[#b8edb7] selection:text-[#172b2b]">
      <SeoHead
        title="Özellikler & Modüller · Apartman & Site Yönetimi"
        description="KMK 20 ve 37 uyumlu toplu aidat tahakkuku, %5 yasal gecikme faizi, QR kodlu tahsilat makbuzu, çift cari takibi ve sakin mobil portalı dahil tüm özellikler."
        canonicalPath="/ozellikler"
        keywords="apartman yönetimi özellikleri, aidat takip programı modülleri, kmk gecikme faizi hesaplama, qr kodlu makbuz, sakin mobil portalı, apartman muhasebe modülü, sayaç okuma programı"
      />

      <PublicNavbar />

      {/* Hero Banner */}
      <section className="pt-16 pb-12 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-white to-[#f4f7f4] border-b border-[#e2eae3]">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black uppercase tracking-wider font-mono shadow-2xs">
            <Sparkles size={14} className="text-emerald-700" />
            20 GÜÇLÜ KURUMSAL MODÜL · %100 ÜCRETSİZ
          </span>

          <h1 className="text-3xl sm:text-5xl font-black text-[#172b2b] tracking-tight font-heading leading-tight">
            Apartman ve Sitenizin İhtiyaç Duyduğu <span className="text-emerald-700">Tüm Özellikler</span> Bir Arada.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
            Kat Mülkiyeti Kanunu (KMK) standartlarında aidat tahakkukundan sakin portalına, resmi QR makbuzlardan bütçe sapma analizine kadar eksiksiz bulut yönetim paketi.
          </p>

          {/* Category Filter Tabs */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: "ALL", label: "Tüm Modüller (12)" },
              { id: "FINANCE", label: "Finans & Muhasebe" },
              { id: "PROPERTY", label: "Mülk & Sakin Yönetimi" },
              { id: "OPERATION", label: "Operasyon & Sayaç" },
              { id: "LEGAL", label: "KMK & Hukuki Uyum" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-[#172b2b] text-white shadow-md font-extrabold"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-16 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  className="bg-white rounded-3xl p-7 border border-[#e2eae3] hover:border-emerald-300 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-100 text-emerald-800 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        <Icon size={22} className="text-emerald-800" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {mod.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#172b2b] font-heading group-hover:text-emerald-800 transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                        {mod.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      {mod.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-4">
                    <Link
                      href="/giris"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-emerald-50 text-[#172b2b] hover:text-emerald-900 border border-slate-200 text-xs font-bold transition group-hover:border-emerald-300 cursor-pointer"
                    >
                      <span>Modülü Canlı Dene</span>
                      <ArrowRight size={14} className="text-emerald-600 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-[#f4f7f4] to-white">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#172b2b] via-[#224441] to-[#122826] rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 shadow-2xl border border-[#2d5551]">
          <span className="bg-[#b8edb7] text-[#172b2b] text-xs font-black uppercase px-4 py-1.5 rounded-full inline-block">
            ÖMÜR BOYU %100 ÜCRETSİZ
          </span>

          <h2 className="text-2xl sm:text-4xl font-black font-heading text-white max-w-2xl mx-auto">
            Tüm Bu Özellikleri Kendi Apartmanınızda Hemen Kullanın.
          </h2>

          <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-xl mx-auto">
            Kredi kartı gerekmeden, saniyeler içinde dairelerinizi ekleyip ilk aidat tahakkukunuzu yapın.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/giris"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#b8edb7] hover:bg-[#a3e8a2] text-[#172b2b] text-xs font-black shadow-lg transition flex items-center justify-center gap-2 font-heading"
            >
              <Zap size={16} className="fill-[#172b2b]" />
              <span>Ücretsiz Kayıt Ol &amp; Başla</span>
            </Link>
            <Link
              href="/kmk-mevzuat-rehberi"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <span>KMK Mevzuat Rehberini İncele</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
      <WhatsAppFloatingButton phoneNumber="905320550945" />
    </div>
  );
}
