import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendQuestionAnsweredEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verify caller is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get the responder's name
  const { data: responder } = await supabase
    .from("members")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { questionId, responseText } = await request.json();

  // Fetch the question to find who asked it
  const { data: question } = await supabase
    .from("questions")
    .select("subject, asked_by")
    .eq("id", questionId)
    .single();

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  // Fetch the asker's email and name
  const { data: asker } = await supabase
    .from("members")
    .select("email, full_name")
    .eq("id", question.asked_by)
    .single();

  if (!asker) {
    return NextResponse.json({ error: "Asker not found" }, { status: 404 });
  }

  // Don't email yourself if you answer your own question
  if (question.asked_by === user.id) {
    return NextResponse.json({ success: true, skipped: "self-reply" });
  }

  await sendQuestionAnsweredEmail(
    asker.email,
    asker.full_name,
    question.subject,
    responseText,
    responder?.full_name || "Leadership"
  );

  return NextResponse.json({ success: true });
}
