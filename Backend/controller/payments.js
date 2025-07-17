import Payment from "../model/payments.js";
import Sale from "../model/sales.js";
import Joi from "joi";
import mongoose from "mongoose";
import * as utility from "../utilities.js";

const paymentSchema = Joi.object({
  sale_id: Joi.string().required(),
  method: Joi.string()
    .valid("Cash", "Credit Card", "Debit Card", "Bank Transfer", "Other")
    .required(),
  amount: Joi.number().min(0).required(),
  payment_date: Joi.date().optional(),
});

export const register = async (req, res) => {
  const { error } = paymentSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const { sale_id, method, amount, payment_date } = req.body;

    // Validate input
    if (!sale_id || !method || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(sale_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Pass Valid Sale Value" });
    }

    // Check if sale exists
    const saleExists = await Sale.findById(sale_id);
    if (!saleExists) {
      return res
        .status(400)
        .json({ success: false, message: "Sale does not exist" });
    }

    if (saleExists.remianing < amount) {
      return res.status(400).json({
        success: false,
        message: "Amount mus equla or less then remaining",
      });
    }
    let remianing = saleExists.remianing - amount;
    let status = utility.STATUS_SALES.INVOICE;
    if (remianing == 0) {
      status = utility.STATUS_SALES.PAID;
    }

    const slaes = await Sale.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(sale_id) },
      { $set: { status, remianing } }
    );
    // Create new
    if (slaes) {
      const payment = new Payment({
        sale_id,
        method,
        amount,
        payment_date: payment_date || new Date(),
      });

      await payment.save();

      // Return data
      return res.status(201).json({
        success: true,
        data: payment,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "failed to Pay",
      });
    }
  } catch (error) {
    console.error("Error in Payment registration:", error);
    res.status(500).json({
      success: false,
      message: "Unknown error occurred",
      error: error.message,
    });
  }
};

export const getById = async (req, res) => {
  try {
    const unique_id = req.params.unique_id;
    const paymentExist = await Payment.findOne({ unique_id }).populate(
      "sale_id",
      "reference_number" // Adjust based on your Sale model
    );

    if (!paymentExist) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    const Data = await Payment.aggregate([
      {
        $match: { unique_id: parseInt(unique_id) },
      },
      {
        $lookup: {
          from: "sales",
          localField: "sale_id",
          foreignField: "_id",
          as: "sale",
        },
      },
      {
        $unwind: "$sale",
      },
      {
        $project: {
          _id: 1,
          sale_id: 1,
          method: 1,
          amount: 1,
          payment_date: 1,
          createdAt: 1,
          updatedAt: 1,
          unique_id: 1,
          sale_reference: "$sale.reference_number",
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
    const unique_id = req.params.unique_id;
    const paymentExist = await Payment.findOne({ unique_id });

    if (!paymentExist) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    const updatedData = await Payment.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate("sale_id", "reference_number");

    res.status(200).json({
      success: true,
      message: "Payment updated successfully.",
      data: updatedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const id = req.params.id;
    const paymentExist = await Payment.findById(id);

    if (!paymentExist) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    await Payment.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Payment deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $lookup: {
          from: "sales",
          localField: "sale_id",
          foreignField: "_id",
          as: "sale",
        },
      },
      {
        $unwind: "$sale",
      },
      {
        $project: {
          _id: 1,
          sale_id: 1,
          method: 1,
          amount: 1,
          payment_date: 1,
          createdAt: 1,
          updatedAt: 1,
          unique_id: 1,
          sale_reference: "$sale.reference_number",
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

    const Data = await Payment.aggregate(aggregationPipeline);

    if (
      !Data ||
      Data.length === 0 ||
      !Data[0].data ||
      Data[0].data.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "No payment records found",
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
