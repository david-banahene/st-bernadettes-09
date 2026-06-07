import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPaymentConfirmedEmail } from "@/lib/email";

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

  const { memberId, paymentType, amount } = await request.json();

  // Get the member's email and name
  const { data: member } = await supabase
    .from("members")
    .select("email, full_name")
    .eq("id", memberId)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  await sendPaymentConfirmedEmail(
    member.email,
    member.full_name,
    paymentType,
    amount
  );

  return NextResponse.json({ success: true });
}
