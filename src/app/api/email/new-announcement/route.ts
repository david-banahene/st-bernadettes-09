import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNewAnnouncementEmail } from "@/lib/email";

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

  const { title, content } = await request.json();

  // Fetch all active members to notify
  const { data: members } = await supabase
    .from("members")
    .select("email, full_name")
    .eq("membership_status", "active");

  if (!members || members.length === 0) {
    return NextResponse.json({ success: true, sent: 0 });
  }

  // Send email to each active member
  let sent = 0;
  for (const member of members) {
    try {
      await sendNewAnnouncementEmail(
        member.email,
        member.full_name,
        title,
        content
      );
      sent++;
    } catch {
      // Continue sending to others if one fails
    }
  }

  return NextResponse.json({ success: true, sent });
}
