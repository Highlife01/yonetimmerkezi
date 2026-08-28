import React, { useState } from "react";
import {
  CreditCard, Wallet, Landmark, ArrowRightLeft, Plus,
  Search, Download, CheckCircle2, ArrowDownRight, ArrowUpRight,
  UploadCloud, FileCheck2, AlertCircle, X, ShieldCheck
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { AccountEntity, PaymentMethod } from "@/types";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { exportToCSV } from "@/utils/exportUtils";
import { toast } from "sonner";

export default function CashBankView() {
  const {
    activeSite, activeSiteAccounts, activeSiteAccountTransactions,
    addAccount, transferFunds, addCollection, activeSiteUnits
  } = useApp();
  const { hasPermission } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("ALL");

  // Modals
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isImportBankModalOpen, setIsImportBankModalOpen] = useState(false);

  // New Account state
  const [newAccData, setNewAccData] = useState({
    type: "BANKA" as "BANKA" | "KASA",
    name: "",
    bankName: "",
    iban: "",
    accountNumber: "",
  });

  // Transfer state
  const [transferData, setTransferData] = useState({
    fromAccountId: activeSiteAccounts[0]?.id || "",
    toAccountId: activeSiteAccounts[1]?.id || "",
    amount: 5000,
    description: "Kasa nakit fazlasının banka hesabına yatırılması",
  });

  // Bank reconciliation mock items
  const [bankImportItems, setBankImportItems] = useState([
    { id: "b1", date: "28.08.2026 10:14", desc: "SELIN YILMAZ A BLOK 24 AIDAT", amount: 2500, matchedUnit: "A Blok D:24", status: "MATCHED" },
    { id: "b2", date: "28.08.2026 09:16", desc: "MEHMET KAYA B18 AIDAT EFT", amount: 5000, matchedUnit: "B Blok D:18", status: "MATCHED" },
    { id: "b3", date: "27.08.2026 15:40", desc: "HAVALE - ALI RIZA OZKAN A02", amount: 2500, matchedUnit: "A Blok D:02", status: "PENDING" },
  ]);

  const filteredTransactions = activeSiteAccountTransactions.filter((tx) => {
    if (selectedAccountId !== "ALL" && tx.accountId !== selectedAccountId) return false;
    const q = search.toLocaleLowerCase("tr-TR").trim();
    if (q) {
      const matchText = `${tx.accountName} ${tx.category} ${tx.description} ${tx.relatedEntityName || ""}`.toLocaleLowerCase("tr-TR");
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const totalBankBalance = activeSiteAccounts.filter(a => a.type === "BANKA").reduce((sum, a) => sum + a.balance, 0);
  const totalCashBalance = activeSiteAccounts.filter(a => a.type === "KASA").reduce((sum, a) => sum + a.balance, 0);

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccData.name) {
      toast.error("Lütfen hesap adını giriniz.");
      return;
    }

    addAccount({
      siteId: activeSite.id,
      type: newAccData.type,
      name: newAccData.name,
      bankName: newAccData.type === "BANKA" ? newAccData.bankName : undefined,
      iban: newAccData.type === "BANKA" ? newAccData.iban : undefined,
      accountNumber: newAccData.accountNumber,
      currency: "TRY",
      isActive: true,
    });

    setIsAddAccountModalOpen(false);
    toast.success("Yeni hesap başarıyla tanımlandı.");
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferData.fromAccountId === transferData.toAccountId) {
      toast.error("Kaynak ve hedef hesap aynı olamaz.");
      return;
    }
    if (transferData.amount <= 0) {
      toast.error("Geçerli bir transfer tutarı giriniz.");
      return;
    }

    transferFunds(transferData);
    setIsTransferModalOpen(false);
    toast.success("Hesaplar arası virman işlemi başarıyla gerçekleştirildi.");
  };

  const handleReconcileItem = (itemId: string, unitId: string) => {
    const item = bankImportItems.find(i => i.id === itemId);
    if (!item) return;

    addCollection({
      unitId,
      amount: item.amount,
      paymentMethod: "HAVALE_EFT",
      targetAccountId: activeSiteAccounts.find(a => a.type === "BANKA")?.id || activeSiteAccounts[0].id,
      description: item.desc,
      referenceNo: "BANKA-SYNC",
    });

    setBankImportItems(prev => prev.map(i => i.id === itemId ? { ...i, status: "MATCHED" } : i));
    toast.success("Banka hareketi daire cari hesabına başarıyla işlendi.");
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">Kasa ve Banka Hesapları Yönetimi</h2>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              Siteye ait vadesiz banka hesapları, nakit ofis kasaları, virman transferleri ve banka mutabakatı.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsImportBankModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold hover:bg-blue-100 transition shadow-sm"
            >
              <UploadCloud size={14} /> Banka Ekstresi İçe Aktar
            </button>
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition shadow-sm"
            >
              <ArrowRightLeft size={14} /> Hesaplar Arası Virman
            </button>
            <button
              onClick={() => setIsAddAccountModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#172b2b] text-white text-xs font-bold hover:bg-[#294342] transition shadow-sm"
            >
              <Plus size={15} /> Yeni Hesap Tanımla
            </button>
          </div>
        </div>

        {/* Total Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 border-t border-[#f0f4f1]">
          <div className="bg-gradient-to-br from-[#172b2b] to-[#2a4645] text-white p-4.5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#b8edb7]">TOPLAM NAKİT MEVCUDU</span>
              <h4 className="text-2xl font-extrabold mt-1">{formatCurrency(totalBankBalance + totalCashBalance)}</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">Tüm banka ve kasalar toplamı</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
              <Landmark size={22} className="text-[#b8edb7]" />
            </div>
          </div>

          <div className="bg-white border border-[#e4eae3] p-4.5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7c8a87]">BANKALAR BAKİYESİ</span>
              <h4 className="text-2xl font-bold text-[#172b2b] mt-1">{formatCurrency(totalBankBalance)}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{activeSiteAccounts.filter(a => a.type === "BANKA").length} aktif banka hesabı</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <CreditCard size={22} />
            </div>
          </div>

          <div className="bg-white border border-[#e4eae3] p-4.5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7c8a87]">KASA BAKİYESİ (OFİS)</span>
              <h4 className="text-2xl font-bold text-[#172b2b] mt-1">{formatCurrency(totalCashBalance)}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{activeSiteAccounts.filter(a => a.type === "KASA").length} nakit ofis kasası</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wallet size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeSiteAccounts.map((acc) => (
          <div
            key={acc.id}
            className="bg-white border border-[#e4eae3] rounded-2xl p-5 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    acc.type === "BANKA" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
                  }`}>
                    {acc.type === "BANKA" ? <Landmark size={20} /> : <Wallet size={20} />}
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-[#172b2b] block">{acc.name}</strong>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {acc.type === "BANKA" ? "Banka Vadesiz" : "Nakit Kasa"}
                    </span>
                  </div>
                </div>
              </div>

              {acc.type === "BANKA" && (
                <div className="mt-4 pt-3 border-t border-[#f0f4f1] text-xs space-y-1">
                  <div className="text-slate-500 font-mono text-[11px] select-all bg-slate-50 p-2 rounded-lg break-all">
                    {acc.iban || "IBAN tanımlanmamış"}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-[#f0f4f1] flex items-baseline justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase">GÜNCEL BAKİYE</span>
              <strong className="text-xl font-extrabold text-[#172b2b]">{formatCurrency(acc.balance)}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Account Transactions History */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#172b2b]">Hesap Hareketleri Dökümü</h3>
            <p className="text-xs text-[#7c8a87]">Kasalar ve banka hesapları üzerinden gerçekleşen tüm giriş/çıkış hareketleri.</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#e4eae3] text-xs focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="ALL">Tüm Hesaplar</option>
              {activeSiteAccounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border border-[#e4eae3] rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] text-[10px] font-bold uppercase">
              <tr>
                <th className="py-2.5 px-3">Tarih & Saat</th>
                <th className="py-2.5 px-3">Hesap</th>
                <th className="py-2.5 px-3">İşlem Türü</th>
                <th className="py-2.5 px-3">Açıklama</th>
                <th className="py-2.5 px-3 text-right">Tutar</th>
                <th className="py-2.5 px-3 text-right">Bakiye Sonrası</th>
                <th className="py-2.5 px-3">İşlemi Yapan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4f1]">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{tx.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#172b2b]">{tx.accountName}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tx.type.includes("GIRIS") ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                      }`}>
                        {tx.type === "GIRIS" ? "Para Girişi" :
                         tx.type === "CIKIS" ? "Para Çıkışı" :
                         tx.type === "VIRMAN_GIRIS" ? "Virman Giriş" : "Virman Çıkış"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {tx.description}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold ${
                      tx.type.includes("GIRIS") ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {tx.type.includes("GIRIS") ? "+" : "−"} {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#172b2b]">
                      {formatCurrency(tx.balanceAfter)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">{tx.createdBy}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Hesap hareketi bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TRANSFER / VIRMAN MODAL */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ArrowRightLeft size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172b2b]">Hesaplar Arası Virman (Transfer)</h3>
                  <p className="text-xs text-[#7c8a87]">Kasa ve bankalar arasında bakiye transferi yapın.</p>
                </div>
              </div>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Kaynak Hesap (Çıkış Yapılacak) *</label>
                <select
                  required
                  value={transferData.fromAccountId}
                  onChange={(e) => setTransferData({ ...transferData, fromAccountId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                >
                  {activeSiteAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Hedef Hesap (Giriş Yapılacak) *</label>
                <select
                  required
                  value={transferData.toAccountId}
                  onChange={(e) => setTransferData({ ...transferData, toAccountId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                >
                  {activeSiteAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Transfer Tutarı (TL) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#e4eae3] font-bold text-base text-[#172b2b] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Açıklama</label>
                <input
                  type="text"
                  required
                  value={transferData.description}
                  onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-[#e4eae3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition shadow-sm"
                >
                  Transferi Gerçekleştir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW ACCOUNT MODAL */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#172b2b]">Yeni Kasa / Banka Hesabı Tanımla</h3>
              </div>
              <button onClick={() => setIsAddAccountModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Hesap Türü</label>
                <select
                  value={newAccData.type}
                  onChange={(e) => setNewAccData({ ...newAccData, type: e.target.value as "BANKA" | "KASA" })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="BANKA">Banka Hesabı</option>
                  <option value="KASA">Nakit Kasa</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#172b2b] block mb-1">Hesap Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Garanti Aidat Hesabı, Demirbaş Kasası..."
                  value={newAccData.name}
                  onChange={(e) => setNewAccData({ ...newAccData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                />
              </div>

              {newAccData.type === "BANKA" && (
                <>
                  <div>
                    <label className="font-bold text-[#172b2b] block mb-1">Banka Adı</label>
                    <input
                      type="text"
                      placeholder="Örn: Garanti BBVA, Ziraat Bankası..."
                      value={newAccData.bankName}
                      onChange={(e) => setNewAccData({ ...newAccData, bankName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#172b2b] block mb-1">IBAN Numarası</label>
                    <input
                      type="text"
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                      value={newAccData.iban}
                      onChange={(e) => setNewAccData({ ...newAccData, iban: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-[#e4eae3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#172b2b] text-white font-bold hover:bg-[#294342] transition shadow-sm"
                >
                  Hesabı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BANK RECONCILIATION MODAL */}
      {isImportBankModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4eae3]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <UploadCloud size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172b2b]">Banka Ekstresi İçe Aktarma & Otomatik Eşleştirme</h3>
                  <p className="text-xs text-[#7c8a87]">Banka hareketlerini daire hesaplarıyla otomatik eşleştirin.</p>
                </div>
              </div>
              <button onClick={() => setIsImportBankModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="border border-dashed border-emerald-300 bg-emerald-50/50 p-5 rounded-2xl text-center">
              <UploadCloud size={30} className="mx-auto text-emerald-600 mb-2" />
              <p className="text-xs font-bold text-[#172b2b]">Garanti BBVA / Ziraat Bankası Excel veya MT940 dosyasını buraya sürükleyin</p>
              <span className="text-[11px] text-slate-500 mt-1 block">Açıklama alanında geçen daire ve sakin bilgileri otomatik tespit edilir.</span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#172b2b]">İçe Aktarılan Son Hareketler</h4>
              <div className="border border-[#e4eae3] rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] text-[10px] font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Tarih</th>
                      <th className="py-2.5 px-3">Açıklama</th>
                      <th className="py-2.5 px-3 text-right">Tutar</th>
                      <th className="py-2.5 px-3">Eşleşen Daire</th>
                      <th className="py-2.5 px-3 text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f4f1]">
                    {bankImportItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{item.date}</td>
                        <td className="py-2.5 px-3 font-medium text-[#172b2b]">{item.desc}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700">+{formatCurrency(item.amount)}</td>
                        <td className="py-2.5 px-3 font-bold text-[#172b2b]">{item.matchedUnit}</td>
                        <td className="py-2.5 px-3 text-center">
                          {item.status === "MATCHED" ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 size={11} /> Eşleşti
                            </span>
                          ) : (
                            <button
                              onClick={() => handleReconcileItem(item.id, "unit-2")}
                              className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md transition"
                            >
                              Tahsilat Olarak İşle
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e4eae3] flex justify-end">
              <button
                onClick={() => setIsImportBankModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
