import { useState } from 'react';
import SingleImageUpload from "../components/SingleImageUpload";
import baseUrl from "../api/api";
import { BsBank2 } from "react-icons/bs";
import { MdCurrencyRupee } from "react-icons/md";
import { ChevronDown } from "lucide-react";
import { useSidebar } from "../hooks/useSidebar.js";

const baseIncomeCats = [
  { value: "compensation from cancellation", label: "Compensation from Cancellation" },
  { value: "compensation from product damage", label: "Compensation from Product Damage" },
  { value: "bank to cash",                   label: "Cash to Branch (Bank to Cash)" },
];

const fallbackLocations = [
  { "locName": "Z-Edapally1", "locCode": "144" },
  { "locName": "Warehouse", "locCode": "858" },
  { "locName": "G-Edappally", "locCode": "702" },
  { "locName": "HEAD OFFICE01", "locCode": "759" },
  { "locName": "SG-Trivandrum", "locCode": "700" },
  { "locName": "Z- Edappal", "locCode": "100" },
  { "locName": "Z.Perinthalmanna", "locCode": "133" },
  { "locName": "Z.Kottakkal", "locCode": "122" },
  { "locName": "G.Kottayam", "locCode": "701" },
  { "locName": "G.Perumbavoor", "locCode": "703" },
  { "locName": "G.Thrissur", "locCode": "704" },
  { "locName": "G.Chavakkad", "locCode": "706" },
  { "locName": "G.Calicut ", "locCode": "712" },
  { "locName": "G.Vadakara", "locCode": "708" },
  { "locName": "G.Edappal", "locCode": "707" },
  { "locName": "G.Perinthalmanna", "locCode": "709" },
  { "locName": "G.Kottakkal", "locCode": "711" },
  { "locName": "G.Manjeri", "locCode": "710" },
  { "locName": "G.Palakkad ", "locCode": "705" },
  { "locName": "G.Kalpetta", "locCode": "717" },
  { "locName": "G.Kannur", "locCode": "716" },
  { "locName": "G.Mg Road", "locCode": "718" },
  { "locName": "Production", "locCode": "101" },
  { "locName": "Office", "locCode": "102" },
  { "locName": "WAREHOUSE", "locCode": "103" }
];

const Income = () => {
  const isSidebarOpen = useSidebar();
  const currentusers = JSON.parse(localStorage.getItem("rootfinuser")) || {};
  const isAdmin = (currentusers.power || "").toLowerCase() === "admin" || (currentusers.role || "").toLowerCase() === "admin";
  const isSuperAdmin = (currentusers.role || "").toLowerCase() === "superadmin";
  const isFinancialHead = (currentusers.role || "").toLowerCase() === "financial_head";
  const canSelectStore = isAdmin || isSuperAdmin || isFinancialHead;

  const defaultStore = currentusers.locCode || "759";
  const [selectedStore, setSelectedStore] = useState(defaultStore);

  const activeLocCode = canSelectStore ? selectedStore : currentusers.locCode;
  const activeLocObj = fallbackLocations.find(l => String(l.locCode) === String(activeLocCode));
  const activeLocName = (activeLocObj?.locName || currentusers.locName || "").toLowerCase();
  const isOfficeOrWarehouse =
    ["102", "103", "858"].includes(String(activeLocCode)) ||
    activeLocName.includes("office") ||
    activeLocName.includes("warehouse");

  let baseCats = (isAdmin || isSuperAdmin || isFinancialHead)
    ? [...baseIncomeCats]
    : baseIncomeCats.filter(c => c.value !== "bank to cash");

  if (isOfficeOrWarehouse) {
    baseCats.push({ value: "petty cash received", label: "Petty Cash Received" });
  }

  const cats = baseCats;

  const [selectedCategory, setSelectedCategory] = useState(cats[0]);
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("");
  const [remark, setRemark] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [splitPayment, setSplitPayment] = useState(false);
  const [cashAmount, setCashAmount] = useState("");
  const [bankAmount, setBankAmount] = useState("");
  const [upiAmount, setUpiAmount] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (splitPayment) {
      const total = parseFloat(cashAmount || 0) + parseFloat(bankAmount || 0) + parseFloat(upiAmount || 0);
      if (total !== parseFloat(amount || 0)) {
        alert("Sum of cash, bank, and UPI must equal the total amount.");
        setIsSubmitting(false); return;
      }
    }
    if (!amount || parseFloat(amount) <= 0) { alert("Please enter a valid amount."); setIsSubmitting(false); return; }
    if (!remark.trim()) { alert("Please enter a remark."); setIsSubmitting(false); return; }

    const data = {
      type: "income",
      category: selectedCategory.value,
      remark,
      locCode: canSelectStore ? selectedStore : currentusers.locCode,
      isAdminLevel: canSelectStore,
      amount,
      cash: splitPayment ? (cashAmount || "0") : paymentMethod === "cash" ? amount : "0",
      bank: splitPayment ? (bankAmount || "0") : paymentMethod === "bank" ? amount : "0",
      upi:  splitPayment ? (upiAmount  || "0") : paymentMethod === "upi"  ? amount : "0",
      paymentMethod: splitPayment ? "split" : paymentMethod,
      quantity: selectedCategory.value === "shoe sales" ? quantity : "",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }).toLowerCase(),
      attachment: attachmentFile?.base64 || null,
    };

    try {
      const res = await fetch(`${baseUrl.baseUrl}user/createPayment`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) alert("Error: " + (json?.message || "Unknown error"));
      else {
        alert("Income recorded successfully!");
        setAmount(""); setCashAmount(""); setBankAmount(""); setUpiAmount("");
        setRemark(""); setQuantity(""); setAttachmentFile(null);
      }
    } catch { alert("Failed to create transaction."); }
    finally { setIsSubmitting(false); }
  };

  const handleCancel = () => {
    setAmount(""); setRemark(""); setAttachmentFile(null);
    setQuantity(""); setCashAmount(""); setBankAmount(""); setUpiAmount("");
    setPaymentMethod("cash"); setSplitPayment(false);
    setSelectedCategory(cats[0]);
  };

  return (
    <div className={`min-h-screen bg-[#f0f4ff] transition-all duration-300 ${isSidebarOpen ? 'md:ml-64 ml-0' : 'ml-0'}`}>
      <div className="px-4 md:px-10 pt-8 pb-16">
        {/* Page title */}
        <div className="mb-6 flex items-start md:items-center gap-3">
          <button 
              onClick={() => document.dispatchEvent(new CustomEvent('toggle-sidebar'))}
              className="lg:hidden mt-1 p-2 rounded-lg bg-white shadow-sm border border-[#e6ebfa] text-gray-700 shrink-0"
          >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#101828] tracking-wide uppercase">Income</h1>
            <p className="text-sm text-[#6c728a]">Record & Track your business transactions</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-sm border border-[#e6ebfa] p-8">
          <form onSubmit={handleSubmit}>

            {/* Store selection for Admin / SuperAdmin / Financial Head */}
            {canSelectStore && (
              <div className="mb-6">
                <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-2">Store / Branch</label>
                <div className="relative">
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] pr-10"
                  >
                    {fallbackLocations.map(loc => (
                      <option key={loc.locCode} value={loc.locCode}>
                        {loc.locName} ({loc.locCode})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            )}

            {/* Row 1: Category + Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-2">Category</label>
                <div className="relative">
                  <select
                    value={selectedCategory?.value || cats[0]?.value}
                    onChange={e => {
                      const cat = cats.find(c => c.value === e.target.value);
                      setSelectedCategory(cat || cats[0]);
                      if (cat?.value === "bank to cash") {
                        setPaymentMethod("cash");
                        setSplitPayment(false);
                      }
                    }}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] pr-10"
                  >
                    {cats.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[15px]">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-3 text-[15px] text-gray-900 focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]"
                  />
                </div>
              </div>
              {selectedCategory.value === "shoe sales" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#9ca3af] mb-2">Quantity</label>
                  <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
                    placeholder="Enter quantity" required
                    className="w-full rounded-xl border border-[#d9def1] px-5 py-4 text-base focus:outline-none focus:border-[#1e3a8a]" />
                </div>
              )}
            </div>

            <hr className="border-[#e6ebfa] my-6" />

            {/* Way of Payment */}
            <div className="mb-8">
              <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-3">Way of Payment</label>
              <div className="flex flex-wrap items-center gap-4">
                {[
                  { id: "cash", label: "Cash", icon: <MdCurrencyRupee size={18} /> },
                  ...(selectedCategory.value !== "bank to cash" ? [
                    { id: "bank", label: "Bank", icon: <BsBank2 size={16} /> },
                    { id: "upi",  label: "UPI",  icon: <span className="font-bold italic text-sm">UPI</span> },
                  ] : []),
                ].map(({ id, label, icon }) => {
                  const active = !splitPayment && paymentMethod === id;
                  return (
                    <label key={id} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${active ? 'border-[#a855f7] bg-[#faf5ff] text-[#9333ea]' : 'border-gray-200 bg-white text-gray-600'} cursor-pointer select-none transition-colors`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={id}
                        checked={active}
                        onChange={() => { setPaymentMethod(id); setSplitPayment(false); }}
                        className="w-4 h-4 accent-[#a855f7]"
                      />
                      <span className="flex items-center gap-1.5 text-[14px] font-medium">
                        {icon} {label}
                      </span>
                    </label>
                  );
                })}
                {selectedCategory.value !== "bank to cash" && (
                  <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${splitPayment ? 'border-[#a855f7] bg-[#faf5ff] text-[#9333ea]' : 'border-gray-200 bg-white text-gray-600'} cursor-pointer select-none transition-colors`}>
                    <input type="checkbox" checked={splitPayment} onChange={() => setSplitPayment(!splitPayment)}
                      className="w-4 h-4 accent-[#a855f7]" />
                    <span className="text-[14px] font-medium">Split Payment (Cash + Bank + UPI)</span>
                  </label>
                )}
              </div>

              {splitPayment && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {[["Cash", cashAmount, setCashAmount], ["Bank", bankAmount, setBankAmount], ["UPI", upiAmount, setUpiAmount]].map(([lbl, val, setVal]) => (
                    <div key={lbl}>
                      <label className="block text-xs text-[#6b7280] mb-1">{lbl} Amount</label>
                      <input type="number" value={val} onChange={e => setVal(e.target.value)} placeholder="0.00"
                        className="w-full rounded-xl border border-[#d9def1] px-4 py-3 text-sm focus:outline-none focus:border-[#1e3a8a]" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Remarks + Attachment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-2">Remarks</label>
                <textarea
                  rows={5}
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  required
                  placeholder="Enter your transaction details here..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-2">Attachment (Optional)</label>
                <SingleImageUpload onImageSelect={setAttachmentFile} existingImage={attachmentFile} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end items-center gap-4 pt-4">
              <button type="button" onClick={handleCancel}
                className="px-8 py-3 rounded-xl border border-gray-200 text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-[#a855f7] text-white text-[14px] font-medium hover:bg-purple-600 transition-colors disabled:opacity-50">
                {isSubmitting ? "Submitting..." : "Submit Income"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Income;
