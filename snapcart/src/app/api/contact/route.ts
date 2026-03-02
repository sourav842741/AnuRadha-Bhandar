import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    // ✅ YAHAN LIKHNA HAI
    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: process.env.MAIL_USER,
      subject: "New Contact Message",
      html: `
      <h2>New Customer Message</h2>

      <p>Name: ${body.name}</p>

      <p>Email: ${body.email}</p>

      <p>${body.message}</p>
      `
    });

    return NextResponse.json({ success: true });

  } catch (error) {

    console.log(error);

    return NextResponse.json({ success: false });

  }
}