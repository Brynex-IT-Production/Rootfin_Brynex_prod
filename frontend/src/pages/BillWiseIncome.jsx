import { CSVLink } from "react-csv";
import Headers from '../components/Header.jsx';
import { customAlert } from '../utils/customAlert.jsx';
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { customConfirm } from '../utils/customConfirm';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import Select, { components } from "react-select";
import useFetch from '../hooks/useFetch.jsx';
import baseUrl from '../api/api.js';
import { Minus, Plus } from "lucide-react";
import { useEnterToSave } from "../hooks/useEnterToSave";
import LoadingScreen from "../components/LoadingScreen.jsx";
import { useReactToPrint } from "react-to-print";

const CheckboxOption = (props) => {
    return (
        <components.Option {...props}>
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={props.isSelected}
                    onChange={() => null}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-0 pointer-events-none accent-blue-600"
                />
                <span>{props.label}</span>
            </div>
        </components.Option>
    );
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

const categories = [
    { value: "all", label: "All Categories" },
    { value: "booking", label: "Booking" },
    { value: "RentOut", label: "Rent Out" },
    { value: "Refund", label: "Refund" },
    { value: "Return", label: "Return" },
    { value: "Cancel", label: "Cancel" },
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" },
    { value: "money transfer", label: "Cash to Bank" },
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
    "other expenses": "Refund",
    "bulk amount transfer": "Cash to Bank",
    "write off": "Write Off",
    "promotion_services": "Promotion / Services",
    "shoe sales return": "Shoe Sales Return",
    "shirt sales return": "Shirt Sales Return",
};
const getCatLabel = (val) => CATEGORY_LABEL_MAP[(val || "").toLowerCase().trim()] || val;

const denominations = [
    { label: "500", value: 500 },
    { label: "200", value: 200 },
    { label: "100", value: 100 },
    { label: "50", value: 50 },
    { label: "20", value: 20 },
    { label: "10", value: 10 },
    { label: "Coins", value: 1 },
];

const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: '#ffffff',
        borderColor: state.isFocused ? '#18181b' : '#e2e8f0',
        borderRadius: '0px',
        padding: '1px 2px',
        minHeight: '38px',
        boxShadow: state.isFocused ? '0 0 0 1px #18181b' : 'none',
        '&:hover': {
            borderColor: '#cbd5e1',
        },
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#1e293b',
        cursor: 'pointer',
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#e2e8f0' : state.isFocused ? '#f1f5f9' : '#ffffff',
        color: '#334155',
        fontSize: '0.875rem',
        cursor: 'pointer',
    }),
    menu: (provided) => ({
        ...provided,
        borderRadius: '0px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: 50,
        overflow: 'hidden',
    }),
};

const DayBookInc = () => {
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

    const [preOpen, setPreOpen] = useState(null);
    const [preOpen1, setPreOpen1] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Edit functionality states
    const [isSaved, setIsSaved] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedTransaction, setEditedTransaction] = useState({});
    const [isSyncing, setIsSyncing] = useState(false);

    // Store for edited transactions to override TWS data
    const [editedTransactionsMap, setEditedTransactionsMap] = useState({});

    // Filter states (multi-select)
    const [selectedCategory, setSelectedCategory] = useState([categories[0]]);
    const [selectedSubCategory, setSelectedSubCategory] = useState([subCategories[0]]);

    const [quantities, setQuantities] = useState(() => {
        const saved = localStorage.getItem(`denominations_${new Date().toISOString().split("T")[0]}_${JSON.parse(localStorage.getItem("rootfinuser"))?.locCode}`);
        return saved ? JSON.parse(saved) : Array(denominations.length).fill("");
    });

    const currentusers = JSON.parse(localStorage.getItem("rootfinuser"));
    const showAction = (currentusers?.power || "").toLowerCase() === "admin";

    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split("T")[0]);
    const isToday = currentDate === new Date().toISOString().split("T")[0];

    const [isDayBookFrozen, setIsDayBookFrozen] = useState(false);
    const [freezeReason, setFreezeReason] = useState(null);
    const [adminWarningBanner, setAdminWarningBanner] = useState(null);

    const [year, month, day] = currentDate.split("-").map(Number);
    const date1 = new Date(year, month - 1, day);
    const previousDate = new Date(year, month - 1, day);
    previousDate.setDate(date1.getDate() - 1);
    const TodayDate = `${String(date1.getDate()).padStart(2, '0')}-${String(date1.getMonth() + 1).padStart(2, '0')}-${date1.getFullYear()}`;
    const previousDate1 = `${String(previousDate.getDate()).padStart(2, '0')}-${String(previousDate.getMonth() + 1).padStart(2, '0')}-${previousDate.getFullYear()}`;
    const date = TodayDate;

    const formatDate = (inputDate) => {
        const [day, month, year] = inputDate.split("-");
        return `${year}-${month}-${day}`;
    };

    const formattedDate = formatDate(previousDate1);

    const displayFormattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(date1);

    const apiUrl = `https://rentalapi.rootments.live/api/GetBooking/GetBookingList?LocCode=${currentusers?.locCode}&DateFrom=${currentDate}&DateTo=${currentDate}`;
    const apiurl1 = `https://rentalapi.rootments.live/api/GetBooking/GetRentoutList?LocCode=${currentusers?.locCode}&DateFrom=${currentDate}&DateTo=${currentDate}`;
    const apiUrl2 = `https://rentalapi.rootments.live/api/GetBooking/GetReturnList?LocCode=${currentusers?.locCode}&DateFrom=${currentDate}&DateTo=${currentDate}`;
    const apiUrl3 = `https://rentalapi.rootments.live/api/GetBooking/GetDeleteList?LocCode=${currentusers?.locCode}&DateFrom=${currentDate}&DateTo=${currentDate}`;
    const apiUrl4_fallback = `${baseUrl.baseUrl}user/Getpayment?LocCode=${currentusers?.locCode}&DateFrom=${currentDate}&DateTo=${currentDate}`;
    const apiUrl5 = `${baseUrl.baseUrl}user/saveCashBank`;
    const apiUrl6 = `${baseUrl.baseUrl}user/getsaveCashBank?locCode=${currentusers?.locCode}&date=${formattedDate}`;
    const apiUrl7 = `${baseUrl.baseUrl}user/getsaveCashBank?locCode=${currentusers?.locCode}&date=${currentDate}`;

    const locCode = currentusers?.locCode;
    const email = currentusers?.email;

    const printRef = useRef(null);
    const csvLinkRef = useRef(null);

    const handlePrint = () => {
        window.print();
    };

    const fetchOptions = useMemo(() => ({ useCache: false }), []);

    const { data, loading: l1 } = useFetch(apiUrl, fetchOptions);
    const { data: data1, loading: l2 } = useFetch(apiurl1, fetchOptions);
    const { data: data2, loading: l3 } = useFetch(apiUrl2, fetchOptions);
    const { data: data3, loading: l4 } = useFetch(apiUrl3, fetchOptions);

    const { data: mongoResponse, loading: isMongoLoading } = useFetch(apiUrl4_fallback, fetchOptions);
    const dayBookData = mongoResponse?.data || [];

    const isDataLoading = l1 || l2 || l3 || l4 || isMongoLoading || isInitialLoading;
    const isDataReady = true;

    // To prevent users from clicking save too early while the page is stabilizing
    const [isSaveEnabled, setIsSaveEnabled] = useState(false);
    useEffect(() => {
        if (!isDataLoading) {
            const timer = setTimeout(() => {
                setIsSaveEnabled(true);
            }, 2500); // 2.5 seconds delay after load
            return () => clearTimeout(timer);
        } else {
            setIsSaveEnabled(false);
        }
    }, [isDataLoading]);

    const allowedMongoCategories = useMemo(() => [
        "petty expenses",
        "staff reimbursement",
        "maintenance expenses",
        "telephone internet",
        "utility bill",
        "salary",
        "rent",
        "courier charges",
        "asset purchase",
        "promotion_services",
        "spot incentive",
        "bulk amount transfer",
        "other expenses",
        "shoe sales return",
        "shirt sales return",
        "cash to bank",
        "bank to cash",
        "compensation",
        "shoe sales",
        "shirt sales",
        "write off",
        "booking",
        "receivable",
        "sales",
        "income",
        "expense",
        "money transfer",
        "return",
        "refund",
        "cancel",
        "rentout",
        "rent out",
        "dry cleaning",
        "altration",
        "material",
        "travel exp",
        "fuel exp",
        "waste management",
        "water charges",
        "printing stationary",
        "staff welfare",
        "staff accommodation",
        "incentive",
        "advance",
        "balance payable",
        "compensation from cancellation",
        "compensation from product damage",
        "petty cash received",
    ], []);

    const processedTransactions = useMemo(() => {
        if (!isDataReady) return { booking: [], rentOut: [], return: [], cancel: [], mongo: [] };

        const bookingTransactions = (data?.dataSet?.data || []).map(transaction => {
            const bookingCashAmount = parseInt(transaction?.bookingCashAmount || 0, 10);
            const bookingBankAmount = parseInt(transaction?.bookingBankAmount || 0, 10);
            const bookingUPIAmount = parseInt(transaction?.bookingUPIAmount || 0, 10);
            const rblAmount = parseInt(transaction?.rblRazorPay || 0, 10);
            const invoiceAmount = parseInt(transaction?.invoiceAmount || 0, 10);
            const discountAmount = parseInt(transaction?.discountAmount || 0, 10);

            const totalAmount = bookingCashAmount + bookingBankAmount + bookingUPIAmount + rblAmount;

            return {
                ...transaction,
                date: transaction?.bookingDate || null,
                time: transaction?.time || transaction?.bookingTime || (transaction?.createdAt ? new Date(transaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (transaction?.bookingDate && transaction.bookingDate.includes("T") ? new Date(transaction.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "10:34 am")),
                customerName: transaction?.customerName || transaction?.customer || "Customer",
                bookingCashAmount,
                bookingBankAmount,
                billValue: invoiceAmount + discountAmount,
                discountAmount: discountAmount,
                invoiceAmount,
                bookingBank1: bookingBankAmount,
                TotaltransactionBooking: totalAmount,
                Category: "Booking",
                SubCategory: "Advance",
                totalTransaction: totalAmount,
                cash: bookingCashAmount,
                rbl: rblAmount,
                bank: bookingBankAmount,
                upi: bookingUPIAmount,
                amount: totalAmount,
                remarks: transaction?.remarks || transaction?.remark || "-"
            };
        });

        const rentOutTransactions = (data1?.dataSet?.data || []).map(transaction => {
            const rentoutCashAmount = parseInt(transaction?.rentoutCashAmount ?? 0, 10);
            const rentoutBankAmount = parseInt(transaction?.rentoutBankAmount ?? 0, 10);
            const invoiceAmount = parseInt(transaction?.invoiceAmount ?? 0, 10);
            const advanceAmount = parseInt(transaction?.advanceAmount ?? 0, 10);
            const rentoutUPIAmount = parseInt(transaction?.rentoutUPIAmount ?? 0, 10);
            const rblAmount = parseInt(transaction?.rblRazorPay ?? 0, 10);
            const securityAmount = parseInt(transaction?.securityAmount ?? 0, 10);
            const discountAmount = parseInt(transaction?.discountAmount || 0, 10);

            const totalAmount = rentoutCashAmount + rentoutBankAmount + rentoutUPIAmount + rblAmount;

            return {
                ...transaction,
                date: transaction?.rentOutDate ?? "",
                time: transaction?.time || transaction?.rentOutTime || (transaction?.createdAt ? new Date(transaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (transaction?.rentOutDate && transaction.rentOutDate.includes("T") ? new Date(transaction.rentOutDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "10:34 am")),
                customerName: transaction?.customerName || transaction?.customer || "Customer",
                rentoutCashAmount,
                rentoutBankAmount,
                invoiceAmount,
                discountAmount: discountAmount,
                billValue: invoiceAmount + discountAmount,
                securityAmount,
                advanceAmount,
                Balance: invoiceAmount - advanceAmount,
                rentoutUPIAmount,
                Category: "RentOut",
                SubCategory: "Security",
                SubCategory1: "Balance Payable",
                totalTransaction: totalAmount,
                cash: rentoutCashAmount,
                rbl: rblAmount,
                bank: rentoutBankAmount,
                upi: rentoutUPIAmount,
                amount: totalAmount,
                remarks: transaction?.remarks || transaction?.remark || "-"
            };
        });

        const returnOutTransactions = (data2?.dataSet?.data || []).map(transaction => {
            const returnCashAmount = -(parseInt(transaction?.returnCashAmount || 0, 10));
            const returnRblAmount = -(parseInt(transaction?.rblRazorPay || 0, 10));
            const returnBankAmount = returnRblAmount !== 0 ? 0 : -(parseInt(transaction?.returnBankAmount || 0, 10));
            const returnUPIAmount = returnRblAmount !== 0 ? 0 : -(parseInt(transaction?.returnUPIAmount || 0, 10));
            const invoiceAmount = parseInt(transaction?.invoiceAmount || 0, 10);
            const advanceAmount = parseInt(transaction?.advanceAmount || 0, 10);
            const RsecurityAmount = -(parseInt(transaction?.securityAmount || 0, 10));
            const discountAmount = parseInt(transaction?.discountAmount || 0, 10);

            const totalAmount = returnCashAmount + returnRblAmount + returnBankAmount + returnUPIAmount;

            return {
                ...transaction,
                date: transaction?.returnedDate || null,
                time: transaction?.time || transaction?.returnedTime || (transaction?.createdAt ? new Date(transaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (transaction?.returnedDate && transaction.returnedDate.includes("T") ? new Date(transaction.returnedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "10:34 am")),
                customerName: transaction?.customerName || transaction?.customer || "Customer",
                returnBankAmount,
                returnCashAmount,
                returnUPIAmount,
                invoiceAmount,
                advanceAmount,
                discountAmount: discountAmount,
                billValue: invoiceAmount + discountAmount,
                amount: totalAmount,
                totalTransaction: totalAmount,
                RsecurityAmount,
                Category: "Return",
                SubCategory: "Security Refund",
                cash: returnCashAmount,
                rbl: returnRblAmount,
                bank: returnBankAmount,
                upi: returnUPIAmount,
                remarks: transaction?.remarks || transaction?.remark || "-"
            };
        });

        const canCelTransactions = (data3?.dataSet?.data || []).map(transaction => {
            const deleteCashAmount = -Math.abs(parseInt(transaction.deleteCashAmount || 0));
            const deleteRblAmount = -Math.abs(parseInt(transaction.rblRazorPay || 0));
            const originalRblAmount = parseInt(transaction.rblRazorPay || 0);
            const deleteBankAmount = originalRblAmount !== 0 ? 0 : -Math.abs(parseInt(transaction.deleteBankAmount || 0));
            const deleteUPIAmount = originalRblAmount !== 0 ? 0 : -Math.abs(parseInt(transaction.deleteUPIAmount || 0));
            const discountAmount = parseInt(transaction.discountAmount || 0, 10);
            const invoiceAmount = parseInt(transaction.invoiceAmount || 0, 10);

            const totalAmount = deleteCashAmount + deleteRblAmount + deleteBankAmount + deleteUPIAmount;

            return {
                ...transaction,
                date: transaction.cancelDate,
                time: transaction?.time || transaction?.cancelTime || (transaction?.createdAt ? new Date(transaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (transaction?.cancelDate && transaction.cancelDate.includes("T") ? new Date(transaction.cancelDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "10:34 am")),
                customerName: transaction?.customerName || transaction?.customer || "Customer",
                Category: "Cancel",
                SubCategory: "cancellation Refund",
                discountAmount: discountAmount,
                billValue: invoiceAmount + discountAmount,
                amount: totalAmount,
                totalTransaction: totalAmount,
                cash: deleteCashAmount,
                rbl: deleteRblAmount,
                bank: deleteBankAmount,
                upi: deleteUPIAmount,
                remarks: transaction?.remarks || transaction?.remark || "-"
            };
        });

        const expenseCategoryValues = new Set([
            "petty expenses", "staff reimbursement", "maintenance expenses", "telephone internet",
            "utility bill", "salary", "rent", "courier charges", "asset purchase", "promotion_services",
            "spot incentive", "bulk amount transfer", "other expenses", "shoe sales return",
            "shirt sales return", "dry cleaning", "altration", "material", "travel exp", "fuel exp",
            "waste management", "water charges", "printing stationary", "staff welfare",
            "staff accommodation", "incentive", "write off", "compensation",
        ]);
        const incomeCategoryValues = new Set([
            "shoe sales", "shirt sales", "mixed sales", "compensation", "advance", "balance payable",
            "compensation from cancellation", "compensation from product damage", "petty cash received",
        ]);
        const inferType = (tx) => {
            const t = (tx.type || "").toLowerCase();
            if (t) return tx.type;
            const c = (tx.category || tx.Category || "").toLowerCase();
            if (expenseCategoryValues.has(c)) return "expense";
            if (incomeCategoryValues.has(c)) return "income";
            return tx.Category || tx.category || "";
        };

        const userCanSeeAdminExpenses = (currentusers?.power || "").toLowerCase() === "admin" || (currentusers?.role || "").toLowerCase() === "superadmin";

        const mongoTransactions = (dayBookData || []).filter(transaction => {
            const cat = (transaction.category || transaction.Category || "").toLowerCase();
            if (transaction.isAdminLevel) return false;
            return allowedMongoCategories.includes(cat);
        }).map(transaction => {
            const isReturn = (transaction.type || "").toLowerCase() === "return";
            const isExpense = (transaction.type || "").toLowerCase() === "expense" || inferType(transaction) === "expense";
            const rawSubCat = isExpense
                ? (transaction.category || transaction.subCategory || "")
                : (transaction.subCategory || transaction.SubCategory || transaction.category || "");
            const subCatLabel = isReturn && rawSubCat && !rawSubCat.toLowerCase().endsWith("return")
                ? `${rawSubCat} Return`
                : rawSubCat;
            const cash = transaction.cash !== undefined ? transaction.cash : transaction.cash1;
            const bank = transaction.bank !== undefined ? transaction.bank : transaction.bank1;
            const upi = transaction.upi !== undefined ? transaction.upi : transaction.Tupi;
            const rbl = transaction.rbl || transaction.rblRazorPay || 0;
            const total = (parseInt(cash || 0, 10) + parseInt(bank || 0, 10) + parseInt(upi || 0, 10) + parseInt(rbl || 0, 10));
            return {
                ...transaction,
                locCode: currentusers?.locCode,
                date: transaction.date ? transaction.date.split("T")[0] : transaction.date,
                time: transaction.time || (transaction.createdAt ? new Date(transaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : (transaction.date && transaction.date.includes("T") ? new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : "10:34 am")),
                Category: inferType(transaction),
                SubCategory: subCatLabel,
                invoiceNo: transaction.invoiceNo || transaction.invoiceNumber || transaction.invoiceId || transaction.locCode,
                customerName: transaction.customerName || transaction.customer || transaction.custName || "-",
                cash1: transaction.cash,
                bank1: transaction.bank,
                discountAmount: parseInt(transaction.discountAmount || 0, 10),
                billValue: Number(transaction.billValue || transaction.subTotal || (Number(transaction.invoiceAmount || Math.abs(Number(transaction.amount) || 0)) + parseInt(transaction.discountAmount || 0, 10))),
                Tupi: transaction.upi,
                rbl: rbl,
                cash: cash,
                bank: bank,
                upi: upi,
                amount: transaction.amount !== undefined ? transaction.amount : total,
                totalTransaction: transaction.totalTransaction !== undefined ? transaction.totalTransaction : total,
                remark: (() => { const r = transaction.remark || transaction.remarks || ""; return (r === "Thanks for your business." || r === "Thanks for your business") ? "" : r; })(),
                remarks: (() => { const r = transaction.remark || transaction.remarks || ""; return (r === "Thanks for your business." || r === "Thanks for your business") ? "-" : (r || "-"); })()
            };
        });

        return {
            booking: bookingTransactions,
            rentOut: rentOutTransactions,
            return: returnOutTransactions,
            cancel: canCelTransactions,
            mongo: mongoTransactions
        };
    }, [data, data1, data2, data3, dayBookData, isDataReady, currentusers?.locCode, allowedMongoCategories]);

    const allTransactions = useMemo(() => {
        const combined = [
            ...processedTransactions.booking,
            ...processedTransactions.rentOut,
            ...processedTransactions.return,
            ...processedTransactions.cancel,
            ...processedTransactions.mongo,
        ];

        return combined.map(t => {
            const invoicePart = String(t.invoiceNo || t.locCode || "").trim();
            const categoryPart = (t.Category || t.type || "").toLowerCase();
            const key = `${invoicePart}-${categoryPart}`;
            const override = editedTransactionsMap[key];

            if (override) {
                const isBooking = (t.Category || '').toLowerCase() === 'booking';
                const isReturn = (t.Category || '').toLowerCase() === 'return';
                const isCancel = (t.Category || '').toLowerCase() === 'cancel';
                const editedTotal = Number(override.amount || override.totalTransaction || 0);

                return {
                    ...t,
                    _id: override._id || t._id,
                    cash: override.cash !== undefined ? override.cash : t.cash,
                    rbl: override.rbl !== undefined ? override.rbl : t.rbl,
                    bank: override.bank !== undefined ? override.bank : t.bank,
                    upi: override.upi !== undefined ? override.upi : t.upi,
                    securityAmount: override.securityAmount !== undefined ? override.securityAmount : t.securityAmount,
                    Balance: override.Balance !== undefined ? override.Balance : t.Balance,
                    billValue: override.billValue !== undefined ? override.billValue : t.billValue,
                    bookingCashAmount: isBooking ? override.cash : t.bookingCashAmount,
                    bookingBankAmount: isBooking ? override.bank : t.bookingBankAmount,
                    bookingBank1: isBooking ? override.bank : t.bookingBank1,
                    bookingUPIAmount: isBooking ? override.upi : t.bookingUPIAmount,
                    TotaltransactionBooking: isBooking ? editedTotal : t.TotaltransactionBooking,
                    returnCashAmount: isReturn ? override.cash : t.returnCashAmount,
                    returnBankAmount: isReturn ? override.bank : t.returnBankAmount,
                    returnUPIAmount: isReturn ? override.upi : t.returnUPIAmount,
                    returnRblAmount: isReturn ? override.rbl : t.returnRblAmount,
                    deleteCashAmount: isCancel ? -Math.abs(override.cash) : t.deleteCashAmount,
                    deleteBankAmount: isCancel ? -Math.abs(override.bank) : t.deleteBankAmount,
                    deleteUPIAmount: isCancel ? -Math.abs(override.upi) : t.deleteUPIAmount,
                    amount: override.amount || editedTotal,
                    totalTransaction: override.totalTransaction || editedTotal,
                };
            }
            return t;
        });
    }, [processedTransactions, editedTransactionsMap]);

    const dedupedTransactions = useMemo(() => {
        return Array.from(
            new Map(
                allTransactions.map((tx, index) => {
                    const dateKey = tx.date ? new Date(tx.date).toISOString().split("T")[0] : "";
                    const invoiceKey = tx.invoiceNo || tx._id || tx.locCode || "";
                    const categoryKey = tx.Category || tx.category || "";
                    const key = tx._id ? tx._id : `${invoiceKey}-${dateKey}-${categoryKey}-${index}`;
                    return [key, tx];
                })
            ).values()
        );
    }, [allTransactions]);

    const filteredTransactions = useMemo(() => {
        const catValues = Array.isArray(selectedCategory)
            ? selectedCategory.map(c => c?.value?.toLowerCase()).filter(Boolean)
            : (selectedCategory?.value ? [selectedCategory.value.toLowerCase()] : []);
        const isAllCategories = catValues.length === 0 || catValues.includes("all");

        const subCatValues = Array.isArray(selectedSubCategory)
            ? selectedSubCategory.map(sc => sc?.value?.toLowerCase()).filter(Boolean)
            : (selectedSubCategory?.value ? [selectedSubCategory.value.toLowerCase()] : []);
        const isAllSubCategories = subCatValues.length === 0 || subCatValues.includes("all");

        return dedupedTransactions.filter((t) => {
            const cat = (t.category || t.Category || t.type || "").toLowerCase();
            const subCat = (t.subCategory || t.SubCategory || t.type || "").toLowerCase();
            const subCat1 = (t.subCategory1 || t.SubCategory1 || "").toLowerCase();

            const matchesCategory = isAllCategories || catValues.includes(cat);
            const matchesSubCategory = isAllSubCategories ||
                subCatValues.includes(subCat) ||
                subCatValues.includes(subCat1) ||
                subCatValues.includes(cat);

            return matchesCategory && matchesSubCategory;
        });
    }, [dedupedTransactions, selectedCategory, selectedSubCategory]);

    const openingCash = parseInt(preOpen?.cash ?? preOpen?.Closecash ?? 0, 10);

    const calculatedTotals = useMemo(() => {
        const bankAmount = filteredTransactions?.reduce((sum, item) =>
            sum +
            (parseInt(item.bookingBankAmount, 10) || 0) +
            (parseInt(item.rentoutBankAmount, 10) || 0) +
            (parseInt(item.rentoutUPIAmount, 10) || 0) +
            (parseInt(item.bookingUPIAmount, 10) || 0) +
            (parseInt(item.deleteBankAmount, 10) || 0) * -1 +
            (parseInt(item.deleteUPIAmount, 10) || 0) * -1 +
            (parseInt(item.returnBankAmount, 10) || 0),
            0
        ) || 0;

        const bankAmount1 = filteredTransactions?.reduce((sum, item) =>
            sum + (parseInt(item.bank, 10) || 0),
            0
        ) || 0;

        const bankAmountupi = filteredTransactions?.reduce((sum, item) =>
            sum + (parseInt(item.upi, 10) || 0),
            0
        ) || 0;

        const rblAmount = filteredTransactions?.reduce((sum, item) =>
            sum + (parseInt(item.rbl, 10) || 0),
            0
        ) || 0;

        const dayCashTransactions = filteredTransactions?.reduce((sum, item) =>
            sum + (parseInt(item.cash, 10) || 0),
            0
        ) || 0;

        const totalCash = dayCashTransactions + openingCash;

        return {
            totalBankAmount: bankAmount,
            totalBankAmount1: bankAmount1,
            totalBankAmountupi: bankAmountupi,
            totalRblAmount: rblAmount,
            dayCashTransactions,
            totalCash
        };
    }, [filteredTransactions, openingCash]);

    const totalCalculatedAmount = useMemo(() => {
        return filteredTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    }, [filteredTransactions]);

    const totalCalculatedTxn = useMemo(() => {
        return filteredTransactions.reduce((sum, tx) => sum + (Number(tx.totalTransaction) || 0), 0);
    }, [filteredTransactions]);

    const totalCalculatedDiscount = useMemo(() => {
        return filteredTransactions.reduce((sum, tx) => sum + (Number(tx.discountAmount) || 0), 0);
    }, [filteredTransactions]);

    const handleQuantityChange = useCallback((index, value) => {
        if (preOpen1 != null) return;
        setQuantities(prev => {
            const next = [...prev];
            next[index] = value === "" ? "" : Math.max(0, parseInt(value, 10) || 0);
            return next;
        });
    }, [preOpen1]);

    const incrementQuantity = useCallback((index) => {
        if (preOpen1 != null) return;
        setQuantities(prev => {
            const next = [...prev];
            const currentVal = parseInt(next[index], 10) || 0;
            next[index] = currentVal + 1;
            return next;
        });
    }, [preOpen1]);

    const decrementQuantity = useCallback((index) => {
        if (preOpen1 != null) return;
        setQuantities(prev => {
            const next = [...prev];
            const currentVal = parseInt(next[index], 10) || 0;
            next[index] = Math.max(0, currentVal - 1);
            return next;
        });
    }, [preOpen1]);

    const totalAmount = useMemo(() => {
        return denominations.reduce(
            (sum, denom, index) => sum + (parseInt(quantities[index], 10) || 0) * denom.value,
            0
        );
    }, [quantities]);

    const savedData = useMemo(() => ({
        date,
        locCode,
        email,
        totalCash: calculatedTotals.totalCash,
        totalAmount,
        totalBankAmount: calculatedTotals.totalBankAmount,
        status: isToday ? "closed" : "pending_approval"
    }), [date, locCode, email, calculatedTotals.totalCash, totalAmount, calculatedTotals.totalBankAmount, isToday]);

    const CreateCashBank = async () => {
        if (savedData.totalAmount === 0) {
            const confirmed = await customConfirm(
                'Physical cash count is 0. Are you sure you want to close the day with zero cash? Click OK to proceed or Cancel to go back and enter the denomination count.'
            );
            if (!confirmed) return;
        }
        setLoading(true);
        try {
            const response = await fetch(apiUrl5, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(savedData),
            });

            if (response.status === 401) {
                setLoading(false);
                return customAlert("Error: Data already saved for today.", "error");
            } else if (!response.ok) {
                setLoading(false);
                return customAlert("Error saving data.", "error");
            }

            const data = await response.json();
            localStorage.setItem(`denominations_${currentDate}_${locCode}`, JSON.stringify(quantities));

            // Auto download PDF only for late daybook closures (yesterday's daybook flow)
            if (!isToday && printRef.current) {
                try {
                    await generateReportPdf();
                } catch (pdfError) {
                    console.error("PDF generation failed:", pdfError);
                    // Don't show an error to the user — the save was successful.
                    // They can still print manually via the print button.
                }
            }

            customAlert("Data saved successfully", "success");
            setIsSaved(true);
            setLoading(false);
            
            takeCreateCashBank();
            
            if (!isToday) {
                // Removed automatic redirect to today so the user can manually download the PDF.
                // The lock screen for pending approval will appear upon manual reload.
            }
        } catch (error) {
            console.error("Error saving data:", error);
            customAlert("An unexpected error occurred.", "error");
            setLoading(false);
        }
    };

    const GetCreateCashBank = async () => {
        try {
            const response = await fetch(apiUrl6, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setPreOpen(null);
                    if (isToday) {
                        if (!showAction && currentusers?.role !== "superadmin") {
                            setIsDayBookFrozen(true);
                            setFreezeReason('missing_yesterday');
                        } else {
                            setAdminWarningBanner('missing_yesterday');
                        }
                    }
                    return;
                }
                throw new Error(`Error fetching opening balance: ${response.status}`);
            }

            const data = await response.json();
            setPreOpen(data?.data);
            if (isToday && data?.data?.status === "pending_approval") {
                if (!showAction && currentusers?.role !== "superadmin") {
                    setIsDayBookFrozen(true);
                    setFreezeReason('pending_approval');
                } else {
                    setAdminWarningBanner('pending_approval');
                }
            } else {
                setIsDayBookFrozen(false);
                setAdminWarningBanner(null);
            }
        } catch (error) {
            console.error("Error fetching opening balance:", error);
            setPreOpen(null);
        }
    };

    const takeCreateCashBank = async () => {
        try {
            const response = await fetch(apiUrl7, { method: 'GET' });
            if (response.status === 404) {
                return;
            }
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`API ${response.status}: ${text}`);
            }
            const json = await response.json();
            setPreOpen1(json.data);
        } catch (err) {
            console.error("Error fetching closing data:", err);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            const fetchEditedTransactions = async () => {
                try {
                    const apiUrl = `${baseUrl.baseUrl}api/tws/getEditedTransactions?fromDate=${currentDate}&toDate=${currentDate}&locCode=${currentusers?.locCode}`;
                    const res = await fetch(apiUrl);
                    const json = await res.json();

                    const overrideRows = json?.data || [];
                    const editedObj = {};
                    overrideRows.forEach(row => {
                        const invoicePart = String(row.invoiceNo || row.invoice).trim();
                        const categoryPart = (row.type || row.category || "").toLowerCase();
                        const key = `${invoicePart}-${categoryPart}`;
                        if (invoicePart) {
                            editedObj[key] = {
                                _id: row._id,
                                invoiceNo: invoicePart,
                                cash: Number(row.cash || 0),
                                rbl: Number(row.rbl || 0),
                                bank: Number(row.bank || 0),
                                upi: Number(row.upi || 0),
                                securityAmount: Number(row.securityAmount || 0),
                                Balance: Number(row.Balance || 0),
                                billValue: Number(row.billValue || row.invoiceAmount || 0),
                                amount: Number(row.amount || 0),
                                totalTransaction: Number(row.totalTransaction || 0),
                            };
                        }
                    });
                    setEditedTransactionsMap(editedObj);
                } catch (err) {
                    console.warn("⚠️ Failed to fetch edited transactions:", err.message);
                }
            };

            await Promise.all([
                GetCreateCashBank(),
                takeCreateCashBank(),
                fetchEditedTransactions()
            ]);
            setIsInitialLoading(false);
        };

        loadInitialData();
    }, [currentDate]);

    const handleEditClick = async (transaction, index) => {
        setIsSyncing(true);

        if (!transaction._id) {
            const cashVal = transaction.cash || transaction.bookingCashAmount || transaction.rentoutCashAmount || 0;
            const rblVal = transaction.rbl || 0;
            const bankVal = transaction.bank || transaction.bookingBankAmount || transaction.rentoutBankAmount || 0;
            const upiVal = transaction.upi || transaction.bookingUPIAmount || transaction.rentoutUPIAmount || 0;
            const totalAmount = Number(cashVal) + Number(rblVal) + Number(bankVal) + Number(upiVal);

            const patchedTransaction = {
                invoiceNo: transaction.invoiceNo || transaction.locCode || "",
                customerName: transaction.customerName || "",
                locCode: currentusers?.locCode,
                type: transaction.Category || transaction.type || 'income',
                category: transaction.SubCategory || transaction.category || 'General',
                subCategory: transaction.SubCategory || transaction.category || '',
                paymentMethod: 'cash',
                date: new Date(transaction.date || currentDate),
                cash: String(cashVal),
                rbl: String(rblVal),
                bank: String(bankVal),
                upi: String(upiVal),
                amount: String(totalAmount),
                securityAmount: Number(transaction.securityAmount || 0),
                Balance: Number(transaction.Balance || 0),
                billValue: Number(transaction.billValue || transaction.invoiceAmount || 0),
                totalTransaction: totalAmount,
                editedBy: "000000000000000000000000",
                editedAt: new Date(),
            };

            try {
                const response = await fetch(`${baseUrl.baseUrl}user/syncTransaction`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(patchedTransaction),
                });

                const result = await response.json();

                if (!response.ok) {
                    customAlert("Failed to sync transaction.\n" + (result?.error || 'Unknown error'), "error");
                    setIsSyncing(false);
                    return;
                }

                transaction._id = result.data._id;
                filteredTransactions[index]._id = result.data._id;
            } catch (err) {
                customAlert("Sync error: " + err.message, "error");
                setIsSyncing(false);
                return;
            }
        }

        setEditedTransaction({
            _id: transaction._id,
            cash: transaction.cash || transaction.bookingCashAmount || transaction.rentoutCashAmount || transaction.returnCashAmount || -(transaction.deleteCashAmount) || 0,
            rbl: transaction.rbl || 0,
            bank: transaction.bank || transaction.bookingBankAmount || transaction.rentoutBankAmount || transaction.returnBankAmount || -(transaction.deleteBankAmount) || 0,
            upi: transaction.upi || transaction.bookingUPIAmount || transaction.rentoutUPIAmount || transaction.returnUPIAmount || -(transaction.deleteUPIAmount) || 0,
            securityAmount: transaction.securityAmount || 0,
            Balance: transaction.Balance || 0,
            date: transaction.date || "",
            customerName: transaction.customerName || "",
            invoiceNo: transaction.invoiceNo || transaction.locCode || "",
            Category: transaction.Category || transaction.type || "",
            SubCategory: transaction.SubCategory || transaction.category || "",
            SubCategory1: transaction.SubCategory1 || transaction.subCategory1 || "",
            remark: transaction.remark || "",
            billValue: transaction.billValue || transaction.invoiceAmount || 0,
            totalTransaction: transaction.totalTransaction || transaction.amount || 0,
            amount: transaction.amount || 0
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
            const rbl = field === 'rbl' ? numericValue : Number(prev.rbl) || 0;
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
            const payTotal = cash + rbl + bank + upi;

            return {
                ...prev,
                [field]: numericValue,
                cash, rbl, bank, upi,
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
            cash, rbl, bank, upi,
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
            let adjRbl = Number(rbl) || 0;
            let adjBank = Number(bank) || 0;
            let adjUpi = Number(upi) || 0;

            const negRow = ["return", "cancel"].includes(
                (editedTransaction.Category || "").toLowerCase()
            );
            if (negRow) {
                adjCash = -Math.abs(adjCash);
                adjRbl = -Math.abs(adjRbl);
                adjBank = -Math.abs(adjBank);
                adjUpi = -Math.abs(adjUpi);
            }

            const isRentOut = editedTransaction.Category === "RentOut";
            const originalBillValue = editedTransaction.billValue;
            const computedTotal = isRentOut
                ? numSec + numBal
                : adjCash + adjRbl + adjBank + adjUpi;

            const paySum = adjCash + adjRbl + adjBank + adjUpi;
            if (!isRentOut && paySum !== computedTotal) {
                if (adjCash !== 0) { adjCash = computedTotal; adjRbl = adjBank = adjUpi = 0; }
                else if (adjRbl !== 0) { adjRbl = computedTotal; adjCash = adjBank = adjUpi = 0; }
                else if (adjBank !== 0) { adjBank = computedTotal; adjCash = adjRbl = adjUpi = 0; }
                else { adjUpi = computedTotal; adjCash = adjRbl = adjBank = 0; }
            }

            const payload = {
                cash: adjCash,
                rbl: adjRbl,
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
                _id,
                invoiceNo: invoiceNo || invoice,
                cash: adjCash,
                rbl: adjRbl,
                bank: adjBank,
                upi: adjUpi,
                securityAmount: numSec,
                Balance: numBal,
                billValue: originalBillValue,
                amount: computedTotal,
                totalTransaction: computedTotal,
            };

            const key = `${String(invoiceNo || invoice).trim()}-${(editedTransaction.Category || '').toLowerCase()}`;
            setEditedTransactionsMap(prev => ({
                ...prev,
                [key]: updatedRow
            }));

            setEditingIndex(null);
            setEditedTransaction({});

        } catch (err) {
            console.error("Update error:", err);
            customAlert("Update failed: " + err.message, "error");
        }
    };

    useEnterToSave(() => {
        if (editingIndex !== null) {
            handleSave();
        }
    }, editingIndex === null);

    const currentBranchName = AllLoation.find(loc => loc.locCode === currentusers?.locCode)?.locName || currentusers?.locCode || "";

    const csvData = [
        {
            date: "OPENING BALANCE",
            invoiceNo: "",
            customerName: "",
            quantity: "",
            Category: "",
            SubCategory: "",
            SubCategory1: "",
            amount: openingCash + (Number(preOpen?.rbl ?? 0)),
            totalTransaction: openingCash + (Number(preOpen?.rbl ?? 0)),
            securityAmount: "",
            Balance: "",
            remark: "",
            discountAmount: "",
            billValue: "",
            cash: openingCash,
            rbl: Number(preOpen?.rbl ?? 0),
            bank: 0,
            upi: 0,
            attachment: "",
            branch: "",
        },
        ...filteredTransactions.map(transaction => {
            const isReturn = (transaction.Category || transaction.type || "").toLowerCase() === "return";
            const isCancel = (transaction.Category || transaction.type || "").toLowerCase() === "cancel";
            const isRent = (transaction.Category || transaction.type || "").toLowerCase() === "rentout";
            const isExpense = (transaction.Category || transaction.type || "").toLowerCase() === "expense";

            let cash = Number(transaction.cash ?? 0);
            let rbl = Number(transaction.rbl ?? 0);
            let bank = Number(transaction.bank ?? 0);
            let upi = Number(transaction.upi ?? 0);

            if (isReturn || isCancel) {
                cash = -Math.abs(cash);
                rbl = -Math.abs(rbl);
                bank = -Math.abs(bank);
                upi = -Math.abs(upi);
            } else if (isExpense) {
                if (cash > 0 && rbl === 0 && bank === 0 && upi === 0) cash = -cash;
                else if (bank > 0 && cash === 0 && rbl === 0 && upi === 0) bank = -bank;
                else if (upi > 0 && cash === 0 && rbl === 0 && bank === 0) upi = -upi;
                else if (rbl > 0 && cash === 0 && bank === 0 && upi === 0) rbl = -rbl;
            }

            const securityAmount = Number(transaction.securityAmount || 0);
            const balance = Number(transaction.Balance || 0);
            const amount = isRent ? (securityAmount + balance) : (cash + rbl + bank + upi);
            const totalTxn = isRent ? (securityAmount + balance) : (transaction.totalTransaction !== undefined ? Number(transaction.totalTransaction) : amount);

            const rowBranch = transaction.branch || (AllLoation.find(loc => loc.locCode === transaction.locCode)?.locName) || currentBranchName;

            return {
                date: transaction.date || currentDate,
                invoiceNo: transaction.invoiceNo || transaction.locCode || "",
                customerName: transaction.customerName || "",
                quantity: transaction.quantity || 1,
                Category: transaction.Category || transaction.type || "",
                SubCategory: isRent ? (transaction.SubCategory || "Security") : getCatLabel(transaction.SubCategory || transaction.category || transaction.subCategory || "-"),
                SubCategory1: isRent ? (transaction.SubCategory1 || "Balance Payable") : "",
                amount,
                totalTransaction: totalTxn,
                securityAmount: isRent ? securityAmount : (transaction.securityAmount ? Number(transaction.securityAmount) : ""),
                Balance: isRent ? balance : (transaction.Balance ? Number(transaction.Balance) : ""),
                remark: (() => { const r = transaction.remark || transaction.remarks || ""; return (r === "Thanks for your business." || r === "Thanks for your business") ? "" : r; })(),
                discountAmount: Number(transaction.discountAmount || 0),
                billValue: Number(transaction.billValue ?? transaction.invoiceAmount ?? Math.abs(amount)),
                cash,
                rbl,
                bank,
                upi,
                attachment: (transaction.hasAttachment || transaction.attachment) ? "Yes" : "No",
                branch: rowBranch,
            };
        }),
        {
            date: "TOTAL",
            invoiceNo: "",
            customerName: "",
            quantity: "",
            Category: "",
            SubCategory: "",
            SubCategory1: "",
            amount: calculatedTotals.totalCash + calculatedTotals.totalRblAmount + calculatedTotals.totalBankAmount1 + calculatedTotals.totalBankAmountupi,
            totalTransaction: calculatedTotals.totalCash + calculatedTotals.totalRblAmount + calculatedTotals.totalBankAmount1 + calculatedTotals.totalBankAmountupi,
            securityAmount: "",
            Balance: "",
            remark: "",
            discountAmount: totalCalculatedDiscount || 0,
            billValue: "",
            cash: calculatedTotals.totalCash,
            rbl: calculatedTotals.totalRblAmount,
            bank: calculatedTotals.totalBankAmount1,
            upi: calculatedTotals.totalBankAmountupi,
            attachment: "",
            branch: "",
        }
    ];

    // Screenshot the live report (html2canvas-pro understands Tailwind's oklch colors)
    // and fit the whole thing on a single landscape A4 page, exactly as on screen.
    const generateReportPdf = async () => {
        const element = printRef.current;
        if (!element) throw new Error("Nothing to export");
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            scrollX: 0,
            scrollY: -window.scrollY,
            windowWidth: Math.max(element.scrollWidth, 1200),
            ignoreElements: (el) => el.classList && el.classList.contains('no-print'),
        });
        const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const margin = 20;
        const ratio = Math.min((pageW - margin * 2) / canvas.width, (pageH - margin * 2) / canvas.height);
        const w = canvas.width * ratio;
        const h = canvas.height * ratio;
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', (pageW - w) / 2, margin, w, h);
        pdf.save(`DayBook_Close_${currentDate}_${locCode}.pdf`);
    };

    const handleDownloadReport = async () => {
        try {
            await generateReportPdf();
            return;
        } catch (e) {
            console.error("PDF download failed, falling back to print:", e);
        }
        handlePrintFallback();
    };

    const handlePrintFallback = () => {
        if (!printRef.current) return;
        const tableHtml = printRef.current.innerHTML;
        
        // Use a hidden iframe but keep it in the render tree to ensure cross-browser printing
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        document.body.appendChild(iframe);
        
        iframe.contentDocument.write(`
        <html>
          <head>
            <title>DayBook_Close_${currentDate}_${locCode}</title>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
              th { background-color: #f3f4f6; font-weight: bold; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .font-bold { font-weight: bold; }
              .bg-gray-50 { background-color: #f9fafb; }
              .text-red-500 { color: #ef4444; }
              @media print {
                body { padding: 0; }
                @page { margin: 0.5cm; size: landscape; }
              }
            </style>
          </head>
          <body>
            <div style="margin-bottom: 20px;">
              <h2 style="margin: 0 0 10px 0;">Day Book Report</h2>
              <p style="margin: 0; color: #666; font-size: 14px;">Store: ${locCode}</p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Date: ${currentDate}</p>
            </div>
            ${tableHtml}
          </body>
        </html>
        `);
        iframe.contentDocument.close();
        
        // Trigger print after styles load
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          // Clean up the iframe after a short delay
          setTimeout(() => document.body.removeChild(iframe), 2000);
        }, 250);
    };

    const physicalCash = preOpen1?.Closecash != null ? preOpen1.Closecash : totalAmount;
    const difference = physicalCash - calculatedTotals.totalCash;

    if (isDataLoading) {
        return (
            <div className="flex min-h-[60vh] w-full items-center justify-center bg-transparent">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <span className="text-gray-500 font-medium text-sm">Loading Day Book...</span>
                </div>
            </div>
        );
    }

    if (isDayBookFrozen) {
        return (
            <div className="flex min-h-[60vh] w-full items-center justify-center bg-transparent">
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                    <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md w-full text-center border-t-4 border-red-500">
                        <div className="mb-4 text-red-500">
                            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">Day Book Frozen</h2>
                        {freezeReason === 'missing_yesterday' ? (
                            <p className="text-gray-600 mb-6">
                                You failed to close yesterday's day book by 11:59 PM. You must close yesterday's day book now. Once closed, it will be sent as a request for approval. Then only you can proceed.
                            </p>
                        ) : (
                            <p className="text-gray-600 mb-6">
                                Your late day book closure for yesterday is pending approval. You cannot access today's day book until it is accepted.
                            </p>
                        )}
                        {freezeReason === 'missing_yesterday' ? (
                            <button
                                onClick={() => {
                                    setIsDayBookFrozen(false);
                                    const y = new Date();
                                    y.setDate(y.getDate() - 1);
                                    setCurrentDate(y.toISOString().split("T")[0]);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                            >
                                Close Yesterday's Day Book
                            </button>
                        ) : (
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                            >
                                Check Status Again
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div>
                <style>{`
                    @media print {
                        @page {
                            size: A4 landscape;
                            margin: 2mm;
                        }
                        * {
                            box-sizing: border-box !important;
                        }
                        body { 
                            font-family: Arial, sans-serif !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 100% !important;
                        }
                        .no-print { display: none !important; }
                        nav, header, aside, .sidebar { display: none !important; }
                        .ml-\\[240px\\] { margin-left: 0 !important; width: 100% !important; }
                        
                        /* Scale the entire wrapper to fit 14 columns */
                        .print-content-wrapper {
                            zoom: 0.82; 
                            page-break-inside: avoid;
                        }
                        
                        table { 
                            width: 100% !important; 
                            max-width: 100% !important;
                            border-collapse: collapse !important; 
                            font-size: 8px !important;
                            table-layout: auto !important; 
                        }
                        th, td { 
                            border: 1px solid #000 !important; 
                            padding: 2px 3px !important; 
                            word-wrap: break-word;
                        }
                        th { 
                            background-color: #18181b !important; 
                            color: white !important;
                            font-size: 7px !important;
                        }
                        
                        /* Ensure the two bottom boxes stay side by side and don't break pages */
                        .print-summary-grid {
                            display: flex !important;
                            flex-direction: row !important;
                            justify-content: space-between !important;
                            gap: 10px !important;
                            page-break-inside: avoid !important;
                            margin-top: 15px !important;
                        }
                        .lg\\:col-span-7 {
                            width: 58% !important;
                        }
                        .lg\\:col-span-5 {
                            width: 40% !important;
                        }
                    }
                `}</style>

                <Headers title={"Day Book"} />

                <div className={`transition-all duration-300 ${isSidebarOpen ? 'md:ml-[240px] ml-0' : 'ml-0'} overflow-hidden`}>
                    {/* Admin Warning Banner */}
                    {adminWarningBanner && (
                        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 m-4 md:m-8 md:mb-4 rounded shadow-sm flex items-start no-print">
                            <svg className="w-6 h-6 mr-3 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <h3 className="font-bold">Attention Admin: Store Day Book Incomplete</h3>
                                <p className="text-sm mt-1">
                                    {adminWarningBanner === 'missing_yesterday' 
                                        ? "This store failed to close yesterday's day book by 11:59 PM. Their access is currently frozen until they submit it for your approval."
                                        : "This store has submitted a late day book closure that is currently pending your approval."}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="p-4 md:p-8 bg-white min-h-screen">

                        {/* Top Section: Page Header, Category Filters & Date */}
                        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
                            {/* Left Filters */}
                            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 w-full md:w-auto">
                                <div className="w-full sm:w-[260px]">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
                                    <Select
                                        isMulti
                                        options={categories}
                                        value={selectedCategory}
                                        onChange={setSelectedCategory}
                                        styles={customSelectStyles}
                                        components={{ Option: CheckboxOption }}
                                        closeMenuOnSelect={false}
                                        hideSelectedOptions={false}
                                        isSearchable={true}
                                        placeholder="All Categories"
                                    />
                                </div>
                                <div className="w-full sm:w-[300px]">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Sub Category</label>
                                    <Select
                                        isMulti
                                        options={subCategories}
                                        value={selectedSubCategory}
                                        onChange={setSelectedSubCategory}
                                        styles={customSelectStyles}
                                        components={{ Option: CheckboxOption }}
                                        closeMenuOnSelect={false}
                                        hideSelectedOptions={false}
                                        isSearchable={true}
                                        placeholder="All Sub Categories"
                                    />
                                </div>
                            </div>

                            {/* Right Date Display */}
                            <div className="text-right">
                                <span className="block text-xs font-medium text-gray-400 mb-0.5">Date</span>
                                <span className="text-sm md:text-base font-bold text-gray-900">{displayFormattedDate}</span>
                            </div>
                        </div>

                        <div ref={printRef} className="print-content-wrapper">
                            {/* Main Transactions Table */}
                            <div className="bg-white border border-gray-200 overflow-hidden shadow-xs mb-8 print-no-shadow print-border-none print:overflow-visible">
                                <div className="overflow-x-auto print:overflow-visible">
                                    <table className="w-full text-left border-collapse min-w-[1200px] print:min-w-0 print:w-full daybook-print-table">
                                        <thead>
                                            <tr className="bg-[#1c1c1c] text-white">
                                                <th className="py-3.5 pl-4 pr-2 text-[11px] font-bold uppercase tracking-wider">TIME</th>
                                                <th className="py-3.5 px-2 text-[11px] font-bold uppercase tracking-wider">INVOICE NO.</th>
                                                <th className="py-3.5 px-2 text-[11px] font-bold uppercase tracking-wider">CUSTOMER NAME</th>
                                                <th className="py-3.5 px-2 text-[11px] font-bold uppercase tracking-wider">CATEGORY</th>
                                                <th className="py-3.5 px-2 text-[11px] font-bold uppercase tracking-wider">SUB CATEGORY</th>
                                                <th className="py-3.5 px-2 text-[11px] font-bold uppercase tracking-wider">REMARKS</th>
                                                <th className="py-3.5 px-2 text-[11px] font-bold uppercase tracking-wider text-right">AMOUNT</th>
                                                <th className="py-3.5 px-2 text-[11px] font-bold uppercase tracking-wider text-right">TOTAL TXN</th>
                                                <th className="py-3.5 px-2 text-[11px] font-bold uppercase tracking-wider text-right">DISCOUNT</th>
                                                <th className="py-3.5 px-2 text-[11px] font-bold uppercase tracking-wider text-right">BILL VALUE</th>
                                                <th className="py-3.5 px-2 text-[11px] font-bold uppercase tracking-wider text-right">CASH</th>
                                                <th className="py-3.5 px-2 text-[11px] font-bold uppercase tracking-wider text-right">RAZORPAY</th>
                                                <th className="py-3.5 px-2 text-[11px] font-bold uppercase tracking-wider text-right">CARD/BANK</th>
                                                <th className="py-3.5 pl-2 pr-4 text-[11px] font-bold uppercase tracking-wider text-right">UPI</th>
                                                {showAction && <th className="py-3.5 px-2 text-[11px] font-bold uppercase tracking-wider text-center print:hidden">ACTION</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {/* Special Row: OPENING BALANCE */}
                                            <tr className="bg-white font-medium text-gray-900 hover:bg-gray-50/50">
                                                <td colSpan="10" className="py-3.5 pl-4 pr-2 font-bold text-xs uppercase tracking-wider text-gray-900">
                                                    OPENING BALANCE
                                                </td>
                                                <td className="py-3.5 px-2 text-right font-bold text-xs text-gray-900">
                                                    {preOpen?.cash ?? preOpen?.Closecash ?? 0}
                                                </td>
                                                <td className="py-3.5 px-2 text-right font-bold text-xs text-gray-900">0</td>
                                                <td className="py-3.5 px-2 text-right font-bold text-xs text-gray-900">0</td>
                                                <td className="py-3.5 pl-2 pr-4 text-right font-bold text-xs text-gray-900">0</td>
                                                {showAction && <td className="py-3.5 px-2 print:hidden"></td>}
                                            </tr>

                                            {/* Data Rows */}
                                            {filteredTransactions.length > 0 ? (
                                                filteredTransactions.map((tx, idx) => {
                                                    const isEditing = editingIndex === idx;
                                                    const displayTime = tx.time ? tx.time : "-";
                                                    const displayInvoice = tx.invoiceNo || tx.locCode || "-";
                                                    const displayCustomer = tx.customerName || "-";
                                                    const displayCategory = tx.Category || tx.type || tx.category || "-";
                                                    const displaySubCategory = getCatLabel(tx.SubCategory || tx.subCategory || "-");
                                                    const displayRemarks = tx.remarks || tx.remark || "-";
                                                    const displayAmount = tx.amount != null ? tx.amount : 0;
                                                    const displayTotalTxn = tx.totalTransaction != null ? tx.totalTransaction : 0;
                                                    const displayDiscount = tx.discountAmount ? tx.discountAmount : "-";
                                                    const displayBillValue = tx.billValue != null ? tx.billValue : (tx.invoiceAmount || "-");
                                                    const displayCash = tx.cash != null ? tx.cash : 0;
                                                    const displayRazorpay = tx.rbl != null ? tx.rbl : 0;
                                                    const displayBank = tx.bank != null ? tx.bank : 0;
                                                    const displayUpi = tx.upi != null ? tx.upi : 0;

                                                    const isRentOut = tx.Category === "RentOut" || (tx.category || "").toLowerCase() === "rentout" || (tx.type || "").toLowerCase() === "rentout";

                                                    if (isRentOut) {
                                                        const secAmt = isEditing ? (editedTransaction.securityAmount ?? tx.securityAmount ?? 0) : (tx.securityAmount ?? 0);
                                                        const balAmt = isEditing ? (editedTransaction.Balance ?? tx.Balance ?? 0) : (tx.Balance ?? 0);
                                                        const subCat1 = tx.SubCategory || "Security";
                                                        const subCat2 = tx.SubCategory1 || "Balance Payable";

                                                        return (
                                                            <React.Fragment key={`rentout-frag-${tx._id || tx.invoiceNo || idx}`}>
                                                                {/* Row 1: Security */}
                                                                <tr key={`rentout-${idx}-sec`} className="hover:bg-gray-50/70 transition-colors text-gray-800 border-b border-gray-100">
                                                                    <td className="py-3.5 pl-4 pr-2 text-xs text-gray-600 whitespace-nowrap">{displayTime}</td>
                                                                    <td className="py-3.5 px-2 font-medium text-xs whitespace-nowrap">{displayInvoice}</td>
                                                                    <td className="py-3.5 px-2 font-medium text-xs whitespace-nowrap">{displayCustomer}</td>
                                                                    <td rowSpan={2} className="py-3.5 px-2 text-xs whitespace-nowrap align-middle">{displayCategory}</td>
                                                                    <td className="py-3.5 px-2 text-xs whitespace-nowrap">{subCat1}</td>
                                                                    <td className="py-3.5 px-2 text-xs text-gray-500 max-w-[140px] truncate">{displayRemarks}</td>
                                                                    <td className="py-3.5 px-2 text-right font-medium text-xs whitespace-nowrap">
                                                                        {isEditing ? (
                                                                            <input
                                                                                type="number"
                                                                                value={editedTransaction.securityAmount ?? ""}
                                                                                onChange={(e) => handleInputChange("securityAmount", e.target.value)}
                                                                                className="w-20 p-1 border border-gray-300 text-xs text-right"
                                                                            />
                                                                        ) : (secAmt ? Math.round(Number(secAmt)).toLocaleString() : 0)}
                                                                    </td>
                                                                    <td rowSpan={2} className="py-3.5 px-2 text-right font-medium text-xs whitespace-nowrap align-middle">
                                                                        {isEditing ? (
                                                                            <input
                                                                                type="number"
                                                                                value={editedTransaction.totalTransaction ?? ""}
                                                                                onChange={(e) => handleInputChange("totalTransaction", e.target.value)}
                                                                                className="w-20 p-1 border border-gray-300 text-xs text-right"
                                                                            />
                                                                        ) : (displayTotalTxn ? Math.round(Number(displayTotalTxn)).toLocaleString() : 0)}
                                                                    </td>
                                                                    <td rowSpan={2} className="py-3.5 px-2 text-right text-xs text-gray-600 whitespace-nowrap align-middle">
                                                                        {displayDiscount}
                                                                    </td>
                                                                    <td rowSpan={2} className="py-3.5 px-2 text-right text-xs text-gray-800 whitespace-nowrap align-middle">
                                                                        {displayBillValue ? (typeof displayBillValue === 'number' ? Math.round(displayBillValue).toLocaleString() : displayBillValue) : "-"}
                                                                    </td>
                                                                    <td rowSpan={2} className="py-3.5 px-2 text-right text-xs text-gray-800 whitespace-nowrap align-middle">
                                                                        {isEditing ? (
                                                                            <input
                                                                                type="number"
                                                                                value={editedTransaction.cash ?? ""}
                                                                                onChange={(e) => handleInputChange("cash", e.target.value)}
                                                                                className="w-16 p-1 border border-gray-300 text-xs text-right"
                                                                            />
                                                                        ) : (displayCash ? Math.round(Number(displayCash)).toLocaleString() : "-")}
                                                                    </td>
                                                                    <td rowSpan={2} className="py-3.5 px-2 text-right text-xs text-gray-800 whitespace-nowrap align-middle">
                                                                        {isEditing ? (
                                                                            <input
                                                                                type="number"
                                                                                value={editedTransaction.rbl ?? ""}
                                                                                onChange={(e) => handleInputChange("rbl", e.target.value)}
                                                                                className="w-16 p-1 border border-gray-300 text-xs text-right"
                                                                            />
                                                                        ) : (displayRazorpay ? Math.round(Number(displayRazorpay)).toLocaleString() : "-")}
                                                                    </td>
                                                                    <td rowSpan={2} className="py-3.5 px-2 text-right text-xs text-gray-800 whitespace-nowrap align-middle">
                                                                        {isEditing ? (
                                                                            <input
                                                                                type="number"
                                                                                value={editedTransaction.bank ?? ""}
                                                                                onChange={(e) => handleInputChange("bank", e.target.value)}
                                                                                className="w-16 p-1 border border-gray-300 text-xs text-right"
                                                                            />
                                                                        ) : (displayBank ? Math.round(Number(displayBank)).toLocaleString() : "-")}
                                                                    </td>
                                                                    <td rowSpan={2} className="py-3.5 pl-2 pr-4 text-right text-xs text-gray-800 whitespace-nowrap align-middle">
                                                                        {isEditing ? (
                                                                            <input
                                                                                type="number"
                                                                                value={editedTransaction.upi ?? ""}
                                                                                onChange={(e) => handleInputChange("upi", e.target.value)}
                                                                                className="w-16 p-1 border border-gray-300 text-xs text-right"
                                                                            />
                                                                        ) : (displayUpi ? Math.round(Number(displayUpi)).toLocaleString() : "-")}
                                                                    </td>
                                                                    {showAction && (
                                                                        <td rowSpan={2} className="py-3.5 px-2 text-center whitespace-nowrap print:hidden align-middle">
                                                                            {isEditing ? (
                                                                                <button
                                                                                    onClick={handleSave}
                                                                                    className="bg-[#a855f7] text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-purple-600 cursor-pointer shadow-sm"
                                                                                >
                                                                                    Save
                                                                                </button>
                                                                            ) : (
                                                                                <button
                                                                                    onClick={() => handleEditClick(tx, idx)}
                                                                                    className="flex items-center gap-1.5 text-[#a855f7] hover:text-[#9333ea] px-2 py-1 text-xs font-medium cursor-pointer mx-auto"
                                                                                >
                                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                                                    Edit
                                                                                </button>
                                                                            )}
                                                                        </td>
                                                                    )}
                                                                </tr>

                                                                {/* Row 2: Balance Payable */}
                                                                <tr key={`rentout-${idx}-bal`} className="hover:bg-gray-50/70 transition-colors text-gray-800 border-b border-gray-100">
                                                                    <td className="py-3.5 pl-4 pr-2 text-xs text-gray-600 whitespace-nowrap">{displayTime}</td>
                                                                    <td className="py-3.5 px-2 font-medium text-xs whitespace-nowrap">{displayInvoice}</td>
                                                                    <td className="py-3.5 px-2 font-medium text-xs whitespace-nowrap">{displayCustomer}</td>
                                                                    <td className="py-3.5 px-2 text-xs whitespace-nowrap">{subCat2}</td>
                                                                    <td className="py-3.5 px-2 text-xs text-gray-500 max-w-[140px] truncate">{displayRemarks}</td>
                                                                    <td className="py-3.5 px-2 text-right font-medium text-xs whitespace-nowrap">
                                                                        {isEditing ? (
                                                                            <input
                                                                                type="number"
                                                                                value={editedTransaction.Balance ?? ""}
                                                                                onChange={(e) => handleInputChange("Balance", e.target.value)}
                                                                                className="w-20 p-1 border border-gray-300 text-xs text-right"
                                                                            />
                                                                        ) : (balAmt ? Math.round(Number(balAmt)).toLocaleString() : 0)}
                                                                    </td>
                                                                </tr>
                                                            </React.Fragment>
                                                        );
                                                    }

                                                    return (
                                                        <tr key={tx._id || idx} className="hover:bg-gray-50/70 transition-colors text-gray-800">
                                                            <td className="py-3.5 pl-4 pr-2 text-xs text-gray-600 whitespace-nowrap">{displayTime}</td>
                                                            <td className="py-3.5 px-2 font-medium text-xs whitespace-nowrap">{displayInvoice}</td>
                                                            <td className="py-3.5 px-2 font-medium text-xs whitespace-nowrap">{displayCustomer}</td>
                                                            <td className="py-3.5 px-2 text-xs whitespace-nowrap">{displayCategory}</td>
                                                            <td className="py-3.5 px-2 text-xs whitespace-nowrap">{displaySubCategory}</td>
                                                            <td className="py-3.5 px-2 text-xs text-gray-500 max-w-[140px] truncate">{displayRemarks}</td>
                                                            <td className="py-3.5 px-2 text-right font-medium text-xs whitespace-nowrap">
                                                                {isEditing ? (
                                                                    <input
                                                                        type="number"
                                                                        value={editedTransaction.amount}
                                                                        onChange={(e) => handleInputChange("amount", e.target.value)}
                                                                        className="w-20 p-1 border border-gray-300 text-xs text-right"
                                                                    />
                                                                ) : displayAmount}
                                                            </td>
                                                            <td className="py-3.5 px-2 text-right font-medium text-xs whitespace-nowrap">
                                                                {isEditing ? (
                                                                    <input
                                                                        type="number"
                                                                        value={editedTransaction.totalTransaction}
                                                                        onChange={(e) => handleInputChange("totalTransaction", e.target.value)}
                                                                        className="w-20 p-1 border border-gray-300 text-xs text-right"
                                                                    />
                                                                ) : displayTotalTxn}
                                                            </td>
                                                            <td className="py-3.5 px-2 text-right text-xs text-gray-600 whitespace-nowrap">
                                                                {displayDiscount}
                                                            </td>
                                                            <td className="py-3.5 px-2 text-right text-xs text-gray-800 whitespace-nowrap">
                                                                {displayBillValue}
                                                            </td>
                                                            <td className="py-3.5 px-2 text-right text-xs text-gray-800 whitespace-nowrap">
                                                                {isEditing ? (
                                                                    <input
                                                                        type="number"
                                                                        value={editedTransaction.cash}
                                                                        onChange={(e) => handleInputChange("cash", e.target.value)}
                                                                        className="w-16 p-1 border border-gray-300 text-xs text-right"
                                                                    />
                                                                ) : displayCash}
                                                            </td>
                                                            <td className="py-3.5 px-2 text-right text-xs text-gray-800 whitespace-nowrap">
                                                                {isEditing ? (
                                                                    <input
                                                                        type="number"
                                                                        value={editedTransaction.rbl}
                                                                        onChange={(e) => handleInputChange("rbl", e.target.value)}
                                                                        className="w-16 p-1 border border-gray-300 text-xs text-right"
                                                                    />
                                                                ) : displayRazorpay}
                                                            </td>
                                                            <td className="py-3.5 px-2 text-right text-xs text-gray-800 whitespace-nowrap">
                                                                {isEditing ? (
                                                                    <input
                                                                        type="number"
                                                                        value={editedTransaction.bank}
                                                                        onChange={(e) => handleInputChange("bank", e.target.value)}
                                                                        className="w-16 p-1 border border-gray-300 text-xs text-right"
                                                                    />
                                                                ) : displayBank}
                                                            </td>
                                                            <td className="py-3.5 pl-2 pr-4 text-right text-xs text-gray-800 whitespace-nowrap">
                                                                {isEditing ? (
                                                                    <input
                                                                        type="number"
                                                                        value={editedTransaction.upi}
                                                                        onChange={(e) => handleInputChange("upi", e.target.value)}
                                                                        className="w-16 p-1 border border-gray-300 text-xs text-right"
                                                                    />
                                                                ) : displayUpi}
                                                            </td>
                                                            {showAction && (
                                                                <td className="py-3.5 px-2 text-center whitespace-nowrap print:hidden">
                                                                    {isEditing ? (
                                                                        <button
                                                                            onClick={handleSave}
                                                                            className="bg-[#a855f7] text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-purple-600 cursor-pointer shadow-sm"
                                                                        >
                                                                            Save
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => handleEditClick(tx, idx)}
                                                                            className="flex items-center gap-1.5 text-[#a855f7] hover:text-[#9333ea] px-2 py-1 text-xs font-medium cursor-pointer"
                                                                        >
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                                            Edit
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={showAction ? 15 : 14} className="py-12 text-center text-gray-400 text-sm">
                                                        No transactions found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-[#dedede] text-gray-900 font-bold border-t border-gray-300">
                                                <td colSpan="10" className="py-3.5 pl-4 pr-2 font-bold text-xs uppercase tracking-wider">
                                                    Total
                                                </td>
                                                <td className="py-3.5 px-2 text-right text-xs font-bold">
                                                    {calculatedTotals.totalCash}
                                                </td>
                                                <td className="py-3.5 px-2 text-right text-xs font-bold">
                                                    {calculatedTotals.totalRblAmount}
                                                </td>
                                                <td className="py-3.5 px-2 text-right text-xs font-bold">
                                                    {calculatedTotals.totalBankAmount1}
                                                </td>
                                                <td className="py-3.5 pl-2 pr-4 text-right text-xs font-bold">
                                                    {calculatedTotals.totalBankAmountupi}
                                                </td>
                                                {showAction && <td className="py-3.5 px-2 print:hidden"></td>}
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Bottom 2-Column Section: Physical Cash Count & Cash Summary */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-10 print-summary-grid">

                                {/* Left Box: PHYSICAL CASH COUNT */}
                                <div className="lg:col-span-7">
                                    <h3 className="text-[14px] font-bold text-gray-900 mb-4 hidden print:block uppercase tracking-wider">Physical Cash Count</h3>
                                    <div className="border border-gray-200 shadow-sm rounded-lg overflow-hidden print-no-shadow print-denom-box">
                                        <div className="bg-[#1c1c1c] text-white px-6 py-3.5 flex justify-between items-center print-denom-header">
                                            <span className="text-[11px] font-bold uppercase tracking-wider w-1/3">DENOMINATION</span>
                                            <span className="text-[11px] font-bold uppercase tracking-wider w-1/3 text-center">QUANTITY</span>
                                            <span className="text-[11px] font-bold uppercase tracking-wider w-1/3 text-right">AMOUNT</span>
                                        </div>

                                        <div className="divide-y divide-gray-100 bg-white">
                                            {denominations.map((denom, index) => {
                                                const amt = (parseInt(quantities[index], 10) || 0) * denom.value;
                                                return (
                                                    <div key={denom.label} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50/70 transition-colors">
                                                        <span className="text-sm font-medium text-gray-700 w-1/3">{denom.label}</span>
                                                        <div className="w-1/3 flex justify-center">
                                                            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white print:border-none print:rounded-none">
                                                                <button type="button" className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 border-r border-gray-300 print:hidden" onClick={() => handleQuantityChange(index, Math.max(0, (parseInt(quantities[index]) || 0) - 1))} disabled={preOpen1 != null}><Minus size={14} /></button>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={quantities[index]}
                                                                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                                    readOnly={preOpen1 != null}
                                                                    placeholder="0"
                                                                    className="w-12 h-7 text-center text-sm font-medium text-gray-800 focus:outline-none disabled:bg-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none print-denom-input"
                                                                />
                                                                <button type="button" className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 border-l border-gray-300 print:hidden" onClick={() => handleQuantityChange(index, (parseInt(quantities[index]) || 0) + 1)} disabled={preOpen1 != null}><Plus size={14} /></button>
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-800 w-1/3 text-right">
                                                            {amt > 0 ? amt.toLocaleString() : "0.00"}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                            <div className="px-6 py-3.5 flex justify-between items-center bg-[#dedede]">
                                                <span className="text-sm font-bold text-gray-900 w-2/3">Physical Total</span>
                                                <span className="text-sm font-bold text-gray-900 w-1/3 text-right">
                                                    {physicalCash > 0 ? physicalCash.toLocaleString() : "0.00"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Box: CASH SUMMARY Card */}
                                <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 flex flex-col shadow-sm print-no-shadow print-summary-box">
                                    <div>
                                        <h3 className="text-[17px] font-bold text-gray-900 mb-6 print:uppercase print:text-[14px]">Cash Summary</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-[14px] text-gray-600 font-medium">Closing Cash</span>
                                                <span className="text-[16px] font-bold text-gray-900">
                                                    {(Number(calculatedTotals?.totalCash) || 0).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-[14px] text-gray-600 font-medium">Physical Cash</span>
                                                <span className="text-[16px] font-bold text-gray-900">
                                                    {(Number(physicalCash) || 0).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="border-t border-dashed border-gray-300 my-2" />
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-[15px] font-bold text-gray-900">Difference</span>
                                                <span className={`text-[16px] font-bold ${difference !== 0 ? "text-red-500" : "text-gray-900"
                                                    }`}>
                                                    {difference !== 0 ? (Number(difference) || 0).toLocaleString() : "0"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 mt-8 no-print">
                                        <button
                                            type="button"
                                            onClick={handleDownloadReport}
                                            disabled={!isSaved && !preOpen1}
                                            className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-colors text-center border ${(!isSaved && !preOpen1) ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer border-gray-200'}`}
                                        >
                                            Download Report
                                        </button>

                                        <CSVLink
                                            data={csvData}
                                            headers={headers}
                                            filename={`${currentDate}_DayBook_${locCode || "store"}.csv`}
                                            className="flex-1"
                                        >
                                            <button
                                                type="button"
                                                className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg transition-colors text-center border bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer border-gray-200"
                                            >
                                                Export CSV
                                            </button>
                                        </CSVLink>

                                        {loading ? (
                                            <button
                                                disabled
                                                className="flex-1 py-2.5 px-4 bg-[#a855f7] opacity-70 text-white text-sm font-semibold rounded-lg text-center flex items-center justify-center gap-2 cursor-not-allowed"
                                            >
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Saving...</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={CreateCashBank}
                                                disabled={!isSaveEnabled || isSyncing || isSaved || !!preOpen1}
                                                className={`flex-1 py-2.5 px-4 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors text-center ${(!isSaveEnabled || isSyncing || isSaved || !!preOpen1) ? 'bg-[#a855f7] opacity-60 cursor-not-allowed' : 'bg-[#a855f7] hover:bg-[#9333ea] cursor-pointer'}`}
                                            >
                                                {!isSaveEnabled ? "Stabilizing..." : (isSaved || !!preOpen1) ? "Saved & Finished" : "Save & Finish Day"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Hidden CSV link for download trigger */}
                        <div className="hidden">
                            <CSVLink
                                ref={csvLinkRef}
                                data={csvData}
                                headers={headers}
                                filename={`${currentDate} DayBook report.csv`}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default DayBookInc;
