export function buildTelegramMessage(payload) {
  const comment = payload.bookingComment || "немає";

  return [
    "Нова заявка X-drive",
    `Ім'я: ${payload.clientName}`,
    `Телефон: ${payload.clientPhone}`,
    `Комплект: ${payload.gearType}`,
    `Локація: ${payload.locationChoice}`,
    `Дата: ${payload.rentalDate}`,
    `Термін: ${payload.rentalDays}`,
    `Коментар: ${comment}`
  ].join("\n");
}

function validatePayload(payload) {
  const required = [
    "clientName",
    "clientPhone",
    "gearType",
    "locationChoice",
    "rentalDate",
    "rentalDays"
  ];

  return required.filter((key) => !String(payload?.[key] || "").trim());
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const token = process.env.XDRIVE_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.XDRIVE_TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return response.status(500).json({
      ok: false,
      error: "Telegram is not configured on the server."
    });
  }

  const payload = request.body || {};
  const missing = validatePayload(payload);

  if (missing.length > 0) {
    return response.status(400).json({
      ok: false,
      error: `Missing required fields: ${missing.join(", ")}`
    });
  }

  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: buildTelegramMessage(payload),
      disable_web_page_preview: true
    })
  });

  const telegramData = await telegramResponse.json();

  if (!telegramResponse.ok || !telegramData.ok) {
    return response.status(502).json({
      ok: false,
      error: telegramData.description || "Telegram request failed"
    });
  }

  return response.status(200).json({ ok: true });
}
