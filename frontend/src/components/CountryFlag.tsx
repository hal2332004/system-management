import React, { useState } from "react";
import { ALL_COUNTRIES } from "@/lib/countries";

interface CountryFlagProps {
  code?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}

export function CountryFlag({
  code,
  name,
  size = "md",
  className = "",
  style = {},
}: CountryFlagProps) {
  const [hasError, setHasError] = useState(false);

  if (!code || typeof code !== "string" || !code.trim()) {
    return <span style={{ color: "var(--text-dim)", fontSize: "12px" }}>—</span>;
  }

  const cleanCode = code.trim().toLowerCase();
  const c = ALL_COUNTRIES.find((x) => x.code.toLowerCase() === cleanCode);
  const countryName = name || c?.name || code.toUpperCase();

  const dimensions = {
    sm: { w: 18, h: 12 },
    md: { w: 22, h: 15 },
    lg: { w: 26, h: 18 },
  }[size];

  // If cleanCode is not a valid 2-letter ISO code or image failed to load
  if (hasError || cleanCode.length !== 2) {
    return (
      <span
        title={countryName}
        style={{
          fontSize: size === "sm" ? "13px" : size === "lg" ? "18px" : "15px",
          lineHeight: 1,
          display: "inline-block",
          ...style,
        }}
        className={className}
      >
        {c?.flag || code.toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${cleanCode}.png`}
      srcSet={`https://flagcdn.com/w80/${cleanCode}.png 2x`}
      width={dimensions.w}
      height={dimensions.h}
      alt={countryName}
      title={countryName}
      loading="lazy"
      onError={() => setHasError(true)}
      style={{
        width: `${dimensions.w}px`,
        height: `${dimensions.h}px`,
        borderRadius: "2.5px",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.28), 0 0 1px rgba(255, 255, 255, 0.15) inset",
        display: "inline-block",
        verticalAlign: "middle",
        objectFit: "cover",
        flexShrink: 0,
        ...style,
      }}
      className={className}
    />
  );
}
