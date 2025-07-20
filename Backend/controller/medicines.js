import Medicine from "../model/medicines.js";
import Category from "../model/categories.js";
import Joi from "joi";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const medicineSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  category_id: Joi.string().hex().length(24).required(),
  supplier_id: Joi.string().hex().length(24).required(),
  price: Joi.number().min(0).required(),
  unit: Joi.string().required(),
  stock_quantity: Joi.number().min(0).default(0),
  expiry_date: Joi.date().optional().allow(null),
  description: Joi.string().optional().allow("", null),
  type: Joi.string().valid("Tablet", "Capsule", "Syrup", "Injection", "Other").default("Tablet"),
  image: Joi.string().optional().allow("", null),
  user_id: Joi.string().hex().length(24).optional().allow(null),
});

export const createMedicine = async (req, res) => {
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

    const { error } = medicineSchema.validate(payload);
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

    const existingMedicine = await Medicine.findOne({
      name: payload.name,
      category_id: payload.category_id,
    });

    if (existingMedicine) {
      if (uploadedFilePath) {
        fs.unlinkSync(uploadedFilePath);
      }
      return res.status(409).json({
        code: 409,
        status: "Conflict",
        message: "A medicine with this name already exists in this category",
      });
    }

    const medicine = new Medicine(payload);
    await medicine.save();

    res.status(201).json({
      code: 201,
      status: "Created",
      data: medicine,
    });
  } catch (error) {
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }

    if (error.code === 11000 || error.name === "MongoError") {
      return res.status(409).json({
        code: 409,
        status: "Conflict",
        message: "Medicine already exists",
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

export const getAllMedicines = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(process.env.ROWS_PER_PAGE) || 10;
    const skip = (page - 1) * pageSize;

    const [medicines, total] = await Promise.all([
      Medicine.find({})
        .populate("category_id", "name")
        .populate("supplier_id", "name")
        .skip(skip)
        .limit(pageSize)
        .select({
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
        })
        .lean(),
      Medicine.countDocuments(),
    ]);

    if (!medicines || medicines.length === 0) {
      return res.status(404).json({
        code: 404,
        status: "Not Found",
        message: "No medicines found.",
      });
    }

    const imgBaseUrl = process.env.IMAGE_URL || "/uploads/";
    const medicinesWithImage = medicines.map((medicine) => ({
      ...medicine,
      image: medicine.image ? `${imgBaseUrl}${medicine.image}` : null,
    }));

    res.status(200).json({
      code: 200,
      status: "OK",
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      data: medicinesWithImage,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
};

export const getMedicineById = async (req, res) => {
  try {
    const medicineId = req.params.id;
    const medicine = await Medicine.findById(medicineId)
      .populate("category_id", "name")
      .populate("supplier_id", "name")
      .select({
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
      });

    if (!medicine) {
      return res.status(404).json({
        code: 404,
        status: "Not Found",
        message: "Medicine not found.",
      });
    }

    const imgBaseUrl = process.env.IMAGE_URL || "/uploads/";
    const medicineWithImage = {
      ...medicine.toObject(),
      image: medicine.image ? `${imgBaseUrl}${medicine.image}` : null,
    };

    res.status(200).json({
      code: 200,
      status: "OK",
      data: medicineWithImage,
    });
  } catch (error) {
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

export const updateMedicine = async (req, res) => {
  try {
    const medicineId = req.params.id;
    const payload = req.body;

    const { error } = medicineSchema.validate(payload);
    if (error) {
      return res.status(400).json({
        code: 400,
        status: "Bad Request",
        message: error.details[0].message,
      });
    }

    if (req.file) {
      payload.image = req.file.filename;
      const oldMedicine = await Medicine.findById(medicineId);
      if (oldMedicine && oldMedicine.image) {
        const oldImagePath = path.join(__dirname, "../uploads", oldMedicine.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(medicineId, payload, {
      new: true,
    });

    if (!updatedMedicine) {
      return res.status(404).json({
        code: 404,
        status: "Not Found",
        message: "Medicine not found.",
      });
    }

    res.status(200).json({
      code: 200,
      status: "OK",
      data: updatedMedicine,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    const medicineId = req.params.id;
    const medicine = await Medicine.findByIdAndDelete(medicineId);

    if (!medicine) {
      return res.status(404).json({
        code: 404,
        status: "Not Found",
        message: "Medicine not found.",
      });
    }

    if (medicine.image) {
      const imagePath = path.join(__dirname, "../uploads", medicine.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(200).json({
      code: 200,
      status: "OK",
      message: "Medicine deleted successfully",
    });
  } catch (error) {
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
