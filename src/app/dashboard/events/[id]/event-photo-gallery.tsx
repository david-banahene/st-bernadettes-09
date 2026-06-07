"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Loader2, Plus, X } from "lucide-react";

interface Props {
  eventId: string;
  isLeaderOrAdmin: boolean;
  isPast: boolean;
}

interface Photo {
  id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
}

export function EventPhotoGallery({ eventId, isLeaderOrAdmin, isPast }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [viewPhoto, setViewPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  async function loadPhotos() {
    const supabase = createClient();
    const { data } = await supabase
      .from("event_photos")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    setPhotos(data || []);
    setLoading(false);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileExt = selectedFile.name.split(".").pop();
    const filePath = `${eventId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("event-photos")
      .upload(filePath, selectedFile);

    if (uploadError) {
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("event-photos")
      .getPublicUrl(filePath);

    await supabase.from("event_photos").insert({
      event_id: eventId,
      photo_url: urlData.publicUrl,
      caption: caption || null,
      uploaded_by: user.id,
    });

    setSelectedFile(null);
    setCaption("");
    setShowUpload(false);
    setUploading(false);
    await loadPhotos();
  }

  if (loading) {
    return (
      <Card className="border-sb-cream-dark bg-white">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-sb-green" />
        </CardContent>
      </Card>
    );
  }

  if (photos.length === 0 && !isLeaderOrAdmin) return null;
  if (photos.length === 0 && !isPast) return null;

  return (
    <>
      <Card className="border-sb-cream-dark bg-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm font-semibold text-sb-green-dark">
            <span className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-sb-gold" />
              Event Photos
              {photos.length > 0 && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({photos.length})
                </span>
              )}
            </span>
            {isLeaderOrAdmin && isPast && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowUpload(!showUpload)}
                className="border-sb-cream-dark text-sb-green-dark"
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Photo
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Upload Form */}
          {showUpload && (
            <div className="mb-4 space-y-3 rounded-lg bg-sb-cream p-4">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <Input
                placeholder="Caption (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="bg-sb-green text-white hover:bg-sb-green-light"
                >
                  {uploading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Upload"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowUpload(false);
                    setSelectedFile(null);
                    setCaption("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Photo Grid */}
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setViewPhoto(photo)}
                  className="group relative aspect-square overflow-hidden rounded-lg"
                >
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || "Event photo"}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 p-2">
                      <p className="text-xs text-white">{photo.caption}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No photos uploaded yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Lightbox */}
      {viewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setViewPhoto(null)}
        >
          <button
            className="absolute right-4 top-4 text-white"
            onClick={() => setViewPhoto(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="max-h-[85vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={viewPhoto.photo_url}
              alt={viewPhoto.caption || "Event photo"}
              className="max-h-[80vh] rounded-lg object-contain"
            />
            {viewPhoto.caption && (
              <p className="mt-2 text-center text-sm text-white">
                {viewPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
