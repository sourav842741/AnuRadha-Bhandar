import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {

    const body = await req.json();

    // Check env variables
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      return NextResponse.json(
        { success: false, message: "Email config missing" },
        { status: 500 }
      );
    }

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
      from: `"AnuRadha Bhandar" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
      subject: "New Contact Message - AnuRadha Bhandar",
      html: `
        <h2>New Customer Message</h2>

        <p><b>Name:</b> ${body.name}</p>

        <p><b>Email:</b> ${body.email}</p>

        <p><b>Message:</b></p>

        <p>${body.message}</p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Mail Sent Successfully",
    });

  } catch (error) {

    console.log("Mail Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Mail Failed",
      },
      { status: 500 }
    );
  }
}