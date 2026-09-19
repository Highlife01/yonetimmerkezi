import React, { useState } from "react";
import { Link } from "wouter";
import {
  HelpCircle, ChevronRight, Search, ShieldCheck,
  CheckCircle2, ArrowRight, MessageCircle, Sparkles, Zap
} from "lucide-react";
import SeoHead from "@/components/SeoHead";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

export default function FaqPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const allFaqs = [
    {
      q: "Yönetim Merkezi gerçekten ömür boyu tamamen ücretsiz mi? Gizli bir masraf var mı?",
      a: "Evet, kesinlikle! Yönetim Merkezi apartmanlar, siteler ve bina yöneticileri için %100 ücretsizdir. 'İlk 30 gün ücretsiz sonra paralı', 'daire başı 50 TL', 'kredi kartınızı kaydedin' gibi gizli abonelik veya sonradan çıkan hiçbir masraf kesinlikle yoktur.",
      category: "Ücret & Model"
    },
    {
      q: "Sistem nasıl ücretsiz kalabiliyor? Güvenilir mi?",
      a: "Yönetim Merkezi, Google Cloud & Firebase sunucusuz (serverless) bulut altyapısıyla geliştirilmiştir. Eski nesil ağır sunucu maliyetleri yerine optimize edilmiş bulut kaynakları kullanılır. Misyonumuz; yöneticileri ve sakinleri yüksek yazılım aidatlarından kurtararak Türkiye'nin en büyük, şeffaf ve açık dijital apartman platformunu sunmaktır.",
      category: "Ücret & Model"
    },
    {
      q: "Kat Mülkiyeti Kanunu (KMK) standartlarına tam uygun mu?",
      a: "Kesinlikle %100 uyumludur. KMK 20. Madde (ortak giderlerin arsa payı, m² veya eşit paylaştırılması), KMK 20/c (kanuni aylık %5 gecikme tazminatı) ve KMK 37. Madde (işletme projesi ve bütçe sapma dökümleri) mekanizmaları birebir kanun hükümlerine göre çalışır.",
      category: "Hukuk & KMK"
    },
    {
      q: "Gecikme faizi (%5 KMK tazminatı) nasıl hesaplanıyor?",
      a: "Sistem, vadesi geçen aidatlar için kanuni %5 aylık oranı günlük bazda hesaplar. Örneğin 1 ay geciken 2.000 TL aidata 100 TL gecikme tazminatı eklenir. Kat sakini tahsilat makbuzunda ve ekstrede ana para ile gecikme tazminatını ayrı ayrı görebilir.",
      category: "Hukuk & KMK"
    },
    {
      q: "Eski kiracı çıktığında veya yeni kiracı geldiğinde borç geçmişi ne olur?",
      a: "Yönetim Merkezi benzersiz bir 'Çift Cari Mülkiyet' mimarisine sahiptir. Dairenin mülk sahibi (kat maliki) ile oturan kiracısı birbirinden bağımsız carilerde takip edilir. Kiracı taşındığında geçmiş borçları ve ödeme makbuzları arşivde korunur; yeni kiracı sıfır bakiye ile başlar.",
      category: "Mülk & Sakin"
    },
    {
      q: "Daire sakinleri aidatlarını online kredi kartı ile ödeyebilir mi?",
      a: "Evet! Kat malikleri ve kiracılar Sakin Portalı üzerinden cep telefonlarından güncel ekstrelerini inceleyebilir, 256-bit SSL güvenlikli Sanal POS ile kredi kartı veya banka kartıyla anında aidat ödemesi gerçekleştirebilir. Ödeme anında QR kodlu resmi makbuz üretilir.",
      category: "Finans & Tahsilat"
    },
    {
      q: "Mevcut Excel daire listemi ve geçmiş verilerimi içeri aktarabilir miyim?",
      a: "Evet. Daireler, sakinler, bloklar ve devir bakiyeleri tek tıkla Excel/CSV formatında sisteme yüklenebilir. Ayrıca tüm muhasebe dökümlerini, resmi makbuzları, gelir-gider tablolarını dilediğiniz zaman Excel ve PDF formatında indirebilirsiniz.",
      category: "Veri & Entegrasyon"
    },
    {
      q: "Tek bir kullanıcı ile birden fazla apartman veya site yönetebilir miyim?",
      a: "Evet. Tek bir yönetici hesabı ile sınırsız sayıda apartman, site, iş merkezi veya rezidans tanımlayabilir, sol menüdeki 'Aktif Site' menüsünden saniyeler içinde siteler arasında geçiş yapabilirsiniz.",
      category: "Yönetim & Yetki"
    },
    {
      q: "Verilerimiz nasıl korunuyor? Güvenlik ve yedekleme nasıl yapılıyor?",
      a: "Tüm veriler Google Cloud altyapısında 256-bit SSL şifreleme ile barındırılır. Günlük otomatik yedekleme yapılır. Ayrıca sistemdeki tüm finansal işlemler 'Silinemez Kriptografik Denetim İzi' (Audit Log) ile IP ve zaman damgalı olarak kayıt altına alınır.",
      category: "Veri & Güvenlik"
    },
    {
      q: "Yönetim Merkezi'ni kullanmak için bilgisayarıma bir program kurmam gerekir mi?",
      a: "Hayır. Yönetim Merkezi %100 bulut tabanlı bir web uygulamasıdır. Telefon, tablet, dizüstü veya masaüstü bilgisayarınızın tarayıcısından www.yonetimmerkezi.com.tr adresine girerek anında kullanmaya başlayabilirsiniz.",
      category: "Teknik"
    }
  ];

  const filteredFaqs = allFaqs.filter(f => 
    f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8faf8] text-[#172b2b] font-sans antialiased selection:bg-[#b8edb7] selection:text-[#172b2b]">
      <SeoHead
        title="Sıkça Sorulan Sorular (S.S.S.) · Apartman Yönetim Merkezi"
        description="Yönetim Merkezi ücretsiz modeli, Kat Mülkiyeti Kanunu (KMK) uyumu, online kredi kartı ile aidat ödeme, çift cari takibi ve veri aktarımı hakkında tüm sorular ve cevaplar."
        canonicalPath="/sss"
        keywords="apartman yönetimi sıkça sorulan sorular, ücretsiz apartman programı güvenilir mi, kmk gecikme faizi soruları, online aidat ödeme sss, yönetim merkezi destek"
      />

      <PublicNavbar />

      {/* Header */}
      <section className="pt-16 pb-12 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-white to-[#f4f7f4] border-b border-[#e2eae3]">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black uppercase tracking-wider font-mono shadow-2xs">
            <HelpCircle size={14} className="text-emerald-700" />
            YARDIM &amp; MERAK EDİLENLER
          </span>

          <h1 className="text-3xl sm:text-5xl font-black text-[#172b2b] tracking-tight font-heading leading-tight">
            Sıkça Sorulan Sorular ve <span className="text-emerald-700">Cevapları</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Apartman ve site yönetiminiz için aklınıza gelebilecek tüm soruların detaylı yanıtları aşağıda yer almaktadır.
          </p>

          {/* Search Box */}
          <div className="max-w-md mx-auto pt-4 relative">
            <Search size={16} className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Sorularda ara (örn: gecikme faizi, excel, ücretsiz...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </section>

      {/* FAQs List */}
      <section className="py-14 px-4 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#e2eae3] hover:border-emerald-300 overflow-hidden transition-all shadow-2xs"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#172b2b] hover:text-emerald-800 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 flex-shrink-0 font-mono">
                    {faq.category}
                  </span>
                  <span className="font-heading">{faq.q}</span>
                </div>
                <ChevronRight
                  size={18}
                  className={`transform transition-transform text-slate-400 flex-shrink-0 ${
                    activeFaq === idx ? "rotate-90 text-emerald-800" : ""
                  }`}
                />
              </button>

              {activeFaq === idx && (
                <div className="p-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-150 font-medium">
                  {faq.a}
                </div>
              )}
            </div>
          ))}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm font-bold text-slate-600">Aradığınız kriterde soru bulunamadı.</p>
              <a
                href="https://wa.me/905320550945?text=Merhaba,%20bir%20sorum%20vard%C4%B1."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:underline"
              >
                <MessageCircle size={15} className="text-[#25D366]" />
                <span>WhatsApp üzerinden doğrudan danışabilirsiniz</span>
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Still have questions banner */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 bg-white border-t border-[#e2eae3]">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <h3 className="text-xl sm:text-2xl font-black font-heading text-emerald-950">
            Aklınıza Takılan Başka Bir Soru Mu Var?
          </h3>
          <p className="text-xs sm:text-sm text-emerald-900 font-medium max-w-lg mx-auto">
            Apartmanınızın özel durumunu veya aktarım sürecini danışmak için 7/24 WhatsApp canlı destek hattımızla iletişime geçebilirsiniz.
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/905320550945?text=Merhaba,%20Y%C3%B6netim%20Merkezi%20hakk%C4%B1nda%20sorum%20var."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20be5b] text-white text-xs font-black shadow-md transition font-heading"
            >
              <MessageCircle size={16} />
              <span>WhatsApp'tan Danışın: 0532 055 09 45</span>
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
      <WhatsAppFloatingButton phoneNumber="905320550945" />
    </div>
  );
}
