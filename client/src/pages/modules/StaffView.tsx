import React, { useState } from "react";
import {
  Users, Plus, Phone, CalendarDays, CheckCircle2,
  Clock, Shield, DollarSign, Download, X
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { StaffMember } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { exportToCSV } from "@/utils/exportUtils";
import { toast } from "sonner";

export default function StaffView() {
  const { activeSite, activeSiteStaff } = useApp();
  const { hasPermission } = useAuth();

  const handleExportCSV = () => {
    const headers = ["Ad Soyad", "Görev / Ünvan", "Telefon", "Vardiya Saatleri", "Aylık Maaş", "Başlangıç Tarihi", "Durum"];
    const rows = activeSiteStaff.map(s => [
      s.fullName, s.roleTitle, s.phone, s.shiftHours, s.salary, s.startDate, s.status
    ]);
    exportToCSV(`${activeSite.name}_Personel_Listesi`, headers, rows);
    toast.success("Personel listesi Excel (CSV) olarak indirildi.");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-[#e4eae3] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#172b2b] tracking-tight">Personel ve Vardiya Yönetimi</h2>
            <p className="text-xs text-[#7c8a87] mt-0.5">
              Güvenlik, temizlik, teknik ve kapıcı personeli listesi, vardiya saatleri ve maaş bilgileri.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#e4eae3] text-[#294342] text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
            >
              <Download size={14} /> Excel'e Aktar
            </button>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeSiteStaff.map((staff) => (
          <div
            key={staff.id}
            className="bg-white border border-[#e4eae3] rounded-2xl p-5 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#edf3eb] text-[#294342] font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {staff.fullName.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <strong className="text-sm font-bold text-[#172b2b] block">{staff.fullName}</strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 inline-block mt-0.5">
                    {staff.roleTitle}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f0f4f1] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone size={13} className="text-[#87928e]" />
                  <span className="font-semibold">{staff.phone}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Clock size={13} className="text-[#87928e]" />
                  <span>{staff.shiftHours}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <CalendarDays size={13} className="text-[#87928e]" />
                  <span>İşe Giriş: {formatDate(staff.startDate)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#f0f4f1] flex items-center justify-between text-xs">
              <span className="text-slate-400">Net Maaş:</span>
              <strong className="text-sm font-extrabold text-[#172b2b]">{formatCurrency(staff.salary)}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
