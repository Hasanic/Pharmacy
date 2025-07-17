import * as prescription from "../controller/prescriptions.js";

export default function (app) {
  app.route("/api/prescription").post(prescription.register);
  app.route("/api/prescription/getAllPrescriptions").get(prescription.getAll);
  app.route("/api/update/prescription/:id").put(prescription.update);
  app.route("/api/prescription/:unique_id").post(prescription.getById);
  app.route("/api/delete/prescription/:id").delete(prescription.deletePrescription);
}
