import Customer from "../model/customers.js";
import Joi from "joi";
import mongoose from "mongoose";

const customerSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  phone: Joi.string().min(7).max(15).required(),
  address: Joi.string().min(5).max(200).required(),
});

export const register = async (req, res) => {
  const { error } = customerSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const { name, phone, address } = req.body;

    if (!name || !phone || !address) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const customerExists = await Customer.findOne({
      $or: [{ name }, { phone }],
    });

    if (customerExists) {
      if (customerExists.name === name) {
        return res.status(400).json({ success: false, message: "Name already exists" });
      }
      if (customerExists.phone === phone) {
        return res.status(400).json({ success: false, message: "Phone number already exists" });
      }
    }

    const customer = new Customer({ name, phone, address });
    await customer.save();

    res.status(201).json({
      success: true,
      data: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
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

    const Data = await Customer.aggregate(aggregationPipeline);

    if (!Data || Data.length === 0 || !Data[0].data || Data[0].data.length === 0) {
      return res.status(404).json({ success: false, message: "No customers found" });
    }

    const responseData = Data[0];

    res.status(200).json({
      success: true,
      page: responseData.currentPage,
      rows: responseData.total,
      pages: responseData.totalPages,
      pageSize,
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
    const { _id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format." });
    }

    const customerExist = await Customer.findById(_id);
    if (!customerExist) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    const data = await Customer.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(_id) } },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          unique_id: 1,
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
    const customerExist = await Customer.findById(id);
    if (!customerExist) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    const updatedData = await Customer.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json({
      success: true,
      message: "Customer updated successfully.",
      updatedData,
    });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const id = req.params.id;
    const customerExist = await Customer.findById(id);
    if (!customerExist) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    await Customer.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Customer deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
  }
};
