import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Search,
  Phone,
  Mail,
  RotateCcw,
  X,
  History,
  Plus,
  GripVertical,
  CheckCircle2,
  Clock,
  Ban,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import type {
  CustomerSearchResult,
  CustomerHistoryData,
  CustomerHistoryVisit,
  CustomerHistoryOrder,
  CustomerReturnVisit,
  Customer,
  OrderStatus,
} from "../types";
import {
  searchCustomers,
  getCustomerHistory,
  createCustomerReturnVisit,
  reorderCustomerVisits,
  moveOrderToVisit,
  separateOrderToNewVisit,
} from "../services/customerService";
import { CustomerHistoryModal } from "./CustomerHistoryModal";
import { CountryFlag } from "./CountryFlag";
import { ALL_COUNTRIES } from "../lib/countries";
import { formatDepartureMonths } from "./MonthMultiSelector";

export interface CustomerSelectionState {
  mode: "new" | "existing";
  selectedCustomer: Customer | null;
  selectedVisitId: string | null;
  targetVisitNumber: number;
  returnVisitDecision: "new_visit" | "same_visit";
  existingVisitId: string | null;
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

const statusMeta: Record<
  OrderStatus,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  new: {
    label: "Mới",
    bg: "rgba(59, 130, 246, 0.12)",
    text: "#3b82f6",
    icon: <Clock size={11} />,
  },
  consulting: {
    label: "Đang tư vấn",
    bg: "rgba(245, 158, 11, 0.12)",
    text: "#f59e0b",
    icon: <Clock size={11} />,
  },
  closed: {
    label: "Đã chốt",
    bg: "rgba(16, 185, 129, 0.12)",
    text: "#10b981",
    icon: <CheckCircle2 size={11} />,
  },
  cancelled: {
    label: "Đã hủy",
    bg: "rgba(239, 68, 68, 0.12)",
    text: "#ef4444",
    icon: <Ban size={11} />,
  },
};

export function getVisitLabel(visitNumber: number): string {
  if (visitNumber === 1) return "Lần đầu";
  return `Quay lại lần ${visitNumber - 1}`;
}

export function CustomerSelectionSection({
  tourDate: _tourDate,
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
  const [visits, setVisits] = useState<CustomerHistoryVisit[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Đợt quay lại được chọn cho đơn hàng này
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(
    initialVisit?.id || null
  );
  const [targetVisitNumber, setTargetVisitNumber] = useState<number>(
    initialVisit?.visit_number || 1
  );

  // Drag & drop state for Visits
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Drag & drop state for individual Orders
  const [draggedOrder, setDraggedOrder] = useState<{
    order: CustomerHistoryOrder;
    sourceVisitId: string;
  } | null>(null);
  const [hoveredTargetVisitId, setHoveredTargetVisitId] = useState<string | null>(null);
  const [isOverNewVisitZone, setIsOverNewVisitZone] = useState<boolean>(false);
  const [dropInsertPosition, setDropInsertPosition] = useState<number | null>(null);
  const [orderMenuOpenId, setOrderMenuOpenId] = useState<string | null>(null);

  // Popover chi tiết đơn: Chỉ mở khi click chuột vào mã đơn
  const [detailOrder, setDetailOrder] = useState<{
    order: CustomerHistoryOrder;
    visitNumber: number;
    rect: DOMRect;
  } | null>(null);

  // Đóng popover chi tiết và menu ghép đợt khi click ra ngoài
  useEffect(() => {
    function handleWindowClick() {
      setOrderMenuOpenId(null);
      setDetailOrder(null);
    }
    if (orderMenuOpenId || detailOrder) {
      window.addEventListener("click", handleWindowClick);
      return () => window.removeEventListener("click", handleWindowClick);
    }
  }, [orderMenuOpenId, detailOrder]);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load history khi có initialCustomer trong edit mode
  useEffect(() => {
    if (initialCustomer && isEditing) {
      setSelectedCustomer(initialCustomer);
      loadHistory(initialCustomer.id);
      if (initialVisit) {
        setSelectedVisitId(initialVisit.id);
        setTargetVisitNumber(initialVisit.visit_number);
      }
    }
  }, [initialCustomer, initialVisit, isEditing]);

  async function loadHistory(customerId: string) {
    setLoadingHistory(true);
    try {
      const data = await getCustomerHistory(customerId);
      setCustomerHistory(data);
      if (data && data.visits) {
        // visits đã được sắp xếp visit_number ASC từ server
        setVisits(data.visits);

        // Nếu chưa chọn đợt, tự động gán đợt phù hợp
        if (!selectedVisitId) {
          if (initialVisit) {
            setSelectedVisitId(initialVisit.id);
            setTargetVisitNumber(initialVisit.visit_number);
          } else if (data.visits.length > 0) {
            setSelectedVisitId(data.visits[0].id);
            setTargetVisitNumber(data.visits[0].visit_number);
          }
        } else {
          const current = data.visits.find((v) => v.id === selectedVisitId);
          if (current) {
            setTargetVisitNumber(current.visit_number);
          }
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải lịch sử khách hàng:", err);
    } finally {
      setLoadingHistory(false);
    }
  }

  // Cập nhật targetVisitNumber khi visits hoặc selectedVisitId thay đổi
  useEffect(() => {
    if (selectedVisitId && visits.length > 0) {
      const found = visits.find((v) => v.id === selectedVisitId);
      if (found) {
        setTargetVisitNumber(found.visit_number);
      }
    }
  }, [selectedVisitId, visits]);

  // Báo state lên component cha
  useEffect(() => {
    onCustomerStateChange({
      mode,
      selectedCustomer,
      selectedVisitId,
      targetVisitNumber: targetVisitNumber || 1,
      returnVisitDecision: "same_visit",
      existingVisitId: selectedVisitId,
    });
  }, [mode, selectedCustomer, selectedVisitId, targetVisitNumber]);

  // Tìm kiếm khách hàng
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
    setVisits([]);
    setSelectedVisitId(null);
    setTargetVisitNumber(1);
  }

  // 1. Drag & Drop handlers cho Order riêng lẻ
  function handleOrderDragStart(
    e: React.DragEvent,
    order: CustomerHistoryOrder,
    sourceVisitId: string
  ) {
    e.stopPropagation();
    setDraggedOrder({ order, sourceVisitId });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", order.id);
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ type: "order", orderId: order.id, sourceVisitId })
    );
  }

  // 2. Drag & Drop handlers cho thẻ Đợt
  function handleVisitDragStart(e: React.DragEvent, index: number) {
    e.stopPropagation();
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }

  function handleCardDragOver(
    e: React.DragEvent,
    visitId: string,
    index: number
  ) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedOrder) {
      if (draggedOrder.sourceVisitId !== visitId) {
        if (hoveredTargetVisitId !== visitId) {
          setHoveredTargetVisitId(visitId);
        }
      }
    } else if (draggedIndex !== null) {
      if (dragOverIndex !== index) {
        setDragOverIndex(index);
      }
    }
  }

  function handleCardDragLeave(e: React.DragEvent, visitId: string) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (hoveredTargetVisitId === visitId) {
        setHoveredTargetVisitId(null);
      }
    }
  }

  async function handleQuickMoveOrder(orderId: string, targetVisitId: string) {
    setOrderMenuOpenId(null);
    if (!selectedCustomer) return;
    try {
      await moveOrderToVisit(orderId, targetVisitId, selectedCustomer.id);
      if (excludeOrderId && orderId === excludeOrderId) {
        setSelectedVisitId(targetVisitId);
      }
      await loadHistory(selectedCustomer.id);
    } catch (err: any) {
      console.error("Lỗi khi chuyển đơn:", err);
      alert("Lỗi chuyển đơn: " + (err.message || err));
    }
  }

  async function handleQuickSeparateOrder(orderId: string) {
    setOrderMenuOpenId(null);
    if (!selectedCustomer) return;
    try {
      const res = await separateOrderToNewVisit(orderId, selectedCustomer.id);
      if (excludeOrderId && orderId === excludeOrderId && res.new_visit_id) {
        setSelectedVisitId(res.new_visit_id);
      }
      await loadHistory(selectedCustomer.id);
    } catch (err: any) {
      console.error("Lỗi khi tách đơn:", err);
      alert("Lỗi tách đơn: " + (err.message || err));
    }
  }

  async function handleCardDrop(
    e: React.DragEvent,
    targetVisitId: string,
    dropIndex: number
  ) {
    e.preventDefault();
    e.stopPropagation();

    // Trường hợp 1: Thả một Order vào một Đợt khác
    if (draggedOrder) {
      const { order, sourceVisitId } = draggedOrder;
      setDraggedOrder(null);
      setHoveredTargetVisitId(null);
      setIsOverNewVisitZone(false);

      if (sourceVisitId === targetVisitId) return;

      if (selectedCustomer) {
        try {
          await moveOrderToVisit(order.id, targetVisitId, selectedCustomer.id);
          if (excludeOrderId && order.id === excludeOrderId) {
            setSelectedVisitId(targetVisitId);
          }
          await loadHistory(selectedCustomer.id);
        } catch (err: any) {
          console.error("Lỗi khi chuyển đơn sang đợt khác:", err);
          alert("Lỗi chuyển đơn: " + (err.message || err));
        }
      }
      return;
    }

    // Trường hợp 2: Kéo thả đổi vị trí giữa các Đợt
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...visits];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, moved);

    const renumbered = updated.map((v, i) => ({
      ...v,
      visit_number: i + 1,
    }));

    setVisits(renumbered);
    setDraggedIndex(null);
    setDragOverIndex(null);

    const currentSelected = renumbered.find((v) => v.id === selectedVisitId);
    if (currentSelected) {
      setTargetVisitNumber(currentSelected.visit_number);
    }

    if (selectedCustomer) {
      try {
        const orderedIds = renumbered.map((v) => v.id);
        await reorderCustomerVisits(selectedCustomer.id, orderedIds);
      } catch (err: any) {
        console.error("Lỗi cập nhật thứ tự đợt:", err);
        alert("Lỗi lưu thứ tự đợt: " + (err.message || err));
        loadHistory(selectedCustomer.id);
      }
    }
  }

  // 3. Thả order vào vùng "Tách thành đợt mới"
  async function handleDropSeparateNewVisit(
    e: React.DragEvent,
    targetPosition?: number
  ) {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedOrder || !selectedCustomer) {
      setDraggedOrder(null);
      setIsOverNewVisitZone(false);
      setDropInsertPosition(null);
      return;
    }

    const { order } = draggedOrder;
    setDraggedOrder(null);
    setIsOverNewVisitZone(false);
    setHoveredTargetVisitId(null);
    setDropInsertPosition(null);

    try {
      const res = await separateOrderToNewVisit(
        order.id,
        selectedCustomer.id,
        targetPosition
      );
      if (excludeOrderId && order.id === excludeOrderId && res.new_visit_id) {
        setSelectedVisitId(res.new_visit_id);
      }
      await loadHistory(selectedCustomer.id);
    } catch (err: any) {
      console.error("Lỗi khi tách đơn thành đợt mới:", err);
      alert("Lỗi khi tách đợt: " + (err.message || err));
    }
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDraggedOrder(null);
    setHoveredTargetVisitId(null);
    setIsOverNewVisitZone(false);
    setDropInsertPosition(null);
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      {/* 1. Chuyển đổi Khách mới vs Khách cũ (chỉ hiển thị khi tạo mới đơn) */}
      {!isEditing && (
        <div style={{ marginBottom: "16px" }}>
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
                background:
                  mode === "new" ? "var(--btn-primary-bg, #2563eb)" : "transparent",
                color: mode === "new" ? "#ffffff" : "var(--text-dim)",
                boxShadow:
                  mode === "new" ? "0 2px 8px rgba(37, 99, 235, 0.3)" : "none",
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
                background:
                  mode === "existing"
                    ? "var(--btn-primary-bg, #7c3aed)"
                    : "transparent",
                color: mode === "existing" ? "#ffffff" : "var(--text-dim)",
                boxShadow:
                  mode === "existing"
                    ? "0 2px 8px rgba(124, 58, 237, 0.3)"
                    : "none",
              }}
            >
              <RotateCcw size={14} />
              <span>Khách hàng cũ</span>
            </button>
          </div>

          <div
            style={{
              marginTop: "6px",
              fontSize: "11px",
              color: "var(--text-dim)",
            }}
          >
            {mode === "new" ? (
              <span>
                ✨ Đơn hàng đầu tiên: Hệ thống sẽ tự động cấp <b>Mã khách hàng</b> và khởi tạo đợt <b>Lần đầu</b>.
              </span>
            ) : (
              <span>
                🔍 Tra cứu khách hàng cũ theo <b>Họ tên, SĐT, Email</b> để xem các đợt và quản lý thứ tự đợt quay lại.
              </span>
            )}
          </div>
        </div>
      )}

      {/* 2. Ô tìm kiếm khách hàng khi chọn Khách hàng cũ */}
      {!isEditing && mode === "existing" && !selectedCustomer && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-dim)",
              }}
            >
              <Search size={15} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              placeholder="Nhập tên, số điện thoại, email hoặc mã khách hàng..."
              style={{
                width: "100%",
                padding: "10px 36px 10px 36px",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-body)",
                color: "var(--text-heading)",
                fontSize: "13px",
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

          {searching ? (
            <div
              style={{
                textAlign: "center",
                padding: "16px",
                color: "var(--text-dim)",
                fontSize: "12px",
              }}
            >
              Đang tìm kiếm khách hàng...
            </div>
          ) : searchResults.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "260px",
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
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "var(--text-heading)",
                          }}
                        >
                          {cust.full_name}
                        </span>
                        <span
                          className="mono"
                          style={{
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
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Phone size={12} /> {cust.phone}
                          </span>
                        )}
                        {cust.email && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Mail size={12} /> {cust.email}
                          </span>
                        )}
                        {cust.country && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
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
                        {cust.total_visits > 1
                          ? `Quay lại ${cust.total_visits - 1} lần`
                          : "Khách mới"}{" "}
                        · {cust.total_orders} đơn
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
                padding: "16px",
                background: "var(--bg-body)",
                borderRadius: "8px",
                border: "1px dashed var(--border-subtle)",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-dim)",
                  marginBottom: "6px",
                }}
              >
                Không tìm thấy khách hàng nào khớp với "{searchQuery}".
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "11px", padding: "4px 10px" }}
                onClick={() => setMode("new")}
              >
                Tạo khách hàng mới
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* 3. KHÁCH HÀNG ĐÃ ĐƯỢC CHỌN -> HIỂN THỊ CÁC ĐỢT VÀ ORDERS THEO CÂY */}
      {selectedCustomer && (
        <div
          style={{
            background: "var(--bg-card-alt)",
            border: "1px solid var(--border-main)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px",
          }}
        >
          {/* Header Thông tin khách hàng */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "14px",
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
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "var(--text-heading)",
                    }}
                  >
                    {selectedCustomer.full_name}
                  </span>
                  <span
                    className="mono"
                    style={{
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
                  {selectedCustomer.country && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        color: "var(--text-dim)",
                      }}
                    >
                      <CountryFlag code={selectedCustomer.country} size="sm" />
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-dim)",
                    marginTop: "2px",
                  }}
                >
                  {selectedCustomer.phone && `SĐT: ${selectedCustomer.phone}`}
                  {selectedCustomer.phone && selectedCustomer.email && " · "}
                  {selectedCustomer.email && `Email: ${selectedCustomer.email}`}
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
                <span>Chi tiết lịch sử</span>
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

          {/* Section Header: Quản lý các đợt */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text-heading)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Layers size={15} style={{ color: "#7c3aed" }} />
              <span>Các đợt của khách hàng</span>
            </div>
          </div>

          {/* Loading History Indicator */}
          {loadingHistory ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "var(--text-dim)",
                fontSize: "12px",
              }}
            >
              Đang tải danh sách đợt và đơn tour...
            </div>
          ) : visits.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "18px",
                background: "var(--bg-body)",
                borderRadius: "8px",
                border: "1px dashed var(--border-subtle)",
                fontSize: "12px",
                color: "var(--text-dim)",
              }}
            >
              Khách hàng chưa có đợt nào. Bấm <b>"Tạo đợt mới"</b> ở góc trên để tạo đợt đầu tiên.
            </div>
          ) : (
            /* Danh sách các Đợt (Draggable Cards) */
            <div
              onDragOver={(e) => {
                if (draggedOrder) {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }
              }}
              onDrop={(e) => {
                if (draggedOrder) {
                  e.preventDefault();
                  handleDropSeparateNewVisit(e);
                }
              }}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {visits
                .filter(
                  (v) => (v.orders && v.orders.length > 0) || v.id === selectedVisitId
                )
                .map((visit, index) => {
                  const isSelected = selectedVisitId === visit.id;
                  const isDragging = draggedIndex === index;
                  const isDragOver = dragOverIndex === index;
                  const isOrderTarget =
                    draggedOrder !== null &&
                    draggedOrder.sourceVisitId !== visit.id &&
                    hoveredTargetVisitId === visit.id;
                  const label = getVisitLabel(visit.visit_number);
                  const ordersInVisit = visit.orders || [];

                  return (
                    <React.Fragment key={visit.id}>
                      {/* Vùng thả chèn giữa các đợt khi đang kéo một order */}
                      {draggedOrder && index > 0 && (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.dataTransfer.dropEffect = "move";
                            setDropInsertPosition(visit.visit_number);
                          }}
                          onDragLeave={() => {
                            if (dropInsertPosition === visit.visit_number) {
                              setDropInsertPosition(null);
                            }
                          }}
                          onDrop={(e) => {
                            handleDropSeparateNewVisit(e, visit.visit_number);
                          }}
                          style={{
                            height:
                              dropInsertPosition === visit.visit_number ? "28px" : "6px",
                            margin: "-2px 0",
                            borderRadius: "6px",
                            border:
                              dropInsertPosition === visit.visit_number
                                ? "2px dashed #7c3aed"
                                : "1px dashed transparent",
                            background:
                              dropInsertPosition === visit.visit_number
                                ? "rgba(124, 58, 237, 0.12)"
                                : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#7c3aed",
                            fontSize: "11px",
                            fontWeight: 600,
                            transition: "all 0.15s ease",
                            cursor: "pointer",
                          }}
                        >
                          {dropInsertPosition === visit.visit_number && (
                            <span>
                              ＋ Tách #{draggedOrder.order.order_code} thành Đợt mới tại vị trí này
                            </span>
                          )}
                        </div>
                      )}

                      <div
                        onDragOver={(e) => handleCardDragOver(e, visit.id, index)}
                        onDragLeave={(e) => handleCardDragLeave(e, visit.id)}
                        onDrop={(e) => handleCardDrop(e, visit.id, index)}
                        style={{
                        background: isOrderTarget
                          ? "rgba(124, 58, 237, 0.08)"
                          : isSelected
                          ? "rgba(124, 58, 237, 0.04)"
                          : "var(--bg-card)",
                        border: isOrderTarget
                          ? "2px dashed #7c3aed"
                          : isSelected
                          ? "1.5px solid #7c3aed"
                          : isDragOver
                          ? "2px dashed #7c3aed"
                          : "1px solid var(--border-subtle)",
                        borderRadius: "10px",
                        padding: "12px 14px",
                        transition: "all 0.15s ease",
                        opacity: isDragging ? 0.4 : 1,
                        transform:
                          isDragOver || isOrderTarget ? "translateY(2px)" : "none",
                        boxShadow: isSelected
                          ? "0 2px 10px rgba(124, 58, 237, 0.08)"
                          : "none",
                      }}
                    >
                    {/* Header của Đợt */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: ordersInVisit.length > 0 ? "8px" : "0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {/* Drag Handle cho cả Đợt */}
                        {visits.length > 1 ? (
                          <div
                            draggable={true}
                            onDragStart={(e) => {
                              e.stopPropagation();
                              handleVisitDragStart(e, index);
                            }}
                            onDragEnd={handleDragEnd}
                            style={{
                              cursor: "grab",
                              color: "var(--text-dim)",
                              display: "flex",
                              alignItems: "center",
                              padding: "2px",
                            }}
                            title="Kéo thả biểu tượng này để đổi thứ tự đợt"
                          >
                            <GripVertical size={16} />
                          </div>
                        ) : null}

                        {/* Tiêu đề Đợt */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: isSelected
                                ? "#7c3aed"
                                : "var(--text-heading)",
                            }}
                          >
                            {label}
                          </span>

                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--text-dim)",
                              fontWeight: 500,
                            }}
                          >
                            ({ordersInVisit.length} đơn)
                          </span>
                        </div>
                      </div>

                      {/* Trạng thái chọn đợt cho đơn hiện tại */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {draggedOrder && draggedOrder.sourceVisitId !== visit.id ? (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "#7c3aed",
                              background: "rgba(124, 58, 237, 0.12)",
                              padding: "3px 9px",
                              borderRadius: "6px",
                              border: "1px dashed rgba(124, 58, 237, 0.4)",
                            }}
                          >
                            Thả vào đây để chuyển vào {label}
                          </span>
                        ) : isSelected ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "#7c3aed",
                              background: "rgba(124, 58, 237, 0.12)",
                              padding: "3px 9px",
                              borderRadius: "6px",
                            }}
                          >
                            <CheckCircle2 size={13} /> Đang chọn đợt này
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVisitId(visit.id);
                              setTargetVisitNumber(visit.visit_number);
                            }}
                            className="btn btn-secondary"
                            style={{
                              fontSize: "11px",
                              padding: "4px 10px",
                              borderRadius: "6px",
                            }}
                          >
                            Gán đơn này vào đây
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Cây danh sách Orders bên trong Đợt */}
                    {ordersInVisit.length > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          paddingLeft: visits.length > 1 ? "24px" : "8px",
                          marginTop: "6px",
                        }}
                      >
                        {ordersInVisit.map((order, oIdx) => {
                          const isLast = oIdx === ordersInVisit.length - 1;
                          const isCurrentEditing =
                            excludeOrderId && order.id === excludeOrderId;

                          return (
                            <div
                              key={order.id}
                              draggable={true}
                              onDragStart={(e) =>
                                handleOrderDragStart(e, order, visit.id)
                              }
                              onDragEnd={handleDragEnd}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "12px",
                                color: "var(--text-main)",
                                padding: "5px 8px",
                                borderRadius: "6px",
                                width: "fit-content",
                                maxWidth: "100%",
                                background: isCurrentEditing
                                  ? "rgba(37, 99, 235, 0.08)"
                                  : "transparent",
                                cursor: "grab",
                                userSelect: "none",
                                WebkitUserSelect: "none",
                                opacity: draggedOrder?.order.id === order.id ? 0.35 : 1,
                                transition: "all 0.15s",
                              }}
                            >
                              {/* Ký hiệu cây */}
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  color: "var(--text-dim)",
                                  userSelect: "none",
                                }}
                              >
                                {isLast ? "└─" : "├─"}
                              </span>

                              {/* Tay cầm kéo riêng cho order */}
                              <span
                                style={{
                                  color: "var(--text-dim)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  cursor: "grab",
                                }}
                                title="Kéo đơn này sang đợt khác hoặc kéo xuống dưới để tách thành đợt mới"
                              >
                                <GripVertical size={13} />
                              </span>

                              {/* Mã đơn: Click chuột để mở popover chi tiết */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOrderMenuOpenId(null);
                                  if (detailOrder?.order.id === order.id) {
                                    setDetailOrder(null);
                                  } else {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setDetailOrder({
                                      order,
                                      visitNumber: visit.visit_number,
                                      rect,
                                    });
                                  }
                                }}
                                className="mono"
                                style={{
                                  fontWeight: 600,
                                  color: isCurrentEditing
                                    ? "#2563eb"
                                    : "var(--text-heading)",
                                  fontSize: "11px",
                                  border: "none",
                                  background: isCurrentEditing
                                    ? "rgba(37, 99, 235, 0.12)"
                                    : "rgba(0, 0, 0, 0.04)",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  transition: "all 0.15s",
                                }}
                                title="Bấm chuột để xem chi tiết đơn này"
                              >
                                <span>#{order.order_code}</span>
                                <Info size={10} style={{ opacity: 0.6 }} />
                              </button>

                              <span style={{ color: "var(--text-dim)" }}>·</span>

                              {/* Tên tour / SP đã gửi */}
                              <span
                                style={{
                                  color: "var(--text-main)",
                                  maxWidth: "260px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={
                                  order.tour_name ||
                                  order.private_tour_name ||
                                  "Đơn tour"
                                }
                              >
                                {order.tour_name ||
                                  order.private_tour_name ||
                                  "Đơn tour"}
                              </span>

                              <span style={{ color: "var(--text-dim)" }}>·</span>

                              {/* Tháng khởi hành */}
                              <span
                                style={{
                                  color: "var(--text-dim)",
                                  fontSize: "11px",
                                }}
                              >
                                {order.tour_date
                                  ? formatDepartureMonths(order.tour_date).primary
                                  : "Chưa có ngày"}
                              </span>

                              {/* Chỉ báo nếu là đơn đang sửa */}
                              {isCurrentEditing && (
                                <span
                                  style={{
                                    marginLeft: "4px",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    padding: "1px 6px",
                                    borderRadius: "4px",
                                    background: "rgba(37, 99, 235, 0.15)",
                                    color: "#2563eb",
                                  }}
                                >
                                  Đơn đang sửa
                                </span>
                              )}

                              {/* Nút chuyển / ghép đợt nhanh */}
                              <div style={{ position: "relative", marginLeft: "4px" }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDetailOrder(null); // Đóng ngay popover chi tiết để không bao giờ đè lên menu
                                    setOrderMenuOpenId(
                                      orderMenuOpenId === order.id ? null : order.id
                                    );
                                  }}
                                  style={{
                                    border: "1px solid var(--border-subtle)",
                                    background: "rgba(124, 58, 237, 0.06)",
                                    color: "#7c3aed",
                                    borderRadius: "4px",
                                    padding: "2px 7px",
                                    fontSize: "10px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "3px",
                                    transition: "all 0.15s",
                                  }}
                                  title="Chuyển hoặc ghép đơn này sang đợt khác"
                                >
                                  <span>⇄ Ghép đợt</span>
                                </button>

                                {orderMenuOpenId === order.id && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      position: "absolute",
                                      top: "100%",
                                      left: 0,
                                      marginTop: "4px",
                                      background: "var(--bg-card, #ffffff)",
                                      border: "1px solid var(--border-main)",
                                      borderRadius: "8px",
                                      boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                                      zIndex: 9999,
                                      minWidth: "240px",
                                      width: "max-content",
                                      padding: "6px 0",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "10px",
                                        fontWeight: 700,
                                        color: "var(--text-dim)",
                                        padding: "4px 10px",
                                        textTransform: "uppercase",
                                      }}
                                    >
                                      Chuyển đơn này sang:
                                    </div>
                                    {visits
                                      .filter((v) => v.id !== visit.id)
                                      .map((v) => (
                                        <button
                                          key={v.id}
                                          type="button"
                                          onClick={() =>
                                            handleQuickMoveOrder(order.id, v.id)
                                          }
                                          style={{
                                            width: "100%",
                                            textAlign: "left",
                                            padding: "7px 14px",
                                            fontSize: "11px",
                                            border: "none",
                                            background: "none",
                                            color: "var(--text-heading)",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: "16px",
                                            whiteSpace: "nowrap",
                                          }}
                                          onMouseEnter={(e) =>
                                            (e.currentTarget.style.background =
                                              "rgba(124, 58, 237, 0.08)")
                                          }
                                          onMouseLeave={(e) =>
                                            (e.currentTarget.style.background =
                                              "none")
                                          }
                                        >
                                          <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                                            Ghép vào {getVisitLabel(v.visit_number)}
                                          </span>
                                          <span
                                            style={{
                                              fontSize: "10px",
                                              color: "var(--text-dim)",
                                              whiteSpace: "nowrap",
                                              flexShrink: 0,
                                            }}
                                          >
                                            ({v.orders?.length || 0} đơn)
                                          </span>
                                        </button>
                                      ))}

                                    {ordersInVisit.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleQuickSeparateOrder(order.id)
                                        }
                                        style={{
                                          width: "100%",
                                          textAlign: "left",
                                          padding: "7px 14px",
                                          fontSize: "11px",
                                          border: "none",
                                          borderTop: "1px dashed var(--border-subtle)",
                                          background: "none",
                                          color: "#7c3aed",
                                          fontWeight: 700,
                                          cursor: "pointer",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "6px",
                                          whiteSpace: "nowrap",
                                        }}
                                        onMouseEnter={(e) =>
                                          (e.currentTarget.style.background =
                                            "rgba(124, 58, 237, 0.08)")
                                        }
                                        onMouseLeave={(e) =>
                                          (e.currentTarget.style.background =
                                            "none")
                                        }
                                      >
                                        <Plus size={12} />
                                        <span>Tách thành đợt mới</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: "11px",
                          fontStyle: "italic",
                          color: "var(--text-dim)",
                          paddingLeft: visits.length > 1 ? "24px" : "8px",
                          paddingTop: "2px",
                        }}
                      >
                        (Chưa có đơn tour nào trong đợt này)
                      </div>
                    )}

                    {/* Nếu đang kéo đơn từ chính đợt này và đợt có > 1 đơn: Hiển thị vùng thả để tách thành đợt riêng ngay dưới đợt này */}
                    {draggedOrder &&
                      draggedOrder.sourceVisitId === visit.id &&
                      ordersInVisit.length > 1 && (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsOverNewVisitZone(true);
                          }}
                          onDragLeave={() => setIsOverNewVisitZone(false)}
                          onDrop={(e) =>
                            handleDropSeparateNewVisit(e, visit.visit_number + 1)
                          }
                          style={{
                            marginTop: "8px",
                            padding: "9px 12px",
                            borderRadius: "8px",
                            border: "2px dashed #7c3aed",
                            background: "rgba(124, 58, 237, 0.08)",
                            color: "#7c3aed",
                            fontSize: "11px",
                            fontWeight: 700,
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            cursor: "pointer",
                          }}
                        >
                          <Plus size={14} />
                          <span>
                            Thả vào đây để tách #{draggedOrder.order.order_code} thành Đợt mới (sau {label})
                          </span>
                        </div>
                      )}

                    {/* Banner nhận đơn kéo thả vào đợt này */}
                    {draggedOrder && draggedOrder.sourceVisitId !== visit.id && (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (hoveredTargetVisitId !== visit.id) {
                            setHoveredTargetVisitId(visit.id);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCardDrop(e, visit.id, index);
                        }}
                        style={{
                          marginTop: "8px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border:
                            hoveredTargetVisitId === visit.id
                              ? "2px dashed #7c3aed"
                              : "1.5px dashed rgba(124, 58, 237, 0.4)",
                          background:
                            hoveredTargetVisitId === visit.id
                              ? "rgba(124, 58, 237, 0.16)"
                              : "rgba(124, 58, 237, 0.05)",
                          color: "#7c3aed",
                          fontSize: "12px",
                          fontWeight: 600,
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          transition: "all 0.15s ease",
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={14} />
                        <span>
                          Thả vào đây để ghép #{draggedOrder.order.order_code} vào {label}
                        </span>
                      </div>
                    )}
                  </div>
                </React.Fragment>
                );
              })}

              {/* Vùng thả khi kéo order ra ngoài để tách thành đợt mới ở cuối */}
              {draggedOrder && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = "move";
                    setIsOverNewVisitZone(true);
                  }}
                  onDragLeave={() => setIsOverNewVisitZone(false)}
                  onDrop={(e) => handleDropSeparateNewVisit(e)}
                  style={{
                    padding: "16px 20px",
                    borderRadius: "10px",
                    border: isOverNewVisitZone
                      ? "2px dashed #7c3aed"
                      : "2px dashed rgba(124, 58, 237, 0.4)",
                    background: isOverNewVisitZone
                      ? "rgba(124, 58, 237, 0.14)"
                      : "rgba(124, 58, 237, 0.05)",
                    color: "#7c3aed",
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.15s ease",
                    cursor: "pointer",
                  }}
                >
                  <Plus size={16} />
                  <span>
                    Thả #{draggedOrder.order.order_code} vào đây để tách thành Đợt mới ở cuối
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Indicator kết quả ghi nhận cuối cùng */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "14px",
              paddingTop: "12px",
              borderTop: "1px dashed var(--border-subtle)",
              fontSize: "12px",
            }}
          >
            <span style={{ color: "var(--text-dim)" }}>
              Vị trí ghi nhận của đơn hiện tại:
            </span>
            <span
              style={{
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "6px",
                background: "rgba(124, 58, 237, 0.15)",
                color: "#7c3aed",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Sparkles size={12} />
              {getVisitLabel(targetVisitNumber)}
            </span>
          </div>
        </div>
      )}

      {/* 4. POPOVER CHI TIẾT ĐƠN HÀNG (Chỉ mở khi click vào mã đơn) */}
      {detailOrder && (() => {
        const popoverWidth = 320;
        const popoverHeight = 195;
        const fitsRight =
          detailOrder.rect.right + 12 + popoverWidth <= window.innerWidth;
        const left = fitsRight
          ? detailOrder.rect.right + 12
          : Math.max(16, detailOrder.rect.left - popoverWidth - 12);
        const top = Math.min(
          window.innerHeight - popoverHeight - 16,
          Math.max(16, detailOrder.rect.top - 10)
        );

        return (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top,
              left,
              width: `${popoverWidth}px`,
              background: "var(--bg-card, #ffffff)",
              border: "1px solid var(--border-main, rgba(0,0,0,0.15))",
              borderRadius: "10px",
              padding: "12px 14px",
              boxShadow: "0 12px 28px rgba(0, 0, 0, 0.22)",
              zIndex: 99999,
              pointerEvents: "auto",
              animation: "fadeIn 0.12s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
                paddingBottom: "8px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  className="mono"
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--text-heading)",
                  }}
                >
                  #{detailOrder.order.order_code}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Trạng thái đơn */}
                {detailOrder.order.status && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: "5px",
                      background:
                        statusMeta[detailOrder.order.status]?.bg ||
                        "rgba(0,0,0,0.06)",
                      color:
                        statusMeta[detailOrder.order.status]?.text ||
                        "var(--text-main)",
                    }}
                  >
                    {statusMeta[detailOrder.order.status]?.icon}
                    {statusMeta[detailOrder.order.status]?.label ||
                      detailOrder.order.status}
                  </span>
                )}

                {/* Nút đóng popover */}
                <button
                  type="button"
                  onClick={() => setDetailOrder(null)}
                  style={{
                    border: "none",
                    background: "none",
                    color: "var(--text-dim)",
                    cursor: "pointer",
                    padding: "2px",
                    borderRadius: "4px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Đóng chi tiết"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                fontSize: "11px",
              }}
            >
              <div>
                <span style={{ color: "var(--text-dim)" }}>Sản phẩm / Tour: </span>
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--text-heading)",
                    display: "block",
                    marginTop: "1px",
                  }}
                >
                  {detailOrder.order.tour_name ||
                    detailOrder.order.private_tour_name ||
                    "---"}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "2px",
                }}
              >
                <div>
                  <span style={{ color: "var(--text-dim)" }}>Tháng khởi hành: </span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                    {detailOrder.order.tour_date
                      ? formatDepartureMonths(detailOrder.order.tour_date).fullText
                      : "---"}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--text-dim)" }}>Ngày tạo: </span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                    {detailOrder.order.booking_date
                      ? new Date(
                          detailOrder.order.booking_date
                        ).toLocaleDateString("vi-VN")
                      : "---"}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "6px",
                  borderTop: "1px dashed var(--border-subtle)",
                  marginTop: "2px",
                }}
              >
                <div>
                  <span style={{ color: "var(--text-dim)" }}>Đợt hiện tại: </span>
                  <span style={{ fontWeight: 700, color: "#7c3aed" }}>
                    {getVisitLabel(detailOrder.visitNumber)}
                  </span>
                </div>

                <a
                  href={`/orders/${detailOrder.order.id}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#2563eb",
                    textDecoration: "none",
                  }}
                >
                  Xem đơn ↗
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal Lịch sử khách hàng chi tiết */}
      <CustomerHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        data={customerHistory}
        loading={loadingHistory}
      />
    </div>
  );
}
