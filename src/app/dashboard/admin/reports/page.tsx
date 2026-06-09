"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Loader2,
  Shield,
  Download,
  CalendarDays,
  Ticket,
  Users,
  TrendingUp,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

interface Member {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  commitment_fee_paid: boolean;
  good_standing: boolean;
  signed_agreement_at: string | null;
}

interface DuesRecord {
  id: string;
  member_id: string;
  month: string;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
}

interface EventRecord {
  id: string;
  title: string;
  event_date: string;
  payment_amount: number | null;
}

interface EventPayment {
  id: string;
  member_id: string;
  event_id: string;
  status: string;
  payment_method: string;
  paid_at: string | null;
  created_at: string;
}

// ── PDF Generator ──────────────────────────────────────────────────

async function generateReport(config: {
  title: string;
  subtitle: string;
  columns: string[];
  rows: string[][];
  summaryItems: { label: string; value: string }[];
  fileName: string;
}) {
  // Dynamic import so the library only loads when admin clicks export
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF("portrait", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;

  // ── Colors ──
  const darkGreen: [number, number, number] = [27, 67, 50]; // #1B4332
  const gold: [number, number, number] = [200, 150, 46]; // #C8962E
  const cream: [number, number, number] = [250, 246, 240]; // #FAF6F0
  const lightGreen: [number, number, number] = [45, 106, 79]; // #2D6A4F
  const white: [number, number, number] = [255, 255, 255];

  // ── Header bar (dark green) ──
  doc.setFillColor(...darkGreen);
  doc.rect(0, 0, pageWidth, 36, "F");

  // Gold accent line below header
  doc.setFillColor(...gold);
  doc.rect(0, 36, pageWidth, 2, "F");

  // Logo circle in header
  doc.setFillColor(...darkGreen);
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.8);
  doc.circle(margin + 10, 18, 10, "FD");

  // SB text in logo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...gold);
  doc.text("SB", margin + 10, 17, { align: "center" });

  // '09 text in logo
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...cream);
  doc.text("'09", margin + 10, 22, { align: "center" });

  // Association name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...cream);
  doc.text("St. Bernadette's '09 Association", margin + 26, 15);

  // Motto
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...gold);
  doc.text("Unity  |  Support  |  Progress", margin + 26, 22);

  // Location line
  doc.setFontSize(7);
  doc.setTextColor(200, 200, 200);
  doc.text(
    "St. Bernadette's Junior High School  |  Tafo Nhyiaeso, Kumasi, Ghana",
    margin + 26,
    28
  );

  // ── Report title section ──
  let yPos = 48;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...darkGreen);
  doc.text(config.title, margin, yPos);

  yPos += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(config.subtitle, margin, yPos);

  // Gold underline
  yPos += 4;
  doc.setFillColor(...gold);
  doc.rect(margin, yPos, 30, 1, "F");

  // ── Summary cards row ──
  yPos += 10;
  const cardWidth =
    (pageWidth - margin * 2 - (config.summaryItems.length - 1) * 4) /
    config.summaryItems.length;

  config.summaryItems.forEach((item, i) => {
    const cardX = margin + i * (cardWidth + 4);

    // Card background
    doc.setFillColor(...cream);
    doc.setDrawColor(220, 220, 210);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, yPos, cardWidth, 18, 2, 2, "FD");

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...darkGreen);
    doc.text(item.value, cardX + cardWidth / 2, yPos + 9, {
      align: "center",
    });

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(item.label, cardX + cardWidth / 2, yPos + 15, {
      align: "center",
    });
  });

  yPos += 28;

  // ── Data table ──
  autoTable(doc, {
    startY: yPos,
    head: [config.columns],
    body: config.rows,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      lineColor: [220, 220, 210],
      lineWidth: 0.2,
      textColor: [40, 40, 40],
      font: "helvetica",
    },
    headStyles: {
      fillColor: darkGreen,
      textColor: cream,
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [248, 246, 242],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 8 }, // # column
    },
    didDrawPage: (data) => {
      // Footer on every page
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageNum = doc.getCurrentPageInfo().pageNumber;
      const totalPages = doc.getNumberOfPages();

      // Footer gold line
      doc.setFillColor(...gold);
      doc.rect(margin, pageHeight - 16, pageWidth - margin * 2, 0.5, "F");

      // Footer text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(140, 140, 140);
      doc.text(
        `Generated on ${new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })} at ${new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        margin,
        pageHeight - 10
      );
      doc.text(
        "St. Bernadette's '09 Association",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
      doc.text(
        `Page ${pageNum} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: "right" }
      );
    },
  });

  // ── Total/summary row after table ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || yPos + 20;

  if (finalY < doc.internal.pageSize.getHeight() - 30) {
    doc.setFillColor(...cream);
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.4);
    doc.roundedRect(
      margin,
      finalY + 4,
      pageWidth - margin * 2,
      10,
      1.5,
      1.5,
      "FD"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...darkGreen);
    doc.text(
      `Total Records: ${config.rows.length}`,
      margin + 4,
      finalY + 10.5
    );

    // Find amount column and sum it
    const amountColIndex = config.columns.findIndex(
      (c) =>
        c.toLowerCase().includes("amount") ||
        c.toLowerCase().includes("collected")
    );
    if (amountColIndex >= 0) {
      const total = config.rows.reduce((sum, row) => {
        const val = parseFloat(row[amountColIndex]?.replace(/[^\d.]/g, "") || "0");
        return sum + val;
      }, 0);
      if (total > 0) {
        doc.text(
          `Total Amount: GH₵ ${total.toFixed(2)}`,
          pageWidth - margin - 4,
          finalY + 10.5,
          { align: "right" }
        );
      }
    }
  }

  // Save the PDF
  doc.save(config.fileName);
}

// ── Helper: format month string ────────────────────────────────────

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Month options (last 12 + next 1) ──────────────────────────────

function getMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = -12; i <= 1; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
    options.push({ value, label });
  }
  return options.reverse();
}

// ── Main Component ─────────────────────────────────────────────────

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"dues" | "events" | "summary">(
    "dues"
  );

  // Data
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);

  // Dues tab state
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [duesData, setDuesData] = useState<DuesRecord[]>([]);
  const [loadingDues, setLoadingDues] = useState(false);

  // Events tab state
  const [selectedEventId, setSelectedEventId] = useState("");
  const [eventPayments, setEventPayments] = useState<EventPayment[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(false);

  // Summary tab state
  const [allDues, setAllDues] = useState<DuesRecord[]>([]);
  const [allEventPayments, setAllEventPayments] = useState<EventPayment[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: me } = await supabase
      .from("members")
      .select("role")
      .eq("id", user.id)
      .single();

    if (me?.role !== "admin") {
      setLoading(false);
      return;
    }
    setAuthorized(true);

    // Load all members
    const { data: membersData } = await supabase
      .from("members")
      .select(
        "id, full_name, phone_number, email, commitment_fee_paid, good_standing, signed_agreement_at"
      )
      .order("full_name");

    setMembers(membersData || []);

    // Load events that have payment amounts
    const { data: eventsData } = await supabase
      .from("events")
      .select("id, title, event_date, payment_amount")
      .not("payment_amount", "is", null)
      .order("event_date", { ascending: false });

    setEvents(eventsData || []);

    setLoading(false);
  }

  // ── Load dues for selected month ──
  const loadDuesForMonth = useCallback(
    async (month: string) => {
      setLoadingDues(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("monthly_dues")
        .select("*")
        .eq("month", `${month}-01`)
        .order("member_id");

      setDuesData(data || []);
      setLoadingDues(false);
    },
    []
  );

  useEffect(() => {
    if (authorized && activeTab === "dues") {
      loadDuesForMonth(selectedMonth);
    }
  }, [authorized, activeTab, selectedMonth, loadDuesForMonth]);

  // ── Load payments for selected event ──
  const loadEventPayments = useCallback(async (eventId: string) => {
    if (!eventId) return;
    setLoadingEvent(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("event_payments")
      .select("*")
      .eq("event_id", eventId)
      .order("member_id");

    setEventPayments(data || []);
    setLoadingEvent(false);
  }, []);

  useEffect(() => {
    if (authorized && activeTab === "events" && selectedEventId) {
      loadEventPayments(selectedEventId);
    }
  }, [authorized, activeTab, selectedEventId, loadEventPayments]);

  // ── Load summary data ──
  const loadSummaryData = useCallback(async () => {
    setLoadingSummary(true);
    const supabase = createClient();

    const { data: dues } = await supabase
      .from("monthly_dues")
      .select("*")
      .order("month");

    const { data: payments } = await supabase
      .from("event_payments")
      .select("*")
      .order("created_at");

    setAllDues(dues || []);
    setAllEventPayments(payments || []);
    setLoadingSummary(false);
  }, []);

  useEffect(() => {
    if (authorized && activeTab === "summary") {
      loadSummaryData();
    }
  }, [authorized, activeTab, loadSummaryData]);

  // ── Export: Dues Report ──
  async function exportDuesReport() {
    setExporting(true);
    const paidCount = duesData.filter((d) => d.status === "paid").length;
    const pendingCount = duesData.filter((d) => d.status === "pending").length;
    const claimedCount = duesData.filter(
      (d) => d.status === "member_claimed"
    ).length;
    const totalCollected = duesData
      .filter((d) => d.status === "paid")
      .reduce((s, d) => s + d.amount, 0);

    const rows = duesData.map((d, i) => {
      const member = members.find((m) => m.id === d.member_id);
      return [
        String(i + 1),
        member?.full_name || "Unknown",
        member?.phone_number || "-",
        `GH₵ ${d.amount.toFixed(2)}`,
        d.status === "paid"
          ? "Paid"
          : d.status === "member_claimed"
            ? "Claimed"
            : "Pending",
        formatDate(d.paid_at),
      ];
    });

    // If no dues records, show all members as "No Record"
    if (rows.length === 0) {
      members.forEach((m, i) => {
        rows.push([
          String(i + 1),
          m.full_name,
          m.phone_number,
          "GH₵ 20.00",
          "No Record",
          "-",
        ]);
      });
    }

    await generateReport({
      title: "Monthly Dues Report",
      subtitle: `Period: ${formatMonth(selectedMonth)}`,
      columns: ["#", "Member Name", "Phone", "Amount", "Status", "Date Paid"],
      rows,
      summaryItems: [
        { label: "Total Members", value: String(members.length) },
        { label: "Paid", value: String(paidCount) },
        { label: "Pending", value: String(pendingCount + claimedCount) },
        {
          label: "Collected",
          value: `GH₵ ${totalCollected.toFixed(2)}`,
        },
      ],
      fileName: `Dues-Report-${formatMonth(selectedMonth).replace(/\s/g, "-")}.pdf`,
    });
    setExporting(false);
  }

  // ── Export: Event Payment Report ──
  async function exportEventReport() {
    setExporting(true);
    const event = events.find((e) => e.id === selectedEventId);
    if (!event) {
      setExporting(false);
      return;
    }

    const paidCount = eventPayments.filter(
      (p) => p.status === "confirmed"
    ).length;
    const pendingCount = eventPayments.filter(
      (p) => p.status === "pending"
    ).length;
    const totalCollected = paidCount * (event.payment_amount || 0);

    const rows = eventPayments.map((p, i) => {
      const member = members.find((m) => m.id === p.member_id);
      return [
        String(i + 1),
        member?.full_name || "Unknown",
        member?.phone_number || "-",
        `GH₵ ${(event.payment_amount || 0).toFixed(2)}`,
        p.status === "confirmed" ? "Confirmed" : "Pending",
        p.payment_method || "MoMo",
        formatDate(p.paid_at),
      ];
    });

    await generateReport({
      title: "Event Payment Report",
      subtitle: `Event: ${event.title}  |  Date: ${formatDate(event.event_date)}`,
      columns: [
        "#",
        "Member Name",
        "Phone",
        "Amount",
        "Status",
        "Method",
        "Date Confirmed",
      ],
      rows,
      summaryItems: [
        { label: "Total Payments", value: String(eventPayments.length) },
        { label: "Confirmed", value: String(paidCount) },
        { label: "Pending", value: String(pendingCount) },
        {
          label: "Collected",
          value: `GH₵ ${totalCollected.toFixed(2)}`,
        },
      ],
      fileName: `Event-Report-${event.title.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`,
    });
    setExporting(false);
  }

  // ── Export: Member Financial Summary ──
  async function exportSummaryReport() {
    setExporting(true);

    const rows = members.map((m, i) => {
      // Dues paid / total
      const memberDues = allDues.filter((d) => d.member_id === m.id);
      const duesPaid = memberDues.filter((d) => d.status === "paid").length;
      const duesTotal = memberDues.length;
      const duesAmount = memberDues
        .filter((d) => d.status === "paid")
        .reduce((s, d) => s + d.amount, 0);

      // Event payments
      const memberEvents = allEventPayments.filter(
        (p) => p.member_id === m.id
      );
      const eventsPaid = memberEvents.filter(
        (p) => p.status === "confirmed"
      ).length;

      return [
        String(i + 1),
        m.full_name,
        m.phone_number,
        m.commitment_fee_paid ? "Paid" : "Not Paid",
        duesTotal > 0 ? `${duesPaid}/${duesTotal}` : "0/0",
        `GH₵ ${duesAmount.toFixed(2)}`,
        String(eventsPaid),
        m.good_standing ? "Yes" : "No",
        m.signed_agreement_at ? "Signed" : "Not Signed",
      ];
    });

    const totalDuesPaid = allDues
      .filter((d) => d.status === "paid")
      .reduce((s, d) => s + d.amount, 0);
    const commitmentPaid = members.filter(
      (m) => m.commitment_fee_paid
    ).length;
    const goodStanding = members.filter((m) => m.good_standing).length;
    const signed = members.filter((m) => m.signed_agreement_at).length;

    await generateReport({
      title: "Member Financial Summary",
      subtitle: `As of ${new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}  |  All-time overview`,
      columns: [
        "#",
        "Member",
        "Phone",
        "Commitment",
        "Dues (Paid/Total)",
        "Dues Amount",
        "Events Paid",
        "Standing",
        "Agreement",
      ],
      rows,
      summaryItems: [
        { label: "Members", value: String(members.length) },
        { label: "Commitment Paid", value: String(commitmentPaid) },
        { label: "Good Standing", value: String(goodStanding) },
        { label: "Total Dues Collected", value: `GH₵ ${totalDuesPaid.toFixed(2)}` },
        { label: "Signed", value: `${signed}/${members.length}` },
      ],
      fileName: `Member-Summary-${new Date().toISOString().slice(0, 10)}.pdf`,
    });
    setExporting(false);
  }

  // ── Render ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-sb-green" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="py-20 text-center">
        <Shield className="mx-auto h-8 w-8 text-sb-cream-dark" />
        <p className="mt-2 text-sm text-muted-foreground">Admin access only.</p>
      </div>
    );
  }

  // Build preview data for the active tab
  const duesPaidCount = duesData.filter((d) => d.status === "paid").length;
  const duesPendingCount = duesData.filter(
    (d) => d.status === "pending" || d.status === "member_claimed"
  ).length;
  const duesCollected = duesData
    .filter((d) => d.status === "paid")
    .reduce((s, d) => s + d.amount, 0);

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const eventPaidCount = eventPayments.filter(
    (p) => p.status === "confirmed"
  ).length;
  const eventPendingCount = eventPayments.filter(
    (p) => p.status === "pending"
  ).length;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-gold/10 text-sb-gold-dark">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-sb-green-dark">
            Financial Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate and download professional PDF reports
          </p>
        </div>
      </div>

      {/* Tab selector */}
      <div className="mt-6 flex gap-1 rounded-xl bg-sb-cream-dark/30 p-1">
        {[
          {
            key: "dues" as const,
            label: "Dues by Month",
            icon: CalendarDays,
          },
          {
            key: "events" as const,
            label: "Event Payments",
            icon: Ticket,
          },
          {
            key: "summary" as const,
            label: "Member Summary",
            icon: Users,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white text-sb-green-dark shadow-sm"
                : "text-muted-foreground hover:text-sb-green-dark"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Dues Tab ── */}
      {activeTab === "dues" && (
        <div className="mt-6 space-y-4">
          {/* Controls */}
          <Card className="border-sb-cream-dark bg-white">
            <CardContent className="flex flex-wrap items-end gap-4 pt-6">
              <div className="flex-1 min-w-[200px]">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Select Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full rounded-lg border border-sb-cream-dark bg-white px-3 py-2 text-sm"
                >
                  {getMonthOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={exportDuesReport}
                disabled={exporting}
                className="bg-sb-green text-white hover:bg-sb-green-light"
              >
                {exporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download PDF
              </Button>
            </CardContent>
          </Card>

          {/* Stats preview */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="border-sb-cream-dark bg-white">
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xl font-bold text-sb-green-dark">
                  {members.length}
                </p>
                <p className="text-xs text-muted-foreground">Total Members</p>
              </CardContent>
            </Card>
            <Card className="border-sb-cream-dark bg-white">
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xl font-bold text-green-600">
                  {duesPaidCount}
                </p>
                <p className="text-xs text-muted-foreground">Paid</p>
              </CardContent>
            </Card>
            <Card className="border-sb-cream-dark bg-white">
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xl font-bold text-amber-600">
                  {duesPendingCount}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card className="border-sb-cream-dark bg-white">
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xl font-bold text-sb-gold-dark">
                  GH₵ {duesCollected.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Collected</p>
              </CardContent>
            </Card>
          </div>

          {/* Preview table */}
          {loadingDues ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-sb-green" />
            </div>
          ) : duesData.length > 0 ? (
            <Card className="border-sb-cream-dark bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sb-cream-dark bg-sb-green-dark text-sb-cream">
                      <th className="px-4 py-3 text-left font-medium">#</th>
                      <th className="px-4 py-3 text-left font-medium">
                        Member
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Date Paid
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {duesData.map((d, i) => {
                      const member = members.find(
                        (m) => m.id === d.member_id
                      );
                      return (
                        <tr
                          key={d.id}
                          className={`border-b border-sb-cream-dark/50 ${
                            i % 2 === 0 ? "bg-white" : "bg-sb-cream/30"
                          }`}
                        >
                          <td className="px-4 py-2.5 font-medium text-muted-foreground">
                            {i + 1}
                          </td>
                          <td className="px-4 py-2.5 font-medium text-sb-green-dark">
                            {member?.full_name || "Unknown"}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {member?.phone_number || "-"}
                          </td>
                          <td className="px-4 py-2.5">
                            GH₵ {d.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge
                              className={
                                d.status === "paid"
                                  ? "bg-green-50 text-green-600"
                                  : d.status === "member_claimed"
                                    ? "bg-sb-gold/10 text-sb-gold-dark"
                                    : "bg-amber-50 text-amber-600"
                              }
                            >
                              {d.status === "paid"
                                ? "Paid"
                                : d.status === "member_claimed"
                                  ? "Claimed"
                                  : "Pending"}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {formatDate(d.paid_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="border-sb-cream-dark bg-white">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No dues records for {formatMonth(selectedMonth)}. Generate dues
                from the Dues & Payments page first.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Events Tab ── */}
      {activeTab === "events" && (
        <div className="mt-6 space-y-4">
          <Card className="border-sb-cream-dark bg-white">
            <CardContent className="flex flex-wrap items-end gap-4 pt-6">
              <div className="flex-1 min-w-[200px]">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Select Event
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full rounded-lg border border-sb-cream-dark bg-white px-3 py-2 text-sm"
                >
                  <option value="">Choose an event...</option>
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} (GH₵{" "}
                      {(evt.payment_amount || 0).toFixed(2)}) -{" "}
                      {formatDate(evt.event_date)}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={exportEventReport}
                disabled={exporting || !selectedEventId}
                className="bg-sb-green text-white hover:bg-sb-green-light"
              >
                {exporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download PDF
              </Button>
            </CardContent>
          </Card>

          {selectedEventId && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card className="border-sb-cream-dark bg-white">
                  <CardContent className="pt-4 pb-3 text-center">
                    <p className="text-xl font-bold text-sb-green-dark">
                      {eventPayments.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total Payments
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-sb-cream-dark bg-white">
                  <CardContent className="pt-4 pb-3 text-center">
                    <p className="text-xl font-bold text-green-600">
                      {eventPaidCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Confirmed</p>
                  </CardContent>
                </Card>
                <Card className="border-sb-cream-dark bg-white">
                  <CardContent className="pt-4 pb-3 text-center">
                    <p className="text-xl font-bold text-amber-600">
                      {eventPendingCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </CardContent>
                </Card>
                <Card className="border-sb-cream-dark bg-white">
                  <CardContent className="pt-4 pb-3 text-center">
                    <p className="text-xl font-bold text-sb-gold-dark">
                      GH₵{" "}
                      {(
                        eventPaidCount * (selectedEvent?.payment_amount || 0)
                      ).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Collected</p>
                  </CardContent>
                </Card>
              </div>

              {loadingEvent ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-sb-green" />
                </div>
              ) : eventPayments.length > 0 ? (
                <Card className="border-sb-cream-dark bg-white overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-sb-cream-dark bg-sb-green-dark text-sb-cream">
                          <th className="px-4 py-3 text-left font-medium">
                            #
                          </th>
                          <th className="px-4 py-3 text-left font-medium">
                            Member
                          </th>
                          <th className="px-4 py-3 text-left font-medium">
                            Phone
                          </th>
                          <th className="px-4 py-3 text-left font-medium">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left font-medium">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left font-medium">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventPayments.map((p, i) => {
                          const member = members.find(
                            (m) => m.id === p.member_id
                          );
                          return (
                            <tr
                              key={p.id}
                              className={`border-b border-sb-cream-dark/50 ${
                                i % 2 === 0 ? "bg-white" : "bg-sb-cream/30"
                              }`}
                            >
                              <td className="px-4 py-2.5 font-medium text-muted-foreground">
                                {i + 1}
                              </td>
                              <td className="px-4 py-2.5 font-medium text-sb-green-dark">
                                {member?.full_name || "Unknown"}
                              </td>
                              <td className="px-4 py-2.5 text-muted-foreground">
                                {member?.phone_number || "-"}
                              </td>
                              <td className="px-4 py-2.5">
                                GH₵{" "}
                                {(selectedEvent?.payment_amount || 0).toFixed(
                                  2
                                )}
                              </td>
                              <td className="px-4 py-2.5">
                                <Badge
                                  className={
                                    p.status === "confirmed"
                                      ? "bg-green-50 text-green-600"
                                      : "bg-amber-50 text-amber-600"
                                  }
                                >
                                  {p.status === "confirmed"
                                    ? "Confirmed"
                                    : "Pending"}
                                </Badge>
                              </td>
                              <td className="px-4 py-2.5 text-muted-foreground">
                                {formatDate(p.paid_at || p.created_at)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <Card className="border-sb-cream-dark bg-white">
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No payment records for this event yet.
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {!selectedEventId && (
            <Card className="border-sb-cream-dark bg-white">
              <CardContent className="py-12 text-center">
                <Ticket className="mx-auto h-8 w-8 text-sb-cream-dark" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Select an event above to view and export payment records
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Summary Tab ── */}
      {activeTab === "summary" && (
        <div className="mt-6 space-y-4">
          <Card className="border-sb-cream-dark bg-white">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
              <div>
                <p className="text-sm font-medium text-sb-green-dark">
                  All-Time Member Financial Summary
                </p>
                <p className="text-xs text-muted-foreground">
                  Commitment fees, dues history, event payments, standing, and
                  agreement status for every member
                </p>
              </div>
              <Button
                onClick={exportSummaryReport}
                disabled={exporting || loadingSummary}
                className="bg-sb-green text-white hover:bg-sb-green-light"
              >
                {exporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download PDF
              </Button>
            </CardContent>
          </Card>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="border-sb-cream-dark bg-white">
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xl font-bold text-sb-green-dark">
                  {members.length}
                </p>
                <p className="text-xs text-muted-foreground">Total Members</p>
              </CardContent>
            </Card>
            <Card className="border-sb-cream-dark bg-white">
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xl font-bold text-green-600">
                  {members.filter((m) => m.commitment_fee_paid).length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Commitment Paid
                </p>
              </CardContent>
            </Card>
            <Card className="border-sb-cream-dark bg-white">
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xl font-bold text-sb-green">
                  {members.filter((m) => m.good_standing).length}
                </p>
                <p className="text-xs text-muted-foreground">Good Standing</p>
              </CardContent>
            </Card>
            <Card className="border-sb-cream-dark bg-white">
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xl font-bold text-sb-gold-dark">
                  {members.filter((m) => m.signed_agreement_at).length}/
                  {members.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Agreement Signed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Summary preview table */}
          {loadingSummary ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-sb-green" />
            </div>
          ) : (
            <Card className="border-sb-cream-dark bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sb-cream-dark bg-sb-green-dark text-sb-cream">
                      <th className="px-3 py-3 text-left font-medium">#</th>
                      <th className="px-3 py-3 text-left font-medium">
                        Member
                      </th>
                      <th className="px-3 py-3 text-left font-medium">
                        Commitment
                      </th>
                      <th className="px-3 py-3 text-left font-medium">
                        Dues
                      </th>
                      <th className="px-3 py-3 text-left font-medium">
                        Events
                      </th>
                      <th className="px-3 py-3 text-left font-medium">
                        Standing
                      </th>
                      <th className="px-3 py-3 text-left font-medium">
                        Signed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, i) => {
                      const memberDues = allDues.filter(
                        (d) => d.member_id === m.id
                      );
                      const duesPaid = memberDues.filter(
                        (d) => d.status === "paid"
                      ).length;
                      const memberEventPay = allEventPayments.filter(
                        (p) => p.member_id === m.id && p.status === "confirmed"
                      ).length;

                      return (
                        <tr
                          key={m.id}
                          className={`border-b border-sb-cream-dark/50 ${
                            i % 2 === 0 ? "bg-white" : "bg-sb-cream/30"
                          }`}
                        >
                          <td className="px-3 py-2.5 font-medium text-muted-foreground">
                            {i + 1}
                          </td>
                          <td className="px-3 py-2.5 font-medium text-sb-green-dark">
                            {m.full_name}
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge
                              className={
                                m.commitment_fee_paid
                                  ? "bg-green-50 text-green-600"
                                  : "bg-red-50 text-red-600"
                              }
                            >
                              {m.commitment_fee_paid ? "Paid" : "No"}
                            </Badge>
                          </td>
                          <td className="px-3 py-2.5 text-muted-foreground">
                            {duesPaid}/{memberDues.length}
                          </td>
                          <td className="px-3 py-2.5 text-muted-foreground">
                            {memberEventPay}
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge
                              className={
                                m.good_standing
                                  ? "bg-green-50 text-green-600"
                                  : "bg-amber-50 text-amber-600"
                              }
                            >
                              {m.good_standing ? "Yes" : "No"}
                            </Badge>
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge
                              className={
                                m.signed_agreement_at
                                  ? "bg-green-50 text-green-600"
                                  : "bg-amber-50 text-amber-600"
                              }
                            >
                              {m.signed_agreement_at ? "Yes" : "No"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
