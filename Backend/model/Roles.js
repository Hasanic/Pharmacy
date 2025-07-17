import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";
const AutoIncrement = mongooseSequence(mongoose);

const rolesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, 
      unique: true, 
    },
    user_id: {
      type: mongoose.Schema.ObjectId,
      default:null
    },
    unique_id: Number,
  },
  {
    timestamps: true,
  }
);



rolesSchema.plugin(AutoIncrement, {
  inc_field: "unique_id",
  start_seq: 1,
  id: "roles",
});

const Roles = mongoose.model("Roles", rolesSchema);

export default Roles;
