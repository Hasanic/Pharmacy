import * as medicine from "../controller/medicines.js";

export default function (app) {
  app.route("/api/medicine").post(medicine.register);
  app.route("/api/medicine/getAllMedicines").get(medicine.getAll);
  app.route("/api/update/medicine/:id").put(medicine.update);
  app.route("/api/medicine/:unique_id").post(medicine.getById);
  app.route("/api/delete/medicine/:id").delete(medicine.deleteMedicine);
}
