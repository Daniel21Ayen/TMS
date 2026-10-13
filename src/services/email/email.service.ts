// Sends via Brevo when BREVO_API_KEY is set; otherwise prints to the server console (development only).
export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  const key = process.env.BREVO_API_KEY;
  if (!key) { console.log(`\n[DEV email → ${to}] ${subject}\n${text}\n`); return; }
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST", headers: { "api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ sender: { email: process.env.EMAIL_FROM ?? "no-reply@example.com", name: "TMS" }, to: [{ email: to }], subject, textContent: text }),
  });
  if (!res.ok) console.error("Email send failed", res.status);
}
