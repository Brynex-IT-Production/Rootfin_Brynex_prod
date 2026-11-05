// import mongoose from "mongoose";

// const transactionSchema = new mongoose.Schema(
//   {
//     type: {
//       type: String,
//       required: true,
//     },
//     invoiceNo: {
//       type: String,
//       required: true,
//       unique: true
//     },
//     category: {
//       type: String,
//       required: true,

//     },
//     remark: {
//       type: String,
//       default: "",
//     },
//     billValue: {
//   type: Number,
//   default: 0,
// },
//     amount: {
//       type: String,
//       required: true,
//     },
//     cash: {
//       type: String,
//       required: true,
//     },
//     bank: {
//       type: String,
//       required: true,
//     },
//     upi: {
//       type: String,
//       required: true,
//     },
//     paymentMethod: {
//       type: String,
//       enum: ["cash", "bank", "upi", "split"],
//       required: true,
//     },
//     date: {
//       type: Date,
//       required: true,
//     },
//     locCode: {
//       type: String,
//       required: true,
//     },
//     quantity: {
//       type: String,
//       default: ""
//     },

//     // ✅ NEW FIELD
//     customerName: {
//       type: String,
//       default: "", // optional fallback
//     },
//     securityAmount: 
//     { type: Number,
//        default: 0 },

// Balance:
//  { type: Number, 
//   default: 0 },


//   subCategory1: {
//   type: String,
//   default: "",   // ← helps prevent undefined values
// },

// totalTransaction: {
//   type: Number,
//   default: 0
// },



//   },
//   { timestamps: true }
// );


// const Transaction = mongoose.model("Transaction", transactionSchema);
// export default Transaction;



import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type:         { type: String, required: true },

    invoiceNo:    { type: String, required: true },

    category:     { type: String, required: true },
    subCategory:  { type: String, default: "" }, // Added missing subCategory field
    expenseType:  { type: String, default: "" }, // "direct" | "indirect"
    entryType:    { type: String, default: "" }, // "branch_entry" | "accountant_entry"

    remark:       { type: String, default: "" },

    billValue:    { type: Number, default: 0 },

    amount:       { type: String,  required: true },

    cash:         { type: String,  required: true },
    rbl:          { type: String,  default: "0" },
    bank:         { type: String,  required: true },
    upi:          { type: String,  required: true },

    paymentMethod:{ type: String,  enum: ["cash","bank","upi","split"], required: true },
    bankAccount:  { type: String,  default: "" },

    date:         { type: Date,    required: true },

    locCode:      { type: String,  required: true },

    quantity:     { type: String,  default: "" },

    /* existing extras */
    customerName:    { type: String, default: "" },
    securityAmount:  { type: Number, default: 0 },
    Balance:         { type: Number, default: 0 },
    subCategory1:    { type: String, default: "" },
    totalTransaction:{ type: Number, default: 0 },
    discountAmount:  { type: Number, default: 0 },

    /* Edit tracking fields */
    editedBy:     { type: String },
    editedAt:     { type: Date },
    editReason:   { type: String, default: "" },
    
    isAdminLevel: { type: Boolean, default: false },

    /* 🔺 NEW – stores the uploaded file inside MongoDB */
    attachment: {
      filename:    { type: String },
      contentType: { type: String },
      data:        { type: Buffer }   // binary data (base-64 decoded)
    }
  },
  { timestamps: true }
);

// Compound index for GetPayment queries (locCode + date) — biggest perf win
transactionSchema.index({ locCode: 1, date: -1 });
// Date-only index for admin queries across all stores
transactionSchema.index({ date: -1 });
// Index for getEditedTransactions query (locCode + date + editedBy exists)
transactionSchema.index({ locCode: 1, date: -1, editedBy: 1 });
// Compound unique index: one record per invoiceNo+locCode+type (allows Booking and RentOut with same invoiceNo)
transactionSchema.index({ invoiceNo: 1, locCode: 1, type: 1 }, { unique: true, sparse: true });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
