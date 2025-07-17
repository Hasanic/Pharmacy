import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";
const AutoIncrement = mongooseSequence(mongoose);

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    unique_id: Number,
  },
  {
    timestamps: true,
  }
);

doctorSchema.plugin(AutoIncrement, {
  inc_field: "unique_id",
  start_seq: 1,
  id: "doctor",
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;