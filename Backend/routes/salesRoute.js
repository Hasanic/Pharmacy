import * as sale from "../controller/sales.js";

export default function (app) {
  app.route("/api/sale").post(sale.register);
  app.route("/api/sale/getAllSales").get(sale.getAll);
  app.route("/api/sale/getAllPaid").get(sale.getAllPaid);
  app.route("/api/sale/getAllInvoice").get(sale.getAllInvoice);
  app.route("/api/update/sale/:id").put(sale.update);
  app.route("/api/sale/:unique_id").get(sale.getById);
  app.route("/api/sales").get(sale.getSalesByDate);
  app.route("/api/delete/sale/:id").delete(sale.deleteSale);
}
