"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { Particles } from "@/components/ui/particles";
import {
  Users,
  CalendarDays,
  Shield,
  Heart,
  MessageCircle,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";

const features = [
  {
    icon: Users,
    title: "Member Directory",
    description: "Browse profiles and stay connected with fellow classmates.",
  },
  {
    icon: CalendarDays,
    title: "Events & Payments",
    description: "View upcoming events and pay via Mobile Money directly.",
  },
  {
    icon: Shield,
    title: "Leadership",
    description: "Meet the officers leading the Association forward.",
  },
  {
    icon: Heart,
    title: "Welfare Support",
    description: "Request and receive support during difficult times.",
  },
  {
    icon: MessageCircle,
    title: "Private Q&A",
    description: "Ask questions and get responses from leaders privately.",
  },
  {
    icon: BookOpen,
    title: "Meeting Records",
    description: "Access minutes and decisions from past meetings.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-sb-green-dark">
        {/* Particle background */}
        <Particles
          className="absolute inset-0 z-0"
          quantity={40}
          color="#C8962E"
          size={0.4}
          staticity={60}
          ease={50}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-36 lg:px-8 lg:py-44">
          <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <BlurFade delay={0.1} inView>
              <div className="mb-10 flex h-20 w-20 items-center justify-center rounded-full border-2 border-sb-gold/60 bg-sb-green text-xl font-bold text-sb-gold shadow-[0_0_40px_rgba(200,150,46,0.15)] sm:h-24 sm:w-24 sm:text-2xl">
                SB
              </div>
            </BlurFade>

            {/* Title */}
            <BlurFade delay={0.2} inView>
              <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                St. Bernadette&apos;s &apos;09
              </h1>
            </BlurFade>

            <BlurFade delay={0.3} inView>
              <p className="mt-1 font-heading text-2xl font-medium text-sb-gold sm:text-3xl lg:text-4xl">
                Association
              </p>
            </BlurFade>

            {/* Motto */}
            <BlurFade delay={0.4} inView>
              <div className="mt-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/40 sm:text-sm">
                <span>Unity</span>
                <span className="h-1 w-1 rounded-full bg-sb-gold/60" />
                <span>Support</span>
                <span className="h-1 w-1 rounded-full bg-sb-gold/60" />
                <span>Progress</span>
              </div>
            </BlurFade>

            {/* Tagline */}
            <BlurFade delay={0.5} inView>
              <p className="mt-8 text-base italic text-white/50 sm:text-lg">
                One Year Group, One Family.
              </p>
            </BlurFade>

            {/* CTA */}
            <BlurFade delay={0.6} inView>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                <Link href="/register">
                  <ShimmerButton
                    background="rgba(200, 150, 46, 1)"
                    shimmerColor="rgba(255, 255, 255, 0.4)"
                    shimmerSize="0.06em"
                    className="px-8 py-3 text-sm font-semibold text-sb-green-dark sm:text-base"
                  >
                    Become a Member
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </ShimmerButton>
                </Link>
                <Link href="/about">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/15 bg-transparent px-8 text-sm text-white/70 hover:bg-white/5 hover:text-white sm:text-base"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </BlurFade>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sb-green to-transparent" />
      </section>

      {/* About Strip */}
      <section className="bg-sb-green">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <BlurFade delay={0.1} inView>
            <p className="text-center text-sm leading-relaxed text-white/70 sm:text-base">
              Founded by the 2009 graduating class of St. Bernadette&apos;s
              Junior High School, Tafo Nhyiaeso, Kumasi. We promote unity,
              welfare, and progress among our members.
            </p>
          </BlurFade>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <BlurFade delay={0.1} inView>
          <div className="text-center">
            <h2 className="font-heading text-2xl font-bold text-sb-green-dark sm:text-3xl">
              What We Offer
            </h2>
            <div className="mx-auto mt-3 h-0.5 w-10 bg-sb-gold" />
          </div>
        </BlurFade>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <BlurFade key={feature.title} delay={0.15 + index * 0.08} inView>
              <Card className="group h-full border-sb-cream-dark bg-white transition-all duration-300 hover:shadow-md hover:border-sb-gold/20 hover:-translate-y-0.5">
                <CardContent className="py-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sb-green/6 text-sb-green-light transition-colors duration-300 group-hover:bg-sb-gold/8 group-hover:text-sb-gold-dark">
                      <feature.icon className="h-[18px] w-[18px]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-sb-green-dark">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative overflow-hidden bg-sb-green-dark">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <BlurFade delay={0.1} inView>
            <div className="flex flex-col items-center">
              {/* Top ornament */}
              <div className="flex items-center gap-3">
                <div className="h-px w-10 bg-sb-gold/30" />
                <div className="h-1.5 w-1.5 rounded-full bg-sb-gold" />
                <div className="h-px w-10 bg-sb-gold/30" />
              </div>

              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35 sm:text-xs">
                Our community in numbers
              </p>

              {/* Stats grid */}
              <div className="mt-10 grid w-full grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-4">
                <div className="flex flex-col items-center text-center">
                  <div className="font-heading text-4xl font-bold text-sb-gold sm:text-5xl">
                    2009
                  </div>
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.15em] text-white/40">
                    Established
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="font-heading text-4xl font-bold text-sb-gold sm:text-5xl">
                    <NumberTicker value={50} delay={0.4} className="text-sb-gold" />
                    <span className="text-sb-gold/70">+</span>
                  </div>
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.15em] text-white/40">
                    Members
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="font-heading text-4xl font-bold text-sb-gold sm:text-5xl">
                    <NumberTicker value={new Date().getFullYear() - 2009} delay={0.6} className="text-sb-gold" />
                  </div>
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.15em] text-white/40">
                    Years strong
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="font-heading text-4xl font-bold text-sb-gold sm:text-5xl">
                    <NumberTicker value={9} delay={0.8} className="text-sb-gold" />
                  </div>
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.15em] text-white/40">
                    Executive officers
                  </p>
                </div>
              </div>

              {/* Bottom ornament */}
              <div className="mt-10 flex items-center gap-3">
                <div className="h-px w-10 bg-sb-gold/30" />
                <div className="h-1.5 w-1.5 rounded-full bg-sb-gold" />
                <div className="h-px w-10 bg-sb-gold/30" />
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-sb-cream-dark bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <BlurFade delay={0.1} inView>
            <div className="flex flex-col items-center text-center">
              <h2 className="font-heading text-2xl font-bold text-sb-green-dark sm:text-3xl">
                Join the Family
              </h2>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                Part of the 2009 year group? Register and reconnect with your
                classmates.
              </p>
              <Link href="/register" className="mt-8">
                <ShimmerButton
                  background="rgba(27, 67, 50, 1)"
                  shimmerColor="rgba(200, 150, 46, 0.4)"
                  shimmerSize="0.06em"
                  className="px-10 py-3 text-sm font-semibold text-white sm:text-base"
                >
                  Register Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </ShimmerButton>
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>
    </>
  );
}
