import assert from "node:assert/strict";
import { buildTelegramMessage } from "./booking.js";

const message = buildTelegramMessage({
  clientName: "Andrii",
  clientPhone: "+380671234567",
  gearType: "Premium skis",
  locationChoice: "Bukovel",
  rentalDate: "2026-12-20",
  rentalDays: "2 days",
  bookingComment: "Height 180, boot size 43"
});

assert.match(message, /Нова заявка X-drive/);
assert.match(message, /Andrii/);
assert.match(message, /\+380671234567/);
assert.match(message, /Premium skis/);
assert.match(message, /Bukovel/);
assert.match(message, /2026-12-20/);

console.log("api booking tests passed");
