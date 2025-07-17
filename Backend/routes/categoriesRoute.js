import * as catigory from "../controller/categories.js";

export default function (app) {
  app.route("/api/category").post(catigory.register); 
  app.route("/api/category/getAllcategorys").get(catigory.getAll);
  app.route("/api/update/category/:id").put(catigory.update);
  app.route("/api/category/:_id").get(catigory.GetById);
  app.route("/api/delete/category/:id").delete(catigory.deletecategory);
}
