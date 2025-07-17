import * as User from "../controller/User.js";

export default function (app) {
  app.route("/api/user").post(User.register);
  app.route("/api/user/getAllUsers").get(User.getAll);
  app.route("/api/update/user/:id").put(User.update);
  app.route("/api/user/:_id").get(User.GetById);
  app.route("/api/delete/user/:id").delete(User.deleteUser);
}
