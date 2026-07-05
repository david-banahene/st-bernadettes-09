"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { Cake, Loader2, PartyPopper, Send, Star } from "lucide-react";

interface Wish {
  id: string;
  author_id: string;
  message: string;
  created_at: string;
  author?: { full_name: string; photo_url: string | null };
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function BirthdaySpotlight({
  celebrantId,
  celebrantName,
  celebrantPhoto,
  currentUserId,
}: {
  celebrantId: string;
  celebrantName: string;
  celebrantPhoto: string | null;
  currentUserId: string;
}) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isCelebrant = currentUserId === celebrantId;
  const year = new Date().getFullYear();

  useEffect(() => {
    loadWishes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrantId]);

  async function loadWishes() {
    const supabase = createClient();
    const { data } = await supabase
      .from("birthday_wishes")
      .select(
        "id, author_id, message, created_at, author:members!birthday_wishes_author_id_fkey(full_name, photo_url)"
      )
      .eq("celebrant_id", celebrantId)
      .eq("birthday_year", year)
      .order("created_at", { ascending: true });

    setWishes((data as unknown as Wish[]) || []);
    setLoading(false);
  }

  async function handleSend() {
    if (!message.trim()) return;
    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.from("birthday_wishes").insert({
      celebrant_id: celebrantId,
      birthday_year: year,
      author_id: currentUserId,
      message: message.trim(),
    });

    if (error) {
      toast.error("Could not send your message");
      setSubmitting(false);
      return;
    }

    setMessage("");
    setSubmitting(false);
    await loadWishes();
  }

  const initials = initialsOf(celebrantName);

  return (
    <BlurFade delay={0.05} inView>
      <Card className="overflow-hidden border-sb-gold/30 bg-white shadow-md">
        <div className="relative overflow-hidden bg-gradient-to-br from-sb-green-dark via-sb-green-dark to-sb-green px-5 py-5">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ boxShadow: ["0 0 0 0 rgba(200,150,46,0.4)", "0 0 0 8px rgba(200,150,46,0)"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              className="rounded-full"
            >
              <Avatar className="h-16 w-16 border-2 border-sb-gold">
                {celebrantPhoto && (
                  <AvatarImage src={celebrantPhoto} alt={celebrantName} />
                )}
                <AvatarFallback className="bg-sb-green text-lg font-semibold text-sb-gold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div className="flex-1">
              <p className="flex items-center gap-1.5 font-heading text-xl font-bold text-white">
                <Cake className="h-4 w-4 shrink-0 text-sb-gold" />
                {isCelebrant ? "Happy Birthday!" : `Happy Birthday, ${celebrantName.split(" ")[0]}!`}
              </p>
              <p className="mt-0.5 text-xs text-sb-cream/60">
                Wish {isCelebrant ? "yourself" : celebrantName.split(" ")[0]} well below
              </p>
            </div>
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2 }}
            >
              <PartyPopper className="h-7 w-7 text-sb-gold" />
            </motion.div>
          </div>
        </div>

        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-semibold text-sb-green-dark">
            Wishes {wishes.length > 0 && `(${wishes.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-sb-green" />
            </div>
          ) : (
            <div className="space-y-2">
              {wishes.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Be the first to send a wish.
                </p>
              )}
              {wishes.map((w) => {
                const fromCelebrant = w.author_id === celebrantId;
                const authorName = w.author?.full_name || "Member";
                return (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex items-start gap-2.5 rounded-2xl p-3 shadow-sm transition-shadow hover:shadow-md",
                      fromCelebrant
                        ? "border border-sb-gold/40 bg-sb-gold/5"
                        : "bg-sb-cream"
                    )}
                  >
                    <Avatar className="h-7 w-7 shrink-0 border border-sb-gold/20">
                      {w.author?.photo_url && (
                        <AvatarImage src={w.author.photo_url} alt={authorName} />
                      )}
                      <AvatarFallback className="bg-sb-green text-[9px] font-semibold text-sb-gold">
                        {initialsOf(authorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {fromCelebrant && <Star className="h-3 w-3 shrink-0 text-sb-gold-dark" />}
                        <p className="truncate text-xs font-semibold text-sb-green-dark">
                          {authorName}
                        </p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {new Date(w.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-sb-green-dark">{w.message}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isCelebrant ? "Reply to a wish..." : `Wish ${celebrantName.split(" ")[0]} well...`}
              className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />
            <Button
              onClick={handleSend}
              disabled={submitting || !message.trim()}
              className="rounded-full bg-sb-green text-white hover:bg-sb-green-light"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </BlurFade>
  );
}
