import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { RefreshCw, ChevronDown, ChevronRight, Filter, TrendingUp, TrendingDown, ArrowUpDown, ShieldCheck, ShieldAlert, Landmark } from "lucide-react";
import { CSVLink } from "react-csv";
import Headers from "../components/Header.jsx";
import baseUrl from "../api/api";
import useSidebar from "../hooks/useSidebar";

const TWS_BASE = "https://rentalapi.rootments.live/api/GetBooking";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(n || 0);

const today = () => new Date().toISOString().slice(0, 10);
const firstOfMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

const STORE_LIST = [
  { locName: "Dappr Squad",      locCode: "555" },
  { locName: "G-Edappal",        locCode: "707" },
  { locName: "G-Edappally",      locCode: "702" },
  { locName: "G-Kalpetta",       locCode: "717" },
  { locName: "G-Kannur",         locCode: "716" },
  { locName: "G-Kottakkal",      locCode: "711" },
  { locName: "G-Kottayam",       locCode: "701" },
  { locName: "G-Manjeri",        locCode: "710" },
  { locName: "G-Mg Road",        locCode: "718" },
  { locName: "G-Palakkad",       locCode: "705" },
  { locName: "G-Perinthalmanna", locCode: "709" },
  { locName: "G-Perumbavoor",    locCode: "703" },
  { locName: "G-Thrissur",       locCode: "704" },
  { locName: "G-Vadakara",       locCode: "708" },
  { locName: "G-Chavakkad",      locCode: "706" },
  { locName: "G-Calicut",        locCode: "712" },
  { locName: "HEAD OFFICE01",    locCode: "759" },
  { locName: "Office",           locCode: "102" },
  { locName: "Production",       locCode: "101" },
  { locName: "SG-Trivandrum",    locCode: "700" },
  { locName: "Warehouse",        locCode: "858" },
  { locName: "WAREHOUSE",        locCode: "103" },
  { locName: "Z-Edappal",        locCode: "100" },
  { locName: "Z-Edapally",       locCode: "144" },
  { locName: "Z-Kottakkal",      locCode: "122" },
  { locName: "Z-Perinthalmanna", locCode: "133" },
];

const EXPENSE_CATEGORIES = new Set([
  "petty expenses","staff reimbursement","maintenance expenses","telephone internet",
  "utility bill","salary","rent","courier charges","asset purchase","promotion_services",
  "spot incentive","other expenses","shoe sales return",
  "shirt sales return","dry cleaning","altration","material","travel exp","fuel exp",
  "waste management","water charges","printing stationary","staff welfare",
  "staff accommodation","incentive","write off",
  "office supplies","bank fees and charges","travel expense","directors travelling expense",
  "employee travel expenses","cluster travelling expense","telephone expense","automobile expense",
  "it and internet expenses","rent expense","janitorial expense","postage","bad debt",
  "salaries and employee wages","meals and entertainment","depreciation expense","consultant expense",
  "repairs and maintenance","repairs & maintenance","other expenses","lodging","transportation expense",
  "depreciation and amortisation","epf contribution-employer","esi contribution-employer",
  "interest and fine","fines and penalties","rates & taxes","interest on tds",
  "fine's and penalty-electricity","interest & late fee","telephone & internet expense",
  "office expenses [parent]","printing and stationery","printing & stationary","internet expenses",
  "internet expense","office expenses","office expense","printer consumables","fuel expenses",
  "legal charges","charity","cleaning expenses","labour charges office","parking charge",
  "subscription charges","marketing & promotion","advertising and marketing","salary and wages",
  "salary/salary advance","salary advance","employee wages","overtime payment","consultation charges","accounting charges",
  "bank charges","finance charges","paytm deductions","car loan interest","emi","utility charges",
  "electricity charges","staff welfare expenses","staff food and accomodation","gift expenses",
  "rent expenses - warehouse","generator expenses","meeting expenses","vehicle insurance",
  "printer service","domain purchase","filing fees","selling expenses","discount allowed",
  "equipment rent","mca charges","gst late fees and interest","rental supplies expense",
  "training & development expenses","interior designing","audit fee","lease registration charges",
  "payment gateway charges","house rent allowance","utility connection / government fees",
  "tds late fee","trademark expense","cost of goods sold","labor","materials","subcontractor",
  "job costing","transportation expenses","freight expenses","dry cleaning expenses",
  "uniform stitching","alteration expense","raw materials / dress accessories","raw materials and consumables",
  "raw materials","raw material","raw materials & consumables","raw materials/dress accessories",
  "freight charges","product expenses","labour charges - warehouse","uniform expense","food expense",
  "refund"
]);

// Maps raw DB category values → human-readable display labels
const CATEGORY_LABEL_MAP = {
  "dry cleaning":                       "Dry Cleaning",
  "altration":                          "Altration",
  "material":                           "Material",
  "courier charges":                    "Courier Charges",
  "maintenance expenses":               "Repairs & Maintenance",
  "repairs and maintenance":            "Repairs & Maintenance",
  "repairs & maintenance":              "Repairs & Maintenance",
  "travel exp":                         "Travel Exp",
  "travel expense":                     "Travel Expense",
  "directors travelling expense":       "Directors Travelling Expense",
  "employee travel expenses":           "Employee Travel Expenses",
  "cluster travelling expense":         "Cluster Travelling Expense",
  "fuel exp":                           "Fuel Exp",
  "fuel expenses":                      "Fuel Expenses",
  "petty expenses":                     "Office Expense",
  "office expense":                     "Office Expense",
  "office expenses":                    "Office Expenses",
  "office expenses [parent]":           "Office Expenses [parent]",
  "office supplies":                    "Office Supplies",
  "telephone internet":                 "Internet Expense",
  "internet expense":                   "Internet Expense",
  "internet expenses":                  "Internet Expenses",
  "telephone expense":                  "Telephone Expense",
  "telephone & internet expense":       "Telephone & Internet Expense",
  "it and internet expenses":           "IT and Internet Expenses",
  "utility bill":                       "Electricity Charges",
  "electricity charges":                "Electricity Charges",
  "utility charges":                    "Utility Charges",
  "utility connection / government fees":"Utility Connection / Government Fees",
  "waste management":                   "Waste Management",
  "water charges":                      "Water Charges",
  "salary":                             "Salary",
  "salary/salary advance":              "Salary Advance",
  "salary advance":                     "Salary Advance",
  "salary and wages":                   "Salary",
  "salaries and employee wages":        "Employee Wages",
  "employee wages":                     "Employee Wages",
  "overtime payment":                   "Overtime Payment",
  "printing stationary":                "Printing & Stationary",
  "printing & stationary":              "Printing & Stationary",
  "printing and stationery":            "Printing and Stationery",
  "printer consumables":                "Printer Consumables",
  "printer service":                    "Printer Service",
  "staff welfare":                      "Staff Welfare",
  "staff welfare expenses":             "Staff Welfare Expenses",
  "staff reimbursement":                "Staff Accommodation",
  "staff accommodation":                "Staff Accommodation",
  "staff food and accomodation":        "Staff Food And Accomodation",
  "rent":                               "Store Rent",
  "store rent":                         "Store Rent",
  "rent expense":                       "Rent Expense",
  "rent expenses - warehouse":          "Rent Expenses - Warehouse",
  "equipment rent":                     "Equipment Rent",
  "asset purchase":                     "Asset Purchase",
  "compensation":                       "Compensation",
  "incentive":                          "Incentive",
  "spot incentive":                     "Incentive",
  "other expenses":                     "Refund",
  "refund":                             "Refund",
  "bulk amount transfer":               "Cash to Bank",
  "cash to bank":                       "Cash to Bank",
  "write off":                          "Write Off",
  "promotion_services":                 "Promotion / Services",
  "shoe sales return":                  "Shoe Sales Return",
  "shirt sales return":                 "Shirt Sales Return",
  "returnable income":                  "Returnable Income",
  "security refund":                    "Security Refund",
  "holded security refund":             "Security Refund",
  "bank to cash":                       "Bank to Cash",
  "cash to branch":                     "Bank to Cash",
  "petty cash received":                "Petty Cash Received",
  "bank fees and charges":              "Bank Fees and Charges",
  "bank charges":                       "Bank Charges",
  "finance charges":                    "Finance Charges",
  "automobile expense":                 "Automobile Expense",
  "janitorial expense":                 "Janitorial Expense",
  "postage":                            "Postage",
  "bad debt":                           "Bad Debt",
  "meals and entertainment":            "Meals and Entertainment",
  "depreciation expense":               "Depreciation Expense",
  "depreciation and amortisation":      "Depreciation And Amortisation",
  "consultant expense":                 "Consultant Expense",
  "consultation charges":               "Consultation Charges",
  "accounting charges":                 "Accounting Charges",
  "lodging":                            "Lodging",
  "transportation expense":             "Transportation Expense",
  "transportation expenses":            "Transportation Expenses",
  "freight charges":                    "Freight Charges",
  "freight expenses":                   "Freight Expenses",
  "epf contribution-employer":          "EPF Contribution-Employer",
  "esi contribution-employer":          "ESI Contribution-Employer",
  "interest and fine":                  "Interest and Fine",
  "interest & late fee":                "Interest & Late fee",
  "interest on tds":                    "Interest on TDS",
  "tds late fee":                       "TDS Late fee",
  "fines and penalties":                "Fines and Penalties",
  "fine's and penalty-electricity":     "Fine's and penalty-Electricity",
  "rates & taxes":                      "Rates & Taxes",
  "gst late fees and interest":         "GST Late fees and interest",
  "legal charges":                      "Legal Charges",
  "charity":                            "Charity",
  "cleaning expenses":                  "Cleaning Expenses",
  "labour charges office":              "Labour Charges Office",
  "labour charges - warehouse":         "Labour Charges - Warehouse",
  "parking charge":                     "Parking charge",
  "subscription charges":               "Subscription Charges",
  "marketing & promotion":              "Marketing & Promotion",
  "advertising and marketing":          "Advertising And Marketing",
  "paytm deductions":                   "Paytm Deductions",
  "emi":                                "EMI",
  "car loan interest":                  "EMI",
  "gift expenses":                      "Gift Expenses",
  "generator expenses":                 "Generator Expenses",
  "meeting expenses":                   "Meeting Expenses",
  "vehicle insurance":                  "Vehicle Insurance",
  "domain purchase":                    "Domain Purchase",
  "filing fees":                        "Filing fees",
  "selling expenses":                   "Selling Expenses",
  "discount allowed":                   "Discount Allowed",
  "mca charges":                        "MCA Charges",
  "rental supplies expense":            "Rental Supplies Expense",
  "training & development expenses":    "Training & Development Expenses",
  "interior designing":                 "Interior Designing",
  "audit fee":                          "Audit Fee",
  "lease registration charges":         "Lease Registration Charges",
  "payment gateway charges":            "Payment Gateway Charges",
  "house rent allowance":               "House Rent Allowance",
  "trademark expense":                  "Trademark Expense",
  "cost of goods sold":                 "Cost of Goods Sold",
  "labor":                              "Labor",
  "materials":                          "Materials",
  "subcontractor":                      "Subcontractor",
  "job costing":                        "Job Costing",
  "dry cleaning expenses":              "Dry Cleaning",
  "dry cleaning expense":               "Dry Cleaning",
  "uniform stitching":                  "Uniform Stitching",
  "alteration expense":                 "Alteration Expense",
  "raw materials / dress accessories":  "Raw Materials / Dress Accessories",
  "raw materials/dress accessories":    "Raw Materials / Dress Accessories",
  "raw materials and consumables":      "Raw Materials And Consumables",
  "raw materials & consumables":        "Raw Materials And Consumables",
  "raw materials":                      "Raw Materials And Consumables",
  "raw material":                       "Raw Materials And Consumables",
  "product expenses":                   "Product expenses",
  "uniform expense":                    "Uniform Expense",
  "food expense":                       "Food expense"
};

const getCategoryLabel = (cat) =>
  CATEGORY_LABEL_MAP[(cat || "").toLowerCase().trim()] || cat;

const getTxId = (t) => String(t?._id?.$oid || t?._id || t?.id || "");



export default function IncomeExpenseReport() {
  const isSidebarOpen = useSidebar();
  const user = JSON.parse(localStorage.getItem("rootfinuser")) || {};
  const isAdmin = (user.power || "").toLowerCase() === "admin" || (user.role || "").toLowerCase() === "admin";
  const isSuperAdmin = (user.role || "").toLowerCase() === "superadmin";
  const isClusterManager = (user.role || "").toLowerCase() === "cluster_manager";
  const isFinancialHead = (user.role || "").toLowerCase() === "financial_head";
  const clusterAllowedLocCodes = user.allowedLocCodes || [];
  const canSelectStore = isAdmin || isSuperAdmin || isClusterManager || isFinancialHead;
  const userCanSeeAdminExpenses = isAdmin || isSuperAdmin || isClusterManager || isFinancialHead;

  const [fromDate, setFromDate] = useState(firstOfMonth());
  const [toDate, setToDate] = useState(today());
  const [filterCategories, setFilterCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedStore, setSelectedStore] = useState("all");
  
  const [incomeRows, setIncomeRows] = useState([]);
  const [returnableIncomeRows, setReturnableIncomeRows] = useState([]);
  const [expenseRows, setExpenseRows] = useState([]);
  const [holdedSecurityRefundRows, setHoldedSecurityRefundRows] = useState([]);
  const [cashToBankRows, setCashToBankRows] = useState([]);
  const [bankToCashRows, setBankToCashRows] = useState([]);

  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expanded, setExpanded] = useState({});

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      const categoryDropdown = document.getElementById('category-dropdown-container');
      if (categoryDropdown && !categoryDropdown.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const DEPT_LOC_CODES = ["759", "102", "101", "858", "103"];
  const ALL_LOC_CODES = isClusterManager
    ? clusterAllowedLocCodes
    : STORE_LIST.map(s => s.locCode);
  const ALL_STORES_ONLY = ALL_LOC_CODES.filter(lc => !DEPT_LOC_CODES.includes(lc));
  const ALL_DEPTS_ONLY = ALL_LOC_CODES.filter(lc => DEPT_LOC_CODES.includes(lc));

  const locCode = canSelectStore ? selectedStore : (user.locCode || "");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setHasSearched(true);
    setIncomeRows([]);
    setReturnableIncomeRows([]);
    setExpenseRows([]);
    setHoldedSecurityRefundRows([]);
    setCashToBankRows([]);
    setBankToCashRows([]);
    setExpanded({});
    try {
      const API = baseUrl?.baseUrl?.replace(/\/$/, "") || "http://localhost:7000";

      const safeFetch = async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) { console.warn(`TWS fetch failed (${res.status}): ${url}`); return {}; }
          return await res.json();
        } catch (e) { console.warn("TWS fetch error:", url, e.message); return {}; }
      };

      let locCodesToFetch = [locCode];
      if (locCode === "all" || !locCode) {
        locCodesToFetch = ALL_LOC_CODES;
      } else if (locCode === "all_stores") {
        locCodesToFetch = ALL_STORES_ONLY;
      } else if (locCode === "all_depts") {
        locCodesToFetch = ALL_DEPTS_ONLY;
      }

      // TWS rental endpoints only exist for retail stores, so exclude department codes
      const twsLocCodes = locCodesToFetch.filter(lc => !DEPT_LOC_CODES.includes(lc));

      const twsResults = await Promise.all(
        twsLocCodes.map(lc => Promise.all([
          safeFetch(`${TWS_BASE}/GetBookingList?LocCode=${lc}&DateFrom=${fromDate}&DateTo=${toDate}`),
          safeFetch(`${TWS_BASE}/GetRentoutList?LocCode=${lc}&DateFrom=${fromDate}&DateTo=${toDate}`),
          safeFetch(`${TWS_BASE}/GetReturnList?LocCode=${lc}&DateFrom=${fromDate}&DateTo=${toDate}`),
          safeFetch(`${TWS_BASE}/GetDeleteList?LocCode=${lc}&DateFrom=${fromDate}&DateTo=${toDate}`),
        ]))
      );

      const withLoc = (rows, lc) => (rows || []).map((item) => ({ ...item, locCode: item.locCode || lc }));
      const bookingData = { dataSet: { data: twsResults.flatMap((r, i) => withLoc(r[0]?.dataSet?.data, twsLocCodes[i])) } };
      const rentoutData = { dataSet: { data: twsResults.flatMap((r, i) => withLoc(r[1]?.dataSet?.data, twsLocCodes[i])) } };
      const returnData  = { dataSet: { data: twsResults.flatMap((r, i) => withLoc(r[2]?.dataSet?.data, twsLocCodes[i])) } };
      const cancelData  = { dataSet: { data: twsResults.flatMap((r, i) => withLoc(r[3]?.dataSet?.data, twsLocCodes[i])) } };

      let mongoJson = { data: [] };
      if (locCode === "all" || (!locCode && canSelectStore)) {
        // Query LocCode=all directly for 100% complete Mongo transactions across all stores & departments
        const mongoRes = await fetch(`${API}/user/Getpayment?LocCode=all&DateFrom=${fromDate}&DateTo=${toDate}`);
        mongoJson = mongoRes.ok ? await mongoRes.json() : {};
      } else if (locCode === "all_stores" || locCode === "all_depts" || (isClusterManager && (!locCode || locCode === "all"))) {
        const mongoResults = await Promise.all(
          locCodesToFetch.map(lc =>
            fetch(`${API}/user/Getpayment?LocCode=${lc}&DateFrom=${fromDate}&DateTo=${toDate}`)
              .then(r => r.ok ? r.json() : {})
              .catch(() => ({}))
          )
        );
        const merged = mongoResults.flatMap(r => Array.isArray(r) ? r : (r?.data || []));
        mongoJson = { data: merged };
      } else {
        const mongoRes  = await fetch(`${API}/user/Getpayment?LocCode=${locCode}&DateFrom=${fromDate}&DateTo=${toDate}`);
        mongoJson = mongoRes.ok ? await mongoRes.json() : {};
      }

      // Booking -> Income
      const bookingList = (bookingData?.dataSet?.data || []).map(item => ({
        date: (item.bookingDate || "").split("T")[0],
        invoiceNo: item.invoiceNo,
        customerName: item.customerName || "",
        category: "Booking",
        subCategory: "Advance",
        cash: Number(item.bookingCashAmount || 0),
        rbl:  Number(item.rblRazorPay || 0),
        bank: Number(item.bookingBankAmount || 0),
        upi:  Number(item.bookingUPIAmount || 0),
        locCode: item.locCode || locCode,
      }));

      // RentOut -> Split into Income (Balance Payable) and Returnable Income (Security)
      const rentoutIncomeList = [];
      const returnableList = [];

      (rentoutData?.dataSet?.data || []).forEach(item => {
        const security       = Number(item.securityAmount || 0);
        const advance        = Number(item.advanceAmount || 0);
        const balancePayable = Number(item.invoiceAmount || 0) - advance;
        const cash  = Number(item.rentoutCashAmount || 0);
        const rbl   = Number(item.rblRazorPay || 0);
        const bank  = Number(item.rentoutBankAmount || 0);
        const upi   = Number(item.rentoutUPIAmount || 0);
        const base  = {
          date: (item.rentOutDate || "").split("T")[0],
          invoiceNo: item.invoiceNo,
          customerName: item.customerName || "",
          locCode: item.locCode || locCode,
          cash, rbl, bank, upi,
        };

        // Returnable Income (Security received on RentOut)
        if (security > 0 || item.securityAmount) {
          returnableList.push({
            ...base,
            category: "Returnable Income",
            subCategory: "Returnable Income",
            amount: security,
            cash: security,
          });
        }

        // Actual non-returnable Income (Balance Payable)
        rentoutIncomeList.push({
          ...base,
          category: "RentOut",
          subCategory: "Balance Payable",
          amount: balancePayable,
          cash: balancePayable,
        });
      });

      // Return -> Security Refund
      const returnList = (returnData?.dataSet?.data || []).map(item => {
        const rbl = -Math.abs(Number(item.rblRazorPay || 0));
        return {
          date: (item.returnedDate || item.returnDate || "").split("T")[0],
          invoiceNo: item.invoiceNo,
          customerName: item.customerName || "",
          category: "Security Refund",
          subCategory: "Security Refund",
          cash: -Math.abs(Number(item.returnCashAmount || 0)),
          rbl,
          bank: rbl !== 0 ? 0 : -Math.abs(Number(item.returnBankAmount || 0)),
          upi:  rbl !== 0 ? 0 : -Math.abs(Number(item.returnUPIAmount || 0)),
          locCode: item.locCode || locCode,
        };
      });

      // Cancel -> Expense
      const cancelList = (cancelData?.dataSet?.data || []).map(item => {
        const rbl = -Math.abs(Number(item.rblRazorPay || 0));
        return {
          date: (item.cancelDate || "").split("T")[0],
          invoiceNo: item.invoiceNo,
          customerName: item.customerName || "",
          category: "Cancel",
          subCategory: "Cancellation Refund",
          cash: -Math.abs(Number(item.deleteCashAmount || 0)),
          rbl,
          bank: rbl !== 0 ? 0 : -Math.abs(Number(item.deleteBankAmount || 0)),
          upi:  rbl !== 0 ? 0 : -Math.abs(Number(item.deleteUPIAmount || 0)),
          locCode: item.locCode || locCode,
        };
      });

      // MongoDB income / expense / cash to bank / bank to cash
      const mongoTxns = Array.isArray(mongoJson) ? mongoJson : (mongoJson.data || []);
      const mongoIncome = [];
      const mongoExpense = [];
      const mongoCashToBank = [];
      const mongoBankToCash = [];
      const mongoHoldedSecurity = [];

      mongoTxns.forEach(t => {
        const tp  = (t.type || "").toLowerCase();
        const sub = (t.subCategory || "").toLowerCase().trim();
        const cat = (t.category || "").toLowerCase().trim();
        const inv = (t.invoiceNo || "").toUpperCase();
        const isShoeOrShirtSale = sub === "shoe sales" || sub === "shirt sales" || sub === "mixed sales"
          || cat === "shoe sales" || cat === "shirt sales" || cat === "mixed sales";
        const isSalesReturn = sub === "shoe sales return" || sub === "shirt sales return" || sub === "mixed sales return"
          || cat === "shoe sales return" || cat === "shirt sales return" || cat === "mixed sales return";
        const isReturnInvoice = inv.startsWith("RTN-") || inv.startsWith("RET-");

        const rmk = (t.remark || t.remarks || "").toUpperCase();
        const expType = (t.expenseType || "").toLowerCase().trim();
        const isDirectOrIndirect = expType === "direct" || expType === "indirect" ||
          rmk.includes("[DIRECT") || rmk.includes("[INDIRECT") ||
          tp === "direct" || tp === "indirect" || tp === "direct expense" || tp === "indirect expense";

        const isBankToCash = cat === "bank to cash" || sub === "bank to cash" || cat.includes("bank to cash") || sub.includes("bank to cash") || cat.includes("cash to branch") || sub.includes("cash to branch");
        const isCashToBank = !isBankToCash && (cat === "bulk amount transfer" || cat === "cash to bank" || sub === "bulk amount transfer" || sub === "cash to bank" || tp === "money transfer");
        
        const isExpenseCategory = tp === "expense" || isDirectOrIndirect || EXPENSE_CATEGORIES.has(cat);
        const isActualExpense = isExpenseCategory || isReturnInvoice;

        // Skip non-expense and non-shoe/shirt sales that have INV- or RTN- prefix
        if (!isActualExpense && !isShoeOrShirtSale && !isSalesReturn && !isReturnInvoice && (inv.startsWith("INV-") || inv.startsWith("RTN-") || inv.startsWith("RET-"))) return;

        if (isExpenseCategory && t.isAdminLevel && !userCanSeeAdminExpenses) {
          return; // Skip admin level expenses for non-admins
        }

        const normalizedCategory = (isShoeOrShirtSale && isActualExpense) 
          ? "Sales Return"
          : isShoeOrShirtSale 
            ? "Sales" 
            : isSalesReturn 
              ? "Sales Return" 
              : isReturnInvoice 
                ? "Return Invoice" 
                : isBankToCash 
                  ? "Bank to Cash" 
                  : isCashToBank 
                    ? "Cash to Bank" 
                    : (t.category || "Uncategorized");

        let normalizedSubCategory = (isShoeOrShirtSale && isActualExpense)
          ? ((sub === "shoe sales" || cat === "shoe sales") ? "Shoe Sales Return" 
             : (sub === "shirt sales" || cat === "shirt sales") ? "Shirt Sales Return" 
             : "Mixed Sales Return")
          : isShoeOrShirtSale 
            ? (t.subCategory || t.category || "Sales") 
            : isSalesReturn 
              ? (t.subCategory || t.category || "Sales Return") 
              : isReturnInvoice 
                ? (t.subCategory || "Sales Return") 
                : isBankToCash 
                  ? "Bank to Cash" 
                  : isCashToBank 
                    ? "Cash to Bank" 
                    : (t.subCategory || t.category || "");

        const originalSubCategory = normalizedSubCategory;

        if (isExpenseCategory && userCanSeeAdminExpenses && !isReturnInvoice) {
          normalizedSubCategory = t.isAdminLevel ? "Admin Entry" : "Store Entry";
        }

        const row = {
          date: (t.date || "").split("T")[0],
          invoiceNo: t.invoiceNo || t.locCode || "",
          customerName: t.customerName || "",
          category: normalizedCategory,
          subCategory: normalizedSubCategory,
          originalSubCategory: originalSubCategory,
          remark: t.remark || t.remarks || "",
          cash: Number(t.cash || 0),
          rbl:  Number(t.rbl || t.rblRazorPay || 0),
          bank: Number(t.bank || 0),
          upi:  Number(t.upi || 0),
          locCode: t.locCode || locCode,
          _id: t._id,
        };

        if (isBankToCash) {
          mongoBankToCash.push(row);
        } else if (isCashToBank) {
          mongoCashToBank.push(row);
        } else if (cat.includes("security refund") || sub.includes("security refund") || (tp === "return" && !isSalesReturn && !isReturnInvoice)) {
          row.category = "Security Refund";
          row.subCategory = "Security Refund";
          mongoHoldedSecurity.push(row);
        } else if (isReturnInvoice || tp === "return" || isSalesReturn) {
          mongoExpense.push(row);
        } else if (tp === "income") {
          mongoIncome.push(row);
        } else if (isExpenseCategory) {
          mongoExpense.push(row);
        }
      });

      setIncomeRows([...bookingList, ...rentoutIncomeList, ...mongoIncome]);
      setReturnableIncomeRows(returnableList);
      setExpenseRows([...cancelList, ...mongoExpense]);
      setHoldedSecurityRefundRows([...returnList, ...mongoHoldedSecurity]);
      setCashToBankRows(mongoCashToBank);
      setBankToCashRows(mongoBankToCash);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, locCode]);

  // Group: category -> subCategory -> { transactions, totals }
  const buildGrouped = (rows) => {
    const map = {};
    rows.forEach(t => {
      const rawCat = t.category || "Uncategorized";
      const cat = getCategoryLabel(rawCat);
      const sub = t.subCategory || cat;
      // Filter: if categories are selected, only include if cat is in the selected array
      if (filterCategories.length > 0 && !filterCategories.includes(cat) && !filterCategories.includes(rawCat)) return;
      if (!map[cat]) map[cat] = { subCategories: {}, cash: 0, rbl: 0, bank: 0, upi: 0 };
      if (!map[cat].subCategories[sub]) map[cat].subCategories[sub] = { transactions: [], cash: 0, rbl: 0, bank: 0, upi: 0 };

      const isRentOutOrReturnable = cat === "RentOut" || cat === "Returnable Income";
      const subG = map[cat].subCategories[sub];
      subG.transactions.push(t);

      if (isRentOutOrReturnable) {
        subG.cash += t.amount || 0;
        map[cat].cash += t.amount || 0;
      } else {
        subG.cash += t.cash || 0;
        subG.rbl  += t.rbl  || 0;
        subG.bank += t.bank || 0;
        subG.upi  += t.upi  || 0;
        map[cat].cash += t.cash || 0;
        map[cat].rbl  += t.rbl  || 0;
        map[cat].bank += t.bank || 0;
        map[cat].upi  += t.upi  || 0;
      }
    });
    return map;
  };

  const incomeGrouped  = useMemo(() => buildGrouped(incomeRows), [incomeRows, filterCategories]);
  const returnableIncomeGrouped = useMemo(() => buildGrouped(returnableIncomeRows), [returnableIncomeRows, filterCategories]);
  const expenseGrouped = useMemo(() => buildGrouped(expenseRows), [expenseRows, filterCategories]);
  const holdedSecRefundGrouped = useMemo(() => buildGrouped(holdedSecurityRefundRows), [holdedSecurityRefundRows, filterCategories]);
  const cashToBankGrouped = useMemo(() => buildGrouped(cashToBankRows), [cashToBankRows, filterCategories]);
  const bankToCashGrouped = useMemo(() => buildGrouped(bankToCashRows), [bankToCashRows, filterCategories]);

  const sumGroup = (grouped) =>
    Object.values(grouped).reduce(
      (s, g) => ({ cash: s.cash + g.cash, rbl: s.rbl + g.rbl, bank: s.bank + g.bank, upi: s.upi + g.upi }),
      { cash: 0, rbl: 0, bank: 0, upi: 0 }
    );

  const incTotals = sumGroup(incomeGrouped);
  const retTotals = sumGroup(returnableIncomeGrouped);
  const expTotals = sumGroup(expenseGrouped);
  const holdedSecTotals = sumGroup(holdedSecRefundGrouped);
  const cashToBankTotals = sumGroup(cashToBankGrouped);
  const bankToCashTotals = sumGroup(bankToCashGrouped);

  const incTotal  = incTotals.cash + incTotals.rbl + incTotals.bank + incTotals.upi;
  const retTotal  = retTotals.cash + retTotals.rbl + retTotals.bank + retTotals.upi;
  const expTotal  = expTotals.cash + expTotals.rbl + expTotals.bank + expTotals.upi;
  const holdedSecTotal = holdedSecTotals.cash + holdedSecTotals.rbl + holdedSecTotals.bank + holdedSecTotals.upi;
  const cashToBankTotal = cashToBankTotals.cash + cashToBankTotals.rbl + cashToBankTotals.bank + cashToBankTotals.upi;
  const bankToCashTotal = bankToCashTotals.cash + bankToCashTotals.rbl + bankToCashTotals.bank + bankToCashTotals.upi;

  const retAndBankCashTotals = {
    cash: retTotals.cash + bankToCashTotals.cash,
    rbl: retTotals.rbl + bankToCashTotals.rbl,
    bank: retTotals.bank + bankToCashTotals.bank,
    upi: retTotals.upi + bankToCashTotals.upi
  };
  const retAndBankCashTotal = retTotal + bankToCashTotal;

  const grandTotalIncomeTotals = {
    cash: incTotals.cash + retTotals.cash + bankToCashTotals.cash,
    rbl: incTotals.rbl + retTotals.rbl + bankToCashTotals.rbl,
    bank: incTotals.bank + retTotals.bank + bankToCashTotals.bank,
    upi: incTotals.upi + retTotals.upi + bankToCashTotals.upi
  };
  const grandTotalIncome = incTotal + retTotal + bankToCashTotal;

  const holdedAndCashBankTotals = {
    cash: holdedSecTotals.cash + cashToBankTotals.cash,
    rbl: holdedSecTotals.rbl + cashToBankTotals.rbl,
    bank: holdedSecTotals.bank + cashToBankTotals.bank,
    upi: holdedSecTotals.upi + cashToBankTotals.upi
  };
  const holdedAndCashBankTotal = holdedSecTotal + cashToBankTotal;

  const grandTotalExpenseTotals = {
    cash: expTotals.cash + holdedSecTotals.cash + cashToBankTotals.cash,
    rbl: expTotals.rbl + holdedSecTotals.rbl + cashToBankTotals.rbl,
    bank: expTotals.bank + holdedSecTotals.bank + cashToBankTotals.bank,
    upi: expTotals.upi + holdedSecTotals.upi + cashToBankTotals.upi
  };
  const grandTotalExpense = expTotal + holdedSecTotal + cashToBankTotal;

  // 1. Top Card: Net Difference between Income TOTAL (incTotals) and Expense TOTAL (expTotals)
  const topNetCash   = incTotals.cash + expTotals.cash;
  const topNetRbl    = incTotals.rbl  + expTotals.rbl;
  const topNetBank   = incTotals.bank + expTotals.bank;
  const topNetUpi    = incTotals.upi  + expTotals.upi;
  const topNetTotal  = incTotal + expTotal;

  // 2. Table Footer: Net Difference Total between TOTAL INCOME (grandTotalIncome) and TOTAL EXPENSES (grandTotalExpense)
  const tableNetCash  = grandTotalIncomeTotals.cash + grandTotalExpenseTotals.cash;
  const tableNetRbl   = grandTotalIncomeTotals.rbl  + grandTotalExpenseTotals.rbl;
  const tableNetBank  = grandTotalIncomeTotals.bank + grandTotalExpenseTotals.bank;
  const tableNetUpi   = grandTotalIncomeTotals.upi  + grandTotalExpenseTotals.upi;
  const tableNetTotal = grandTotalIncome + grandTotalExpense;

  const allCategories = useMemo(() => {
    const fromRows = [...new Set([
      ...incomeRows,
      ...returnableIncomeRows,
      ...expenseRows,
      ...holdedSecurityRefundRows,
      ...cashToBankRows,
      ...bankToCashRows
    ].map(t => getCategoryLabel(t.category || "Uncategorized")))];
    
    // If no data fetched yet, use predefined categories
    if (fromRows.length === 0) {
      return [
        "Booking",
        "RentOut",
        "Returnable Income",
        "Security Refund",
        "Cancel",
        "Sales",
        "Sales Return",
        "Bank to Cash",
        "Cash to Bank",
        "Return Invoice",
        "Dry Cleaning"
      ];
    }
    
    return fromRows;
  }, [incomeRows, returnableIncomeRows, expenseRows, holdedSecurityRefundRows, cashToBankRows, bankToCashRows]);

  const toggleExpand  = (key) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  const getBranchName = (lc) => {
    const store = STORE_LIST.find(s => s.locCode === String(lc) || s.locName.toLowerCase() === String(lc).toLowerCase());
    return store ? store.locName : (lc || "-");
  };

  const showBranch = canSelectStore;
  const colCount = showBranch ? 10 : 9;

  // CSV Export Data
  const csvData = useMemo(() => {
    const rows = [];
    rows.push(["Section", "Date", "Category", "Customer / Invoice", "Remarks", "Branch", "Cash", "Razorpay", "Bank", "UPI", "Total"]);
    
    // 1. Income
    Object.keys(incomeGrouped).forEach(cat => {
      const g = incomeGrouped[cat];
      Object.keys(g.subCategories).forEach(sub => {
        const sg = g.subCategories[sub];
        sg.transactions.forEach(t => {
          const isRentOut = cat === "RentOut";
          const tCash = isRentOut ? (t.amount || 0) : (t.cash || 0);
          const tTotal = tCash + (isRentOut ? 0 : (t.rbl || 0) + (t.bank || 0) + (t.upi || 0));
          rows.push([
            "INCOME",
            t.date || "",
            getCategoryLabel(cat),
            t.customerName || t.invoiceNo || "",
            t.remark || "",
            getBranchName(t.locCode),
            tCash,
            isRentOut ? 0 : t.rbl || 0,
            isRentOut ? 0 : t.bank || 0,
            isRentOut ? 0 : t.upi || 0,
            tTotal
          ]);
        });
      });
    });

    // 2. Returnable Income
    Object.keys(returnableIncomeGrouped).forEach(cat => {
      const g = returnableIncomeGrouped[cat];
      Object.keys(g.subCategories).forEach(sub => {
        const sg = g.subCategories[sub];
        sg.transactions.forEach(t => {
          rows.push([
            "RETURNABLE INCOME",
            t.date || "",
            "Returnable Income",
            t.customerName || t.invoiceNo || "",
            t.remark || "",
            getBranchName(t.locCode),
            t.amount || 0,
            0,
            0,
            0,
            t.amount || 0
          ]);
        });
      });
    });

    // 3. Expenses
    Object.keys(expenseGrouped).forEach(cat => {
      const g = expenseGrouped[cat];
      Object.keys(g.subCategories).forEach(sub => {
        const sg = g.subCategories[sub];
        sg.transactions.forEach(t => {
          const tTotal = (t.cash || 0) + (t.rbl || 0) + (t.bank || 0) + (t.upi || 0);
          rows.push([
            "EXPENSES",
            t.date || "",
            getCategoryLabel(cat),
            t.customerName || t.invoiceNo || "",
            t.remark || "",
            getBranchName(t.locCode),
            t.cash || 0,
            t.rbl || 0,
            t.bank || 0,
            t.upi || 0,
            tTotal
          ]);
        });
      });
    });

    // 4. Security Refund
    Object.keys(holdedSecRefundGrouped).forEach(cat => {
      const g = holdedSecRefundGrouped[cat];
      Object.keys(g.subCategories).forEach(sub => {
        const sg = g.subCategories[sub];
        sg.transactions.forEach(t => {
          const tTotal = (t.cash || 0) + (t.rbl || 0) + (t.bank || 0) + (t.upi || 0);
          rows.push([
            "SECURITY REFUND",
            t.date || "",
            getCategoryLabel(cat),
            t.customerName || t.invoiceNo || "",
            t.remark || "",
            getBranchName(t.locCode),
            t.cash || 0,
            t.rbl || 0,
            t.bank || 0,
            t.upi || 0,
            tTotal
          ]);
        });
      });
    });

    // 5. Cash to Bank
    Object.keys(cashToBankGrouped).forEach(cat => {
      const g = cashToBankGrouped[cat];
      Object.keys(g.subCategories).forEach(sub => {
        const sg = g.subCategories[sub];
        sg.transactions.forEach(t => {
          const tTotal = (t.cash || 0) + (t.rbl || 0) + (t.bank || 0) + (t.upi || 0);
          rows.push([
            "CASH TO BANK",
            t.date || "",
            "Cash to Bank",
            t.customerName || t.invoiceNo || "",
            t.remark || "",
            getBranchName(t.locCode),
            t.cash || 0,
            t.rbl || 0,
            t.bank || 0,
            t.upi || 0,
            tTotal
          ]);
        });
      });
    });

    // 6. Bank to Cash
    Object.keys(bankToCashGrouped).forEach(cat => {
      const g = bankToCashGrouped[cat];
      Object.keys(g.subCategories).forEach(sub => {
        const sg = g.subCategories[sub];
        sg.transactions.forEach(t => {
          const tTotal = (t.cash || 0) + (t.rbl || 0) + (t.bank || 0) + (t.upi || 0);
          rows.push([
            "BANK TO CASH",
            t.date || "",
            "Bank to Cash",
            t.customerName || t.invoiceNo || "",
            t.remark || "",
            getBranchName(t.locCode),
            t.cash || 0,
            t.rbl || 0,
            t.bank || 0,
            t.upi || 0,
            tTotal
          ]);
        });
      });
    });

    return rows;
  }, [incomeGrouped, returnableIncomeGrouped, expenseGrouped, holdedSecRefundGrouped, cashToBankGrouped, bankToCashGrouped]);

  // Renders: category header row → directly transaction rows (no subcategory intermediate row)
  const renderCategoryRows = (grouped, typeLabel, isIncome, isReturnable = false, isExcluded = false) =>
    Object.keys(grouped).map(cat => {
      const g = grouped[cat];
      const catTotal = g.cash + g.rbl + g.bank + g.upi;
      const catKey = `${typeLabel}-${cat}`;
      const isCatExp = !!expanded[catKey];
      const signStr = (v) => v !== 0 ? fmt(Math.abs(v)) : "-";

      const isIncomeGroup = typeLabel === "INCOME" || typeLabel === "RETURNABLE" || typeLabel === "BANK_CASH";
      const isExpenseGroup = typeLabel === "EXPENSE" || typeLabel === "HOLDED_SEC" || typeLabel === "CASH_BANK";

      const headerBg = isIncomeGroup ? "bg-[#e8fce8] hover:bg-[#dcf5dc] text-gray-900 border-[#dcf5dc]" 
                     : isExpenseGroup ? "bg-[#ffeae8] hover:bg-[#ffdad8] text-gray-900 border-[#ffdad8]" 
                     : "bg-white hover:bg-gray-50 text-gray-900 border-gray-200";

      const textColor = "text-gray-900";
      const totalTextColor = "text-gray-900";

      // Collect all transactions directly under this category
      const transactions = Object.values(g.subCategories).flatMap(sg => sg.transactions);

      return (
        <tbody key={catKey} className="border-b border-gray-100">
          {/* Category Header Row */}
          <tr 
            className={`cursor-pointer transition-colors border-t ${headerBg}`}
            onClick={() => toggleExpand(catKey)}
          >
            <td className="px-4 py-3 text-center w-12">
              {isCatExp ? <ChevronDown size={16} className={`inline-block ${textColor}`} /> : <ChevronRight size={16} className={`inline-block ${textColor}`} />}
            </td>
            <td className="px-4 py-3 text-sm font-semibold" colSpan={showBranch ? 4 : 3}>
              <span className={`inline-flex items-center gap-1.5 font-bold ${textColor}`}>
                {getCategoryLabel(cat)}
              </span>
            </td>
            <td className={`px-4 py-3 text-right text-xs font-semibold ${textColor}`}>{g.rbl  !== 0 ? signStr(g.rbl)  : "-"}</td>
            <td className={`px-4 py-3 text-right text-xs font-semibold ${textColor}`}>{g.cash !== 0 ? signStr(g.cash) : "-"}</td>
            <td className={`px-4 py-3 text-right text-xs font-semibold ${textColor}`}>{g.bank !== 0 ? signStr(g.bank) : "-"}</td>
            <td className={`px-4 py-3 text-right text-xs font-semibold ${textColor}`}>{g.upi  !== 0 ? signStr(g.upi)  : "-"}</td>
            <td className={`px-4 py-3 text-right text-sm font-bold ${totalTextColor}`}>
              {fmt(Math.abs(catTotal))}
            </td>
            <td className="px-4 py-3"></td>
          </tr>

          {/* Direct Transaction Rows or Subcategories */}
          {isCatExp && (
            <>
              {(cat === "Sales" || cat === "Sales Return" || (typeLabel === "EXPENSE" && userCanSeeAdminExpenses)) ? (
                Object.keys(g.subCategories).map(sub => {
                  const sg = g.subCategories[sub];
                  const subKey = `${catKey}-${sub}`;
                  const isSubExp = !!expanded[subKey];
                  const subTotal = sg.cash + sg.rbl + sg.bank + sg.upi;
                  
                  return (
                    <React.Fragment key={subKey}>
                      <tr 
                        className="cursor-pointer transition-colors bg-gray-50/50 hover:bg-gray-100 border-t border-gray-100"
                        onClick={() => toggleExpand(subKey)}
                      >
                        <td className="px-4 py-2.5 text-center w-12 pl-8">
                          {isSubExp ? <ChevronDown size={14} className="inline-block text-gray-500" /> : <ChevronRight size={14} className="inline-block text-gray-500" />}
                        </td>
                        <td className="px-4 py-2.5 text-xs font-semibold text-gray-700" colSpan={showBranch ? 4 : 3}>
                          {getCategoryLabel(sub)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs font-medium text-gray-600">{sg.rbl !== 0 ? signStr(sg.rbl) : "-"}</td>
                        <td className="px-4 py-2.5 text-right text-xs font-medium text-gray-600">{sg.cash !== 0 ? signStr(sg.cash) : "-"}</td>
                        <td className="px-4 py-2.5 text-right text-xs font-medium text-gray-600">{sg.bank !== 0 ? signStr(sg.bank) : "-"}</td>
                        <td className="px-4 py-2.5 text-right text-xs font-medium text-gray-600">{sg.upi !== 0 ? signStr(sg.upi) : "-"}</td>
                        <td className="px-4 py-2.5 text-right text-xs font-bold text-gray-700">{fmt(Math.abs(subTotal))}</td>
                        <td className="px-4 py-2.5"></td>
                      </tr>
                      
                      {isSubExp && sg.transactions.map((t, i) => {
                        const dateStr = t.date
                          ? new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                          : "-";
                        const isRentOutOrReturnable = cat === "RentOut" || cat === "Returnable Income";
                        const isIncentiveCat = cat.toLowerCase() === "incentive";
                        const tCash = isRentOutOrReturnable ? (t.amount || 0) : (t.cash || 0);
                        const tTotal = tCash + (t.rbl || 0) + (t.bank || 0) + (t.upi || 0);
                        
                        return (
                          <tr key={`${subKey}-tx-${i}`} className="bg-white hover:bg-slate-50/60 border-b border-slate-50 text-xs">
                            <td className="px-4 py-2.5 text-gray-400 pl-12 whitespace-nowrap italic">{dateStr}</td>
                            <td className="px-4 py-2.5 text-gray-500 font-medium italic">{t.originalSubCategory || t.subCategory || getCategoryLabel(cat)}</td>
                            <td className="px-4 py-2.5 text-gray-600 italic">
                              {isIncentiveCat ? (t.remark || t.customerName || "-") : (t.customerName || "-")}
                            </td>
                            <td className="px-4 py-2.5 text-gray-500 italic max-w-[180px] truncate" title={t.remark || ""}>
                              {t.remark || "-"}
                            </td>
                            {showBranch && (
                              <td className="px-4 py-2.5 text-gray-500 font-medium italic">
                                {getBranchName(t.locCode)}
                              </td>
                            )}
                            <td className="px-4 py-2.5 text-right text-gray-500 font-mono italic">
                              {!isRentOutOrReturnable && t.rbl !== 0 ? fmt(Math.abs(t.rbl)) : "-"}
                            </td>
                            <td className="px-4 py-2.5 text-right text-gray-500 font-mono italic">
                              {tCash !== 0 ? fmt(Math.abs(tCash)) : "-"}
                            </td>
                            <td className="px-4 py-2.5 text-right text-gray-500 font-mono italic">
                              {!isRentOutOrReturnable && t.bank !== 0 ? fmt(Math.abs(t.bank)) : "-"}
                            </td>
                            <td className="px-4 py-2.5 text-right text-gray-500 font-mono italic">
                              {!isRentOutOrReturnable && t.upi !== 0 ? fmt(Math.abs(t.upi)) : "-"}
                            </td>
                            <td className="px-4 py-2.5 text-right text-gray-700 font-mono font-bold italic">
                              {isRentOutOrReturnable ? fmt(Math.abs(tCash)) : fmt(Math.abs(tTotal))}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              ) : (
                transactions.map((t, i) => {
                  const dateStr = t.date
                    ? new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                    : "-";
                  const isRentOutOrReturnable = cat === "RentOut" || cat === "Returnable Income";
                  const isIncentiveCat = cat.toLowerCase() === "incentive";
                  const tCash = isRentOutOrReturnable ? (t.amount || 0) : (t.cash || 0);
                  const tTotal = tCash + (t.rbl || 0) + (t.bank || 0) + (t.upi || 0);
                  
                  return (
                    <tr key={`${catKey}-tx-${i}`} className="bg-white hover:bg-slate-50/60 border-b border-slate-50 text-xs">
                      <td className="px-4 py-2.5 text-gray-500 pl-8 whitespace-nowrap italic">{dateStr}</td>
                      <td className="px-4 py-2.5 text-gray-600 font-medium italic">{t.originalSubCategory || t.subCategory || getCategoryLabel(cat)}</td>
                      <td className="px-4 py-2.5 text-gray-700 italic">
                        {isIncentiveCat ? (t.remark || t.customerName || "-") : (t.customerName || "-")}
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 italic max-w-[180px] truncate" title={t.remark || ""}>
                        {t.remark || "-"}
                      </td>
                      {showBranch && (
                        <td className="px-4 py-2.5 text-gray-600 font-medium italic">
                          {getBranchName(t.locCode)}
                        </td>
                      )}
                      <td className="px-4 py-2.5 text-right text-gray-600 font-mono italic">
                        {!isRentOutOrReturnable && t.rbl !== 0 ? fmt(Math.abs(t.rbl)) : "-"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-600 font-mono italic">
                        {tCash !== 0 ? fmt(Math.abs(tCash)) : "-"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-600 font-mono italic">
                        {!isRentOutOrReturnable && t.bank !== 0 ? fmt(Math.abs(t.bank)) : "-"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-600 font-mono italic">
                        {!isRentOutOrReturnable && t.upi !== 0 ? fmt(Math.abs(t.upi)) : "-"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-800 font-mono font-bold italic">
                        {isRentOutOrReturnable ? fmt(Math.abs(tCash)) : fmt(Math.abs(tTotal))}
                      </td>
                    </tr>
                  );
                })
              )}
            </>
          )}
        </tbody>
      );
    });

  const hasData = !loading && (
    Object.keys(incomeGrouped).length > 0 ||
    Object.keys(returnableIncomeGrouped).length > 0 ||
    Object.keys(expenseGrouped).length > 0 ||
    Object.keys(holdedSecRefundGrouped).length > 0 ||
    Object.keys(cashToBankGrouped).length > 0 ||
    Object.keys(bankToCashGrouped).length > 0
  );

  return (
    <>
      <Helmet>
        <title>Income &amp; Expenses Report | RootFin</title>
      </Helmet>
      <Headers />
      
      <div className={`transition-all duration-300 p-3 sm:p-6 bg-[#fbfcfd] min-h-screen ${isSidebarOpen ? 'lg:ml-64 ml-0' : 'ml-0'}`}>
        {/* Page Title & Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ 
            fontSize: "24px", 
            fontWeight: "700", 
            color: "#1e293b",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            margin: "0 0 4px 0"
          }}>
            Income &amp; Expenses Report
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            Detailed overview of Income &amp; Expense Report
          </p>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-end gap-3">
            {/* From Date */}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full h-[38px] bg-white border border-gray-300 rounded-lg px-3 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm"
              />
            </div>

            {/* To Date */}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full h-[38px] bg-white border border-gray-300 rounded-lg px-3 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm"
              />
            </div>

            {/* Category Multi-Select */}
            <div className="flex-1 min-w-[200px] relative" id="category-dropdown-container">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Categories
              </label>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full h-[38px] bg-white border-2 border-gray-600 rounded-lg px-3 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm cursor-pointer text-left"
              >
                {filterCategories.length === 0 ? "All Categories" : `${filterCategories.length} selected`}
              </button>

              {/* Dropdown Menu */}
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto">
                  {allCategories.map((c) => (
                    <label key={c} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                      <input
                        type="checkbox"
                        checked={filterCategories.includes(c)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterCategories([...filterCategories, c]);
                          } else {
                            setFilterCategories(filterCategories.filter(cat => cat !== c));
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                      />
                      <span className="text-xs text-gray-700">{getCategoryLabel(c)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Store & Department Combined Dropdown */}
            {canSelectStore && (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Store / Department
                </label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full h-[38px] bg-white border border-gray-300 rounded-lg px-3 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm cursor-pointer"
                >
                  <option value="all">All (Stores &amp; Departments)</option>
                  <option value="all_stores">{isClusterManager ? "All My Stores" : "All Stores"}</option>
                  {(isAdmin || isSuperAdmin || isFinancialHead) && (
                    <option value="all_depts">All Departments</option>
                  )}
                  
                  <optgroup label="Stores">
                    {(isClusterManager
                      ? STORE_LIST.filter((s) => clusterAllowedLocCodes.includes(s.locCode) && !DEPT_LOC_CODES.includes(s.locCode))
                      : STORE_LIST.filter((s) => !DEPT_LOC_CODES.includes(s.locCode))
                    ).map((s) => (
                      <option key={s.locCode} value={s.locCode}>
                        {s.locName}
                      </option>
                    ))}
                  </optgroup>

                  {(isAdmin || isSuperAdmin || isFinancialHead) && (
                    <optgroup label="Departments">
                      {STORE_LIST.filter((s) => DEPT_LOC_CODES.includes(s.locCode)).map((s) => (
                        <option key={s.locCode} value={s.locCode}>
                          {s.locName}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            )}


            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setFromDate(firstOfMonth());
                  setToDate(today());
                  setFilterCategories([]);
                  setSelectedStore("all");
                  setIncomeRows([]);
                  setReturnableIncomeRows([]);
                  setExpenseRows([]);
                  setHoldedSecurityRefundRows([]);
                  setCashToBankRows([]);
                  setBankToCashRows([]);
                  setExpanded({});
                  setHasSearched(false);
                }}
                className="w-[38px] h-[38px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 border-none"
                style={{ padding: 0 }}
                title="Reset Filters"
              >
                <div className="flex items-center justify-center w-full h-full">
                  <RefreshCw size={15} />
                </div>
              </button>

              <button
                onClick={fetchData}
                disabled={loading}
                className="h-[38px] px-6 bg-[#a855f7] hover:bg-[#9333ea] text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
              >
                {loading ? <RefreshCw size={14} className="animate-spin mr-1.5" /> : null}
                <span>Fetch Data</span>
              </button>


            </div>
          </div>
        </div>

        {/* Summary Metric Cards */}
        {hasData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Income */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[15px] font-bold text-gray-800">Total Income</p>
                  <div className="w-10 h-10 rounded-lg bg-[#dcfce7] text-green-600 flex items-center justify-center shrink-0">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <h3 className="text-[32px] leading-none font-bold text-gray-900 mb-5">{fmt(incTotal)}</h3>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-[13px] text-gray-500">
                    <span>Cash :</span>
                    <strong className="text-gray-800">{fmt(incTotals.cash)}</strong>
                  </div>
                  <div className="flex justify-between text-[13px] text-gray-500">
                    <span>Razorpay :</span>
                    <strong className="text-gray-800">{fmt(incTotals.rbl)}</strong>
                  </div>
                  <div className="flex justify-between text-[13px] text-gray-500">
                    <span>Card/Bank :</span>
                    <strong className="text-gray-800">{fmt(incTotals.bank)}</strong>
                  </div>
                  <div className="flex justify-between text-[13px] text-gray-500">
                    <span>UPI :</span>
                    <strong className="text-gray-800">{fmt(incTotals.upi)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Returnable Income */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[15px] font-bold text-gray-800">Returnable Income</p>
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                </div>
                <h3 className="text-[32px] leading-none font-bold text-gray-900 mb-5">{fmt(retTotal)}</h3>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-[13px] text-gray-500">Total returnable income held</p>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[15px] font-bold text-gray-800">Total Expenses</p>
                  <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <TrendingDown size={20} />
                  </div>
                </div>
                <h3 className="text-[32px] leading-none font-bold text-gray-900 mb-5">{fmt(Math.abs(expTotal))}</h3>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-[13px] text-gray-500">
                    <span>Cash :</span>
                    <strong className="text-gray-800">{fmt(Math.abs(expTotals.cash))}</strong>
                  </div>
                  <div className="flex justify-between text-[13px] text-gray-500">
                    <span>Razorpay :</span>
                    <strong className="text-gray-800">{fmt(Math.abs(expTotals.rbl))}</strong>
                  </div>
                  <div className="flex justify-between text-[13px] text-gray-500">
                    <span>Card/Bank :</span>
                    <strong className="text-gray-800">{fmt(Math.abs(expTotals.bank))}</strong>
                  </div>
                  <div className="flex justify-between text-[13px] text-gray-500">
                    <span>UPI :</span>
                    <strong className="text-gray-800">{fmt(Math.abs(expTotals.upi))}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Difference */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[15px] font-bold text-gray-800">Net Difference</p>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <ArrowUpDown size={20} />
                  </div>
                </div>
                <h3 className={`text-[32px] leading-none font-bold mb-5 ${topNetTotal >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {topNetTotal >= 0 ? fmt(topNetTotal) : `-${fmt(Math.abs(topNetTotal))}`}
                </h3>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-[13px] text-gray-500">
                    <span>Cash :</span>
                    <strong className="text-gray-800">{fmt(topNetCash)}</strong>
                  </div>
                  <div className="flex justify-between text-[13px] text-gray-500">
                    <span>Razorpay :</span>
                    <strong className="text-gray-800">{fmt(topNetRbl)}</strong>
                  </div>
                  <div className="flex justify-between text-[13px] text-gray-500">
                    <span>Card/Bank :</span>
                    <strong className="text-gray-800">{fmt(topNetBank)}</strong>
                  </div>
                  <div className="flex justify-between text-[13px] text-gray-500">
                    <span>UPI :</span>
                    <strong className="text-gray-800">{fmt(topNetUpi)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Table Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="">
                <tr className="bg-[#222]">
                  <th colSpan={colCount} className="h-2 p-0"></th>
                </tr>
                <tr className="bg-white border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-700 pl-8">DATE</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-700">CATEGORY/ SUBCATEGORY</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-700">CUSTOMER</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-700">REMARKS</th>
                  {showBranch && <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-700">BRANCH</th>}
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-700">RAZORPAY</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-700">CASH</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-700">CARD/ BANK</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-700">UPI</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-700">TOTAL</th>
                </tr>
              </thead>

              {loading && (
                <tbody>
                  <tr>
                    <td colSpan={colCount} className="px-4 py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <RefreshCw size={28} className="animate-spin text-blue-600" />
                        <p className="font-medium text-gray-600">Loading Income &amp; Expense data...</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              )}

              {!loading && !hasData && !hasSearched && (
                <tbody>
                  <tr>
                    <td colSpan={colCount} className="px-4 py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Filter size={32} className="text-gray-300" />
                        <p className="text-base font-medium text-gray-600">Apply a filter to load data.</p>
                        <p className="text-xs text-gray-400">Select dates and category, then click "Fetch Data".</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              )}

              {!loading && !hasData && hasSearched && (
                <tbody>
                  <tr>
                    <td colSpan={colCount} className="px-4 py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-base font-medium text-gray-600">No records match the selected filters.</p>
                        <p className="text-xs text-gray-400">Try choosing a wider date range or different category.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              )}

              {hasData && (
                <>
                  {/* 1. INCOME SECTION */}
                  <tbody>
                    <tr className="bg-white border-b-0 border-y border-transparent">
                      <td colSpan={colCount} className="px-4 py-3 text-sm font-black text-green-700 uppercase tracking-wider relative">
                        <div className="absolute left-0 top-1 bottom-1 w-1 bg-green-500 rounded-r-md"></div>
                        <div className="flex justify-between items-center pl-2">
                          <span className="inline-flex items-center gap-2">
                            <TrendingUp size={18} className="text-green-600" />
                            INCOME
                          </span>
                          <span className="px-2 py-0.5 rounded-full border border-green-200 text-[10px] text-green-700 bg-white">
                            {Object.keys(incomeGrouped).length} Categories
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>

                  {renderCategoryRows(incomeGrouped, "INCOME", true)}

                  <tbody>
                    <tr className="bg-[#1c1c1c] border-t border-[#1c1c1c]">
                      <td colSpan={showBranch ? 5 : 4} className="px-4 py-3 text-right text-sm font-bold text-white">
                        TOTAL
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{incTotals.rbl  !== 0 ? fmt(Math.abs(incTotals.rbl))  : "-"}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{incTotals.cash !== 0 ? fmt(Math.abs(incTotals.cash)) : "-"}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{incTotals.bank !== 0 ? fmt(Math.abs(incTotals.bank)) : "-"}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{incTotals.upi  !== 0 ? fmt(Math.abs(incTotals.upi))  : "-"}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-white font-mono">{fmt(Math.abs(incTotal))}</td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tbody>

                  {/* 2. RETURNABLE INCOME (Single tab/row) */}
                  {renderCategoryRows(returnableIncomeGrouped, "RETURNABLE", false, true)}

                  {/* 3. BANK TO CASH (Single tab/row) */}
                  {renderCategoryRows(bankToCashGrouped, "BANK_CASH", true, false, true)}

                  <tbody>
                    <tr className="bg-[#1c1c1c] border-t border-[#1c1c1c]">
                      <td colSpan={showBranch ? 5 : 4} className="px-4 py-3 text-right text-sm font-bold text-white">
                        TOTAL
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{retAndBankCashTotals.rbl  !== 0 ? fmt(Math.abs(retAndBankCashTotals.rbl))  : "-"}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{retAndBankCashTotals.cash !== 0 ? fmt(Math.abs(retAndBankCashTotals.cash)) : "-"}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{retAndBankCashTotals.bank !== 0 ? fmt(Math.abs(retAndBankCashTotals.bank)) : "-"}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{retAndBankCashTotals.upi  !== 0 ? fmt(Math.abs(retAndBankCashTotals.upi))  : "-"}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-white font-mono">{fmt(Math.abs(retAndBankCashTotal))}</td>
                      <td className="px-4 py-3"></td>
                    </tr>
                    <tr className="bg-[#1c1c1c] border-t border-[#333]">
                      <td colSpan={showBranch ? 5 : 4} className="px-4 py-3 text-right text-sm font-bold text-white">
                        TOTAL INCOME
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{grandTotalIncomeTotals.rbl  !== 0 ? fmt(Math.abs(grandTotalIncomeTotals.rbl))  : "-"}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{grandTotalIncomeTotals.cash !== 0 ? fmt(Math.abs(grandTotalIncomeTotals.cash)) : "-"}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{grandTotalIncomeTotals.bank !== 0 ? fmt(Math.abs(grandTotalIncomeTotals.bank)) : "-"}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{grandTotalIncomeTotals.upi  !== 0 ? fmt(Math.abs(grandTotalIncomeTotals.upi))  : "-"}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-white font-mono">{fmt(Math.abs(grandTotalIncome))}</td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tbody>

                  {/* 4. EXPENSES SECTION */}
                  <tbody>
                    <tr className="bg-white border-b-0 border-y border-transparent mt-4">
                      <td colSpan={colCount} className="px-4 py-3 text-sm font-black text-rose-600 uppercase tracking-wider relative">
                        <div className="absolute left-0 top-1 bottom-1 w-1 bg-rose-500 rounded-r-md"></div>
                        <div className="flex justify-between items-center pl-2">
                          <span className="inline-flex items-center gap-2">
                            <TrendingDown size={18} className="text-rose-600" />
                            EXPENSE
                          </span>
                          <span className="px-2 py-0.5 rounded-full border border-rose-200 text-[10px] text-rose-600 bg-white">
                            {Object.keys(expenseGrouped).length} Categories
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>

                  {renderCategoryRows(expenseGrouped, "EXPENSE", false)}

                  <tbody>
                    <tr className="bg-[#1c1c1c] border-t border-[#1c1c1c]">
                      <td colSpan={showBranch ? 5 : 4} className="px-4 py-3 text-right text-sm font-bold text-white">
                        TOTAL
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{expTotals.rbl  !== 0 ? fmt(Math.abs(expTotals.rbl)) : "-"}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{expTotals.cash !== 0 ? fmt(Math.abs(expTotals.cash)) : "-"}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{expTotals.bank !== 0 ? fmt(Math.abs(expTotals.bank)) : "-"}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{expTotals.upi  !== 0 ? fmt(Math.abs(expTotals.upi)) : "-"}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-white font-mono">{expTotal !== 0 ? fmt(Math.abs(expTotal)) : "-"}</td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tbody>

                  {/* 5. SECURITY REFUND (Single tab/row) */}
                  {renderCategoryRows(holdedSecRefundGrouped, "HOLDED_SEC", false, false, true)}

                  {/* 6. CASH TO BANK (Single tab/row) */}
                  {renderCategoryRows(cashToBankGrouped, "CASH_BANK", false, false, true)}

                  <tbody>
                    <tr className="bg-[#1c1c1c] border-t border-[#1c1c1c]">
                      <td colSpan={showBranch ? 5 : 4} className="px-4 py-3 text-right text-sm font-bold text-white">
                        TOTAL
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{holdedAndCashBankTotals.rbl  !== 0 ? fmt(Math.abs(holdedAndCashBankTotals.rbl))  : "-"}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{holdedAndCashBankTotals.cash !== 0 ? fmt(Math.abs(holdedAndCashBankTotals.cash)) : "-"}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{holdedAndCashBankTotals.bank !== 0 ? fmt(Math.abs(holdedAndCashBankTotals.bank)) : "-"}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{holdedAndCashBankTotals.upi  !== 0 ? fmt(Math.abs(holdedAndCashBankTotals.upi))  : "-"}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-white font-mono">{fmt(Math.abs(holdedAndCashBankTotal))}</td>
                      <td className="px-4 py-3"></td>
                    </tr>
                    <tr className="bg-[#1c1c1c] border-t border-[#333]">
                      <td colSpan={showBranch ? 5 : 4} className="px-4 py-3 text-right text-sm font-bold text-white">
                        TOTAL EXPENSES
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{grandTotalExpenseTotals.rbl  !== 0 ? fmt(Math.abs(grandTotalExpenseTotals.rbl))  : "-"}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{grandTotalExpenseTotals.cash !== 0 ? fmt(Math.abs(grandTotalExpenseTotals.cash)) : "-"}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{grandTotalExpenseTotals.bank !== 0 ? fmt(Math.abs(grandTotalExpenseTotals.bank)) : "-"}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-white font-mono">{grandTotalExpenseTotals.upi  !== 0 ? fmt(Math.abs(grandTotalExpenseTotals.upi))  : "-"}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-white font-mono">{fmt(Math.abs(grandTotalExpense))}</td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tbody>

                  {/* 7. NET DIFFERENCE SECTION (Total Income - Total Expenses) */}
                  <tbody>
                    <tr className="bg-blue-50/90 border-t-4 border-blue-300">
                      <td colSpan={showBranch ? 5 : 4} className="px-4 py-3.5 text-right text-sm font-black text-blue-950 uppercase tracking-wider">
                        Net Difference Total:
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs font-bold text-gray-900 font-mono">{tableNetRbl  !== 0 ? fmt(tableNetRbl)  : "-"}</td>
                      <td className="px-4 py-3.5 text-right text-xs font-bold text-gray-900 font-mono">{tableNetCash !== 0 ? fmt(tableNetCash) : "-"}</td>
                      <td className="px-4 py-3.5 text-right text-xs font-bold text-gray-900 font-mono">{tableNetBank !== 0 ? fmt(tableNetBank) : "-"}</td>
                      <td className="px-4 py-3.5 text-right text-xs font-bold text-gray-900 font-mono">{tableNetUpi  !== 0 ? fmt(tableNetUpi)  : "-"}</td>
                      <td className={`px-4 py-3.5 text-right text-base font-black font-mono ${tableNetTotal >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {tableNetTotal >= 0 ? fmt(tableNetTotal) : `-${fmt(Math.abs(tableNetTotal))}`}
                      </td>
                      <td className="px-4 py-3.5"></td>
                    </tr>
                  </tbody>
                </>
              )}
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
