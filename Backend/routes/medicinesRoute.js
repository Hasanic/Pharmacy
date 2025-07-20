import * as medicine from "../controller/medicines.js";
import upload from "../middleware/multer.js";
import path from "path";
import fs from "fs";

export default function (app) {
  app.post("/api/medicines", upload.single("image"), medicine.createMedicine);
  app.get("/api/medicines", medicine.getAllMedicines);
  app.get("/api/medicines/:id", medicine.getMedicineById);
  app.put(
    "/api/medicines/:id",
    upload.single("image"),
    medicine.updateMedicine
  );
  app.delete("/api/medicines/:id", medicine.deleteMedicine);

  app.get("/api/medicines/image/:filename", (req, res) => {
    try {
      const { filename } = req.params;
      const safeFilename = path.basename(filename);
      if (!safeFilename) return res.status(400).send("Invalid filename");

      const imagePath = path.join("D:/Pharmacy/Backend/images", safeFilename);

      if (fs.existsSync(imagePath)) {
        return res.sendFile(imagePath);
      }
      return res.status(404).send("Image not found");
    } catch (error) {
      console.error("Error serving image:", error);
      return res.status(500).send("Error serving image");
    }
  });
}
