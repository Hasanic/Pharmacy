
import * as medicine from "../controller/medicines.js";
import upload from "../middleware/multer.js";
import path from 'path';
import fs from 'fs';

export default function (app) {
  app.post("/api/medicines", upload.single("image"), medicine.createMedicine);
  app.get("/api/medicines", medicine.getAllMedicines);
  app.get("/api/medicines/:id", medicine.getMedicineById);
  app.put("/api/medicines/:id", upload.single("image"), medicine.updateMedicine);
  app.delete("/api/medicines/:id", medicine.deleteMedicine);


  app.get("/api/medicines/image/:filename", (req, res) => {
    try {
      const { filename } = req.params;
      const safeFilename = path.basename(filename);
      if (!safeFilename) return res.status(400).json({
        code: 400,
        status: "Bad Request",
        message: "Invalid filename"
      });

      const imagePath = path.join(process.env.UPLOAD_DIR || 'uploads', safeFilename);
      
      if (fs.existsSync(imagePath)) {
        return res.sendFile(imagePath);
      }
      return res.status(404).json({
        code: 404,
        status: "Not Found",
        message: "Medicine image not found"
      });
    } catch (error) {
      console.error('Error serving medicine image:', error);
      return res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: "Error serving medicine image"
      });
    }
  });
}