import * as product from "../controller/Product.js";
import upload from "../middleware/multer.js";

export default function (app) {
  app.post("/api/products", upload.single("image"), product.createProduct);
  app.get("/api/products", product.getAllProducts);
  app.get("/api/products/:id", product.getProductById);
  app.put("/api/products/:id", upload.single("image"), product.updateProduct);
  app.delete("/api/products/:id", product.deleteProduct);
}
