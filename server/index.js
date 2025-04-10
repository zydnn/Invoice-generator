const express = require("express");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const { v4: uuidv4 } = require("uuid");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/generate-invoice", async (req, res) => {
  try {
    const { pelanggan, tanggal, invoiceNo, namaBarang, sewaSelama, periode, jumlah, hargaSatuan, ongkir, alamatSewa, total, totalTerbilang, keterangan } = req.body;

    const templatePath = path.join(__dirname, "template", "Template Invoice Terbaru.docx");
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    doc.setData({
      pelanggan,
      tanggal,
      invoiceNo,
      namaBarang,
      sewaSelama,
      periode,
      jumlah,
      hargaSatuan,
      ongkir,
      alamatSewa,
      total,
      totalTerbilang,
      keterangan,
    });

    try {
      doc.render();
    } catch (err) {
      console.error("🛑 Render template error:", err);
      return res.status(500).send("Gagal render template");
    }

    const buffer = doc.getZip().generate({ type: "nodebuffer" });
    const fileName = `invoice-${uuidv4()}`;
    const outputDocx = path.join(__dirname, "outputs", `${fileName}.docx`);
    const outputPdf = path.join(__dirname, "outputs", `${fileName}.pdf`);

    fs.writeFileSync(outputDocx, buffer);

    exec(`soffice --headless --convert-to pdf "${outputDocx}" --outdir "${path.dirname(outputDocx)}"`, (err) => {
      if (err) {
        console.error("🛑 Gagal convert ke PDF:", err);
        return res.status(500).send("Gagal convert ke PDF");
      }

      const pdfFile = fs.readFileSync(outputPdf);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}.pdf`);
      res.send(pdfFile);

      // Optional cleanup
      fs.unlinkSync(outputDocx);
      fs.unlinkSync(outputPdf);
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    res.status(500).send("Server error.");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server jalan di http://localhost:${PORT}`);
});
