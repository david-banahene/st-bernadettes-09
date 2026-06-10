"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BlurFade } from "@/components/ui/blur-fade";
import { Loader2, UserPlus, AlertCircle } from "lucide-react";
import { MembershipJourney } from "@/components/membership-journey";
import { PhoneInput } from "@/components/phone-input";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validate photo is uploaded
    if (!photoFile) {
      setError("Profile photo is required. Please upload a photo.");
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // 1. Create auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError("Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    const userId = authData.user.id;

    // 2. Upload photo if provided
    let photoUrl: string | null = null;
    if (photoFile) {
      const fileExt = photoFile.name.split(".").pop();
      const filePath = `${userId}/profile.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("member-photos")
        .upload(filePath, photoFile);

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("member-photos")
          .getPublicUrl(filePath);
        photoUrl = urlData.publicUrl;
      }
    }

    // 3. Create member profile via database function (bypasses RLS since
    //    the user has not confirmed their email yet and has no active session)
    const { error: profileError } = await supabase.rpc("register_member", {
      p_user_id: userId,
      p_email: email,
      p_full_name: formData.get("fullName") as string,
      p_phone_number: formData.get("phoneNumber") as string,
      p_town_or_city: formData.get("townOrCity") as string,
      p_next_of_kin: formData.get("nextOfKin") as string,
      p_emergency_contact_name: formData.get("emergencyContactName") as string,
      p_emergency_contact_phone: formData.get("emergencyContactPhone") as string,
      p_parents_names: formData.get("parentsNames") as string,
      p_spouse_name: (formData.get("spouseName") as string) || null,
      p_children_names: (formData.get("childrenNames") as string) || null,
      p_date_of_birth: (formData.get("dateOfBirth") as string) || null,
      p_photo_url: photoUrl,
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      {/* Header */}
      <section className="bg-sb-green-dark py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Become a Member
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Open to persons from St. Bernadette&apos;s 2009 year group
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* How It Works */}
        <BlurFade delay={0.1} inView>
          <Card className="mb-6 border-sb-green/20 bg-sb-green-dark/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-sb-green-dark">
                How Membership Works
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Membership is completed in 5 phases. Submitting this form is
                only the first step.
              </p>
            </CardHeader>
            <CardContent>
              <MembershipJourney currentStep={1} />
            </CardContent>
          </Card>
        </BlurFade>

        <BlurFade delay={0.2} inView>
          <Card className="border-sb-cream-dark bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base text-sb-green-dark">
                <UserPlus className="h-5 w-5" />
                Membership Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Credentials */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Account
                  </h3>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="your@email.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        placeholder="Min. 6 characters"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        minLength={6}
                        placeholder="Repeat password"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Personal Information
                  </h3>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        required
                        placeholder="As it appears on official documents"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Phone Number *</Label>
                      <PhoneInput
                        name="phoneNumber"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="townOrCity">Town / City of Residence *</Label>
                      <Input
                        id="townOrCity"
                        name="townOrCity"
                        required
                        placeholder="e.g., Kumasi, Accra, Tafo"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Family & Emergency */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Family & Emergency Contact
                  </h3>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="parentsNames">Parent(s) Names *</Label>
                      <Input
                        id="parentsNames"
                        name="parentsNames"
                        required
                        placeholder="Father and/or Mother"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nextOfKin">Next of Kin *</Label>
                      <Input
                        id="nextOfKin"
                        name="nextOfKin"
                        required
                        placeholder="Name of next of kin"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
                      <Input
                        id="emergencyContactName"
                        name="emergencyContactName"
                        required
                        placeholder="Close relative"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Emergency Contact Phone *</Label>
                      <PhoneInput
                        name="emergencyContactPhone"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="spouseName">Spouse Name</Label>
                      <Input
                        id="spouseName"
                        name="spouseName"
                        placeholder="If applicable"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="childrenNames">Children Names</Label>
                      <Input
                        id="childrenNames"
                        name="childrenNames"
                        placeholder="If applicable"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Profile Photo
                  </h3>
                  <div className="mt-3">
                    <Label htmlFor="photo">Upload a photo *</Label>
                    <Input
                      id="photo"
                      name="photo"
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) =>
                        setPhotoFile(e.target.files?.[0] || null)
                      }
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      A clear photo of your face. JPG, PNG, or WebP. Max 5MB.
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <div className="border-t border-sb-cream-dark pt-6">
                  <p className="mb-4 text-xs text-muted-foreground">
                    By registering, you agree to abide by the Constitution of
                    St. Bernadette&apos;s &apos;09 Association. Your application
                    will be reviewed by the leadership.
                  </p>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-sb-green text-white hover:bg-sb-green-light"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Already a member?{" "}
                    <Link
                      href="/login"
                      className="font-medium text-sb-green hover:text-sb-green-light"
                    >
                      Log in here
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </BlurFade>
      </div>
    </>
  );
}
