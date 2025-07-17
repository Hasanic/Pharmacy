import * as payment from "../controller/payments.js";

export default function (app) {
  app.route("/api/payment").post(payment.register);
  app.route("/api/payment/getAllPayments").get(payment.getAll);
  app.route("/api/update/payment/:id").put(payment.update);
  app.route("/api/payment/:unique_id").post(payment.getById);
  app.route("/api/delete/payment/:id").delete(payment.deletePayment);
}
