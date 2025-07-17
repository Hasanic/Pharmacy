import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";
const AutoIncrement = mongooseSequence(mongoose);

const paymentSchema = new mongoose.Schema(
  {
    sale_id: {
      type: mongoose.Schema.ObjectId,
      required: true,
      // ref: "Sale" // Uncomment if you have a Sale model to reference
    },
    method: {
      type: String,
      required: true,
      enum: ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Other"] // Add other payment methods as needed
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    payment_date: {
      type: Date,
      required: true,
      default: Date.now
    },
    user_id: {
      type: mongoose.Schema.ObjectId,
      default: null
    },
    unique_id: Number,
  },
  {
    timestamps: true,
  }
);

paymentSchema.plugin(AutoIncrement, {
  inc_field: "unique_id",
  start_seq: 1,
  id: "payment",
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;