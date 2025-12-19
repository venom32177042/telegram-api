

function sendi() {

  
  async function sendEmail() {
  const data = {
    fullName: document.getElementById("fullName").value,
    phone: document.getElementById("phone").value,
    paymentMethod: document.getElementById("paymentMethod").value,
    paymentNumber: document.getElementById("paymentNumber").value,
    productId: document.getElementById("productId").value
  };

  const res = await fetch("/.netlify/functions/sendEmail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    document.getElementById("status").innerText = "تمت المهمة بنجاح";
  } else {
    document.getElementById("status").innerText = "حدث خطأ";
  }
}
  
}
