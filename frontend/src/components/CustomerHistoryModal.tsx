import React from "react";
import {
  X,
  Phone,
  Mail,
  RotateCcw,
  CheckCircle2,
  Clock,
  Ban,
  UserRound,
  Users,
} from "lucide-react";
import type { CustomerHistoryData, OrderStatus } from "@/types";
import { CountryFlag } from "./CountryFlag";
import { ALL_COUNTRIES } from "@/lib/countries";
import { formatDepartureMonths } from "./MonthMultiSelector";

interface CustomerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CustomerHistoryData | null;
  loading?: boolean;
}

const statusMeta: Record<
  OrderStatus,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  new: {
    label: "Mới",
    bg: "rgba(59, 130, 246, 0.12)",
    text: "#3b82f6",
    icon: <Clock size={12} />,
  },
  consulting: {
    label: "Đang tư vấn",
    bg: "rgba(245, 158, 11, 0.12)",
    text: "#f59e0b",
    icon: <Clock size={12} />,
  },
  closed: {
    label: "Đã chốt",
    bg: "rgba(16, 185, 129, 0.12)",
    text: "#10b981",
    icon: <CheckCircle2 size={12} />,
  },
  cancelled: {
    label: "Đã hủy",
    bg: "rgba(239, 68, 68, 0.12)",
    text: "#ef4444",
    icon: <Ban size={12} />,
  },
};

export function CustomerHistoryModal({
  isOpen,
  onClose,
  data,
  loading = false,
}: CustomerHistoryModalProps) {
  if (!isOpen) return null;

  const customer = data?.customer;
  const visits = data?.visits || [];
  const countryObj = customer?.country
    ? ALL_COUNTRIES.find((c) => c.code === customer.country)
    : null;

  const totalOrders = visits.reduce((acc, v) => acc + (v.orders?.length || 0), 0);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: "16px",
          border: "1px solid var(--border-main)",
          width: "100%",
          maxWidth: "760px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(139, 92, 246, 0.12)",
                color: "#8b5cf6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RotateCcw size={18} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text-heading)",
                  margin: 0,
                }}
              >
                Lịch sử khách hàng
              </h2>
              <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                Hành trình tương tác & các đơn tour đã tạo
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-dim)",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--text-dim)",
                fontSize: "13px",
              }}
            >
              Đang tải lịch sử khách hàng...
            </div>
          ) : !customer ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--text-dim)",
                fontSize: "13px",
              }}
            >
              Không tìm thấy thông tin khách hàng.
            </div>
          ) : (
            <>
              {/* Customer Profile Banner */}
              <div
                style={{
                  background: "var(--bg-body)",
                  borderRadius: "12px",
                  border: "1px solid var(--border-subtle)",
                  padding: "16px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "var(--text-heading)",
                        }}
                      >
                        {customer.full_name}
                      </span>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background: "rgba(139, 92, 246, 0.12)",
                          color: "#8b5cf6",
                          border: "1px solid rgba(139, 92, 246, 0.25)",
                        }}
                      >
                        {customer.customer_code}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "14px",
                        fontSize: "12px",
                        color: "var(--text-main)",
                        marginTop: "8px",
                      }}
                    >
                      {customer.phone && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <Phone size={13} style={{ color: "var(--text-dim)" }} />
                          {customer.phone}
                        </span>
                      )}
                      {customer.email && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <Mail size={13} style={{ color: "var(--text-dim)" }} />
                          {customer.email}
                        </span>
                      )}
                      {customer.country && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <CountryFlag code={customer.country} size="sm" />
                          <span>{countryObj?.name || customer.country}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary Badges */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <div
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background: "rgba(37, 99, 235, 0.08)",
                        border: "1px solid rgba(37, 99, 235, 0.2)",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#2563eb",
                          display: "block",
                        }}
                      >
                        {visits.length > 1 ? visits.length - 1 : 0}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          color: "var(--text-dim)",
                          textTransform: "uppercase",
                          fontWeight: 600,
                        }}
                      >
                        Lần quay lại
                      </span>
                    </div>
                    <div
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#10b981",
                          display: "block",
                        }}
                      >
                        {totalOrders}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          color: "var(--text-dim)",
                          textTransform: "uppercase",
                          fontWeight: 600,
                        }}
                      >
                        Tổng đơn tour
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline of Return Visits */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {visits.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "var(--text-dim)",
                      fontSize: "13px",
                    }}
                  >
                    Chưa có lịch sử đợt quay lại nào.
                  </div>
                ) : (
                  visits.map((visit) => {
                    const ordersCount = visit.orders?.length || 0;
                    return (
                      <div
                        key={visit.id}
                        style={{
                          background: "var(--bg-body)",
                          borderRadius: "12px",
                          border: "1px solid var(--border-subtle)",
                          overflow: "hidden",
                        }}
                      >
                        {/* Visit Header */}
                        <div
                          style={{
                            padding: "10px 14px",
                            background: "var(--bg-card-alt)",
                            borderBottom: "1px solid var(--border-subtle)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                background: "#7c3aed",
                                color: "#ffffff",
                                fontSize: "11px",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "6px",
                              }}
                            >
                              {visit.visit_number === 1 ? "Lần đầu tiên (Khách mới)" : `Quay lại lần ${visit.visit_number - 1}`}
                            </span>
                            <span
                              style={{
                                fontSize: "11px",
                                color: "var(--text-dim)",
                              }}
                            >
                              Khởi tạo:{" "}
                              {new Date(visit.created_at).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "var(--text-dim)",
                            }}
                          >
                            {ordersCount} đơn tour trong đợt này
                          </span>
                        </div>

                        {/* Orders List inside this visit */}
                        <div
                          style={{
                            padding: "12px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          {ordersCount === 0 ? (
                            <div
                              style={{
                                fontSize: "12px",
                                color: "var(--text-dim)",
                                fontStyle: "italic",
                                padding: "8px",
                              }}
                            >
                              Chưa có đơn tour nào gắn với đợt quay lại này.
                            </div>
                          ) : (
                            visit.orders.map((ord) => {
                              const stMeta =
                                statusMeta[ord.status] || statusMeta.new;
                              const depFormatted = formatDepartureMonths(
                                ord.tour_date
                              );

                              return (
                                <div
                                  key={ord.id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "10px 12px",
                                    background: "var(--bg-card)",
                                    borderRadius: "8px",
                                    border: "1px solid var(--border-subtle)",
                                    gap: "12px",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {/* Left: Code + Tour */}
                                  <div style={{ minWidth: "160px", flex: 1 }}>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        marginBottom: "3px",
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontFamily: "monospace",
                                          fontSize: "11px",
                                          fontWeight: 700,
                                          color: "var(--mono-color)",
                                        }}
                                      >
                                        {ord.order_code}
                                      </span>
                                      {ord.tour_type === "privado" ? (
                                        <span
                                          style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "3px",
                                            fontSize: "10px",
                                            fontWeight: 600,
                                            padding: "1px 6px",
                                            borderRadius: "4px",
                                            background: "rgba(124, 58, 237, 0.12)",
                                            color: "#7c3aed",
                                          }}
                                        >
                                          <UserRound size={11} /> Privado
                                        </span>
                                      ) : (
                                        <span
                                          style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "3px",
                                            fontSize: "10px",
                                            fontWeight: 600,
                                            padding: "1px 6px",
                                            borderRadius: "4px",
                                            background: "rgba(37, 99, 235, 0.12)",
                                            color: "#2563eb",
                                          }}
                                        >
                                          <Users size={11} /> Grupal
                                        </span>
                                      )}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: "var(--text-heading)",
                                      }}
                                    >
                                      {ord.tour_type === "privado" &&
                                      ord.private_tour_name
                                        ? `${ord.private_tour_name} (${ord.tour_name})`
                                        : ord.tour_name}
                                    </div>
                                  </div>

                                  {/* Middle: Departure month */}
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      color: "var(--text-main)",
                                      minWidth: "120px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "10px",
                                        color: "var(--text-dim)",
                                        textTransform: "uppercase",
                                      }}
                                    >
                                      Tháng khởi hành
                                    </div>
                                    <span
                                      style={{ fontWeight: 600 }}
                                      title={depFormatted.fullText}
                                    >
                                      {depFormatted.primary}
                                    </span>
                                  </div>

                                  {/* Right: Status badge & Saler */}
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                    }}
                                  >
                                    <span
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        padding: "3px 8px",
                                        borderRadius: "6px",
                                        background: stMeta.bg,
                                        color: stMeta.text,
                                      }}
                                    >
                                      {stMeta.icon}
                                      <span>{stMeta.label}</span>
                                    </span>

                                    {ord.owner && (
                                      <span
                                        style={{
                                          fontSize: "11px",
                                          color: "var(--text-dim)",
                                        }}
                                        title={`Phụ trách: ${ord.owner.display_name}`}
                                      >
                                        @{ord.owner.username}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ fontSize: "12px" }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
