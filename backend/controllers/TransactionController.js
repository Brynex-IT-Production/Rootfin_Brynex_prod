// backend/cont/TransactionController.js
import Transaction from "../model/Transaction.js";
import SalesInvoice from "../model/SalesInvoice.js";
import CloseTransaction from "../model/Closing.js";
import { propagateCashDiff } from "../utils/cashPropagation.js";
import { getCachedData, setCachedData, generateCacheKey } from "../utils/cacheManager.js";

// Optimized function to get transactions with caching and better queries
export const getOptimizedTransactions = async (req, res) => {
  const { LocCode, DateFrom, DateTo, category, type } = req.query;
  
  try {
    // Generate cache key
    const cacheKey = generateCacheKey('transactions', { LocCode, DateFrom, DateTo, category, type });
    
    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    // Build optimized query with indexes
    const query = {
      locCode: LocCode,
      date: {
        $gte: new Date(DateFrom),
        $lte: new Date(DateTo)
      }
    };

    // Add optional filters
    if (category && category !== 'all') {
      query.category = category;
    }
    if (type && type !== 'all') {
      query.type = type;
    }

    // Use aggregation pipeline for better performance
    const pipeline = [
      { $match: query },
      {
        $addFields: {
          // Ensure numeric fields for calculations
          cashNum: { $toDouble: { $ifNull: ["$cash", 0] } },
          rblNum: { $toDouble: { $ifNull: ["$rbl", 0] } },
          bankNum: { $toDouble: { $ifNull: ["$bank", 0] } },
          upiNum: { $toDouble: { $ifNull: ["$upi", 0] } }
        }
      },
      {
        $addFields: {
          totalTransaction: { $add: ["$cashNum", "$rblNum", "$bankNum", "$upiNum"] }
        }
      },
      { $sort: { date: -1, createdAt: -1 } },
      { $project: { attachment: 0 } }
    ];

    const transactions = await Transaction.aggregate(pipeline);

    // Calculate totals efficiently
    const totals = transactions.reduce((acc, tx) => ({
      cash: acc.cash + (tx.cashNum || 0),
      rbl: acc.rbl + (tx.rblNum || 0),
      bank: acc.bank + (tx.bankNum || 0),
      upi: acc.upi + (tx.upiNum || 0),
      total: acc.total + (tx.totalTransaction || 0)
    }), { cash: 0, rbl: 0, bank: 0, upi: 0, total: 0 });

    const result = {
      success: true,
      data: transactions,
      totals,
      count: transactions.length,
      filters: { LocCode, DateFrom, DateTo, category, type }
    };

    // Cache for 5 minutes
    setCachedData(cacheKey, result, 300);

    res.json(result);

  } catch (error) {
    console.error('Error in getOptimizedTransactions:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
import { nextInvoice } from "../utlis/nextInvoice.js";
import parseBase64  from "../utlis/parseBase64.js";  
// CommonJS style



export const CreatePayment = async (req, res) => {
  try {
    const {
      type,
      category,
      subCategory,
      expenseType,
      entryType,
      remark,
      amount,
      cash,
      bank,
      upi,
      paymentMethod,
      bankAccount,
      locCode,
      quantity,
      date,
      invoiceNo,        // may be omitted
      isSecurityReturn,
      isAdminLevel,
      attachment        // 🔺 ADDED  (base-64 string from React)
    } = req.body;

    /* ───────── basic validation ───────── */
    if (
      !type || !category || !amount ||
      cash === undefined || bank === undefined || upi === undefined ||
      !paymentMethod || !date || !locCode
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    /* income must include an attachment (same rule as frontend) */
    if (type === "Expense" && !attachment) {
      return res.status(400).json({ message: "Attachment required for expense" });
    }

    /* ───────── decide if we need an invoice ───────── */
    const isMoneyTransfer =
      type === "money transfer" &&
      (category === "Cash to Bank" || category === "Bank to Cash");

    let finalInvoice = invoiceNo; // keep client’s invoice if sent

    if (!finalInvoice) {
      if (isSecurityReturn) {
        finalInvoice = `SECURITY-${locCode}-${Date.now()}`;
      } else if (isMoneyTransfer) {
        finalInvoice = `TRANSFER-${locCode}-${Date.now()}`;
      } else {
        finalInvoice = await nextInvoice(locCode);
      }
    }

    /* ───────── decode the attachment (if any) ───────── */
    let attachmentObj = undefined;                // 🔺 ADDED
    if (attachment) {
      try {
        attachmentObj = parseBase64(attachment);  // { filename, contentType, data }
      } catch (err) {
        return res.status(400).json({ message: "Invalid attachment data" });
      }
    }

    /* ───────── create & save ───────── */
    const newTx = await Transaction.create({
      type,
      category,
      subCategory: subCategory || "",
      expenseType: expenseType || "",
      entryType: entryType || "",
      remark,
      amount,
      quantity,
      cash,
      bank,
      upi,
      locCode,
      paymentMethod,
      bankAccount: bankAccount || "",
      date,
      invoiceNo: finalInvoice,
      isAdminLevel,
      attachment: attachmentObj                     // 🔺 ADDED
    });

    // ✅ Propagate cash to CloseTransaction for date >= txDate (only for store-level entries)
    const cashAmount = Number(cash) || 0;
    if (cashAmount !== 0 && locCode && date && !isAdminLevel) {
      await propagateCashDiff(locCode, date, cashAmount, true);
    }

    res.status(201).json(newTx);

  } catch (err) {
    console.error("CreatePayment error:", err);
    if (err.code === 11000 && err.keyPattern?.invoiceNo) {
      return res.status(409).json({ message: "Duplicate invoice number" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


/* ========= download route handler (keep in same file or split) ========= */
export const DownloadAttachment = async (req, res) => {
  try {
    const tx = await Transaction
      .findById(req.params.id)
      .select("attachment");

    if (!tx || !tx.attachment || !tx.attachment.data) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    res
      .set({
        "Content-Type":        tx.attachment.contentType,
        "Content-Disposition": `attachment; filename="${tx.attachment.filename}"`
      })
      .send(tx.attachment.data);
  } catch (err) {
    res.status(500).json({ message: "Download failed", error: err.message });
  }
};






export const GetPayment = async (req, res) => {
    try {
        const { LocCode, DateFrom, DateTo } = req.query;

        console.log(`\n📊 GetPayment Request:`);
        console.log(`   LocCode: "${LocCode}"`);
        console.log(`   DateFrom: "${DateFrom}"`);
        console.log(`   DateTo: "${DateTo}"`);

        if (!DateFrom || !DateTo) {
            return res.status(400).json({ message: "Both 'DateFrom' and 'DateTo' are required" });
        }

        // Convert to Date objects and normalize to start and end of the day
        const fromDate = new Date(DateFrom);
        const toDate = new Date(DateTo);

        fromDate.setUTCHours(0, 0, 0, 0); // Start of the day
        toDate.setUTCHours(23, 59, 59, 999); // End of the day

        console.log(`   Parsed fromDate: ${fromDate.toISOString()}`);
        console.log(`   Parsed toDate: ${toDate.toISOString()}`);

        // Build query — if LocCode is "all" or omitted, fetch all stores
        const query = { date: { $gte: fromDate, $lte: toDate } };
        if (LocCode && LocCode !== "all") {
            const locNum = Number(LocCode);
            query.locCode = !isNaN(locNum) ? { $in: [String(LocCode), locNum] } : String(LocCode);
        }

        // Query transactions based on LocCode and Date Range — exclude binary attachment but include hasAttachment flag
        const transactions = await Transaction.aggregate([
          { $match: query },
          {
            $addFields: {
              hasAttachment: {
                $or: [
                  { $in: [{ $type: "$attachment.data" }, ["binData", "string"]] },
                  { $gt: [{ $strLenCP: { $ifNull: ["$attachment.filename", ""] } }, 0] },
                  { $eq: [{ $type: "$attachment" }, "string"] },
                ],
              },
            },
          },
          { $project: { attachment: 0 } },
          { $sort: { date: -1 } }
        ]).option({ allowDiskUse: true });

        // ✅ Resolve return subCategories if missing or "General"
        const returnTxWithoutSubCat = transactions.filter(t => {
          const isReturn = (t.type || "").toLowerCase() === "return" ||
                           (t.category || "").toLowerCase() === "return" ||
                           /^(RTN-|RET-)/i.test(t.invoiceNo || "");
          const sub = (t.subCategory || "").toLowerCase().trim();
          return isReturn && (!sub || sub === "general" || sub === "return" || sub === "general return");
        });

        if (returnTxWithoutSubCat.length > 0) {
          try {
            const invNumbers = returnTxWithoutSubCat.map(t => t.invoiceNo).filter(Boolean);
            const matchingInvoices = await SalesInvoice.find({ invoiceNumber: { $in: invNumbers } }).lean();
            const invMap = new Map(matchingInvoices.map(i => [i.invoiceNumber, i]));

            const origInvNumbers = matchingInvoices.map(i => i.originalInvoiceNumber).filter(Boolean);
            const origInvoices = origInvNumbers.length > 0
              ? await SalesInvoice.find({ invoiceNumber: { $in: origInvNumbers } }).lean()
              : [];
            const origInvMap = new Map(origInvoices.map(i => [i.invoiceNumber, i]));

            for (const t of returnTxWithoutSubCat) {
              const inv = invMap.get(t.invoiceNo);
              const orig = inv ? origInvMap.get(inv.originalInvoiceNumber) : null;
              let resolvedSub = "";

              if (inv?.lineItems?.length > 0) {
                const cats = inv.lineItems
                  .map(li => (li.itemData?.category || li.category || "").toLowerCase().trim())
                  .filter(Boolean);
                const hasShoe = cats.some(c => c === "shoe" || c.includes("shoe"));
                const hasShirt = cats.some(c => c === "shirt" || c.includes("shirt"));
                if (hasShoe && hasShirt) resolvedSub = "mixed sales return";
                else if (hasShoe) resolvedSub = "shoe sales return";
                else if (hasShirt) resolvedSub = "shirt sales return";
              }

              if (!resolvedSub && orig?.subCategory) {
                const os = orig.subCategory.toLowerCase().trim();
                if (os.includes("shoe")) resolvedSub = "shoe sales return";
                else if (os.includes("shirt")) resolvedSub = "shirt sales return";
                else if (os.includes("mixed")) resolvedSub = "mixed sales return";
                else if (!os.endsWith("return")) resolvedSub = `${os} return`;
                else resolvedSub = os;
              }

              if (!resolvedSub && inv?.subCategory) {
                const is = inv.subCategory.toLowerCase().trim();
                if (is && is !== "general" && is !== "return") {
                  if (is.includes("shoe")) resolvedSub = "shoe sales return";
                  else if (is.includes("shirt")) resolvedSub = "shirt sales return";
                  else if (is.includes("mixed")) resolvedSub = "mixed sales return";
                  else if (!is.endsWith("return")) resolvedSub = `${is} return`;
                  else resolvedSub = is;
                }
              }

              if (!resolvedSub) {
                const text = `${t.remark || ""} ${t.invoiceNo || ""}`.toLowerCase();
                if (text.includes("shoe")) resolvedSub = "shoe sales return";
                else if (text.includes("shirt")) resolvedSub = "shirt sales return";
              }

              if (resolvedSub) {
                t.subCategory = resolvedSub;
                Transaction.updateOne({ _id: t._id }, { $set: { subCategory: resolvedSub } }).catch(() => {});
              }
            }
          } catch (lookupErr) {
            console.error("Error resolving return subCategories:", lookupErr);
          }
        }

        console.log(`   Found ${transactions.length} transactions`);
        
        // ✅ Lightweight logging - only log summary info, not full objects
        if (transactions.length === 0) {
            console.log(`   ⚠️ No transactions found for this query`);
        }

        res.status(200).json({
            data: transactions
        });
    } catch (error) {
        console.error("GetPayment error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
        
    }
};





