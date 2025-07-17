import * as roles from "../controller/Roles.js";

export default function (app) {
  app.route("/api/roles").post(roles.register);
  app.route("/api/roles/getAllroless").get(roles.getAll);
  app.route("/api/update/roles/:id").put(roles.update);
  app.route("/api/roles/:unique_id").post(roles.GetById);
  app.route("/api/delete/roles/:id").delete(roles.deleteRoles);
}
