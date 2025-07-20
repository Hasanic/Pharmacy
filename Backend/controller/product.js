import Product from "../model/Product.js";
import Joi from "joi";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const productSchema = Joi.object({
  name: Joi.string().required(),
  category_id: Joi.string().hex().length(24).required(),
  supplier_id: Joi.string().hex().length(24).required(),
  price: Joi.number().required().min(0),
  unit: Joi.string().required(),
  stock_quantity: Joi.number().min(0).default(0),
  expiry_date: Joi.date().optional().allow(null),
  description: Joi.string().optional().allow("", null),
  type: Joi.string().valid("Medicine", "Equipment", "Supplement", "Other").default("Medicine"),
  image: Joi.string().optional().allow("", null),
  user_id: Joi.string().hex().length(24).optional().allow(null),
});

export const createProduct = async (req, res) => {
  let uploadedFilePath = null;
  try {
    const payload = {
      ...req.body,
      price: parseFloat(req.body.price),
      stock_quantity: parseInt(req.body.stock_quantity) || 0,
      expiry_date: req.body.expiry_date ? new Date(req.body.expiry_date) : null,
    };

    if (req.file) {
      payload.image = req.file.filename;
      uploadedFilePath = path.join(req.file.destination, req.file.filename);
    }

    const { error } = productSchema.validate(payload);
    if (error) {
      if (uploadedFilePath) {
        fs.unlinkSync(uploadedFilePath);
      }
      return res.status(400).json({
        code: 400,
        status: "Bad Request",
        message: error.details[0].message,
      });
    }

    const existingProduct = await Product.findOne({
      name: payload.name,
      category_id: payload.category_id,
      supplier_id: payload.supplier_id,
    });

    if (existingProduct) {
      if (uploadedFilePath) {
        fs.unlinkSync(uploadedFilePath);
      }
      return res.status(409).json({
        code: 409,
        status: "Conflict",
        message: "A product with this name already exists for the same category and supplier",
      });
    }

    const product = new Product(payload);
    await product.save();

    res.status(201).json({
      code: 201,
      status: "Created",
      data: product,
    });
  } catch (error) {
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }

    if (error.code === 11000 || error.name === "MongoError") {
      return res.status(409).json({
        code: 409,
        status: "Conflict",
        message: "Product already exists",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        code: 400,
        status: "Bad Request",
        message: "Invalid ID format",
      });
    }

    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category_id", "name")
      .populate("supplier_id", "name")
      .select({ __v: 0, createdAt: 0, updatedAt: 0, unique_id: 0 })
      .lean();

    if (!products || products.length === 0) {
      return res.status(404).json({
        code: 404,
        status: "Not Found",
        message: "No products found.",
      });
    }

    const imgBaseUrl = process.env.IMAGE_URL || "/uploads/";
    const productsWithImage = products.map((product) => ({
      ...product,
      image: product.image ? `${imgBaseUrl}${product.image}` : null,
    }));

    res.status(200).json({
      code: 200,
      status: "OK",
      data: productsWithImage,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId)
      .populate("category_id", "name")
      .populate("supplier_id", "name")
      .select({ __v: 0, createdAt: 0, updatedAt: 0, unique_id: 0 });

    if (!product) {
      return res.status(404).json({
        code: 404,
        status: "Not Found",
        message: "Product not found.",
      });
    }

    const imgBaseUrl = process.env.IMAGE_URL || "/uploads/";
    const productWithImage = {
      ...product.toObject(),
      image: product.image ? `${imgBaseUrl}${product.image}` : null,
    };

    res.status(200).json({
      code: 200,
      status: "OK",
      data: productWithImage,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const payload = req.body;

    const { error } = productSchema.validate(payload);
    if (error) {
      return res.status(400).json({
        code: 400,
        status: "Bad Request",
        message: error.details[0].message,
      });
    }

    if (req.file) {
      payload.image = req.file.filename;
      const oldProduct = await Product.findById(productId);
      if (oldProduct && oldProduct.image) {
        const oldImagePath = path.join(__dirname, "../uploads", oldProduct.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, payload, {
      new: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({
        code: 404,
        status: "Not Found",
        message: "Product not found.",
      });
    }

    res.status(200).json({
      code: 200,
      status: "OK",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({
        code: 404,
        status: "Not Found",
        message: "Product not found.",
      });
    }

    if (product.image) {
      const imagePath = path.join(__dirname, "../uploads", product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(200).json({
      code: 200,
      status: "OK",
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
};
