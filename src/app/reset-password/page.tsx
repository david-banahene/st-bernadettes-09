"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BlurFade } from "@/components/ui/blur-fade";
import { Loader2, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // The reset link can hand off the session in a few ways depending on how
  // Supabase issued it: a `token_hash` + `type` query param (from our own
  // customized email template - needs an explicit verifyOtp call), a `code`
  // query param (PKCE - needs an explicit exchange), or an #access_token=...
  // URL fragment (picked up automatically by the Supabase client). We handle
  // all three rather than assuming one.
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    if (tokenHash && type === "recovery") {
      supabase.auth
        .verifyOtp({ token_hash: tokenHash, type: "recovery" })
        .then(({ error: verifyError }) => {
          if (cancelled) return;
          if (!verifyError) {
            setSessionReady(true);
          }
          setChecking(false);
        });
    }

    const code = searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
        if (cancelled) return;
        if (!exchangeError) {
          setSessionReady(true);
        }
        setChecking(false);
      });
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled && session) {
        setSessionReady(true);
        setChecking(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setSessionReady(true);
        setChecking(false);
      }
    });

    // If nothing established a session after a few seconds, the link is
    // invalid, expired, or already used
    const timeout = setTimeout(() => {
      if (!cancelled) setChecking(false);
    }, 4000);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              {checking ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-sb-green" />
                  <p className="text-sm text-muted-foreground">
                    Verifying your reset link...
                  </p>
                </div>
              ) : success ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-sb-green" />
                  <h3 className="mt-3 text-sm font-semibold text-sb-green-dark">
                    Password updated!
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your password has been changed. Redirecting to dashboard...
                  </p>
                </div>
              ) : !sessionReady ? (
                <div className="text-center py-4">
                  <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
                  <h3 className="mt-3 text-sm font-semibold text-sb-green-dark">
                    Link expired or already used
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This password reset link is no longer valid. Please
                    request a new one.
                  </p>
                  <Button
                    onClick={() => router.push("/forgot-password")}
                    className="mt-4 bg-sb-green text-white hover:bg-sb-green-light"
                  >
                    Request a new link
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
