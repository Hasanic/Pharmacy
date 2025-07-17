import Medicine from "../model/medicines.js";
import Category from "../model/categories.js";
import Joi from "joi";
import mongoose from "mongoose";

const medicineSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  category_id: Joi.string().required(),
  supplier_id: Joi.string().required(),
  price: Joi.number().min(0).required(),
  unit: Joi.string().required(),
  description: Joi.string().allow("").optional(),
});

export const register = async (req, res) => {
  const { error } = medicineSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const { name, category_id, supplier_id, price, unit, description } =
      req.body;

    // Validate input
    if (!name || !category_id || !supplier_id || !price || !unit) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(category_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Pass Valid Category Vlaue" });
    }
    if (!mongoose.Types.ObjectId.isValid(supplier_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Pass Valid Suplier Vlaue" });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category_id);
    if (!categoryExists) {
      return res
        .status(400)
        .json({ success: false, message: "Category does not exist" });
    }

    // Check if medicine exists
    const medicineExists = await Medicine.findOne({ name });
    if (medicineExists) {
      return res
        .status(400)
        .json({ success: false, message: "Medicine name already exists" });
    }

    // Create new medicine
    const medicine = new Medicine({
      name,
      category_id,
      supplier_id,
      price,
      unit,
      description: description || "",
    });

    await medicine.save();

    // Return data
    res.status(201).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    console.error("Error in Medicine registration:", error);
    res.status(500).json({
      success: false,
      message: "Unknown error occurred",
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
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $lookup: {
          from: "suppliers",
          localField: "supplier_id",
          foreignField: "_id",
          as: "suppliers",
        },
      },
      {
        $unwind: "$suppliers",
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                name: 1,
                price: 1,
                unit: 1,
                description: 1,
                user_id: 1,
                createdAt: 1,
                updatedAt: 1,
                unique_id: 1,
                category: "$category.name",
                supplier: "$suppliers.name",
              },
            },
          ],
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

    const Data = await Medicine.aggregate(aggregationPipeline);

    if (
      !Data ||
      Data.length === 0 ||
      !Data[0].data ||
      Data[0].data.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "No Medicine data found",
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
    const medicineExist = await Medicine.findOne({ unique_id }).populate(
      "category_id",
      "name"
    );

    if (!medicineExist) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found.",
      });
    }
    const Data = await Medicine.aggregate([
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $lookup: {
          from: "suppliers",
          localField: "supplier_id",
          foreignField: "_id",
          as: "suppliers",
        },
      },
      {
        $unwind: "$suppliers",
      },
      {
        $project: {
          _id: 1,

          name: 1,

          price: 1,
          unit: 1,
          description: 1,
          user_id: 1,
          createdAt: 1,
          updatedAt: 1,
          unique_id: 1,
          category: "$category.name",
          supplier: "$suppliers.name",
        },
      },
      {
        $group: {
          _id: null,
          row: { $sum: 1 },
          data: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          row: 1,
          data: 1,
        },
      },
    ]);
    res.status(200).json({
      success: true,
      data: Data[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const medicineExist = await Medicine.findById(id);

    if (!medicineExist) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found.",
      });
    }

    const updatedData = await Medicine.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate("category_id", "name");

    res.status(200).json({
      success: true,
      message: "Medicine updated successfully.",
      data: updatedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    const id = req.params.id;
    const medicineExist = await Medicine.findById(id);

    if (!medicineExist) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found.",
      });
    }

    await Medicine.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Medicine deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
