"use client";

import { NumberTicker } from "@/components/ui/number-ticker";

export function AnimatedAmount({
  value,
  prefix = "",
}: {
  value: number;
  prefix?: string;
}) {
  return (
    <span className="tabular-nums">
      {prefix}
      <NumberTicker value={value} decimalPlaces={2} />
    </span>
  );
}
