import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";
const AutoIncrement = mongooseSequence(mongoose);

const saleSchema = new mongoose.Schema(
  {
    medicine_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Medicine",
      required: true,
    },
    customer_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Customer",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    total_amount: {
      type: Number,
      required: true,
    },
    remianing: {
      type: Number,
      required: true,
    },
    status: {
      type: Number,
      required: true,
    },
    sale_date: {
      type: Date,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.ObjectId,
      default: null,
    },
    unique_id: Number,
  },
  {
    timestamps: true,
  }
);

// Auto-increment unique_id (starting from 1)
saleSchema.plugin(AutoIncrement, {
  inc_field: "unique_id",
  start_seq: 1,
  id: "sale",
});

const Sale = mongoose.model("Sale", saleSchema);

export default Sale;
