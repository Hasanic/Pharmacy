import User from "../model/User.js";
import Joi from "joi";
import JWT from "jsonwebtoken";
import Role from "../model/Roles.js";
import * as utility from "../utilities.js";
import mongoose from "mongoose";

const userSchema = Joi.object({
  username: Joi.string().min(3).max(100).required(),
  password: Joi.string().required(),
  role_id: Joi.string().optional(),
});

export const register = async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const { username, password, role_id } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Username and password are required",
        });
    }

    const userExists = await User.findOne({ username: username.toLowerCase() });
    if (userExists && userExists.username === username.toLowerCase()) {
      return res
        .status(400)
        .json({ success: false, message: "Username already exists" });
    }

    if (role_id) {
      const roleExists = await Role.findById(role_id);
      if (!roleExists) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid role_id" });
      }
    }

    const user = new User({
      username: username.toLowerCase(),
      password: password,
      ...(role_id && { role_id }),
    });

    await user.save();

    res.status(201).json({
      success: true,
      data: {
        username: user.username,
        ...(user.role_id && { role_id: user.role_id }),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "unknown error", error: error.message });
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
        $lookup: {
          from: "roles",
          localField: "role_id",
          foreignField: "_id",
          as: "role",
        },
      },
      {
        $unwind: {
          path: "$role",
          preserveNullAndEmptyArrays: true,
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
          "data._id": 1,
          "data.user_id": 1,
          "data.role_id": 1,
          "data.username": 1,
          "data.password": 1,
          "data.createdAt": 1,
          "data.updatedAt": 1,
          "data.unique_id": 1,
          "data.role.name": 1,
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

    const Data = await User.aggregate(aggregationPipeline);

    if (
      !Data ||
      Data.length === 0 ||
      !Data[0].data ||
      Data[0].data.length === 0
    ) {
      return res
        .status(404)
        .json({ success: false, message: "No users found" });
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
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Internal server error",
      });
  }
};

export const GetById = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format." });
    }

    const userExist = await User.findById(_id);
    if (!userExist) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const Data = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(_id) },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          password: 1,
          user_id: 1,
          createdAt: 1,
          updatedAt: 1,
          unique_id: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: Data[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const userExist = await User.findById(id);
    if (!userExist) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const updatedData = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      select: "_id username password user_id createdAt updatedAt unique_id",
    });

    res.status(200).json({
      success: true,
      message: "User Updated successfully.",
      updatedData: updatedData,
    });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const userExist = await User.findById(id);
    if (!userExist) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    await User.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const users = await User.aggregate([
      {
        $match: {
          username: username,
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "role_id",
          foreignField: "_id",
          as: "User_Role",
        },
      },
      {
        $unwind: {
          path: "$User_Role",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $limit: 1,
      },
    ]);

    if (users.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const user = users[0];
    const isPasswordValid = await utility.verifyPassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const payload = {
      id: user._id,
      username: user.username,
      role: user?.User_Role?.name?.toLowerCase(),
    };

    const token = JWT.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "5d",
    });

    return res.status(200).json({
      success: true,
      token: token,
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
  }
};
