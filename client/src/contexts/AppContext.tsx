import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Site, Block, Unit, Person, TahakkukRecord, UnitType,
  UnitAccountLedgerItem, Collection, AccountEntity,
  AccountTransaction, ExpenseRecord, Vendor, AnnualBudget,
  ServiceRequest, Announcement, Poll, MeetingMinute,
  DocumentArchiveItem, AssetFixture, StaffMember, VisitorLog,
  ParcelLog, MeterReading, AuditLogEntry, ManagementCompany,
  PaymentMethod, DuesCategory, DistributionMethod, RequestStatus, RequestPriority,
  WhatsAppConfig, WhatsAppLogEntry
} from "@/types";
import {
  INITIAL_COMPANY, INITIAL_SITES, INITIAL_BLOCKS, INITIAL_PEOPLE,
  INITIAL_UNITS, INITIAL_TAHAKKUKLAR, INITIAL_COLLECTIONS,
  INITIAL_LEDGER_ITEMS, INITIAL_ACCOUNTS, INITIAL_ACCOUNT_TXS,
  INITIAL_EXPENSES, INITIAL_VENDORS, INITIAL_BUDGET, INITIAL_REQUESTS,
  INITIAL_ANNOUNCEMENTS, INITIAL_ASSETS, INITIAL_STAFF, INITIAL_VISITORS,
  INITIAL_PARCELS, INITIAL_METERS, INITIAL_MEETINGS, INITIAL_POLLS,
  INITIAL_DOCS, INITIAL_AUDIT_LOGS
} from "@/data/mockData";
import {
  db, collection, doc, getDocs, setDoc, addDoc, updateDoc,
  deleteDoc, onSnapshot, writeBatch
} from "@/lib/firebase";
import { useAuth } from "./AuthContext";

interface AppContextType {
  // Company & Sites
  company: ManagementCompany;
  sites: Site[];
  activeSiteId: string;
  activeSite: Site;
  setActiveSiteId: (siteId: string) => void;
  addNewSite: (siteData: Omit<Site, "id" | "companyId" | "createdAt">) => Promise<void>;
  addSite: (siteData: Omit<Site, "id" | "companyId" | "createdAt">) => Promise<void>;
  updateSite: (siteId: string, siteData: Partial<Site>) => Promise<void>;

  // Blocks & Units
  blocks: Block[];
  addBlock: (blockData: Omit<Block, "id">) => Promise<void>;
  deleteBlock: (blockId: string) => Promise<void>;
  units: Unit[];
  activeSiteUnits: Unit[];
  addUnit: (unitData: Omit<Unit, "id">) => Promise<void>;
  updateUnit: (unitId: string, unitData: Partial<Unit>) => Promise<void>;
  deleteUnit: (unitId: string) => Promise<void>;
  bulkImportUnitsAndPeople: (items: Array<{
    blockName: string;
    unitNumber: string;
    type?: "DAIRE" | "DUKKAN" | "OFIS" | "DEPO";
    grossSquareMeters?: number;
    landShare?: number;
    residentType?: "MALIK_OTURUYOR" | "KIRACI_OTURUYOR" | "BOS";
    ownerName: string;
    ownerPhone?: string;
    ownerEmail?: string;
    tenantName?: string;
    tenantPhone?: string;
    tenantEmail?: string;
    initialBalance?: number;
  }>) => Promise<number>;

  // People
  people: Person[];
  activeSitePeople: Person[];
  addPerson: (personData: Omit<Person, "id">) => Promise<void>;
  updatePerson: (personId: string, personData: Partial<Person>) => Promise<void>;
  assignTenantToUnit: (unitId: string, tenantId: string) => Promise<void>;
  vacateTenantFromUnit: (unitId: string) => Promise<void>;

  // Tahakkuk & Dues
  tahakkuklar: TahakkukRecord[];
  activeSiteTahakkuklar: TahakkukRecord[];
  createBatchTahakkuk: (params: {
    title: string;
    period: string;
    category: DuesCategory;
    dueDate: string;
    distributionMethod: DistributionMethod;
    totalAmountOrPerUnit: number;
    targetBlockId?: string;
    responsibilityMode?: "AUTO_KMK" | "CUSTOM_RATIO" | "OCCUPANT_ONLY" | "OWNER_ONLY";
  }) => Promise<void>;
  cancelTahakkuk: (tahakkukId: string, reason?: string) => Promise<void>;

  // Collections & Makbuz
  collections: Collection[];
  activeSiteCollections: Collection[];
  addCollection: (params: {
    unitId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    targetAccountId: string;
    description: string;
    referenceNo?: string;
    settledTahakkukId?: string;
    payerType?: "KIRACI" | "MALIK";
  }) => Collection;

  // Ledger Items
  ledgerItems: UnitAccountLedgerItem[];
  getUnitLedger: (unitId: string) => UnitAccountLedgerItem[];

  // Kasa & Banka Accounts
  accounts: AccountEntity[];
  activeSiteAccounts: AccountEntity[];
  accountTransactions: AccountTransaction[];
  activeSiteAccountTransactions: AccountTransaction[];
  addAccount: (accountData: Omit<AccountEntity, "id" | "balance">) => Promise<void>;
  transferFunds: (params: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description: string;
  }) => Promise<void>;

  // Expenses & Vendors
  expenses: ExpenseRecord[];
  activeSiteExpenses: ExpenseRecord[];
  addExpense: (expenseData: Omit<ExpenseRecord, "id" | "createdAt" | "createdBy">) => Promise<void>;
  vendors: Vendor[];
  activeSiteVendors: Vendor[];
  addVendor: (vendorData: Omit<Vendor, "id" | "currentBalance">) => Promise<void>;
  recordVendorPayment: (vendorId: string, amount: number, accountId: string, description: string) => Promise<void>;

  // Budget
  budget: AnnualBudget;
  updateBudgetItem: (itemId: string, updates: Partial<AnnualBudget["items"][0]>) => void;

  // Requests / Tickets
  requests: ServiceRequest[];
  activeSiteRequests: ServiceRequest[];
  createServiceRequest: (data: {
    unitId: string;
    category: ServiceRequest["category"];
    title: string;
    description: string;
    priority: RequestPriority;
    photoUrl?: string;
  }) => Promise<void>;
  updateRequestStatus: (requestId: string, status: RequestStatus, adminNote?: string, assignedStaffName?: string) => Promise<void>;

  // Announcements, Polls, Meetings, Documents
  announcements: Announcement[];
  activeSiteAnnouncements: Announcement[];
  addAnnouncement: (data: Omit<Announcement, "id" | "date" | "authorName">) => Promise<void>;
  polls: Poll[];
  activeSitePolls: Poll[];
  votePoll: (pollId: string, optionId: string) => Promise<void>;
  meetings: MeetingMinute[];
  activeSiteMeetings: MeetingMinute[];
  documents: DocumentArchiveItem[];
  activeSiteDocuments: DocumentArchiveItem[];

  // Assets & Staff & Security
  assets: AssetFixture[];
  activeSiteAssets: AssetFixture[];
  staff: StaffMember[];
  activeSiteStaff: StaffMember[];
  visitors: VisitorLog[];
  activeSiteVisitors: VisitorLog[];
  addVisitorLog: (data: Omit<VisitorLog, "id" | "entryTime" | "guardName">) => Promise<void>;
  markVisitorExit: (visitorId: string) => Promise<void>;
  parcels: ParcelLog[];
  activeSiteParcels: ParcelLog[];
  addParcelLog: (data: Omit<ParcelLog, "id" | "receivedTime" | "guardName" | "status">) => Promise<void>;
  updateParcelStatus: (parcelId: string, status: ParcelLog["status"]) => Promise<void>;

  // Meters
  meters: MeterReading[];
  activeSiteMeters: MeterReading[];
  addMeterReading: (reading: Omit<MeterReading, "id" | "consumption" | "totalAmount" | "isBilled">) => Promise<void>;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  activeSiteAuditLogs: AuditLogEntry[];
  addAuditLog: (actionType: AuditLogEntry["actionType"], module: string, description: string, financialAmount?: number) => void;

  // WhatsApp Automation & Logs
  whatsappConfig: WhatsAppConfig;
  updateWhatsAppConfig: (updates: Partial<WhatsAppConfig>) => void;
  whatsappLogs: WhatsAppLogEntry[];
  activeSiteWhatsAppLogs: WhatsAppLogEntry[];
  logWhatsAppMessage: (entry: Omit<WhatsAppLogEntry, "id" | "siteId" | "timestamp" | "httpCode" | "status">) => WhatsAppLogEntry;
  sendBulkWhatsAppReminders: () => number;

  // Reset
  resetDemoData: () => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_WHATSAPP_LOGS: WhatsAppLogEntry[] = [
  {
    id: "walog-1",
    siteId: "site-1",
    timestamp: "2026-10-14 10:02:14",
    type: "AIDAT_HATIRLATMA",
    unitId: "u-3",
    unitName: "A Blok D:3",
    recipientName: "Selim Aksoy",
    phone: "0532 411 22 33",
    period: "2026-10",
    amount: 6400,
    messagePreview: "Sayın Selim Aksoy, Zümrüt Vadisi Konakları A Blok D:3 dairenize ait 2026-10 dönemi 6.400 TL aidat borcunuz bulunmaktadır.",
    status: "BASARILI",
    httpCode: 200,
  },
  {
    id: "walog-2",
    siteId: "site-1",
    timestamp: "2026-10-12 14:30:05",
    type: "EKSTRA_BORC",
    unitId: "u-5",
    unitName: "B Blok D:1",
    recipientName: "Kaan Demir",
    phone: "0544 822 19 00",
    period: "2026-10",
    amount: 9600,
    messagePreview: "Sayın Kaan Demir, B Blok D:1 dairenize ait gecikmiş demirbaş ve aidat borcunuz 9.600 TL'dir. Lütfen ödeme yapınız.",
    status: "BASARILI",
    httpCode: 200,
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();

  const [company, setCompany] = useState<ManagementCompany>(INITIAL_COMPANY);
  const [sites, setSites] = useState<Site[]>([]);
  const [activeSiteId, setActiveSiteId] = useState<string>("site-1");

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [tahakkuklar, setTahakkuklar] = useState<TahakkukRecord[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [ledgerItems, setLedgerItems] = useState<UnitAccountLedgerItem[]>([]);
  const [accounts, setAccounts] = useState<AccountEntity[]>([]);
  const [accountTransactions, setAccountTransactions] = useState<AccountTransaction[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [budget, setBudget] = useState<AnnualBudget>(INITIAL_BUDGET);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [meetings, setMeetings] = useState<MeetingMinute[]>([]);
  const [documents, setDocuments] = useState<DocumentArchiveItem[]>([]);
  const [assets, setAssets] = useState<AssetFixture[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [parcels, setParcels] = useState<ParcelLog[]>([]);
  const [meters, setMeters] = useState<MeterReading[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig>({
    siteId: "site-1",
    enabled: true,
    provider: "META_CLOUD_API",
    phoneNumberId: "104928374651920",
    wabaId: "994827162534102",
    templateName: "aidat_hatirlatma_tr",
    autoReminderDay: 10,
    autoReminderTime: "10:00",
    messageTemplate: "Sayın {ad_soyad}, {site_adi} {daire_no} numaralı bağımsız bölümünüze ait {donem} dönemi toplam {borc} ₺ bakiye bulunmaktadır. Son ödeme tarihi: {son_odeme_tarihi}. IBAN: {iban}",
  });
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLogEntry[]>(INITIAL_WHATSAPP_LOGS);

  // =========================================================================
  // Firestore Live Real-Time Data Synchronization
  // =========================================================================
  useEffect(() => {
    try {
      // 1. Sites
      const unsubSites = onSnapshot(collection(db, "sites"), (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Site));
          setSites(loaded);
        } else {
          INITIAL_SITES.forEach(s => setDoc(doc(db, "sites", s.id), s));
          setSites(INITIAL_SITES);
        }
      }, (err) => {
        console.warn("Firestore sites sync:", err);
        setSites(INITIAL_SITES);
      });

      // 2. Blocks
      const unsubBlocks = onSnapshot(collection(db, "blocks"), (snapshot) => {
        if (!snapshot.empty) {
          setBlocks(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Block)));
        } else {
          INITIAL_BLOCKS.forEach(b => setDoc(doc(db, "blocks", b.id), b));
          setBlocks(INITIAL_BLOCKS);
        }
      }, (err) => setBlocks(INITIAL_BLOCKS));

      // 3. Units
      const unsubUnits = onSnapshot(collection(db, "units"), (snapshot) => {
        if (!snapshot.empty) {
          setUnits(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Unit)));
        } else {
          INITIAL_UNITS.forEach(u => setDoc(doc(db, "units", u.id), u));
          setUnits(INITIAL_UNITS);
        }
      }, (err) => setUnits(INITIAL_UNITS));

      // 4. People
      const unsubPeople = onSnapshot(collection(db, "people"), (snapshot) => {
        if (!snapshot.empty) {
          setPeople(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Person)));
        } else {
          INITIAL_PEOPLE.forEach(p => setDoc(doc(db, "people", p.id), p));
          setPeople(INITIAL_PEOPLE);
        }
      }, (err) => setPeople(INITIAL_PEOPLE));

      // 5. Tahakkuklar
      const unsubTahakkuklar = onSnapshot(collection(db, "tahakkuklar"), (snapshot) => {
        if (!snapshot.empty) {
          setTahakkuklar(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as TahakkukRecord)));
        } else {
          INITIAL_TAHAKKUKLAR.forEach(t => setDoc(doc(db, "tahakkuklar", t.id), t));
          setTahakkuklar(INITIAL_TAHAKKUKLAR);
        }
      }, (err) => setTahakkuklar(INITIAL_TAHAKKUKLAR));

      // 6. Collections
      const unsubCollections = onSnapshot(collection(db, "collections"), (snapshot) => {
        if (!snapshot.empty) {
          setCollections(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Collection)));
        } else {
          INITIAL_COLLECTIONS.forEach(c => setDoc(doc(db, "collections", c.id), c));
          setCollections(INITIAL_COLLECTIONS);
        }
      }, (err) => setCollections(INITIAL_COLLECTIONS));

      // 7. Ledger Items
      const unsubLedger = onSnapshot(collection(db, "ledger_items"), (snapshot) => {
        if (!snapshot.empty) {
          setLedgerItems(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as UnitAccountLedgerItem)));
        } else {
          INITIAL_LEDGER_ITEMS.forEach(l => setDoc(doc(db, "ledger_items", l.id), l));
          setLedgerItems(INITIAL_LEDGER_ITEMS);
        }
      }, (err) => setLedgerItems(INITIAL_LEDGER_ITEMS));

      // 8. Accounts (Kasa & Banka)
      const unsubAccounts = onSnapshot(collection(db, "accounts"), (snapshot) => {
        if (!snapshot.empty) {
          setAccounts(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as AccountEntity)));
        } else {
          INITIAL_ACCOUNTS.forEach(a => setDoc(doc(db, "accounts", a.id), a));
          setAccounts(INITIAL_ACCOUNTS);
        }
      }, (err) => setAccounts(INITIAL_ACCOUNTS));

      // 9. Account Transactions
      const unsubTx = onSnapshot(collection(db, "account_transactions"), (snapshot) => {
        if (!snapshot.empty) {
          setAccountTransactions(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as AccountTransaction)));
        } else {
          INITIAL_ACCOUNT_TXS.forEach(tx => setDoc(doc(db, "account_transactions", tx.id), tx));
          setAccountTransactions(INITIAL_ACCOUNT_TXS);
        }
      }, (err) => setAccountTransactions(INITIAL_ACCOUNT_TXS));

      // 10. Expenses
      const unsubExpenses = onSnapshot(collection(db, "expenses"), (snapshot) => {
        if (!snapshot.empty) {
          setExpenses(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as ExpenseRecord)));
        } else {
          INITIAL_EXPENSES.forEach(e => setDoc(doc(db, "expenses", e.id), e));
          setExpenses(INITIAL_EXPENSES);
        }
      }, (err) => setExpenses(INITIAL_EXPENSES));

      // 11. Vendors
      const unsubVendors = onSnapshot(collection(db, "vendors"), (snapshot) => {
        if (!snapshot.empty) {
          setVendors(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Vendor)));
        } else {
          INITIAL_VENDORS.forEach(v => setDoc(doc(db, "vendors", v.id), v));
          setVendors(INITIAL_VENDORS);
        }
      }, (err) => setVendors(INITIAL_VENDORS));

      // 12. Requests (Arıza & Hizmet)
      const unsubRequests = onSnapshot(collection(db, "requests"), (snapshot) => {
        if (!snapshot.empty) {
          setRequests(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as ServiceRequest)));
        } else {
          INITIAL_REQUESTS.forEach(r => setDoc(doc(db, "requests", r.id), r));
          setRequests(INITIAL_REQUESTS);
        }
      }, (err) => setRequests(INITIAL_REQUESTS));

      // 13. Announcements
      const unsubAnnouncements = onSnapshot(collection(db, "announcements"), (snapshot) => {
        if (!snapshot.empty) {
          setAnnouncements(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Announcement)));
        } else {
          INITIAL_ANNOUNCEMENTS.forEach(a => setDoc(doc(db, "announcements", a.id), a));
          setAnnouncements(INITIAL_ANNOUNCEMENTS);
        }
      }, (err) => setAnnouncements(INITIAL_ANNOUNCEMENTS));

      // 14. Polls
      const unsubPolls = onSnapshot(collection(db, "polls"), (snapshot) => {
        if (!snapshot.empty) {
          setPolls(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Poll)));
        } else {
          INITIAL_POLLS.forEach(p => setDoc(doc(db, "polls", p.id), p));
          setPolls(INITIAL_POLLS);
        }
      }, (err) => setPolls(INITIAL_POLLS));

      // 15. Meetings
      const unsubMeetings = onSnapshot(collection(db, "meetings"), (snapshot) => {
        if (!snapshot.empty) {
          setMeetings(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as MeetingMinute)));
        } else {
          INITIAL_MEETINGS.forEach(m => setDoc(doc(db, "meetings", m.id), m));
          setMeetings(INITIAL_MEETINGS);
        }
      }, (err) => setMeetings(INITIAL_MEETINGS));

      // 16. Documents
      const unsubDocs = onSnapshot(collection(db, "documents"), (snapshot) => {
        if (!snapshot.empty) {
          setDocuments(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as DocumentArchiveItem)));
        } else {
          INITIAL_DOCS.forEach(docItem => setDoc(doc(db, "documents", docItem.id), docItem));
          setDocuments(INITIAL_DOCS);
        }
      }, (err) => setDocuments(INITIAL_DOCS));

      // 17. Assets
      const unsubAssets = onSnapshot(collection(db, "assets"), (snapshot) => {
        if (!snapshot.empty) {
          setAssets(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as AssetFixture)));
        } else {
          INITIAL_ASSETS.forEach(a => setDoc(doc(db, "assets", a.id), a));
          setAssets(INITIAL_ASSETS);
        }
      }, (err) => setAssets(INITIAL_ASSETS));

      // 18. Staff
      const unsubStaff = onSnapshot(collection(db, "staff"), (snapshot) => {
        if (!snapshot.empty) {
          setStaff(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as StaffMember)));
        } else {
          INITIAL_STAFF.forEach(s => setDoc(doc(db, "staff", s.id), s));
          setStaff(INITIAL_STAFF);
        }
      }, (err) => setStaff(INITIAL_STAFF));

      // 19. Visitors
      const unsubVisitors = onSnapshot(collection(db, "visitors"), (snapshot) => {
        if (!snapshot.empty) {
          setVisitors(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as VisitorLog)));
        } else {
          INITIAL_VISITORS.forEach(v => setDoc(doc(db, "visitors", v.id), v));
          setVisitors(INITIAL_VISITORS);
        }
      }, (err) => setVisitors(INITIAL_VISITORS));

      // 20. Parcels
      const unsubParcels = onSnapshot(collection(db, "parcels"), (snapshot) => {
        if (!snapshot.empty) {
          setParcels(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as ParcelLog)));
        } else {
          INITIAL_PARCELS.forEach(p => setDoc(doc(db, "parcels", p.id), p));
          setParcels(INITIAL_PARCELS);
        }
      }, (err) => setParcels(INITIAL_PARCELS));

      // 21. Meters
      const unsubMeters = onSnapshot(collection(db, "meters"), (snapshot) => {
        if (!snapshot.empty) {
          setMeters(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as MeterReading)));
        } else {
          INITIAL_METERS.forEach(m => setDoc(doc(db, "meters", m.id), m));
          setMeters(INITIAL_METERS);
        }
      }, (err) => setMeters(INITIAL_METERS));

      // 22. Audit Logs
      const unsubLogs = onSnapshot(collection(db, "audit_logs"), (snapshot) => {
        if (!snapshot.empty) {
          setAuditLogs(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as AuditLogEntry)));
        } else {
          INITIAL_AUDIT_LOGS.forEach(l => setDoc(doc(db, "audit_logs", l.id), l));
          setAuditLogs(INITIAL_AUDIT_LOGS);
        }
      }, (err) => setAuditLogs(INITIAL_AUDIT_LOGS));

      return () => {
        unsubSites();
        unsubBlocks();
        unsubUnits();
        unsubPeople();
        unsubTahakkuklar();
        unsubCollections();
        unsubLedger();
        unsubAccounts();
        unsubTx();
        unsubExpenses();
        unsubVendors();
        unsubRequests();
        unsubAnnouncements();
        unsubPolls();
        unsubMeetings();
        unsubDocs();
        unsubAssets();
        unsubStaff();
        unsubVisitors();
        unsubParcels();
        unsubMeters();
        unsubLogs();
      };
    } catch (e) {
      console.warn("Firestore listeners active with local fallback.");
    }
  }, []);

  const activeSite = sites.find((s) => s.id === activeSiteId) || sites[0] || INITIAL_SITES[0];

  // Filtered active site sub-arrays
  const activeSiteUnits = units.filter((u) => u.siteId === activeSiteId);
  const activeSitePeople = people.filter((p) => p.siteId === activeSiteId);
  const activeSiteTahakkuklar = tahakkuklar.filter((t) => t.siteId === activeSiteId);
  const activeSiteCollections = collections.filter((c) => c.siteId === activeSiteId);
  const activeSiteAccounts = accounts.filter((a) => a.siteId === activeSiteId);
  const activeSiteAccountTransactions = accountTransactions.filter((tx) => tx.siteId === activeSiteId);
  const activeSiteExpenses = expenses.filter((e) => e.siteId === activeSiteId);
  const activeSiteVendors = vendors.filter((v) => v.siteId === activeSiteId);
  const activeSiteRequests = requests.filter((r) => r.siteId === activeSiteId);
  const activeSiteAnnouncements = announcements.filter((a) => a.siteId === activeSiteId);
  const activeSitePolls = polls.filter((p) => p.siteId === activeSiteId);
  const activeSiteMeetings = meetings.filter((m) => m.siteId === activeSiteId);
  const activeSiteDocuments = documents.filter((d) => d.siteId === activeSiteId);
  const activeSiteAssets = assets.filter((a) => a.siteId === activeSiteId);
  const activeSiteStaff = staff.filter((s) => s.siteId === activeSiteId);
  const activeSiteVisitors = visitors.filter((v) => v.siteId === activeSiteId);
  const activeSiteParcels = parcels.filter((p) => p.siteId === activeSiteId);
  const activeSiteMeters = meters.filter((m) => m.siteId === activeSiteId);
  const activeSiteAuditLogs = auditLogs.filter((l) => l.siteId === activeSiteId);

  // Helper Audit Logger
  const addAuditLog = async (
    actionType: AuditLogEntry["actionType"],
    module: string,
    description: string,
    financialAmount?: number
  ) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newLog: AuditLogEntry = {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      siteId: activeSiteId,
      timestamp: ts,
      userName: currentUser.name,
      userRole: currentUser.role,
      actionType,
      module,
      description,
      financialAmount,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    try {
      await setDoc(doc(db, "audit_logs", newLog.id), newLog);
    } catch (e) {}
  };

  // Add new Site
  const addNewSite = async (siteData: Omit<Site, "id" | "companyId" | "createdAt">) => {
    const newId = "site-" + Date.now();
    const newSite: Site = {
      ...siteData,
      id: newId,
      companyId: company.id,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setSites((prev) => [...prev, newSite]);
    setActiveSiteId(newId);
    try {
      await setDoc(doc(db, "sites", newId), newSite);
    } catch (e) {}
    addAuditLog("CREATE", "Site Yönetimi", `Yeni site tanımlandı: ${newSite.name}`);
  };

  const addSite = addNewSite;

  const updateSite = async (siteId: string, siteData: Partial<Site>) => {
    setSites((prev) =>
      prev.map((s) => (s.id === siteId ? { ...s, ...siteData } : s))
    );
    try {
      await updateDoc(doc(db, "sites", siteId), siteData);
    } catch (e) {}
    addAuditLog("UPDATE", "Site & Banka Ayarları", `${siteData.name || "Site"} ayarları ve IBAN bilgileri güncellendi.`);
  };

  // Blocks CRUD
  const addBlock = async (blockData: Omit<Block, "id">) => {
    const newId = "block-" + Date.now();
    const newBlock: Block = {
      ...blockData,
      id: newId,
    };
    setBlocks((prev) => [...prev, newBlock]);
    try {
      await setDoc(doc(db, "blocks", newId), newBlock);
    } catch (e) {}
    addAuditLog("CREATE", "Blok Yönetimi", `Yeni blok tanımlandı: ${newBlock.name} (${newBlock.floorsCount} Kat, ${newBlock.unitsCount} Daire)`);
  };

  const deleteBlock = async (blockId: string) => {
    const targetBlock = blocks.find((b) => b.id === blockId);
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    try {
      await deleteDoc(doc(db, "blocks", blockId));
    } catch (e) {}
    if (targetBlock) {
      addAuditLog("DELETE", "Blok Yönetimi", `${targetBlock.name} kaydı silindi.`);
    }
  };

  // Units CRUD
  const addUnit = async (unitData: Omit<Unit, "id">) => {
    const newId = "unit-" + Date.now();
    const defaultRatio = unitData.paymentRatio || {
      duesTenantRatio: 100,
      duesOwnerRatio: 0,
      extraTenantRatio: 0,
      extraOwnerRatio: 100,
    };
    const newUnit: Unit = {
      ...unitData,
      id: newId,
      paymentRatio: defaultRatio,
    };
    setUnits((prev) => [...prev, newUnit]);
    try {
      await setDoc(doc(db, "units", newId), newUnit);
    } catch (e) {}
    addAuditLog("CREATE", "Bağımsız Bölümler", `Yeni bağımsız bölüm eklendi: ${newUnit.blockName} No:${newUnit.unitNumber}`);
  };

  const updateUnit = async (unitId: string, unitData: Partial<Unit>) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, ...unitData } : u))
    );
    try {
      await updateDoc(doc(db, "units", unitId), unitData);
    } catch (e) {}
    addAuditLog("UPDATE", "Bağımsız Bölümler", `Daire bilgileri güncellendi (ID: ${unitId})`);
  };

  const deleteUnit = async (unitId: string) => {
    const targetUnit = units.find((u) => u.id === unitId);
    setUnits((prev) => prev.filter((u) => u.id !== unitId));
    try {
      await deleteDoc(doc(db, "units", unitId));
    } catch (e) {}
    if (targetUnit) {
      addAuditLog("DELETE", "Bağımsız Bölümler", `${targetUnit.blockName} No:${targetUnit.unitNumber} bağımsız bölüm kaydı silindi.`);
    }
  };

  const bulkImportUnitsAndPeople = async (items: Array<{
    blockName: string;
    unitNumber: string;
    type?: "DAIRE" | "DUKKAN" | "OFIS" | "DEPO";
    grossSquareMeters?: number;
    landShare?: number;
    residentType?: "MALIK_OTURUYOR" | "KIRACI_OTURUYOR" | "BOS";
    ownerName: string;
    ownerPhone?: string;
    ownerEmail?: string;
    tenantName?: string;
    tenantPhone?: string;
    tenantEmail?: string;
    initialBalance?: number;
  }>) => {
    const newUnits: Unit[] = [];
    const newPeople: Person[] = [];
    const now = Date.now();

    items.forEach((item, index) => {
      const ownerId = `person-imp-${now}-${index}-owner`;
      const tenantId = item.tenantName ? `person-imp-${now}-${index}-tenant` : undefined;
      const unitId = `unit-imp-${now}-${index}`;
      const block = blocks.find(b => b.name.toLowerCase() === (item.blockName || "").toLowerCase()) || blocks[0];

      // Create owner person
      newPeople.push({
        id: ownerId,
        siteId: activeSiteId,
        fullName: item.ownerName || `Malik ${item.blockName} D:${item.unitNumber}`,
        tcOrTaxNo: "11111111110",
        phone: item.ownerPhone || "0500 000 00 00",
        email: item.ownerEmail || `malik_${item.unitNumber}@site.com`,
        type: "MALIK",
        ownedUnitIds: [unitId],
        isActive: true,
      });

      // If tenant exists, create tenant person
      if (item.tenantName && tenantId) {
        newPeople.push({
          id: tenantId,
          siteId: activeSiteId,
          fullName: item.tenantName,
          tcOrTaxNo: "22222222220",
          phone: item.tenantPhone || "0500 000 00 00",
          email: item.tenantEmail || `kiraci_${item.unitNumber}@site.com`,
          type: "KIRACI",
          rentedUnitId: unitId,
          ownedUnitIds: [],
          isActive: true,
        });
      }

      // Map unit type string
      let parsedType: UnitType = "3+1";
      if (item.type === "DUKKAN" || item.type === "DEPO") parsedType = "Dükkan";
      else if (item.type === "OFIS") parsedType = "Ofis";
      else parsedType = "3+1";

      // Create Unit
      newUnits.push({
        id: unitId,
        siteId: activeSiteId,
        blockId: block?.id || "block-1",
        blockName: item.blockName || "A Blok",
        unitNumber: item.unitNumber || String(index + 1),
        floor: Math.ceil(Number(item.unitNumber || 1) / 4),
        type: parsedType,
        grossSquareMeters: Number(item.grossSquareMeters || 120),
        shareOfLand: Number(item.landShare || 10),
        residentType: item.residentType || (item.tenantName ? "KIRACI_OTURUYOR" : "MALIK_OTURUYOR"),
        residentCount: 3,
        vehiclePlates: [],
        ownerId,
        tenantId,
        currentBalance: Number(item.initialBalance || 0),
        paymentRatio: {
          duesTenantRatio: 100,
          duesOwnerRatio: 0,
          extraTenantRatio: 0,
          extraOwnerRatio: 100,
        },
      });
    });

    setUnits((prev) => [...newUnits, ...prev]);
    setPeople((prev) => [...newPeople, ...prev]);

    // Save batch to Firestore asynchronously
    try {
      for (const u of newUnits) {
        await setDoc(doc(db, "units", u.id), u);
      }
      for (const p of newPeople) {
        await setDoc(doc(db, "people", p.id), p);
      }
    } catch (e) {}

    addAuditLog(
      "CREATE",
      "Toplu Excel İçe Aktarma",
      `Excel/CSV üzerinden ${newUnits.length} daire ve ${newPeople.length} kişi kaydı sisteme aktarıldı.`
    );

    return newUnits.length;
  };

  // People CRUD
  const addPerson = async (personData: Omit<Person, "id">) => {
    const newId = "person-" + Date.now();
    const newPerson: Person = {
      ...personData,
      id: newId,
    };
    setPeople((prev) => [...prev, newPerson]);
    try {
      await setDoc(doc(db, "people", newId), newPerson);
    } catch (e) {}
    addAuditLog("CREATE", "Malik & Kiracılar", `Yeni kişi kaydı açıldı: ${newPerson.fullName} (${newPerson.type})`);
  };

  const updatePerson = async (personId: string, personData: Partial<Person>) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === personId ? { ...p, ...personData } : p))
    );
    try {
      await updateDoc(doc(db, "people", personId), personData);
    } catch (e) {}
    addAuditLog("UPDATE", "Malik & Kiracılar", `Kişi bilgileri güncellendi: ID ${personId}`);
  };

  const assignTenantToUnit = async (unitId: string, tenantId: string) => {
    const unit = units.find((u) => u.id === unitId);
    const tenant = people.find((p) => p.id === tenantId);
    if (!unit || !tenant) return;

    await updateUnit(unitId, {
      tenantId,
      residentType: "KIRACI_OTURUYOR",
    });

    await updatePerson(tenantId, {
      rentedUnitId: unitId,
    });

    addAuditLog("UPDATE", "Kiracı İşlemleri", `${unit.blockName} D:${unit.unitNumber} dairesine yeni kiracı atandı: ${tenant.fullName}`);
  };

  const vacateTenantFromUnit = async (unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    if (!unit) return;

    if (unit.tenantId) {
      const oldTenant = people.find((p) => p.id === unit.tenantId);
      if (oldTenant) {
        await updatePerson(oldTenant.id, { rentedUnitId: undefined });
      }
    }

    await updateUnit(unitId, {
      tenantId: undefined,
      residentType: "BOS",
    });

    addAuditLog("UPDATE", "Kiracı İşlemleri", `${unit.blockName} D:${unit.unitNumber} dairesi tahliye edildi (boşa çıkarıldı)`);
  };

  // Batch Tahakkuk (Kiracı / Ev Sahibi Borç Paylaşım Oranları Destekli)
  const createBatchTahakkuk = async (params: {
    title: string;
    period: string;
    category: DuesCategory;
    dueDate: string;
    distributionMethod: DistributionMethod;
    totalAmountOrPerUnit: number;
    targetBlockId?: string;
    responsibilityMode?: "AUTO_KMK" | "CUSTOM_RATIO" | "OCCUPANT_ONLY" | "OWNER_ONLY";
  }) => {
    const targetUnits = units.filter((u) => {
      if (u.siteId !== activeSiteId) return false;
      if (params.targetBlockId && u.blockId !== params.targetBlockId) return false;
      return true;
    });

    if (targetUnits.length === 0) return;

    const totalSqm = targetUnits.reduce((sum, u) => sum + (u.grossSquareMeters || 100), 0);
    const totalLandShare = targetUnits.reduce((sum, u) => sum + (u.shareOfLand || 10), 0);
    const isExtraOrFixture = ["DEMIRBAS", "BAKIM_ONARIM", "EK_BUTCE"].includes(params.category);
    const mode = params.responsibilityMode || "AUTO_KMK";

    let totalTarget = 0;

    const allocations: TahakkukRecord["allocations"] = targetUnits.map((u) => {
      let unitAmount = params.totalAmountOrPerUnit;
      if (params.distributionMethod === "SQM") {
        const share = (u.grossSquareMeters || 100) / (totalSqm || 1);
        unitAmount = Math.round(params.totalAmountOrPerUnit * share);
      } else if (params.distributionMethod === "LAND_SHARE") {
        const share = (u.shareOfLand || 10) / (totalLandShare || 1);
        unitAmount = Math.round(params.totalAmountOrPerUnit * share);
      }
      totalTarget += unitAmount;

      const owner = people.find((p) => p.id === u.ownerId);
      const tenant = u.tenantId ? people.find((p) => p.id === u.tenantId) : undefined;
      const ratio = u.paymentRatio || {
        duesTenantRatio: 100,
        duesOwnerRatio: 0,
        extraTenantRatio: 0,
        extraOwnerRatio: 100,
      };

      let tenantRatio = 0;
      let ownerRatio = 100;

      if (tenant && u.residentType === "KIRACI_OTURUYOR") {
        if (mode === "OWNER_ONLY") {
          tenantRatio = 0;
          ownerRatio = 100;
        } else if (mode === "OCCUPANT_ONLY") {
          tenantRatio = 100;
          ownerRatio = 0;
        } else {
          // AUTO_KMK or CUSTOM_RATIO uses unit's configured ratios
          tenantRatio = isExtraOrFixture ? ratio.extraTenantRatio : ratio.duesTenantRatio;
          ownerRatio = isExtraOrFixture ? ratio.extraOwnerRatio : ratio.duesOwnerRatio;
        }
      }

      const tenantAmount = Math.round((unitAmount * tenantRatio) / 100);
      const ownerAmount = unitAmount - tenantAmount;

      let payerType: "KIRACI" | "MALIK" | "ORTAK" = "MALIK";
      let primaryPerson = owner;

      if (tenantRatio === 100 && tenant) {
        payerType = "KIRACI";
        primaryPerson = tenant;
      } else if (tenantRatio > 0 && ownerRatio > 0 && tenant) {
        payerType = "ORTAK";
        primaryPerson = tenant;
      } else {
        payerType = "MALIK";
        primaryPerson = owner;
      }

      const displayPersonName =
        payerType === "ORTAK"
          ? `${tenant?.fullName || "Kiracı"} (%${tenantRatio}) / ${owner?.fullName || "Malik"} (%${ownerRatio})`
          : primaryPerson?.fullName || "Bilinmiyor";

      return {
        unitId: u.id,
        unitName: `${u.blockName} D:${u.unitNumber}`,
        personId: primaryPerson?.id || u.ownerId,
        personName: displayPersonName,
        payerType,
        tenantAmount,
        ownerAmount,
        paidTenantAmount: 0,
        paidOwnerAmount: 0,
        amount: unitAmount,
        paidAmount: 0,
        isPaid: false,
      };
    });

    const newTahakkukId = "tahakkuk-" + Date.now();
    const newTahakkuk: TahakkukRecord = {
      id: newTahakkukId,
      siteId: activeSiteId,
      title: params.title,
      period: params.period,
      category: params.category,
      dueDate: params.dueDate,
      distributionMethod: params.distributionMethod,
      totalTargetAmount: totalTarget,
      totalCollectedAmount: 0,
      unitCount: targetUnits.length,
      status: "ACTIVE",
      createdAt: new Date().toISOString().split("T")[0],
      createdBy: currentUser.name,
      allocations,
    };

    setTahakkuklar((prev) => [newTahakkuk, ...prev]);

    // Update Unit balances and ledger
    const nowStr = new Date().toISOString().split("T")[0];
    const newLedgerRows: UnitAccountLedgerItem[] = [];

    setUnits((prev) =>
      prev.map((u) => {
        const alloc = allocations.find((a) => a.unitId === u.id);
        if (alloc) {
          const newBal = u.currentBalance + alloc.amount;
          const newTenantBal = (u.tenantBalance ?? (u.tenantId ? u.currentBalance : 0)) + (alloc.tenantAmount || 0);
          const newOwnerBal = (u.ownerBalance ?? (u.tenantId ? 0 : u.currentBalance)) + (alloc.ownerAmount || 0);
          const ledId = "led-" + Date.now() + "-" + u.id;
          const payerLabel = alloc.payerType === "ORTAK"
            ? `[K:₺${alloc.tenantAmount} / M:₺${alloc.ownerAmount}]`
            : alloc.payerType === "KIRACI"
            ? "[Kiracı]"
            : "[Kat Maliki]";
          const ledItem: UnitAccountLedgerItem = {
            id: ledId,
            siteId: activeSiteId,
            unitId: u.id,
            date: nowStr,
            type: "BORC",
            category: params.category,
            description: `${params.title} (${params.period}) ${payerLabel}`,
            debtAmount: alloc.amount,
            creditAmount: 0,
            balanceAfter: newBal,
            referenceId: newTahakkuk.id,
            processedBy: currentUser.name,
          };
          newLedgerRows.push(ledItem);
          setDoc(doc(db, "ledger_items", ledId), ledItem).catch(() => {});
          updateDoc(doc(db, "units", u.id), {
            currentBalance: newBal,
            tenantBalance: newTenantBal,
            ownerBalance: newOwnerBal,
          }).catch(() => {});
          return {
            ...u,
            currentBalance: newBal,
            tenantBalance: newTenantBal,
            ownerBalance: newOwnerBal,
          };
        }
        return u;
      })
    );

    setLedgerItems((prev) => [...newLedgerRows, ...prev]);

    try {
      await setDoc(doc(db, "tahakkuklar", newTahakkukId), newTahakkuk);
    } catch (e) {}

    addAuditLog(
      "CREATE",
      "Aidat & Tahakkuk",
      `${params.title} için ${targetUnits.length} daireye toplam ${totalTarget.toLocaleString("tr-TR")} TL borç tahakkuk ettirildi.`,
      totalTarget
    );
  };

  // Cancel Tahakkuk
  const cancelTahakkuk = async (tahakkukId: string, reason?: string) => {
    const t = tahakkuklar.find((item) => item.id === tahakkukId);
    if (!t) return;

    setTahakkuklar((prev) =>
      prev.map((item) => (item.id === tahakkukId ? { ...item, status: "CANCELLED" } : item))
    );

    setUnits((prev) =>
      prev.map((u) => {
        const alloc = t.allocations.find((a) => a.unitId === u.id);
        if (alloc) {
          const updatedBal = Math.max(0, u.currentBalance - (alloc.amount - alloc.paidAmount));
          updateDoc(doc(db, "units", u.id), { currentBalance: updatedBal }).catch(() => {});
          return { ...u, currentBalance: updatedBal };
        }
        return u;
      })
    );

    try {
      await updateDoc(doc(db, "tahakkuklar", tahakkukId), { status: "CANCELLED" });
    } catch (e) {}

    addAuditLog(
      "CANCEL",
      "Aidat & Tahakkuk",
      `Tahakkuk iptal edildi: ${t.title} (${t.period}). Gerekçe: ${reason || "Yönetici iptali"}`,
      -t.totalTargetAmount
    );
  };

  // Add Collection & Generate Makbuz
  const addCollection = (params: {
    unitId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    targetAccountId: string;
    description: string;
    referenceNo?: string;
    settledTahakkukId?: string;
    payerType?: "KIRACI" | "MALIK";
  }): Collection => {
    const unit = units.find((u) => u.id === params.unitId);
    const targetAcc = accounts.find((a) => a.id === params.targetAccountId);
    const owner = people.find((p) => p.id === unit?.ownerId);
    const tenant = unit?.tenantId ? people.find((p) => p.id === unit.tenantId) : undefined;

    const effectivePayerType: "KIRACI" | "MALIK" =
      params.payerType || (tenant ? "KIRACI" : "MALIK");
    const payerPerson = effectivePayerType === "KIRACI" && tenant ? tenant : owner;

    const receiptNumber = `MKB-${new Date().getFullYear()}-${String(collections.length + 843).padStart(5, "0")}`;
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newColId = "col-" + Date.now();
    const newCol: Collection = {
      id: newColId,
      siteId: activeSiteId,
      receiptNumber,
      unitId: params.unitId,
      unitName: unit ? `${unit.blockName} · Daire ${unit.unitNumber}` : "Daire",
      personId: payerPerson?.id || unit?.ownerId || "unknown",
      personName: payerPerson?.fullName || "Bilinmiyor",
      payerType: effectivePayerType,
      amount: params.amount,
      paymentDate: ts,
      paymentMethod: params.paymentMethod,
      targetAccountId: params.targetAccountId,
      targetAccountName: targetAcc?.name || "Kasa/Banka",
      category: "Aidat & İşletme Tahsilatı",
      description: params.description || "Aidat Ödemesi",
      referenceNo: params.referenceNo,
      settledTahakkukId: params.settledTahakkukId,
      printedCount: 1,
      createdAt: ts,
      createdBy: currentUser.name,
    };

    setCollections((prev) => [newCol, ...prev]);

    // Update Unit balance & Ledger
    const oldBalance = unit?.currentBalance || 0;
    const newBalance = oldBalance - params.amount;
    const currentTenantBal = unit?.tenantBalance ?? (unit?.tenantId ? oldBalance : 0);
    const currentOwnerBal = unit?.ownerBalance ?? (unit?.tenantId ? 0 : oldBalance);

    const updatedTenantBal =
      effectivePayerType === "KIRACI"
        ? Math.max(0, currentTenantBal - params.amount)
        : currentTenantBal;
    const updatedOwnerBal =
      effectivePayerType === "MALIK"
        ? Math.max(0, currentOwnerBal - params.amount)
        : currentOwnerBal;

    updateUnit(params.unitId, {
      currentBalance: newBalance,
      tenantBalance: updatedTenantBal,
      ownerBalance: updatedOwnerBal,
    });

    const newLedgerItem: UnitAccountLedgerItem = {
      id: "led-" + Date.now(),
      siteId: activeSiteId,
      unitId: params.unitId,
      date: ts.split(" ")[0],
      type: "ALACAK",
      category: "Tahsilat",
      description: `${params.description || "Tahsilat"} [${effectivePayerType === "KIRACI" ? "Kiracı" : "Kat Maliki"}] (${receiptNumber})`,
      debtAmount: 0,
      creditAmount: params.amount,
      balanceAfter: newBalance,
      referenceId: newCol.id,
      receiptNo: receiptNumber,
      processedBy: currentUser.name,
    };
    setLedgerItems((prev) => [newLedgerItem, ...prev]);
    setDoc(doc(db, "ledger_items", newLedgerItem.id), newLedgerItem).catch(() => {});

    // Update Target Account Balance
    if (targetAcc) {
      const newAccBal = targetAcc.balance + params.amount;
      setAccounts((prev) =>
        prev.map((a) => (a.id === targetAcc.id ? { ...a, balance: newAccBal } : a))
      );
      updateDoc(doc(db, "accounts", targetAcc.id), { balance: newAccBal }).catch(() => {});

      const newTx: AccountTransaction = {
        id: "atx-" + Date.now(),
        siteId: activeSiteId,
        accountId: targetAcc.id,
        accountName: targetAcc.name,
        date: ts,
        type: "GIRIS",
        amount: params.amount,
        category: "Aidat Tahsilatı",
        description: `${newCol.unitName} - ${newCol.personName} (${effectivePayerType === "KIRACI" ? "Kiracı" : "Malik"}) Tahsilat (${receiptNumber})`,
        relatedEntityName: newCol.unitName,
        balanceAfter: newAccBal,
        createdBy: currentUser.name,
      };
      setAccountTransactions((prev) => [newTx, ...prev]);
      setDoc(doc(db, "account_transactions", newTx.id), newTx).catch(() => {});
    }

    try {
      setDoc(doc(db, "collections", newColId), newCol);
    } catch (e) {}

    addAuditLog(
      "COLLECT",
      "Tahsilatlar",
      `${newCol.unitName} (${newCol.personName} - ${effectivePayerType === "KIRACI" ? "Kiracı" : "Kat Maliki"}) ${params.amount.toLocaleString("tr-TR")} TL tahsilat yapıldı. Makbuz: ${receiptNumber}`,
      params.amount
    );

    return newCol;
  };

  const getUnitLedger = (unitId: string) => {
    return ledgerItems.filter((item) => item.unitId === unitId);
  };

  // Kasa / Banka CRUD
  const addAccount = async (accountData: Omit<AccountEntity, "id" | "balance">) => {
    const newId = "acc-" + Date.now();
    const newAcc: AccountEntity = {
      ...accountData,
      id: newId,
      balance: 0,
    };
    setAccounts((prev) => [...prev, newAcc]);
    try {
      await setDoc(doc(db, "accounts", newId), newAcc);
    } catch (e) {}
    addAuditLog("CREATE", "Kasa & Banka", `Yeni hesap eklendi: ${newAcc.name} (${newAcc.type})`);
  };

  const transferFunds = async (params: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description: string;
  }) => {
    const fromAcc = accounts.find((a) => a.id === params.fromAccountId);
    const toAcc = accounts.find((a) => a.id === params.toAccountId);
    if (!fromAcc || !toAcc || fromAcc.balance < params.amount) return;

    const fromNewBal = fromAcc.balance - params.amount;
    const toNewBal = toAcc.balance + params.amount;

    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === fromAcc.id) return { ...a, balance: fromNewBal };
        if (a.id === toAcc.id) return { ...a, balance: toNewBal };
        return a;
      })
    );

    try {
      await updateDoc(doc(db, "accounts", fromAcc.id), { balance: fromNewBal });
      await updateDoc(doc(db, "accounts", toAcc.id), { balance: toNewBal });
    } catch (e) {}

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const txOut: AccountTransaction = {
      id: "atx-out-" + Date.now(),
      siteId: activeSiteId,
      accountId: fromAcc.id,
      accountName: fromAcc.name,
      date: ts,
      type: "VIRMAN_CIKIS",
      amount: params.amount,
      category: "Hesaplar Arası Virman",
      description: `Virman -> ${toAcc.name}: ${params.description}`,
      balanceAfter: fromNewBal,
      createdBy: currentUser.name,
    };

    const txIn: AccountTransaction = {
      id: "atx-in-" + Date.now(),
      siteId: activeSiteId,
      accountId: toAcc.id,
      accountName: toAcc.name,
      date: ts,
      type: "VIRMAN_GIRIS",
      amount: params.amount,
      category: "Hesaplar Arası Virman",
      description: `Virman <- ${fromAcc.name}: ${params.description}`,
      balanceAfter: toNewBal,
      createdBy: currentUser.name,
    };

    setAccountTransactions((prev) => [txIn, txOut, ...prev]);

    try {
      await setDoc(doc(db, "account_transactions", txOut.id), txOut);
      await setDoc(doc(db, "account_transactions", txIn.id), txIn);
    } catch (e) {}

    addAuditLog(
      "UPDATE",
      "Kasa & Banka",
      `${fromAcc.name} hesabından ${toAcc.name} hesabına ${params.amount.toLocaleString("tr-TR")} TL virman yapıldı.`,
      params.amount
    );
  };

  // Expenses & Vendors
  const addExpense = async (expenseData: Omit<ExpenseRecord, "id" | "createdAt" | "createdBy">) => {
    const newId = "exp-" + Date.now();
    const newExp: ExpenseRecord = {
      ...expenseData,
      id: newId,
      createdAt: new Date().toISOString().split("T")[0],
      createdBy: currentUser.name,
    };

    setExpenses((prev) => [newExp, ...prev]);

    if (newExp.paymentStatus === "ODENDI" && newExp.paidFromAccountId) {
      const acc = accounts.find((a) => a.id === newExp.paidFromAccountId);
      if (acc) {
        const newBal = acc.balance - newExp.amount;
        setAccounts((prev) =>
          prev.map((a) => (a.id === acc.id ? { ...a, balance: newBal } : a))
        );
        updateDoc(doc(db, "accounts", acc.id), { balance: newBal }).catch(() => {});
      }
    }

    try {
      await setDoc(doc(db, "expenses", newId), newExp);
    } catch (e) {}

    addAuditLog(
      "CREATE",
      "Gelir & Gider",
      `${newExp.category} kategorisinde ${newExp.amount.toLocaleString("tr-TR")} TL gider kaydı yapıldı: ${newExp.title}`,
      -newExp.amount
    );
  };

  const addVendor = async (vendorData: Omit<Vendor, "id" | "currentBalance">) => {
    const newId = "ven-" + Date.now();
    const newVendor: Vendor = {
      ...vendorData,
      id: newId,
      currentBalance: 0,
    };
    setVendors((prev) => [...prev, newVendor]);
    try {
      await setDoc(doc(db, "vendors", newId), newVendor);
    } catch (e) {}
    addAuditLog("CREATE", "Tedarikçi Carileri", `Yeni tedarikçi kaydedildi: ${newVendor.companyName}`);
  };

  const recordVendorPayment = async (vendorId: string, amount: number, accountId: string, description: string) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    const acc = accounts.find((a) => a.id === accountId);
    if (!vendor || !acc) return;

    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, currentBalance: v.currentBalance - amount } : v))
    );

    const newBal = acc.balance - amount;
    setAccounts((prev) =>
      prev.map((a) => (a.id === acc.id ? { ...a, balance: newBal } : a))
    );

    try {
      await updateDoc(doc(db, "vendors", vendorId), { currentBalance: vendor.currentBalance - amount });
      await updateDoc(doc(db, "accounts", acc.id), { balance: newBal });
    } catch (e) {}

    addAuditLog(
      "UPDATE",
      "Tedarikçi Carileri",
      `${vendor.companyName} firmasına ${amount.toLocaleString("tr-TR")} TL ödeme yapıldı.`,
      -amount
    );
  };

  const updateBudgetItem = async (itemId: string, updates: Partial<AnnualBudget["items"][0]>) => {
    const updatedItems = budget.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i));
    const newBudget = { ...budget, items: updatedItems };
    setBudget(newBudget);
    try {
      await setDoc(doc(db, "budget", budget.id), newBudget);
    } catch (e) {}
  };

  // Requests / Tickets
  const createServiceRequest = async (data: {
    unitId: string;
    category: ServiceRequest["category"];
    title: string;
    description: string;
    priority: RequestPriority;
    photoUrl?: string;
  }) => {
    const unit = units.find((u) => u.id === data.unitId);
    const occupant = unit?.tenantId
      ? people.find((p) => p.id === unit.tenantId)
      : people.find((p) => p.id === unit?.ownerId);

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newReqId = "req-" + Date.now();
    const newReq: ServiceRequest = {
      id: newReqId,
      siteId: activeSiteId,
      unitId: data.unitId,
      unitName: unit ? `${unit.blockName} D:${unit.unitNumber}` : "Daire",
      reportedById: occupant?.id || "unknown",
      reportedByName: occupant?.fullName || currentUser.name,
      reportedByPhone: occupant?.phone || currentUser.phone || "05XX",
      category: data.category,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: "YENI",
      createdAt: ts,
      updatedAt: ts,
      photoUrl: data.photoUrl,
    };

    setRequests((prev) => [newReq, ...prev]);
    try {
      await setDoc(doc(db, "requests", newReqId), newReq);
    } catch (e) {}
    addAuditLog("CREATE", "Arıza & Talep", `Yeni talep oluşturuldu: ${newReq.title} (${newReq.unitName})`);
  };

  const updateRequestStatus = async (requestId: string, status: RequestStatus, adminNote?: string, assignedStaffName?: string) => {
    const completedAt = status === "TAMAMLANDI" ? new Date().toISOString().split("T")[0] : undefined;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              adminNote: adminNote || r.adminNote,
              assignedStaffName: assignedStaffName || r.assignedStaffName,
              completedAt: completedAt || r.completedAt,
            }
          : r
      )
    );
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status,
        ...(adminNote ? { adminNote } : {}),
        ...(assignedStaffName ? { assignedStaffName } : {}),
        ...(completedAt ? { completedAt } : {})
      });
    } catch (e) {}
    addAuditLog("UPDATE", "Arıza & Talep", `Talep durumu güncellendi: ${status} (ID: ${requestId})`);
  };

  // Announcements
  const addAnnouncement = async (data: Omit<Announcement, "id" | "date" | "authorName">) => {
    const newId = "ann-" + Date.now();
    const newAnn: Announcement = {
      ...data,
      id: newId,
      siteId: activeSiteId,
      date: new Date().toISOString().split("T")[0],
      authorName: currentUser.name,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    try {
      await setDoc(doc(db, "announcements", newId), newAnn);
    } catch (e) {}
    addAuditLog("CREATE", "Duyurular", `Yeni duyuru yayınlandı: ${newAnn.title}`);
  };

  // Polls
  const votePoll = async (pollId: string, optionId: string) => {
    let updatedPoll: Poll | null = null;
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id === pollId) {
          updatedPoll = {
            ...p,
            totalVotes: p.totalVotes + 1,
            options: p.options.map((opt) =>
              opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            ),
          };
          return updatedPoll;
        }
        return p;
      })
    );
    if (updatedPoll) {
      try {
        await setDoc(doc(db, "polls", pollId), updatedPoll);
      } catch (e) {}
    }
  };

  // Security Gate
  const addVisitorLog = async (data: Omit<VisitorLog, "id" | "entryTime" | "guardName">) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const ts = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newId = "vis-" + Date.now();
    const newVis: VisitorLog = {
      ...data,
      id: newId,
      entryTime: `${new Date().toLocaleDateString("tr-TR")} ${ts}`,
      guardName: currentUser.name,
    };
    setVisitors((prev) => [newVis, ...prev]);
    try {
      await setDoc(doc(db, "visitors", newId), newVis);
    } catch (e) {}
    addAuditLog("CREATE", "Güvenlik Kapısı", `Ziyaretçi girişi kaydedildi: ${newVis.visitorName} -> ${newVis.unitName}`);
  };

  const markVisitorExit = async (visitorId: string) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const ts = `${new Date().toLocaleDateString("tr-TR")} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setVisitors((prev) =>
      prev.map((v) => (v.id === visitorId ? { ...v, exitTime: ts } : v))
    );
    try {
      await updateDoc(doc(db, "visitors", visitorId), { exitTime: ts });
    } catch (e) {}
  };

  const addParcelLog = async (data: Omit<ParcelLog, "id" | "receivedTime" | "guardName" | "status">) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const ts = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newId = "par-" + Date.now();
    const newPar: ParcelLog = {
      ...data,
      id: newId,
      receivedTime: `${new Date().toLocaleDateString("tr-TR")} ${ts}`,
      guardName: currentUser.name,
      status: "BEKLIYOR",
    };
    setParcels((prev) => [newPar, ...prev]);
    try {
      await setDoc(doc(db, "parcels", newId), newPar);
    } catch (e) {}
    addAuditLog("CREATE", "Kargo Takibi", `Yeni kargo teslim alındı: ${newPar.cargoCompany} -> ${newPar.recipientName} (${newPar.unitName})`);
  };

  const updateParcelStatus = async (parcelId: string, status: ParcelLog["status"]) => {
    const deliveredTime = status === "TESLIM_EDILDI" ? new Date().toLocaleDateString("tr-TR") : undefined;
    setParcels((prev) =>
      prev.map((p) =>
        p.id === parcelId
          ? {
              ...p,
              status,
              deliveredTime: deliveredTime || p.deliveredTime,
            }
          : p
      )
    );
    try {
      await updateDoc(doc(db, "parcels", parcelId), {
        status,
        ...(deliveredTime ? { deliveredTime } : {})
      });
    } catch (e) {}
    addAuditLog("UPDATE", "Kargo Takibi", `Kargo teslim durumu güncellendi: ${status} (ID: ${parcelId})`);
  };

  // Meters
  const addMeterReading = async (reading: Omit<MeterReading, "id" | "consumption" | "totalAmount" | "isBilled">) => {
    const consumption = Math.max(0, reading.currentIndex - reading.previousIndex);
    const totalAmount = consumption * reading.unitPrice;

    const newId = "mtr-" + Date.now();
    const newMeter: MeterReading = {
      ...reading,
      id: newId,
      consumption,
      totalAmount,
      isBilled: false,
    };
    setMeters((prev) => [newMeter, ...prev]);
    try {
      await setDoc(doc(db, "meters", newId), newMeter);
    } catch (e) {}
    addAuditLog("CREATE", "Sayaç Okuma", `${newMeter.unitName} için ${newMeter.meterType} endeksi girildi: Tüketim ${consumption}`);
  };

  // WhatsApp Automation & Logs
  const activeSiteWhatsAppLogs = whatsappLogs.filter((l) => l.siteId === activeSiteId);

  const updateWhatsAppConfig = (updates: Partial<WhatsAppConfig>) => {
    setWhatsappConfig((prev) => ({ ...prev, ...updates, siteId: activeSiteId }));
    addAuditLog("UPDATE", "WhatsApp Otomasyon", "WhatsApp bildirim şablonu ve zamanlama ayarları güncellendi.");
  };

  const logWhatsAppMessage = (
    entry: Omit<WhatsAppLogEntry, "id" | "siteId" | "timestamp" | "httpCode" | "status">
  ): WhatsAppLogEntry => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newLog: WhatsAppLogEntry = {
      ...entry,
      id: "walog-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      siteId: activeSiteId,
      timestamp: ts,
      status: "BASARILI",
      httpCode: 200,
    };

    setWhatsappLogs((prev) => [newLog, ...prev]);
    addAuditLog(
      "SYSTEM",
      "WhatsApp Bildirim",
      `${newLog.recipientName} (${newLog.unitName}) kişisine WhatsApp bildirimi iletildi [200 OK].`,
      newLog.amount
    );
    return newLog;
  };

  const sendBulkWhatsAppReminders = (): number => {
    const debtors = activeSiteUnits.filter((u) => u.currentBalance > 0);
    if (debtors.length === 0) return 0;

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const currentPeriod = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

    const newEntries: WhatsAppLogEntry[] = debtors.map((u, idx) => {
      const occupant = u.tenantId
        ? people.find((p) => p.id === u.tenantId)
        : people.find((p) => p.id === u.ownerId);
      const recipientName = occupant?.fullName || "Daire Sakini";
      const phone = occupant?.phone || "0500 000 00 00";
      const unitLabel = `${u.blockName} D:${u.unitNumber}`;

      const renderedMsg = whatsappConfig.messageTemplate
        .replace(/\{ad_soyad\}/g, recipientName)
        .replace(/\{daire_no\}/g, unitLabel)
        .replace(/\{borc\}/g, u.currentBalance.toLocaleString("tr-TR"))
        .replace(/\{donem\}/g, currentPeriod)
        .replace(/\{site_adi\}/g, activeSite.name)
        .replace(/\{son_odeme_tarihi\}/g, `Her ayın ${activeSite.monthlyDuesDueDay}. günü`)
        .replace(/\{iban\}/g, activeSite.bankIban || "");

      return {
        id: `walog-bulk-${Date.now()}-${idx}`,
        siteId: activeSiteId,
        timestamp: ts,
        type: "AIDAT_HATIRLATMA",
        unitId: u.id,
        unitName: unitLabel,
        recipientName,
        phone,
        period: currentPeriod,
        amount: u.currentBalance,
        messagePreview: renderedMsg,
        status: "BASARILI",
        httpCode: 200,
      };
    });

    setWhatsappLogs((prev) => [...newEntries, ...prev]);
    addAuditLog(
      "SYSTEM",
      "WhatsApp Otomasyon",
      `${newEntries.length} borçlu daireye toplu WhatsApp aidat hatırlatma mesajı gönderildi.`
    );
    return newEntries.length;
  };

  // Reset to live initial seeds
  const resetDemoData = () => {
    INITIAL_SITES.forEach(s => setDoc(doc(db, "sites", s.id), s).catch(() => {}));
    INITIAL_UNITS.forEach(u => setDoc(doc(db, "units", u.id), u).catch(() => {}));
    INITIAL_PEOPLE.forEach(p => setDoc(doc(db, "people", p.id), p).catch(() => {}));
    INITIAL_ACCOUNTS.forEach(a => setDoc(doc(db, "accounts", a.id), a).catch(() => {}));
  };

  const resetToDefaults = resetDemoData;

  return (
    <AppContext.Provider
      value={{
        company,
        sites,
        activeSiteId,
        activeSite,
        setActiveSiteId,
        addNewSite,
        addSite,
        updateSite,
        blocks,
        addBlock,
        deleteBlock,
        units,
        activeSiteUnits,
        addUnit,
        updateUnit,
        deleteUnit,
        bulkImportUnitsAndPeople,
        people,
        activeSitePeople,
        addPerson,
        updatePerson,
        assignTenantToUnit,
        vacateTenantFromUnit,
        tahakkuklar,
        activeSiteTahakkuklar,
        createBatchTahakkuk,
        cancelTahakkuk,
        collections,
        activeSiteCollections,
        addCollection,
        ledgerItems,
        getUnitLedger,
        accounts,
        activeSiteAccounts,
        accountTransactions,
        activeSiteAccountTransactions,
        addAccount,
        transferFunds,
        expenses,
        activeSiteExpenses,
        addExpense,
        vendors,
        activeSiteVendors,
        addVendor,
        recordVendorPayment,
        budget,
        updateBudgetItem,
        requests,
        activeSiteRequests,
        createServiceRequest,
        updateRequestStatus,
        announcements,
        activeSiteAnnouncements,
        addAnnouncement,
        polls,
        activeSitePolls,
        votePoll,
        meetings,
        activeSiteMeetings,
        documents,
        activeSiteDocuments,
        assets,
        activeSiteAssets,
        staff,
        activeSiteStaff,
        visitors,
        activeSiteVisitors,
        addVisitorLog,
        markVisitorExit,
        parcels,
        activeSiteParcels,
        addParcelLog,
        updateParcelStatus,
        meters,
        activeSiteMeters,
        addMeterReading,
        auditLogs,
        activeSiteAuditLogs,
        addAuditLog,
        whatsappConfig,
        updateWhatsAppConfig,
        whatsappLogs,
        activeSiteWhatsAppLogs,
        logWhatsAppMessage,
        sendBulkWhatsAppReminders,
        resetDemoData,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

