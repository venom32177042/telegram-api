import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PRIVATE_KEY = "H7$kP2!xQ9@Lr8#A";

app.post("/send", async (req, res) => {
  if (req.headers["x-secret"] !== PRIVATE_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  const TELEGRAM_TOKEN = "8141066456:AAGpcrt3CbNJKA6TZA7b1sipsDMVIdQhI_8";
  const CHAT_ID = "1671241612";

  try {
    await fetch(
      `
${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text })
      }
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Telegram error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running");
});
