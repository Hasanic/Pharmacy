import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";
const AutoIncrement = mongooseSequence(mongoose);

const inventorySchema = new mongoose.Schema(
  {
    medicine_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Medicine",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    expiry_date: {
      type: Date,
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

inventorySchema.plugin(AutoIncrement, {
  inc_field: "unique_id",
  start_seq: 1,
  id: "inventory",
});

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;