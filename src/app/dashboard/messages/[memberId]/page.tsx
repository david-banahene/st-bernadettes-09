import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ThreadView } from "./thread-view";

interface Props {
  params: Promise<{ memberId: string }>;
}

export default async function MessageThreadPage({ params }: Props) {
  const { memberId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: otherMember } = await supabase
    .from("members")
    .select("id, full_name, photo_url")
    .eq("id", memberId)
    .single();

  if (!otherMember) return notFound();

  return (
    <ThreadView
      currentUserId={user!.id}
      otherId={otherMember.id}
      otherName={otherMember.full_name}
      otherPhoto={otherMember.photo_url}
    />
  );
}
