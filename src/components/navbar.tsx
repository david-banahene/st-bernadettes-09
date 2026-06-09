"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/leaders", label: "Leaders" },
  { href: "/events", label: "Events" },
  { href: "/constitution", label: "Constitution" },
];

export function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ? { id: user.id } : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ? { id: session.user.id } : null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 bg-sb-green-dark text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/icons/icon-192.svg"
            alt="SB '09"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-bold leading-tight tracking-wide whitespace-nowrap">
              St. Bernadette&apos;s &apos;09
            </p>
            <p className="text-[10px] text-sb-gold tracking-wider">Unity | Support | Progress</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-sb-green-light hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons (Desktop) */}
        <div className="hidden items-center gap-2 md:flex">
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      className="text-white/90 hover:bg-sb-green-light hover:text-white"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="text-white/90 hover:bg-sb-green-light hover:text-white"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-white/90 hover:bg-sb-green-light hover:text-white"
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-sb-gold text-sb-green-dark hover:bg-sb-gold-light font-semibold">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-sb-green-light md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-sb-green-dark text-white border-sb-green">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col gap-6 pt-8">
              <div className="flex items-center gap-3 px-2">
                <img
                  src="/icons/icon-192.svg"
                  alt="SB '09"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm font-bold">St. Bernadette&apos;s &apos;09</p>
                  <p className="text-xs text-sb-gold">One Year Group, One Family</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-sb-green-light hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-2 border-t border-sb-green-light pt-4">
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white/90 hover:bg-sb-green-light hover:text-white"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      onClick={() => {
                        setOpen(false);
                        handleSignOut();
                      }}
                      variant="ghost"
                      className="w-full justify-start text-white/90 hover:bg-sb-green-light hover:text-white"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white/90 hover:bg-sb-green-light hover:text-white"
                      >
                        Log In
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setOpen(false)}>
                      <Button className="w-full bg-sb-gold text-sb-green-dark hover:bg-sb-gold-light font-semibold">
                        Register
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
