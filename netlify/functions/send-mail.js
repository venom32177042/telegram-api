import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function handler(event) {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "king32177042@gmail.com",
      subject: "Resend + Netlify Test",
      text: "Backend يعمل بنجاح"
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message
    };
  }
        }
