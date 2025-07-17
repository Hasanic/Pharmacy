import * as doctor from "../controller/doctors.js";

export default function (app) {
  app.route("/api/doctor").post(doctor.register);
  app.route("/api/doctor/getAllDoctors").get(doctor.getAll);
  app.route("/api/update/doctor/:id").put(doctor.update);
  app.route("/api/doctor/:_id").get(doctor.GetById);
  app.route("/api/delete/doctor/:id").delete(doctor.deleteDoctor);
}
