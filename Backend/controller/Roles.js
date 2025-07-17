import Roles from "../model/Roles.js";
import Joi from "joi";

const rolesSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
});

export const register = async (req, res) => {
  const { error } = rolesSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check if user exists
    const RolesExists = await Roles.findOne({
      name: name,
    });

    if (RolesExists) {
      if (RolesExists.name === name) {
        return res
          .status(400)
          .json({ success: false, message: "Name already exists" });
      }
    }

    // Create new Roles (using lowercase for the instance)
    const roles = new Roles({
      name: name,
    });

    await roles.save();

    // Return data
    res.status(201).json({
      success: true,
      data: {
        name: roles.name,
      },
    });
  } catch (error) {
    console.error("Error in Roles registration:", error);
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

    const Data = await Roles.aggregate(aggregationPipeline);

    if (
      !Data ||
      Data.length === 0 ||
      !Data[0].data ||
      Data[0].data.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "No Roles data found",
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
export const GetById = async (req, res) => {
  try {
    const unique_id = req.params.unique_id;
    const RolesExist = await Roles.findOne({ unique_id });
    if (!RolesExist) {
      return res
        .status(404)
        .json({ success: false, message: "Roles not found." });
    }
    res.status(200).json({ success: true, RolesExist });
  } catch (error) {
    res.status(500).json({ success: false, Message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const RolesExist = await Roles.findById(id);
    if (!RolesExist) {
      return res
        .status(404)
        .json({ success: false, message: "Roles not found." });
    }
    const updatedData = await Roles.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res
      .status(200)
      .json({
        success: true,
        message: "Roles Updated successfully.",
        updatedData: updatedData,
      });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
  }
};

export const deleteRoles = async (req, res) => {
  try {
    const id = req.params.id;
    const RolesExist = await Roles.findById(id);
    if (!RolesExist) {
      return res
        .status(404)
        .json({ success: false, message: "Roles not found." });
    }
    await Roles.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Roles deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
  }
};
