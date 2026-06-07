"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BlurFade } from "@/components/ui/blur-fade";
import { Loader2, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error")
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
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
              Member Login
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Access your dashboard and association features
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <BlurFade delay={0.1} inView>
          <Card className="border-sb-cream-dark bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base text-sb-green-dark">
                <LogIn className="h-5 w-5" />
                Sign In
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Your password"
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
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <Link
                      href="/forgot-password"
                      className="font-medium text-sb-green hover:text-sb-green-light"
                    >
                      Forgot your password?
                    </Link>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Not a member yet?{" "}
                    <Link
                      href="/register"
                      className="font-medium text-sb-green hover:text-sb-green-light"
                    >
                      Register here
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
