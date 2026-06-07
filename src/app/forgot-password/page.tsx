"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BlurFade } from "@/components/ui/blur-fade";
import { Loader2, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const supabase = createClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <>
      {/* Header */}
      <section className="bg-sb-green-dark py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Reset Password
            </h1>
            <p className="mt-2 text-sm text-white/60">
              We will send you a link to reset your password
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <BlurFade delay={0.1} inView>
          <Card className="border-sb-cream-dark bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base text-sb-green-dark">
                <Mail className="h-5 w-5" />
                Forgot Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sent ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-sb-green" />
                  <h3 className="mt-3 text-sm font-semibold text-sb-green-dark">
                    Check your email
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We sent a password reset link to your email address.
                    Click the link in the email to set a new password.
                  </p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Did not receive it? Check your spam folder or try again.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSent(false)}
                    className="mt-4"
                  >
                    Try again
                  </Button>
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
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="your@email.com"
                        className="mt-1"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Enter the email you registered with
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-sb-green text-white hover:bg-sb-green-light"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Remember your password?{" "}
                      <Link
                        href="/login"
                        className="font-medium text-sb-green hover:text-sb-green-light"
                      >
                        Sign in
                      </Link>
                    </p>
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
