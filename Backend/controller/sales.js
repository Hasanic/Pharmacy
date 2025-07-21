// import Sale from "../model/sales.js";
// import Medicine from "../model/medicines.js";
// import Customer from "../model/customers.js";
// import Joi from "joi";
// import mongoose from "mongoose";
// import * as utility from "../utilities.js";
// import Payment from "../model/payments.js";

// const saleSchema = Joi.object({
//   medicine_id: Joi.string().required(),
//   customer_id: Joi.string().required(),
//   quantity: Joi.number().min(1).required(),
//   sale_date: Joi.date().required(),
// });

// export const register = async (req, res) => {
//   const { error } = saleSchema.validate(req.body);

//   if (error) {
//     return res
//       .status(400)
//       .json({ success: false, message: error.details[0].message });
//   }

//   try {
//     const { medicine_id, customer_id, quantity, sale_date } = req.body;
//     if (!medicine_id || !customer_id || !quantity || !sale_date) {
//       return res.status(400).json({
//         success: false,
//         message: "All required fields must be provided",
//       });
//     }
//     if (!mongoose.Types.ObjectId.isValid(medicine_id)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid Medicine ID" });
//     }
//     if (!mongoose.Types.ObjectId.isValid(customer_id)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid Customer ID" });
//     }
//     const medicine = await Medicine.findById(medicine_id);
//     if (!medicine) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Medicine not found" });
//     }
//     const customerExists = await Customer.findById(customer_id);
//     if (!customerExists) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Customer not found" });
//     }
//     const total_amount = medicine.price * quantity;
//     const remianing = medicine.price * quantity;

//     const sale = new Sale({
//       medicine_id,
//       customer_id,
//       quantity,
//       total_amount,
//       remianing,
//       status: utility.STATUS_SALES.INVOICE,
//       sale_date,
//     });

//     await sale.save();

//     res.status(201).json({
//       success: true,
//       data: sale,
//     });
//   } catch (error) {
//     console.error("Error in Sale registration:", error);
//     res.status(500).json({
//       success: false,
//       message: "Unknown error occurred",
//       error: error.message,
//     });
//   }
// };

// export const getAll = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page);
//     const pageSize = parseInt(process.env.rows_per_page) || 10;

//     const skip = page === 0 ? 0 : (page - 1) * pageSize;
//     const limit = page === 0 ? page : pageSize;

//     const aggregationPipeline = [
//       { $sort: { _id: -1 } },
//       {
//         $lookup: {
//           from: "medicines",
//           localField: "medicine_id",
//           foreignField: "_id",
//           as: "medicine",
//         },
//       },
//       {
//         $unwind: "$medicine",
//       },
//       {
//         $lookup: {
//           from: "customers",
//           localField: "customer_id",
//           foreignField: "_id",
//           as: "customer",
//         },
//       },
//       {
//         $unwind: "$customer",
//       },
//       {
//         $facet: {
//           metadata: [{ $count: "total" }],
//           data: [
//             { $skip: skip },
//             { $limit: limit },
//             {
//               $project: {
//                 _id: 1,
//                 medicine_id: 1,
//                 customer_id: 1,
//                 quantity: 1,
//                 total_amount: 1,
//                 sale_date: 1,
//                 unique_id: 1,
//                 status: 1,
//                 remianing: 1,
//                 medicine_name: "$medicine.name",
//                 customer_name: "$customer.name",
//                 unit_price: "$medicine.price",
//               },
//             },
//           ],
//         },
//       },
//       {
//         $project: {
//           data: 1,
//           total: { $arrayElemAt: ["$metadata.total", 0] },
//           currentPage: { $literal: page },
//           totalPages: {
//             $ceil: {
//               $divide: [{ $arrayElemAt: ["$metadata.total", 0] }, pageSize],
//             },
//           },
//         },
//       },
//     ];

//     const Data = await Sale.aggregate(aggregationPipeline);

//     if (
//       !Data ||
//       Data.length === 0 ||
//       !Data[0].data ||
//       Data[0].data.length === 0
//     ) {
//       return res.status(404).json({
//         success: false,
//         message: "No Sales data found",
//       });
//     }

//     const responseData = Data[0];

//     res.status(200).json({
//       success: true,
//       page: responseData.currentPage,
//       rows: responseData.total,
//       pages: responseData.totalPages,
//       pageSize: pageSize,
//       data: responseData.data,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// };

// export const getById = async (req, res) => {
//   try {
//     const unique_id = req.params.unique_id;
//     const saleExist = await Sale.findOne({ unique_id });

//     if (!saleExist) {
//       return res.status(404).json({
//         success: false,
//         message: "Sale not found.",
//       });
//     }

//     const Data = await Sale.aggregate([
//       {
//         $match: { unique_id: parseInt(unique_id) },
//       },
//       {
//         $lookup: {
//           from: "medicines",
//           localField: "medicine_id",
//           foreignField: "_id",
//           as: "medicine",
//         },
//       },
//       {
//         $unwind: "$medicine",
//       },
//       {
//         $lookup: {
//           from: "customers",
//           localField: "customer_id",
//           foreignField: "_id",
//           as: "customer",
//         },
//       },
//       {
//         $unwind: "$customer",
//       },
//       {
//         $project: {
//           _id: 1,
//           medicine_id: 1,
//           customer_id: 1,
//           quantity: 1,
//           total_amount: 1,
//           sale_date: 1,
//           medicine_name: "$medicine.name",
//           customer_name: "$customer.name",
//           unit_price: "$medicine.price",
//         },
//       },
//     ]);

//     res.status(200).json({
//       success: true,
//       data: Data[0],
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const update = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const saleExist = await Sale.findById(id);

//     if (!saleExist) {
//       return res.status(404).json({
//         success: false,
//         message: "Sale not found.",
//       });
//     }

//     if (req.body.quantity || req.body.medicine_id) {
//       const medicine_id = req.body.medicine_id || saleExist.medicine_id;
//       const quantity = req.body.quantity || saleExist.quantity;

//       const medicine = await Medicine.findById(medicine_id);
//       if (!medicine) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Medicine not found" });
//       }

//       req.body.total_amount = medicine.price * quantity;
//     }
//     const tran = Payment.findOne({ sale_id: new mongoose.Types.ObjectId(id) });
//     if (tran) {
//       return res.status(400).json({
//         success: false,
//         message: "There is Transection So Can't Be Changed.",
//       });
//     }

//     const updatedData = await Sale.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });

//     res.status(200).json({
//       success: true,
//       message: "Sale updated successfully.",
//       data: updatedData,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// export const deleteSale = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const saleExist = await Sale.findById(id);

//     if (!saleExist) {
//       return res.status(404).json({
//         success: false,
//         message: "Sale not found.",
//       });
//     }

//     await Sale.findByIdAndDelete(id);
//     res.status(200).json({
//       success: true,
//       message: "Sale deleted successfully.",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// export const getAllPaid = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page);
//     const pageSize = parseInt(process.env.rows_per_page) || 10;

//     const skip = page === 0 ? 0 : (page - 1) * pageSize;
//     const limit = page === 0 ? page : pageSize;

//     const aggregationPipeline = [
//       {
//         $match: { status: utility.STATUS_SALES.PAID },
//       },
//       {
//         $sort: { _id: -1 },
//       },
//       {
//         $lookup: {
//           from: "medicines",
//           localField: "medicine_id",
//           foreignField: "_id",
//           as: "medicine",
//         },
//       },
//       {
//         $unwind: "$medicine",
//       },
//       {
//         $lookup: {
//           from: "customers",
//           localField: "customer_id",
//           foreignField: "_id",
//           as: "customer",
//         },
//       },
//       {
//         $unwind: "$customer",
//       },
//       {
//         $facet: {
//           metadata: [{ $count: "total" }],
//           data: [
//             { $skip: skip },
//             { $limit: limit },
//             {
//               $project: {
//                 _id: 1,
//                 medicine_id: 1,
//                 customer_id: 1,
//                 quantity: 1,
//                 total_amount: 1,
//                 sale_date: 1,
//                 unique_id: 1,
//                 status: 1,
//                 remaining: 1,
//                 medicine_name: "$medicine.name",
//                 customer_name: "$customer.name",
//                 unit_price: "$medicine.price",
//               },
//             },
//           ],
//         },
//       },
//       {
//         $project: {
//           data: 1,
//           total: { $arrayElemAt: ["$metadata.total", 0] },
//           currentPage: { $literal: page },
//           totalPages: {
//             $ceil: {
//               $divide: [{ $arrayElemAt: ["$metadata.total", 0] }, pageSize],
//             },
//           },
//         },
//       },
//     ];

//     const Data = await Sale.aggregate(aggregationPipeline);

//     if (
//       !Data ||
//       Data.length === 0 ||
//       !Data[0].data ||
//       Data[0].data.length === 0
//     ) {
//       return res.status(404).json({
//         success: false,
//         message: "No paid sales data found",
//       });
//     }

//     const responseData = Data[0];

//     res.status(200).json({
//       success: true,
//       page: responseData.currentPage,
//       rows: responseData.total,
//       pages: responseData.totalPages,
//       pageSize: pageSize,
//       data: responseData.data,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// };

// export const getAllInvoice = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page);
//     const pageSize = parseInt(process.env.rows_per_page) || 10;

//     const skip = page === 0 ? 0 : (page - 1) * pageSize;
//     const limit = page === 0 ? page : pageSize;

//     const aggregationPipeline = [
//       {
//         $match: { status: utility.STATUS_SALES.INVOICE },
//       },
//       {
//         $sort: { _id: -1 },
//       },
//       {
//         $lookup: {
//           from: "medicines",
//           localField: "medicine_id",
//           foreignField: "_id",
//           as: "medicine",
//         },
//       },
//       {
//         $unwind: "$medicine",
//       },
//       {
//         $lookup: {
//           from: "customers",
//           localField: "customer_id",
//           foreignField: "_id",
//           as: "customer",
//         },
//       },
//       {
//         $unwind: "$customer",
//       },
//       {
//         $facet: {
//           metadata: [{ $count: "total" }],
//           data: [
//             { $skip: skip },
//             { $limit: limit },
//             {
//               $project: {
//                 _id: 1,
//                 medicine_id: 1,
//                 customer_id: 1,
//                 quantity: 1,
//                 total_amount: 1,
//                 sale_date: 1,
//                 unique_id: 1,
//                 status: 1,
//                 remaining: 1,
//                 medicine_name: "$medicine.name",
//                 customer_name: "$customer.name",
//                 unit_price: "$medicine.price",
//               },
//             },
//           ],
//         },
//       },
//       {
//         $project: {
//           data: 1,
//           total: { $arrayElemAt: ["$metadata.total", 0] },
//           currentPage: { $literal: page },
//           totalPages: {
//             $ceil: {
//               $divide: [{ $arrayElemAt: ["$metadata.total", 0] }, pageSize],
//             },
//           },
//         },
//       },
//     ];

//     const Data = await Sale.aggregate(aggregationPipeline);

//     if (
//       !Data ||
//       Data.length === 0 ||
//       !Data[0].data ||
//       Data[0].data.length === 0
//     ) {
//       return res.status(404).json({
//         success: false,
//         message: "No invoice sales found",
//       });
//     }

//     const responseData = Data[0];

//     res.status(200).json({
//       success: true,
//       page: responseData.currentPage,
//       rows: responseData.total,
//       pages: responseData.totalPages,
//       pageSize: pageSize,
//       data: responseData.data,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// };

// export const getSalesByDate = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.body;
//     const page = parseInt(req.query.page);
//     const pageSize = parseInt(process.env.rows_per_page) || 10;

//     const skip = page === 0 ? 0 : (page - 1) * pageSize;
//     const limit = page === 0 ? page : pageSize;

//     if (!startDate || !endDate) {
//       return res.status(400).json({
//         success: false,
//         message: "Both startDate and endDate parameters are required",
//       });
//     }

//     const start = new Date(startDate);
//     const end = new Date(endDate);

//     if (isNaN(start.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid startDate format. Please use YYYY-MM-DD",
//       });
//     }
//     if (isNaN(end.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid endDate format. Please use YYYY-MM-DD",
//       });
//     }

//     end.setHours(23, 59, 59, 999);

//     const aggregationPipeline = [
//       {
//         $match: {
//           sale_date: {
//             $gte: start,
//             $lte: end,
//           },
//         },
//       },
//       { $sort: { sale_date: -1 } },
//       {
//         $lookup: {
//           from: "medicines",
//           localField: "medicine_id",
//           foreignField: "_id",
//           as: "medicine",
//         },
//       },
//       { $unwind: "$medicine" },
//       {
//         $lookup: {
//           from: "customers",
//           localField: "customer_id",
//           foreignField: "_id",
//           as: "customer",
//         },
//       },
//       { $unwind: "$customer" },
//       {
//         $project: {
//           _id: 1,
//           medicine_id: 1,
//           customer_id: 1,
//           quantity: 1,
//           total_amount: 1,
//           remianing: 1,
//           status: 1,
//           sale_date: 1,
//           unique_id: 1,
//           medicine_name: "$medicine.name",
//           customer_name: "$customer.name",
//           unit_price: "$medicine.price",
//         },
//       },
//       {
//         $facet: {
//           metadata: [{ $count: "total" }],
//           data: [{ $skip: skip }, { $limit: limit }],
//         },
//       },
//       {
//         $project: {
//           data: 1,
//           total: { $arrayElemAt: ["$metadata.total", 0] },
//           currentPage: { $literal: page },
//           totalPages: {
//             $ceil: {
//               $divide: [{ $arrayElemAt: ["$metadata.total", 0] }, pageSize],
//             },
//           },
//         },
//       },
//     ];

//     const Data = await Sale.aggregate(aggregationPipeline);

//     if (
//       !Data ||
//       Data.length === 0 ||
//       !Data[0].data ||
//       Data[0].data.length === 0
//     ) {
//       return res.status(404).json({
//         success: false,
//         message: "No sales data found for the specified date range",
//       });
//     }

//     const responseData = Data[0];

//     res.status(200).json({
//       success: true,
//       page: responseData.currentPage,
//       rows: responseData.total,
//       pages: responseData.totalPages,
//       pageSize: pageSize,
//       data: responseData.data,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// };
import Sale from "../model/sales.js";
import Medicine from "../model/medicines.js";
import Customer from "../model/customers.js";
import Joi from "joi";
import mongoose from "mongoose";
import * as utility from "../utilities.js";
import Payment from "../model/payments.js";

const saleSchema = Joi.object({
  medicine_id: Joi.string().required(),
  customer_id: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
  sale_date: Joi.date().required(),
});

export const register = async (req, res) => {
  const { error } = saleSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const { medicine_id, customer_id, quantity, sale_date } = req.body;
    
    if (!medicine_id || !customer_id || !quantity || !sale_date) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(medicine_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Medicine ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(customer_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Customer ID" });
    }
    
    const medicine = await Medicine.findById(medicine_id);
    if (!medicine) {
      return res
        .status(404)
        .json({ success: false, message: "Medicine not found" });
    }
    
    if (quantity > medicine.stock_quantity) {
      return res.status(400).json({
        success: false,
        message: `Quantity is more than stock.: ${medicine.stock_quantity}`,
      });
    }
    
    const customerExists = await Customer.findById(customer_id);
    if (!customerExists) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }
    
    const total_amount = medicine.price * quantity;
    const remianing = medicine.price * quantity;

    const sale = new Sale({
      medicine_id,
      customer_id,
      quantity,
      total_amount,
      remianing,
      status: utility.STATUS_SALES.INVOICE,
      sale_date,
    });

    await sale.save();

    medicine.stock_quantity -= quantity;
    await medicine.save();

    res.status(201).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    console.error("Error in Sale registration:", error);
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
      {
        $unwind: "$medicine",
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
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
                medicine_id: 1,
                customer_id: 1,
                quantity: 1,
                total_amount: 1,
                sale_date: 1,
                unique_id: 1,
                status: 1,
                remianing: 1,
                medicine_name: "$medicine.name",
                customer_name: "$customer.name",
                unit_price: "$medicine.price",
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

    const Data = await Sale.aggregate(aggregationPipeline);

    if (
      !Data ||
      Data.length === 0 ||
      !Data[0].data ||
      Data[0].data.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "No Sales data found",
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
    const saleExist = await Sale.findOne({ unique_id });

    if (!saleExist) {
      return res.status(404).json({
        success: false,
        message: "Sale not found.",
      });
    }

    const Data = await Sale.aggregate([
      {
        $match: { unique_id: parseInt(unique_id) },
      },
      {
        $lookup: {
          from: "medicines",
          localField: "medicine_id",
          foreignField: "_id",
          as: "medicine",
        },
      },
      {
        $unwind: "$medicine",
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $project: {
          _id: 1,
          medicine_id: 1,
          customer_id: 1,
          quantity: 1,
          total_amount: 1,
          sale_date: 1,
          medicine_name: "$medicine.name",
          customer_name: "$customer.name",
          unit_price: "$medicine.price",
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
    const saleExist = await Sale.findById(id);

    if (!saleExist) {
      return res.status(404).json({
        success: false,
        message: "Sale not found.",
      });
    }

    if (req.body.quantity || req.body.medicine_id) {
      const medicine_id = req.body.medicine_id || saleExist.medicine_id;
      const quantity = req.body.quantity || saleExist.quantity;

      const medicine = await Medicine.findById(medicine_id);
      if (!medicine) {
        return res
          .status(404)
          .json({ success: false, message: "Medicine not found" });
      }

      req.body.total_amount = medicine.price * quantity;
    }
    const tran = Payment.findOne({ sale_id: new mongoose.Types.ObjectId(id) });
    if (tran) {
      return res.status(400).json({
        success: false,
        message: "There is Transection So Can't Be Changed.",
      });
    }

    const updatedData = await Sale.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Sale updated successfully.",
      data: updatedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteSale = async (req, res) => {
  try {
    const id = req.params.id;
    const saleExist = await Sale.findById(id);

    if (!saleExist) {
      return res.status(404).json({
        success: false,
        message: "Sale not found.",
      });
    }

    await Sale.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Sale deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllPaid = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const pageSize = parseInt(process.env.rows_per_page) || 10;

    const skip = page === 0 ? 0 : (page - 1) * pageSize;
    const limit = page === 0 ? page : pageSize;

    const aggregationPipeline = [
      {
        $match: { status: utility.STATUS_SALES.PAID },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $lookup: {
          from: "medicines",
          localField: "medicine_id",
          foreignField: "_id",
          as: "medicine",
        },
      },
      {
        $unwind: "$medicine",
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
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
                medicine_id: 1,
                customer_id: 1,
                quantity: 1,
                total_amount: 1,
                sale_date: 1,
                unique_id: 1,
                status: 1,
                remaining: 1,
                medicine_name: "$medicine.name",
                customer_name: "$customer.name",
                unit_price: "$medicine.price",
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

    const Data = await Sale.aggregate(aggregationPipeline);

    if (
      !Data ||
      Data.length === 0 ||
      !Data[0].data ||
      Data[0].data.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "No paid sales data found",
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

export const getAllInvoice = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const pageSize = parseInt(process.env.rows_per_page) || 10;

    const skip = page === 0 ? 0 : (page - 1) * pageSize;
    const limit = page === 0 ? page : pageSize;

    const aggregationPipeline = [
      {
        $match: { status: utility.STATUS_SALES.INVOICE },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $lookup: {
          from: "medicines",
          localField: "medicine_id",
          foreignField: "_id",
          as: "medicine",
        },
      },
      {
        $unwind: "$medicine",
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
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
                medicine_id: 1,
                customer_id: 1,
                quantity: 1,
                total_amount: 1,
                sale_date: 1,
                unique_id: 1,
                status: 1,
                remaining: 1,
                medicine_name: "$medicine.name",
                customer_name: "$customer.name",
                unit_price: "$medicine.price",
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

    const Data = await Sale.aggregate(aggregationPipeline);

    if (
      !Data ||
      Data.length === 0 ||
      !Data[0].data ||
      Data[0].data.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "No invoice sales found",
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

export const getSalesByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const page = parseInt(req.query.page);
    const pageSize = parseInt(process.env.rows_per_page) || 10;

    const skip = page === 0 ? 0 : (page - 1) * pageSize;
    const limit = page === 0 ? page : pageSize;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Both startDate and endDate parameters are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate format. Please use YYYY-MM-DD",
      });
    }
    if (isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid endDate format. Please use YYYY-MM-DD",
      });
    }

    end.setHours(23, 59, 59, 999);

    const aggregationPipeline = [
      {
        $match: {
          sale_date: {
            $gte: start,
            $lte: end,
          },
        },
      },
      { $sort: { sale_date: -1 } },
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
        $lookup: {
          from: "customers",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      {
        $project: {
          _id: 1,
          medicine_id: 1,
          customer_id: 1,
          quantity: 1,
          total_amount: 1,
          remianing: 1,
          status: 1,
          sale_date: 1,
          unique_id: 1,
          medicine_name: "$medicine.name",
          customer_name: "$customer.name",
          unit_price: "$medicine.price",
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

    const Data = await Sale.aggregate(aggregationPipeline);

    if (
      !Data ||
      Data.length === 0 ||
      !Data[0].data ||
      Data[0].data.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "No sales data found for the specified date range",
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
