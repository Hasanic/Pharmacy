import Prescription from "../model/prescriptions.js";
import Customer from "../model/customers.js";
import Doctor from "../model/doctors.js";
import Joi from "joi";
import mongoose from "mongoose";

const prescriptionSchema = Joi.object({
  customer_id: Joi.string().required(),
  doctor_id: Joi.string().required(),
  date: Joi.date().required(),
  notes: Joi.string().allow("").optional(),
});

export const register = async (req, res) => {
  const { error } = prescriptionSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const { customer_id, doctor_id, date, notes } = req.body;

    // Validate input
    if (!customer_id || !doctor_id || !date) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(customer_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Pass Valid Customer Value" });
    }

    if (!mongoose.Types.ObjectId.isValid(doctor_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Pass Valid Doctor Value" });
    }

    // Check if customer exists
    const customerExists = await Customer.findById(customer_id);
    if (!customerExists) {
      return res
        .status(400)
        .json({ success: false, message: "Customer does not exist" });
    }

    // Check if doctor exists
    const doctorExists = await Doctor.findById(doctor_id);
    if (!doctorExists) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor does not exist" });
    }

    // Create new prescription
    const prescription = new Prescription({
      customer_id,
      doctor_id,
      date,
      notes: notes || "",
    });

    await prescription.save();

    // Return data
    res.status(201).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    console.error("Error in Prescription registration:", error);
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
        $lookup: {
          from: "doctors",
          localField: "doctor_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $unwind: "$doctor",
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
                date: 1,
                notes: 1,
                user_id: 1,
                createdAt: 1,
                updatedAt: 1,
                unique_id: 1,
                customer: "$customer.name",
                doctor: "$doctor.name",
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

    const Data = await Prescription.aggregate(aggregationPipeline);

    if (
      !Data ||
      Data.length === 0 ||
      !Data[0].data ||
      Data[0].data.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "No Prescription data found",
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
    const prescriptionExist = await Prescription.findOne({ unique_id })
      .populate("customer_id", "name")
      .populate("doctor_id", "name");

    if (!prescriptionExist) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found.",
      });
    }

    const Data = await Prescription.aggregate([
      {
        $match: { unique_id: parseInt(unique_id) },
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
        $lookup: {
          from: "doctors",
          localField: "doctor_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $unwind: "$doctor",
      },
      {
        $project: {
          _id: 1,
          date: 1,
          notes: 1,
          user_id: 1,
          createdAt: 1,
          updatedAt: 1,
          unique_id: 1,
          customer: "$customer.name",
          doctor: "$doctor.name",
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
    const prescriptionExist = await Prescription.findById(id);

    if (!prescriptionExist) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found.",
      });
    }

    const updatedData = await Prescription.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .populate("customer_id", "name")
      .populate("doctor_id", "name");

    res.status(200).json({
      success: true,
      message: "Prescription updated successfully.",
      data: updatedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePrescription = async (req, res) => {
  try {
    const id = req.params.id;
    const prescriptionExist = await Prescription.findById(id);

    if (!prescriptionExist) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found.",
      });
    }

    await Prescription.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Prescription deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};