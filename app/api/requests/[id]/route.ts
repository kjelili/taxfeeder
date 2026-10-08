import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const { data, error } = await supabaseAdmin
    .from("document_requests")
    .select(`
      *,
      clients (id, name, email, phone),
      templates (id, name, category, template_items (*)),
      documents (*)
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (token) {
    if (data.magic_link_token !== token) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 });
    }
    return NextResponse.json({ data });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (data.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ data });
}
