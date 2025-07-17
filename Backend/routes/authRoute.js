import * as Auth from  "../controller/User.js";

export default function (app) {
  app.route("/api/login").post(Auth.login);
  app.route("/api/login/getAllUsers").get(Auth.getAll);

}