import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Building2, MessageCircle, LogIn, LayoutDashboard,
  Zap, ArrowRight, Menu, X, Sparkles, PhoneCall, ShieldCheck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function PublicNavbar() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/ozellikler", label: "Özellikler" },
    { href: "/kmk-mevzuat-rehberi", label: "KMK Rehberi", badge: "Mevzuat" },
    { href: "/tasarruf-hesapla", label: "Tasarruf Hesapla" },
    { href: "/turkiye-geneli-hizmet", label: "81 İl GEO Ağı", badge: "Türkiye" },
    { href: "/sss", label: "S.S.S." },
    { href: "/iletisim", label: "İletişim" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/92 backdrop-blur-xl border-b border-[#e4eae3] px-4 sm:px-8 lg:px-12 py-3.5 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3.5 group cursor-pointer">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#172b2b] to-[#284947] text-[#b8edb7] flex items-center justify-center font-black text-2xl shadow-md transform -rotate-3 transition group-hover:rotate-0">
              Y
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-[#172b2b] flex items-center gap-1 font-heading">
                Yönetim<span className="text-emerald-700">Merkezi</span>
              </span>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-2xs font-mono">
                %100 ÜCRETSİZ
              </span>
            </div>
            <p className="text-[10px] text-[#5e7773] font-bold tracking-wide">
              Bulut Tabanlı Apartman &amp; Site Platformu
            </p>
          </div>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden xl:flex items-center gap-6 text-xs font-bold text-[#445b57]">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-1.5 px-2.5 rounded-xl transition-all relative flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? "text-[#172b2b] bg-emerald-50/90 font-black shadow-2xs border border-emerald-200/80"
                    : "hover:text-emerald-800 hover:bg-slate-50"
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-emerald-100/90 text-emerald-800 border border-emerald-300/80">
                    {item.badge}
                  </span>
                )}
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* WhatsApp Direct Line */}
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
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#172b2b] hover:bg-[#254643] text-white text-xs font-black shadow-md transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <LayoutDashboard size={15} className="text-[#b8edb7]" />
              <span>Yönetim Paneline Geç</span>
              <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <Link
                href="/giris"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#2d4744] hover:text-[#172b2b] hover:bg-slate-100 transition cursor-pointer border border-[#d6e0d8]"
              >
                <LogIn size={14} />
                <span>Giriş Yap</span>
              </Link>
              <Link
                href="/giris"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#172b2b] via-[#213f3d] to-[#172b2b] hover:from-[#213f3d] hover:to-[#2e5754] text-white text-xs font-black shadow-md transition transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Zap size={14} className="fill-[#b8edb7] text-[#b8edb7]" />
                <span>Ücretsiz Başla</span>
                <ArrowRight size={14} />
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-[#172b2b] hover:bg-slate-100 border border-slate-200 transition"
            aria-label="Menüyü Aç/Kapat"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden mt-3 pt-3 border-t border-slate-200/80 space-y-1 bg-white/95 backdrop-blur-xl rounded-2xl p-3 shadow-xl">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition ${
                  active
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200 font-extrabold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <a
              href="https://wa.me/905320550945?text=Merhaba,%20Y%C3%B6netim%20Merkezi%20hakk%C4%B1nda%20bilgi%20ve%20destek%20almak%20istiyorum."
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold"
            >
              <MessageCircle size={15} />
              <span>WhatsApp: 0532 055 09 45</span>
            </a>
            {!isAuthenticated && (
              <Link
                href="/giris"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#172b2b] text-white text-xs font-bold"
              >
                <LogIn size={15} />
                <span>Giriş Yap / Kayıt Ol</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
