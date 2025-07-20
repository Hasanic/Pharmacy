import Inventory from "../model/inventory.js";
import Medicine from "../model/medicines.js";
import Joi from "joi";
import mongoose from "mongoose";

const inventorySchema = Joi.object({
  medicine_id: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
  expiry_date: Joi.date().greater("now").required(),
});

export const register = async (req, res) => {
  const { error } = inventorySchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const { medicine_id, quantity, expiry_date } = req.body;

    if (!medicine_id || !quantity || !expiry_date) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(medicine_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Pass Valid Medicine Value" });
    }

    const medicineExists = await Medicine.findById(medicine_id);
    if (!medicineExists) {
      return res
        .status(400)
        .json({ success: false, message: "Medicine does not exist" });
    }

    const inventory = new Inventory({
      medicine_id,
      quantity,
      expiry_date,
    });

    await inventory.save();

    res.status(201).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error("Error in Inventory registration:", error);
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
          from: "medicines",
          localField: "medicine_id",
          foreignField: "_id",
          as: "medicine",
        },
      },
      { $unwind: "$medicine" },
      {
        $project: {
          _id: 1,
          medicine_id: 1,
          medicine_name: "$medicine.name",
          quantity: 1,
          expiry_date: 1,
          user_id: 1,
          createdAt: 1,
          updatedAt: 1,
          unique_id: 1,
        },
      },
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

    const Data = await Inventory.aggregate(aggregationPipeline);

    if (!Data || Data.length === 0 || !Data[0].data || Data[0].data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No inventory data found",
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
    const inventoryExist = await Inventory.findOne({ unique_id }).populate(
      "medicine_id",
      "name"
    );

    if (!inventoryExist) {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found.",
      });
    }

    const Data = await Inventory.aggregate([
      { $match: { unique_id: parseInt(unique_id) } },
      {
        $lookup: {
          from: "medicines",
          localField: "medicine_id",
          foreignField: "_id",
          as: "medicine",
        },
      },
      { $unwind: "$medicine" },
      {
        $project: {
          _id: 1,
          medicine_id: 1,
          medicine_name: "$medicine.name",
          quantity: 1,
          expiry_date: 1,
          user_id: 1,
          createdAt: 1,
          updatedAt: 1,
          unique_id: 1,
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
    const inventoryExist = await Inventory.findById(id);

    if (!inventoryExist) {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found.",
      });
    }

    const updatedData = await Inventory.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate("medicine_id", "name");

    res.status(200).json({
      success: true,
      message: "Inventory updated successfully.",
      data: updatedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const id = req.params.id;
    const inventoryExist = await Inventory.findById(id);

    if (!inventoryExist) {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found.",
      });
    }

    await Inventory.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Inventory record deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
