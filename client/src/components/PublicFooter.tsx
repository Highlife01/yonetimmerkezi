import React from "react";
import { Link } from "wouter";
import {
  Globe, Mail, ShieldCheck,
  ChevronRight, CheckCircle2
} from "lucide-react";

export default function PublicFooter() {
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
                  KMK Uyumlu Apartman &amp; Site Yönetimi
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-600 leading-relaxed font-medium max-w-sm">
              Kat Mülkiyeti Kanunu (KMK) 20. ve 37. maddelerine tam uyumlu, aidat tahakkuku, %5 yasal gecikme faizi, QR kodlu makbuz ve sakin mobil portalı sunan yeni nesil bulut yönetim platformu.
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
                <Link href="/iletisim" className="hover:text-emerald-700 transition flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-emerald-600" />
                  <span>İletişim &amp; Destek</span>
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

          {/* Col 4: İletişim */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#172b2b] uppercase tracking-wider font-heading">
              İletişim
            </h4>
            <div className="space-y-2 font-semibold">
              <a
                href="mailto:info@yonetimmerkezi.com.tr"
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 text-slate-700 transition"
              >
                <Mail size={15} className="text-emerald-600 flex-shrink-0" />
                <span className="truncate">info@yonetimmerkezi.com.tr</span>
              </a>
              <Link
                href="/iletisim"
                className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition"
              >
                <ChevronRight size={14} className="text-emerald-700 flex-shrink-0" />
                <span>İletişim &amp; Destek Formu</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-slate-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-4">
            <span>© 2026 Yönetim Merkezi. Tüm Hakları Saklıdır.</span>
            <span>·</span>
            <span className="text-emerald-700 font-bold">KMK Uyumlu Bulut Yönetim</span>
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
            <Link href="/iletisim" className="hover:text-emerald-700">İletişim &amp; Destek</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
