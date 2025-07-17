import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";

const AutoIncrement = mongooseSequence(mongoose);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category_id: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Category",
    },
    supplier_id: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Supplier",
    },
    price: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    stock_quantity: {
      type: Number,
      default: 0,
    },
    expiry_date: {
      type: Date,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["Medicine", "Equipment", "Supplement", "Other"],
      default: "Medicine",
    },
    image: {
      type: String,
      default: null,
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

productSchema.plugin(AutoIncrement, {
  inc_field: "unique_id",
  start_seq: 1,
  id: "product",
});

const Product = mongoose.model("Product", productSchema);

export default Product;
