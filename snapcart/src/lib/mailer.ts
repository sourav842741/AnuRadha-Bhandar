
// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();

// const { MAIL_USER, MAIL_PASS } = process.env;

// if (!MAIL_USER || !MAIL_PASS) {
//   console.error("❗ Missing MAIL_USER or MAIL_PASS in environment variables.");
 
// }

// // Create transporter using explicit SMTP options (more reliable than `service: "gmail"`)
// export const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true, // true for 465, false for 587
//   auth: {
//     user: MAIL_USER,
//     pass: MAIL_PASS,
//   },
//   // helpful for debugging
//   logger: true,
//   debug: true,
// });

// // Verify transporter once at startup (prints reason on failure)
// transporter.verify((error, success) => {
//   if (error) {
//     console.error("❌ Mail server connection failed:", error);
//   } else {
//     console.log("✅ Mail server is ready to send emails");
//   }
// });

// export const sendMail = async (to: string, subject: string, html: string) => {
//   if (!MAIL_USER || !MAIL_PASS) {
//     throw new Error("Email credentials are not configured.");
//   }

//   try {
//     const info = await transporter.sendMail({
//       from: `"AnuRadha Bhandar" <${MAIL_USER}>`,
//       to,
//       subject,
//       html,
//     });

//     console.log("📩 Email sent:", info.messageId);
//     return info;
//   } catch (err: any) {
//     // More detailed error logging for debugging (without leaking secrets)
//     console.error("❌ Email Error:", {
//       message: err?.message,
//       code: err?.code,
//       response: err?.response, // includes the 535 message from Gmail
//       responseCode: err?.responseCode,
//     });

//     // If Gmail responded with 535, suggest checks to user
//     if (err?.responseCode === 535) {
//       console.error("→ Likely cause: Bad credentials or Gmail blocking the login. Check App Password, 2-step verification, and security alerts.");
//     }

//     throw new Error("Email could not be sent");
//   }
// };


import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const { MAIL_USER, MAIL_PASS } = process.env;

if (!MAIL_USER || !MAIL_PASS) {
  console.error("❗ Missing MAIL_USER or MAIL_PASS in environment variables.");
}

let transporter: any = null;

// Lazy initialize transporter
function getTransporter() {

  if (!transporter) {

    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
      },
      logger: true,
      debug: true,
    });

    // Verify only once
    transporter.verify((error: any, success: any) => {
      if (error) {
        console.error("❌ Mail server connection failed:", error);
      } else {
        console.log("✅ Mail server is ready to send emails");
      }
    });

  }

  return transporter;
}

export const sendMail = async (
  to: string,
  subject: string,
  html: string
) => {

  if (!MAIL_USER || !MAIL_PASS) {
    throw new Error("Email credentials are not configured.");
  }

  try {

    const transporterInstance = getTransporter();

    const info = await transporterInstance.sendMail({
      from: `"AnuRadha Bhandar" <${MAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📩 Email sent:", info.messageId);

    return info;

  } catch (err: any) {

    console.error("❌ Email Error:", {
      message: err?.message,
      code: err?.code,
      response: err?.response,
      responseCode: err?.responseCode,
    });

    if (err?.responseCode === 535) {
      console.error(
        "→ Likely cause: Bad credentials or Gmail blocking the login."
      );
    }

    throw new Error("Email could not be sent");
  }
};
