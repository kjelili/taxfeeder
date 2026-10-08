import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { request_id, type = "email" } = body;

  const { data: request } = await supabaseAdmin
    .from("document_requests")
    .select("user_id, status, magic_link_token, client_id")
    .eq("id", request_id)
    .single();

  if (!request || request.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (request.status === "complete") {
    return NextResponse.json({ error: "Request already complete" }, { status: 400 });
  }

  const { data: logs } = await supabaseAdmin
    .from("reminder_logs")
    .select("reminder_number")
    .eq("request_id", request_id)
    .eq("reminder_type", type)
    .order("reminder_number", { ascending: false })
    .limit(1)
    .single();

  const nextNumber = (logs?.reminder_number || 0) + 1;

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("email, name")
    .eq("id", request.client_id)
    .single();

  if (type === "email" && client) {
    await sendEmail({
      to: client.email,
      subject: `Reminder #${nextNumber}: Tax documents still needed`,
      html: `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333;">
  <h1 style="color:#e94560;">Hi ${client.name || "there"},</h1>
  <p>This is a friendly reminder that your tax preparer is still waiting for some documents.</p>
  <a href="https://app.taxfeeder.com/r/${request_id}?token=${request.magic_link_token}" style="display:inline-block;background:#e94560;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">Upload Documents</a>
  <p style="font-size:13px;color:#888;">This is reminder ${nextNumber}. Please upload as soon as possible.</p>
</body>
</html>`,
    });
  }

  await supabaseAdmin.from("reminder_logs").insert({
    request_id,
    reminder_type: type,
    reminder_number: nextNumber,
    sent_at: new Date().toISOString(),
    status: "sent",
  });

  return NextResponse.json({ success: true, reminder_number: nextNumber });
}
