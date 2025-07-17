import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";
const AutoIncrement = mongooseSequence(mongoose);

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    contact_person: {
      type: String,
      required: true,
    },
    country_code: {
      type: Number,
      default: 252,
    },
    phone: {
      type: String,
      required: true,
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

supplierSchema.plugin(AutoIncrement, {
  inc_field: "unique_id",
  start_seq: 1,
  id: "supplier",
});

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;