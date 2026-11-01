import Headers from '../components/Header.jsx';
import { customAlert } from '../utils/customAlert.jsx';
import React, { useEffect, useRef, useState } from "react";
import { useEnterToSave } from "../hooks/useEnterToSave";
import Select, { components } from "react-select";
import baseUrl from '../api/api.js';
import { CSVLink } from 'react-csv';
import { Helmet } from "react-helmet";
import { FiDownload } from "react-icons/fi";
import useSidebar from "../hooks/useSidebar";
import LoadingScreen from "../components/LoadingScreen.jsx";

const CheckboxOption = (props) => {
  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
          className="w-4 h-4 text-[#9B48D7] rounded border-gray-300 focus:ring-0 pointer-events-none accent-[#9B48D7]"
        />
        <span>{props.label}</span>
      </div>
    </components.Option>
  );
};

const categories = [
  { value: "all", label: "All" },
  { value: "booking", label: "Booking" },
  { value: "RentOut", label: "Rent Out" },
  { value: "Refund", label: "Refund" },
  { value: "Return", label: "Return" },
  { value: "Cancel", label: "Cancel" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "money transfer", label: "Cash to Bank" },
];

const DEPT_LOC_CODES = ["759", "102", "101", "858", "103"];

const getTxId = (t) => String(t?._id?.$oid || t?._id || t?.id || "");

const getAttachmentUrl = (t) => {
  if (!t) return "";
  const id = getTxId(t);
  const direct = t.attachment || t.file || t.documentUrl || t.image;
  if (typeof direct === "string" && direct && !["Yes", "No"].includes(direct)) return direct;
  const hasFile = t.hasAttachment || (direct && typeof direct === "object");
  if (hasFile && id) return `${baseUrl.baseUrl}user/transaction/${id}/attachment`;
  return "";
};

const downloadTxAttachment = async (t) => {
  const url = getAttachmentUrl(t);
  if (!url) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("download failed");
    const blob = await res.blob();
    const cd = res.headers.get("Content-Disposition") || "";
    const match = cd.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i);
    const filename = match ? decodeURIComponent(match[1].replace(/"/g, "").trim()) : "attachment";
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

const AttachmentDownloadCell = ({ t }) => {
  if (!getAttachmentUrl(t)) return "-";
  return (
    <button
      type="button"
      title="Download attachment"
      onClick={() => downloadTxAttachment(t)}
      className="inline-flex items-center justify-center text-green-600 hover:text-green-800"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </button>
  );
};


const headers = [
  { label: "Date", key: "date" },
  { label: "Invoice No", key: "invoiceNo" },
  { label: "Customer Name", key: "customerName" },
  { label: "Quantity", key: "quantity" },
  { label: "Category", key: "Category" },
  { label: "Sub Category", key: "SubCategory" },
  { label: "Balance Payable", key: "SubCategory1" },
  { label: "Amount", key: "amount" },
  { label: "Total Transaction", key: "totalTransaction" },
  { label: "security", key: "securityAmount" },
  { label: "Balance Payable", key: "Balance" },
  { label: "Remark", key: "remark" },
  { label: "Discount", key: "discountAmount" },
  { label: "Bill Value", key: "billValue" },
  { label: "Cash", key: "cash" },
  { label: "Razorpay", key: "rbl" },
  { label: "Card/Bank", key: "bank" },
  { label: "UPI", key: "upi" },
  { label: "Attachment", key: "attachment" },
  { label: "Branch", key: "branch" },
];

const subCategories = [
  { value: "all", label: "All" },
  { value: "advance", label: "Advance" },
  { value: "Balance Payable", label: "Balance Payable" },
  { value: "security", label: "Security" },
  { value: "cancellation Refund", label: "Cancellation Refund" },
  { value: "security Refund", label: "Security Refund" },
  { value: "compensation", label: "Compensation" },
  { value: "petty expenses", label: "Office Expense" },
  { value: "shoe sales", label: "Shoe Sales" },
  { value: "shirt sales", label: "Shirt Sales" },
  { value: "mixed sales", label: "Mixed Sales (Shoes & Shirts)" },
  { value: "bulk amount transfer", label: "Cash to Bank" },
  // Expense sub-categories
  { value: "ac service", label: "Ac service" },
  { value: "interior maintenance", label: "Interior Maintenance" },
  { value: "glass cleaning", label: "Glass Cleaning" },
  { value: "electrical work", label: "Electrical work" },
  { value: "telephone/wifi", label: "Telephone/wifi" },
  { value: "printout", label: "Printout" },
  { value: "books/pen/checklist/register/bill book/voucher", label: "Books/pen/Checklist/Register/Bill Book/Voucher" },
  { value: "stationary items", label: "Stationary Items" },
  { value: "cake purchase", label: "Cake purchase" },
  { value: "food allowance on special occassion", label: "Food allowance on Special Occassion" },
  { value: "other refreshment", label: "Other Refreshment" },
  { value: "staff room rent/electricity", label: "Staff room rent/Electricity" },
  { value: "steamer", label: "Steamer" },
  { value: "chairs", label: "Chairs" },
  { value: "electronic items", label: "Electronic Items" },
  { value: "any other furniture items", label: "Any other Furniture items" },
  { value: "spot incentive", label: "Spot incentive" },
  { value: "weekly incentive", label: "Weekly incentive" },
  { value: "dry cleaning", label: "Dry Cleaning" },
  { value: "altration", label: "Altration" },
  { value: "material", label: "Material" },
  { value: "courier charges", label: "Courier Charges" },
  { value: "maintenance expenses", label: "Repairs & Maintenance" },
  { value: "travel exp", label: "Travel Exp" },
  { value: "fuel exp", label: "Fuel Exp" },
  { value: "telephone internet", label: "Internet Expense" },
  { value: "utility bill", label: "Electricity Charges" },
  { value: "waste management", label: "Waste Management" },
  { value: "water charges", label: "Water Charges" },
  { value: "salary", label: "Salary / Salary Advance" },
  { value: "printing stationary", label: "Printing & Stationary" },
  { value: "staff welfare", label: "Staff Welfare" },
  { value: "staff reimbursement", label: "Staff Accommodation" },
  { value: "rent", label: "Store Rent" },
  { value: "asset purchase", label: "Asset Purchase" },
  { value: "incentive", label: "Incentive" },
  { value: "spot incentive", label: "Incentive (Spot)" },
  { value: "other expenses", label: "Refund" },
  { value: "write off", label: "Write Off" },
  { value: "promotion_services", label: "Promotion / Services" },
  { value: "shoe sales return", label: "Shoe Sales Return" },
  { value: "shirt sales return", label: "Shirt Sales Return" },
  { value: "mixed sales return", label: "Mixed Sales Return" },
  // Income sub-categories
  { value: "compensation from cancellation", label: "Compensation from Cancellation" },
  { value: "compensation from product damage", label: "Compensation from Product Damage" },
  { value: "petty cash received", label: "Petty Cash Received" },
  { value: "bank to cash", label: "Bank to Cash" },
];

// Maps raw DB category/subCategory values → human-readable labels
const CATEGORY_LABEL_MAP = {
  "dry cleaning": "Dry Cleaning",
  "altration": "Altration",
  "material": "Material",
  "courier charges": "Courier Charges",
  "maintenance expenses": "Repairs & Maintenance",
  "travel exp": "Travel Exp",
  "fuel exp": "Fuel Exp",
  "petty expenses": "Office Expense",
  "petty cash received": "Petty Cash Received",
  "telephone internet": "Internet Expense",
  "utility bill": "Electricity Charges",
  "waste management": "Waste Management",
  "water charges": "Water Charges",
  "salary": "Salary / Salary Advance",
  "printing stationary": "Printing & Stationary",
  "staff welfare": "Staff Welfare",
  "staff reimbursement": "Staff Accommodation",
  "rent": "Store Rent",
  "store rent": "Store Rent",
  "asset purchase": "Asset Purchase",
  "incentive": "Incentive",
  "spot incentive": "Incentive",
  "compensation": "Compensation",
  "other expenses": "Refund",
  "bulk amount transfer": "Cash to Bank",
  "write off": "Write Off",
  "promotion_services": "Promotion / Services",
  "shoe sales return": "Shoe Sales Return",
  "shirt sales return": "Shirt Sales Return",
  "mixed sales return": "Mixed Sales Return",
  "shoe sales": "Shoe Sales",
  "shirt sales": "Shirt Sales",
  "mixed sales": "Mixed Sales",
};
const getCatLabel = (val) => CATEGORY_LABEL_MAP[(val || "").toLowerCase().trim()] || val;

// Resolves subcategory label for transactions, ensuring Shoe/Shirt sales returns are correctly labeled
const resolveSubCategoryLabel = (rawSubCat, isReturn, tx = {}) => {
  const lower = (rawSubCat || "").toLowerCase().trim();
  if (isReturn) {
    if (lower === "shoe sales return" || lower === "shoe sales" || lower === "shoe") {
      return "Shoe Sales Return";
    }
    if (lower === "shirt sales return" || lower === "shirt sales" || lower === "shirt") {
      return "Shirt Sales Return";
    }
    if (lower === "mixed sales return" || lower === "mixed sales" || lower === "mixed") {
      return "Mixed Sales Return";
    }
    if (lower === "general" || lower === "general return" || lower === "return" || !lower) {
      const text = `${tx?.remark || ""} ${tx?.remarks || ""} ${tx?.invoiceNo || ""} ${tx?.customerName || ""}`.toLowerCase();
      if (text.includes("shoe")) return "Shoe Sales Return";
      if (text.includes("shirt")) return "Shirt Sales Return";
      if (text.includes("mixed")) return "Mixed Sales Return";
      return rawSubCat ? (rawSubCat.toLowerCase().endsWith("return") ? rawSubCat : `${rawSubCat} Return`) : "Return";
    }
    if (rawSubCat && !lower.endsWith("return")) {
      return `${rawSubCat} Return`;
    }
    return getCatLabel(rawSubCat);
  }
  return rawSubCat;
};

const AllLoation = [
  { locName: "Z-Edapally1", locCode: "144" },
  { locName: "Warehouse", locCode: "858" },
  { locName: "G-Edappally", locCode: "702" },
  { locName: "HEAD OFFICE01", locCode: "759" },
  { locName: "SG-Trivandrum", locCode: "700" },
  { locName: "Z- Edappal", locCode: "100" },
  { locName: "Z.Perinthalmanna", locCode: "133" },
  { locName: "Z.Kottakkal", locCode: "122" },
  { locName: "G.Kottayam", locCode: "701" },
  { locName: "G.Perumbavoor", locCode: "703" },
  { locName: "G.Thrissur", locCode: "704" },
  { locName: "G.Chavakkad", locCode: "706" },
  { locName: "G.Calicut ", locCode: "712" },
  { locName: "G.Vadakara", locCode: "708" },
  { locName: "G.Edappal", locCode: "707" },
  { locName: "G.Perinthalmanna", locCode: "709" },
  { locName: "G.Kottakkal", locCode: "711" },
  { locName: "G.Manjeri", locCode: "710" },
  { locName: "G.Palakkad ", locCode: "705" },
  { locName: "G.Kalpetta", locCode: "717" },
  { locName: "G.Kannur", locCode: "716" },
  { locName: "G.MG Road", locCode: "718" },
  { locName: "Dappr Squad", locCode: "555" },
  { locName: "WAREHOUSE", locCode: "103" }
];

const allStoresCsvHeaders = [
  { label: "Store", key: "store" },
  { label: "LocCode", key: "locCode" },
  { label: "Cash", key: "cash" },
  { label: "Razorpay", key: "rbl" }, // ✅ Added RBL to all stores CSV headers
  { label: "Card/Bank", key: "bank" },
  { label: "UPI", key: "upi" },
  { label: "Total Amount", key: "amount" },
];

const multiBranchCsvHeaders = headers;

const Datewisedaybook = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [apiUrl5, setApiUrl5] = useState("");
  const [preOpen, setPreOpen] = useState([])

  const currentusers = JSON.parse(localStorage.getItem("rootfinuser")) || {};

  const isClusterManager = (currentusers.role || "").toLowerCase() === "cluster_manager";
  const isFinancialHead = (currentusers.role || "").toLowerCase() === "financial_head";
  const showAction = (currentusers.power || "").toLowerCase() === "admin" || (currentusers.role || "").toLowerCase() === "superadmin" || isFinancialHead;
  const clusterAllowedLocCodes = currentusers.allowedLocCodes || [];

  const ADMIN_DEPT_LOC_CODES = new Set(["759", "102", "101", "858", "103"]);
  const DEPT_LOC_CODES = ["759", "102", "101", "858", "103"];
  const isAdminOrSuperAdmin = (currentusers.power || "").toLowerCase() === "admin" || (currentusers.role || "").toLowerCase() === "superadmin";
  // Expense categories that should be hidden from store/cluster users when entered by admin depts
  const EXPENSE_CATEGORIES_SET = new Set([
    "expense", "petty expenses", "staff reimbursement", "maintenance expenses",
    "telephone internet", "utility bill", "salary", "rent", "courier charges",
    "asset purchase", "promotion_services", "spot incentive", "other expenses",
    "shoe sales return", "shirt sales return", "dry cleaning", "altration",
    "material", "travel exp", "fuel exp", "waste management", "water charges",
    "printing stationary", "staff welfare", "staff accommodation", "incentive", "write off",
  ]);

  // Returns true if a transaction is an admin-entered expense/income that should be hidden from store-level daybook & financial summary
  const isAdminExpense = (tx) => {
    return !!tx.isAdminLevel;
  };

  // For cluster managers, filter AllLoation to only their allowed stores
  const visibleLocations = isClusterManager
    ? AllLoation.filter(s => clusterAllowedLocCodes.includes(s.locCode))
    : AllLoation;

  const [selectedStore, setSelectedStore] = useState("current");
  const [selectedDepartment, setSelectedDepartment] = useState("all_departments"); // ✅ Reverted to single select, defaulting to all_departments
  const [allStoresSummary, setAllStoresSummary] = useState([]);
  const [allStoresTotals, setAllStoresTotals] = useState({ cash: 0, rbl: 0, bank: 0, upi: 0, amount: 0 }); // ✅ Added rbl
  const [selectedStores, setSelectedStores] = useState([]); // stores selected for multi-branch view
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  const [multiBranchData, setMultiBranchData] = useState([]); // merged transactions from all selected stores
  const [multiBranchFetching, setMultiBranchFetching] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleSidebarChange = (e) => {
      if (e.detail && typeof e.detail.isOpen === "boolean") {
        setIsSidebarOpen(e.detail.isOpen);
      }
    };
    window.addEventListener("sidebar-changed", handleSidebarChange);
    return () => window.removeEventListener("sidebar-changed", handleSidebarChange);
  }, []);

  const handleFetch = async () => {
    setIsFetching(true);
    setPreOpen([]);

    const prev = new Date(new Date(fromDate));
    prev.setDate(prev.getDate() - 1);

    const prevDayStr = new Date(fromDate) < new Date("2025-01-01")
      ? "2025-01-01"
      : new Date(new Date(fromDate).setDate(new Date(fromDate).getDate() - 1)).toISOString().split("T")[0];

    const twsBase = "https://rentalapi.rootments.live/api/GetBooking";
    const bookingU = `${twsBase}/GetBookingList?LocCode=${currentusers.locCode}&DateFrom=${fromDate}&DateTo=${toDate}`;
    const rentoutU = `${twsBase}/GetRentoutList?LocCode=${currentusers.locCode}&DateFrom=${fromDate}&DateTo=${toDate}`;
    const returnU = `${twsBase}/GetReturnList?LocCode=${currentusers.locCode}&DateFrom=${fromDate}&DateTo=${toDate}`;
    const deleteU = `${twsBase}/GetDeleteList?LocCode=${currentusers.locCode}&DateFrom=${fromDate}&DateTo=${toDate}`;
    const mongoU = `${baseUrl.baseUrl}user/Getpayment?LocCode=${currentusers.locCode}&DateFrom=${fromDate}&DateTo=${toDate}`;
    const openingU = `${baseUrl.baseUrl}user/getsaveCashBank?locCode=${currentusers.locCode}&date=${prevDayStr}`;

    setApiUrl5(openingU);
    GetCreateCashBank(openingU);

    // Helper to get store footer totals with RBL support and refund bank/UPI prevention
    async function getStoreFooterTotals(locCode, fromDate, toDate) {
      const prev = new Date(new Date(fromDate));
      prev.setDate(prev.getDate() - 1);
      const prevDayStr = new Date(fromDate) < new Date("2025-01-01")
        ? "2025-01-01"
        : new Date(new Date(fromDate).setDate(new Date(fromDate).getDate() - 1)).toISOString().split("T")[0];

      let openingCash = 0, openingRbl = 0; // ✅ Added openingRbl
      try {
        const openRes = await fetch(`${baseUrl.baseUrl}user/getsaveCashBank?locCode=${locCode}&date=${prevDayStr}`);
        const openData = await openRes.json();
        // ✅ CRITICAL FIX: Use 'cash' field (calculated closing cash) for opening balance, not 'Closecash' (physical cash)
        // The 'cash' field contains the previous day's total closing cash, which should be today's opening
        openingCash = Number(openData?.data?.cash ?? openData?.data?.Closecash ?? 0);
        openingRbl = Number(openData?.data?.rbl ?? 0); // ✅ Added RBL opening
      } catch { }

      const twsBase = "https://rentalapi.rootments.live/api/GetBooking";
      const bookingU = `${twsBase}/GetBookingList?LocCode=${locCode}&DateFrom=${fromDate}&DateTo=${toDate}`;
      const rentoutU = `${twsBase}/GetRentoutList?LocCode=${locCode}&DateFrom=${fromDate}&DateTo=${toDate}`;
      const returnU = `${twsBase}/GetReturnList?LocCode=${locCode}&DateFrom=${fromDate}&DateTo=${toDate}`;
      const deleteU = `${twsBase}/GetDeleteList?LocCode=${locCode}&DateFrom=${fromDate}&DateTo=${toDate}`;
      const mongoU = `${baseUrl.baseUrl}user/Getpayment?LocCode=${locCode}&DateFrom=${fromDate}&DateTo=${toDate}`;

      let overrideRowsStore = [];
      try {
        const res = await fetch(
          `${baseUrl.baseUrl}api/tws/getEditedTransactions?fromDate=${fromDate}&toDate=${toDate}&locCode=${locCode}`
        );
        const json = await res.json();
        overrideRowsStore = json?.data || [];
      } catch { }

      let bookingData = {}, rentoutData = {}, returnData = {}, deleteData = {}, mongoData = {};
      try {
        const [bookingRes, rentoutRes, returnRes, deleteRes, mongoRes] = await Promise.all([
          fetch(bookingU), fetch(rentoutU), fetch(returnU), fetch(deleteU), fetch(mongoU)
        ]);
        [bookingData, rentoutData, returnData, deleteData, mongoData] = await Promise.all([
          bookingRes.json(), rentoutRes.json(), returnRes.json(), deleteRes.json(), mongoRes.json()
        ]);
      } catch { }

      const bookingList = (bookingData?.dataSet?.data || []).map(item => {
        const discountAmount = Number(item.discountAmount || 0);
        const billVal = Number(item.invoiceAmount || 0) + discountAmount;
        return {
          ...item,
          date: item.bookingDate?.split("T")[0],
          time: item?.time || item?.bookingTime || (item?.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (item?.bookingDate && item.bookingDate.includes("T") ? new Date(item.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "")),
          invoiceNo: item.invoiceNo,
          customerName: item.customerName,
          quantity: item.quantity || 1,
          Category: "Booking",
          SubCategory: "Advance",
          discountAmount: discountAmount,
          billValue: billVal,
          cash: Number(item.bookingCashAmount || 0),
          rbl: Number(item.rblRazorPay || 0), // ✅ Added RBL mapping
          bank: Number(item.bookingBankAmount || 0),
          upi: Number(item.bookingUPIAmount || 0),
          amount: Number(item.bookingCashAmount || 0) + Number(item.rblRazorPay || 0) + Number(item.bookingBankAmount || 0) + Number(item.bookingUPIAmount || 0),
          totalTransaction: Number(item.bookingCashAmount || 0) + Number(item.rblRazorPay || 0) + Number(item.bookingBankAmount || 0) + Number(item.bookingUPIAmount || 0),
          remark: "",
          source: "booking"
        };
      });

      const rentoutList = (rentoutData?.dataSet?.data || []).map(item => {
        const advance = Number(item.advanceAmount || 0);
        const security = Number(item.securityAmount || 0);
        const balancePayable = Number(item.invoiceAmount || 0) - advance;
        const totalSplit = security + balancePayable;
        const discountAmount = Number(item.discountAmount || 0);
        const billVal = Number(item.invoiceAmount || 0) + discountAmount;
        return {
          ...item,
          date: (item.rentOutDate || "").split("T")[0],
          time: item?.time || item?.rentOutTime || (item?.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (item?.rentOutDate && item.rentOutDate.includes("T") ? new Date(item.rentOutDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "")),
          invoiceNo: item.invoiceNo,
          customerName: item.customerName,
          quantity: item.quantity || 1,
          Category: "RentOut",
          SubCategory: "Security",
          SubCategory1: "Balance Payable",
          securityAmount: security,
          Balance: balancePayable,
          discountAmount: discountAmount,
          billValue: billVal,
          cash: Number(item.rentoutCashAmount || 0),
          rbl: Number(item.rblRazorPay || 0), // ✅ Added RBL mapping
          bank: Number(item.rentoutBankAmount || 0),
          upi: Number(item.rentoutUPIAmount || 0),
          amount: totalSplit,
          totalTransaction: totalSplit,
          remark: "",
          source: "rentout"
        };
      });

      // ✅ Updated return list with RBL prevention logic
      const returnList = (returnData?.dataSet?.data || []).map(item => {
        const returnCashAmount = -Math.abs(Number(item.returnCashAmount || 0));
        const returnRblAmount = -Math.abs(Number(item.rblRazorPay || 0));

        // ✅ Only process bank/UPI if no RBL value
        const returnBankAmount = returnRblAmount !== 0 ? 0 : -Math.abs(Number(item.returnBankAmount || 0));
        const returnUPIAmount = returnRblAmount !== 0 ? 0 : -Math.abs(Number(item.returnUPIAmount || 0));
        const discountAmount = Number(item.discountAmount || 0);
        const billVal = Number(item.invoiceAmount || 0) + discountAmount;

        return {
          ...item,
          date: (item.returnedDate || item.returnDate || item.createdDate || "").split("T")[0],
          time: item?.time || item?.returnedTime || (item?.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (item?.returnedDate && item.returnedDate.includes("T") ? new Date(item.returnedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "")),
          customerName: item.customerName || item.custName || item.customer || "",
          invoiceNo: item.invoiceNo,
          Category: "Return",
          SubCategory: "Security Refund",
          securityAmount: Math.abs(returnCashAmount + returnRblAmount + returnBankAmount + returnUPIAmount),
          discountAmount: discountAmount,
          billValue: billVal,
          cash: returnCashAmount,
          rbl: returnRblAmount,
          bank: returnBankAmount,
          upi: returnUPIAmount,
          amount: returnCashAmount + returnRblAmount + returnBankAmount + returnUPIAmount,
          totalTransaction: returnCashAmount + returnRblAmount + returnBankAmount + returnUPIAmount,
          remark: "",
          source: "return"
        };
      });

      // ✅ Updated delete list with RBL prevention logic
      const deleteList = (deleteData?.dataSet?.data || []).map(item => {
        const deleteCashAmount = -Math.abs(Number(item.deleteCashAmount || 0));
        const deleteRblAmount = -Math.abs(Number(item.rblRazorPay || 0));

        // ✅ Only process bank/UPI if no RBL value
        const deleteBankAmount = deleteRblAmount !== 0 ? 0 : -Math.abs(Number(item.deleteBankAmount || 0));
        const deleteUPIAmount = deleteRblAmount !== 0 ? 0 : -Math.abs(Number(item.deleteUPIAmount || 0));
        const discountAmount = Number(item.discountAmount || 0);
        const billVal = Number(item.invoiceAmount || 0) + discountAmount;

        return {
          ...item,
          date: item.cancelDate?.split("T")[0],
          time: item?.time || item?.cancelTime || (item?.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (item?.cancelDate && item.cancelDate.includes("T") ? new Date(item.cancelDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "")),
          invoiceNo: item.invoiceNo,
          customerName: item.customerName,
          Category: "Cancel",
          SubCategory: "Cancellation Refund",
          discountAmount: discountAmount,
          billValue: billVal,
          cash: deleteCashAmount,
          rbl: deleteRblAmount,
          bank: deleteBankAmount,
          upi: deleteUPIAmount,
          amount: deleteCashAmount + deleteRblAmount + deleteBankAmount + deleteUPIAmount,
          totalTransaction: deleteCashAmount + deleteRblAmount + deleteBankAmount + deleteUPIAmount,
          remark: "",
          source: "deleted"
        };
      });

      const mongoList = (mongoData?.data || []).filter(tx => !tx.isAdminLevel).map(tx => {
        const isReturn = (tx.type || "").toLowerCase() === "return" || (tx.subCategory || "").toLowerCase().includes("return") || (tx.category || "").toLowerCase().includes("return") || (tx.invoiceNo || "").toUpperCase().startsWith("RTN-") || (tx.invoiceNo || "").toUpperCase().startsWith("RET-");
        const rawCash = Number(tx.cash || 0);
        const rawRbl = Number(tx.rbl || tx.rblRazorPay || 0);
        const rawBank = Number(tx.bank || 0);
        const rawUpi = Number(tx.upi || 0);
        const cash = isReturn ? -Math.abs(rawCash) : rawCash;
        const rbl = isReturn ? -Math.abs(rawRbl) : rawRbl;
        const bank = isReturn ? -Math.abs(rawBank) : rawBank;
        const upi = isReturn ? -Math.abs(rawUpi) : rawUpi;
        const total = cash + rbl + bank + upi;
        const sign = isReturn ? -1 : 1;
        const isExpense = (tx.type || "").toLowerCase() === "expense";
        const rawSubCat = isExpense ? (tx.category || tx.subCategory || "") : (tx.subCategory || tx.category || "");
        const subCatLabel = resolveSubCategoryLabel(rawSubCat, isReturn, tx);
        const discountAmount = Number(tx.discountAmount || 0);
        const billValue = (Number(tx.billValue || tx.subTotal || 0) || (Number(tx.invoiceAmount || Math.abs(Number(tx.amount) || 0)) + discountAmount)) * sign;
        const finalAmount = isReturn ? -Math.abs(Number(tx.totalTransaction ?? tx.amount ?? total)) : Number(tx.totalTransaction ?? tx.amount ?? total);
        return {
          ...tx,
          date: tx.date?.split("T")[0] || "",
          time: tx?.time || (tx?.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (tx?.date && tx.date.includes("T") ? new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "")),
          Category: tx.type,
          SubCategory: subCatLabel,
          SubCategory1: tx.subCategory1 || tx.SubCategory1 || "",
          customerName: tx.customerName || "",
          remark: (() => { const r = tx.remark || tx.remarks || ""; return (r === "Thanks for your business." || r === "Thanks for your business") ? "" : r; })(),
          discountAmount: discountAmount,
          billValue: billValue,
          cash: cash,
          rbl: rbl,
          bank: bank,
          upi: upi,
          amount: finalAmount,
          totalTransaction: finalAmount,
          source: "mongo",
          _id: tx._id,
          hasAttachment: !!(tx.hasAttachment || tx.attachment?.filename || tx.attachment?.data || (typeof tx.attachment === "string" && tx.attachment)),
        };
      });

      const editedMapStore = new Map();
      overrideRowsStore.forEach(row => {
        const key = String(row.invoiceNo || row.invoice).trim();
        const category = (row.type || row.Category || '').toLowerCase();
        // Create a unique key that includes both invoice number AND category
        const uniqueKey = `${key}-${category}`;
        const cash = Number(row.cash || 0);
        const rbl = Number(row.rbl || 0); // ✅ Added RBL support in overrides
        const bank = Number(row.bank || 0);
        const upi = Number(row.upi || 0);
        const total = cash + rbl + bank + upi;
        editedMapStore.set(uniqueKey, {
          ...row,
          invoiceNo: key,
          Category: row.type,
          SubCategory: row.category,
          SubCategory1: row.subCategory1 || row.SubCategory1 || "Balance Payable",
          billValue: Number(row.billValue ?? row.invoiceAmount ?? 0),
          cash, rbl, bank, upi, // ✅ Added rbl
          amount: total,
          totalTransaction: total,
          source: "edited"
        });
      });

      const allTws = [...bookingList, ...rentoutList, ...returnList, ...deleteList];
      const finalTws = allTws.map(t => {
        const key = String(t.invoiceNo).trim();
        const category = (t.Category || t.category || '').toLowerCase();
        // Match using both invoice number AND category
        const uniqueKey = `${key}-${category}`;
        const override = editedMapStore.get(uniqueKey);
        const isRentOutStore = category === 'rentout';
        return override
          ? {
            ...t,
            ...override,
            Category: override.Category || t.Category || "",
            SubCategory: override.SubCategory || override.category || t.SubCategory || t.category || "",
            SubCategory1: override.SubCategory1 || override.subCategory1 || t.SubCategory1 || t.subCategory1 || "",
            customerName: override.customerName || t.customerName || "",
            date: override.date || t.date || "",
            time: override.time || t.time || "",
            securityAmount: isRentOutStore
              ? Number(override.securityAmount ?? t.securityAmount ?? 0)
              : 0,
            Balance: isRentOutStore
              ? Number(override.Balance ?? t.Balance ?? 0)
              : 0,
            amount: Number(override.amount ?? t.amount),
            totalTransaction: isRentOutStore
              ? Number(override.securityAmount ?? t.securityAmount ?? 0) + Number(override.Balance ?? t.Balance ?? 0)
              : Number(override.totalTransaction ?? t.totalTransaction ?? override.cash + override.rbl + override.bank + override.upi) // ✅ Added rbl
          }
          : t;
      });

      const allTransactions = [...finalTws, ...mongoList];
      const deduped = Array.from(
        new Map(
          allTransactions.map((tx, index) => {
            const dateKey = (tx.date ? new Date(tx.date).toISOString().split("T")[0] : "");
            // Use _id as primary key if available (for mongo transactions), otherwise use invoiceNo + category + date + source + index to prevent partial returns from overwriting
            const key = tx._id
              ? tx._id
              : `${tx.invoiceNo || tx.locCode}-${dateKey}-${tx.Category || tx.type || ""}-${tx.source || ""}-${index}`;
            return [key, tx];
          })
        ).values()
      );

      let cash = openingCash, rbl = openingRbl, bank = 0, upi = 0; // ✅ Added rbl
      deduped.forEach(r => {
        cash += isNaN(+r.cash) ? 0 : +r.cash;
        rbl += isNaN(+r.rbl) ? 0 : +r.rbl; // ✅ Added RBL calculation
        bank += isNaN(+r.bank) ? 0 : +r.bank;
        upi += isNaN(+r.upi) ? 0 : +r.upi;
      });
      return { cash, rbl, bank, upi, amount: cash + rbl + bank + upi }; // ✅ Added rbl
    }

    let locCodesToFetch = [];

    // Process combined Store/Department Dropdown Selection
    if (selectedStore === "all") {
      locCodesToFetch = [...AllLoation.map(loc => loc.locCode).filter(c => !DEPT_LOC_CODES.includes(c))];
    } else if (selectedStore === "current") {
      locCodesToFetch = [currentusers.locCode];
    } else if (selectedStore === "multi") {
      locCodesToFetch = [...selectedStores];
    } else if (selectedStore === "all_departments") {
      locCodesToFetch = DEPT_LOC_CODES;
    } else {
      // Could be an individual store or dept locCode
      locCodesToFetch = [selectedStore];
    }

    // Ensure uniqueness
    locCodesToFetch = [...new Set(locCodesToFetch)];

    if (locCodesToFetch.length === 0) {
      locCodesToFetch = [currentusers.locCode];
    }

    if (selectedStore === "all") {
      setMultiBranchFetching(true);
      const storesToFetch = visibleLocations.filter(loc => !DEPT_LOC_CODES.includes(loc.locCode));
      const summaryList = await Promise.all(
        storesToFetch.map(async ({ locCode, locName }) => {
          const totals = await getStoreFooterTotals(locCode, fromDate, toDate);
          return {
            store: locName,
            locCode,
            ...totals
          };
        })
      );
      setAllStoresSummary(summaryList);
      const grandTotals = summaryList.reduce(
        (acc, s) => ({
          cash: acc.cash + Number(s.cash || 0),
          rbl: acc.rbl + Number(s.rbl || 0),
          bank: acc.bank + Number(s.bank || 0),
          upi: acc.upi + Number(s.upi || 0),
          amount: acc.amount + Number(s.amount || 0),
        }),
        { cash: 0, rbl: 0, bank: 0, upi: 0, amount: 0 }
      );
      setAllStoresTotals(grandTotals);
      setMultiBranchFetching(false);
      setIsFetching(false);
      return;
    }

    if (selectedStore === "multi" || selectedStore === "all_departments") {
      setMultiBranchFetching(true);
      const storesToFetch = visibleLocations.filter(loc => locCodesToFetch.includes(loc.locCode));
      const allResults = await Promise.all(
        storesToFetch.map(async ({ locCode, locName }) => {
          const twsBase = "https://rentalapi.rootments.live/api/GetBooking";
          const bU = `${twsBase}/GetBookingList?LocCode=${locCode}&DateFrom=${fromDate}&DateTo=${toDate}`;
          const rU = `${twsBase}/GetRentoutList?LocCode=${locCode}&DateFrom=${fromDate}&DateTo=${toDate}`;
          const retU = `${twsBase}/GetReturnList?LocCode=${locCode}&DateFrom=${fromDate}&DateTo=${toDate}`;
          const dU = `${twsBase}/GetDeleteList?LocCode=${locCode}&DateFrom=${fromDate}&DateTo=${toDate}`;
          const mU = `${baseUrl.baseUrl}user/Getpayment?LocCode=${locCode}&DateFrom=${fromDate}&DateTo=${toDate}`;

          let overrideRowsMulti = [];
          try {
            const res = await fetch(
              `${baseUrl.baseUrl}api/tws/getEditedTransactions?fromDate=${fromDate}&toDate=${toDate}&locCode=${locCode}`
            );
            const json = await res.json();
            overrideRowsMulti = json?.data || [];
          } catch { }

          let bookingData = {}, rentoutData = {}, returnData = {}, deleteData = {}, mongoData = {};
          try {
            const [bRes, rRes, retRes, dRes, mRes] = await Promise.all([
              fetch(bU), fetch(rU), fetch(retU), fetch(dU), fetch(mU)
            ]);
            [bookingData, rentoutData, returnData, deleteData, mongoData] = await Promise.all([
              bRes.json(), rRes.json(), retRes.json(), dRes.json(), mRes.json()
            ]);
          } catch { }

          const bList = (bookingData?.dataSet?.data || []).map(item => {
            const discountAmount = Number(item.discountAmount || 0);
            const billValue = Number(item.invoiceAmount || 0) + discountAmount;
            return {
              ...item,
              date: item.bookingDate?.split("T")[0],
              time: item?.time || item?.bookingTime || (item?.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (item?.bookingDate && item.bookingDate.includes("T") ? new Date(item.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "")),
              invoiceNo: item.invoiceNo,
              customerName: item.customerName,
              quantity: item.quantity || 1,
              Category: "Booking",
              SubCategory: "Advance",
              discountAmount: discountAmount,
              billValue: billValue,
              cash: Number(item.bookingCashAmount || 0),
              rbl: Number(item.rblRazorPay || 0),
              bank: Number(item.bookingBankAmount || 0),
              upi: Number(item.bookingUPIAmount || 0),
              amount: Number(item.bookingCashAmount || 0) + Number(item.rblRazorPay || 0) + Number(item.bookingBankAmount || 0) + Number(item.bookingUPIAmount || 0),
              totalTransaction: Number(item.bookingCashAmount || 0) + Number(item.rblRazorPay || 0) + Number(item.bookingBankAmount || 0) + Number(item.bookingUPIAmount || 0),
              remark: "",
              source: "booking",
              branch: locName,
            };
          });

          const rList = (rentoutData?.dataSet?.data || []).map(item => {
            const advance = Number(item.advanceAmount || 0);
            const security = Number(item.securityAmount || 0);
            const balancePayable = Number(item.invoiceAmount || 0) - advance;
            const totalSplit = security + balancePayable;
            const discountAmount = Number(item.discountAmount || 0);
            const billValue = Number(item.invoiceAmount || 0) + discountAmount;
            return {
              ...item,
              date: (item.rentOutDate || "").split("T")[0],
              time: item?.time || item?.rentOutTime || (item?.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (item?.rentOutDate && item.rentOutDate.includes("T") ? new Date(item.rentOutDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "")),
              invoiceNo: item.invoiceNo,
              customerName: item.customerName,
              quantity: item.quantity || 1,
              Category: "RentOut",
              SubCategory: "Security",
              SubCategory1: "Balance Payable",
              securityAmount: security,
              Balance: balancePayable,
              discountAmount: discountAmount,
              billValue: billValue,
              cash: Number(item.rentoutCashAmount || 0),
              rbl: Number(item.rblRazorPay || 0),
              bank: Number(item.rentoutBankAmount || 0),
              upi: Number(item.rentoutUPIAmount || 0),
              totalTransaction: totalSplit,
              amount: totalSplit,
              remark: "",
              source: "rentout",
              branch: locName,
            };
          });

          const retList = (returnData?.dataSet?.data || []).map(item => {
            const returnCashAmount = -Math.abs(Number(item.returnCashAmount || 0));
            const returnRblAmount = -Math.abs(Number(item.rblRazorPay || 0));
            const returnBankAmount = returnRblAmount !== 0 ? 0 : -Math.abs(Number(item.returnBankAmount || 0));
            const returnUPIAmount = returnRblAmount !== 0 ? 0 : -Math.abs(Number(item.returnUPIAmount || 0));
            const discountAmount = Number(item.discountAmount || 0);
            const billValue = Number(item.invoiceAmount || 0) + discountAmount;
            return {
              ...item,
              date: (item.returnedDate || item.returnDate || item.createdDate || "").split("T")[0],
              time: item?.time || item?.returnedTime || (item?.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (item?.returnedDate && item.returnedDate.includes("T") ? new Date(item.returnedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "")),
              customerName: item.customerName || item.custName || item.customer || "",
              invoiceNo: item.invoiceNo,
              Category: "Return",
              SubCategory: "Security Refund",
              securityAmount: Math.abs(returnCashAmount + returnRblAmount + returnBankAmount + returnUPIAmount),
              discountAmount: discountAmount,
              billValue: billValue,
              cash: returnCashAmount,
              rbl: returnRblAmount,
              bank: returnBankAmount,
              upi: returnUPIAmount,
              amount: returnCashAmount + returnRblAmount + returnBankAmount + returnUPIAmount,
              totalTransaction: returnCashAmount + returnRblAmount + returnBankAmount + returnUPIAmount,
              remark: "",
              source: "return",
              branch: locName,
            };
          });

          const dList = (deleteData?.dataSet?.data || []).map(item => {
            const deleteCashAmount = -Math.abs(Number(item.deleteCashAmount || 0));
            const deleteRblAmount = -Math.abs(Number(item.rblRazorPay || 0));
            const deleteBankAmount = deleteRblAmount !== 0 ? 0 : -Math.abs(Number(item.deleteBankAmount || 0));
            const deleteUPIAmount = deleteRblAmount !== 0 ? 0 : -Math.abs(Number(item.deleteUPIAmount || 0));
            const discountAmount = Number(item.discountAmount || 0);
            const billValue = Number(item.invoiceAmount || 0) + discountAmount;
            return {
              ...item,
              date: item.cancelDate?.split("T")[0],
              time: item?.time || item?.cancelTime || (item?.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (item?.cancelDate && item.cancelDate.includes("T") ? new Date(item.cancelDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "")),
              invoiceNo: item.invoiceNo,
              customerName: item.customerName,
              Category: "Cancel",
              SubCategory: "Cancellation Refund",
              discountAmount: discountAmount,
              billValue: billValue,
              cash: deleteCashAmount,
              rbl: deleteRblAmount,
              bank: deleteBankAmount,
              upi: deleteUPIAmount,
              amount: deleteCashAmount + deleteRblAmount + deleteBankAmount + deleteUPIAmount,
              totalTransaction: deleteCashAmount + deleteRblAmount + deleteBankAmount + deleteUPIAmount,
              remark: "",
              source: "deleted",
              branch: locName,
            };
          });

          const mList = (mongoData?.data || []).filter(tx => !tx.isAdminLevel).map(tx => {
            const isReturn = (tx.type || "").toLowerCase() === "return" || (tx.subCategory || "").toLowerCase().includes("return") || (tx.category || "").toLowerCase().includes("return") || (tx.invoiceNo || "").toUpperCase().startsWith("RTN-") || (tx.invoiceNo || "").toUpperCase().startsWith("RET-");
            const rawCash = Number(tx.cash || 0);
            const rawRbl = Number(tx.rbl || tx.rblRazorPay || 0);
            const rawBank = Number(tx.bank || 0);
            const rawUpi = Number(tx.upi || 0);
            const cash = isReturn ? -Math.abs(rawCash) : rawCash;
            const rbl = isReturn ? -Math.abs(rawRbl) : rawRbl;
            const bank = isReturn ? -Math.abs(rawBank) : rawBank;
            const upi = isReturn ? -Math.abs(rawUpi) : rawUpi;
            const total = cash + rbl + bank + upi;
            const sign = isReturn ? -1 : 1;
            const isExpense = (tx.type || "").toLowerCase() === "expense";
            const rawSubCat = isExpense ? (tx.category || tx.subCategory || "") : (tx.subCategory || tx.category || "");
            const subCatLabel = resolveSubCategoryLabel(rawSubCat, isReturn, tx);
            const discountAmount = Number(tx.discountAmount || 0);
            const billValue = (Number(tx.billValue || tx.subTotal || 0) || (Number(tx.invoiceAmount || Math.abs(Number(tx.amount) || 0)) + discountAmount)) * sign;
            const finalAmount = isReturn ? -Math.abs(Number(tx.totalTransaction ?? tx.amount ?? total)) : Number(tx.totalTransaction ?? tx.amount ?? total);
            return {
              ...tx,
              date: tx.date?.split("T")[0] || "",
              time: tx?.time || (tx?.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (tx?.date && tx.date.includes("T") ? new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "")),
              Category: tx.type,
              SubCategory: subCatLabel,
              SubCategory1: tx.subCategory1 || tx.SubCategory1 || "",
              customerName: tx.customerName || "",
              remark: (() => { const r = tx.remark || tx.remarks || ""; return (r === "Thanks for your business." || r === "Thanks for your business") ? "" : r; })(),
              discountAmount: discountAmount,
              billValue: billValue,
              cash, rbl, bank, upi,
              amount: finalAmount,
              totalTransaction: finalAmount,
              source: "mongo",
              branch: locName,
              _id: tx._id,
              hasAttachment: !!(tx.hasAttachment || tx.attachment?.filename || tx.attachment?.data || (typeof tx.attachment === "string" && tx.attachment)),
            };
          });

          const editedMapMulti = new Map();
          overrideRowsMulti.forEach(row => {
            const key = String(row.invoiceNo || row.invoice).trim();
            const category = (row.type || row.Category || '').toLowerCase();
            const uniqueKey = `${key}-${category}`;
            const cash = Number(row.cash || 0);
            const rbl = Number(row.rbl || 0);
            const bank = Number(row.bank || 0);
            const upi = Number(row.upi || 0);
            const total = cash + rbl + bank + upi;
            const discountAmount = Number(row.discountAmount || 0);
            const billValue = Number(row.billValue ?? (Number(row.invoiceAmount || 0) + discountAmount));
            editedMapMulti.set(uniqueKey, {
              ...row,
              invoiceNo: key,
              Category: row.type,
              SubCategory: row.category,
              SubCategory1: row.subCategory1 || row.SubCategory1 || "Balance Payable",
              discountAmount: discountAmount,
              billValue: billValue,
              cash, rbl, bank, upi,
              amount: total,
              totalTransaction: total,
              source: "edited",
              branch: locName,
            });
          });

          const allTwsMulti = [...bList, ...rList, ...retList, ...dList];
          const finalTwsMulti = allTwsMulti.map(t => {
            const key = String(t.invoiceNo).trim();
            const category = (t.Category || t.category || '').toLowerCase();
            const uniqueKey = `${key}-${category}`;
            const override = editedMapMulti.get(uniqueKey);
            const isRentOutMulti = category === 'rentout';
            return override
              ? {
                ...t,
                ...override,
                Category: override.Category || t.Category || "",
                SubCategory: override.SubCategory || override.category || t.SubCategory || t.category || "",
                SubCategory1: override.SubCategory1 || override.subCategory1 || t.SubCategory1 || t.subCategory1 || "",
                customerName: override.customerName || t.customerName || "",
                date: override.date || t.date || "",
                time: override.time || t.time || "",
                securityAmount: isRentOutMulti ? Number(override.securityAmount ?? t.securityAmount ?? 0) : 0,
                Balance: isRentOutMulti ? Number(override.Balance ?? t.Balance ?? 0) : 0,
                amount: Number(override.amount ?? t.amount),
                totalTransaction: isRentOutMulti
                  ? Number(override.securityAmount ?? t.securityAmount ?? 0) + Number(override.Balance ?? t.Balance ?? 0)
                  : Number(override.totalTransaction ?? t.totalTransaction ?? override.cash + override.rbl + override.bank + override.upi),
                branch: locName,
              }
              : t;
          });

          const allTransactionsMulti = [...finalTwsMulti, ...mList];
          const dedupedMulti = Array.from(
            new Map(
              allTransactionsMulti.map((tx, index) => {
                const dateKey = (tx.date ? new Date(tx.date).toISOString().split("T")[0] : "");
                const key = tx._id
                  ? `${tx._id}-${locCode}`
                  : `${tx.invoiceNo || tx.locCode}-${dateKey}-${tx.Category || tx.type || ""}-${tx.source || ""}-${locCode}-${index}`;
                return [key, tx];
              })
            ).values()
          );

          return dedupedMulti;
        })
      );

      const merged = allResults.flat();
      setMultiBranchData(merged);
      setMultiBranchFetching(false);
      setIsFetching(false);
      return;
    }

    try {
      const [bookingRes, rentoutRes, returnRes, deleteRes, mongoRes] = await Promise.all([
        fetch(bookingU), fetch(rentoutU), fetch(returnU), fetch(deleteU), fetch(mongoU)
      ]);
      if (!mongoRes.ok) {
        const errorText = await mongoRes.text();
        throw new Error(`mongoRes failed: ${mongoRes.status} ${errorText}`);
      }
      const [bookingData, rentoutData, returnData, deleteData, mongoData] = await Promise.all([
        bookingRes.json(), rentoutRes.json(), returnRes.json(), deleteRes.json(), mongoRes.json()
      ]);

      const bookingList = (bookingData?.dataSet?.data || []).map(item => {
        const discountAmount = Number(item.discountAmount || 0);
        const billValue = Number(item.invoiceAmount || 0) + discountAmount;
        return {
          ...item,
          date: item.bookingDate?.split("T")[0],
          time: item?.time || item?.bookingTime || (item?.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (item?.bookingDate && item.bookingDate.includes("T") ? new Date(item.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "")),
          invoiceNo: item.invoiceNo,
          customerName: item.customerName,
          quantity: item.quantity || 1,
          Category: "Booking",
          SubCategory: "Advance",
          discountAmount: discountAmount,
          billValue: billValue,
          cash: Number(item.bookingCashAmount || 0),
          rbl: Number(item.rblRazorPay || 0), // ✅ Added RBL mapping
          bank: Number(item.bookingBankAmount || 0),
          upi: Number(item.bookingUPIAmount || 0),
          amount: Number(item.bookingCashAmount || 0) + Number(item.rblRazorPay || 0) + Number(item.bookingBankAmount || 0) + Number(item.bookingUPIAmount || 0), // ✅ Added rbl
          totalTransaction: Number(item.bookingCashAmount || 0) + Number(item.rblRazorPay || 0) + Number(item.bookingBankAmount || 0) + Number(item.bookingUPIAmount || 0), // ✅ Added rbl
          remark: "",
          source: "booking"
        };
      });

      const rentoutList = (rentoutData?.dataSet?.data || []).map(item => {
        const advance = Number(item.advanceAmount || 0);
        const security = Number(item.securityAmount || 0);
        const balancePayable = Number(item.invoiceAmount || 0) - advance;
        const totalSplit = security + balancePayable;
        const discountAmount = Number(item.discountAmount || 0);
        const billValue = Number(item.invoiceAmount || 0) + discountAmount;

        return {
          ...item,
          date: (item.rentOutDate || "").split("T")[0],
          time: item?.time || item?.rentOutTime || (item?.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (item?.rentOutDate && item.rentOutDate.includes("T") ? new Date(item.rentOutDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "")),
          invoiceNo: item.invoiceNo,
          customerName: item.customerName,
          quantity: item.quantity || 1,
          Category: "RentOut",
          SubCategory: "Security",
          SubCategory1: "Balance Payable",
          securityAmount: security,
          Balance: balancePayable,
          discountAmount: discountAmount,
          billValue: billValue,
          cash: Number(item.rentoutCashAmount || 0),
          rbl: Number(item.rblRazorPay || 0), // ✅ Added RBL mapping
          bank: Number(item.rentoutBankAmount || 0),
          upi: Number(item.rentoutUPIAmount || 0),
          totalTransaction: totalSplit,
          amount: totalSplit,
          remark: "",
          source: "rentout"
        };
      });

      // ✅ Updated return list with RBL prevention logic
      const returnList = (returnData?.dataSet?.data || []).map(item => {
        const returnCashAmount = -Math.abs(Number(item.returnCashAmount || 0));
        const returnRblAmount = -Math.abs(Number(item.rblRazorPay || 0));

        // ✅ Only process bank/UPI if no RBL value
        const returnBankAmount = returnRblAmount !== 0 ? 0 : -Math.abs(Number(item.returnBankAmount || 0));
        const returnUPIAmount = returnRblAmount !== 0 ? 0 : -Math.abs(Number(item.returnUPIAmount || 0));
        const discountAmount = Number(item.discountAmount || 0);
        const billValue = Number(item.invoiceAmount || 0) + discountAmount;

        return {
          ...item,
          date: (item.returnedDate || item.returnDate || item.createdDate || "").split("T")[0],
          time: item?.time || item?.returnedTime || (item?.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (item?.returnedDate && item.returnedDate.includes("T") ? new Date(item.returnedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "")),
          customerName: item.customerName || item.custName || item.customer || "",
          invoiceNo: item.invoiceNo,
          Category: "Return",
          SubCategory: "Security Refund",
          discountAmount: discountAmount,
          billValue: billValue,
          cash: returnCashAmount,
          rbl: returnRblAmount,
          bank: returnBankAmount,
          upi: returnUPIAmount,
          amount: returnCashAmount + returnRblAmount + returnBankAmount + returnUPIAmount, // ✅ Added rbl
          totalTransaction: returnCashAmount + returnRblAmount + returnBankAmount + returnUPIAmount, // ✅ Added rbl
          remark: "",
          source: "return"
        };
      });

      // ✅ Updated delete list with RBL prevention logic
      const deleteList = (deleteData?.dataSet?.data || []).map(item => {
        const deleteCashAmount = -Math.abs(Number(item.deleteCashAmount || 0));
        const deleteRblAmount = -Math.abs(Number(item.rblRazorPay || 0));

        // ✅ Only process bank/UPI if no RBL value
        const deleteBankAmount = deleteRblAmount !== 0 ? 0 : -Math.abs(Number(item.deleteBankAmount || 0));
        const deleteUPIAmount = deleteRblAmount !== 0 ? 0 : -Math.abs(Number(item.deleteUPIAmount || 0));
        const discountAmount = Number(item.discountAmount || 0);
        const billValue = Number(item.invoiceAmount || 0) + discountAmount;

        return {
          ...item,
          date: item.cancelDate?.split("T")[0],
          time: item?.time || item?.cancelTime || (item?.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (item?.cancelDate && item.cancelDate.includes("T") ? new Date(item.cancelDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "")),
          invoiceNo: item.invoiceNo,
          customerName: item.customerName,
          Category: "Cancel",
          SubCategory: "Cancellation Refund",
          discountAmount: discountAmount,
          billValue: billValue,
          cash: deleteCashAmount,
          rbl: deleteRblAmount,
          bank: deleteBankAmount,
          upi: deleteUPIAmount,
          amount: deleteCashAmount + deleteRblAmount + deleteBankAmount + deleteUPIAmount, // ✅ Added rbl
          totalTransaction: deleteCashAmount + deleteRblAmount + deleteBankAmount + deleteUPIAmount, // ✅ Added rbl
          remark: "",
          source: "deleted"
        };
      });

      const mongoList = (mongoData?.data || []).filter(tx => !tx.isAdminLevel).map(tx => {
        const isReturn = (tx.type || "").toLowerCase() === "return" || (tx.subCategory || "").toLowerCase().includes("return") || (tx.category || "").toLowerCase().includes("return") || (tx.invoiceNo || "").toUpperCase().startsWith("RTN-") || (tx.invoiceNo || "").toUpperCase().startsWith("RET-");
        const rawCash = Number(tx.cash || 0);
        const rawRbl = Number(tx.rbl || tx.rblRazorPay || 0);
        const rawBank = Number(tx.bank || 0);
        const rawUpi = Number(tx.upi || 0);
        const cash = isReturn ? -Math.abs(rawCash) : rawCash;
        const rbl = isReturn ? -Math.abs(rawRbl) : rawRbl;
        const bank = isReturn ? -Math.abs(rawBank) : rawBank;
        const upi = isReturn ? -Math.abs(rawUpi) : rawUpi;
        const total = cash + rbl + bank + upi;
        const sign = isReturn ? -1 : 1;
        const isExpense = (tx.type || "").toLowerCase() === "expense";
        const rawSubCat = isExpense ? (tx.category || tx.subCategory || "") : (tx.subCategory || tx.category || "");
        const subCatLabel = resolveSubCategoryLabel(rawSubCat, isReturn, tx);
        const discountAmount = Number(tx.discountAmount || 0);
        const billValue = (Number(tx.billValue || tx.subTotal || 0) || (Number(tx.invoiceAmount || Math.abs(Number(tx.amount) || 0)) + discountAmount)) * sign;
        const finalAmount = isReturn ? -Math.abs(Number(tx.totalTransaction ?? tx.amount ?? total)) : Number(tx.totalTransaction ?? tx.amount ?? total);
        return {
          ...tx,
          date: tx.date?.split("T")[0] || "",
          time: tx?.time || (tx?.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (tx?.date && tx.date.includes("T") ? new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "")),
          Category: tx.type,
          SubCategory: subCatLabel,
          SubCategory1: tx.subCategory1 || tx.SubCategory1 || "",
          customerName: tx.customerName || "",
          remark: (() => { const r = tx.remark || tx.remarks || ""; return (r === "Thanks for your business." || r === "Thanks for your business") ? "" : r; })(),
          discountAmount: discountAmount,
          billValue: billValue,
          cash: cash,
          rbl: rbl,
          bank: bank,
          upi: upi,
          amount: finalAmount,
          totalTransaction: finalAmount,
          source: "mongo",
          _id: tx._id,
          hasAttachment: !!(tx.hasAttachment || tx.attachment?.filename || tx.attachment?.data || (typeof tx.attachment === "string" && tx.attachment)),
        };
      });

      let overrideRows = [];
      try {
        const res = await fetch(
          `${baseUrl.baseUrl}api/tws/getEditedTransactions?fromDate=${fromDate}&toDate=${toDate}&locCode=${currentusers.locCode}`
        );
        const json = await res.json();
        overrideRows = json?.data || [];
      } catch (err) {
        console.warn("⚠️ Override fetch failed:", err.message);
      }

      const editedMap = new Map();
      overrideRows.forEach(row => {
        const key = String(row.invoiceNo || row.invoice).trim();
        const category = (row.type || row.Category || '').toLowerCase();
        // Create a unique key that includes both invoice number AND category
        // This prevents edits to RentOut from affecting Booking for the same invoice
        const uniqueKey = `${key}-${category}`;
        const cash = Number(row.cash || 0);
        const rbl = Number(row.rbl || 0); // ✅ Added RBL support in overrides
        const bank = Number(row.bank || 0);
        const upi = Number(row.upi || 0);
        const total = cash + rbl + bank + upi; // ✅ Added rbl
        const discountAmount = Number(row.discountAmount || 0);
        const billValue = Number(row.billValue ?? (Number(row.invoiceAmount || 0) + discountAmount));

        editedMap.set(uniqueKey, {
          ...row,
          invoiceNo: key,
          Category: row.type,
          SubCategory: row.category,
          SubCategory1: row.subCategory1 || row.SubCategory1 || "Balance Payable",
          discountAmount: discountAmount,
          billValue: billValue,
          cash, rbl, bank, upi, // ✅ Added rbl
          amount: total,
          totalTransaction: total,
          source: "edited"
        });
      });

      const allTws = [...bookingList, ...rentoutList, ...returnList, ...deleteList];
      const finalTws = allTws.map(t => {
        const key = String(t.invoiceNo).trim();
        const category = (t.Category || t.category || '').toLowerCase();
        // Match using both invoice number AND category
        const uniqueKey = `${key}-${category}`;
        const override = editedMap.get(uniqueKey);
        const isRentOut = category === 'rentout';

        return override
          ? {
            ...t,
            ...override,
            Category: override.Category || t.Category || "",
            SubCategory: override.SubCategory || override.category || t.SubCategory || t.category || "",
            SubCategory1: override.SubCategory1 || override.subCategory1 || t.SubCategory1 || t.subCategory1 || "",
            customerName: override.customerName || t.customerName || "",
            date: override.date || t.date || "",
            time: override.time || t.time || "",
            securityAmount: isRentOut
              ? Number(override.securityAmount ?? t.securityAmount ?? 0)
              : 0,
            Balance: isRentOut
              ? Number(override.Balance ?? t.Balance ?? 0)
              : 0,
            amount: Number(override.amount ?? t.amount),
            totalTransaction: isRentOut
              ? Number(override.securityAmount ?? t.securityAmount ?? 0) + Number(override.Balance ?? t.Balance ?? 0)
              : Number(override.totalTransaction ?? t.totalTransaction ?? override.cash + override.rbl + override.bank + override.upi) // ✅ Added rbl
          }
          : t;
      });

      const allTransactions = [...finalTws, ...mongoList];

      const deduped = Array.from(
        new Map(
          allTransactions.map((tx, index) => {
            const dateKey = (tx.date ? new Date(tx.date).toISOString().split("T")[0] : "");
            const key = tx._id
              ? tx._id
              : `${tx.invoiceNo || tx.locCode}-${dateKey}-${tx.Category || tx.type || ""}-${tx.source || ""}-${index}`;
            return [key, tx];
          })
        ).values()
      );

      setMergedTransactions(deduped);
      setMongoTransactions(mongoList);
    } catch (err) {
      console.error("❌ Error fetching transactions", err);
      console.error('[handleFetch] Error details:', err && err.stack ? err.stack : err);
    } finally {
      setIsFetching(false);
    }
  };

  const GetCreateCashBank = async (api) => {
    try {
      const response = await fetch(api, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setPreOpen({});
          return;
        }
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      setPreOpen(data?.data || {});
    } catch (error) {
      console.error("Error fetching cash/bank opening data:", error);
    }
  };

  useEffect(() => {
  }, [])
  const printRef = useRef(null);

  useEffect(() => {
    const skipBack = () => setTimeout(() => window.history.forward(), 0);
    window.addEventListener("afterprint", skipBack);
    return () => window.removeEventListener("afterprint", skipBack);
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;

    const tableHtml = printRef.current.innerHTML;
    const w = window.open("", "_blank", "width=900,height=600");

    const storeName = selectedStore === "all" ? "All_Branches" : selectedStore === "multi" ? "Multiple_Branches" : (AllLoation.find(loc => loc.locCode === currentusers.locCode)?.locName || currentusers.locCode || "Store").replace(/[^a-zA-Z0-9]/g, "_");
    const dateRange = fromDate === toDate ? fromDate : `${fromDate}_to_${toDate}`;

    w.document.write(`
    <html>
      <head>
        <title>financial_summary_${storeName}_${dateRange}</title>
        <style>
          @page { margin: 10mm; }
          body  { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th,td { border: 1px solid #000; padding: 4px; white-space: nowrap; }
          tr    { break-inside: avoid; }
        </style>
      </head>
      <body>${tableHtml}</body>
    </html>
  `);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  const [mongoTransactions, setMongoTransactions] = useState([]);
  const [mergedTransactions, setMergedTransactions] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState([categories[0]]);
  const [selectedSubCategory, setSelectedSubCategory] = useState([subCategories[0]]);

  const catValues = Array.isArray(selectedCategory)
    ? selectedCategory.map(c => c?.value?.toLowerCase()).filter(Boolean)
    : (selectedCategory?.value ? [selectedCategory.value.toLowerCase()] : []);
  const isAllCategories = catValues.length === 0 || catValues.includes("all");

  const subCatValues = Array.isArray(selectedSubCategory)
    ? selectedSubCategory.map(sc => sc?.value?.toLowerCase()).filter(Boolean)
    : (selectedSubCategory?.value ? [selectedSubCategory.value.toLowerCase()] : []);
  const isAllSubCategories = subCatValues.length === 0 || subCatValues.includes("all");

  const filterTransaction = (t) => {
    // Hide admin-dept expenses from store-level and cluster manager users
    if (isAdminExpense(t)) return false;

    const category = (t.Category ?? t.category ?? t.type ?? "").toLowerCase();
    const subCategory = (t.SubCategory ?? t.subCategory ?? t.type ?? "").toLowerCase();
    const subCategory1 = (t.SubCategory1 ?? t.subCategory1 ?? "").toLowerCase();

    const matchesCategory = isAllCategories || catValues.includes(category);
    const matchesSubCategory = isAllSubCategories ||
      subCatValues.includes(subCategory) ||
      subCatValues.includes(subCategory1) ||
      subCatValues.includes(category);

    return matchesCategory && matchesSubCategory;
  };

  const toNumber = (v) => (isNaN(+v) ? 0 : +v);

  const displayedRows = mergedTransactions
    .filter(filterTransaction)
    .sort((a, b) => {
      // Define category order
      const categoryOrder = {
        booking: 1,
        rentout: 2,
        return: 3,
        cancel: 4,
        income: 5,
        expense: 6
      };
      
      const catA = (a.Category || a.category || a.type || "").toLowerCase().replace(/\s+/g, '');
      const catB = (b.Category || b.category || b.type || "").toLowerCase().replace(/\s+/g, '');
      
      const orderA = categoryOrder[catA] || 99;
      const orderB = categoryOrder[catB] || 99;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // Secondary sort by date
      const dateAStr = a.date ? a.date.replace(/-/g, '/') + (a.time ? " " + a.time : "") : "";
      const dateBStr = b.date ? b.date.replace(/-/g, '/') + (b.time ? " " + b.time : "") : "";
      const dateA = new Date(dateAStr).getTime() || 0;
      const dateB = new Date(dateBStr).getTime() || 0;
      return dateB - dateA;
    });

  // ✅ CRITICAL FIX: Use 'cash' field (calculated closing cash) for opening balance, not 'Closecash' (physical cash)
  // The 'cash' field contains the previous day's total closing cash, which should be today's opening
  const openingCash = toNumber(
    preOpen?.cash ?? preOpen?.Closecash ??  // Calculated closing cash from previous day (fallback to physical for backward compatibility)
    0
  );

  const openingRbl = toNumber(preOpen?.rbl ?? 0); // ✅ Added opening RBL

  // ✅ Updated totals calculation with RBL
  const totals = displayedRows.reduce(
    (acc, r) => ({
      cash: acc.cash + toNumber(r.cash),
      rbl: acc.rbl + toNumber(r.rbl),
      bank: acc.bank + toNumber(r.bank),
      upi: acc.upi + toNumber(r.upi),
      amount: acc.amount + toNumber(r.amount),
      totalTransaction: acc.totalTransaction + toNumber(r.totalTransaction),
      discountAmount: acc.discountAmount + toNumber(r.discountAmount),
    }),
    { cash: openingCash, rbl: openingRbl, bank: 0, upi: 0, amount: openingCash + openingRbl, totalTransaction: openingCash + openingRbl, discountAmount: 0 }
  );

  const totalCash = totals.cash;
  const totalRblAmount = totals.rbl; // ✅ Added RBL total
  const totalBankAmount = totals.bank;
  const totalUpiAmount = totals.upi;

  const num = (v) => {
    if (v === null || v === undefined) return 0;
    const cleaned = String(v).replace(/[^0-9.-]/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  // ✅ Updated export data with exact CSV format from Rootfin CSV Format.xlsx
  const currentBranchName = AllLoation.find(loc => loc.locCode === currentusers?.locCode)?.locName || currentusers?.locCode || "";

  const exportData = [
    {
      date: "OPENING BALANCE",
      invoiceNo: "",
      customerName: "",
      quantity: "",
      Category: "",
      SubCategory: "",
      SubCategory1: "",
      amount: openingCash + openingRbl,
      totalTransaction: openingCash + openingRbl,
      securityAmount: "",
      Balance: "",
      remark: "",
      discountAmount: "",
      billValue: "",
      cash: openingCash,
      rbl: openingRbl,
      bank: 0,
      upi: 0,
      attachment: "",
      branch: "",
    },

    ...(displayedRows)
      .map((t) => {
        const isReturn = (t.Category || t.type || "").toLowerCase() === "return";
        const isCancel = (t.Category || t.type || "").toLowerCase() === "cancel";
        const isRent = (t.Category || t.type || "").toLowerCase() === "rentout";

        let cash = num(t.cash);
        let rbl = num(t.rbl);
        let bank = num(t.bank);
        let upi = num(t.upi);

        if (isReturn || isCancel) {
          cash = -Math.abs(cash);
          rbl = -Math.abs(rbl);
          bank = -Math.abs(bank);
          upi = -Math.abs(upi);
        }

        const securityAmount = num(t.securityAmount);
        const balance = num(t.Balance);
        const amount = isRent ? securityAmount + balance
          : cash + rbl + bank + upi;

        const rowBranch = t.branch || (AllLoation.find(loc => loc.locCode === t.locCode)?.locName) || currentBranchName;

        return {
          date: t.date,
          invoiceNo: t.invoiceNo || t.locCode || "",
          customerName: t.customerName || "",
          quantity: t.quantity || 1,
          Category: t.Category || t.type || "",
          SubCategory: isRent ? (t.SubCategory || "Security") : getCatLabel(t.SubCategory || t.category || "-"),
          SubCategory1: isRent ? (t.SubCategory1 || "Balance Payable") : "",
          amount,
          totalTransaction: t.totalTransaction ?? amount,
          securityAmount: isRent ? securityAmount : (t.securityAmount ? num(t.securityAmount) : ""),
          Balance: isRent ? balance : (t.Balance ? num(t.Balance) : ""),
          remark: t.remark || "",
          discountAmount: num(t.discountAmount || 0),
          billValue: num(t.billValue || t.invoiceAmount || t.amount || amount),
          cash,
          rbl,
          bank,
          upi,
          attachment: t.hasAttachment ? "Yes" : "No",
          branch: rowBranch,
        };
      }),
    
    // Add Total Row
    {
      date: "TOTAL",
      invoiceNo: "",
      customerName: "",
      quantity: "",
      Category: "",
      SubCategory: "",
      SubCategory1: "",
      amount: totals.amount,
      totalTransaction: totals.totalTransaction,
      securityAmount: "",
      Balance: "",
      remark: "",
      discountAmount: totals.discountAmount,
      billValue: "",
      cash: totalCash,
      rbl: totalRblAmount,
      bank: totalBankAmount,
      upi: totalUpiAmount,
      attachment: "",
      branch: "",
    }
  ];

  const multiFilteredRows = multiBranchData.filter(filterTransaction);
  const multiTotals = multiFilteredRows.reduce(
    (acc, r) => ({
      amount: acc.amount + Number(r.amount || 0),
      totalTransaction: acc.totalTransaction + Number(r.totalTransaction || 0),
      discountAmount: acc.discountAmount + Number(r.discountAmount || 0),
      billValue: acc.billValue + Number(r.billValue || 0),
      cash: acc.cash + Number(r.cash || 0),
      rbl: acc.rbl + Number(r.rbl || 0),
      bank: acc.bank + Number(r.bank || 0),
      upi: acc.upi + Number(r.upi || 0),
    }),
    { amount: 0, totalTransaction: 0, discountAmount: 0, billValue: 0, cash: 0, rbl: 0, bank: 0, upi: 0 }
  );

  const multiExportData = [
    ...multiFilteredRows.map((t) => ({
      date: t.date,
      invoiceNo: t.invoiceNo || t.locCode || "",
      customerName: t.customerName || "",
      quantity: t.quantity || 1,
      Category: t.Category || t.type || "",
      SubCategory: getCatLabel(t.SubCategory || t.category || "-"),
      SubCategory1: t.SubCategory1 || "",
      amount: Number(t.amount || 0),
      totalTransaction: Number(t.totalTransaction || 0),
      securityAmount: Number(t.securityAmount || 0),
      Balance: Number(t.Balance || 0),
      remark: t.remark || "",
      discountAmount: Number(t.discountAmount || 0),
      billValue: Number(t.billValue || 0),
      cash: Number(t.cash || 0),
      rbl: Number(t.rbl || 0),
      bank: Number(t.bank || 0),
      upi: Number(t.upi || 0),
      attachment: t.hasAttachment ? "Yes" : "No",
      branch: t.branch || "",
    })),
    {
      date: "TOTAL",
      invoiceNo: "",
      customerName: "",
      quantity: "",
      Category: "",
      SubCategory: "",
      SubCategory1: "",
      amount: multiTotals.amount,
      totalTransaction: multiTotals.totalTransaction,
      securityAmount: "",
      Balance: "",
      remark: "",
      discountAmount: multiTotals.discountAmount,
      billValue: multiTotals.billValue,
      cash: multiTotals.cash,
      rbl: multiTotals.rbl,
      bank: multiTotals.bank,
      upi: multiTotals.upi,
      attachment: "",
      branch: "",
    }
  ];

  const allStoresExportData = [
    ...allStoresSummary.map((s) => ({
      store: s.store,
      locCode: s.locCode,
      cash: Math.round(Number(s.cash || 0)),
      rbl: Math.round(Number(s.rbl || 0)),
      bank: Math.round(Number(s.bank || 0)),
      upi: Math.round(Number(s.upi || 0)),
      amount: Math.round(Number(s.amount || 0)),
    })),
    {
      store: "TOTAL",
      locCode: "",
      cash: Math.round(Number(allStoresTotals.cash || 0)),
      rbl: Math.round(Number(allStoresTotals.rbl || 0)),
      bank: Math.round(Number(allStoresTotals.bank || 0)),
      upi: Math.round(Number(allStoresTotals.upi || 0)),
      amount: Math.round(Number(allStoresTotals.amount || 0)),
    }
  ];

  const [editingIndex, setEditingIndex] = useState(null);
  const [editedTransaction, setEditedTransaction] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const handleEditClick = async (transaction, index) => {
    setIsSyncing(true);

    let resolvedId = transaction._id;

    if (!resolvedId) {
      const patchedTransaction = {
        ...transaction,
        customerName: transaction.customerName || "",
        locCode: transaction.locCode || currentusers.locCode,
        type: transaction.Category || transaction.type || 'income',
        category: transaction.SubCategory || transaction.category || 'General',
        paymentMethod: 'cash',
        date: transaction.date || new Date().toISOString().split('T')[0],
        cash: transaction.cash || 0,
        rbl: transaction.rbl || 0,
        bank: transaction.bank || 0,
        upi: transaction.upi || 0,
      };

      try {
        const response = await fetch(`${baseUrl.baseUrl}user/syncTransaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchedTransaction),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error("❌ Sync failed:", result);
          customAlert("Failed to sync transaction.\n" + (result?.error || 'Unknown error'), "error");
          setIsSyncing(false);
          return;
        }

        resolvedId = result.data._id;
        // ✅ Properly update state so _id is stored — don't just mutate local reference
        setMergedTransactions(prev =>
          prev.map(tx => {
            if (
              tx.invoiceNo === transaction.invoiceNo &&
              (tx.Category || tx.type) === (transaction.Category || transaction.type) &&
              !tx._id
            ) {
              return { ...tx, _id: resolvedId };
            }
            return tx;
          })
        );
      } catch (err) {
        customAlert("Sync error: " + err.message, "error");
        setIsSyncing(false);
        return;
      }
    }

    // ✅ Spread original transaction so all display fields are preserved during editing
    setEditedTransaction({
      ...transaction,
      _id: resolvedId,
      cash: transaction.cash || 0,
      rbl: transaction.rbl || 0,
      bank: transaction.bank || 0,
      upi: transaction.upi || 0,
      securityAmount: transaction.securityAmount || 0,
      Balance: transaction.Balance || 0,
      date: transaction.date || "",
      customerName: transaction.customerName || "",
      invoiceNo: transaction.invoiceNo || transaction.locCode || "",
      Category: transaction.Category || transaction.type || "",
      SubCategory: transaction.SubCategory || transaction.category || "",
      SubCategory1: transaction.SubCategory1 || transaction.subCategory1 || "",
      remark: transaction.remark || "",
      billValue: transaction.billValue || 0,
      totalTransaction:
        (transaction.Category === "RentOut")
          ? (Number(transaction.securityAmount || 0) + Number(transaction.Balance || 0))
          : (Number(transaction.totalTransaction) ||
            Number(transaction.amount) ||
            (Number(transaction.cash || 0) + Number(transaction.rbl || 0) +
              Number(transaction.bank || 0) + Number(transaction.upi || 0))),
      amount:
        (transaction.Category === "RentOut")
          ? (Number(transaction.securityAmount || 0) + Number(transaction.Balance || 0))
          : (transaction.amount || 0)
    });

    setEditingIndex(index);
    setIsSyncing(false);
  };

  const handleInputChange = (field, raw) => {
    if (raw === '' || raw === '-') {
      setEditedTransaction(prev => ({ ...prev, [field]: raw }));
      return;
    }

    const numericValue = Number(raw);
    if (isNaN(numericValue)) return;

    setEditedTransaction(prev => {
      const cash = field === 'cash' ? numericValue : Number(prev.cash) || 0;
      const rbl = field === 'rbl' ? numericValue : Number(prev.rbl) || 0; // ✅ Added RBL handling
      const bank = field === 'bank' ? numericValue : Number(prev.bank) || 0;
      const upi = field === 'upi' ? numericValue : Number(prev.upi) || 0;

      const security = field === 'securityAmount'
        ? numericValue
        : Number(prev.securityAmount) || 0;

      const balance = field === 'Balance'
        ? numericValue
        : Number(prev.Balance) || 0;

      const isRentOut = (prev.Category || '').toLowerCase() === 'rentout';
      const splitTotal = security + balance;
      const payTotal = cash + rbl + bank + upi; // ✅ Added rbl

      return {
        ...prev,
        [field]: numericValue,
        cash, rbl, bank, upi, // ✅ Added rbl
        securityAmount: security,
        Balance: balance,
        amount: isRentOut ? splitTotal : payTotal,
        totalTransaction: isRentOut ? splitTotal : payTotal,
      };
    });
  };

  const handleSave = async () => {
    const {
      _id,
      cash, rbl, bank, upi, // ✅ Added rbl
      date,
      invoiceNo = "",
      invoice = "",
      customerName,
      securityAmount,
      Balance,
      paymentMethod,
    } = editedTransaction;

    if (!_id) {
      customAlert("Cannot update: missing transaction ID.", "error");
      return;
    }

    try {
      const numSec = Number(securityAmount) || 0;
      const numBal = Number(Balance) || 0;

      let adjCash = Number(cash) || 0;
      let adjRbl = Number(rbl) || 0; // ✅ Added RBL adjustment
      let adjBank = Number(bank) || 0;
      let adjUpi = Number(upi) || 0;

      const negRow = ["return", "cancel"].includes(
        (editedTransaction.Category || "").toLowerCase()
      );
      if (negRow) {
        adjCash = -Math.abs(adjCash);
        adjRbl = -Math.abs(adjRbl); // ✅ Added RBL negative handling
        adjBank = -Math.abs(adjBank);
        adjUpi = -Math.abs(adjUpi);
      }

      const isRentOut = editedTransaction.Category === "RentOut";
      const originalBillValue = editedTransaction.billValue;
      const computedTotal = isRentOut
        ? numSec + numBal
        : adjCash + adjRbl + adjBank + adjUpi; // ✅ Added rbl

      const paySum = adjCash + adjRbl + adjBank + adjUpi; // ✅ Added rbl
      if (!isRentOut && paySum !== computedTotal) {
        if (adjCash !== 0) { adjCash = computedTotal; adjRbl = adjBank = adjUpi = 0; }
        else if (adjRbl !== 0) { adjRbl = computedTotal; adjCash = adjBank = adjUpi = 0; } // ✅ Added RBL priority
        else if (adjBank !== 0) { adjBank = computedTotal; adjCash = adjRbl = adjUpi = 0; }
        else { adjUpi = computedTotal; adjCash = adjRbl = adjBank = 0; }
      }

      const payload = {
        cash: adjCash,
        rbl: adjRbl, // ✅ Added RBL to payload
        bank: adjBank,
        upi: adjUpi,
        date,
        invoiceNo: invoiceNo || invoice,
        customerName: customerName || "",
        paymentMethod,
        securityAmount: numSec,
        Balance: numBal,
        billValue: originalBillValue,
        amount: computedTotal,
        totalTransaction: computedTotal,
        type: editedTransaction.Category || "RentOut",
        category: editedTransaction.SubCategory || "Security",
        subCategory1: editedTransaction.SubCategory1 || "Balance Payable",
      };

      const res = await fetch(`${baseUrl.baseUrl}user/editTransaction/${_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        customAlert("Update failed: " + (json?.message || "Unknown error"), "error");
        return;
      }
      customAlert("Transaction updated.", "success");

      const updatedRow = {
        ...editedTransaction,  // ✅ Preserve all original display fields (source, locCode, time, etc.)
        cash: adjCash,
        rbl: adjRbl,
        bank: adjBank,
        upi: adjUpi,
        securityAmount: numSec,
        Balance: numBal,
        amount: computedTotal,
        totalTransaction: computedTotal,
        billValue: originalBillValue,
        date,
        invoiceNo: invoiceNo || invoice,
        _id,
      };

      // ✅ Match by _id only (Category check removed — type casing can differ between TWS and Mongo)
      setMongoTransactions(prev =>
        prev.map(tx => tx._id === _id ? updatedRow : tx)
      );
      setMergedTransactions(prev =>
        prev.map(t => t._id === _id ? updatedRow : t)
      );
      setEditingIndex(null);
    } catch (err) {
      console.error("Update error:", err);
      customAlert("Update failed: " + err.message, "error");
    }
  };

  // Enter key to save transaction (only when editing)
  useEnterToSave(() => {
    if (editingIndex !== null) {
      handleSave();
    }
  }, editingIndex === null);

  return (
    <>
      <Helmet>
        <title> Financial Summary | RootFin</title>
      </Helmet>

      <div className="bg-slate-50 min-h-screen">
        <Headers title={"Financial Summary Report"} />
        <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
          <div className="p-6">
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-4px); }
                to   { opacity: 1; transform: translateY(0); }
              }
              @keyframes dropdownOpen {
                from { opacity: 0; transform: translateY(-6px) scale(0.98); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
              }
              @keyframes shimmer {
                0%   { background-position: -400px 0; }
                100% { background-position: 400px 0; }
              }
              .shimmer {
                background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
                background-size: 400px 100%;
                animation: shimmer 1.4s infinite;
                border-radius: 6px;
              }
              .branch-select-btn {
                background-color: white !important;
                color: #374151 !important;
                border: 1px solid #cbd5e1 !important;
                box-shadow: none !important;
                transform: none !important;
              }
              .branch-select-btn:hover {
                background-color: #f8fafc !important;
                border-color: #94a3b8 !important;
                transform: none !important;
                box-shadow: none !important;
              }
            `}</style>

            {/* Filter Bar */}
            <div className="bg-white rounded-none p-6 border border-gray-200 shadow-sm mb-6 no-print">
              <div className="flex flex-col gap-5">
                {/* Inputs & Selects Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                  {/* From Date */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1.5">From Date</label>
                    <input
                      type="date"
                      id="fromDate"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      max="2099-12-31"
                      min="2000-01-01"
                      className="h-[42px] border border-gray-200 rounded-none px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#9B48D7]/20 focus:border-[#9B48D7] transition-all bg-white text-gray-700 font-medium"
                    />
                  </div>

                  {/* To Date */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1.5">To Date</label>
                    <input
                      type="date"
                      id="toDate"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      max="2099-12-31"
                      min="2000-01-01"
                      className="h-[42px] border border-gray-200 rounded-none px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#9B48D7]/20 focus:border-[#9B48D7] transition-all bg-white text-gray-700 font-medium"
                    />
                  </div>

                  {/* Category */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1.5">Category</label>
                    <Select
                      isMulti
                      options={categories}
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      components={{ Option: CheckboxOption }}
                      closeMenuOnSelect={false}
                      hideSelectedOptions={false}
                      menuPortalTarget={document.body}
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          minHeight: '42px',
                          height: '42px',
                          border: state.isFocused ? '1px solid #9B48D7' : '1px solid #e5e7eb',
                          borderRadius: '0px',
                          boxShadow: state.isFocused ? '0 0 0 2px rgba(155,72,215,0.15)' : 'none',
                          fontSize: '0.875rem',
                          backgroundColor: 'white',
                          transition: 'all 0.15s ease',
                          '&:hover': { border: '1px solid #cbd5e1' }
                        }),
                        valueContainer: base => ({ ...base, height: '40px', padding: '0 12px' }),
                        input: base => ({ ...base, margin: '0px', padding: '0px' }),
                        indicatorSeparator: base => ({ ...base, display: 'none' }),
                        dropdownIndicator: (base, state) => ({
                          ...base,
                          padding: '0 12px',
                          transition: 'transform 0.2s ease',
                          transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          color: '#6b7280'
                        }),
                        menu: base => ({
                          ...base,
                          zIndex: 9999,
                          borderRadius: '0px',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                          animation: 'dropdownOpen 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                          overflow: 'hidden'
                        }),
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                        option: (base, state) => ({
                          ...base,
                          fontSize: '0.875rem',
                          backgroundColor: state.isSelected ? '#f3e8ff' : state.isFocused ? '#f5f3ff' : 'white',
                          color: '#374151',
                          cursor: 'pointer',
                        }),
                      }}
                    />
                  </div>

                  {/* Sub Category */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1.5">Sub Category</label>
                    <Select
                      isMulti
                      options={subCategories}
                      value={selectedSubCategory}
                      onChange={setSelectedSubCategory}
                      components={{ Option: CheckboxOption }}
                      closeMenuOnSelect={false}
                      hideSelectedOptions={false}
                      menuPortalTarget={document.body}
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          minHeight: '42px',
                          height: '42px',
                          border: state.isFocused ? '1px solid #9B48D7' : '1px solid #e5e7eb',
                          borderRadius: '0px',
                          boxShadow: state.isFocused ? '0 0 0 2px rgba(155,72,215,0.15)' : 'none',
                          fontSize: '0.875rem',
                          backgroundColor: 'white',
                          transition: 'all 0.15s ease',
                          '&:hover': { border: '1px solid #cbd5e1' }
                        }),
                        valueContainer: base => ({ ...base, height: '40px', padding: '0 12px' }),
                        input: base => ({ ...base, margin: '0px', padding: '0px' }),
                        indicatorSeparator: base => ({ ...base, display: 'none' }),
                        dropdownIndicator: (base, state) => ({
                          ...base,
                          padding: '0 12px',
                          transition: 'transform 0.2s ease',
                          transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          color: '#6b7280'
                        }),
                        menu: base => ({
                          ...base,
                          zIndex: 9999,
                          borderRadius: '0px',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                          animation: 'dropdownOpen 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                          overflow: 'hidden'
                        }),
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                        option: (base, state) => ({
                          ...base,
                          fontSize: '0.875rem',
                          backgroundColor: state.isSelected ? '#f3e8ff' : state.isFocused ? '#f5f3ff' : 'white',
                          color: '#374151',
                          cursor: 'pointer',
                        }),
                      }}
                    />
                  </div>

                  {/* Store / Department Combined */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1.5">Store / Department</label>
                    <Select
                      placeholder="Select Store..."
                      options={[
                        { value: "current", label: `Current Store (${currentusers.locCode})` },
                        ...(((currentusers.power || '').toLowerCase() === 'admin' || isClusterManager || isFinancialHead)
                          ? [{ value: "all", label: "All Stores (Totals)" }]
                          : []),
                        ...(((currentusers.power || '').toLowerCase() === 'admin' || isFinancialHead)
                          ? [{ value: "multi", label: "Multiple Branches" }]
                          : []),
                        ...(showAction ? [{
                          label: "Departments",
                          options: [
                            { value: "all_departments", label: "All Departments" },
                            ...AllLoation.filter(s => DEPT_LOC_CODES.includes(s.locCode))
                              .map(s => ({ value: s.locCode, label: s.locName })),
                            { value: "Office", label: "Office" },
                            { value: "Production", label: "Production" },
                          ]
                        }] : [])
                      ]}
                      value={(() => {
                        if (selectedStore === "current") return { value: "current", label: `Current Store (${currentusers.locCode})` };
                        if (selectedStore === "all") return { value: "all", label: "All Stores (Totals)" };
                        if (selectedStore === "all_departments") return { value: "all_departments", label: "All Departments" };
                        if (selectedStore === "multi") return { value: "multi", label: "Multiple Branches" };
                        const found = AllLoation.find(s => s.locCode === selectedStore);
                        return found ? { value: found.locCode, label: found.locName } : null;
                      })()}
                      onChange={(opt) => setSelectedStore(opt ? opt.value : "current")}
                      menuPortalTarget={document.body}
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          minHeight: '42px',
                          height: '42px',
                          border: state.isFocused ? '1px solid #9B48D7' : '1px solid #e5e7eb',
                          borderRadius: '0px',
                          boxShadow: state.isFocused ? '0 0 0 2px rgba(155,72,215,0.15)' : 'none',
                          fontSize: '0.875rem',
                          backgroundColor: 'white',
                          transition: 'all 0.15s ease',
                          '&:hover': { border: '1px solid #cbd5e1' }
                        }),
                        valueContainer: base => ({ ...base, height: '40px', padding: '0 12px' }),
                        input: base => ({ ...base, margin: '0px', padding: '0px' }),
                        indicatorSeparator: base => ({ ...base, display: 'none' }),
                        dropdownIndicator: (base, state) => ({
                          ...base,
                          padding: '0 12px',
                          transition: 'transform 0.2s ease',
                          transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          color: '#6b7280'
                        }),
                        menu: base => ({
                          ...base,
                          zIndex: 9999,
                          borderRadius: '0px',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                          animation: 'dropdownOpen 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                          overflow: 'hidden'
                        }),
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                        option: (base, state) => ({
                          ...base,
                          fontSize: '0.875rem',
                          backgroundColor: state.isSelected ? '#9B48D7' : state.isFocused ? '#f5f3ff' : 'white',
                          color: state.isSelected ? 'white' : '#374151',
                          cursor: 'pointer',
                        }),
                      }}
                    />
                  </div>
                </div>

                {/* Bottom Row Actions: Fetch Data on Left, Export & Print on Right */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleFetch}
                      disabled={isFetching}
                      style={{ backgroundColor: isFetching ? 'rgba(155, 72, 215, 0.6)' : '#9B48D7', color: '#ffffff' }}
                      className="h-[42px] rounded-none text-white px-6 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:opacity-90 active:scale-95 cursor-pointer"
                    >
                      {isFetching ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          <span>Fetching...</span>
                        </>
                      ) : 'Fetch Data'}
                    </button>

                    {/* Select Branches dropdown button */}
                    {selectedStore === "multi" && (
                      <button
                        onClick={() => setShowStoreSelector(prev => !prev)}
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          whiteSpace: 'nowrap',
                          height: '42px',
                          padding: '0 16px',
                          border: '1px solid #e5e7eb',
                          backgroundColor: '#ffffff',
                          color: '#374151',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          boxSizing: 'border-box'
                        }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-gray-500 shrink-0" style={{ display: 'block' }}><path d="M3 6h18M7 12h10M11 18h2" /></svg>
                        <span style={{ display: 'inline-block' }}>
                          {selectedStores.length === 0 ? "Select Branches" : `${selectedStores.length} Branch${selectedStores.length > 1 ? "es" : ""}`}
                        </span>
                        {selectedStores.length > 0 && (
                          <span
                            style={{ backgroundColor: '#9B48D7', color: '#ffffff' }}
                            className="inline-flex items-center justify-center h-5 px-1.5 rounded-none text-white text-[10px] font-bold"
                          >
                            {selectedStores.length}
                          </span>
                        )}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3.5 h-3.5 text-gray-400 transition-transform shrink-0 ${showStoreSelector ? "rotate-180" : ""}`} style={{ display: 'block' }}><path d="M6 9l6 6 6-6" /></svg>
                      </button>
                    )}
                  </div>

                  {/* Action Buttons Right Side */}
                  <div className="flex items-center gap-3">
                    <CSVLink
                      data={selectedStore === "all" ? allStoresExportData : (selectedStore === "multi" || selectedStore === "all_departments") ? multiExportData : exportData}
                      headers={selectedStore === "all" ? allStoresCsvHeaders : (selectedStore === "multi" || selectedStore === "all_departments") ? multiBranchCsvHeaders : headers}
                      filename={`financial_summary_${selectedStore === "all" ? "All_Branches_Totals" : selectedStore === "all_departments" ? "All_Departments" : selectedStore === "multi" ? "Multiple_Branches" : (AllLoation.find(loc => loc.locCode === currentusers.locCode)?.locName || currentusers.locCode || "Store").replace(/[^a-zA-Z0-9]/g, "_")}_${fromDate === toDate ? fromDate : fromDate + "_to_" + toDate}.csv`}
                    >
                      <button
                        type="button"
                        style={{ backgroundColor: '#EEEEEE', color: '#111827', borderRadius: '0px' }}
                        className="h-[40px] rounded-none bg-[#EEEEEE] hover:bg-[#E2E2E2] text-[#111827] px-5 text-sm font-medium flex flex-row items-center justify-center gap-2.5 whitespace-nowrap flex-shrink-0 transition-colors cursor-pointer shadow-none"
                      >
                        <FiDownload className="w-4 h-4 text-[#111827]" />
                        <span>Export CSV</span>
                      </button>
                    </CSVLink>
                    <button
                      type='button'
                      onClick={handlePrint}
                      style={{ backgroundColor: '#EEEEEE', color: '#111827', borderRadius: '0px' }}
                      className="h-[42px] rounded-none bg-[#EEEEEE] hover:bg-[#E2E2E2] text-[#111827] px-5 text-sm font-medium flex flex-row items-center justify-center gap-2.5 whitespace-nowrap flex-shrink-0 transition-colors cursor-pointer shadow-none"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[#111827]"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><path d="M6 14h12v8H6z" /></svg>
                      <span>Print PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div ref={printRef}>
              {/* Loading Screen */}

              {selectedStore === "all" ? (
                <div className="bg-white shadow-sm rounded-none border border-gray-200 overflow-hidden">
                  <div style={{ maxHeight: "600px", overflowY: "auto", overflowX: "auto" }}>
                    <table className="w-full border-collapse text-xs" style={{ minWidth: '800px' }}>
                      <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                        <tr className="bg-[#1e1e1e] text-white text-xs uppercase tracking-wide font-bold">
                          <th className="px-3 py-3 text-left font-bold whitespace-nowrap border-r border-[#333333] text-xs">STORE</th>
                          <th className="px-3 py-3 text-left font-bold whitespace-nowrap border-r border-[#333333] text-xs">LOCCODE</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">CASH</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">RAZORPAY</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">CARD/BANK</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">UPI</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">TOTAL AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allStoresSummary.map((s, idx) => (
                          <tr key={s.locCode || idx} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                            <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs font-medium">{s.store}</td>
                            <td className="px-3 py-2 text-gray-500 border-r border-gray-100 text-xs">{s.locCode}</td>
                            <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{Math.round(Number(s.cash || 0)).toLocaleString()}</td>
                            <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{Math.round(Number(s.rbl || 0)).toLocaleString()}</td>
                            <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{Math.round(Number(s.bank || 0)).toLocaleString()}</td>
                            <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{Math.round(Number(s.upi || 0)).toLocaleString()}</td>
                            <td className="px-3 py-2 text-right font-bold text-gray-900 text-xs">{Math.round(Number(s.amount || 0)).toLocaleString()}</td>
                          </tr>
                        ))}
                        {allStoresSummary.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                              No stores found
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[#e2e8f0] font-bold border-t-2 border-gray-300" style={{ position: "sticky", bottom: 0, zIndex: 2 }}>
                          <td colSpan={2} className="px-3 py-2.5 text-gray-800 uppercase tracking-wide text-xs font-bold">TOTAL</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{Math.round(Number(allStoresTotals.cash || 0)).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{Math.round(Number(allStoresTotals.rbl || 0)).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{Math.round(Number(allStoresTotals.bank || 0)).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{Math.round(Number(allStoresTotals.upi || 0)).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{Math.round(Number(allStoresTotals.amount || 0)).toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : (selectedStore === "multi" || selectedStore === "all_departments") ? (
                <div className="bg-white shadow-sm rounded-none border border-gray-200 overflow-hidden">
                  <div style={{ maxHeight: "600px", overflowY: "auto", overflowX: "auto" }}>
                    <table className="w-full border-collapse text-xs" style={{ minWidth: '1700px' }}>
                      <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                        <tr className="bg-[#1e1e1e] text-white text-xs uppercase tracking-wide font-bold">
                          <th className="px-3 py-3 text-left font-bold whitespace-nowrap border-r border-[#333333] text-xs min-w-[110px]">Date</th>
                          <th className="px-3 py-3 text-left font-bold whitespace-nowrap border-r border-[#333333] text-xs">Invoice No.</th>
                          <th className="px-3 py-3 text-left font-bold whitespace-nowrap border-r border-[#333333] text-xs">Customer Name</th>
                          <th className="px-3 py-3 text-left font-bold whitespace-nowrap border-r border-[#333333] text-xs">Category</th>
                          <th className="px-3 py-3 text-left font-bold whitespace-nowrap border-r border-[#333333] text-xs">Sub Category</th>
                          <th className="px-3 py-3 text-left font-bold whitespace-nowrap border-r border-[#333333] text-xs">Remarks</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">Amount</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">Total Txn</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">Discount</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">Bill Value</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">Cash</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">Razorpay</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">Card/Bank</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">UPI</th>
                          <th className="px-3 py-3 text-left font-bold whitespace-nowrap border-r border-[#333333] text-xs">Branch</th>
                          <th className="px-3 py-3 text-center font-bold whitespace-nowrap border-r border-[#333333] text-xs">Attachment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {multiBranchData
                          .filter(filterTransaction)
                          .map((t, index) => {
                            if (t.Category === "RentOut") {
                              return (
                                <React.Fragment key={`mb-frag-${t._id || t.invoiceNo || index}`}>
                                  <tr key={`mb-${index}-sec`} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                                    <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs"><div>{t.date}</div>{t.time && <div className="text-[10px] text-gray-500 mt-0.5">{t.time}</div>}</td>
                                    <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.invoiceNo || t.locCode}</td>
                                    <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.customerName || "-"}</td>
                                    <td rowSpan="2" className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.Category}</td>
                                    <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.SubCategory}</td>
                                    <td className="px-3 py-2 text-gray-500 border-r border-gray-100 text-xs">{t.remark}</td>
                                    <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{t.securityAmount}</td>
                                    <td rowSpan="2" className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{t.totalTransaction}</td>
                                    <td rowSpan="2" className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{t.discountAmount || 0}</td>
                                    <td rowSpan="2" className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{t.billValue ? Math.round(Number(t.billValue)).toLocaleString() : "-"}</td>
                                    <td rowSpan="2" className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{t.cash ? Math.round(Number(t.cash)).toLocaleString() : "-"}</td>
                                    <td rowSpan="2" className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{t.rbl ? Math.round(Number(t.rbl)).toLocaleString() : "-"}</td>
                                    <td rowSpan="2" className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{t.bank ? Math.round(Number(t.bank)).toLocaleString() : "-"}</td>
                                    <td rowSpan="2" className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{t.upi ? Math.round(Number(t.upi)).toLocaleString() : "-"}</td>
                                    <td rowSpan="2" className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs font-medium">{t.branch}</td>
                                    <td rowSpan="2" className="px-3 py-2 text-center border-r border-gray-100 text-xs">
                                      <AttachmentDownloadCell t={t} />
                                    </td>
                                  </tr>
                                  <tr key={`mb-${index}-bal`} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                                    <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs"><div>{t.date}</div>{t.time && <div className="text-[10px] text-gray-500 mt-0.5">{t.time}</div>}</td>
                                    <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.invoiceNo || t.locCode}</td>
                                    <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.customerName || "-"}</td>
                                    <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.SubCategory1}</td>
                                    <td className="px-3 py-2 text-gray-500 border-r border-gray-100 text-xs">{t.remark}</td>
                                    <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{t.Balance}</td>
                                  </tr>
                                </React.Fragment>
                              );
                            }
                            return (
                              <tr key={`mb-${t.invoiceNo || t._id || t.locCode}-${index}`} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                                <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs"><div>{t.date}</div>{t.time && <div className="text-[10px] text-gray-500 mt-0.5">{t.time}</div>}</td>
                                <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.invoiceNo || t.locCode}</td>
                                <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.customerName || "-"}</td>
                                <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.Category || t.type}</td>
                                <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">
                                  {[t.SubCategory].concat(t.Category === "RentOut" ? [t.SubCategory1 || t.subCategory1] : []).filter(Boolean).map(getCatLabel).join(" + ") || "-"}
                                </td>
                                <td className="px-3 py-2 text-gray-500 border-r border-gray-100 text-xs">{t.remark}</td>
                                <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{Math.round(Number(t.amount)).toLocaleString()}</td>
                                <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{Math.round(Number(t.totalTransaction)).toLocaleString()}</td>
                                <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{Math.round(Number(t.discountAmount || 0)).toLocaleString()}</td>
                                <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{t.billValue ? Math.round(Number(t.billValue)).toLocaleString() : "-"}</td>
                                <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{t.cash ? Math.round(Number(t.cash)).toLocaleString() : "-"}</td>
                                <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{t.rbl ? Math.round(Number(t.rbl)).toLocaleString() : "-"}</td>
                                <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{t.bank ? Math.round(Number(t.bank)).toLocaleString() : "-"}</td>
                                <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{t.upi ? Math.round(Number(t.upi)).toLocaleString() : "-"}</td>
                                <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs font-medium">{t.branch}</td>
                                <td className="px-3 py-2 text-center border-r border-gray-100 text-xs">
                                  <AttachmentDownloadCell t={t} />
                                </td>
                              </tr>
                            );
                          })}
                        {multiBranchData.length === 0 && (
                          <tr>
                            <td colSpan={17} className="text-center py-8 text-gray-400 text-sm">
                              {selectedStores.length === 0 ? "Select branches above and click Fetch Data" : "No transactions found"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[#e2e8f0] font-bold border-t-2 border-gray-300" style={{ position: "sticky", bottom: 0, zIndex: 2 }}>
                          <td colSpan="6" className="px-3 py-2.5 text-left text-gray-800 text-xs font-bold uppercase tracking-wide">TOTAL</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{multiBranchData.filter(filterTransaction).reduce((s, t) => s + Math.round(Number(t.amount || 0)), 0).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{multiBranchData.filter(filterTransaction).reduce((s, t) => s + Math.round(Number(t.totalTransaction || 0)), 0).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{multiBranchData.filter(filterTransaction).reduce((s, t) => s + Math.round(Number(t.discountAmount || 0)), 0).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{multiBranchData.filter(filterTransaction).reduce((s, t) => s + Math.round(Number(t.billValue || 0)), 0).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{multiBranchData.filter(filterTransaction).reduce((s, t) => s + Math.round(Number(t.cash || 0)), 0).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{multiBranchData.filter(filterTransaction).reduce((s, t) => s + Math.round(Number(t.rbl || 0)), 0).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{multiBranchData.filter(filterTransaction).reduce((s, t) => s + Math.round(Number(t.bank || 0)), 0).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{multiBranchData.filter(filterTransaction).reduce((s, t) => s + Math.round(Number(t.upi || 0)), 0).toLocaleString()}</td>
                          <td colSpan="2" className="px-3 py-2.5 text-gray-800 text-xs font-bold"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow-sm rounded-none border border-gray-200 overflow-hidden">
                  <div style={{ maxHeight: "600px", overflowY: "auto", overflowX: "auto" }}>
                    <table className="w-full border-collapse text-xs" style={{ minWidth: '1700px' }}>
                      <thead
                        style={{
                          position: "sticky",
                          top: 0,
                          zIndex: 2,
                        }}
                      >
                        <tr className="bg-[#1e1e1e] text-white text-xs uppercase tracking-wide font-bold">
                          <th className="px-3 py-3 text-left font-bold whitespace-nowrap border-r border-[#333333] text-xs min-w-[110px]">Date</th>
                          <th className="px-3 py-3 text-left font-bold whitespace-nowrap border-r border-[#333333] text-xs">Invoice No.</th>
                          <th className="px-3 py-3 text-left font-bold whitespace-nowrap border-r border-[#333333] text-xs">Customer Name</th>
                          <th className="px-3 py-3 text-left font-bold whitespace-nowrap border-r border-[#333333] text-xs">QTY</th>
                          <th className="px-3 py-3 text-left font-bold whitespace-nowrap border-r border-[#333333] text-xs">Category</th>
                          <th className="px-3 py-3 text-left font-bold whitespace-nowrap border-r border-[#333333] text-xs">Sub Category</th>
                          <th className="px-3 py-3 text-left font-bold whitespace-nowrap border-r border-[#333333] text-xs">Remarks</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">Amount</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">Total Txn</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">Discount</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">Bill Value</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">Cash</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">Razorpay</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">Card/Bank</th>
                          <th className="px-3 py-3 text-right font-bold whitespace-nowrap border-r border-[#333333] text-xs">UPI</th>
                          <th className="px-3 py-3 text-center font-bold whitespace-nowrap border-r border-[#333333] text-xs">Attachment</th>
                          {showAction && <th className="px-3 py-3 text-center font-bold whitespace-nowrap border-r border-[#333333] text-xs">Action</th>}
                        </tr>
                      </thead>

                      <tbody>
                        {/* OPENING BALANCE ROW */}
                        <tr className="bg-white font-bold text-gray-900 border-b border-gray-200">
                          <td colSpan={11} className="px-3 py-2.5 text-xs uppercase tracking-wide font-bold">
                            OPENING BALANCE
                          </td>
                          <td className="px-3 py-2.5 text-right text-xs font-semibold whitespace-nowrap">{openingCash ? Math.round(openingCash).toLocaleString() : "-"}</td>
                          <td className="px-3 py-2.5 text-right text-xs font-semibold whitespace-nowrap">{openingRbl ? Math.round(openingRbl).toLocaleString() : "-"}</td>
                          <td className="px-3 py-2.5 text-right text-xs font-semibold whitespace-nowrap">-</td>
                          <td className="px-3 py-2.5 text-right text-xs font-semibold whitespace-nowrap">-</td>
                          <td className="px-3 py-2.5"></td>
                          {showAction && <td className="px-3 py-2.5"></td>}
                        </tr>

                        {displayedRows
                          .map((transaction, index) => {
                            const isEditing = editingIndex === index;
                            const t = isEditing ? editedTransaction : transaction;
                            const paymentInputClass = "w-full min-w-[72px] border border-gray-300 rounded-none p-1 text-xs text-right bg-white";
                            const renderPaymentCell = (field) => {
                              if (isEditing) {
                                return (
                                  <input
                                    type="number"
                                    value={editedTransaction[field] ?? ""}
                                    onChange={(e) => handleInputChange(field, e.target.value)}
                                    className={paymentInputClass}
                                  />
                                );
                              }
                              const val = t[field];
                              return val ? Math.round(Number(val)).toLocaleString() : "-";
                            };

                            if (t.Category === "RentOut") {
                              return (
                                <React.Fragment key={`sb-frag-${t._id || t.invoiceNo || index}`}>
                                  <tr key={`${index}-sec`} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                                    <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs"><div>{t.date}</div>{t.time && <div className="text-[10px] text-gray-500 mt-0.5">{t.time}</div>}</td>
                                    <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.invoiceNo || t.locCode}</td>
                                    <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">
                                      {t.customerName || t.customer || t.name || "-"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.qty || t.quantity || "-"}</td>
                                    <td rowSpan="2" className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">
                                      {t.Category}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.SubCategory}</td>
                                    <td className="px-3 py-2 text-gray-500 border-r border-gray-100 text-xs">{t.remark}</td>
                                    <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">
                                      {isEditing ? (
                                        <input
                                          type="number"
                                          value={editedTransaction.securityAmount}
                                          onChange={(e) =>
                                            handleInputChange("securityAmount", e.target.value)
                                          }
                                          className="w-full border border-gray-300 rounded-none p-1 text-sm"
                                        />
                                      ) : (
                                        t.securityAmount
                                      )}
                                    </td>
                                    <td rowSpan="2" className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">
                                      {t.totalTransaction}
                                    </td>
                                    <td rowSpan="2" className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">
                                      {t.discountAmount || 0}
                                    </td>
                                    <td rowSpan="2" className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{t.billValue ? Math.round(Number(t.billValue)).toLocaleString() : "-"}</td>
                                    <td rowSpan="2" className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{renderPaymentCell("cash")}</td>
                                    <td rowSpan="2" className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{renderPaymentCell("rbl")}</td>
                                    <td rowSpan="2" className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{renderPaymentCell("bank")}</td>
                                    <td rowSpan="2" className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{renderPaymentCell("upi")}</td>

                                    <td rowSpan="2" className="px-3 py-2 text-center border-r border-gray-100 text-xs">
                                      <AttachmentDownloadCell t={t} />
                                    </td>

                                    {showAction && (
                                      <td rowSpan="2" className="px-3 py-2 text-center border-r border-gray-100 text-xs">
                                        {isSyncing && editingIndex === index ? (
                                          <span className="text-gray-400 text-xs">Syncing…</span>
                                        ) : isEditing ? (
                                          <button
                                            onClick={handleSave}
                                            className="bg-emerald-600 text-white px-3 py-1 rounded-none text-xs font-medium hover:bg-emerald-700"
                                          >
                                            Save
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => handleEditClick(transaction, index)}
                                            className="bg-[#18181b] text-white px-3 py-1 rounded-none text-xs font-medium hover:bg-black cursor-pointer"
                                          >
                                            Edit
                                          </button>
                                        )}
                                      </td>
                                    )}
                                  </tr>

                                  <tr key={`${index}-bal`} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                                    <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs"><div>{t.date}</div>{t.time && <div className="text-[10px] text-gray-500 mt-0.5">{t.time}</div>}</td>
                                    <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.invoiceNo || t.locCode}</td>
                                    <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">
                                      {t.customerName || t.customer || t.name || "-"}
                                    </td>
                                    <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.qty || t.quantity || "-"}</td>
                                    <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.SubCategory1}</td>
                                    <td className="px-3 py-2 text-gray-500 border-r border-gray-100 text-xs">{t.remark}</td>
                                    <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">
                                      {isEditing ? (
                                        <input
                                          type="number"
                                          value={editedTransaction.Balance}
                                          onChange={(e) =>
                                            handleInputChange("Balance", e.target.value)
                                          }
                                          className="w-full border border-gray-300 rounded-none p-1 text-sm"
                                        />
                                      ) : (
                                        t.Balance
                                      )}
                                    </td>
                                  </tr>
                                </React.Fragment>
                              );
                            }

                            return (
                              <tr
                                key={`${t.invoiceNo || t._id || t.locCode}-${(t.date ? new Date(t.date).toISOString().split("T")[0] : "")}-${index}`}
                                className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
                              >
                                <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs"><div>{t.date}</div>{t.time && <div className="text-[10px] text-gray-500 mt-0.5">{t.time}</div>}</td>
                                <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.invoiceNo || t.locCode}</td>
                                <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">
                                  {t.customerName || t.customer || t.name || "-"}
                                </td>
                                <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.qty || t.quantity || "-"}</td>
                                <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">{t.Category || t.type}</td>
                                <td className="px-3 py-2 text-gray-700 border-r border-gray-100 text-xs">
                                  {[t.SubCategory]
                                    .concat(
                                      t.Category === "RentOut" ? [t.SubCategory1 || t.subCategory1] : []
                                    )
                                    .filter(Boolean)
                                    .map(getCatLabel)
                                    .join(" + ") || "-"}
                                </td>
                                <td className="px-3 py-2 text-gray-500 border-r border-gray-100 text-xs">{t.remark}</td>
                                <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{Math.round(Number(t.amount)).toLocaleString()}</td>
                                <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{Math.round(Number(t.totalTransaction)).toLocaleString()}</td>
                                <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{Math.round(Number(t.discountAmount || 0)).toLocaleString()}</td>
                                <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{t.billValue ? Math.round(Number(t.billValue)).toLocaleString() : "-"}</td>
                                <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{renderPaymentCell("cash")}</td>
                                <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{renderPaymentCell("rbl")}</td>
                                <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{renderPaymentCell("bank")}</td>
                                <td className="px-3 py-2 text-right text-gray-700 border-r border-gray-100 text-xs">{renderPaymentCell("upi")}</td>
                                <td className="px-3 py-2 text-center border-r border-gray-100 text-xs">
                                  <AttachmentDownloadCell t={t} />
                                </td>
                                {showAction && (
                                  <td className="px-3 py-2 text-center border-r border-gray-100 text-xs">
                                    {isSyncing && editingIndex === index ? (
                                      <span className="text-gray-400 text-xs">Syncing…</span>
                                    ) : isEditing ? (
                                      <button
                                        onClick={handleSave}
                                        className="bg-emerald-600 text-white px-3 py-1 rounded-none text-xs font-medium hover:bg-emerald-700"
                                      >
                                        Save
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleEditClick(transaction, index)}
                                        className="bg-[#18181b] text-white px-3 py-1 rounded-none text-xs font-medium hover:bg-black cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                    )}
                                  </td>
                                )}
                              </tr>
                            );
                          })}

                        {mergedTransactions.length === 0 && (
                          <tr>
                            <td colSpan={showAction ? 15 : 14} className="text-center py-8 text-gray-400 text-sm">
                              No transactions found
                            </td>
                          </tr>
                        )}
                      </tbody>

                      <tfoot>
                        <tr
                          className="bg-[#e2e8f0] font-bold border-t-2 border-gray-300"
                          style={{ position: "sticky", bottom: 0, zIndex: 2 }}
                        >
                          <td colSpan="7" className="px-3 py-2.5 text-left text-gray-800 text-xs font-bold uppercase tracking-wider">
                            Total
                          </td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{Math.round(Number(totals.amount)).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{Math.round(Number(totals.totalTransaction)).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{Math.round(Number(totals.discountAmount)).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">-</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{Math.round(Number(totalCash)).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{Math.round(Number(totalRblAmount)).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{Math.round(Number(totalBankAmount)).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right text-gray-900 text-xs font-bold">{Math.round(Number(totalUpiAmount)).toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-center text-gray-900 text-xs font-bold"></td>
                          {showAction && <td className="px-3 py-2.5"></td>}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Branch selector dropdown panel — fixed position to escape overflow */}
            {selectedStore === "multi" && showStoreSelector && (
              <div
                className="fixed z-[9999] bg-white rounded-none border border-gray-200 shadow-2xl no-print"
                style={{ top: '180px', left: '400px', minWidth: '560px' }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-none">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {selectedStores.length} of {visibleLocations.length} selected
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedStores(visibleLocations.map(l => l.locCode))} className="px-3 py-1 text-xs font-medium rounded-none bg-[#9B48D7] text-white hover:bg-[#8836c2] transition-colors">All</button>
                    <button onClick={() => setSelectedStores([])} className="px-3 py-1 text-xs font-medium rounded-none border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors">None</button>
                    <button onClick={() => setShowStoreSelector(false)} className="px-3 py-1 text-xs font-medium rounded-none bg-[#9B48D7] text-white hover:bg-[#8836c2] transition-colors">Done ✓</button>
                  </div>
                </div>
                <div className="p-3 grid grid-cols-4 gap-2 max-h-56 overflow-y-auto">
                  {visibleLocations.map(loc => {
                    const isChecked = selectedStores.includes(loc.locCode);
                    return (
                      <label key={loc.locCode} className={`flex items-center gap-2 cursor-pointer rounded-xl px-3 py-2 text-xs font-medium transition-all border ${isChecked ? "bg-purple-50 border-[#9B48D7] text-[#9B48D7]" : "bg-white border-gray-200 text-gray-600 hover:border-purple-200 hover:bg-gray-50"}`}>
                        <input type="checkbox" checked={isChecked} onChange={e => { if (e.target.checked) { setSelectedStores(prev => [...prev, loc.locCode]); } else { setSelectedStores(prev => prev.filter(c => c !== loc.locCode)); } }} className="accent-[#9B48D7] shrink-0" />
                        <span className="truncate">{loc.locName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}

export default Datewisedaybook;
