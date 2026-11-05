import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import baseUrl from '../api/api';
import { 
  Search, 
  Plus, 
  SlidersHorizontal, 
  RotateCcw, 
  ChevronDown, 
  FileText, 
  ExternalLink,
  Menu,
  X,
  Download
} from 'lucide-react';
import { useSidebar } from '../hooks/useSidebar.js';

// Animated Search Bar matching "scry:search" 3D Flip Animation
const AnimatedSearchBar = ({ value, onChange, placeholder = "Search by category, branch, remark..." }) => {
  const [isOpen, setIsOpen] = useState(Boolean(value));
  const inputRef = useRef(null);

  // Keep open if external value exists
  useEffect(() => {
    if (value && !isOpen) {
      setIsOpen(true);
    }
  }, [value]);

  const handleButtonClick = () => {
    // One button, three jobs:
    // 1. If closed -> open and focus
    // 2. If has text -> clear text and keep focused
    // 3. If open and empty -> close
    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 80);
      return;
    }
    if (value && value.trim().length > 0) {
      onChange("");
      inputRef.current?.focus();
      return;
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      if (value) {
        onChange("");
      } else {
        setIsOpen(false);
      }
    }
  };

  const hasText = Boolean(value && value.trim().length > 0);

  return (
    <>
      <style>{`
        .scry__seat {
          position: relative;
          display: inline-flex;
          align-items: center;
          perspective: 800px;
          transform-style: preserve-3d;
          height: 44px;
        }

        .scry__shadow {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.03);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .scry__seat[data-open="true"] .scry__shadow {
          opacity: 1;
        }

        .scry__field {
          position: relative;
          display: flex;
          align-items: center;
          height: 44px;
          background: #ffffff;
          border-radius: 9999px;
          border: 1.5px solid #E5E7EB;
          overflow: hidden;
          transform-origin: 50% 50%;
          transition: transform 0.633s cubic-bezier(0.55, 0.08, 0.4, 0.95),
                      width 0.633s cubic-bezier(0.55, 0.08, 0.4, 0.95),
                      opacity 0.35s ease,
                      border-color 0.2s ease,
                      box-shadow 0.2s ease;
        }

        .scry__field[data-state="closed"] {
          transform: rotateX(-90deg);
          opacity: 0;
          width: 44px;
          pointer-events: none;
        }

        .scry__field[data-state="open"] {
          transform: rotateX(0deg);
          opacity: 1;
          width: 340px;
          pointer-events: auto;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
        }

        .scry__field[data-state="open"]:focus-within {
          border-color: #9B48D7;
          box-shadow: 0 0 0 4px rgba(155, 72, 215, 0.12), 0 4px 14px rgba(0, 0, 0, 0.04);
        }

        @media (max-width: 640px) {
          .scry__field[data-state="open"] {
            width: 230px;
          }
        }

        .scry__sheen {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 60%);
          pointer-events: none;
          border-radius: 9999px;
        }

        .scry__input {
          width: 100%;
          height: 100%;
          padding: 0 46px 0 18px;
          background: transparent;
          border: none;
          outline: none;
          font-size: 13.5px;
          color: #111827;
          font-weight: 500;
        }

        .scry__input::placeholder {
          color: #9CA3AF;
          font-weight: 400;
        }

        .scry__btn {
          width: 36px;
          height: 36px;
          border-radius: 9999px;
          background: #111827;
          color: #ffffff;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: none !important;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.3s cubic-bezier(0.55, 0.08, 0.4, 0.95), box-shadow 0.2s ease;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        }

        .scry__btn:hover {
          background: #000000;
          transform: scale(1.05);
        }

        .scry__btn:active {
          transform: scale(0.95);
        }

        .scry__seat[data-open="true"] .scry__btn {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
        }

        .scry__seat[data-open="true"] .scry__btn:hover {
          transform: translateY(-50%) scale(1.05);
        }

        .scry__seat[data-open="true"] .scry__btn:active {
          transform: translateY(-50%) scale(0.95);
        }
      `}</style>

      <div className="scry__seat" data-open={isOpen ? "true" : "false"}>
        <span className="scry__shadow" />
        
        <div className="scry__field" data-state={isOpen ? "open" : "closed"}>
          <span className="scry__sheen" />
          <input
            ref={inputRef}
            className="scry__input"
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck="false"
          />
        </div>

        <button
          type="button"
          className="scry__btn custom-button"
          onClick={handleButtonClick}
          title={!isOpen ? "Search" : hasText ? "Clear search" : "Close search"}
        >
          {isOpen ? (
            <X size={17} className="transition-transform duration-200 animate-in fade-in zoom-in-75" />
          ) : (
            <Search size={16} className="transition-transform duration-200" />
          )}
        </button>
      </div>
    </>
  );
};

const fallbackLocations = [
  { locName: "Warehouse", locCode: "858" },
  { locName: "G-Edappally", locCode: "702" },
  { locName: "HEAD OFFICE01", locCode: "759" },
  { locName: "Brynex Office", locCode: "102" },
  { locName: "SG-Trivandrum", locCode: "700" },
  { locName: "Z-Edapally", locCode: "144" },
  { locName: "Z-Edappal", locCode: "100" },
  { locName: "Z-Perinthalmanna", locCode: "133" },
  { locName: "Z-Kottakkal", locCode: "122" },
  { locName: "G-Kottayam", locCode: "701" },
  { locName: "G-Perumbavoor", locCode: "703" },
  { locName: "G-Thrissur", locCode: "704" },
  { locName: "G-Chavakkad", locCode: "706" },
  { locName: "G-Calicut", locCode: "712" },
  { locName: "G-Vadakara", locCode: "708" },
  { locName: "G-Edappal", locCode: "707" },
  { locName: "G-Perinthalmanna", locCode: "709" },
  { locName: "G-Kottakkal", locCode: "711" },
  { locName: "G-Manjeri", locCode: "710" },
  { locName: "G-Palakkad", locCode: "705" },
  { locName: "G-Kalpetta", locCode: "717" },
  { locName: "G-Kannur", locCode: "716" },
  { locName: "G-Mg Road", locCode: "718" },
  { locName: "Production", locCode: "101" },
  { locName: "WAREHOUSE", locCode: "103" },
  { locName: "Dappr Squad", locCode: "555" }
];

const RecordExpenses = () => {
  const isSidebarOpen = useSidebar();
  const navigate = useNavigate();

  const currentusers = JSON.parse(localStorage.getItem("rootfinuser")) || {};
  const isAdmin = (currentusers.power || "").toLowerCase() === "admin" || (currentusers.role || "").toLowerCase() === "admin";
  const isSuperAdmin = (currentusers.role || "").toLowerCase() === "superadmin";
  const isFinancialHead = (currentusers.role || "").toLowerCase() === "financial_head";
  const canSelectStore = isAdmin || isSuperAdmin || isFinancialHead;

  // Initial Date Filters (Start of current month to today)
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const formatDateStr = (d) => d.toISOString().split("T")[0];

  const [dateFrom, setDateFrom] = useState(formatDateStr(firstDay));
  const [dateTo, setDateTo] = useState(formatDateStr(today));

  // Secondary Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState("all");
  const [selectedExpenseType, setSelectedExpenseType] = useState("all");
  const [selectedPaymentType, setSelectedPaymentType] = useState("all");

  // Data States
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Store lookup helper
  const getBranchName = (locCode) => {
    const loc = fallbackLocations.find(l => String(l.locCode) === String(locCode));
    if (loc) return loc.locName;
    if (String(locCode) === "102") return "Brynex Office";
    if (String(locCode) === "759") return "HEAD OFFICE01";
    return locCode ? `Store #${locCode}` : "Head Office";
  };

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const targetLoc = canSelectStore ? selectedStore : (currentusers.locCode || "all");
      const url = `${baseUrl.baseUrl}user/Getpayment?LocCode=${targetLoc}&DateFrom=${dateFrom}&DateTo=${dateTo}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch expenses: ${res.statusText}`);
      }
      const json = await res.json();
      const list = json.data || json || [];
      
      // Filter out only Direct and Indirect Expense transactions (exclude standard expenses from Expenses.jsx)
      const expenseList = list.filter(item => {
        const isExpense = (item.type || "").toLowerCase() === "expense";
        if (!isExpense) return false;
        const isDirect = item.expenseType === "direct" || (item.remark || "").includes("[DIRECT");
        const isIndirect = item.expenseType === "indirect" || (item.remark || "").includes("[INDIRECT");
        return isDirect || isIndirect;
      });
      setTransactions(expenseList);
    } catch (err) {
      console.error("Error fetching expense data:", err);
      setError(err.message || "Failed to load expense records");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Filtered expenses based on client filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Must be direct or indirect expense
      const isDirect = tx.expenseType === "direct" || (tx.remark || "").includes("[DIRECT");
      const isIndirect = tx.expenseType === "indirect" || (tx.remark || "").includes("[INDIRECT");
      if (!isDirect && !isIndirect) return false;

      // Search filter (category or remarks)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const catMatch = (tx.category || "").toLowerCase().includes(term);
        const remarkMatch = (tx.remark || "").toLowerCase().includes(term);
        const branchMatch = getBranchName(tx.locCode).toLowerCase().includes(term);
        if (!catMatch && !remarkMatch && !branchMatch) return false;
      }

      // Store filter
      if (selectedStore !== "all") {
        if (String(tx.locCode) !== String(selectedStore)) return false;
      }

      // Expense Type filter (direct vs indirect)
      if (selectedExpenseType !== "all") {
        if (selectedExpenseType === "direct" && !isDirect) return false;
        if (selectedExpenseType === "indirect" && !isIndirect) return false;
      }

      // Payment Type filter
      if (selectedPaymentType !== "all") {
        const method = (tx.paymentMethod || "cash").toLowerCase();
        if (method !== selectedPaymentType.toLowerCase()) return false;
      }

      return true;
    });
  }, [transactions, searchTerm, selectedStore, selectedExpenseType, selectedPaymentType]);

  const getCleanCategory = (cat) => {
    if (!cat) return "-";
    return cat.replace(/^[a-z]/, (m) => m.toUpperCase());
  };

  const getCleanRemark = (remark) => {
    if (!remark) return "-";
    // Strip [DIRECT] or [INDIRECT] prefix if present for cleaner display
    const cleaned = remark.replace(/^\[(DIRECT|INDIRECT)[^\]]*\]\s*/i, "").trim();
    return cleaned || "-";
  };

  // CSV Export Configuration
  const csvHeaders = [
    { label: "Date", key: "date" },
    { label: "Expense Category", key: "category" },
    { label: "Branch", key: "branch" },
    { label: "Expense Type", key: "expenseType" },
    { label: "Payment Method", key: "paymentMethod" },
    { label: "Bank Account", key: "bankAccount" },
    { label: "Amount (₹)", key: "amount" },
    { label: "Remarks", key: "remarks" },
    { label: "Attachment", key: "attachment" },
  ];

  const csvData = useMemo(() => {
    return filteredTransactions.map((tx) => {
      const isDirect = tx.expenseType === "direct" || (tx.remark || "").includes("[DIRECT");
      const rawAmount = Math.abs(parseFloat(tx.amount || 0));
      const attachmentLink = tx.attachmentUrl || (tx._id ? `${baseUrl.baseUrl}user/transaction/${tx._id}/attachment` : (tx.attachment?.filename || "-"));
      return {
        date: tx.date ? tx.date.split("T")[0] : "-",
        category: getCleanCategory(tx.category),
        branch: getBranchName(tx.locCode),
        expenseType: isDirect ? "Direct" : "Indirect",
        paymentMethod: (tx.paymentMethod || "CASH").toUpperCase(),
        bankAccount: tx.bankAccount || "-",
        amount: rawAmount,
        remarks: getCleanRemark(tx.remark),
        attachment: attachmentLink,
      };
    });
  }, [filteredTransactions]);

  return (
    <div className={`min-h-screen bg-[#FAFAFB] transition-all duration-300 ${isSidebarOpen ? 'md:ml-64 ml-0' : 'ml-0'}`}>
      <div className="w-full px-6 sm:px-10 py-8">
        
        {/* Top Action Bar: Search Input, CSV Export & + New Expense Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => document.dispatchEvent(new CustomEvent('toggle-sidebar'))}
              className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-xs cursor-pointer"
              title="Toggle Sidebar Menu"
            >
              <Menu size={20} />
            </button>

            <AnimatedSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search category, branch, remarks..."
            />
          </div>

          <div className="flex items-center gap-3">
            <CSVLink
              data={csvData}
              headers={csvHeaders}
              filename={`direct_indirect_expenses_${dateFrom}_to_${dateTo}.csv`}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Download size={16} />
              <span>Download CSV</span>
            </CSVLink>

            <button
              type="button"
              onClick={() => navigate("/direct-expenses")}
              className="flex items-center justify-center gap-2 bg-[#18181B] hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus size={16} />
              <span>New Expense</span>
            </button>
          </div>
        </div>

        {/* Date Filters Row */}
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:border-purple-500 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:border-purple-500 shadow-xs"
            />
          </div>

          <button
            type="button"
            onClick={fetchExpenses}
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-[#9B48D7] hover:bg-[#8B38C7] text-white text-sm font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 h-[38px]"
          >
            {loading ? "Fetching..." : "Fetch Data"}
          </button>

          <CSVLink
            data={csvData}
            headers={csvHeaders}
            filename={`direct_indirect_expenses_${dateFrom}_to_${dateTo}.csv`}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium flex items-center gap-1.5 transition-all shadow-xs h-[38px] cursor-pointer"
          >
            <Download size={14} className="text-gray-500" />
            <span>CSV</span>
          </CSVLink>

          <button
            type="button"
            onClick={() => {}}
            className="px-4 py-2 rounded-xl bg-[#ECEEF2] hover:bg-gray-200 text-gray-700 text-sm font-medium flex items-center gap-1.5 transition-all shadow-xs h-[38px] cursor-pointer"
          >
            <span>Filters</span>
            <SlidersHorizontal size={14} />
          </button>
        </div>

        {/* Sub-Filters: Store, Expense Type, Payment Type, Refresh */}
        <div className="flex flex-wrap items-center justify-end gap-3 mb-6">
          {/* Store Filter */}
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-gray-500 mb-1">Store</span>
            <div className="relative">
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 pr-8 focus:outline-none focus:border-purple-500 shadow-xs cursor-pointer min-w-[140px]"
              >
                <option value="all">All Stores</option>
                {fallbackLocations.map(loc => (
                  <option key={loc.locCode} value={loc.locCode}>{loc.locName}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Expense Type Filter */}
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-gray-500 mb-1">Expense Type</span>
            <div className="relative">
              <select
                value={selectedExpenseType}
                onChange={(e) => setSelectedExpenseType(e.target.value)}
                className="appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 pr-8 focus:outline-none focus:border-purple-500 shadow-xs cursor-pointer min-w-[130px]"
              >
                <option value="all">All Types</option>
                <option value="direct">Direct</option>
                <option value="indirect">Indirect</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Payment Type Filter */}
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-gray-500 mb-1">Payment Type</span>
            <div className="relative">
              <select
                value={selectedPaymentType}
                onChange={(e) => setSelectedPaymentType(e.target.value)}
                className="appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 pr-8 focus:outline-none focus:border-purple-500 shadow-xs cursor-pointer min-w-[100px]"
              >
                <option value="all">All</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="upi">UPI</option>
                <option value="split">Split</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={fetchExpenses}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-xs transition-colors cursor-pointer mt-auto"
              title="Refresh Data"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Expense Transactions Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#333333] text-white text-[11px] font-semibold tracking-wider uppercase">
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Expense Category</th>
                  <th className="py-3.5 px-5">Branch</th>
                  <th className="py-3.5 px-5 text-center">Expense Type</th>
                  <th className="py-3.5 px-5">Attachment</th>
                  <th className="py-3.5 px-5">Payment Method</th>
                  <th className="py-3.5 px-5">Bank Account</th>
                  <th className="py-3.5 px-5">Amount</th>
                  <th className="py-3.5 px-5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-gray-400">
                      Loading expense records...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-gray-400">
                      No expense records found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx, idx) => {
                    const isDirect = tx.expenseType === "direct" || (tx.remark || "").includes("[DIRECT");
                    const rawAmount = Math.abs(parseFloat(tx.amount || 0));
                    const attachmentLink = tx.attachmentUrl || (tx._id ? `${baseUrl.baseUrl}user/transaction/${tx._id}/attachment` : null);

                    return (
                      <tr key={tx._id || idx} className="hover:bg-gray-50/80 transition-colors">
                        {/* Date */}
                        <td className="py-4 px-5 text-gray-500 text-xs whitespace-nowrap">
                          {tx.date ? tx.date.split("T")[0] : "-"}
                        </td>

                        {/* Category */}
                        <td className="py-4 px-5 font-medium text-gray-900">
                          {getCleanCategory(tx.category)}
                        </td>

                        {/* Branch */}
                        <td className="py-4 px-5 text-gray-600">
                          {getBranchName(tx.locCode)}
                        </td>

                        {/* Expense Type Badge */}
                        <td className="py-4 px-5 text-center">
                          {isDirect ? (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FFEDD5] text-[#EA580C]">
                              Direct
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#F3E8FF] text-[#9333EA]">
                              Indirect
                            </span>
                          )}
                        </td>

                        {/* Attachment */}
                        <td className="py-4 px-5">
                          {tx.hasAttachment || tx.attachment ? (
                            <a
                              href={attachmentLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-purple-600 hover:text-purple-800 font-medium text-sm hover:underline inline-flex items-center gap-1"
                            >
                              <span>img{String(idx + 123)}.png</span>
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        {/* Payment Method */}
                        <td className="py-4 px-5 font-medium text-gray-800 uppercase text-xs">
                          {tx.paymentMethod || "CASH"}
                        </td>

                        {/* Bank Account */}
                        <td className="py-4 px-5 text-xs text-gray-600 whitespace-nowrap">
                          {tx.bankAccount || <span className="text-gray-300">—</span>}
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-5 font-bold text-gray-900">
                          {rawAmount.toLocaleString()}
                        </td>

                        {/* Remarks */}
                        <td className="py-4 px-5 text-gray-500 text-xs max-w-xs truncate">
                          {getCleanRemark(tx.remark)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RecordExpenses;
