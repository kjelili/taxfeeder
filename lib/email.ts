import { supabaseAdmin } from "./supabase";

export async function sendEmail({
  to,
  subject,
  html,
  from = "TaxFeeder <hello@taxfeeder.com>",
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Email send failed:", err);
    throw new Error("Failed to send email");
  }

  return res.json();
}

export async function sendWelcomeEmail(email: string, name?: string) {
  return sendEmail({
    to: email,
    subject: "Welcome to TaxFeeder — Your first document request in 5 minutes",
    html: `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333;">
  <h1 style="color:#e94560;">Welcome to TaxFeeder, ${name || "there"}!</h1>
  <p>You're on the waitlist for early access. Here's what happens next:</p>
  <ol>
    <li>We'll email you when beta spots open (target: November 2026)</li>
    <li>You'll get 50% off for life as an early supporter</li>
    <li>Direct access to the founder for feedback and feature requests</li>
  </ol>
  <p style="margin-top:24px;">Questions? Just reply to this email.</p>
  <p style="font-size:12px;color:#888;margin-top:32px;">TaxFeeder — Built for tax preparers who value their time.</p>
</body>
</html>`,
  });
}

export async function sendOnboardingEmail(userId: string, plan: string) {
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("email, full_name")
    .eq("id", userId)
    .single();

  if (!user) return;

  return sendEmail({
    to: user.email,
    subject: "Welcome to TaxFeeder — Your first document request in 5 minutes",
    html: `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333;">
  <h1 style="color:#e94560;">Welcome to TaxFeeder, ${user.full_name || "there"}!</h1>
  <p>You're now on the <strong>${plan}</strong> plan. Here's how to collect your first tax documents:</p>
  <ol>
    <li>Log into your dashboard at <a href="https://app.taxfeeder.com/dashboard">app.taxfeeder.com</a></li>
    <li>Add a client</li>
    <li>Pick the "2026 Individual Return" template</li>
    <li>Send the magic link</li>
  </ol>
  <a href="https://app.taxfeeder.com/dashboard" style="display:inline-block;background:#e94560;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px;">Go to Dashboard</a>
  <p style="margin-top:24px;font-size:12px;color:#888;">Questions? Reply to this email — we read every one.</p>
</body>
</html>`,
  });
}

export async function sendDunningEmail(userId: string, email: string, name?: string) {
  return sendEmail({
    to: email,
    from: "TaxFeeder Billing <billing@taxfeeder.com>",
    subject: "Action needed: Update your payment method",
    html: `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333;">
  <h1 style="color:#e94560;">Your TaxFeeder payment failed</h1>
  <p>Hi ${name || "there"},</p>
  <p>We couldn't process your monthly payment. Don't worry — your account is still active for 7 days.</p>
  <p><strong>Please update your payment method to avoid interruption:</strong></p>
  <a href="https://app.taxfeeder.com/billing" style="display:inline-block;background:#e94560;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px;">Update Payment Method</a>
  <p style="margin-top:24px;font-size:12px;color:#888;">Need help? Reply to this email.</p>
</body>
</html>`,
  });
}

export async function sendCancellationSurvey(userId: string, email: string) {
  return sendEmail({
    to: email,
    subject: "Sorry to see you go — one quick question?",
    html: `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333;">
  <h1 style="color:#e94560;">We're sorry to see you leave</h1>
  <p>Your TaxFeeder subscription has been cancelled. You'll have access until the end of your billing period.</p>
  <p><strong>One quick question:</strong> What made you cancel? Your feedback helps us improve.</p>
  <a href="https://forms.taxfeeder.com/cancellation-survey?user=${userId}" style="display:inline-block;background:#16213e;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px;">Share Feedback (30 seconds)</a>
  <p style="margin-top:24px;font-size:12px;color:#888;">Changed your mind? You can reactivate anytime from your billing page.</p>
</body>
</html>`,
  });
}
