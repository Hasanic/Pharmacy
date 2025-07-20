import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";
const AutoIncrement = mongooseSequence(mongoose);

const categoriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
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
categoriesSchema.plugin(AutoIncrement, {
  inc_field: "unique_id",
  start_seq: 1,
  id: "category",
});

const Category = mongoose.model("Category", categoriesSchema);

export default Category;
