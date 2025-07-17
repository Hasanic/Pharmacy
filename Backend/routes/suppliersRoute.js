import * as supplier from "../controller/suppliers.js";

export default function (app) {
  app.route("/api/supplier").post(supplier.register);
  app.route("/api/supplier/getAllSuppliers").get(supplier.getAll);
  app.route("/api/update/supplier/:id").put(supplier.update);
  app.route("/api/supplier/:unique_id").post(supplier.getById);
  app.route("/api/delete/supplier/:id").delete(supplier.deleteSupplier);
}
