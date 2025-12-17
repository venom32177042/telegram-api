import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function handler(event) {
  // السماح فقط بـ POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    const { name, email, message } = JSON.parse(event.body || "{}" );

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: "Missing fields"
      };
    }

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "YOUR_EMAIL@gmail.com",
      subject: "New Message",
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`
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
