import Category from "../model/categories.js";
import Joi from "joi";
import mongoose from "mongoose";

const categoriesSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
});

export const register = async (req, res) => {
  const { error } = categoriesSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists && categoryExists.name === name) {
      return res.status(400).json({ success: false, message: "Name already exists" });
    }

    const category = new Category({ name });
    await category.save();

    res.status(201).json({
      success: true,
      data: {
        name: category.name,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "unknown error",
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
      { $sort: { _id: 1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
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

    const Data = await Category.aggregate(aggregationPipeline);

    if (!Data || Data.length === 0 || !Data[0].data || Data[0].data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No categories found",
        data: Data[0].data,
      });
    }

    const responseData = Data[0];
    const pages = responseData.pages;
    const currentPage = responseData.currentPage;

    res.status(200).json({
      success: true,
      page: currentPage,
      rows: responseData.total,
      pages: pages,
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

export const GetById = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format." });
    }

    const categoryExist = await Category.findById(_id);
    if (!categoryExist) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    const data = await Category.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(_id) } },
      {
        $project: {
          _id: 1,
          name: 1,
          unique_id: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: data[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const categoryExist = await Category.findById(id);
    if (!categoryExist) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    const updatedData = await Category.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json({
      success: true,
      message: "Category Updated successfully.",
      updatedData,
    });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
  }
};

export const deletecategory = async (req, res) => {
  try {
    const id = req.params.id;
    const categoryExist = await Category.findById(id);
    if (!categoryExist) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    await Category.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
  }
};
