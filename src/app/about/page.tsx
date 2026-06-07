import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { BlurFade } from "@/components/ui/blur-fade";
import { AnimatedAmount } from "@/components/animated-number";
import {
  Handshake,
  HeartHandshake,
  Sparkles,
  MessageSquare,
  TrendingUp,
  GraduationCap,
  Building,
  Globe,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about St. Bernadette's '09 Association, our aims, objectives, and commitment to unity among members.",
};

const aims = [
  {
    icon: Handshake,
    text: "To promote unity, friendship, and cooperation among members.",
  },
  {
    icon: HeartHandshake,
    text: "To support members in times of need according to the rules of the Association.",
  },
  {
    icon: Sparkles,
    text: "To encourage commitment, discipline, and active participation among members.",
  },
  {
    icon: MessageSquare,
    text: "To provide a platform for discussion and group decisions.",
  },
  {
    icon: TrendingUp,
    text: "To promote the welfare and progress of members.",
  },
  {
    icon: GraduationCap,
    text: "To uphold the good name of our former school and year group.",
  },
  {
    icon: Building,
    text: "To build a strong and lasting Association for present and future benefit.",
  },
  {
    icon: Globe,
    text: "To attend programs and events that promote the welfare of the Association, both within and outside the region.",
  },
  {
    icon: Users,
    text: "To delegate members to represent the Association at programs and events outside the region.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-sb-green-dark py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              About the Association
            </h1>
            <div className="mt-3 flex items-center justify-center gap-3 text-sm font-semibold uppercase tracking-widest text-sb-gold">
              <span>Unity</span>
              <span className="h-1.5 w-1.5 rounded-full bg-sb-gold" />
              <span>Support</span>
              <span className="h-1.5 w-1.5 rounded-full bg-sb-gold" />
              <span>Progress</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Introduction */}
        <BlurFade delay={0.1} inView>
        <div className="mx-auto max-w-3xl">
          <Card className="border-sb-cream-dark bg-white">
            <CardContent className="pt-6">
              <p className="text-base leading-relaxed text-muted-foreground italic border-l-4 border-sb-gold pl-4">
                This Association is made to guide the affairs of St.
                Bernadette&apos;s &apos;09 Association in a simple, fair, and
                orderly way. It is written to help members understand their
                rights, duties, financial commitments, welfare benefits, and the
                general administration of the group.
              </p>
            </CardContent>
          </Card>
        </div>
        </BlurFade>

        {/* Key Info Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <Card className="border-sb-cream-dark bg-white text-center">
            <CardContent className="pt-6 pb-5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sb-green/10 text-sb-green">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-semibold uppercase tracking-wide text-sb-green-dark">School</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                St. Bernadette&apos;s Junior High School
              </p>
              <p className="text-sm text-muted-foreground">
                Tafo Nhyiaeso, Kumasi, Ghana
              </p>
            </CardContent>
          </Card>

          <Card className="border-sb-cream-dark bg-white text-center">
            <CardContent className="pt-6 pb-5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sb-gold/10 text-sb-gold-dark">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-semibold uppercase tracking-wide text-sb-green-dark">
                Year Group
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                2009 Graduating Class
              </p>
              <p className="text-sm font-medium text-sb-gold-dark">
                One Year Group, One Family
              </p>
            </CardContent>
          </Card>

          <Card className="border-sb-cream-dark bg-white text-center">
            <CardContent className="pt-6 pb-5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sb-green/10 text-sb-green">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-semibold uppercase tracking-wide text-sb-green-dark">
                Membership
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Open to persons from St. Bernadette&apos;s 2009 year group
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Aims & Objectives */}
        <div className="mt-16">
          <div className="text-center">
            <h2 className="font-heading text-2xl font-bold text-sb-green-dark sm:text-3xl">
              Our Aims & Objectives
            </h2>
            <div className="mx-auto mt-2 h-0.5 w-12 bg-sb-gold" />
            <p className="mt-2 text-base text-muted-foreground">
              As outlined in Article 4 of our Constitution
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aims.map((aim, index) => (
              <Card
                key={index}
                className="border-sb-cream-dark bg-white transition-shadow hover:shadow-md"
              >
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sb-green/10 text-sb-green">
                    <aim.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {aim.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Financial Obligations */}
        <div className="mt-16">
          <div className="text-center">
            <h2 className="font-heading text-2xl font-bold text-sb-green-dark sm:text-3xl">
              Financial Obligations
            </h2>
            <div className="mx-auto mt-2 h-0.5 w-12 bg-sb-gold" />
            <p className="mt-2 text-base text-muted-foreground">
              As outlined in Article 7 of our Constitution
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            {[
              {
                label: "Commitment Fee",
                value: 100,
                note: "One-time payment",
              },
              {
                label: "Monthly Dues",
                value: 20,
                note: "Recurring monthly",
              },
              {
                label: "Welfare Contribution",
                value: 50,
                note: "As agreed",
              },
            ].map((item, index) => (
              <BlurFade key={item.label} delay={0.1 + index * 0.1} inView>
              <Card className="border-sb-gold/20 bg-white text-center">
                <CardContent className="pt-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-sb-green-dark">
                    GH₵<AnimatedAmount value={item.value} />
                  </p>
                  <p className="mt-1 text-xs text-sb-gold-dark">{item.note}</p>
                </CardContent>
              </Card>
              </BlurFade>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            These amounts may be reviewed from time to time at a general meeting.
          </p>
        </div>
      </div>
    </>
  );
}
