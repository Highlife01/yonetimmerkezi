import React, { useState } from "react";
import { Link } from "wouter";
import {
  MapPin, Globe, Building2, ShieldCheck, CheckCircle2,
  ArrowRight, Search, Sparkles, Zap, PhoneCall, MessageCircle
} from "lucide-react";
import SeoHead from "@/components/SeoHead";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

export default function GeoCoveragePage() {
  const [searchTerm, setSearchTerm] = useState("");

  const regions = [
    {
      name: "Marmara Bölgesi",
      cities: [
        { name: "İstanbul", districts: "Kadıköy, Beşiktaş, Ataşehir, Ümraniye, Şişli, Bakırköy, Beylikdüzü, Başakşehir, Pendik, Kartal, Maltepe, Sarıyer" },
        { name: "Bursa", districts: "Nilüfer, Osmangazi, Yıldırım, Mudanya, Gemlik, İnegöl" },
        { name: "Kocaeli", districts: "İzmit, Gebze, Darıca, Gölcük, Derince, Körfez, Çayırova" },
        { name: "Balıkesir", districts: "Karesi, Altıeylül, Bandırma, Edremit, Ayvalık" },
        { name: "Tekirdağ", districts: "Süleymanpaşa, Çorlu, Çerkezköy, Kapaklı" },
        { name: "Sakarya", districts: "Adapazarı, Serdivan, Erenler, Hendek" },
        { name: "Çanakkale", districts: "Merkez, Biga, Çan, Gelibolu" },
        { name: "Edirne", districts: "Merkez, Keşan, Uzunköprü" },
        { name: "Kırklareli", districts: "Merkez, Lüleburgaz, Babaeski" },
        { name: "Yalova", districts: "Merkez, Çiftlikköy, Çınarcık" },
        { name: "Bilecik", districts: "Merkez, Bozüyük" }
      ]
    },
    {
      name: "İç Anadolu Bölgesi",
      cities: [
        { name: "Ankara", districts: "Çankaya, Keçiören, Yenimahalle, Mamak, Etimesgut, Sincan, Gölbaşı, Altındağ, Pursaklar" },
        { name: "Konya", districts: "Selçuklu, Meram, Karatay, Ereğli, Akşehir" },
        { name: "Kayseri", districts: "Melikgazi, Kocasinan, Talas" },
        { name: "Eskişehir", districts: "Odunpazarı, Tepebaşı" },
        { name: "Sivas", districts: "Merkez, Şarkışla" },
        { name: "Kırıkkale", districts: "Merkez, Yahşihan" },
        { name: "Aksaray", districts: "Merkez" },
        { name: "Karaman", districts: "Merkez" },
        { name: "Kırşehir", districts: "Merkez" },
        { name: "Nevşehir", districts: "Merkez, Ürgüp" },
        { name: "Niğde", districts: "Merkez" },
        { name: "Yozgat", districts: "Merkez, Sorgun" },
        { name: "Çankırı", districts: "Merkez" }
      ]
    },
    {
      name: "Ege Bölgesi",
      cities: [
        { name: "İzmir", districts: "Karşıyaka, Bornova, Konak, Buca, Çiğli, Balçova, Narlıdere, Gaziemir, Bayraklı, Karabağlar, Menemen, Torbalı" },
        { name: "Denizli", districts: "Pamukkale, Merkezefendi" },
        { name: "Manisa", districts: "Yunusemre, Şehzadeler, Turgutlu, Salihli, Akhisar" },
        { name: "Aydın", districts: "Efeler, Kuşadası, Didim, Nazilli, Söke" },
        { name: "Muğla", districts: "Bodrum, Fethiye, Marmaris, Menteşe, Milas" },
        { name: "Afyonkarahisar", districts: "Merkez, Sandıklı" },
        { name: "Kütahya", districts: "Merkez, Tavşanlı" },
        { name: "Uşak", districts: "Merkez" }
      ]
    },
    {
      name: "Akdeniz Bölgesi",
      cities: [
        { name: "Antalya", districts: "Muratpaşa, Konyaaltı, Kepez, Alanya, Manavgat, Serik, Kemer, Döşemealtı" },
        { name: "Adana", districts: "Seyhan, Çukurova, Yüreğir, Sarıçam, Ceyhan" },
        { name: "Mersin", districts: "Yenişehir, Mezitli, Toroslar, Akdeniz, Tarsus, Erdemli" },
        { name: "Hatay", districts: "Antakya, İskenderun, Defne, Dörtyol" },
        { name: "Kahramanmaraş", districts: "Onikişubat, Dulkadiroğlu, Elbistan" },
        { name: "Osmaniye", districts: "Merkez, Kadirli" },
        { name: "Isparta", districts: "Merkez" },
        { name: "Burdur", districts: "Merkez, Bucak" }
      ]
    },
    {
      name: "Karadeniz Bölgesi",
      cities: [
        { name: "Samsun", districts: "Atakum, İlkadım, Canik, Bafra, Çarşamba" },
        { name: "Trabzon", districts: "Ortahisar, Akçaabat, Yomra" },
        { name: "Ordu", districts: "Altınordu, Ünye, Fatsa" },
        { name: "Çorum", districts: "Merkez, Sungurlu" },
        { name: "Zonguldak", districts: "Merkez, Kdz. Ereğli" },
        { name: "Giresun", districts: "Merkez, Bulancak" },
        { name: "Rize", districts: "Merkez, Çayeli" },
        { name: "Düzce", districts: "Merkez, Akçakoca" },
        { name: "Kastamonu", districts: "Merkez, Tosya" },
        { name: "Tokat", districts: "Merkez, Erbaa, Turhal" },
        { name: "Bolu", districts: "Merkez, Gerede" },
        { name: "Amasya", districts: "Merkez, Merzifon" },
        { name: "Karabük", districts: "Merkez, Safranbolu" },
        { name: "Sinop", districts: "Merkez, Boyabat" },
        { name: "Bartın", districts: "Merkez" },
        { name: "Artvin", districts: "Merkez, Hopa" },
        { name: "Gümüşhane", districts: "Merkez" },
        { name: "Bayburt", districts: "Merkez" }
      ]
    },
    {
      name: "Güneydoğu Anadolu Bölgesi",
      cities: [
        { name: "Gaziantep", districts: "Şahinbey, Şehitkamil, Nizip" },
        { name: "Diyarbakır", districts: "Kayapınar, Bağlar, Yenişehir, Sur" },
        { name: "Şanlıurfa", districts: "Haliliye, Eyyübiye, Karaköprü, Siverek" },
        { name: "Batman", districts: "Merkez" },
        { name: "Mardin", districts: "Artuklu, Kızıltepe, Midyat" },
        { name: "Adıyaman", districts: "Merkez, Kahta" },
        { name: "Siirt", districts: "Merkez" },
        { name: "Şırnak", districts: "Merkez, Cizre, Silopi" },
        { name: "Kilis", districts: "Merkez" }
      ]
    },
    {
      name: "Doğu Anadolu Bölgesi",
      cities: [
        { name: "Malatya", districts: "Battalgazi, Yeşilyurt" },
        { name: "Erzurum", districts: "Yakutiye, Palandöken, Aziziye" },
        { name: "Van", districts: "İpekyolu, Tuşba, Edremit" },
        { name: "Elazığ", districts: "Merkez" },
        { name: "Erzincan", districts: "Merkez" },
        { name: "Kars", districts: "Merkez" },
        { name: "Ağrı", districts: "Merkez, Doğubayazıt" },
        { name: "Muş", districts: "Merkez" },
        { name: "Bitlis", districts: "Merkez, Tatvan" },
        { name: "Bingöl", districts: "Merkez" },
        { name: "Hakkari", districts: "Merkez, Yüksekova" },
        { name: "Iğdır", districts: "Merkez" },
        { name: "Ardahan", districts: "Merkez" },
        { name: "Tunceli", districts: "Merkez" }
      ]
    }
  ];

  const filteredRegions = regions.map(reg => ({
    ...reg,
    cities: reg.cities.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.districts.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(reg => reg.cities.length > 0);

  return (
    <div className="min-h-screen bg-[#f8faf8] text-[#172b2b] font-sans antialiased selection:bg-[#b8edb7] selection:text-[#172b2b]">
      <SeoHead
        title="Türkiye Geneli 81 İl Apartman & Site Yönetimi Hizmet Ağı"
        description="İstanbul, Ankara, İzmir, Bursa, Antalya ve 81 ilde apartman ve site yönetimleri için %100 ücretsiz, KMK uyumlu bulut platformu. Tüm Türkiye'de kesintisiz erişim."
        canonicalPath="/turkiye-geneli-hizmet"
        keywords="istanbul apartman yönetimi, ankara site yönetim programı, izmir bina aidat sistemi, bursa apartman yönetimi, antalya site programı, türkiye geneli apartman yazılımı, 81 il bina yönetimi"
      />

      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-white to-[#f4f7f4] border-b border-[#e2eae3]">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black uppercase tracking-wider font-mono shadow-2xs">
            <Globe size={14} className="text-emerald-700" />
            TÜRKİYE'NİN 81 İLİNDE KESİNTİSİZ HİZMET
          </span>

          <h1 className="text-3xl sm:text-5xl font-black text-[#172b2b] tracking-tight font-heading leading-tight">
            Edirne'den Kars'a <span className="text-emerald-700">Tüm Türkiye'de</span> Binlerce Apartmanda.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
            Yönetim Merkezi bulut tabanlı mimarisiyle hiçbir kurulum, sunucu veya teknik cihaz gerektirmez. İstanbul'dan Van'a, Antalya'dan Trabzon'a kadar nerede olursanız olun sitenizi cep telefonunuzdan yönetin.
          </p>

          {/* Quick Search */}
          <div className="max-w-md mx-auto pt-4 relative">
            <Search size={16} className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="İl veya ilçe ara (örn: Kadıköy, Çankaya, Karşıyaka...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Regions & Cities Grid */}
      <section className="py-14 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {filteredRegions.map((reg, idx) => (
            <div key={idx} className="space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                  <MapPin size={16} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#172b2b] font-heading">
                    {reg.name}
                  </h2>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {reg.cities.length} İl ve Bağlı İlçeler
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {reg.cities.map((city, cIdx) => (
                  <div
                    key={cIdx}
                    className="bg-white rounded-2xl p-5 border border-[#e2eae3] hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-[#172b2b] group-hover:text-emerald-800 font-heading">
                        {city.name} Apartman Yönetimi
                      </h3>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Aktif
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-2">
                      <strong className="text-slate-700">Öne Çıkan İlçeler:</strong> {city.districts}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        KMK %100 Uyumlu
                      </span>
                      <Link
                        href="/giris"
                        className="text-slate-600 hover:text-emerald-800 font-bold inline-flex items-center gap-1"
                      >
                        <span>Hemen Başla</span>
                        <ArrowRight size={11} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Geo CTA */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 bg-white border-t border-[#e2eae3]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-100 to-teal-100 text-emerald-800 shadow-sm mx-auto">
            <Building2 size={26} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-heading text-[#172b2b]">
            Şehrinizdeki Apartmanı Hemen Yönetim Merkezi'ne Taşıyın.
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto">
            İster 8 daireli bir aile apartmanı, ister yüzlerce konutluk lüks bir rezidans yönetin; Yönetim Merkezi her şehirde yanınızda.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/giris"
              className="px-8 py-3.5 rounded-2xl bg-[#172b2b] hover:bg-[#234441] text-white text-xs font-black shadow-lg transition flex items-center gap-2 cursor-pointer font-heading"
            >
              <Zap size={15} className="fill-[#b8edb7] text-[#b8edb7]" />
              <span>Ücretsiz Başla</span>
            </Link>

            <a
              href="https://wa.me/905320550945?text=Merhaba,%20%C5%9Fehrimizdeki%20apartman%C4%B1m%C4%B1z%20i%C3%A7in%20bilgi%20almak%20istiyorum."
              target="_blank"
              rel="noreferrer"
              className="px-8 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20be5b] text-white text-xs font-black shadow-lg transition flex items-center gap-2 font-heading"
            >
              <MessageCircle size={15} />
              <span>Bölge Temsilcimizle Görüşün: 0532 055 09 45</span>
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
      <WhatsAppFloatingButton phoneNumber="905320550945" />
    </div>
  );
}
