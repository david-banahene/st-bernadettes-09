"use client";

import {
  UserPlus,
  Hourglass,
  PenLine,
  Wallet,
  LayoutDashboard,
  Check,
} from "lucide-react";

const STEPS = [
  {
    label: "Apply",
    description: "Submit your membership application",
    icon: UserPlus,
  },
  {
    label: "Approval",
    description: "Leadership reviews your application",
    icon: Hourglass,
  },
  {
    label: "Sign Agreement",
    description: "Read and accept the constitution",
    icon: PenLine,
  },
  {
    label: "Pay Fee",
    description: "Pay the GH₵100 commitment fee",
    icon: Wallet,
  },
  {
    label: "Full Access",
    description: "Your dashboard is fully unlocked",
    icon: LayoutDashboard,
  },
];

interface MembershipJourneyProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  compact?: boolean;
}

export function MembershipJourney({
  currentStep,
  compact = false,
}: MembershipJourneyProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-center gap-1 py-2">
        {STEPS.map((step, i) => {
          const stepNum = i + 1;
          const isComplete = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={step.label} className="flex items-center gap-1">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                  isComplete
                    ? "bg-green-500 text-white"
                    : isCurrent
                      ? "bg-sb-gold text-sb-green-dark"
                      : "bg-white/15 text-white/40"
                }`}
              >
                {isComplete ? <Check className="h-3 w-3" /> : stepNum}
              </div>
              <span
                className={`hidden text-[10px] sm:inline ${
                  isCurrent
                    ? "font-semibold text-sb-gold"
                    : isComplete
                      ? "text-green-400"
                      : "text-white/40"
                }`}
              >
                {step.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-0.5 h-px w-3 sm:w-5 ${
                    isComplete ? "bg-green-500" : "bg-white/15"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const isComplete = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const isFuture = stepNum > currentStep;
        const isLast = i === STEPS.length - 1;
        const Icon = step.icon;

        return (
          <div key={step.label} className="flex gap-3">
            {/* Connector line + circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  isComplete
                    ? "border-green-500 bg-green-500 text-white"
                    : isCurrent
                      ? "border-sb-gold bg-sb-gold text-sb-green-dark"
                      : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[28px] ${
                    isComplete ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>

            {/* Text */}
            <div className={`pb-5 ${isLast ? "pb-0" : ""}`}>
              <p
                className={`text-sm font-semibold leading-9 ${
                  isComplete
                    ? "text-green-600"
                    : isCurrent
                      ? "text-sb-green-dark"
                      : "text-gray-400"
                }`}
              >
                {step.label}
                {isCurrent && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-sb-gold/15 px-2 py-0.5 text-[10px] font-semibold text-sb-gold-dark">
                    You are here
                  </span>
                )}
              </p>
              <p
                className={`text-xs ${
                  isFuture ? "text-gray-400" : "text-muted-foreground"
                }`}
              >
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
