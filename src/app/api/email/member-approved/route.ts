import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendMemberApprovedEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verify the caller is an admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from("members")
    .select("role")
    .eq("id", user.id)
    .single();

  if (admin?.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { memberId } = await request.json();

  // Get the member's email and name
  const { data: member } = await supabase
    .from("members")
    .select("email, full_name")
    .eq("id", memberId)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  await sendMemberApprovedEmail(member.email, member.full_name);

  return NextResponse.json({ success: true });
}
