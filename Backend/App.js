import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import User from "./routes/userRoute.js";
import Auth from "./routes/authRoute.js";
import Category from "./routes/categoriesRoute.js";
import supplier from "./routes/suppliersRoute.js";
import customer from "./routes/customersRoute.js";
import doctor from "./routes/doctorsRoute.js";
import medicine from "./routes/medicinesRoute.js";
import inventory from "./routes/inventoryRoute.js";
import sale from "./routes/salesRoute.js";
import prescription from "./routes/prescriptionsRoute.js";
import payment from "./routes/paymentsRoute.js";
import roles from "./routes/RolesRoute.js";
import product from "./routes/productRoute.js";
import cors from "cors";
import session from "express-session";
import * as utility from "./utilities.js";
import sessionConfig from "./Config/sessionConfig.js";
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());


const configaration = (app) => {
    session(sessionConfig)

  Auth(app);
  // app.use(utility.verifySession);
  User(app);
  
  roles(app); 
  Category(app);
  supplier(app);
  customer(app);
  doctor(app);
  medicine(app);
  inventory(app);
  sale(app);
  prescription(app);
  payment(app);
  product(app);
};

configaration(app);
export default app;
