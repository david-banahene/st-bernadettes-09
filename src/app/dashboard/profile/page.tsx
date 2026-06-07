"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Pencil,
  Save,
  X,
  Camera,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";

type Member = {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  town_or_city: string;
  next_of_kin: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  parents_names: string;
  spouse_name: string | null;
  children_names: string | null;
  photo_url: string | null;
  date_of_birth: string | null;
  role: string;
  membership_status: string;
  good_standing: boolean;
  commitment_fee_paid: boolean;
  joined_at: string;
};

export default function ProfilePage() {
  const [member, setMember] = useState<Member | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) setMember(data);
    if (error) setError(error.message);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!member) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    let photoUrl = member.photo_url;
    if (photoFile) {
      const fileExt = photoFile.name.split(".").pop();
      const filePath = `${member.id}/profile.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("member-photos")
        .upload(filePath, photoFile, { upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("member-photos")
          .getPublicUrl(filePath);
        photoUrl = urlData.publicUrl;
      }
    }

    const updates = {
      full_name: formData.get("fullName") as string,
      phone_number: formData.get("phoneNumber") as string,
      town_or_city: formData.get("townOrCity") as string,
      next_of_kin: formData.get("nextOfKin") as string,
      emergency_contact_name: formData.get("emergencyContactName") as string,
      emergency_contact_phone: formData.get("emergencyContactPhone") as string,
      parents_names: formData.get("parentsNames") as string,
      spouse_name: (formData.get("spouseName") as string) || null,
      children_names: (formData.get("childrenNames") as string) || null,
      date_of_birth: (formData.get("dateOfBirth") as string) || null,
      photo_url: photoUrl,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("members")
      .update(updates)
      .eq("id", member.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setMember({ ...member, ...updates });
      setSuccess(true);
      setEditing(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  function handleCancel() {
    setEditing(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    setError(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-sb-green" />
      </div>
    );
  }

  if (!member) return null;

  const initials = member.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joinedDate = new Date(member.joined_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-sb-green-dark">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage your personal information
          </p>
        </div>
        {!editing && (
          <Button
            onClick={() => setEditing(true)}
            className="bg-sb-green text-white hover:bg-sb-green-light"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {success && (
        <Alert className="mt-4 border-sb-green/30 bg-sb-green/5">
          <CheckCircle2 className="h-4 w-4 text-sb-green" />
          <AlertDescription className="text-sb-green">
            Profile updated successfully.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSave}>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Left Column - Photo & Status */}
          <div className="space-y-4">
            <Card className="border-sb-cream-dark bg-white">
              <CardContent className="flex flex-col items-center pt-6">
                <div className="relative">
                  <Avatar className="h-28 w-28 border-2 border-sb-gold/30">
                    <AvatarImage
                      src={photoPreview || member.photo_url || undefined}
                      alt={member.full_name}
                    />
                    <AvatarFallback className="bg-sb-green text-2xl font-bold text-sb-gold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {editing && (
                    <label
                      htmlFor="photo-upload"
                      className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-sb-green text-white shadow-md hover:bg-sb-green-light"
                    >
                      <Camera className="h-4 w-4" />
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  )}
                </div>
                <h2 className="mt-4 font-heading text-lg font-bold text-sb-green-dark">
                  {member.full_name}
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  <Badge className="bg-sb-cream text-xs capitalize text-sb-green">
                    {member.role}
                  </Badge>
                  <Badge
                    className={
                      member.membership_status === "active"
                        ? "bg-sb-green/10 text-xs text-sb-green"
                        : "bg-sb-gold/10 text-xs text-sb-gold-dark"
                    }
                  >
                    {member.membership_status === "active" ? "Active" : "Pending"}
                  </Badge>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Member since {joinedDate}
                </p>
              </CardContent>
            </Card>

            <Card className="border-sb-cream-dark bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-sb-green-dark">
                  Standing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {member.good_standing ? (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sb-green/10">
                        <CheckCircle2 className="h-5 w-5 text-sb-green" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-sb-green">Good Standing</p>
                        <p className="text-xs text-muted-foreground">All dues are up to date</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sb-gold/10">
                        <Clock className="h-5 w-5 text-sb-gold-dark" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-sb-gold-dark">Pending</p>
                        <p className="text-xs text-muted-foreground">Dues or fees outstanding</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4 space-y-2 border-t border-sb-cream-dark pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Commitment Fee (GH100)</span>
                    <span className={member.commitment_fee_paid ? "text-sb-green" : "text-sb-gold-dark"}>
                      {member.commitment_fee_paid ? "Paid" : "Not Paid"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-4 lg:col-span-2">
            {/* Personal Information */}
            <Card className="border-sb-cream-dark bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-sb-green-dark">
                  <User className="h-4 w-4" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Full Name</Label>
                    {editing ? (
                      <Input
                        name="fullName"
                        defaultValue={member.full_name}
                        required
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium">{member.full_name}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="mt-1 text-sm font-medium">{member.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone Number</Label>
                    {editing ? (
                      <Input
                        name="phoneNumber"
                        defaultValue={member.phone_number}
                        required
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium">{member.phone_number}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                    {editing ? (
                      <Input
                        name="dateOfBirth"
                        type="date"
                        defaultValue={member.date_of_birth || ""}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium">
                        {member.date_of_birth
                          ? new Date(member.date_of_birth).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "Not provided"}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Town / City</Label>
                    {editing ? (
                      <Input
                        name="townOrCity"
                        defaultValue={member.town_or_city}
                        required
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium">{member.town_or_city}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Family & Emergency */}
            <Card className="border-sb-cream-dark bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-sb-green-dark">
                  Family & Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Parent(s) Names</Label>
                    {editing ? (
                      <Input
                        name="parentsNames"
                        defaultValue={member.parents_names}
                        required
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium">{member.parents_names}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Next of Kin</Label>
                    {editing ? (
                      <Input
                        name="nextOfKin"
                        defaultValue={member.next_of_kin}
                        required
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium">{member.next_of_kin}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Emergency Contact</Label>
                    {editing ? (
                      <Input
                        name="emergencyContactName"
                        defaultValue={member.emergency_contact_name}
                        required
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium">{member.emergency_contact_name}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Emergency Phone</Label>
                    {editing ? (
                      <Input
                        name="emergencyContactPhone"
                        defaultValue={member.emergency_contact_phone}
                        required
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium">{member.emergency_contact_phone}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Spouse</Label>
                    {editing ? (
                      <Input
                        name="spouseName"
                        defaultValue={member.spouse_name || ""}
                        placeholder="If applicable"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium">
                        {member.spouse_name || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Children</Label>
                    {editing ? (
                      <Input
                        name="childrenNames"
                        defaultValue={member.children_names || ""}
                        placeholder="If applicable"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium">
                        {member.children_names || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save/Cancel buttons */}
            {editing && (
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-sb-green text-white hover:bg-sb-green-light"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-sb-cream-dark"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
