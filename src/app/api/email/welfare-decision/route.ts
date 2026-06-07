import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelfareDecisionEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verify caller is leader or admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: caller } = await supabase
    .from("members")
    .select("role")
    .eq("id", user.id)
    .single();

  if (caller?.role !== "admin" && caller?.role !== "leader") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { requestId, decision, notes } = await request.json();

  // Fetch the welfare request to find the member
  const { data: welfareReq } = await supabase
    .from("welfare_requests")
    .select("member_id")
    .eq("id", requestId)
    .single();

  if (!welfareReq) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  // Get the member's email and name
  const { data: member } = await supabase
    .from("members")
    .select("email, full_name")
    .eq("id", welfareReq.member_id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  await sendWelfareDecisionEmail(
    member.email,
    member.full_name,
    decision,
    notes || undefined
  );

  return NextResponse.json({ success: true });
}
