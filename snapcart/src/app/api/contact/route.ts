import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

const body = await req.json();

const transporter = nodemailer.createTransport({

service: "gmail",

auth: {
user: process.env.MAIL_USER,
pass: process.env.MAIL_PASS
}

});

try {

await transporter.sendMail({

from: process.env.MAIL_USER,

to: process.env.MAIL_USER,

subject: "New Contact Message - AnuRadha Bhandar",

html: `

<h2>New Customer Message</h2>

<p><b>Name:</b> ${body.name}</p>

<p><b>Email:</b> ${body.email}</p>

<p><b>Message:</b></p>

<p>${body.message}</p>

`

});

return NextResponse.json({ success: true });

}
catch (error) {

console.log(error);

return NextResponse.json({ success: false });

}

}