"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  ShieldCheck,
  Wallet,
  Heart,
  Scale,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowRight,
  Eraser,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SignatureCanvas from "react-signature-canvas";
import confetti from "canvas-confetti";
import { createClient } from "@/lib/supabase/client";
import { MembershipJourney } from "@/components/membership-journey";

// ── Agreement sections from the Constitution ───────────────────────
const AGREEMENT_SECTIONS = [
  {
    id: "membership",
    title: "Membership",
    icon: Users,
    summary: "Membership is a binding commitment to the Association.",
    content: [
      "Membership shall be open to persons who were part of St. Bernadette's 2009 year group.",
      "A person becomes a recognized member when he or she is accepted by the Association, provides his or her details for registration, and agrees to obey this Constitution.",
      "Membership is a binding commitment. A member may not unilaterally cease to be a member after receiving benefits from the Association.",
      "The Association shall keep a register of members with details such as full name, phone number, town or city of residence, next of kin, and emergency contact person.",
    ],
  },
  {
    id: "standing",
    title: "Good Standing",
    icon: ShieldCheck,
    summary: "Requirements for maintaining good standing and full benefits.",
    content: [
      "A member shall be considered in good standing when he or she has paid the commitment fee, pays monthly dues and welfare contributions as agreed, obeys the rules of the Association, does not bring the Association into disrepute, and participates actively in meetings and group activities.",
      "A member shall maintain active participation and high attendance at regional programs and activities of the Association.",
      "Only members in good standing shall enjoy full benefits, voting rights, and eligibility to hold office.",
    ],
  },
  {
    id: "financial",
    title: "Financial Obligations",
    icon: Wallet,
    summary:
      "Commitment fee, monthly dues, and welfare contributions required.",
    content: [
      "Every member shall pay a commitment fee of GH₵100.00.",
      "Every member shall pay monthly dues of GH₵20.00.",
      "Every member shall pay a contribution of GH₵50.00 as agreed by the Association for welfare purposes.",
      "The Association may review these amounts from time to time at a general meeting.",
    ],
  },
  {
    id: "welfare",
    title: "Welfare & Benefits",
    icon: Heart,
    summary:
      "Support provided in times of need for members in good standing.",
    content: [
      "The Association shall provide official support only in the following cases: death of a member; death of a member's mother; death of a member's father; death of a member's spouse; and death of a member's child.",
      "All other matters, including sickness and similar situations, shall be handled through voluntary contributions unless the Association later decides otherwise.",
      "A member shall qualify for official support only if the member is in good standing and the matter is reported to the Association within a reasonable time.",
    ],
  },
  {
    id: "discipline",
    title: "Discipline & Forfeiture",
    icon: Scale,
    summary:
      "Rules of conduct and consequences of non-compliance.",
    content: [
      "A member may be cautioned, suspended from benefits, or sanctioned if he or she disobeys the Constitution, insults or undermines the Association or its officers without just cause, misuses Association funds or property, refuses to comply with agreed obligations, or engages in misconduct that disrupts the peace of the Association.",
      "Before any sanction is applied, the member shall be informed of the complaint, given the chance to explain, and the final decision shall be communicated to the member.",
      "Any member who has accepted this Constitution but willfully refuses to obey it may forfeit welfare support and any other benefits of the Association during the period of default or disciplinary action.",
      "Benefits may be restored when the member complies and the Association accepts the member back into good standing.",
    ],
  },
];

// ── Step 1: Review Agreement ───────────────────────────────────────
function ReviewStep({
  expandedSections,
  onToggleSection,
  onContinue,
}: {
  expandedSections: Set<string>;
  onToggleSection: (id: string) => void;
  onContinue: () => void;
}) {
  const allRead = AGREEMENT_SECTIONS.every((s) =>
    expandedSections.has(s.id)
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-sb-cream-dark/70">
        <span>
          {expandedSections.size} of {AGREEMENT_SECTIONS.length} sections
          reviewed
        </span>
        <span className="text-xs">Step 1 of 3</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-sb-green-dark/30 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-sb-gold"
          initial={{ width: 0 }}
          animate={{
            width: `${(expandedSections.size / AGREEMENT_SECTIONS.length) * 100}%`,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1">
        {AGREEMENT_SECTIONS.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const Icon = section.icon;
          // Track which sections have been opened at least once
          const wasRead = expandedSections.has(section.id);

          return (
            <div
              key={section.id}
              className="rounded-xl border border-sb-green-dark/20 bg-white/5 backdrop-blur-sm overflow-hidden"
            >
              <button
                onClick={() => onToggleSection(section.id)}
                className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-white/5"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                    wasRead
                      ? "bg-green-500/20 text-green-400"
                      : "bg-sb-gold/10 text-sb-gold"
                  }`}
                >
                  {wasRead ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sb-cream text-sm">
                    {section.title}
                  </p>
                  <p className="text-xs text-sb-cream-dark/60 mt-0.5 line-clamp-1">
                    {section.summary}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-sb-cream-dark/50" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-sb-cream-dark/50" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-sb-green-dark/10 px-4 py-3 space-y-2">
                      {section.content.map((text, i) => (
                        <p
                          key={i}
                          className="text-sm text-sb-cream-dark/80 leading-relaxed"
                        >
                          {text}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Continue button */}
      <button
        onClick={onContinue}
        disabled={!allRead}
        className={`mt-2 flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-sm transition-all ${
          allRead
            ? "bg-sb-gold text-sb-green-dark hover:bg-sb-gold-light shadow-lg shadow-sb-gold/20"
            : "bg-white/10 text-sb-cream-dark/40 cursor-not-allowed"
        }`}
      >
        {allRead ? (
          <>
            Continue to Sign
            <ArrowRight className="h-4 w-4" />
          </>
        ) : (
          `Read all ${AGREEMENT_SECTIONS.length} sections to continue`
        )}
      </button>
    </motion.div>
  );
}

// ── Step 2: Signature ──────────────────────────────────────────────
function SignatureStep({
  memberName,
  onBack,
  onSubmit,
  submitting,
}: {
  memberName: string;
  onBack: () => void;
  onSubmit: (signatureDataUrl: string) => void;
  submitting: boolean;
}) {
  const sigRef = useRef<SignatureCanvas>(null);
  const [agreed, setAgreed] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  function handleClear() {
    sigRef.current?.clear();
    setHasSigned(false);
  }

  function handleEnd() {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      setHasSigned(true);
    }
  }

  function handleSubmit() {
    if (!sigRef.current || sigRef.current.isEmpty()) return;
    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
    onSubmit(dataUrl);
  }

  const canSubmit = agreed && hasSigned && !submitting;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between text-sm text-sb-cream-dark/70">
        <button
          onClick={onBack}
          className="text-sb-gold hover:text-sb-gold-light transition-colors text-sm"
        >
          &larr; Back to review
        </button>
        <span className="text-xs">Step 2 of 3</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-sb-green-dark/30 overflow-hidden">
        <div className="h-full w-2/3 rounded-full bg-sb-gold" />
      </div>

      <p className="text-center text-sb-cream text-sm font-medium mt-2">
        Sign below to confirm your acceptance
      </p>

      {/* Signature canvas */}
      <div className="relative rounded-xl border-2 border-dashed border-sb-gold/30 bg-white overflow-hidden">
        {/* Signing guide line */}
        <div className="absolute bottom-[35%] left-[10%] right-[10%] border-b border-dotted border-gray-300" />
        <SignatureCanvas
          ref={sigRef}
          canvasProps={{
            className: "w-full touch-none",
            style: { width: "100%", height: "200px" },
          }}
          penColor="#1B4332"
          minWidth={1.5}
          maxWidth={3.5}
          velocityFilterWeight={0.7}
          onEnd={handleEnd}
        />
        {/* Clear button */}
        <button
          onClick={handleClear}
          className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <Eraser className="h-3 w-3" />
          Clear
        </button>
      </div>

      {/* Agreement checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="mt-0.5 shrink-0">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="h-5 w-5 rounded border-sb-gold/50 bg-white/10 text-sb-gold focus:ring-sb-gold accent-[#C8962E]"
          />
        </div>
        <span className="text-sm text-sb-cream-dark/80 leading-relaxed">
          I, <strong className="text-sb-cream">{memberName}</strong>, have
          read and agree to abide by the Constitution of St. Bernadette&apos;s
          &apos;09 Association.
        </span>
      </label>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-sm transition-all ${
          canSubmit
            ? "bg-sb-gold text-sb-green-dark hover:bg-sb-gold-light shadow-lg shadow-sb-gold/20"
            : "bg-white/10 text-sb-cream-dark/40 cursor-not-allowed"
        }`}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Submit Signature
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </motion.div>
  );
}

// ── Step 3: Celebration ────────────────────────────────────────────
function CelebrationStep({
  memberName,
  signedAt,
}: {
  memberName: string;
  signedAt: string;
}) {
  const router = useRouter();
  const [checkDone, setCheckDone] = useState(false);

  // Trigger confetti on mount
  const confettiRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    // Gold and green confetti
    const colors = ["#C8962E", "#1B4332", "#FAF6F0", "#2D6A4F"];
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });
    // Second burst
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 90,
        origin: { y: 0.5, x: 0.4 },
        colors,
      });
    }, 400);
  }, []);

  return (
    <motion.div
      ref={confettiRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center gap-5 text-center py-4"
    >
      {/* Animated checkmark */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-green-500/20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        />
        <svg
          viewBox="0 0 52 52"
          className="h-16 w-16"
        >
          <motion.circle
            cx="26"
            cy="26"
            r="24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
          <motion.path
            d="M14 27l7 7 16-16"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            onAnimationComplete={() => setCheckDone(true)}
          />
        </svg>
      </div>

      <AnimatePresence>
        {checkDone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <h2 className="text-2xl font-bold text-sb-cream font-heading">
              Welcome, {memberName}!
            </h2>
            <p className="text-sm text-sb-cream-dark/70 max-w-xs">
              You have officially accepted the Constitution of St.
              Bernadette&apos;s &apos;09 Association.
            </p>

            {/* Membership card */}
            <div className="w-full max-w-xs rounded-xl border border-sb-gold/20 bg-white/5 backdrop-blur-sm p-4 space-y-2">
              <div className="flex justify-between text-xs text-sb-cream-dark/60">
                <span>Member</span>
                <span>Date Signed</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-sb-cream">
                  {memberName}
                </span>
                <span className="text-sb-gold">
                  {new Date(signedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="pt-1 border-t border-sb-gold/10 text-center">
                <span className="inline-flex items-center gap-1 text-xs text-green-400 font-medium">
                  <Check className="h-3 w-3" />
                  Agreement Signed
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
              <button
                onClick={() => {
                  router.refresh();
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-sb-gold text-sb-green-dark px-6 py-3.5 font-semibold text-sm hover:bg-sb-gold-light shadow-lg shadow-sb-gold/20 transition-all"
              >
                Continue to Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Share on WhatsApp */}
              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  onClick={async () => {
                    try {
                      await navigator.share({
                        title:
                          "I just joined St. Bernadette's '09 Association!",
                        text: "I am now an official member of the St. Bernadette's '09 Association. One Year Group, One Family! 🎉",
                        url: "https://sbfamily.vercel.app",
                      });
                    } catch {
                      // User cancelled share
                    }
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/10 text-sb-cream px-6 py-3 text-sm hover:bg-white/15 transition-all"
                >
                  Share on WhatsApp
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Agreement Wall Component ──────────────────────────────────
export function AgreementWall({
  memberId,
  memberName,
}: {
  memberId: string;
  memberName: string;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  // Track which sections have been opened at least once (for progress)
  const [readSections, setReadSections] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [signedAt, setSignedAt] = useState<string>("");

  function handleToggleSection(id: string) {
    // Track reading
    setReadSections((prev) => new Set(prev).add(id));

    // Toggle expand/collapse
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSubmitSignature(signatureDataUrl: string) {
    setSubmitting(true);
    try {
      const supabase = createClient();

      // Convert data URL to blob for upload
      const response = await fetch(signatureDataUrl);
      const blob = await response.blob();

      // Upload signature image to Supabase Storage
      const fileName = `${memberId}/signature-${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from("member-signatures")
        .upload(fileName, blob, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        // Continue even if upload fails - the timestamp is more important
      }

      // Get the public URL for the signature
      const { data: urlData } = supabase.storage
        .from("member-signatures")
        .getPublicUrl(fileName);

      const now = new Date().toISOString();

      // Update member record with signed timestamp and signature URL
      const { error: updateError } = await supabase
        .from("members")
        .update({
          signed_agreement_at: now,
          signature_url: urlData?.publicUrl || null,
        })
        .eq("id", memberId);

      if (updateError) {
        console.error("Update error:", updateError);
        alert("Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSignedAt(now);
      setStep(3);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sb-green-dark">
      <div className="w-full max-w-md mx-auto px-4 py-6 max-h-screen overflow-y-auto">
        {/* Journey context */}
        <div className="mb-4">
          <MembershipJourney currentStep={3} compact />
        </div>

        {/* Header with logo */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <img
            src="/icons/icon-192.svg"
            alt="SB '09"
            width={64}
            height={64}
            className="rounded-full"
          />
          <div className="text-center">
            <h1 className="text-xl font-bold text-sb-cream font-heading">
              Membership Agreement
            </h1>
            <p className="text-xs text-sb-cream-dark/60 mt-1">
              St. Bernadette&apos;s &apos;09 Association
            </p>
          </div>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <ReviewStep
              key="review"
              expandedSections={readSections}
              onToggleSection={handleToggleSection}
              onContinue={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <SignatureStep
              key="signature"
              memberName={memberName}
              onBack={() => setStep(1)}
              onSubmit={handleSubmitSignature}
              submitting={submitting}
            />
          )}
          {step === 3 && (
            <CelebrationStep
              key="celebration"
              memberName={memberName}
              signedAt={signedAt}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
