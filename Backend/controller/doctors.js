import Doctor from "../model/doctors.js";
import Joi from "joi";

const doctorSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  specialization: Joi.string().min(3).max(100).required(),
  phone: Joi.string().min(8).max(15).required(),
});

export const register = async (req, res) => {
  const { error } = doctorSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const { name, specialization, phone } = req.body;

    // Validate input
    if (!name || !specialization || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check if doctor exists
    const doctorExists = await Doctor.findOne({
      $or: [{ name: name }, { phone: phone }],
    });

    if (doctorExists) {
      if (doctorExists.name === name) {
        return res
          .status(400)
          .json({ success: false, message: "Doctor name already exists" });
      }
      if (doctorExists.phone === phone) {
        return res
          .status(400)
          .json({ success: false, message: "Phone number already exists" });
      }
    }

    // Create new doctor
    const doctor = new Doctor({
      name,
      specialization,
      phone,
    });

    await doctor.save();

    // Return data
    res.status(201).json({
      success: true,
      data: {
        name: doctor.name,
        specialization: doctor.specialization,
        phone: doctor.phone,
        unique_id: doctor.unique_id,
      },
    });
  } catch (error) {
    console.error("Error in Doctor registration:", error);
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
      { $sort: { _id: -1 } }, // Keep original sort order (newest first)
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

    const Data = await Doctor.aggregate(aggregationPipeline);

    if (
      !Data ||
      Data.length === 0 ||
      !Data[0].data ||
      Data[0].data.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "No doctors found",
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
import mongoose from "mongoose";

export const GetById = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format." });
    }

    const doctorExist = await Doctor.findById(_id);
    if (!doctorExist) {
      return res.status(404).json({ success: false, message: "Doctor not found." });
    }

    res.status(200).json({ success: true, data: doctorExist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// export const GetById = async (req, res) => {
//   try {
//     const unique_id = req.params.unique_id;
//     const doctorExist = await Doctor.findOne({ unique_id });
//     if (!doctorExist) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Doctor not found." });
//     }
//     res.status(200).json({ success: true, data: doctorExist });
//   } catch (error) {
//     res.status(500).json({ success: false, Message: error.message });
//   }
// };

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const doctorExist = await Doctor.findById(id);
    if (!doctorExist) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found." });
    }
    const updatedData = await Doctor.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json({
      success: true,
      message: "Doctor updated successfully.",
      data: updatedData,
    });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const id = req.params.id;
    const doctorExist = await Doctor.findById(id);
    if (!doctorExist) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found." });
    }
    await Doctor.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Doctor deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
  }
};
