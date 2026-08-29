import React, { useState } from "react";
import {
  FileSpreadsheet, Upload, Download, CheckCircle2,
  AlertCircle, X, Plus, Trash2, ArrowRight, Sparkles, Copy
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

interface ExcelBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRow {
  blockName: string;
  unitNumber: string;
  type: "DAIRE" | "DUKKAN" | "OFIS" | "DEPO";
  grossSquareMeters: number;
  landShare: number;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  tenantName?: string;
  tenantPhone?: string;
  initialBalance: number;
}

const SAMPLE_CSV = `Blok;DaireNo;Tip;Metrekare;ArsaPayi;MalikAdi;MalikTelefon;MalikEmail;KiraciAdi;KiraciTelefon;BaslangicBorcu
A Blok;1;DAIRE;120;10;Ahmet Yılmaz;0532 111 22 33;ahmet@gmail.com;;;0
A Blok;2;DAIRE;140;12;Mehmet Kaya;0533 222 33 44;mehmet@gmail.com;Canan Demir;0535 999 88 77;2500
B Blok;3;DAIRE;95;8;Ayşe Çelik;0542 333 44 55;ayse@gmail.com;;;0
B Blok;4;DUKKAN;160;15;Mustafa Koç;0505 444 55 66;mustafa@gmail.com;Ali Vural;0536 777 66 55;5000`;

export default function ExcelBulkImportModal({ isOpen, onClose }: ExcelBulkImportModalProps) {
  const { bulkImportUnitsAndPeople } = useApp();

  const [rawText, setRawText] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const parseInputText = (text: string) => {
    setRawText(text);
    const lines = text.trim().split("\n");
    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    const rows: ParsedRow[] = [];

    lines.forEach((line, idx) => {
      // Skip header line if detected
      if (idx === 0 && (line.toLowerCase().includes("blok") || line.toLowerCase().includes("daire"))) {
        return;
      }

      // Support semicolons, commas, or tabs
      const delimiter = line.includes(";") ? ";" : line.includes("\t") ? "\t" : ",";
      const parts = line.split(delimiter).map((p) => p.trim());

      if (parts.length >= 2 && parts[0]) {
        rows.push({
          blockName: parts[0] || "A Blok",
          unitNumber: parts[1] || String(idx + 1),
          type: (["DAIRE", "DUKKAN", "OFIS", "DEPO"].includes(parts[2]?.toUpperCase())
            ? parts[2].toUpperCase()
            : "DAIRE") as any,
          grossSquareMeters: Number(parts[3]) || 120,
          landShare: Number(parts[4]) || 10,
          ownerName: parts[5] || `Kat Maliki ${parts[0]} D:${parts[1]}`,
          ownerPhone: parts[6] || "0500 000 00 00",
          ownerEmail: parts[7] || "",
          tenantName: parts[8] || undefined,
          tenantPhone: parts[9] || undefined,
          initialBalance: Number(parts[10]) || 0,
        });
      }
    });

    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        parseInputText(content);
        toast.success(`"${file.name}" dosyası okundu ve ${parsedRows.length || "satırlar"} ayrıştırıldı.`);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) {
      toast.error("Lütfen önce Excel/CSV verisi yükleyin veya yapıştırın.");
      return;
    }

    setIsProcessing(true);
    try {
      const count = await bulkImportUnitsAndPeople(parsedRows);
      toast.success(`Tebrikler! ${count} adet daire ve sakin kaydı başarıyla sisteme aktarıldı.`);
      setIsProcessing(false);
      onClose();
    } catch (err: any) {
      setIsProcessing(false);
      toast.error("İçe aktarma sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-[#d2dbd7] space-y-5 animate-in zoom-in-95 duration-150 my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#f0f4f1]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-[#172b2b]">
                Excel / CSV Toplu Daire & Sakin İçe Aktarma
              </h3>
              <p className="text-xs text-[#7c8a87]">
                Excel tablonuzu yapıştırın veya CSV dosyanızı yükleyin; yüzlerce daireyi saniyeler içinde oluşturun.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action bar: Sample template & File Upload */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#f8faf7] rounded-2xl border border-[#e4eae3] text-xs">
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#d2dbd7] hover:border-emerald-500 font-bold text-slate-800 cursor-pointer shadow-xs transition">
              <Upload size={14} className="text-emerald-700" />
              <span>CSV / Metin Dosyası Seç</span>
              <input
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                parseInputText(SAMPLE_CSV);
                toast.success("Örnek Excel verisi yüklendi.");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 font-bold cursor-pointer transition"
            >
              <Sparkles size={14} className="text-emerald-700" /> Örnek Tabloyu Yükle
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(SAMPLE_CSV);
              toast.success("Örnek şablon panoya kopyalandı! Excel'e yapıştırıp doldurabilirsiniz.");
            }}
            className="text-slate-600 hover:text-slate-900 font-bold inline-flex items-center gap-1 cursor-pointer text-[11px]"
          >
            <Copy size={13} /> Şablonu Kopyala
          </button>
        </div>

        {/* Text Area for pasting */}
        <div>
          <label className="font-bold text-[#172b2b] text-xs block mb-1">
            Excel'den Kopyalanan Verileri Buraya Yapıştırın (Noktalı Virgül, Virgül veya Tab ile):
          </label>
          <textarea
            rows={4}
            value={rawText}
            onChange={(e) => parseInputText(e.target.value)}
            placeholder="Blok;DaireNo;Tip;Metrekare;ArsaPayi;MalikAdi;MalikTelefon;MalikEmail;KiraciAdi;KiraciTelefon;BaslangicBorcu..."
            className="w-full p-3 rounded-2xl border border-[#e4eae3] focus:outline-none focus:border-emerald-500 font-mono text-xs bg-slate-50 focus:bg-white resize-none"
          />
        </div>

        {/* Parsed Preview Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#172b2b]">
              Ayrıştırılan Daire & Sakin Kayıtları ({parsedRows.length} Adet)
            </span>
            {parsedRows.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setRawText("");
                  setParsedRows([]);
                }}
                className="text-rose-600 hover:underline inline-flex items-center gap-1 font-bold text-[11px]"
              >
                <Trash2 size={12} /> Temizle
              </button>
            )}
          </div>

          <div className="border border-[#e4eae3] rounded-2xl overflow-hidden max-h-56 overflow-y-auto text-xs shadow-xs">
            <table className="w-full text-left">
              <thead className="bg-[#f8faf7] border-b border-[#e4eae3] text-[#7c8a87] text-[10px] font-black uppercase sticky top-0">
                <tr>
                  <th className="py-2 px-3">Blok / No</th>
                  <th className="py-2 px-3">Tip & m²</th>
                  <th className="py-2 px-3">Kat Maliki</th>
                  <th className="py-2 px-3">Kiracı</th>
                  <th className="py-2 px-3 text-right">Başlangıç Borcu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4f1]">
                {parsedRows.length > 0 ? (
                  parsedRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 font-medium">
                      <td className="py-2 px-3 font-bold text-[#172b2b]">
                        {r.blockName} D:{r.unitNumber}
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {r.type} · {r.grossSquareMeters} m²
                      </td>
                      <td className="py-2 px-3">
                        <strong className="block text-[#172b2b]">{r.ownerName}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{r.ownerPhone}</span>
                      </td>
                      <td className="py-2 px-3">
                        {r.tenantName ? (
                          <>
                            <strong className="block text-emerald-800">{r.tenantName}</strong>
                            <span className="text-[10px] text-slate-400 font-mono">{r.tenantPhone || "-"}</span>
                          </>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-rose-600">
                        {r.initialBalance > 0 ? `₺${r.initialBalance.toLocaleString("tr-TR")}` : "₺0"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                      Henüz veri girilmedi. Yukarıdan örnek tabloyu yükleyebilir veya Excel'den yapıştırabilirsiniz.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-[#f0f4f1] flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Toplam <strong>{parsedRows.length}</strong> daire ve sakin kaydı aktarılmaya hazır.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer text-xs"
            >
              İptal
            </button>

            <button
              type="button"
              disabled={isProcessing || parsedRows.length === 0}
              onClick={handleExecuteImport}
              className="px-6 py-2.5 rounded-xl bg-[#172b2b] hover:bg-[#294342] disabled:opacity-50 text-white font-bold transition shadow-md flex items-center gap-2 cursor-pointer text-xs"
            >
              {isProcessing ? (
                <>Aktarılıyor...</>
              ) : (
                <>
                  <CheckCircle2 size={16} className="text-[#b8edb7]" />
                  {parsedRows.length} Daireyi Sisteme Aktar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
