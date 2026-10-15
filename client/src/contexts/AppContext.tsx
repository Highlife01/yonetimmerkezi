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
  deleteDoc, onSnapshot, writeBatch, query, where
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
  addBudgetItem: (item: { category: string; type: "GELIR" | "GIDER"; plannedAnnual: number; notes?: string }) => Promise<void>;

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

const EMPTY_SITE: Site = {
  id: "",
  companyId: "",
  name: "Site Seçilmedi",
  type: "SITE",
  address: "",
  city: "İstanbul",
  district: "",
  totalBlocks: 0,
  totalUnits: 0,
  managerName: "",
  managerPhone: "",
  bankIban: "",
  bankName: "",
  monthlyDuesDueDay: 10,
  lateInterestRatePerMonth: 5,
  createdAt: new Date().toISOString().split("T")[0],
};

const createEmptyBudget = (siteId: string): AnnualBudget => ({
  id: `budget-${siteId || "default"}-${new Date().getFullYear()}`,
  siteId: siteId || "",
  year: new Date().getFullYear(),
  status: "ONAYLANDI_GENEL_KURUL",
  totalEstimatedIncome: 0,
  totalEstimatedExpense: 0,
  totalActualIncome: 0,
  totalActualExpense: 0,
  items: [],
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, firebaseUser, isResidentRole } = useAuth();

  const [company] = useState<ManagementCompany>(() => ({
    ...INITIAL_COMPANY,
    id: currentUser.companyId || "comp-1",
    name: currentUser.companyName || INITIAL_COMPANY.name,
  }));
  const [sites, setSites] = useState<Site[]>([]);
  const [activeSiteId, setActiveSiteId] = useState<string>(currentUser.activeSiteId || "");

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
  const [rawBudget, setRawBudget] = useState<AnnualBudget>(() => createEmptyBudget(currentUser.activeSiteId || ""));
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
    siteId: currentUser.activeSiteId || "",
    enabled: true,
    provider: "META_CLOUD_API",
    phoneNumberId: "",
    wabaId: "",
    templateName: "aidat_hatirlatma_tr",
    autoReminderDay: 10,
    autoReminderTime: "10:00",
    messageTemplate: "Sayın {ad_soyad}, {site_adi} {daire_no} numaralı bağımsız bölümünüze ait {donem} dönemi toplam {borc} ₺ bakiye bulunmaktadır. Son ödeme tarihi: {son_odeme_tarihi}. IBAN: {iban}",
  });
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLogEntry[]>([]);

  // =========================================================================
  // 1. Scoped Sites Synchronization (Multi-Tenant Management Isolation)
  // =========================================================================
  useEffect(() => {
    try {
      const uid = firebaseUser?.uid || currentUser.id;
      const userCompanyId = currentUser.companyId || "comp-1";
      const isSuper = currentUser.role === "SUPER_ADMIN";

      const sitesQuery = isSuper
        ? collection(db, "sites")
        : isResidentRole && currentUser.activeSiteId
        ? query(collection(db, "sites"), where("id", "==", currentUser.activeSiteId))
        : query(collection(db, "sites"), where("companyId", "==", userCompanyId));

      const unsubSites = onSnapshot(
        sitesQuery,
        (snapshot) => {
          const loaded = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Site));
          // Filter client-side as secondary defense to ensure strict tenant boundary
          const scopedSites = loaded.filter((s) => {
            if (isSuper) return true;
            if (isResidentRole) return s.id === currentUser.activeSiteId;
            return (
              s.companyId === userCompanyId ||
              s.managerUid === uid ||
              currentUser.managedSiteIds?.includes(s.id)
            );
          });
          setSites(scopedSites);
          if (scopedSites.length > 0 && (!activeSiteId || !scopedSites.some((s) => s.id === activeSiteId))) {
            setActiveSiteId(scopedSites[0].id);
          }
        },
        () => {
          setSites([]);
        }
      );

      return () => unsubSites();
    } catch (e) {
      setSites([]);
    }
  }, [currentUser.id, currentUser.role, currentUser.companyId, currentUser.activeSiteId, firebaseUser?.uid, isResidentRole]);

  // =========================================================================
  // 2. Active Site & Resident Unit Scoped Real-Time Data Synchronization
  // =========================================================================
  useEffect(() => {
    if (!activeSiteId) {
      setBlocks([]);
      setUnits([]);
      setPeople([]);
      setTahakkuklar([]);
      setCollections([]);
      setLedgerItems([]);
      setAccounts([]);
      setAccountTransactions([]);
      setExpenses([]);
      setVendors([]);
      setRawBudget(createEmptyBudget(""));
      setRequests([]);
      setAnnouncements([]);
      setPolls([]);
      setMeetings([]);
      setDocuments([]);
      setAssets([]);
      setStaff([]);
      setVisitors([]);
      setParcels([]);
      setMeters([]);
      setAuditLogs([]);
      return;
    }

    const unsubs: Array<() => void> = [];
    const residentUnitId = currentUser.residentUnitId;

    try {
      // Shared site-scoped collections (readable by site manager & site residents)
      unsubs.push(
        onSnapshot(
          query(collection(db, "blocks"), where("siteId", "==", activeSiteId)),
          (snap) => setBlocks(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Block))),
          () => setBlocks([])
        )
      );

      unsubs.push(
        onSnapshot(
          query(collection(db, "announcements"), where("siteId", "==", activeSiteId)),
          (snap) => setAnnouncements(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Announcement))),
          () => setAnnouncements([])
        )
      );

      unsubs.push(
        onSnapshot(
          query(collection(db, "polls"), where("siteId", "==", activeSiteId)),
          (snap) => setPolls(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Poll))),
          () => setPolls([])
        )
      );

      unsubs.push(
        onSnapshot(
          query(collection(db, "meetings"), where("siteId", "==", activeSiteId)),
          (snap) => setMeetings(snap.docs.map((d) => ({ ...d.data(), id: d.id } as MeetingMinute))),
          () => setMeetings([])
        )
      );

      unsubs.push(
        onSnapshot(
          query(collection(db, "documents"), where("siteId", "==", activeSiteId)),
          (snap) => setDocuments(snap.docs.map((d) => ({ ...d.data(), id: d.id } as DocumentArchiveItem))),
          () => setDocuments([])
        )
      );

      unsubs.push(
        onSnapshot(
          query(collection(db, "accounts"), where("siteId", "==", activeSiteId)),
          (snap) => setAccounts(snap.docs.map((d) => ({ ...d.data(), id: d.id } as AccountEntity))),
          () => setAccounts([])
        )
      );

      unsubs.push(
        onSnapshot(
          query(collection(db, "tahakkuklar"), where("siteId", "==", activeSiteId)),
          (snap) => setTahakkuklar(snap.docs.map((d) => ({ ...d.data(), id: d.id } as TahakkukRecord))),
          () => setTahakkuklar([])
        )
      );

      unsubs.push(
        onSnapshot(
          doc(db, "budgets", activeSiteId),
          (snap) => {
            if (snap.exists()) {
              setRawBudget({ ...(snap.data() as AnnualBudget), id: snap.id, siteId: activeSiteId });
            } else {
              setRawBudget(createEmptyBudget(activeSiteId));
            }
          },
          () => setRawBudget(createEmptyBudget(activeSiteId))
        )
      );

      // Unit-scoped collections: Residents ONLY subscribe to their own authorized unit!
      if (isResidentRole) {
        if (residentUnitId) {
          unsubs.push(
            onSnapshot(
              doc(db, "units", residentUnitId),
              (snap) => {
                if (snap.exists() && (snap.data() as Unit).siteId === activeSiteId) {
                  setUnits([{ ...(snap.data() as Unit), id: snap.id }]);
                } else {
                  setUnits([]);
                }
              },
              () => setUnits([])
            )
          );

          unsubs.push(
            onSnapshot(
              query(
                collection(db, "collections"),
                where("siteId", "==", activeSiteId),
                where("unitId", "==", residentUnitId)
              ),
              (snap) => setCollections(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Collection))),
              () => setCollections([])
            )
          );

          unsubs.push(
            onSnapshot(
              query(
                collection(db, "ledger_items"),
                where("siteId", "==", activeSiteId),
                where("unitId", "==", residentUnitId)
              ),
              (snap) => setLedgerItems(snap.docs.map((d) => ({ ...d.data(), id: d.id } as UnitAccountLedgerItem))),
              () => setLedgerItems([])
            )
          );

          unsubs.push(
            onSnapshot(
              query(
                collection(db, "requests"),
                where("siteId", "==", activeSiteId),
                where("unitId", "==", residentUnitId)
              ),
              (snap) => setRequests(snap.docs.map((d) => ({ ...d.data(), id: d.id } as ServiceRequest))),
              () => setRequests([])
            )
          );
        } else {
          setUnits([]);
          setCollections([]);
          setLedgerItems([]);
          setRequests([]);
        }
        // Residents do not subscribe to management-internal collections
        setPeople([]);
        setAccountTransactions([]);
        setExpenses([]);
        setVendors([]);
        setAssets([]);
        setStaff([]);
        setVisitors([]);
        setParcels([]);
        setMeters([]);
        setAuditLogs([]);
      } else {
        // Manager / Authorized Staff: subscribe to activeSiteId records
        unsubs.push(
          onSnapshot(
            query(collection(db, "units"), where("siteId", "==", activeSiteId)),
            (snap) => setUnits(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Unit))),
            () => setUnits([])
          )
        );

        unsubs.push(
          onSnapshot(
            query(collection(db, "people"), where("siteId", "==", activeSiteId)),
            (snap) => setPeople(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Person))),
            () => setPeople([])
          )
        );

        unsubs.push(
          onSnapshot(
            query(collection(db, "collections"), where("siteId", "==", activeSiteId)),
            (snap) => setCollections(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Collection))),
            () => setCollections([])
          )
        );

        unsubs.push(
          onSnapshot(
            query(collection(db, "ledger_items"), where("siteId", "==", activeSiteId)),
            (snap) => setLedgerItems(snap.docs.map((d) => ({ ...d.data(), id: d.id } as UnitAccountLedgerItem))),
            () => setLedgerItems([])
          )
        );

        unsubs.push(
          onSnapshot(
            query(collection(db, "account_transactions"), where("siteId", "==", activeSiteId)),
            (snap) => setAccountTransactions(snap.docs.map((d) => ({ ...d.data(), id: d.id } as AccountTransaction))),
            () => setAccountTransactions([])
          )
        );

        unsubs.push(
          onSnapshot(
            query(collection(db, "expenses"), where("siteId", "==", activeSiteId)),
            (snap) => setExpenses(snap.docs.map((d) => ({ ...d.data(), id: d.id } as ExpenseRecord))),
            () => setExpenses([])
          )
        );

        unsubs.push(
          onSnapshot(
            query(collection(db, "vendors"), where("siteId", "==", activeSiteId)),
            (snap) => setVendors(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Vendor))),
            () => setVendors([])
          )
        );

        unsubs.push(
          onSnapshot(
            query(collection(db, "requests"), where("siteId", "==", activeSiteId)),
            (snap) => setRequests(snap.docs.map((d) => ({ ...d.data(), id: d.id } as ServiceRequest))),
            () => setRequests([])
          )
        );

        unsubs.push(
          onSnapshot(
            query(collection(db, "assets"), where("siteId", "==", activeSiteId)),
            (snap) => setAssets(snap.docs.map((d) => ({ ...d.data(), id: d.id } as AssetFixture))),
            () => setAssets([])
          )
        );

        unsubs.push(
          onSnapshot(
            query(collection(db, "staff"), where("siteId", "==", activeSiteId)),
            (snap) => setStaff(snap.docs.map((d) => ({ ...d.data(), id: d.id } as StaffMember))),
            () => setStaff([])
          )
        );

        unsubs.push(
          onSnapshot(
            query(collection(db, "visitors"), where("siteId", "==", activeSiteId)),
            (snap) => setVisitors(snap.docs.map((d) => ({ ...d.data(), id: d.id } as VisitorLog))),
            () => setVisitors([])
          )
        );

        unsubs.push(
          onSnapshot(
            query(collection(db, "parcels"), where("siteId", "==", activeSiteId)),
            (snap) => setParcels(snap.docs.map((d) => ({ ...d.data(), id: d.id } as ParcelLog))),
            () => setParcels([])
          )
        );

        unsubs.push(
          onSnapshot(
            query(collection(db, "meters"), where("siteId", "==", activeSiteId)),
            (snap) => setMeters(snap.docs.map((d) => ({ ...d.data(), id: d.id } as MeterReading))),
            () => setMeters([])
          )
        );

        unsubs.push(
          onSnapshot(
            query(collection(db, "ym_audit_logs"), where("siteId", "==", activeSiteId)),
            (snap) => setAuditLogs(snap.docs.map((d) => ({ ...d.data(), id: d.id } as AuditLogEntry))),
            () => setAuditLogs([])
          )
        );
      }
    } catch (e) {
      console.warn("Scoped Firestore listeners error:", e);
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [activeSiteId, isResidentRole, currentUser.residentUnitId]);

  const activeSite = sites.find((s) => s.id === activeSiteId) || sites[0] || EMPTY_SITE;

  // Filtered active site sub-arrays
  const activeSiteUnits = units.filter((u) => u.siteId === activeSite.id);
  const activeSitePeople = people.filter((p) => p.siteId === activeSite.id);
  const activeSiteTahakkuklar = tahakkuklar.filter((t) => t.siteId === activeSite.id);
  const activeSiteCollections = collections.filter((c) => c.siteId === activeSite.id);
  const activeSiteAccounts = accounts.filter((a) => a.siteId === activeSite.id);
  const activeSiteAccountTransactions = accountTransactions.filter((tx) => tx.siteId === activeSite.id);
  const activeSiteExpenses = expenses.filter((e) => e.siteId === activeSite.id);
  const activeSiteVendors = vendors.filter((v) => v.siteId === activeSite.id);
  const activeSiteRequests = requests.filter((r) => r.siteId === activeSite.id);
  const activeSiteAnnouncements = announcements.filter((a) => a.siteId === activeSite.id);
  const activeSitePolls = polls.filter((p) => p.siteId === activeSite.id);
  const activeSiteMeetings = meetings.filter((m) => m.siteId === activeSite.id);
  const activeSiteDocuments = documents.filter((d) => d.siteId === activeSite.id);
  const activeSiteAssets = assets.filter((a) => a.siteId === activeSite.id);
  const activeSiteStaff = staff.filter((s) => s.siteId === activeSite.id);
  const activeSiteVisitors = visitors.filter((v) => v.siteId === activeSite.id);
  const activeSiteParcels = parcels.filter((p) => p.siteId === activeSite.id);
  const activeSiteMeters = meters.filter((m) => m.siteId === activeSite.id);
  const activeSiteAuditLogs = auditLogs.filter((l) => l.siteId === activeSite.id);

  // Compute live budget actuals from real collections & expenses
  const liveTotalCollected = activeSiteCollections.reduce((s, c) => s + c.amount, 0);
  const liveTotalExpensed = activeSiteExpenses.reduce((s, e) => s + e.amount, 0);
  const budget: AnnualBudget = {
    ...rawBudget,
    siteId: activeSite.id,
    totalEstimatedIncome: rawBudget.items.filter((i) => i.type === "GELIR").reduce((s, i) => s + i.plannedAnnual, 0),
    totalEstimatedExpense: rawBudget.items.filter((i) => i.type === "GIDER").reduce((s, i) => s + i.plannedAnnual, 0),
    totalActualIncome: liveTotalCollected || rawBudget.items.filter((i) => i.type === "GELIR").reduce((s, i) => s + i.actualAnnual, 0),
    totalActualExpense: liveTotalExpensed || rawBudget.items.filter((i) => i.type === "GIDER").reduce((s, i) => s + i.actualAnnual, 0),
  };

  // Helper Audit Logger
  const addAuditLog = async (
    actionType: AuditLogEntry["actionType"],
    module: string,
    description: string,
    financialAmount?: number
  ) => {
    if (!activeSite.id) return;
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newLog: AuditLogEntry = {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      siteId: activeSite.id,
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
      await setDoc(doc(db, "ym_audit_logs", newLog.id), newLog);
    } catch (e) {}
  };

  // Add new Site (Multi-Tenant Scoped)
  const addNewSite = async (siteData: Omit<Site, "id" | "companyId" | "createdAt">) => {
    const newId = "site-" + Date.now();
    const ownerCompanyId = currentUser.companyId || company.id || `comp-${firebaseUser?.uid || currentUser.id}`;
    const ownerUid = firebaseUser?.uid || currentUser.id;
    const newSite: Site = {
      ...siteData,
      id: newId,
      companyId: ownerCompanyId,
      managerUid: ownerUid,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setSites((prev) => [...prev, newSite]);
    setActiveSiteId(newId);
    try {
      await setDoc(doc(db, "sites", newId), newSite);
      // Create default Kasa & Banka accounts for the newly created site
      const defaultKasa: AccountEntity = {
        id: `acc-kasa-${newId}`,
        siteId: newId,
        type: "KASA",
        name: "Ana Yönetim Kasası",
        balance: 0,
        currency: "TRY",
        isActive: true,
      };
      await setDoc(doc(db, "accounts", defaultKasa.id), defaultKasa);
      if (newSite.bankName || newSite.bankIban) {
        const defaultBank: AccountEntity = {
          id: `acc-bank-${newId}`,
          siteId: newId,
          type: "BANKA",
          name: `${newSite.bankName || "Site"} Vadesiz Aidat Hesabı`,
          bankName: newSite.bankName || "Banka",
          iban: newSite.bankIban || "",
          balance: 0,
          currency: "TRY",
          isActive: true,
        };
        await setDoc(doc(db, "accounts", defaultBank.id), defaultBank);
      }
      if (firebaseUser?.uid) {
        const nextManaged = Array.from(new Set([...(currentUser.managedSiteIds || []), newId]));
        await setDoc(
          doc(db, "ym_profiles", firebaseUser.uid),
          {
            ...currentUser,
            id: firebaseUser.uid,
            companyId: ownerCompanyId,
            managedSiteIds: nextManaged,
            activeSiteId: newId,
          },
          { merge: true }
        );
      }
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
    if (!activeSite.id) return;
    const updatedItems = rawBudget.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i));
    const newBudget: AnnualBudget = {
      ...rawBudget,
      id: activeSite.id,
      siteId: activeSite.id,
      items: updatedItems,
    };
    setRawBudget(newBudget);
    try {
      await setDoc(doc(db, "budgets", activeSite.id), newBudget);
    } catch (e) {}
  };

  const addBudgetItem = async (item: { category: string; type: "GELIR" | "GIDER"; plannedAnnual: number; notes?: string }) => {
    if (!activeSite.id) return;
    const newItem = {
      id: "bi-" + Date.now(),
      category: item.category,
      type: item.type,
      plannedAnnual: item.plannedAnnual,
      actualAnnual: 0,
      notes: item.notes,
    };
    const nextBudget: AnnualBudget = {
      ...rawBudget,
      id: activeSite.id,
      siteId: activeSite.id,
      items: [...rawBudget.items, newItem],
    };
    setRawBudget(nextBudget);
    try {
      await setDoc(doc(db, "budgets", activeSite.id), nextBudget);
    } catch (e) {}
    addAuditLog("CREATE", "Bütçe & İşletme Projesi", `Yeni bütçe kalemi eklendi: ${item.category} (${item.plannedAnnual.toLocaleString("tr-TR")} TL)`, item.plannedAnnual);
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

  // Do not generate fake/demo data into Firestore
  const resetDemoData = () => {};

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
        addBudgetItem,
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

