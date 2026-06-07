import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-sb-green-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-sb-gold bg-sb-green text-base font-bold text-sb-gold">
                SB
              </div>
              <div>
                <p className="font-bold leading-tight">
                  St. Bernadette&apos;s &apos;09
                </p>
                <p className="text-xs text-sb-gold">Association</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              One Year Group, One Family. Promoting unity, support, and progress
              among members of St. Bernadette&apos;s Junior High School, 2009
              year group.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sb-gold">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/about", label: "About Us" },
                { href: "/leaders", label: "Our Leaders" },
                { href: "/events", label: "Events" },
                { href: "/constitution", label: "Constitution" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-sb-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Members */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sb-gold">
              Members
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/register", label: "Register" },
                { href: "/login", label: "Member Login" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-sb-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-sb-gold">
              Origin
            </h3>
            <p className="text-sm text-white/70">
              St. Bernadette&apos;s Junior High School
            </p>
            <p className="text-sm text-white/70">Tafo Nhyiaeso, Kumasi</p>
            <p className="text-sm text-white/70">Ghana</p>
          </div>
        </div>

        {/* Motto & Copyright */}
        <div className="mt-10 border-t border-sb-green-light pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-center text-xs text-white/50">
              &copy;&nbsp;{currentYear}&nbsp;St. Bernadette&apos;s &apos;09 Association. All rights reserved.
            </p>
            <p className="text-center text-xs font-medium text-sb-gold/70">
              Unity | Support | Progress
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
