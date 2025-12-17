const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async function(event) {
  // السماح فقط بـ POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    let data;
    // حاول تحليل JSON من body، أو افترض أن body نص خام
    try {
      data = JSON.parse(event.body || "{}");
    } catch {
      // إذا body نص عادي، حوله إلى حقل message
      data = { name: "Unknown", email: "Unknown", message: event.body || "" };
    }

    const { name, email, message } = data;

    if (!message) {
      return {
        statusCode: 400,
        body: "Missing message"
      };
    }

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "king32177042@gmail.com",
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
    return {
      statusCode: 500,
      body: error.message
    };
  }
}
    return {
      statusCode: 500,
      body: error.message
    };
  }
}
    return {
      statusCode: 500,
      body: error.message
    };
  }
}
