"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  Plus,
  Loader2,
  Download,
  Send,
  AlertCircle,
  FileText,
  CalendarDays,
} from "lucide-react";

interface MeetingMinutes {
  id: string;
  title: string;
  meeting_date: string;
  summary: string | null;
  file_url: string;
  created_at: string;
  uploader?: { full_name: string };
}

export default function MinutesPage() {
  const [minutes, setMinutes] = useState<MeetingMinutes[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLeaderOrAdmin, setIsLeaderOrAdmin] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      .from("meeting_minutes")
      .select("*, uploader:members!meeting_minutes_uploaded_by_fkey(full_name)")
      .order("meeting_date", { ascending: false });

    setMinutes((data as MeetingMinutes[]) || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedFile) return;
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileExt = selectedFile.name.split(".").pop();
    const filePath = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("meeting-minutes")
      .upload(filePath, selectedFile);

    if (uploadError) {
      setError("Failed to upload file: " + uploadError.message);
      setSubmitting(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("meeting-minutes")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase
      .from("meeting_minutes")
      .insert({
        title: formData.get("title") as string,
        meeting_date: formData.get("meetingDate") as string,
        summary: (formData.get("summary") as string) || null,
        file_url: urlData.publicUrl,
        uploaded_by: user.id,
      });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    setShowForm(false);
    setSubmitting(false);
    setSelectedFile(null);
    await loadData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-sb-green" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-green/8 text-sb-green">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-sb-green-dark">
              Meeting Minutes
            </h1>
            <p className="text-sm text-muted-foreground">
              Records of association meetings
            </p>
          </div>
        </div>
        {isLeaderOrAdmin && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-sb-green text-white hover:bg-sb-green-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Upload Minutes
          </Button>
        )}
      </div>

      {/* Upload Form */}
      {showForm && (
        <Card className="mt-6 border-sb-cream-dark bg-white">
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  name="title"
                  required
                  placeholder="e.g., General Meeting - June 2026"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Meeting Date *</label>
                <Input
                  name="meetingDate"
                  type="date"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Summary (optional)</label>
                <textarea
                  name="summary"
                  rows={3}
                  placeholder="Brief summary of what was discussed..."
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium">File (PDF, DOC, etc.) *</label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  required
                  onChange={(e) =>
                    setSelectedFile(e.target.files?.[0] || null)
                  }
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={submitting || !selectedFile}
                  className="bg-sb-green text-white hover:bg-sb-green-light"
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Upload
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Minutes List */}
      {minutes.length > 0 ? (
        <div className="mt-8 space-y-3">
          {minutes.map((m) => (
            <Card key={m.id} className="border-sb-cream-dark bg-white">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sb-cream">
                  <FileText className="h-5 w-5 text-sb-green" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-sb-green-dark">
                    {m.title}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {new Date(m.meeting_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {m.uploader && (
                      <>
                        <span>-</span>
                        <span>by {m.uploader.full_name}</span>
                      </>
                    )}
                  </div>
                  {m.summary && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {m.summary}
                    </p>
                  )}
                </div>
                <a
                  href={m.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-sb-cream-dark text-sb-green-dark hover:bg-sb-green/5"
                  >
                    <Download className="mr-1 h-3.5 w-3.5" />
                    Download
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !showForm && (
          <Card className="mt-8 border-sb-cream-dark bg-white">
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-sb-cream-dark" />
              <p className="mt-2 text-sm text-muted-foreground">
                No meeting minutes uploaded yet.
              </p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
