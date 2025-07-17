
import bcrypt from 'bcrypt';
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
    next(); // If user is authenticated, proceed to the next middleware or route handler
  } else {
    console.log(
      "----------------------Unauthorized-----------------------------------"
    );
    return res.status(401).json({ success: false, messgae: "Unauthorized" }); // If user is not authenticated, respond with 401 status
  }
};

export const verifySession = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, messgae: "Authorization token is required" });
  }

  const token = authHeader.split(" ")[1]; // Extract token after 'Bearer'

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


// export const rolePermission = function (req, res, next) {
//   const role = req.user?.role;
//   const method = req.method;

//   if (!role) {
//     return next(); // allow if no role found
//   }

//   if (role === "admin") {
//     return next(); // admin can do all
//   }

//   if (role === "user") {
//     if (method === "GET") {
//       return next(); // allow GET
//     }
//     // example: allow PUT only for specific routes or conditions
//     if (method === "PUT") {
//       // optionally check if user is modifying their own data
//       // if (req.user.id === req.params.id) return next();
//       // else return 403
//       return res.status(403).json({ success: false, message: "Forbidden: Users cannot update roles" });
//     }
//   }

//   return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
// };




// export const rolePermission = function (req, res, next) {
//   const role = req.user?.role;
//   const method = req.method;
//   // console.log("req.user?" , req.user)

//   if (!role) {
//       return next(); // Allow all  null Role
//     // return res.status(401).json({ success: false, message: "Unauthorized: No role found" });
//   }

//   if (role === "admin") {
//     return next(); // Allow all methods
//   }

//   if (role === "user" && method === "GET") {
//     return next(); // Allow only GET for users
//   }

//   return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
// };




// export const hashPassword = async (plainPassword) => {
//   const saltRounds = 10;
//   return await bcrypt.hash(plainPassword, saltRounds);
// };