import * as inventory from "../controller/inventory.js";

export default function (app) {
  app.route("/api/inventory").post(inventory.register);
  app.route("/api/inventory/getAllInventory").get(inventory.getAll);
  app.route("/api/update/inventory/:id").put(inventory.update);
  app.route("/api/inventory/:unique_id").post(inventory.getById);
  app.route("/api/delete/inventory/:id").delete(inventory.deleteInventory);
}
