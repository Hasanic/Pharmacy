import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";
const AutoIncrement = mongooseSequence(mongoose);

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    unique_id: Number,
  },
  {
    timestamps: true,
  }
);

customerSchema.plugin(AutoIncrement, {
  inc_field: "unique_id",
  start_seq: 1,
  id: "customer",
});

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;