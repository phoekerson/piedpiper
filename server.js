const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Configuration pour uploader les fichiers
const upload = multer({ dest: "uploads/" });

// Route pour uploader et convertir un fichier
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = path.join(__dirname, req.file.path);
    const fileType = req.file.mimetype;

    let jsonData;

    if (fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || fileType === "application/vnd.ms-excel") {
      // Lire le fichier Excel
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else if (fileType === "application/pdf") {
      // Lire le fichier PDF
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      jsonData = { text: pdfData.text.split("\n") };
    } else {
      return res.status(400).json({ error: "Type de fichier non supporté" });
    }
    // Lire aussi le fichier Excel 
    

    // Supprimer le fichier temporaire après traitement
    fs.unlinkSync(filePath);

    // Répondre avec les données en JSON
    res.status(200).json({ data: jsonData });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors du traitement du fichier", details: error.message });
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`API PiedPiper disponible sur http://localhost:${PORT}`);
});
