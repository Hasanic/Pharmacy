import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";

const sessionConfig = {
  name: process.env.session_name || "session-!!-@@",
  secret: process.env.secret || "secret-key-!!-@@",
  genid: function (req) {
    return uuidv4();
  },
  cookie: {
    maxAge: 60 * 60 * 1000,
    secure: false,
    httpOnly: true,
  },
  resave: false,
  saveUninitialized: true,
};

export default sessionConfig;
