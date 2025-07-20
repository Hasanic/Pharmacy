import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export function isDigitsOnly(inputString) {
  return /^\d+$/.test(inputString);
}

export const STATUS_SALES = {
  INVOICE: 1,
  PAID: 2,
};
export const RolePermissions = {
  View: 1,
  Add: 2,
  Delete: 3,
  Edit: 4,
};

export const ensureAuthenticated = function (req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    console.log(
      "----------------------Unauthorized-----------------------------------"
    );
    return res.status(401).json({ success: false, messgae: "Unauthorized" });
  }
};

export const verifySession = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, messgae: "Authorization token is required" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ success: false, messgae: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
};
export const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};
