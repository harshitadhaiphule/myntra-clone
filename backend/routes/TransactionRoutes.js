const express = require("express");
const Order = require("../models/Order");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const router = express.Router();

router.get("/export/:userId", async (req, res) => {
  try {
    const { type } = req.query;
    const orders = await Order.find({ userId: req.params.userId });

    if (type === "csv") {
      const parser = new Parser({
        fields: ["_id", "total", "paymentMethod", "status", "createdAt"],
      });
      const csv = parser.parse(orders);
      res.header("Content-Type", "text/csv");
      res.attachment("transactions.csv");
      return res.send(csv);
    }

    if (type === "pdf") {
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=transactions.pdf");
      doc.pipe(res);

      doc.fontSize(16).text("Transaction History", { align: "center" });
      doc.moveDown();

      orders.forEach((o) => {
        doc.fontSize(12).text(
          `Date: ${o.createdAt}\nAmount: ₹${o.total}\nPayment: ${o.paymentMethod}\nStatus: ${o.status}\n--------------------------`
        );
      });

      doc.end();
      return;
    }

    res.status(400).json({ message: "Invalid export type" });
  } catch (error) {
    console.log("Export error:", error);
    res.status(500).json({ message: "Export failed" });
  }
});

module.exports = router;
