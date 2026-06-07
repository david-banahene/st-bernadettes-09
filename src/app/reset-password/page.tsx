"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BlurFade } from "@/components/ui/blur-fade";
import { Loader2, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

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

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 2000);
  }

  return (
    <>
      {/* Header */}
      <section className="bg-sb-green-dark py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Set New Password
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Choose a new password for your account
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <BlurFade delay={0.1} inView>
          <Card className="border-sb-cream-dark bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base text-sb-green-dark">
                <KeyRound className="h-5 w-5" />
                New Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-sb-green" />
                  <h3 className="mt-3 text-sm font-semibold text-sb-green-dark">
                    Password updated!
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your password has been changed. Redirecting to dashboard...
                  </p>
                </div>
              ) : (
                <>
                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        placeholder="At least 6 characters"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        required
                        minLength={6}
                        placeholder="Type your password again"
                        className="mt-1"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-sb-green text-white hover:bg-sb-green-light"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </BlurFade>
      </div>
    </>
  );
}
