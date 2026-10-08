import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

async function checkAndUpdateRequestStatus(requestId: string) {
  const { data: request } = await supabaseAdmin
    .from("document_requests")
    .select("template_id")
    .eq("id", requestId)
    .single();

  if (!request) return;

  const { data: requiredItems } = await supabaseAdmin
    .from("template_items")
    .select("id")
    .eq("template_id", request.template_id)
    .eq("is_required", true);

  const { data: uploadedDocs } = await supabaseAdmin
    .from("documents")
    .select("template_item_id")
    .eq("request_id", requestId);

  const uploadedItemIds = new Set(uploadedDocs?.map((d) => d.template_item_id));
  const allUploaded = requiredItems?.every((item) => uploadedItemIds.has(item.id));

  if (allUploaded) {
    await supabaseAdmin
      .from("document_requests")
      .update({ status: "complete", completed_at: new Date().toISOString() })
      .eq("id", requestId);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const body = await req.json();
  const { key, originalFilename, fileSize, mimeType, templateItemId } = body;

  const { data: request } = await supabaseAdmin
    .from("document_requests")
    .select("magic_link_token")
    .eq("id", id)
    .single();

  if (!request || request.magic_link_token !== token) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }

  const { data: doc, error } = await supabaseAdmin
    .from("documents")
    .insert({
      request_id: id,
      template_item_id: templateItemId,
      original_filename: originalFilename,
      storage_path: key,
      file_size: fileSize,
      mime_type: mimeType,
      uploaded_by_client: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await checkAndUpdateRequestStatus(id);

  return NextResponse.json({ data: doc }, { status: 201 });
}
