import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateUploadUrl } from "@/lib/s3";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const body = await req.json();
  const { filename, contentType, templateItemId } = body;

  const { data: request, error: reqError } = await supabaseAdmin
    .from("document_requests")
    .select("magic_link_token, status")
    .eq("id", id)
    .single();

  if (reqError || !request || request.magic_link_token !== token) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }

  if (request.status === "complete") {
    return NextResponse.json({ error: "Request already complete" }, { status: 400 });
  }

  const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const timestamp = Date.now();
  const key = `uploads/${id}/${templateItemId || "misc"}/${timestamp}_${safeName}`;

  const uploadUrl = await generateUploadUrl(key, contentType);

  return NextResponse.json({ uploadUrl, key });
}
