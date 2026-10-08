import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, source = "landing_page" } = body;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("waitlist")
    .insert({ email, source, created_at: new Date().toISOString() });

  if (error) {
    if (error.code === "23505") return NextResponse.json({ success: true });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await sendWelcomeEmail(email);

  return NextResponse.json({ success: true });
}
