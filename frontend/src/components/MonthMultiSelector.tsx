import React, { useState } from "react";
import { Calendar, Check, ChevronLeft, ChevronRight, X } from "lucide-react";

/**
 * Danh sách 12 tháng bằng tiếng Tây Ban Nha và chữ viết tắt chuẩn
 */
export const SPANISH_MONTHS: Array<{ num: number; full: string; short: string }> = [
  { num: 1, full: "enero", short: "ene." },
  { num: 2, full: "febrero", short: "feb." },
  { num: 3, full: "marzo", short: "mar." },
  { num: 4, full: "abril", short: "abr." },
  { num: 5, full: "mayo", short: "may." },
  { num: 6, full: "junio", short: "jun." },
  { num: 7, full: "julio", short: "jul." },
  { num: 8, full: "agosto", short: "ago." },
  { num: 9, full: "septiembre", short: "sep." },
  { num: 10, full: "octubre", short: "oct." },
  { num: 11, full: "noviembre", short: "nov." },
  { num: 12, full: "diciembre", short: "dic." },
];

export function formatSpanishMonthKey(monthKey: string): string {
  const [mNum, yNum] = monthKey.split("/");
  const sp = SPANISH_MONTHS.find((s) => s.num === Number(mNum));
  return sp ? `${sp.short} ${yNum}` : monthKey;
}

/**
 * Chuyển đổi chuỗi tour_date thành danh sách các tháng chuẩn "MM/YYYY"
 */
export function parseTourMonths(val?: string | null): string[] {
  if (!val || typeof val !== "string" || !val.trim()) return [];
  const parts = val.split(/[,;\n\r]+/).map((s) => s.trim()).filter(Boolean);
  const result: string[] = [];

  for (const part of parts) {
    // Định dạng MM/YYYY
    const m1 = part.match(/^(\d{1,2})\/(\d{4})$/);
    if (m1) {
      const month = m1[1].padStart(2, "0");
      const year = m1[2];
      const key = `${month}/${year}`;
      if (!result.includes(key)) result.push(key);
      continue;
    }
    // Định dạng YYYY-MM hoặc YYYY-MM-DD (dữ liệu cũ)
    const m2 = part.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
    if (m2) {
      const year = m2[1];
      const month = m2[2].padStart(2, "0");
      const key = `${month}/${year}`;
      if (!result.includes(key)) result.push(key);
      continue;
    }
    // Fallback
    if (!result.includes(part)) result.push(part);
  }

  // Sắp xếp thứ tự thời gian tăng dần
  result.sort((a, b) => {
    const [ma, ya] = a.split("/").map(Number);
    const [mb, yb] = b.split("/").map(Number);
    if (ya !== yb) return (ya || 0) - (yb || 0);
    return (ma || 0) - (mb || 0);
  });

  return result;
}

/**
 * Định dạng hiển thị danh sách tháng khởi hành trên UI bảng/thẻ
 */
export function formatDepartureMonths(val?: string | null): {
  primary: string;
  count: number;
  all: string[];
  fullText: string;
} {
  const months = parseTourMonths(val);
  if (months.length === 0) {
    return { primary: "—", count: 0, all: [], fullText: "Chưa xác định" };
  }
  if (months.length === 1) {
    return { primary: months[0], count: 1, all: months, fullText: months[0] };
  }
  if (months.length === 2) {
    return {
      primary: `${months[0]} · ${months[1]}`,
      count: 2,
      all: months,
      fullText: months.join(" · "),
    };
  }
  return {
    primary: `${months[0]} +${months.length - 1}`,
    count: months.length,
    all: months,
    fullText: months.join(" · "),
  };
}

interface MonthMultiSelectorProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
}

export const MonthMultiSelector: React.FC<MonthMultiSelectorProps> = ({
  value,
  onChange,
  label = "Tháng khởi hành mong muốn",
  required = false,
}) => {
  const currentYear = new Date().getFullYear();
  const [activeYear, setActiveYear] = useState<number>(currentYear);

  const selectedMonths = parseTourMonths(value);

  const toggleMonth = (monthNum: number, year: number) => {
    const key = `${String(monthNum).padStart(2, "0")}/${year}`;
    let updated: string[];
    if (selectedMonths.includes(key)) {
      updated = selectedMonths.filter((m) => m !== key);
    } else {
      updated = [...selectedMonths, key];
    }
    // Sắp xếp thứ tự thời gian
    updated.sort((a, b) => {
      const [ma, ya] = a.split("/").map(Number);
      const [mb, yb] = b.split("/").map(Number);
      if (ya !== yb) return (ya || 0) - (yb || 0);
      return (ma || 0) - (mb || 0);
    });
    onChange(updated.join(", "));
  };

  const removeMonth = (monthKey: string) => {
    const updated = selectedMonths.filter((m) => m !== monthKey);
    onChange(updated.join(", "));
  };

  const clearAll = () => {
    onChange("");
  };

  const selectWholeQuarter = (quarter: number) => {
    const startM = (quarter - 1) * 3 + 1;
    const quarterMonths = [
      `${String(startM).padStart(2, "0")}/${activeYear}`,
      `${String(startM + 1).padStart(2, "0")}/${activeYear}`,
      `${String(startM + 2).padStart(2, "0")}/${activeYear}`,
    ];
    const newSet = new Set([...selectedMonths, ...quarterMonths]);
    const updated = Array.from(newSet);
    updated.sort((a, b) => {
      const [ma, ya] = a.split("/").map(Number);
      const [mb, yb] = b.split("/").map(Number);
      if (ya !== yb) return (ya || 0) - (yb || 0);
      return (ma || 0) - (mb || 0);
    });
    onChange(updated.join(", "));
  };

  return (
    <div className="field month-multi-selector-field" style={{ marginTop: "14px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-main)" }}>
          {label}
          {required && <em style={{ color: "var(--error-text, #ef4444)" }}> *</em>}
        </span>
        <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
          Khách có thể chọn 1 hoặc nhiều tháng đi tour
        </span>
      </div>

      {/* Selected Months Chips */}
      <div
        className="month-selected-chips-container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          minHeight: "36px",
          padding: "6px 10px",
          background: "var(--bg-input, rgba(0,0,0,0.15))",
          border: "1px solid var(--border-color, #253044)",
          borderRadius: "8px",
          marginBottom: "10px",
          alignItems: "center",
        }}
      >
        {selectedMonths.length === 0 ? (
          <span style={{ fontSize: "12px", color: "var(--text-dim)", fontStyle: "italic" }}>
            Chưa chọn tháng nào. Hãy nhấp chọn các tháng mong muốn bên dưới.
          </span>
        ) : (
          <>
            {selectedMonths.map((m) => (
              <span
                key={m}
                className="month-selected-chip"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "3px 8px",
                  background: "var(--nav-active-bg, rgba(59, 130, 246, 0.15))",
                  border: "1px solid var(--primary, #3b82f6)",
                  color: "var(--text-main)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <Calendar size={12} style={{ color: "var(--primary, #3b82f6)" }} />
                <span>{m}</span>
                <button
                  type="button"
                  onClick={() => removeMonth(m)}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "0",
                    marginLeft: "2px",
                    cursor: "pointer",
                    color: "var(--text-dim)",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title={`Bỏ chọn tháng ${m}`}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAll}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "11px",
                color: "var(--text-dim)",
                cursor: "pointer",
                textDecoration: "underline",
                marginLeft: "auto",
              }}
            >
              Xóa tất cả
            </button>
          </>
        )}
      </div>

      {/* Year Switcher and Month Grid Picker */}
      <div
        className="month-picker-grid-box"
        style={{
          background: "var(--bg-card, rgba(255,255,255,0.03))",
          border: "1px solid var(--border-color, #253044)",
          borderRadius: "8px",
          padding: "12px",
        }}
      >
        {/* Year Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              type="button"
              className="button button-secondary"
              style={{ padding: "4px 8px", minHeight: "auto", height: "28px" }}
              onClick={() => setActiveYear((y) => y - 1)}
              title="Năm trước"
            >
              <ChevronLeft size={14} />
            </button>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--text-main)",
                minWidth: "60px",
                textAlign: "center",
              }}
            >
              Năm {activeYear}
            </span>
            <button
              type="button"
              className="button button-secondary"
              style={{ padding: "4px 8px", minHeight: "auto", height: "28px" }}
              onClick={() => setActiveYear((y) => y + 1)}
              title="Năm sau"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Quick Year Jump Tabs */}
          <div style={{ display: "flex", gap: "4px" }}>
            {[currentYear, currentYear + 1, currentYear + 2].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setActiveYear(yr)}
                style={{
                  padding: "3px 8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  borderRadius: "5px",
                  border:
                    activeYear === yr
                      ? "1px solid var(--primary, #3b82f6)"
                      : "1px solid var(--border-color, #253044)",
                  background:
                    activeYear === yr
                      ? "var(--nav-active-bg, rgba(59, 130, 246, 0.2))"
                      : "transparent",
                  color:
                    activeYear === yr
                      ? "var(--primary, #3b82f6)"
                      : "var(--text-dim)",
                  cursor: "pointer",
                }}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* 12 Months Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px",
          }}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((monthNum) => {
            const monthKey = `${String(monthNum).padStart(2, "0")}/${activeYear}`;
            const isSelected = selectedMonths.includes(monthKey);

            return (
              <button
                key={monthNum}
                type="button"
                onClick={() => toggleMonth(monthNum, activeYear)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: isSelected
                    ? "1px solid var(--primary, #3b82f6)"
                    : "1px solid var(--border-color, #253044)",
                  background: isSelected
                    ? "var(--primary, #3b82f6)"
                    : "var(--bg-input, rgba(0,0,0,0.1))",
                  color: isSelected ? "#ffffff" : "var(--text-main)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: isSelected ? 600 : 500,
                  transition: "all 0.15s ease",
                }}
                title={`${SPANISH_MONTHS[monthNum - 1].full} (${monthKey})`}
              >
                <span>
                  {SPANISH_MONTHS[monthNum - 1].short} ({String(monthNum).padStart(2, "0")}/{activeYear})
                </span>
                {isSelected ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <span
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "3px",
                      border: "1px solid var(--border-color, #475569)",
                      display: "inline-block",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Quarter Selection */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "10px",
            paddingTop: "8px",
            borderTop: "1px solid var(--border-row, rgba(255,255,255,0.06))",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>Chọn nhanh năm {activeYear}:</span>
          {[1, 2, 3, 4].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => selectWholeQuarter(q)}
              style={{
                padding: "2px 7px",
                fontSize: "10px",
                borderRadius: "4px",
                background: "transparent",
                border: "1px solid var(--border-color, #253044)",
                color: "var(--text-dim)",
                cursor: "pointer",
              }}
            >
              Quý {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
