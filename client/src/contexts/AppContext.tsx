import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Site, Block, Unit, Person, TahakkukRecord,
  UnitAccountLedgerItem, Collection, AccountEntity,
  AccountTransaction, ExpenseRecord, Vendor, AnnualBudget,
  ServiceRequest, Announcement, Poll, MeetingMinute,
  DocumentArchiveItem, AssetFixture, StaffMember, VisitorLog,
  ParcelLog, MeterReading, AuditLogEntry, ManagementCompany,
  PaymentMethod, DuesCategory, DistributionMethod, RequestStatus, RequestPriority
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
import { useAuth } from "./AuthContext";

interface AppContextType {
  // Company & Sites
  company: ManagementCompany;
  sites: Site[];
  activeSiteId: string;
  activeSite: Site;
  setActiveSiteId: (siteId: string) => void;
  addNewSite: (siteData: Omit<Site, "id" | "companyId" | "createdAt">) => void;

  // Blocks & Units
  blocks: Block[];
  units: Unit[];
  activeSiteUnits: Unit[];
  addUnit: (unitData: Omit<Unit, "id">) => void;
  updateUnit: (unitId: string, unitData: Partial<Unit>) => void;

  // People
  people: Person[];
  activeSitePeople: Person[];
  addPerson: (personData: Omit<Person, "id">) => void;
  updatePerson: (personId: string, personData: Partial<Person>) => void;
  assignTenantToUnit: (unitId: string, tenantId: string) => void;
  vacateTenantFromUnit: (unitId: string) => void;

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
  }) => void;
  cancelTahakkuk: (tahakkukId: string, reason?: string) => void;

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
  }) => Collection;

  // Ledger Items
  ledgerItems: UnitAccountLedgerItem[];
  getUnitLedger: (unitId: string) => UnitAccountLedgerItem[];

  // Kasa & Banka Accounts
  accounts: AccountEntity[];
  activeSiteAccounts: AccountEntity[];
  accountTransactions: AccountTransaction[];
  activeSiteAccountTransactions: AccountTransaction[];
  addAccount: (accountData: Omit<AccountEntity, "id" | "balance">) => void;
  transferFunds: (params: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description: string;
  }) => void;

  // Expenses & Vendors
  expenses: ExpenseRecord[];
  activeSiteExpenses: ExpenseRecord[];
  addExpense: (expenseData: Omit<ExpenseRecord, "id" | "createdAt" | "createdBy">) => void;
  vendors: Vendor[];
  activeSiteVendors: Vendor[];
  addVendor: (vendorData: Omit<Vendor, "id" | "currentBalance">) => void;
  recordVendorPayment: (vendorId: string, amount: number, accountId: string, description: string) => void;

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
  }) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus, adminNote?: string, assignedStaffName?: string) => void;

  // Announcements, Polls, Meetings, Documents
  announcements: Announcement[];
  activeSiteAnnouncements: Announcement[];
  addAnnouncement: (data: Omit<Announcement, "id" | "date" | "authorName">) => void;
  polls: Poll[];
  activeSitePolls: Poll[];
  votePoll: (pollId: string, optionId: string) => void;
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
  addVisitorLog: (data: Omit<VisitorLog, "id" | "entryTime" | "guardName">) => void;
  markVisitorExit: (visitorId: string) => void;
  parcels: ParcelLog[];
  activeSiteParcels: ParcelLog[];
  addParcelLog: (data: Omit<ParcelLog, "id" | "receivedTime" | "guardName" | "status">) => void;
  updateParcelStatus: (parcelId: string, status: ParcelLog["status"]) => void;

  // Meters
  meters: MeterReading[];
  activeSiteMeters: MeterReading[];
  addMeterReading: (reading: Omit<MeterReading, "id" | "consumption" | "totalAmount" | "isBilled">) => void;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  activeSiteAuditLogs: AuditLogEntry[];
  addAuditLog: (actionType: AuditLogEntry["actionType"], module: string, description: string, financialAmount?: number) => void;

  // Reset
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();

  const [company] = useState<ManagementCompany>(INITIAL_COMPANY);
  const [sites, setSites] = useState<Site[]>(() => loadFromStorage("ym_sites", INITIAL_SITES));
  const [activeSiteId, setActiveSiteId] = useState<string>(() => loadFromStorage("ym_active_site_id", "site-1"));

  const [blocks, setBlocks] = useState<Block[]>(() => loadFromStorage("ym_blocks", INITIAL_BLOCKS));
  const [units, setUnits] = useState<Unit[]>(() => loadFromStorage("ym_units", INITIAL_UNITS));
  const [people, setPeople] = useState<Person[]>(() => loadFromStorage("ym_people", INITIAL_PEOPLE));
  const [tahakkuklar, setTahakkuklar] = useState<TahakkukRecord[]>(() => loadFromStorage("ym_tahakkuklar", INITIAL_TAHAKKUKLAR));
  const [collections, setCollections] = useState<Collection[]>(() => loadFromStorage("ym_collections", INITIAL_COLLECTIONS));
  const [ledgerItems, setLedgerItems] = useState<UnitAccountLedgerItem[]>(() => loadFromStorage("ym_ledger", INITIAL_LEDGER_ITEMS));
  const [accounts, setAccounts] = useState<AccountEntity[]>(() => loadFromStorage("ym_accounts", INITIAL_ACCOUNTS));
  const [accountTransactions, setAccountTransactions] = useState<AccountTransaction[]>(() => loadFromStorage("ym_account_txs", INITIAL_ACCOUNT_TXS));
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => loadFromStorage("ym_expenses", INITIAL_EXPENSES));
  const [vendors, setVendors] = useState<Vendor[]>(() => loadFromStorage("ym_vendors", INITIAL_VENDORS));
  const [budget, setBudget] = useState<AnnualBudget>(() => loadFromStorage("ym_budget", INITIAL_BUDGET));
  const [requests, setRequests] = useState<ServiceRequest[]>(() => loadFromStorage("ym_requests", INITIAL_REQUESTS));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadFromStorage("ym_announcements", INITIAL_ANNOUNCEMENTS));
  const [polls, setPolls] = useState<Poll[]>(() => loadFromStorage("ym_polls", INITIAL_POLLS));
  const [meetings] = useState<MeetingMinute[]>(() => loadFromStorage("ym_meetings", INITIAL_MEETINGS));
  const [documents] = useState<DocumentArchiveItem[]>(() => loadFromStorage("ym_docs", INITIAL_DOCS));
  const [assets, setAssets] = useState<AssetFixture[]>(() => loadFromStorage("ym_assets", INITIAL_ASSETS));
  const [staff, setStaff] = useState<StaffMember[]>(() => loadFromStorage("ym_staff", INITIAL_STAFF));
  const [visitors, setVisitors] = useState<VisitorLog[]>(() => loadFromStorage("ym_visitors", INITIAL_VISITORS));
  const [parcels, setParcels] = useState<ParcelLog[]>(() => loadFromStorage("ym_parcels", INITIAL_PARCELS));
  const [meters, setMeters] = useState<MeterReading[]>(() => loadFromStorage("ym_meters", INITIAL_METERS));
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => loadFromStorage("ym_audit_logs", INITIAL_AUDIT_LOGS));

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("ym_sites", JSON.stringify(sites));
    localStorage.setItem("ym_active_site_id", JSON.stringify(activeSiteId));
    localStorage.setItem("ym_blocks", JSON.stringify(blocks));
    localStorage.setItem("ym_units", JSON.stringify(units));
    localStorage.setItem("ym_people", JSON.stringify(people));
    localStorage.setItem("ym_tahakkuklar", JSON.stringify(tahakkuklar));
    localStorage.setItem("ym_collections", JSON.stringify(collections));
    localStorage.setItem("ym_ledger", JSON.stringify(ledgerItems));
    localStorage.setItem("ym_accounts", JSON.stringify(accounts));
    localStorage.setItem("ym_account_txs", JSON.stringify(accountTransactions));
    localStorage.setItem("ym_expenses", JSON.stringify(expenses));
    localStorage.setItem("ym_vendors", JSON.stringify(vendors));
    localStorage.setItem("ym_budget", JSON.stringify(budget));
    localStorage.setItem("ym_requests", JSON.stringify(requests));
    localStorage.setItem("ym_announcements", JSON.stringify(announcements));
    localStorage.setItem("ym_polls", JSON.stringify(polls));
    localStorage.setItem("ym_assets", JSON.stringify(assets));
    localStorage.setItem("ym_staff", JSON.stringify(staff));
    localStorage.setItem("ym_visitors", JSON.stringify(visitors));
    localStorage.setItem("ym_parcels", JSON.stringify(parcels));
    localStorage.setItem("ym_meters", JSON.stringify(meters));
    localStorage.setItem("ym_audit_logs", JSON.stringify(auditLogs));
  }, [
    sites, activeSiteId, blocks, units, people, tahakkuklar, collections,
    ledgerItems, accounts, accountTransactions, expenses, vendors, budget,
    requests, announcements, polls, assets, staff, visitors, parcels, meters, auditLogs
  ]);

  const activeSite = sites.find((s) => s.id === activeSiteId) || sites[0] || INITIAL_SITES[0];

  // Helper Audit Logger
  const addAuditLog = (
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
  };

  // Add new Site
  const addNewSite = (siteData: Omit<Site, "id" | "companyId" | "createdAt">) => {
    const newId = "site-" + (sites.length + 1);
    const newSite: Site = {
      ...siteData,
      id: newId,
      companyId: company.id,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setSites((prev) => [...prev, newSite]);
    setActiveSiteId(newId);
    addAuditLog("CREATE", "Site Yönetimi", `Yeni site tanımlandı: ${newSite.name}`);
  };

  // Units CRUD
  const addUnit = (unitData: Omit<Unit, "id">) => {
    const newUnit: Unit = {
      ...unitData,
      id: "unit-" + Date.now(),
    };
    setUnits((prev) => [...prev, newUnit]);
    addAuditLog("CREATE", "Bağımsız Bölümler", `Yeni bağımsız bölüm eklendi: ${newUnit.blockName} No:${newUnit.unitNumber}`);
  };

  const updateUnit = (unitId: string, unitData: Partial<Unit>) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, ...unitData } : u))
    );
    addAuditLog("UPDATE", "Bağımsız Bölümler", `Daire bilgileri güncellendi (ID: ${unitId})`);
  };

  // People CRUD
  const addPerson = (personData: Omit<Person, "id">) => {
    const newPerson: Person = {
      ...personData,
      id: "person-" + Date.now(),
    };
    setPeople((prev) => [...prev, newPerson]);
    addAuditLog("CREATE", "Malik & Kiracılar", `Yeni kişi kaydı açıldı: ${newPerson.fullName} (${newPerson.type})`);
  };

  const updatePerson = (personId: string, personData: Partial<Person>) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === personId ? { ...p, ...personData } : p))
    );
    addAuditLog("UPDATE", "Malik & Kiracılar", `Kişi bilgileri güncellendi: ID ${personId}`);
  };

  const assignTenantToUnit = (unitId: string, tenantId: string) => {
    const unit = units.find((u) => u.id === unitId);
    const tenant = people.find((p) => p.id === tenantId);
    if (!unit || !tenant) return;

    updateUnit(unitId, {
      tenantId,
      residentType: "KIRACI_OTURUYOR",
    });

    updatePerson(tenantId, {
      rentedUnitId: unitId,
    });

    addAuditLog("UPDATE", "Kiracı İşlemleri", `${unit.blockName} D:${unit.unitNumber} dairesine yeni kiracı atandı: ${tenant.fullName}`);
  };

  const vacateTenantFromUnit = (unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    if (!unit) return;

    if (unit.tenantId) {
      const oldTenant = people.find((p) => p.id === unit.tenantId);
      if (oldTenant) {
        updatePerson(oldTenant.id, { rentedUnitId: undefined });
      }
    }

    updateUnit(unitId, {
      tenantId: undefined,
      residentType: "BOS",
    });

    addAuditLog("UPDATE", "Kiracı İşlemleri", `${unit.blockName} D:${unit.unitNumber} dairesi tahliye edildi (boşa çıkarıldı)`);
  };

  // Batch Tahakkuk (Toplu Borçlandırma Sihirbazı)
  const createBatchTahakkuk = (params: {
    title: string;
    period: string;
    category: DuesCategory;
    dueDate: string;
    distributionMethod: DistributionMethod;
    totalAmountOrPerUnit: number;
    targetBlockId?: string;
  }) => {
    const targetUnits = units.filter((u) => {
      if (u.siteId !== activeSiteId) return false;
      if (params.targetBlockId && u.blockId !== params.targetBlockId) return false;
      return true;
    });

    if (targetUnits.length === 0) return;

    let allocations: TahakkukRecord["allocations"] = [];
    let totalTarget = 0;

    if (params.distributionMethod === "EQUAL") {
      const perUnit = params.totalAmountOrPerUnit;
      allocations = targetUnits.map((u) => {
        const owner = people.find((p) => p.id === u.ownerId);
        const occupant = u.tenantId ? people.find((p) => p.id === u.tenantId) : owner;
        return {
          unitId: u.id,
          unitName: `${u.blockName} D:${u.unitNumber}`,
          personId: occupant?.id || u.ownerId,
          personName: occupant?.fullName || "Bilinmiyor",
          amount: perUnit,
          paidAmount: 0,
          isPaid: false,
        };
      });
      totalTarget = perUnit * targetUnits.length;
    } else if (params.distributionMethod === "SQM") {
      const totalSqm = targetUnits.reduce((sum, u) => sum + (u.grossSquareMeters || 100), 0);
      const totalBudget = params.totalAmountOrPerUnit;
      allocations = targetUnits.map((u) => {
        const share = (u.grossSquareMeters || 100) / totalSqm;
        const amount = Math.round(totalBudget * share);
        const occupant = u.tenantId ? people.find((p) => p.id === u.tenantId) : people.find((p) => p.id === u.ownerId);
        return {
          unitId: u.id,
          unitName: `${u.blockName} D:${u.unitNumber}`,
          personId: occupant?.id || u.ownerId,
          personName: occupant?.fullName || "Bilinmiyor",
          amount,
          paidAmount: 0,
          isPaid: false,
        };
      });
      totalTarget = totalBudget;
    } else if (params.distributionMethod === "LAND_SHARE") {
      const totalShare = targetUnits.reduce((sum, u) => sum + (u.shareOfLand || 10), 0);
      const totalBudget = params.totalAmountOrPerUnit;
      allocations = targetUnits.map((u) => {
        const share = (u.shareOfLand || 10) / totalShare;
        const amount = Math.round(totalBudget * share);
        const occupant = u.tenantId ? people.find((p) => p.id === u.tenantId) : people.find((p) => p.id === u.ownerId);
        return {
          unitId: u.id,
          unitName: `${u.blockName} D:${u.unitNumber}`,
          personId: occupant?.id || u.ownerId,
          personName: occupant?.fullName || "Bilinmiyor",
          amount,
          paidAmount: 0,
          isPaid: false,
        };
      });
      totalTarget = totalBudget;
    } else {
      // CUSTOM / TYPE
      const perUnit = params.totalAmountOrPerUnit;
      allocations = targetUnits.map((u) => {
        const occupant = u.tenantId ? people.find((p) => p.id === u.tenantId) : people.find((p) => p.id === u.ownerId);
        return {
          unitId: u.id,
          unitName: `${u.blockName} D:${u.unitNumber}`,
          personId: occupant?.id || u.ownerId,
          personName: occupant?.fullName || "Bilinmiyor",
          amount: perUnit,
          paidAmount: 0,
          isPaid: false,
        };
      });
      totalTarget = perUnit * targetUnits.length;
    }

    const newTahakkuk: TahakkukRecord = {
      id: "tahakkuk-" + Date.now(),
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
          newLedgerRows.push({
            id: "led-" + Date.now() + "-" + u.id,
            siteId: activeSiteId,
            unitId: u.id,
            date: nowStr,
            type: "BORC",
            category: params.category,
            description: `${params.title} (${params.period})`,
            debtAmount: alloc.amount,
            creditAmount: 0,
            balanceAfter: newBal,
            referenceId: newTahakkuk.id,
            processedBy: currentUser.name,
          });
          return { ...u, currentBalance: newBal };
        }
        return u;
      })
    );

    setLedgerItems((prev) => [...newLedgerRows, ...prev]);

    addAuditLog(
      "CREATE",
      "Aidat & Tahakkuk",
      `${params.title} için ${targetUnits.length} daireye toplam ${totalTarget.toLocaleString("tr-TR")} TL borç tahakkuk ettirildi.`,
      totalTarget
    );
  };

  // Cancel Tahakkuk
  const cancelTahakkuk = (tahakkukId: string, reason?: string) => {
    const t = tahakkuklar.find((item) => item.id === tahakkukId);
    if (!t) return;

    setTahakkuklar((prev) =>
      prev.map((item) => (item.id === tahakkukId ? { ...item, status: "CANCELLED" } : item))
    );

    // Rollback allocations from units
    setUnits((prev) =>
      prev.map((u) => {
        const alloc = t.allocations.find((a) => a.unitId === u.id);
        if (alloc) {
          return { ...u, currentBalance: Math.max(0, u.currentBalance - (alloc.amount - alloc.paidAmount)) };
        }
        return u;
      })
    );

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
  }): Collection => {
    const unit = units.find((u) => u.id === params.unitId);
    const targetAcc = accounts.find((a) => a.id === params.targetAccountId);
    const occupant = unit?.tenantId
      ? people.find((p) => p.id === unit.tenantId)
      : people.find((p) => p.id === unit?.ownerId);

    const receiptNumber = `MKB-${new Date().getFullYear()}-${String(collections.length + 843).padStart(5, "0")}`;
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newCol: Collection = {
      id: "col-" + Date.now(),
      siteId: activeSiteId,
      receiptNumber,
      unitId: params.unitId,
      unitName: unit ? `${unit.blockName} · Daire ${unit.unitNumber}` : "Daire",
      personId: occupant?.id || unit?.ownerId || "unknown",
      personName: occupant?.fullName || "Bilinmiyor",
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

    updateUnit(params.unitId, { currentBalance: newBalance });

    const newLedgerItem: UnitAccountLedgerItem = {
      id: "led-" + Date.now(),
      siteId: activeSiteId,
      unitId: params.unitId,
      date: ts.split(" ")[0],
      type: "ALACAK",
      category: "Tahsilat",
      description: `${params.description || "Tahsilat"} (${receiptNumber})`,
      debtAmount: 0,
      creditAmount: params.amount,
      balanceAfter: newBalance,
      referenceId: newCol.id,
      receiptNo: receiptNumber,
      processedBy: currentUser.name,
    };
    setLedgerItems((prev) => [newLedgerItem, ...prev]);

    // Update Target Account Balance & Add Transaction
    if (targetAcc) {
      const newAccBal = targetAcc.balance + params.amount;
      setAccounts((prev) =>
        prev.map((a) => (a.id === targetAcc.id ? { ...a, balance: newAccBal } : a))
      );

      const newTx: AccountTransaction = {
        id: "atx-" + Date.now(),
        siteId: activeSiteId,
        accountId: targetAcc.id,
        accountName: targetAcc.name,
        date: ts,
        type: "GIRIS",
        amount: params.amount,
        category: "Aidat Tahsilatı",
        description: `${newCol.unitName} - ${newCol.personName} Tahsilat (${receiptNumber})`,
        relatedEntityName: newCol.unitName,
        balanceAfter: newAccBal,
        createdBy: currentUser.name,
      };
      setAccountTransactions((prev) => [newTx, ...prev]);
    }

    // Update Tahakkuk paidAmount if linked
    if (params.settledTahakkukId) {
      setTahakkuklar((prev) =>
        prev.map((t) => {
          if (t.id === params.settledTahakkukId) {
            const updatedAllocations = t.allocations.map((a) => {
              if (a.unitId === params.unitId) {
                const paid = a.paidAmount + params.amount;
                return { ...a, paidAmount: paid, isPaid: paid >= a.amount };
              }
              return a;
            });
            return {
              ...t,
              totalCollectedAmount: t.totalCollectedAmount + params.amount,
              allocations: updatedAllocations,
            };
          }
          return t;
        })
      );
    }

    addAuditLog(
      "COLLECT",
      "Tahsilatlar",
      `${newCol.unitName} (${newCol.personName}) ${params.amount.toLocaleString("tr-TR")} TL tahsilat yapıldı. Makbuz: ${receiptNumber}`,
      params.amount
    );

    return newCol;
  };

  // Get specific unit's ledger
  const getUnitLedger = (unitId: string) => {
    return ledgerItems.filter((item) => item.unitId === unitId);
  };

  // Kasa / Banka CRUD
  const addAccount = (accountData: Omit<AccountEntity, "id" | "balance">) => {
    const newAcc: AccountEntity = {
      ...accountData,
      id: "acc-" + Date.now(),
      balance: 0,
    };
    setAccounts((prev) => [...prev, newAcc]);
    addAuditLog("CREATE", "Kasa & Banka", `Yeni hesap eklendi: ${newAcc.name} (${newAcc.type})`);
  };

  const transferFunds = (params: {
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

    addAuditLog(
      "UPDATE",
      "Kasa & Banka",
      `${fromAcc.name} hesabından ${toAcc.name} hesabına ${params.amount.toLocaleString("tr-TR")} TL virman yapıldı.`,
      params.amount
    );
  };

  // Expenses & Vendors
  const addExpense = (expenseData: Omit<ExpenseRecord, "id" | "createdAt" | "createdBy">) => {
    const newExp: ExpenseRecord = {
      ...expenseData,
      id: "exp-" + Date.now(),
      createdAt: new Date().toISOString().split("T")[0],
      createdBy: currentUser.name,
    };

    setExpenses((prev) => [newExp, ...prev]);

    // If marked as paid, deduct from account
    if (newExp.paymentStatus === "ODENDI" && newExp.paidFromAccountId) {
      const acc = accounts.find((a) => a.id === newExp.paidFromAccountId);
      if (acc) {
        const newBal = acc.balance - newExp.amount;
        setAccounts((prev) =>
          prev.map((a) => (a.id === acc.id ? { ...a, balance: newBal } : a))
        );

        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, "0");
        const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

        const tx: AccountTransaction = {
          id: "atx-" + Date.now(),
          siteId: activeSiteId,
          accountId: acc.id,
          accountName: acc.name,
          date: ts,
          type: "CIKIS",
          amount: newExp.amount,
          category: `Gider (${newExp.category})`,
          description: `${newExp.title} - ${newExp.invoiceNumber || ""}`,
          relatedEntityName: newExp.vendorName || "Gider Ödemesi",
          balanceAfter: newBal,
          createdBy: currentUser.name,
        };
        setAccountTransactions((prev) => [tx, ...prev]);
      }
    }

    addAuditLog(
      "CREATE",
      "Gelir & Gider",
      `${newExp.category} kategorisinde ${newExp.amount.toLocaleString("tr-TR")} TL gider kaydı yapıldı: ${newExp.title}`,
      -newExp.amount
    );
  };

  const addVendor = (vendorData: Omit<Vendor, "id" | "currentBalance">) => {
    const newVendor: Vendor = {
      ...vendorData,
      id: "ven-" + Date.now(),
      currentBalance: 0,
    };
    setVendors((prev) => [...prev, newVendor]);
    addAuditLog("CREATE", "Tedarikçi Carileri", `Yeni tedarikçi kaydedildi: ${newVendor.companyName}`);
  };

  const recordVendorPayment = (vendorId: string, amount: number, accountId: string, description: string) => {
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

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const tx: AccountTransaction = {
      id: "atx-" + Date.now(),
      siteId: activeSiteId,
      accountId: acc.id,
      accountName: acc.name,
      date: ts,
      type: "CIKIS",
      amount,
      category: "Tedarikçi Ödemesi",
      description: `${vendor.companyName} Tedarikçi Ödemesi: ${description}`,
      relatedEntityName: vendor.companyName,
      balanceAfter: newBal,
      createdBy: currentUser.name,
    };
    setAccountTransactions((prev) => [tx, ...prev]);

    addAuditLog(
      "UPDATE",
      "Tedarikçi Carileri",
      `${vendor.companyName} firmasına ${amount.toLocaleString("tr-TR")} TL ödeme yapıldı (${acc.name}).`,
      -amount
    );
  };

  // Budget
  const updateBudgetItem = (itemId: string, updates: Partial<AnnualBudget["items"][0]>) => {
    setBudget((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === itemId ? { ...it, ...updates } : it)),
    }));
  };

  // Requests / Tickets
  const createServiceRequest = (data: {
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

    const newReq: ServiceRequest = {
      id: "req-" + Date.now(),
      siteId: activeSiteId,
      unitId: data.unitId,
      unitName: unit ? `${unit.blockName} · Daire ${unit.unitNumber}` : "Daire",
      reportedByName: occupant?.fullName || currentUser.name,
      reportedByPhone: occupant?.phone || currentUser.phone,
      category: data.category,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: "YENI",
      photoUrl: data.photoUrl,
      createdAt: ts,
      updatedAt: ts,
    };

    setRequests((prev) => [newReq, ...prev]);
    addAuditLog("CREATE", "Talep & Arızalar", `Yeni arıza/servis talebi açıldı: ${newReq.title} (${newReq.unitName})`);
  };

  const updateRequestStatus = (
    requestId: string,
    status: RequestStatus,
    adminNote?: string,
    assignedStaffName?: string
  ) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status,
            adminNote: adminNote !== undefined ? adminNote : r.adminNote,
            assignedStaffName: assignedStaffName !== undefined ? assignedStaffName : r.assignedStaffName,
            updatedAt: ts,
            completedAt: status === "TAMAMLANDI" ? ts : r.completedAt,
          };
        }
        return r;
      })
    );

    addAuditLog("UPDATE", "Talep & Arızalar", `Talep durumu güncellendi: ${status} (ID: ${requestId})`);
  };

  // Announcements & Polls
  const addAnnouncement = (data: Omit<Announcement, "id" | "date" | "authorName">) => {
    const dateStr = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date());
    const newAnn: Announcement = {
      ...data,
      id: "ann-" + Date.now(),
      date: dateStr,
      authorName: currentUser.name,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    addAuditLog("CREATE", "Duyurular", `Yeni duyuru yayınlandı: ${newAnn.title}`);
  };

  const votePoll = (pollId: string, optionId: string) => {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id === pollId) {
          return {
            ...p,
            totalVotes: p.totalVotes + 1,
            options: p.options.map((opt) =>
              opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            ),
          };
        }
        return p;
      })
    );
  };

  // Visitors & Parcels
  const addVisitorLog = (data: Omit<VisitorLog, "id" | "entryTime" | "guardName">) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newVis: VisitorLog = {
      ...data,
      id: "vis-" + Date.now(),
      entryTime: ts,
      guardName: currentUser.name,
    };
    setVisitors((prev) => [newVis, ...prev]);
    addAuditLog("CREATE", "Güvenlik & Ziyaretçi", `Ziyaretçi girişi kaydedildi: ${newVis.visitorName} -> ${newVis.unitName}`);
  };

  const markVisitorExit = (visitorId: string) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setVisitors((prev) =>
      prev.map((v) => (v.id === visitorId ? { ...v, exitTime: ts } : v))
    );
  };

  const addParcelLog = (data: Omit<ParcelLog, "id" | "receivedTime" | "guardName" | "status">) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newParcel: ParcelLog = {
      ...data,
      id: "par-" + Date.now(),
      receivedTime: ts,
      guardName: currentUser.name,
      status: "BILDIRILDI",
    };
    setParcels((prev) => [newParcel, ...prev]);
    addAuditLog("CREATE", "Güvenlik & Kargo", `Kargo teslim alındı ve sakine bildirildi: ${newParcel.recipientName} (${newParcel.cargoCompany})`);
  };

  const updateParcelStatus = (parcelId: string, status: ParcelLog["status"]) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setParcels((prev) =>
      prev.map((p) =>
        p.id === parcelId
          ? { ...p, status, deliveredTime: status === "TESLIM_EDILDI" ? ts : p.deliveredTime }
          : p
      )
    );
  };

  // Meters
  const addMeterReading = (reading: Omit<MeterReading, "id" | "consumption" | "totalAmount" | "isBilled">) => {
    const consumption = Math.max(0, reading.currentIndex - reading.previousIndex);
    const totalAmount = consumption * reading.unitPrice;

    const newMtr: MeterReading = {
      ...reading,
      id: "mtr-" + Date.now(),
      consumption,
      totalAmount,
      isBilled: false,
    };
    setMeters((prev) => [newMtr, ...prev]);
    addAuditLog("CREATE", "Sayaç Yönetimi", `${newMtr.unitName} için ${newMtr.meterType} endeksi kaydedildi (${consumption} birim = ${totalAmount.toLocaleString("tr-TR")} TL)`);
  };

  // Reset Demo Data
  const resetDemoData = () => {
    localStorage.clear();
    setSites(INITIAL_SITES);
    setActiveSiteId("site-1");
    setBlocks(INITIAL_BLOCKS);
    setUnits(INITIAL_UNITS);
    setPeople(INITIAL_PEOPLE);
    setTahakkuklar(INITIAL_TAHAKKUKLAR);
    setCollections(INITIAL_COLLECTIONS);
    setLedgerItems(INITIAL_LEDGER_ITEMS);
    setAccounts(INITIAL_ACCOUNTS);
    setAccountTransactions(INITIAL_ACCOUNT_TXS);
    setExpenses(INITIAL_EXPENSES);
    setVendors(INITIAL_VENDORS);
    setBudget(INITIAL_BUDGET);
    setRequests(INITIAL_REQUESTS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setPolls(INITIAL_POLLS);
    setAssets(INITIAL_ASSETS);
    setStaff(INITIAL_STAFF);
    setVisitors(INITIAL_VISITORS);
    setParcels(INITIAL_PARCELS);
    setMeters(INITIAL_METERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    window.location.reload();
  };

  // Filtered by active site
  const activeSiteUnits = units.filter((u) => u.siteId === activeSiteId);
  const activeSitePeople = people.filter((p) => p.siteId === activeSiteId);
  const activeSiteTahakkuklar = tahakkuklar.filter((t) => t.siteId === activeSiteId);
  const activeSiteCollections = collections.filter((c) => c.siteId === activeSiteId);
  const activeSiteAccounts = accounts.filter((a) => a.siteId === activeSiteId);
  const activeSiteAccountTransactions = accountTransactions.filter((t) => t.siteId === activeSiteId);
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

  return (
    <AppContext.Provider
      value={{
        company,
        sites,
        activeSiteId,
        activeSite,
        setActiveSiteId,
        addNewSite,

        blocks,
        units,
        activeSiteUnits,
        addUnit,
        updateUnit,

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

        resetDemoData,
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
