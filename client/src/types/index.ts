// =============================================================================
// YÖNETİM MERKEZİ - SAAS APARTMAN & SİTE YÖNETİM SİSTEMİ TİP TANIMLARI
// =============================================================================

export type UserRole =
  | "SUPER_ADMIN"        // Sistem Yöneticisi
  | "MGMT_COMPANY"       // Yönetim Şirketi
  | "SITE_MANAGER"       // Site Yöneticisi
  | "ACCOUNTANT"         // Muhasebe Sorumlusu
  | "ASSISTANT_MANAGER"  // Yönetici Yardımcısı
  | "AUDITOR"            // Denetçi (Kat Malikleri Denetim Kurulu)
  | "SECURITY"           // Güvenlik Görevlisi
  | "MAINTENANCE"        // Teknik / Hizmet Personeli
  | "OWNER"              // Kat Maliki
  | "TENANT";            // Kiracı

export type AppModule =
  | "DASHBOARD"
  | "UNITS"
  | "RESIDENTS"
  | "DUES_TAHAKKUK"
  | "COLLECTIONS"
  | "DEBTORS_AGING"
  | "INCOME_EXPENSE"
  | "CASH_BANK"
  | "VENDORS"
  | "BUDGET"
  | "REPORTS"
  | "REQUESTS"
  | "ANNOUNCEMENTS"
  | "MAINTENANCE"
  | "STAFF"
  | "SECURITY"
  | "METERS"
  | "MEETINGS_POLLS"
  | "AUDIT_SETTINGS"
  | "RESIDENT_PORTAL";

export interface RoleDefinition {
  id: UserRole;
  name: string;
  badgeColor: string;
  description: string;
  allowedModules: string[];
  permissions: {
    canCreateTahakkuk: boolean;
    canCollectPayments: boolean;
    canManageExpenses: boolean;
    canViewAllFinancials: boolean;
    canViewAuditLogs: boolean;
    canManageResidents: boolean;
    canManageRequests: boolean;
    canManageSecurityGate: boolean;
    canExportReports: boolean;
    canChangeSettings: boolean;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarText: string;
  avatarTone: "mint" | "blue" | "coral" | "gold" | "lavender" | "cream";
  companyName?: string;
  managedSiteIds: string[];
  residentUnitId?: string; // If owner/tenant
  activeSiteId: string;
}

// -----------------------------------------------------------------------------
// SİTE, BLOK & BAĞIMSIZ BÖLÜM (DAİRE / İŞYERİ)
// -----------------------------------------------------------------------------

export interface ManagementCompany {
  id: string;
  name: string;
  taxNumber: string;
  taxOffice: string;
  phone: string;
  email: string;
  address: string;
}

export interface Site {
  id: string;
  companyId: string;
  name: string;
  type: "SITE" | "APARTMAN" | "REZIDANS" | "IS_MERKEZI";
  address: string;
  city: string;
  district: string;
  totalBlocks: number;
  totalUnits: number;
  managerName: string;
  managerPhone: string;
  bankIban: string;
  bankName: string;
  monthlyDuesDueDay: number; // e.g. 10 (10th of every month)
  lateInterestRatePerMonth: number; // e.g. 5 (%)
  createdAt: string;
  isVerified?: boolean;
  verificationDate?: string;
  verificationCode?: string;
  decisionBookNo?: string;
  decisionDate?: string;
  taxNumber?: string;
  whatsappGroupUrl?: string;
  autoDuesEnabled?: boolean;
}

export interface Block {
  id: string;
  siteId: string;
  name: string; // e.g. "A Blok", "B Blok"
  floorsCount: number;
  unitsCount: number;
}

export type UnitType = "1+1" | "2+1" | "3+1" | "4+1" | "5+1" | "Dubleks" | "Villa" | "Dükkan" | "Ofis";

export interface Unit {
  id: string;
  siteId: string;
  blockId: string;
  blockName: string;
  unitNumber: string; // "1", "18", "D-4"
  floor: number;
  type: UnitType;
  grossSquareMeters: number;
  shareOfLand: number; // Arsa Payı (Örn: 12 / 240)
  ownerId: string;
  tenantId?: string;
  residentType: "MALIK_OTURUYOR" | "KIRACI_OTURUYOR" | "BOS";
  residentCount: number;
  vehiclePlates: string[];
  parkingLotNumber?: string;
  currentBalance: number; // Pozitif: Borç, Negatif: Fazla Ödeme / Avans
  notes?: string;
}

// -----------------------------------------------------------------------------
// MALİK & KİRACI
// -----------------------------------------------------------------------------

export interface Person {
  id: string;
  siteId: string;
  type: "MALIK" | "KIRACI";
  fullName: string;
  tcOrTaxNo: string;
  phone: string;
  email: string;
  emergencyPhone?: string;
  ownedUnitIds: string[]; // 1 malik birden fazla daireye sahip olabilir
  rentedUnitId?: string;
  occupantCount?: number;
  isActive: boolean;
  notes?: string;
}

export interface TenancyHistory {
  id: string;
  unitId: string;
  personId: string;
  personName: string;
  personType: "MALIK" | "KIRACI";
  startDate: string;
  endDate?: string;
  startingBalance: number;
  closingBalance?: number;
  reason?: string;
}

// -----------------------------------------------------------------------------
// AİDAT & TAHAKKUK (BORÇLANDIRMA)
// -----------------------------------------------------------------------------

export type DistributionMethod = 
  | "EQUAL"       // Eşit Dağıtım
  | "SQM"         // m²'ye Göre Dağıtım
  | "LAND_SHARE"  // Arsa Payına Göre Dağıtım
  | "UNIT_TYPE"   // Daire Tipine Göre Dağıtım
  | "CUSTOM";     // Daire Bazında Özel Tutar

export type DuesCategory = 
  | "AIDAT"             // Aylık İşletme Aidatı
  | "YAKIT"             // Merkezi Isınma / Yakıt
  | "ORTAK_ELEKTRIK"    // Ortak Alan Elektrik
  | "ORTAK_SU"          // Ortak Alan Su
  | "DEMIRBAS"          // Demirbaş / Yatırım Bütçesi
  | "BAKIM_ONARIM"      // Asansör/Çatı vb. Ek Bakım
  | "EK_BUTCE";         // Ek İşletme Bütçesi

export interface TahakkukRecord {
  id: string;
  siteId: string;
  title: string; // Örn: "Eylül 2026 Aidatı", "Kış Sezonu Doğalgaz Avansı"
  period: string; // "2026-09"
  category: DuesCategory;
  dueDate: string; // "2026-09-10"
  distributionMethod: DistributionMethod;
  totalTargetAmount: number;
  totalCollectedAmount: number;
  unitCount: number;
  status: "ACTIVE" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  createdBy: string;
  allocations: {
    unitId: string;
    unitName: string;
    personId: string;
    personName: string;
    amount: number;
    paidAmount: number;
    isPaid: boolean;
  }[];
}

// -----------------------------------------------------------------------------
// DAİRE CARİ HAREKETLERİ & EKSTRE
// -----------------------------------------------------------------------------

export interface UnitAccountLedgerItem {
  id: string;
  siteId: string;
  unitId: string;
  date: string;
  type: "BORC" | "ALACAK";
  category: string;
  description: string;
  debtAmount: number;     // Borç
  creditAmount: number;   // Alacak
  balanceAfter: number;   // İşlem Sonrası Bakiye
  referenceId?: string;   // Tahakkuk ID veya Tahsilat ID
  receiptNo?: string;
  processedBy: string;
}

// -----------------------------------------------------------------------------
// TAHSİLAT & MAKBUZ
// -----------------------------------------------------------------------------

export type PaymentMethod = "NAKIT" | "HAVALE_EFT" | "KREDI_KARTI" | "ONLINE_POS";

export interface Collection {
  id: string;
  siteId: string;
  receiptNumber: string; // "MKB-2026-00412"
  unitId: string;
  unitName: string;
  personId: string;
  personName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  targetAccountId: string; // Kasa veya Banka ID
  targetAccountName: string;
  category: string;
  description: string;
  referenceNo?: string; // Banka Dekont No / Pos Onay No
  settledTahakkukId?: string; // Mahsup edilen tahakkuk
  printedCount: number;
  createdAt: string;
  createdBy: string;
}

// -----------------------------------------------------------------------------
// KASA & BANKA YÖNETİMİ
// -----------------------------------------------------------------------------

export interface AccountEntity {
  id: string;
  siteId: string;
  type: "KASA" | "BANKA";
  name: string; // "Ana Yönetim Kasası", "Garanti BBVA Vadesiz"
  bankName?: string;
  iban?: string;
  accountNumber?: string;
  balance: number;
  currency: "TRY";
  isActive: boolean;
}

export interface AccountTransaction {
  id: string;
  siteId: string;
  accountId: string;
  accountName: string;
  date: string;
  type: "GIRIS" | "CIKIS" | "VIRMAN_GIRIS" | "VIRMAN_CIKIS";
  amount: number;
  category: string;
  description: string;
  relatedEntityName?: string; // Daire, Tedarikçi vb.
  balanceAfter: number;
  createdBy: string;
}

// -----------------------------------------------------------------------------
// GELİR & GİDER YÖNETİMİ
// -----------------------------------------------------------------------------

export type ExpenseCategory =
  | "PERSONEL"        // Personel Maaş, SGK, Kıdem
  | "ELEKTRIK"         // Ortak Alan Elektrik Faturası
  | "SU"               // Ortak Alan Su Faturası
  | "DOGALGAZ"        // Merkezi Isınma / Doğalgaz
  | "TEMIZLIK"        // Temizlik Malzemesi ve Hizmeti
  | "GUVENLIK"        // Güvenlik Hizmet Bedeli
  | "ASANSOR"         // Asansör Periyodik Bakım ve Revizyon
  | "JENERATOR"       // Jeneratör Yakıt ve Bakım
  | "HAVUZ"           // Havuz Kimyasalı ve Bakımı
  | "PEYZAJ"          // Bahçe, Çim, Sulama
  | "BAKIM_ONARIM"    // Genel Tesisat, Çatı, Aydınlatma
  | "SIGORTA"         // Ortak Alan Bina Sigortası
  | "YONETIM"         // Yönetim Şirketi / Büro Gideri
  | "HUKUK_NOTER"     // Avukat, İcra, Noter Masrafları
  | "DIGER";

export interface ExpenseRecord {
  id: string;
  siteId: string;
  category: ExpenseCategory;
  title: string;
  description: string;
  amount: number;
  date: string;
  invoiceNumber?: string;
  vendorId?: string;
  vendorName?: string;
  paymentStatus: "ODENDI" | "BEKLIYOR";
  paidFromAccountId?: string;
  paidFromAccountName?: string;
  documentUrl?: string;
  createdAt: string;
  createdBy: string;
}

// -----------------------------------------------------------------------------
// TEDARİKÇİ CARİ HESAPLARI
// -----------------------------------------------------------------------------

export interface Vendor {
  id: string;
  siteId: string;
  companyName: string;
  serviceType: string; // "Asansör Bakım", "Güvenlik", "Temizlik", "Mali Müşavirlik"
  contactPerson: string;
  phone: string;
  email: string;
  taxNumber: string;
  taxOffice: string;
  iban: string;
  bankName: string;
  currentBalance: number; // Pozitif: Tedarikçiye Borcumuz var, Negatif: Avans
  contractEndDate?: string;
  notes?: string;
}

// -----------------------------------------------------------------------------
// BÜTÇE & İŞLETME PROJESİ
// -----------------------------------------------------------------------------

export interface BudgetItem {
  id: string;
  category: string;
  type: "GELIR" | "GIDER";
  plannedAnnual: number;
  actualAnnual: number;
  notes?: string;
}

export interface AnnualBudget {
  id: string;
  siteId: string;
  year: number; // 2026
  status: "TASLAK" | "ONAYLANDI_GENEL_KURUL" | "KAPANDI";
  totalEstimatedIncome: number;
  totalEstimatedExpense: number;
  totalActualIncome: number;
  totalActualExpense: number;
  items: BudgetItem[];
}

// -----------------------------------------------------------------------------
// TALEP & ARIZA YÖNETİMİ
// -----------------------------------------------------------------------------

export type RequestStatus = "YENI" | "INCELENIYOR" | "ISLEME_ALINDI" | "TAMAMLANDI";
export type RequestPriority = "DUSUK" | "ORTA" | "YUKSEK" | "ACIL";

export interface ServiceRequest {
  id: string;
  siteId: string;
  unitId: string;
  unitName: string;
  reportedById?: string;
  reportedByName: string;
  reportedByPhone: string;
  category: "ELEKTRIK" | "TESISAT" | "ASANSOR" | "PEYZAJ" | "TEMIZLIK" | "GUVENLIK" | "SES_GURULTU" | "DIGER";
  title: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  photoUrl?: string;
  assignedStaffName?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// -----------------------------------------------------------------------------
// DUYURU, ANKET, TOPLANTI & BELGE
// -----------------------------------------------------------------------------

export interface Announcement {
  id: string;
  siteId: string;
  title: string;
  content: string;
  priority: "NORMAL" | "ACIL" | "BILGI";
  targetScope: "TUM_SITE" | "A_BLOK" | "B_BLOK" | "C_BLOK";
  date: string;
  authorName: string;
  isPinned: boolean;
}

export interface Poll {
  id: string;
  siteId: string;
  title: string;
  description: string;
  endDate: string;
  status: "AKTIF" | "SONUCLANDI";
  totalVotes: number;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
}

export interface MeetingMinute {
  id: string;
  siteId: string;
  title: string; // "2026 Yılı Kat Malikleri Olağan Genel Kurulu"
  date: string;
  location: string;
  quorumInfo: string; // "120 bağımsız bölümden 84 asil ve vekil ile toplantı yeter sayısına ulaşıldı."
  agendaItems: string[];
  decisions: string[];
  pdfUrl?: string;
}

export interface DocumentArchiveItem {
  id: string;
  siteId: string;
  title: string;
  category: "YONETIM_PLANI" | "SOZLESME" | "SIGORTA_POLICESI" | "BAKIM_RAPORU" | "TOPLANTI_TUTANAGI" | "RESMI_EVRAK";
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  viewPermissionRoles: UserRole[];
}

// -----------------------------------------------------------------------------
// TEKNİK BAKIM, DEMİRBAŞ & PERSONEL
// -----------------------------------------------------------------------------

export interface AssetFixture {
  id: string;
  siteId: string;
  name: string;
  category: "ASANSOR" | "JENERATOR" | "HIDROFOR" | "YANGIN_SISTEMI" | "HAVUZ" | "KAMERA_GUVENLIK" | "BARIYER" | "EKIPMAN";
  location: string;
  purchaseDate: string;
  warrantyEndDate: string;
  nextMaintenanceDate: string;
  maintenanceIntervalDays: number;
  serviceVendorName: string;
  serviceVendorPhone: string;
  status: "CALISIYOR" | "BAKIM_GEREKIYOR" | "ARIZALI";
  estimatedValue: number;
}

export interface StaffMember {
  id: string;
  siteId: string;
  fullName: string;
  roleTitle: "Kapıcı / Bina Görevlisi" | "Güvenlik Amiri" | "Güvenlik Görevlisi" | "Temizlik Görevlisi" | "Teknik Personel" | "Bahçıvan";
  phone: string;
  shiftHours: string; // "08:00 - 17:00" | "20:00 - 08:00"
  salary: number;
  startDate: string;
  status: "AKTIF" | "IZINLI" | "AYRILDI";
}

// -----------------------------------------------------------------------------
// GÜVENLİK KAPISI, ZİYARETÇİ & KARGO
// -----------------------------------------------------------------------------

export interface VisitorLog {
  id: string;
  siteId: string;
  visitorName: string;
  unitId: string;
  unitName: string;
  vehiclePlate?: string;
  entryTime: string;
  exitTime?: string;
  guardName: string;
  notes?: string;
}

export interface ParcelLog {
  id: string;
  siteId: string;
  unitId: string;
  unitName: string;
  recipientName: string;
  cargoCompany: "Yurtiçi Kargo" | "Aras Kargo" | "MNG Kargo" | "Trendyol Express" | "Hepsijet" | "Sürat Kargo" | "PTT Kargo" | "Diğer";
  trackingNumber?: string;
  receivedTime: string;
  deliveredTime?: string;
  status: "BEKLIYOR" | "BILDIRILDI" | "TESLIM_EDILDI";
  guardName: string;
}

// -----------------------------------------------------------------------------
// SAYAÇ OKUMA
// -----------------------------------------------------------------------------

export interface MeterReading {
  id: string;
  siteId: string;
  unitId: string;
  unitName: string;
  meterType: "SU" | "SICAK_SU" | "DOGALGAZ" | "ISI_PAY_OLCER";
  readingDate: string;
  previousIndex: number;
  currentIndex: number;
  consumption: number; // Fark
  unitPrice: number;
  totalAmount: number;
  isBilled: boolean;
}

// -----------------------------------------------------------------------------
// DENETİM İZİ (AUDIT LOG)
// -----------------------------------------------------------------------------

export interface AuditLogEntry {
  id: string;
  siteId: string;
  timestamp: string;
  userName: string;
  userRole: string;
  actionType: "CREATE" | "UPDATE" | "DELETE" | "CANCEL" | "COLLECT" | "EXPORT" | "SYSTEM";
  module: string;
  description: string;
  financialAmount?: number;
  ipAddress?: string;
}
