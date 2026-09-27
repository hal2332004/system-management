import React, { useState, useRef, useEffect } from "react";
import { Plus, X, MapPin } from "lucide-react";
import { ALLOWED_DESTINATIONS, Destination } from "@/types";

interface DestinationMultiSelectProps {
  value?: string[] | null;
  onChange: (val: string[]) => void;
  label?: string;
  error?: string;
}

export function DestinationMultiSelect({
  value = [],
  onChange,
  label = "Destino",
  error,
}: DestinationMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentList = Array.isArray(value) ? value : [];

  const availableOptions = ALLOWED_DESTINATIONS.filter(
    (d) => !currentList.includes(d)
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleAdd = (dest: Destination) => {
    if (!currentList.includes(dest)) {
      onChange([...currentList, dest]);
    }
  };

  const handleRemove = (dest: string) => {
    onChange(currentList.filter((d) => d !== dest));
  };

  return (
    <div className="field destino-field" ref={containerRef} style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontWeight: 600 }}>
          <MapPin size={13} style={{ color: "var(--accent-primary)" }} /> {label}
        </span>
        <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
          {currentList.length > 0 ? `Đã chọn ${currentList.length} điểm đến` : "Tùy chọn đa điểm đến"}
        </span>
      </div>

      <div
        className="destino-selector-box"
        style={{
          minHeight: "42px",
          padding: "6px 10px",
          background: "var(--bg-input)",
          border: error ? "1px solid var(--error-text)" : "1px solid var(--border-input)",
          borderRadius: "6px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "6px",
          position: "relative",
          transition: "border-color 0.15s ease",
        }}
      >
        {currentList.map((dest) => (
          <span
            key={dest}
            className="destino-tag"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "3px 8px 3px 10px",
              fontSize: "12px",
              fontWeight: 500,
              background: "rgba(59, 130, 246, 0.12)",
              color: "var(--accent-primary, #60a5fa)",
              border: "1px solid rgba(59, 130, 246, 0.28)",
              borderRadius: "14px",
              lineHeight: 1.4,
              animation: "fadeIn 0.15s ease-in-out",
            }}
          >
            {dest}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(dest);
              }}
              title={`Xóa ${dest}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "transparent",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                padding: 0,
                opacity: 0.7,
                transition: "opacity 0.15s, background-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.7";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <X size={11} />
            </button>
          </span>
        ))}

        {availableOptions.length > 0 ? (
          <button
            type="button"
            className="btn-add-destino"
            onClick={() => setOpen(!open)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-main)",
              background: "var(--bg-card)",
              border: "1px dashed var(--border-dropdown, #34425b)",
              borderRadius: "14px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-primary)";
              e.currentTarget.style.color = "var(--accent-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-dropdown, #34425b)";
              e.currentTarget.style.color = "var(--text-main)";
            }}
          >
            <Plus size={12} /> Chọn destino
          </button>
        ) : (
          <span style={{ fontSize: "11px", color: "var(--text-dim)", padding: "2px 6px" }}>
            Đã chọn toàn bộ điểm đến
          </span>
        )}
      </div>

      {open && availableOptions.length > 0 && (
        <div
          className="destino-dropdown-menu"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 50,
            width: "280px",
            maxWidth: "100%",
            background: "var(--bg-card)",
            border: "1px solid var(--border-main)",
            borderRadius: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
            padding: "6px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4px",
          }}
        >
          <div
            style={{
              gridColumn: "1 / -1",
              padding: "4px 8px 6px",
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-dim)",
              borderBottom: "1px solid var(--border-subtle)",
              marginBottom: "2px",
            }}
          >
            Chọn điểm đến:
          </div>
          {availableOptions.map((dest) => (
            <button
              key={dest}
              type="button"
              onClick={() => {
                handleAdd(dest);
                // Keep dropdown open for easy multi-selection, or close if no more
                if (availableOptions.length <= 1) setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 10px",
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--text-main)",
                background: "transparent",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                textAlign: "left",
                transition: "background-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-hover, rgba(255,255,255,0.06))";
                e.currentTarget.style.color = "var(--accent-primary, #60a5fa)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-main)";
              }}
            >
              <Plus size={11} style={{ opacity: 0.6 }} />
              {dest}
            </button>
          ))}
        </div>
      )}

      {error && (
        <span style={{ fontSize: "11px", color: "var(--error-text)", marginTop: "4px", display: "block" }}>
          {error}
        </span>
      )}
    </div>
  );
}
