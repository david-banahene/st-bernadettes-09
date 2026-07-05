import { createClient } from "@/lib/supabase/server";
import { GroupThreadView } from "./group-thread-view";

export default async function GroupChatPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: me } = await supabase
    .from("members")
    .select("role")
    .eq("id", user!.id)
    .single();

  return (
    <GroupThreadView
      currentUserId={user!.id}
      isAdmin={me?.role === "admin"}
    />
  );
}
