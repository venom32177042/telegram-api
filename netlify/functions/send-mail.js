const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const {
      fullName,
      phone,
      paymentMethod,
      paymentNumber,
      productId
    } = JSON.parse(event.body);

    await resend.emails.send({
      from: "Website <onboarding@resend.dev>",
      to: ["king32177042@gmail.com"], // ايميلك
      subject: "طلب جديد",
      html: `
        <h2>بيانات الطلب</h2>
        <p><strong>الاسم الكامل:</strong> ${fullName}</p>
        <p><strong>رقم الهاتف:</strong> ${phone}</p>
        <p><strong>وسيلة الدفع:</strong> ${paymentMethod}</p>
        <p><strong>رقم المدفوعة:</strong> ${paymentNumber}</p>
        <p><strong>ID المنتج:</strong> ${productId}</p>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};      text: `Name: ${name}\nEmail: ${email}\n\n${message}`
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
