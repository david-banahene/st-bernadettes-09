import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPaymentConfirmedEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verify caller is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: caller } = await supabase
    .from("members")
    .select("role")
    .eq("id", user.id)
    .single();

  if (caller?.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { memberId, month } = await request.json();

  // Get the member's email and name
  const { data: member } = await supabase
    .from("members")
    .select("email, full_name")
    .eq("id", memberId)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Format the month for the email (e.g., "June 2026")
  const monthLabel = new Date(month).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  await sendPaymentConfirmedEmail(
    member.email,
    member.full_name,
    `Monthly Dues - ${monthLabel}`,
    "20"
  );

  return NextResponse.json({ success: true });
}
