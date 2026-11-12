const crypto = require("node:crypto");

const digest = (value) =>
  crypto
    .createHash("sha256")
    .update(String(value ?? ""))
    .digest();

// Compares two secrets without leaking how many characters matched
function safeEqual(input, expected) {
  if (!expected) {
    return false;
  }
  return crypto.timingSafeEqual(digest(input), digest(expected));
}

module.exports = { safeEqual };
