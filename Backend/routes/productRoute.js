import * as product from "../controller/product.js";
import upload from "../middleware/multer.js";
import path from 'path';
import fs from 'fs';

export default function (app) {
  app.post("/api/products", upload.single("image"), product.createProduct);
  app.get("/api/products", product.getAllProducts);
  app.get("/api/products/:id", product.getProductById);
  app.put("/api/products/:id", upload.single("image"), product.updateProduct);
  app.delete("/api/products/:id", product.deleteProduct);
  app.get("/api/products/image/:filename", (req, res) => {
    try {
      const { filename } = req.params;
      const safeFilename = path.basename(filename);
      if (!safeFilename) return res.status(400).send('Invalid filename');

      const imagePath = path.join('D:/Pharmacy/Backend/images', safeFilename);
      
      if (fs.existsSync(imagePath)) {
        return res.sendFile(imagePath);
      }
      return res.status(404).send('Image not found');
    } catch (error) {
      console.error('Error serving image:', error);
      return res.status(500).send('Error serving image');
    }
  });
}