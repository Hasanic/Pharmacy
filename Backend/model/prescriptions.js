import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";
const AutoIncrement = mongooseSequence(mongoose);

const prescriptionSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    doctor_id: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    notes: {
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

prescriptionSchema.plugin(AutoIncrement, {
  inc_field: "unique_id",
  start_seq: 1,
  id: "prescription",
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;