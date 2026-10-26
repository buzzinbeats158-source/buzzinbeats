import crypto from "node:crypto";

/**
 * Equivalent to Laravel's Hash::make()/Hash::check() for OTP codes —
 * bcrypt is unnecessary overhead for a 6-digit, 10-minute-lived,
 * 3-attempt-limited code; a plain SHA-256 digest provides the same
 * practical security here (nothing meaningful is gained from bcrypt's
 * slow-hashing property against a value this short-lived and rate-limited).
 */
export function hashOtp(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export function verifyOtp(otp: string, hash: string) {
  return hashOtp(otp) === hash;
}
