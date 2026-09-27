import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Search,
  Phone,
  Mail,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  X,
  History,
} from "lucide-react";
import type {
  CustomerSearchResult,
  CustomerHistoryData,
  CustomerReturnVisit,
  Customer,
} from "@/types";
import {
  searchCustomers,
  getCustomerHistory,
  detectTourDateOverlap,
  OverlapDetectionResult,
} from "@/services/customerService";
import { CustomerHistoryModal } from "./CustomerHistoryModal";
import { CountryFlag } from "./CountryFlag";
import { ALL_COUNTRIES } from "@/lib/countries";

export interface CustomerSelectionState {
  mode: "new" | "existing";
  selectedCustomer: Customer | null;
  returnVisitDecision: "new_visit" | "same_visit";
  existingVisitId: string | null;
  targetVisitNumber: number;
}

interface CustomerSelectionSectionProps {
  tourDate: string;
  excludeOrderId?: string;
  initialCustomer?: Customer | null;
  initialVisit?: CustomerReturnVisit | null;
  isEditing?: boolean;
  customerPhone?: string;
  customerEmail?: string;
  onCustomerStateChange: (state: CustomerSelectionState) => void;
  onCustomerSelected?: (customer: {
    full_name: string;
    phone: string | null;
    email: string | null;
    country: string | null;
  }) => void;
}

export function CustomerSelectionSection({
  tourDate,
  excludeOrderId,
  initialCustomer,
  initialVisit,
  isEditing = false,
  customerPhone,
  customerEmail,
  onCustomerStateChange,
  onCustomerSelected,
}: CustomerSelectionSectionProps) {
  const [mode, setMode] = useState<"new" | "existing">(
    initialCustomer && !isEditing ? "existing" : isEditing ? "existing" : "new"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    initialCustomer || null
  );
  const [customerHistory, setCustomerHistory] = useState<CustomerHistoryData | null>(
    null
  );
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Quyết định đợt quay lại
  const [decision, setDecision] = useState<"new_visit" | "same_visit">("new_visit");
  const [selectedExistingVisitId, setSelectedExistingVisitId] = useState<string | null>(
    initialVisit?.id || null
  );

  const [overlapResult, setOverlapResult] = useState<OverlapDetectionResult>({
    hasOverlap: false,
    overlappingOrders: [],
    overlappingVisits: [],
    matchingMonths: [],
  });

  const [duplicateSuggestion, setDuplicateSuggestion] = useState<CustomerSearchResult | null>(null);
  const [dismissedDuplicateId, setDismissedDuplicateId] = useState<string | null>(null);

  // Kiểm tra trùng lặp khách hàng khi Saler nhập SĐT hoặc Email ở chế độ Khách mới (Requirement 26)
  useEffect(() => {
    if (mode !== "new" || selectedCustomer || isEditing) {
      setDuplicateSuggestion(null);
      return;
    }

    const cleanPhone = (customerPhone || "").trim();
    const cleanEmail = (customerEmail || "").trim();

    if (cleanPhone.length < 6 && (!cleanEmail || !cleanEmail.includes("@"))) {
      setDuplicateSuggestion(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const queryToSearch = cleanPhone.length >= 6 ? cleanPhone : cleanEmail;
        const results = await searchCustomers(queryToSearch);
        const exactMatch = results.find((r) => {
          if (cleanPhone.length >= 6 && r.phone) {
            const p1 = r.phone.replace(/[^0-9]/g, "");
            const p2 = cleanPhone.replace(/[^0-9]/g, "");
            if (p1 && p2 && (p1 === p2 || p1.endsWith(p2) || p2.endsWith(p1))) return true;
          }
          if (cleanEmail && r.email && r.email.toLowerCase() === cleanEmail.toLowerCase()) {
            return true;
          }
          return false;
        });

        if (exactMatch) {
          setDuplicateSuggestion(exactMatch);
        } else {
          setDuplicateSuggestion(null);
        }
      } catch (err) {
        console.error("Lỗi kiểm tra trùng lặp khách hàng:", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [mode, customerPhone, customerEmail, selectedCustomer, isEditing]);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Khi tải thông tin khách cũ trong form edit
  useEffect(() => {
    if (initialCustomer && isEditing) {
      setSelectedCustomer(initialCustomer);
      loadHistory(initialCustomer.id);
      if (initialVisit) {
        setDecision("same_visit");
        setSelectedExistingVisitId(initialVisit.id);
      }
    }
  }, [initialCustomer, initialVisit, isEditing]);

  // Load history khi chọn customer
  async function loadHistory(customerId: string) {
    setLoadingHistory(true);
    try {
      const data = await getCustomerHistory(customerId);
      setCustomerHistory(data);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử khách hàng:", err);
    } finally {
      setLoadingHistory(false);
    }
  }

  // Tự động kiểm tra trùng tour_date khi tourDate hoặc customerHistory thay đổi
  useEffect(() => {
    if (!customerHistory || !customerHistory.visits) return;

    const result = detectTourDateOverlap(
      tourDate,
      customerHistory.visits,
      excludeOrderId
    );
    setOverlapResult(result);

    // Nếu có trùng lặp và chưa chọn cụ thể, gợi ý đợt quay lại bị trùng
    if (result.hasOverlap && result.overlappingVisits.length > 0) {
      const suggestedVisit = result.overlappingVisits[0];
      if (!isEditing) {
        setDecision("same_visit");
        setSelectedExistingVisitId(suggestedVisit.id);
      }
    } else if (!isEditing && decision === "same_visit" && !selectedExistingVisitId) {
      // Mặc định tạo đợt mới nếu không có trùng
      setDecision("new_visit");
    }
  }, [tourDate, customerHistory, excludeOrderId, isEditing]);

  // Tính toán số thứ tự đợt quay lại dự kiến
  const maxVisitNumber = customerHistory?.visits
    ? Math.max(0, ...customerHistory.visits.map((v) => v.visit_number))
    : 1;

  let targetVisitNumber = 1;
  if (mode === "new") {
    targetVisitNumber = 1;
  } else if (decision === "same_visit") {
    const found = customerHistory?.visits.find(
      (v) => v.id === selectedExistingVisitId
    );
    targetVisitNumber = found ? found.visit_number : maxVisitNumber || 1;
  } else {
    targetVisitNumber = maxVisitNumber + 1;
  }

  // Báo state lên component cha
  useEffect(() => {
    onCustomerStateChange({
      mode,
      selectedCustomer,
      returnVisitDecision: decision,
      existingVisitId: decision === "same_visit" ? selectedExistingVisitId : null,
      targetVisitNumber,
    });
  }, [mode, selectedCustomer, decision, selectedExistingVisitId, targetVisitNumber]);

  // Tìm kiếm debounced
  function handleSearchInputChange(val: string) {
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!val.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      setHasSearched(true);
      try {
        const results = await searchCustomers(val);
        setSearchResults(results);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  function handleSelectCustomer(c: CustomerSearchResult) {
    const cust: Customer = {
      id: c.id,
      customer_code: c.customer_code,
      full_name: c.full_name,
      phone: c.phone,
      email: c.email,
      country: c.country,
      created_at: c.created_at,
      updated_at: c.created_at,
    };
    setSelectedCustomer(cust);
    loadHistory(c.id);
    setSearchResults([]);
    setSearchQuery("");
    setHasSearched(false);

    if (onCustomerSelected) {
      onCustomerSelected({
        full_name: c.full_name,
        phone: c.phone,
        email: c.email,
        country: c.country,
      });
    }
  }

  function handleClearSelectedCustomer() {
    setSelectedCustomer(null);
    setCustomerHistory(null);
    setOverlapResult({
      hasOverlap: false,
      overlappingOrders: [],
      overlappingVisits: [],
      matchingMonths: [],
    });
    setDecision("new_visit");
    setSelectedExistingVisitId(null);
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      {/* 1. Segmented Switch: Khách hàng mới vs Khách hàng cũ (Ẩn khi đang edit đơn) */}
      {!isEditing && (
        <div style={{ marginBottom: "18px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px",
              background: "var(--bg-body)",
              borderRadius: "10px",
              border: "1px solid var(--border-subtle)",
              width: "fit-content",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode("new");
                handleClearSelectedCustomer();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "7px",
                border: "none",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                background: mode === "new" ? "var(--btn-primary-bg, #2563eb)" : "transparent",
                color: mode === "new" ? "#ffffff" : "var(--text-dim)",
                boxShadow: mode === "new" ? "0 2px 8px rgba(37, 99, 235, 0.3)" : "none",
              }}
            >
              <User size={14} />
              <span>Khách hàng mới</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("existing")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "7px",
                border: "none",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                background: mode === "existing" ? "var(--btn-primary-bg, #7c3aed)" : "transparent",
                color: mode === "existing" ? "#ffffff" : "var(--text-dim)",
                boxShadow: mode === "existing" ? "0 2px 8px rgba(124, 58, 237, 0.3)" : "none",
              }}
            >
              <RotateCcw size={14} />
              <span>Khách hàng cũ</span>
            </button>
          </div>

          <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--text-dim)" }}>
            {mode === "new" ? (
              <span>
                ✨ Đơn hàng đầu tiên: Hệ thống sẽ tự động cấp <b>Mã khách hàng</b> và khởi tạo hồ sơ du khách mới (Lần đầu tiên).
              </span>
            ) : (
              <span>
                🔍 Tra cứu khách hàng cũ theo <b>Họ tên, SĐT, Email</b> để nhận diện lần quay lại và các đơn đã đặt trước đó.
              </span>
            )}
          </div>

          {/* Banner cảnh báo phát hiện khách hàng cũ có thông tin trùng khớp (Requirement 26) */}
          {mode === "new" && duplicateSuggestion && duplicateSuggestion.id !== dismissedDuplicateId && (
            <div
              style={{
                marginTop: "12px",
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.35)",
                borderRadius: "10px",
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <AlertTriangle size={16} style={{ color: "#f59e0b", flexShrink: 0, marginTop: "2px" }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#f59e0b", display: "block" }}>
                    Phát hiện khách hàng cũ có thông tin tương tự trong hệ thống
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-main)" }}>
                    Khách hàng <b>{duplicateSuggestion.full_name}</b> ({duplicateSuggestion.customer_code})
                    {duplicateSuggestion.phone ? ` · SĐT: ${duplicateSuggestion.phone}` : ""}
                    {duplicateSuggestion.email ? ` · Email: ${duplicateSuggestion.email}` : ""}
                    {" "}đã có {duplicateSuggestion.total_orders} đơn tour trước đó.
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode("existing");
                    handleSelectCustomer(duplicateSuggestion);
                  }}
                  className="btn btn-primary"
                  style={{
                    fontSize: "11px",
                    padding: "5px 12px",
                    background: "#7c3aed",
                    borderColor: "#7c3aed",
                    color: "#ffffff",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Dùng khách hàng cũ này
                </button>
                <button
                  type="button"
                  onClick={() => setDismissedDuplicateId(duplicateSuggestion.id)}
                  className="btn btn-secondary"
                  style={{
                    fontSize: "11px",
                    padding: "5px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Bỏ qua & Tiếp tục tạo mới
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Giao diện Tìm kiếm Khách hàng cũ */}
      {mode === "existing" && !selectedCustomer && (
        <div
          style={{
            background: "var(--bg-card-alt)",
            border: "1px solid var(--border-alt)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <RotateCcw size={16} style={{ color: "#7c3aed" }} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-heading)" }}>
              Tìm kiếm khách hàng có trong hệ thống
            </span>
          </div>

          {/* Search Input Box */}
          <div style={{ position: "relative", marginBottom: "12px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-dim)",
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              placeholder="Nhập họ tên, số điện thoại hoặc email du khách..."
              style={{
                width: "100%",
                padding: "10px 12px 10px 38px",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-body)",
                color: "var(--text-main)",
                fontSize: "13px",
                outline: "none",
              }}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchInputChange("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Results List */}
          {searching ? (
            <div style={{ textAlign: "center", padding: "16px", color: "var(--text-dim)", fontSize: "12px" }}>
              Đang tìm kiếm khách hàng...
            </div>
          ) : searchResults.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "280px",
                overflowY: "auto",
              }}
            >
              {searchResults.map((cust) => {
                const cCountry = cust.country
                  ? ALL_COUNTRIES.find((c) => c.code === cust.country)
                  : null;

                return (
                  <div
                    key={cust.id}
                    onClick={() => handleSelectCustomer(cust)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#7c3aed";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-subtle)";
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-heading)" }}>
                          {cust.full_name}
                        </span>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: "4px",
                            background: "rgba(139, 92, 246, 0.12)",
                            color: "#8b5cf6",
                          }}
                        >
                          {cust.customer_code}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          fontSize: "11px",
                          color: "var(--text-dim)",
                          flexWrap: "wrap",
                        }}
                      >
                        {cust.phone && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Phone size={12} /> {cust.phone}
                          </span>
                        )}
                        {cust.email && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Mail size={12} /> {cust.email}
                          </span>
                        )}
                        {cust.country && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <CountryFlag code={cust.country} size="sm" />
                            <span>{cCountry?.name || cust.country}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: "rgba(37, 99, 235, 0.08)",
                          color: "#2563eb",
                        }}
                      >
                        {cust.total_visits > 1 ? `Quay lại ${cust.total_visits - 1} lần` : 'Khách mới'} · {cust.total_orders} đơn
                      </span>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{
                          fontSize: "11px",
                          padding: "5px 10px",
                          background: "#7c3aed",
                          borderColor: "#7c3aed",
                        }}
                      >
                        Chọn
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : hasSearched ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                background: "var(--bg-body)",
                borderRadius: "8px",
                border: "1px dashed var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "8px" }}>
                Không tìm thấy khách hàng nào khớp với từ khóa "{searchQuery}".
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "11px", padding: "5px 12px" }}
                onClick={() => setMode("new")}
              >
                Chuyển sang tạo Khách hàng mới
              </button>
            </div>
          ) : (
            <div
              style={{
                fontSize: "12px",
                color: "var(--text-dim)",
                textAlign: "center",
                padding: "16px",
                fontStyle: "italic",
              }}
            >
              Nhập tên, số điện thoại hoặc email để tra cứu thông tin khách hàng cũ.
            </div>
          )}
        </div>
      )}

      {/* 3. Thẻ Khách hàng cũ ĐÃ ĐƯỢC CHỌN */}
      {selectedCustomer && (
        <div
          style={{
            background: "var(--bg-card-alt)",
            border: "1px solid rgba(139, 92, 246, 0.35)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px",
          }}
        >
          {/* Header Card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "12px",
              paddingBottom: "12px",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(139, 92, 246, 0.15)",
                  color: "#8b5cf6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <User size={18} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-heading)" }}>
                    {selectedCustomer.full_name}
                  </span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: "rgba(139, 92, 246, 0.15)",
                      color: "#8b5cf6",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                    }}
                  >
                    {selectedCustomer.customer_code}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>
                  Đã liên kết với hồ sơ khách hàng quay lại
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setHistoryModalOpen(true)}
                className="btn btn-secondary"
                style={{
                  fontSize: "11px",
                  padding: "5px 10px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <History size={13} />
                <span>Xem lịch sử ({customerHistory?.visits?.length || 0} đợt)</span>
              </button>

              {!isEditing && (
                <button
                  type="button"
                  onClick={handleClearSelectedCustomer}
                  className="btn btn-secondary"
                  style={{
                    fontSize: "11px",
                    padding: "5px 10px",
                    color: "var(--error-text)",
                  }}
                  title="Chọn khách hàng khác"
                >
                  Đổi khách khác
                </button>
              )}
            </div>
          </div>

          {/* 4. OVERLAP WARNING BANNER & SELECTION (Requirements 9-16) */}
          {overlapResult.hasOverlap ? (
            <div
              style={{
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "10px",
                padding: "14px",
                marginBottom: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                <AlertTriangle size={17} style={{ color: "#f59e0b", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#f59e0b", display: "block" }}>
                    Phát hiện đơn hàng có tháng khởi hành trùng lặp!
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-main)" }}>
                    Khách hàng có đơn tour trước đó trùng tháng khởi hành (
                    <b>{overlapResult.matchingMonths.join(", ")}</b>):{" "}
                    {overlapResult.overlappingOrders.map((o) => `${o.order_code} (${o.tour_name})`).join(", ")}.
                  </span>
                </div>
              </div>

              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-heading)", margin: "10px 0 8px 0" }}>
                Đơn tour mới này thuộc về đợt quay lại nào?
              </div>

              {/* 2 Lựa chọn khi có Overlap */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
                {/* Lựa chọn A: Cùng đợt quay lại này */}
                {overlapResult.overlappingVisits.map((v) => {
                  const isSelected = decision === "same_visit" && selectedExistingVisitId === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        setDecision("same_visit");
                        setSelectedExistingVisitId(v.id);
                      }}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: isSelected
                          ? "2px solid #10b981"
                          : "1px solid var(--border-subtle)",
                        background: isSelected
                          ? "rgba(16, 185, 129, 0.08)"
                          : "var(--bg-body)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: isSelected ? "#10b981" : "var(--text-heading)" }}>
                          {v.visit_number === 1 ? "Cùng đợt trao đổi ban đầu" : `Cùng đợt này (Quay lại lần ${v.visit_number - 1})`}
                        </span>
                        {isSelected && <CheckCircle2 size={15} style={{ color: "#10b981" }} />}
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "block" }}>
                        Gộp chung với đợt trao đổi này. <b>Không tăng</b> số lần quay lại của khách (giữ nguyên {v.visit_number === 1 ? "lần đầu" : `Quay lại lần ${v.visit_number - 1}`}).
                      </span>
                    </div>
                  );
                })}

                {/* Lựa chọn B: Tạo đợt quay lại mới */}
                <div
                  onClick={() => {
                    setDecision("new_visit");
                    setSelectedExistingVisitId(null);
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: decision === "new_visit"
                      ? "2px solid #7c3aed"
                      : "1px solid var(--border-subtle)",
                    background: decision === "new_visit"
                      ? "rgba(124, 58, 237, 0.08)"
                      : "var(--bg-body)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: decision === "new_visit" ? "#7c3aed" : "var(--text-heading)" }}>
                      Tạo đợt quay lại mới (Quay lại lần {maxVisitNumber})
                    </span>
                    {decision === "new_visit" && <CheckCircle2 size={15} style={{ color: "#7c3aed" }} />}
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "block" }}>
                    Khách quay lại cho nhu cầu du lịch hoàn toàn mới. Ghi nhận là <b>Quay lại lần {maxVisitNumber}</b>.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Khi không có Overlap (Requirements 13-16) */
            <div
              style={{
                background: "var(--bg-body)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "14px",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-heading)", marginBottom: "8px" }}>
                Xác nhận đợt quay lại của khách hàng:
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
                {/* Lựa chọn 1: Tạo đợt quay lại mới */}
                <div
                  onClick={() => {
                    setDecision("new_visit");
                    setSelectedExistingVisitId(null);
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: decision === "new_visit"
                      ? "2px solid #7c3aed"
                      : "1px solid var(--border-subtle)",
                    background: decision === "new_visit"
                      ? "rgba(124, 58, 237, 0.08)"
                      : "var(--bg-card)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: decision === "new_visit" ? "#7c3aed" : "var(--text-heading)" }}>
                      Tạo đợt quay lại mới (Quay lại lần {maxVisitNumber})
                    </span>
                    {decision === "new_visit" && <CheckCircle2 size={15} style={{ color: "#7c3aed" }} />}
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "block" }}>
                    Khách liên hệ lại cho chuyến đi mới. Ghi nhận là <b>Quay lại lần {maxVisitNumber}</b>.
                  </span>
                </div>

                {/* Lựa chọn 2: Cùng đợt với lần quay lại gần nhất */}
                {customerHistory?.visits && customerHistory.visits.length > 0 && (
                  <div
                    onClick={() => {
                      setDecision("same_visit");
                      const latest = customerHistory.visits[0];
                      setSelectedExistingVisitId(latest.id);
                    }}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: decision === "same_visit"
                        ? "2px solid #10b981"
                        : "1px solid var(--border-subtle)",
                      background: decision === "same_visit"
                        ? "rgba(16, 185, 129, 0.08)"
                        : "var(--bg-card)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: decision === "same_visit" ? "#10b981" : "var(--text-heading)" }}>
                        {customerHistory.visits[0].visit_number === 1
                          ? "Cùng đợt trao đổi ban đầu"
                          : `Cùng đợt với Quay lại lần ${customerHistory.visits[0].visit_number - 1}`}
                      </span>
                      {decision === "same_visit" && <CheckCircle2 size={15} style={{ color: "#10b981" }} />}
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "block" }}>
                      Đơn phụ tạo thêm trong cùng đợt trao đổi này. Giữ nguyên <b>{customerHistory.visits[0].visit_number === 1 ? "đợt đầu" : `Quay lại lần ${customerHistory.visits[0].visit_number - 1}`}</b>.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Indicator kết quả ghi nhận */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              color: "var(--text-main)",
            }}
          >
            <span style={{ color: "var(--text-dim)" }}>Kết quả ghi nhận cho đơn tour này:</span>
            <span
              style={{
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "5px",
                background: decision === "new_visit" ? "rgba(124, 58, 237, 0.15)" : "rgba(16, 185, 129, 0.15)",
                color: decision === "new_visit" ? "#7c3aed" : "#10b981",
              }}
            >
              {targetVisitNumber > 1 ? `Quay lại lần ${targetVisitNumber - 1}` : "Lần đầu (Khách mới)"}
            </span>
          </div>
        </div>
      )}

      {/* Modal Lịch sử khách hàng */}
      <CustomerHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        data={customerHistory}
        loading={loadingHistory}
      />
    </div>
  );
}
