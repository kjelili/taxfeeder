import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const clientId = searchParams.get("client_id");

  let query = supabaseAdmin
    .from("document_requests")
    .select(`
      *,
      clients (id, name, email),
      templates (id, name, category),
      documents:documents(count)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (clientId) query = query.eq("client_id", clientId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { client_id, template_id, due_date, reminder_email = true, reminder_sms = false } = body;

  if (!client_id || !template_id) {
    return NextResponse.json({ error: "client_id and template_id required" }, { status: 400 });
  }

  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const magicLinkToken = token.slice(0, 64);

  const { data, error } = await supabaseAdmin
    .from("document_requests")
    .insert({
      user_id: user.id,
      client_id,
      template_id,
      magic_link_token: magicLinkToken,
      due_date: due_date || null,
      reminder_email,
      reminder_sms,
      status: "pending",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("email, name")
    .eq("id", client_id)
    .single();

  if (client) {
    await sendEmail({
      to: client.email,
      subject: "Action needed: Upload your tax documents",
      html: `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333;">
  <h1 style="color:#e94560;">Hi ${client.name || "there"},</h1>
  <p>Your tax preparer needs some documents from you. Please upload them here:</p>
  <a href="https://app.taxfeeder.com/r/${data.id}?token=${magicLinkToken}" style="display:inline-block;background:#e94560;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">Upload Documents</a>
  <p style="font-size:13px;color:#888;">This link is secure and unique to you. No password required.</p>
</body>
</html>`,
    });
  }

  return NextResponse.json({ data }, { status: 201 });
}
