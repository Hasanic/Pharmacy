import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";


const sessionConfig = {
  name: process.env.session_name || "session-!!-@@",
  secret: process.env.secret || "secret-key-!!-@@",
  genid: function (req) {
    return uuidv4(); // use UUIDs for session IDs
  },
  cookie: {
    maxAge: 60 * 60 * 1000,

    // maxAge: 2678400000, //31 Days,
    // maxAge: 9000 * 60, // maxAge: 2678400000, //31 Days,
    secure:  false,
    httpOnly: true,
  },
  resave: false,
  saveUninitialized: true,
};


export default sessionConfig;