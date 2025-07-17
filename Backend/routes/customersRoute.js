import * as customer from "../controller/customers.js";

export default function (app) {
  app.route("/api/customer").post(customer.register);
  app.route("/api/customer/getAllCustomers").get(customer.getAll);
  app.route("/api/update/customer/:id").put(customer.update);
  app.route("/api/customer/:_id").get(customer.getById);
  app.route("/api/delete/customer/:id").delete(customer.deleteCustomer);
}
