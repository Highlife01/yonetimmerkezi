import React from "react";
import { Link } from "wouter";
import {
  Globe, Mail, MessageCircle, ShieldCheck, MapPin,
  ChevronRight, PhoneCall, CheckCircle2, Award
} from "lucide-react";

export default function PublicFooter() {
  const topCities = [
    "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya",
    "Adana", "Konya", "Gaziantep", "Kocaeli", "Mersin",
    "Kayseri", "Eskişehir", "Diyarbakır", "Samsun", "Denizli"
  ];

  return (
    <footer className="bg-white border-t border-[#e2eae3] text-xs text-slate-500 pt-16 pb-12 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
      {/* Background soft glow */}
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Top Brand & Quick Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#172b2b] to-[#254643] text-[#b8edb7] flex items-center justify-center font-black text-xl shadow-md transform -rotate-3 transition group-hover:rotate-0">
                Y
              </div>
              <div>
                <strong className="text-[#172b2b] block text-base font-black font-heading">
                  Yönetim Merkezi
                </strong>
                <span className="text-[11px] text-emerald-800 font-extrabold block">
                  %100 Ücretsiz Apartman &amp; Site Yönetimi
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-600 leading-relaxed font-medium max-w-sm">
              Kat Mülkiyeti Kanunu (KMK) 20. ve 37. maddelerine tam uyumlu, aidat tahakkuku, %5 yasal gecikme faizi, QR kodlu makbuz ve sakin mobil portalı sunan Türkiye'nin ilk ömür boyu ücretsiz bulut platformu.
            </p>

            <div className="flex items-center gap-2 pt-1 text-emerald-900 font-bold">
              <ShieldCheck size={16} className="text-emerald-700 flex-shrink-0" />
              <span>KMK 20 &amp; 37. Madde Hukuki Uyum Güvencesi</span>
            </div>
          </div>

          {/* Col 2: Sayfalar */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#172b2b] uppercase tracking-wider font-heading">
              Platform &amp; Sayfalar
            </h4>
            <ul className="space-y-2 font-semibold">
              <li>
                <Link href="/ozellikler" className="hover:text-emerald-700 transition flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-emerald-600" />
                  <span>Kapsamlı Özellikler</span>
                </Link>
              </li>
              <li>
                <Link href="/kmk-mevzuat-rehberi" className="hover:text-emerald-700 transition flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-emerald-600" />
                  <span>KMK Mevzuat Rehberi</span>
                </Link>
              </li>
              <li>
                <Link href="/tasarruf-hesapla" className="hover:text-emerald-700 transition flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-emerald-600" />
                  <span>Tasarruf Hesaplama</span>
                </Link>
              </li>
              <li>
                <Link href="/turkiye-geneli-hizmet" className="hover:text-emerald-700 transition flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-emerald-600" />
                  <span>81 İl Yerel Hizmet Ağı</span>
                </Link>
              </li>
              <li>
                <Link href="/sss" className="hover:text-emerald-700 transition flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-emerald-600" />
                  <span>Sıkça Sorulan Sorular</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hukuk & KMK */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#172b2b] uppercase tracking-wider font-heading">
              KMK &amp; Mevzuat
            </h4>
            <ul className="space-y-2 text-[11px] font-medium text-slate-600">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>KMK Md. 20: Ortak Gider &amp; Aidat Paylaşımı</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>KMK Md. 20/c: Kanuni %5 Aylık Gecikme Faizi</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>KMK Md. 37: İşletme Projesi &amp; Bütçe Sapması</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Malik &amp; Kiracı Çift Cari Mülkiyet Takibi</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Silinemez Kriptografik Denetim İzi (Audit Log)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: İletişim & GEO */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#172b2b] uppercase tracking-wider font-heading">
              Canlı Destek &amp; İletişim
            </h4>
            <div className="space-y-2 font-semibold">
              <a
                href="https://wa.me/905320550945?text=Merhaba,%20Y%C3%B6netim%20Merkezi%20hakk%C4%B1nda%20bilgi%20ve%20destek%20almak%20istiyorum."
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition"
              >
                <MessageCircle size={16} className="text-[#25D366] flex-shrink-0" />
                <div>
                  <strong className="block text-xs font-extrabold font-mono">0532 055 09 45</strong>
                  <span className="text-[10px] text-emerald-700">7/24 WhatsApp Destek Hattı</span>
                </div>
              </a>

              <a
                href="mailto:info@yonetimmerkezi.com.tr"
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 text-slate-700 transition"
              >
                <Mail size={15} className="text-emerald-600 flex-shrink-0" />
                <span className="truncate">info@yonetimmerkezi.com.tr</span>
              </a>

              <div className="flex items-center gap-2 p-2 text-slate-600 text-[11px]">
                <MapPin size={15} className="text-emerald-600 flex-shrink-0" />
                <span>Türkiye Geneli (81 İl Hizmet Ağı)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Regional Geo SEO Quick Bar */}
        <div className="border-t border-slate-200/80 pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px]">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <MapPin size={14} className="text-emerald-600" />
              <span>Türkiye Geneli Popüler Hizmet Bölgelerimiz:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {topCities.map((city) => (
                <Link
                  key={city}
                  href="/turkiye-geneli-hizmet"
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 border border-slate-200/70 transition font-medium text-[11px]"
                >
                  {city} Apartman Yönetimi
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
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

          <div className="flex flex-wrap items-center gap-4 font-semibold text-slate-600">
            <Link href="/kmk-mevzuat-rehberi" className="hover:text-emerald-700">KMK Mevzuatı</Link>
            <span>·</span>
            <Link href="/sss" className="hover:text-emerald-700">Sıkça Sorulan Sorular</Link>
            <span>·</span>
            <Link href="/iletisim" className="hover:text-emerald-700">İletişim &amp; Destek</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
