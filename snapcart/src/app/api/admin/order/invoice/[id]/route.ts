import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDb();

  const { id } = await params;

  const order = await Order.findById(id);

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  const fontPath = path.join(
    process.cwd(),
    "public/fonts/Inter/Inter-VariableFont_opsz,wght.ttf"
  );

  const doc = new PDFDocument({
    margin: 50,
    font: fontPath,
  });

  const chunks: Uint8Array[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  const pdfBuffer = await new Promise<Uint8Array>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    /** -------- HEADER -------- */

    doc
      .fontSize(24)
      .text("ANURADHA BHANDAR", { align: "center" });

    doc
      .fontSize(11)
      .text(
        "11/1 TC Mukherjee Street, Rishra, Kolkata, West Bengal",
        { align: "center" }
      );

    doc.text("Phone: +91 8847608613", { align: "center" });

    doc.moveDown();

    doc
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown();

    /** -------- INVOICE TITLE -------- */

    doc.fontSize(20).text("INVOICE", { align: "center" });

    doc.moveDown(1.5);

    /** -------- ORDER INFO -------- */

    doc.fontSize(11).text(`Order ID: ${order._id}`);
    doc.text(
      `Date: ${new Date(order.createdAt || "").toLocaleDateString()}`
    );
    doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`);

    doc.moveDown();

    /** -------- CUSTOMER DETAILS -------- */

    doc.fontSize(13).text("Customer Details", { underline: true });

    doc.moveDown(0.5);

    doc.fontSize(11).text(`Name: ${order.address?.fullName || "N/A"}`);

    doc.text(`Phone: ${order.address?.phone || "N/A"}`);

    doc.text(
      `Address: ${order.address?.fullAddress}, ${order.address?.city}, ${order.address?.state} - ${order.address?.pincode}`
    );

    doc.moveDown(1.5);

    /** -------- PRODUCT TABLE HEADER -------- */

    const tableTop = doc.y;

    doc.fontSize(12).text("Product", 50, tableTop);
    doc.text("Qty", 350, tableTop);
    doc.text("Price", 400, tableTop);
    doc.text("Total", 470, tableTop);

    doc.moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    let y = tableTop + 25;

    /** -------- PRODUCTS -------- */

    order.items.forEach((item: any) => {
      const price = Number(item.price);
      const total = price * item.quantity;

      doc.fontSize(11).text(item.name, 50, y, { width: 280 });

      doc.text(item.quantity.toString(), 350, y);

      doc.text(`₹${price}`, 400, y);

      doc.text(`₹${total}`, 470, y);

      y += 25;
    });

    doc.moveTo(50, y)
      .lineTo(550, y)
      .stroke();

    doc.moveDown();

    /** -------- TOTAL -------- */

    doc
      .fontSize(14)
      .text(`Total Amount: ₹${order.totalAmount}`, 400, y + 10, {
        align: "right",
      });

    doc.moveDown(3);

    /** -------- FOOTER -------- */

    doc
      .fontSize(10)
      .fillColor("gray")
      .text("Thank you for shopping with ANURADHA BHANDAR!", {
        align: "center",
      });

    doc.end();
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${order._id}.pdf`,
    },
  });
}