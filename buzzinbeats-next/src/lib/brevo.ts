import "server-only";

/**
 * Direct port of the Brevo HTTP API call in
 * DigitalProductPaymentController::startCheckout(). Laravel reused
 * MAIL_PASSWORD as the Brevo API key (flagged in the migration audit as
 * worth a dedicated env var) — this uses BREVO_API_KEY instead.
 */
export async function sendOtpEmail(toEmail: string, otpCode: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("Email service is not configured (BREVO_API_KEY missing).");
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "BuzzinBeats", email: "verify@buzzinbeats.com" },
      to: [{ email: toEmail }],
      subject: "BuzzinBeats Purchase Verification Code",
      htmlContent: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2>Verify your purchase</h2>
        <p>Enter this code to complete your digital product purchase:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px">${otpCode}</p>
        <p style="color:#888;font-size:12px">This code expires in 10 minutes.</p>
      </div>`,
    }),
  });

  if (res.status !== 201) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo API returned status code ${res.status}${body ? `: ${body}` : ""}`);
  }
}

/** Mirrors DeletionWarning10DayMail — sent once when an admin schedules an
 * account for deletion. */
export async function sendDeletionWarningEmail(toEmail: string, name: string, scheduledDeletionAt: Date) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("Email service is not configured (BREVO_API_KEY missing).");

  const formattedDate = scheduledDeletionAt.toLocaleString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      sender: { name: "BuzzinBeats", email: "verify@buzzinbeats.com" },
      to: [{ email: toEmail }],
      subject: "Your Account Is Scheduled for Deletion",
      htmlContent: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2>Hi ${name},</h2>
        <p>Your BuzzinBeats account (<strong>${toEmail}</strong>) has been flagged for deletion by our administration team.</p>
        <p style="font-size:32px;font-weight:900;color:#FF6600;text-align:center;margin:24px 0 4px">10 Days</p>
        <p style="text-align:center;font-size:12px;font-weight:700;color:#7c5c4a;text-transform:uppercase;letter-spacing:1px;margin:0 0 24px">Until Account Deletion</p>
        <p><strong>Scheduled deletion date:</strong> ${formattedDate}</p>
        <p>If deleted, all your pages, products, billing history, analytics, and account data will be permanently removed.</p>
        <p>If you believe this is an error, please contact support immediately.</p>
        <p style="color:#888;font-size:12px">You will receive reminder emails 5 days and 24 hours before deletion.</p>
      </div>`,
    }),
  });

  if (res.status !== 201) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo API returned status code ${res.status}${body ? `: ${body}` : ""}`);
  }
}

/** Mirrors DigitalProductPurchaseConfirmationMail — sent after a
 * successful payment, outside the DB transaction (a mail failure must
 * never affect an already-successful payment, see verify-payment route). */
export async function sendPurchaseConfirmationEmail(params: {
  toEmail: string;
  buyerName: string;
  productTitle: string;
  downloadUrl: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("Email service is not configured (BREVO_API_KEY missing).");

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      sender: { name: "BuzzinBeats", email: "buzz@buzzinbeats.com" },
      to: [{ email: params.toEmail }],
      subject: `Your purchase: ${params.productTitle}`,
      htmlContent: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2>Thanks for your purchase, ${params.buyerName}!</h2>
        <p>Your download for <strong>${params.productTitle}</strong> is ready.</p>
        <p><a href="${params.downloadUrl}" style="display:inline-block;background:#FF6600;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Download now</a></p>
        <p style="color:#888;font-size:12px">This download link expires 15 minutes after each use — return to the product page and use your access link to download again.</p>
      </div>`,
    }),
  });

  if (res.status !== 201) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo API returned status code ${res.status}${body ? `: ${body}` : ""}`);
  }
}
