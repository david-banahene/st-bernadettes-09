"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

// Countries most relevant to the association at the top, then alphabetical
const COUNTRY_CODES = [
  // Most common for members
  { code: "GH", name: "Ghana", dial: "+233", flag: "\u{1F1EC}\u{1F1ED}" },
  { code: "US", name: "United States", dial: "+1", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "\u{1F1EC}\u{1F1E7}" },
  { code: "CA", name: "Canada", dial: "+1", flag: "\u{1F1E8}\u{1F1E6}" },
  // Separator - other African countries
  { code: "NG", name: "Nigeria", dial: "+234", flag: "\u{1F1F3}\u{1F1EC}" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "\u{1F1FF}\u{1F1E6}" },
  { code: "KE", name: "Kenya", dial: "+254", flag: "\u{1F1F0}\u{1F1EA}" },
  { code: "TZ", name: "Tanzania", dial: "+255", flag: "\u{1F1F9}\u{1F1FF}" },
  { code: "CI", name: "Ivory Coast", dial: "+225", flag: "\u{1F1E8}\u{1F1EE}" },
  { code: "SN", name: "Senegal", dial: "+221", flag: "\u{1F1F8}\u{1F1F3}" },
  { code: "CM", name: "Cameroon", dial: "+237", flag: "\u{1F1E8}\u{1F1F2}" },
  { code: "TG", name: "Togo", dial: "+228", flag: "\u{1F1F9}\u{1F1EC}" },
  { code: "BJ", name: "Benin", dial: "+229", flag: "\u{1F1E7}\u{1F1EF}" },
  { code: "BF", name: "Burkina Faso", dial: "+226", flag: "\u{1F1E7}\u{1F1EB}" },
  { code: "EG", name: "Egypt", dial: "+20", flag: "\u{1F1EA}\u{1F1EC}" },
  { code: "ET", name: "Ethiopia", dial: "+251", flag: "\u{1F1EA}\u{1F1F9}" },
  { code: "RW", name: "Rwanda", dial: "+250", flag: "\u{1F1F7}\u{1F1FC}" },
  { code: "UG", name: "Uganda", dial: "+256", flag: "\u{1F1FA}\u{1F1EC}" },
  // Europe
  { code: "DE", name: "Germany", dial: "+49", flag: "\u{1F1E9}\u{1F1EA}" },
  { code: "FR", name: "France", dial: "+33", flag: "\u{1F1EB}\u{1F1F7}" },
  { code: "IT", name: "Italy", dial: "+39", flag: "\u{1F1EE}\u{1F1F9}" },
  { code: "ES", name: "Spain", dial: "+34", flag: "\u{1F1EA}\u{1F1F8}" },
  { code: "NL", name: "Netherlands", dial: "+31", flag: "\u{1F1F3}\u{1F1F1}" },
  { code: "BE", name: "Belgium", dial: "+32", flag: "\u{1F1E7}\u{1F1EA}" },
  { code: "SE", name: "Sweden", dial: "+46", flag: "\u{1F1F8}\u{1F1EA}" },
  { code: "NO", name: "Norway", dial: "+47", flag: "\u{1F1F3}\u{1F1F4}" },
  { code: "DK", name: "Denmark", dial: "+45", flag: "\u{1F1E9}\u{1F1F0}" },
  { code: "CH", name: "Switzerland", dial: "+41", flag: "\u{1F1E8}\u{1F1ED}" },
  { code: "AT", name: "Austria", dial: "+43", flag: "\u{1F1E6}\u{1F1F9}" },
  { code: "IE", name: "Ireland", dial: "+353", flag: "\u{1F1EE}\u{1F1EA}" },
  { code: "PT", name: "Portugal", dial: "+351", flag: "\u{1F1F5}\u{1F1F9}" },
  // Middle East & Asia
  { code: "AE", name: "UAE", dial: "+971", flag: "\u{1F1E6}\u{1F1EA}" },
  { code: "SA", name: "Saudi Arabia", dial: "+966", flag: "\u{1F1F8}\u{1F1E6}" },
  { code: "QA", name: "Qatar", dial: "+974", flag: "\u{1F1F6}\u{1F1E6}" },
  { code: "KW", name: "Kuwait", dial: "+965", flag: "\u{1F1F0}\u{1F1FC}" },
  { code: "IN", name: "India", dial: "+91", flag: "\u{1F1EE}\u{1F1F3}" },
  { code: "CN", name: "China", dial: "+86", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "JP", name: "Japan", dial: "+81", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "AU", name: "Australia", dial: "+61", flag: "\u{1F1E6}\u{1F1FA}" },
  { code: "NZ", name: "New Zealand", dial: "+64", flag: "\u{1F1F3}\u{1F1FF}" },
  // Americas
  { code: "BR", name: "Brazil", dial: "+55", flag: "\u{1F1E7}\u{1F1F7}" },
  { code: "MX", name: "Mexico", dial: "+52", flag: "\u{1F1F2}\u{1F1FD}" },
  { code: "JM", name: "Jamaica", dial: "+1876", flag: "\u{1F1EF}\u{1F1F2}" },
  { code: "TT", name: "Trinidad & Tobago", dial: "+1868", flag: "\u{1F1F9}\u{1F1F9}" },
];

// Parse an existing international number into dial code + local number
function parsePhone(value: string): { dialCode: string; localNumber: string } {
  if (!value) return { dialCode: "+233", localNumber: "" };

  // Try to match against known dial codes (longest first to match +1876 before +1)
  const sortedCodes = [...COUNTRY_CODES].sort(
    (a, b) => b.dial.length - a.dial.length
  );

  for (const country of sortedCodes) {
    if (value.startsWith(country.dial)) {
      return {
        dialCode: country.dial,
        localNumber: value.slice(country.dial.length),
      };
    }
  }

  // If no match, default to Ghana and treat entire value as local
  return { dialCode: "+233", localNumber: value.replace(/^\+/, "") };
}

interface PhoneInputProps {
  name: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({
  name,
  required = false,
  defaultValue = "",
  placeholder = "XX XXX XXXX",
  className = "",
}: PhoneInputProps) {
  const parsed = parsePhone(defaultValue);
  const [dialCode, setDialCode] = useState(parsed.dialCode);
  const [localNumber, setLocalNumber] = useState(parsed.localNumber);

  // Combine into full international number for form submission
  const fullNumber = `${dialCode}${localNumber.replace(/\s/g, "")}`;

  // Find the selected country for flag display
  const selectedCountry = COUNTRY_CODES.find((c) => c.dial === dialCode);

  return (
    <div className={`flex gap-1 ${className}`}>
      {/* Country code dropdown */}
      <select
        value={dialCode}
        onChange={(e) => setDialCode(e.target.value)}
        className="w-[130px] shrink-0 rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Country code"
      >
        {COUNTRY_CODES.map((c) => (
          <option key={`${c.code}-${c.dial}`} value={c.dial}>
            {c.flag} {c.dial} {c.name}
          </option>
        ))}
      </select>

      {/* Local number input */}
      <Input
        type="tel"
        value={localNumber}
        onChange={(e) => setLocalNumber(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="flex-1"
      />

      {/* Hidden input with full international number for form submission */}
      <input type="hidden" name={name} value={fullNumber} />
    </div>
  );
}
