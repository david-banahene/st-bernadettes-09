import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Constitution",
  description:
    "View and download the official Constitution of St. Bernadette's '09 Association.",
};

const articles = [
  { number: 1, title: "Name of the Association" },
  { number: 2, title: "Location" },
  { number: 3, title: "Motto, Slogan, and Logo" },
  { number: 4, title: "Aims and Objectives" },
  { number: 5, title: "Membership" },
  { number: 6, title: "Member in Good Standing" },
  { number: 7, title: "Financial Obligations" },
  { number: 8, title: "Welfare and Benefits" },
  { number: 9, title: "Organs of the Association" },
  { number: 10, title: "Executive Officers" },
  { number: 11, title: "Duties of Officers" },
  { number: 12, title: "Tenure of Office" },
  { number: 13, title: "Election of Officers" },
  { number: 14, title: "Meetings" },
  { number: 15, title: "Quorum" },
  { number: 16, title: "Decision Making" },
  { number: 17, title: "Finance and Accountability" },
  { number: 18, title: "Discipline" },
  { number: 19, title: "Forfeiture of Benefits" },
  { number: 20, title: "Interim Executives" },
  { number: 21, title: "Records and Register" },
  { number: 22, title: "Amendment of the Constitution" },
  { number: 23, title: "Interpretation" },
  { number: 24, title: "Adoption" },
];

export default function ConstitutionPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-sb-green-dark py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Constitution
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/70">
              The official governing document of St. Bernadette&apos;s &apos;09
              Association. This Constitution guides the affairs of the
              Association in a simple, fair, and orderly way.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Download Card */}
        <Card className="border-sb-gold/30 bg-white">
          <CardContent className="flex flex-col items-center gap-6 pt-8 sm:flex-row sm:items-start">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-sb-green/10 text-sb-green">
              <FileText className="h-8 w-8" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg font-semibold text-sb-green-dark">
                Constitution of St. Bernadette&apos;s &apos;09 Association
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                PDF document, 9 pages. Includes all 24 articles and the
                membership acceptance form.
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge
                  variant="secondary"
                  className="bg-sb-cream text-sb-green-dark"
                >
                  Year Group 2009
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-sb-cream text-sb-green-dark"
                >
                  24 Articles
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-sb-cream text-sb-green-dark"
                >
                  Designed by David Banahene
                </Badge>
              </div>
            </div>
            <a
              href="/constitution.pdf"
              download="St_Bernadettes_09_Constitution.pdf"
            >
              <Button className="bg-sb-gold text-sb-green-dark hover:bg-sb-gold-light font-semibold">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Table of Contents */}
        <div className="mt-12">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-sb-green" />
            <h2 className="text-xl font-bold text-sb-green-dark">
              Table of Contents
            </h2>
          </div>

          <Card className="mt-6 border-sb-cream-dark bg-white">
            <CardContent className="pt-6">
              <div className="grid gap-0 divide-y divide-sb-cream-dark">
                {articles.map((article) => (
                  <div
                    key={article.number}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sb-green/10 text-xs font-semibold text-sb-green">
                        {article.number}
                      </span>
                      <span className="text-sm text-foreground">
                        {article.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Note */}
        <div className="mt-8 rounded-lg border border-sb-gold/20 bg-sb-gold/5 p-4">
          <p className="text-center text-sm text-sb-gold-dark">
            This Constitution may be amended at a general meeting with notice
            given before the meeting and approved by not less than two-thirds
            (2/3) of members present and voting. (Article 22)
          </p>
        </div>
      </div>
    </>
  );
}
