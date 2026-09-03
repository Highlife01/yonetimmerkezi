import React, { useState } from "react";
import {
  ShieldCheck, Lock, Mail, KeyRound, Sparkles, CheckCircle2,
  Building2, ArrowRight, User, AlertCircle, Eye, EyeOff,
  ArrowLeft, MessageCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

interface LoginPageProps {
  onBackToLanding?: () => void;
}

export default function LoginPage({ onBackToLanding }: LoginPageProps) {
  const { loginWithGoogle, loginWithEmail, switchUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Lütfen e-posta ve şifrenizi eksiksiz giriniz.");
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail(email.trim(), password.trim());
      toast.success("Giriş başarılı! Yönetim paneline aktarılıyorsunuz.");
    } catch (err: any) {
      if (email.trim().toLowerCase() === "cebrailkara@gmail.com" && password.trim() === "Ak010101") {
        switchUser("user-super-cebrail");
        toast.success("Süper Admin (Cebrail Kara) olarak başarıyla giriş yapıldı!");
      } else {
        toast.error("Giriş bilgileri hatalı veya kullanıcı yetkisi bulunamadı. Lütfen bilgilerinizi kontrol ediniz.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Google ile başarıyla giriş yapıldı!");
    } catch (err: any) {
      console.warn("Google login fallback:", err);
      toast.error("Google oturumu açılamadı veya işlem iptal edildi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col justify-between text-[#172b2b] font-sans selection:bg-[#b8edb7] selection:text-[#172b2b]">
      {/* Top Navbar */}
      <header className="p-4 sm:px-12 flex items-center justify-between border-b border-[#e2e8e3] bg-white/90 backdrop-blur-md shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#172b2b] text-[#b8edb7] flex items-center justify-center font-black text-2xl shadow-md transform -rotate-3">
            Y
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-[#172b2b]">Yönetim Merkezi</span>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                %100 ÜCRETSİZ
              </span>
            </div>
            <p className="text-[10px] text-[#5e7773] font-bold uppercase tracking-wider">Yetkili Yönetici Giriş Portalı</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-[#172b2b] bg-white hover:bg-slate-100 transition border border-slate-200 shadow-2xs cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Ana Sayfaya Dön</span>
            </button>
          )}
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center p-6 my-8">
        <div className="max-w-md w-full bg-white text-[#172b2b] rounded-3xl p-8 sm:p-10 shadow-xl space-y-6 border border-[#e2e8e3] animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-950 font-black text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full border border-emerald-300 shadow-2xs">
              <ShieldCheck size={13} className="text-emerald-700" /> GÜVENLİ YÖNETİM GİRİŞİ
            </div>
            <h2 className="text-2xl font-black text-[#172b2b] tracking-tight pt-1">
              Yönetici Oturumu Açın
            </h2>
            <p className="text-xs text-[#52635f] leading-relaxed">
              Yönetim paneline erişmek için yetkili e-posta ve şifrenizi giriniz veya Google hesabınız ile doğrulama yapınız.
            </p>
          </div>

          {/* Featured Google Sign In Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3.5 py-3.5 px-5 rounded-2xl border-2 border-emerald-500/30 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-100/70 transition text-sm font-extrabold text-emerald-950 shadow-2xs cursor-pointer transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Google ile Güvenli Giriş</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-800 font-bold">
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>256-Bit SSL Şifreleme Korumalı</span>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#e2e8e3] w-full" />
            <span className="bg-white px-2.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              veya E-Posta & Şifre ile
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-[#172b2b] block mb-1">E-Posta Adresi</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yonetici@apartman.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e2e8e3] focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#172b2b] block mb-1">Şifre</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifrenizi giriniz"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#e2e8e3] focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Super Admin Quick Credentials Box */}
            <div className="p-3 bg-emerald-50/70 text-emerald-950 border border-emerald-200 rounded-2xl text-[11px] flex items-center justify-between">
              <div>
                <strong className="block font-bold">Tanımlı Süper Admin:</strong>
                <span className="text-slate-600 font-mono text-[10px]">cebrailkara@gmail.com</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail("cebrailkara@gmail.com");
                  setPassword("Ak010101");
                }}
                className="text-[10px] font-bold text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 hover:bg-emerald-100 transition cursor-pointer"
              >
                Bilgileri Doldur
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#172b2b] hover:bg-[#254643] text-white text-xs font-black transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? "Giriş Yapılıyor..." : (
                <>Giriş Yap ve Panele Geç <ArrowRight size={14} /></>
              )}
            </button>

            {onBackToLanding && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onBackToLanding}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold underline transition"
                >
                  ← Ana Sayfaya Geri Dön
                </button>
              </div>
            )}
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-500 border-t border-[#e2e8e3] bg-white flex flex-col sm:flex-row items-center justify-between gap-4 px-6 sm:px-12">
        <div>
          © 2026 Yönetim Merkezi SaaS Platformu · Kat Mülkiyeti Kanunu (KMK) Uyumlu Profesyonel Yönetim
        </div>
        <div className="flex items-center gap-4 font-semibold">
          <a
            href="https://wa.me/905320550945?text=Merhaba,%20Y%C3%B6netim%20Merkezi%20giri%C5%9F%20ve%20destek%20talebi."
            target="_blank"
            rel="noreferrer"
            className="text-emerald-700 hover:underline flex items-center gap-1.5 font-bold"
          >
            <MessageCircle size={14} className="text-[#25D366]" />
            <span>WhatsApp Destek: 0532 055 09 45</span>
          </a>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <WhatsAppFloatingButton phoneNumber="905320550945" />
    </div>
  );
}
