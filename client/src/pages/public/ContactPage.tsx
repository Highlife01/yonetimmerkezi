import React, { useState } from "react";
import { Link } from "wouter";
import {
  PhoneCall, Mail, MessageCircle, MapPin, Send,
  ShieldCheck, Clock, CheckCircle2, Globe, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import SeoHead from "@/components/SeoHead";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "İstanbul",
    apartName: "",
    unitsCount: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error("Lütfen adınızı ve telefon numaranızı girin.");
      return;
    }
    setIsSubmitted(true);
    toast.success("Mesajınız başarıyla iletildi! Uzman temsilcimiz en kısa sürede size ulaşacaktır.");
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] text-[#172b2b] font-sans antialiased selection:bg-[#b8edb7] selection:text-[#172b2b]">
      <SeoHead
        title="İletişim & Canlı Destek · 7/24 WhatsApp & E-Posta"
        description="Yönetim Merkezi apartman ve site yönetim platformu iletişim bilgileri, 7/24 WhatsApp canlı destek hattı (0532 055 09 45) ve Türkiye geneli destek."
        canonicalPath="/iletisim"
        keywords="yönetim merkezi iletişim, apartman yönetimi whatsapp destek, bina yönetim programı telefon, apartman yönetimi danışma hattı"
      />

      <PublicNavbar />

      {/* Header */}
      <section className="pt-16 pb-12 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-white to-[#f4f7f4] border-b border-[#e2eae3]">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black uppercase tracking-wider font-mono shadow-2xs">
            <PhoneCall size={14} className="text-emerald-700" />
            7/24 İLETİŞİM &amp; CANLI DESTEK
          </span>

          <h1 className="text-3xl sm:text-5xl font-black text-[#172b2b] tracking-tight font-heading leading-tight">
            Siteniz İçin <span className="text-emerald-700">Her Zaman</span> Yanınızdayız.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Kurulum, eski verilerin Excel ile aktarımı veya KMK mevzuat sorularınız için doğrudan WhatsApp hattımızdan veya form üzerinden bize ulaşabilirsiniz.
          </p>
        </div>
      </section>

      {/* Contact Content Grid */}
      <section className="py-16 px-4 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left 5 Cols: Contact Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-xl font-black text-[#172b2b] font-heading">
                Doğrudan İletişim Kanallarımız
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Mesajlarınıza ortalama 15 dakika içinde geri dönüş sağlanır.
              </p>
            </div>

            {/* WhatsApp Card */}
            <a
              href="https://wa.me/905320550945?text=Merhaba,%20Y%C3%B6netim%20Merkezi%20hakk%C4%B1nda%20bilgi%20ve%20destek%20almak%20istiyorum."
              target="_blank"
              rel="noreferrer"
              className="p-6 rounded-3xl bg-[#25D366]/10 border border-[#25D366]/30 hover:border-[#25D366] transition-all flex items-start gap-4 group cursor-pointer block"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <MessageCircle size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider font-mono block">
                  7/24 WHATSAPP CANLI HATTI
                </span>
                <strong className="text-lg font-black text-[#172b2b] block font-mono mt-0.5">
                  0532 055 09 45
                </strong>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  WhatsApp üzerinden mesaj gönderin, kurulum ve teknik sorularınızı anında çözelim.
                </p>
              </div>
            </a>

            {/* Email Card */}
            <a
              href="mailto:info@yonetimmerkezi.com.tr"
              className="p-6 rounded-3xl bg-white border border-[#e2eae3] hover:border-emerald-300 transition-all flex items-start gap-4 group cursor-pointer block shadow-2xs"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Mail size={22} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono block">
                  RESMİ E-POSTA
                </span>
                <strong className="text-sm font-black text-[#172b2b] block mt-0.5">
                  info@yonetimmerkezi.com.tr
                </strong>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Kurumsal talepler, iş birliği ve önerileriniz için e-posta gönderin.
                </p>
              </div>
            </a>

            {/* Geo Support Card */}
            <div className="p-6 rounded-3xl bg-white border border-[#e2eae3] flex items-start gap-4 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                <MapPin size={22} className="text-emerald-700" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono block">
                  HİZMET KAPSAMI
                </span>
                <strong className="text-sm font-black text-[#172b2b] block mt-0.5">
                  Türkiye Geneli (81 İl)
                </strong>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Tüm Türkiye genelinde binlerce apartman ve site tarafından online bulut sistemi üzerinden kullanılmaktadır.
                </p>
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-[#e2eae3] shadow-xl">
            {isSubmitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-black font-heading text-[#172b2b]">
                  Talebiniz Başarıyla Alındı!
                </h3>
                <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
                  Ekibimiz verdiğiniz iletişim bilgilerinden en kısa sürede sizinle iletişime geçecektir. Dilerseniz hemen WhatsApp üzerinden de yazabilirsiniz.
                </p>
                <div className="pt-4">
                  <a
                    href="https://wa.me/905320550945?text=Merhaba,%20web%20sitenizden%20form%20doldurmu%C5%9Ftum."
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#25D366] text-white text-xs font-black shadow-md font-heading"
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp'tan Hızlıca İletişime Geç</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-[#172b2b] font-heading">
                    Bilgi &amp; Kurulum Destek Formu
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Aşağıdaki formu doldurun, uzman ekibimiz size özel destek sağlasın.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Adınız Soyadınız *</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Ahmet Yılmaz"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Telefon Numaranız *</label>
                    <input
                      type="tel"
                      required
                      placeholder="05XX XXX XX XX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">E-Posta Adresiniz</label>
                    <input
                      type="email"
                      placeholder="ornek@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Şehir</label>
                    <input
                      type="text"
                      placeholder="Örn: İstanbul, Ankara..."
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Apartman / Site Adı</label>
                    <input
                      type="text"
                      placeholder="Örn: Kardelen Apartmanı"
                      value={formData.apartName}
                      onChange={(e) => setFormData({ ...formData, apartName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tahmini Daire Sayısı</label>
                    <input
                      type="number"
                      placeholder="Örn: 24"
                      value={formData.unitsCount}
                      onChange={(e) => setFormData({ ...formData, unitsCount: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mesajınız veya Sorunuz</label>
                  <textarea
                    rows={4}
                    placeholder="Sormak istediğiniz soruları veya ihtiyaçlarınızı yazabilirsiniz..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#172b2b] hover:bg-[#224441] text-white text-xs font-black shadow-lg transition flex items-center justify-center gap-2 cursor-pointer font-heading"
                >
                  <Send size={15} />
                  <span>Mesajı Gönder &amp; Danışman Desteği Al</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      <PublicFooter />
      <WhatsAppFloatingButton phoneNumber="905320550945" />
    </div>
  );
}
