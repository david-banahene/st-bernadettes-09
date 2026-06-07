"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Megaphone,
  Plus,
  Loader2,
  Pin,
  Send,
  AlertCircle,
  Share2,
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  created_at: string;
  author?: { full_name: string };
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLeaderOrAdmin, setIsLeaderOrAdmin] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: member } = await supabase
      .from("members")
      .select("role")
      .eq("id", user.id)
      .single();

    setIsLeaderOrAdmin(
      member?.role === "leader" || member?.role === "admin"
    );

    const { data } = await supabase
      .from("announcements")
      .select("*, author:members!announcements_created_by_fkey(full_name)")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });

    setAnnouncements((data as Announcement[]) || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: insertError } = await supabase
      .from("announcements")
      .insert({
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        pinned: formData.get("pinned") === "on",
        created_by: user.id,
      });

    if (insertError) {
      setError(insertError.message);
      toast.error("Failed to post announcement");
      setSubmitting(false);
      return;
    }

    toast.success("Announcement posted");
    setShowForm(false);
    setSubmitting(false);
    await loadData();
  }

  async function togglePin(id: string, currentPinned: boolean) {
    const supabase = createClient();
    await supabase
      .from("announcements")
      .update({ pinned: !currentPinned })
      .eq("id", id);
    toast.success(currentPinned ? "Unpinned" : "Pinned");
    await loadData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-sb-green" />
      </div>
    );
  }

  function shareToWhatsApp(a: Announcement) {
    const text = `*${a.title}*\n\n${a.content}\n\n-- St. Bernadette's '09 Association`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  }

  const pinned = announcements.filter((a) => a.pinned);
  const regular = announcements.filter((a) => !a.pinned);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-green/8 text-sb-green">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-sb-green-dark">
              Announcements
            </h1>
            <p className="text-sm text-muted-foreground">
              Important updates from the association
            </p>
          </div>
        </div>
        {isLeaderOrAdmin && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-sb-green text-white hover:bg-sb-green-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="mt-6 border-sb-cream-dark bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-sb-green-dark">
              Post Announcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  name="title"
                  required
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <textarea
                  name="content"
                  required
                  rows={5}
                  placeholder="Write your announcement..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="pinned"
                  id="pinned"
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="pinned" className="text-sm text-muted-foreground">
                  Pin this announcement to the top
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-sb-green text-white hover:bg-sb-green-light"
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Post
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pinned Announcements */}
      {pinned.length > 0 && (
        <div className="mt-8 space-y-3">
          {pinned.map((a) => (
            <Card
              key={a.id}
              className="border-sb-gold/30 bg-sb-gold/5"
            >
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Pin className="h-3.5 w-3.5 text-sb-gold-dark" />
                      <h3 className="text-sm font-semibold text-sb-green-dark">
                        {a.title}
                      </h3>
                      <Badge className="bg-sb-gold/10 text-[10px] text-sb-gold-dark">
                        Pinned
                      </Badge>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                      {a.content}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{a.author?.full_name || "Admin"}</span>
                      <span>-</span>
                      <span>
                        {new Date(a.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => shareToWhatsApp(a)}
                      className="text-muted-foreground hover:text-green-600"
                      title="Share on WhatsApp"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    {isLeaderOrAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePin(a.id, a.pinned)}
                        className="text-muted-foreground hover:text-sb-green-dark"
                        title="Unpin"
                      >
                        <Pin className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Regular Announcements */}
      {regular.length > 0 && (
        <div className={pinned.length > 0 ? "mt-6 space-y-3" : "mt-8 space-y-3"}>
          {regular.map((a) => (
            <Card key={a.id} className="border-sb-cream-dark bg-white">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-sb-green-dark">
                      {a.title}
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                      {a.content}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{a.author?.full_name || "Admin"}</span>
                      <span>-</span>
                      <span>
                        {new Date(a.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => shareToWhatsApp(a)}
                      className="text-muted-foreground hover:text-green-600"
                      title="Share on WhatsApp"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    {isLeaderOrAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePin(a.id, a.pinned)}
                        className="text-muted-foreground hover:text-sb-green-dark"
                        title="Pin to top"
                      >
                        <Pin className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {announcements.length === 0 && !showForm && (
        <Card className="mt-8 border-sb-cream-dark bg-white">
          <CardContent className="py-12 text-center">
            <Megaphone className="mx-auto h-8 w-8 text-sb-cream-dark" />
            <p className="mt-2 text-sm text-muted-foreground">
              No announcements yet. Check back soon.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
