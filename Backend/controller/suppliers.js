import Supplier from "../model/suppliers.js";
import Joi from "joi";
import * as utility from "../utilities.js";

const supplierSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  contact_person: Joi.string()
    .pattern(/^\d{9}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Contact Person number must contain only digits (0-9)",
    }),
  phone: Joi.string()
    .pattern(/^\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must contain only digits (0-9)",
    }),
});

export const register = async (req, res) => {
  const { error } = supplierSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const { name, contact_person, phone } = req.body;

    const existingSupplier = await Supplier.findOne({
      $or: [{ name }, { phone }, { contact_person }],
    });

    if (existingSupplier) {
      if (existingSupplier.name === name) {
        return res
          .status(400)
          .json({ success: false, message: "Supplier name already exists" });
      }
      if (existingSupplier.phone === phone) {
        return res
          .status(400)
          .json({ success: false, message: "Phone number already exists" });
      }
      if (existingSupplier.contact_person === contact_person) {
        return res
          .status(400)
          .json({ success: false, message: "Contact Person already exists" });
      }
    }

    const supplier = new Supplier({ name, contact_person, phone });
    await supplier.save();

    res.status(201).json({
      success: true,
      data: {
        name: supplier.name,
        contact_person:
          "+" + supplier.country_code + "" + supplier.contact_person,
        phone: "+" + supplier.country_code + "" + supplier.phone,
        unique_id: supplier.unique_id,
      },
    });
  } catch (error) {
    console.error("Error in Supplier registration:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const pageSize = parseInt(process.env.rows_per_page) || 10;

    const skip = page === 0 ? 0 : (page - 1) * pageSize;
    const limit = page === 0 ? page : pageSize;

    const aggregationPipeline = [
      { $sort: { _id: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
      {
        $project: {
          data: 1,
          total: { $arrayElemAt: ["$metadata.total", 0] },
          currentPage: { $literal: page },
          totalPages: {
            $ceil: {
              $divide: [{ $arrayElemAt: ["$metadata.total", 0] }, pageSize],
            },
          },
        },
      },
    ];

    const Data = await Supplier.aggregate(aggregationPipeline);

    if (
      !Data ||
      Data.length === 0 ||
      !Data[0].data ||
      Data[0].data.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "No suppliers found",
      });
    }

    const responseData = Data[0];

    res.status(200).json({
      success: true,
      page: responseData.currentPage,
      rows: responseData.total,
      pages: responseData.totalPages,
      pageSize: pageSize,
      data: responseData.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getById = async (req, res) => {
  try {
    const unique_id = req.params.unique_id;
    const supplierExist = await Supplier.findOne({ unique_id });

    if (!supplierExist) {
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found." });
    }

    res.status(200).json({ success: true, data: supplierExist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const supplierExist = await Supplier.findById(id);

    if (!supplierExist) {
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found." });
    }

    const { error } = supplierSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const updatedData = await Supplier.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Supplier updated successfully.",
      data: updatedData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const id = req.params.id;
    const supplierExist = await Supplier.findById(id);

    if (!supplierExist) {
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found." });
    }

    await Supplier.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Supplier deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
