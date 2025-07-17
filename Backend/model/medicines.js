import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";
const AutoIncrement = mongooseSequence(mongoose);

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category_id: {
      type: mongoose.Schema.ObjectId,
      // ref: "Category",
      required: true,
    },
    supplier_id: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    description: {
      type: String,
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

medicineSchema.plugin(AutoIncrement, {
  inc_field: "unique_id",
  start_seq: 1,
  id: "medicine",
});

const Medicine = mongoose.model("Medicine", medicineSchema);

export default Medicine;