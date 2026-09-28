import { supabase } from "@/lib/supabase";
import type {
  CustomerSearchResult,
  CustomerHistoryData,
  CustomerHistoryVisit,
  CustomerHistoryOrder,
  CustomerReturnVisit,
  Customer,
} from "@/types";

interface SearchCustomerDbRow {
  id: string;
  customer_code: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  country: string | null;
  created_at: string;
  total_orders: number | string;
  total_visits: number | string;
  last_tour_date: string | null;
  last_booking_date: string | null;
}

/**
 * Tìm kiếm khách hàng theo tên, số điện thoại, email hoặc mã khách hàng
 * Sử dụng RPC server-side search_customers có phân quyền RLS
 */
export async function searchCustomers(query: string): Promise<CustomerSearchResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const { data, error } = await supabase.rpc("search_customers", {
    p_query: cleanQuery,
  });

  if (error) {
    console.error("Lỗi khi tìm kiếm khách hàng:", error);
    throw new Error(error.message);
  }

  return ((data || []) as SearchCustomerDbRow[]).map((row) => ({
    id: row.id,
    customer_code: row.customer_code,
    full_name: row.full_name,
    phone: row.phone,
    email: row.email,
    country: row.country,
    created_at: row.created_at,
    total_orders: Number(row.total_orders || 0),
    total_visits: Number(row.total_visits || 0),
    last_tour_date: row.last_tour_date,
    last_booking_date: row.last_booking_date,
  }));
}

/**
 * Lấy lịch sử tương tác và các đơn tour của khách hàng nhóm theo từng Return Visit
 */
export async function getCustomerHistory(customerId: string): Promise<CustomerHistoryData> {
  const { data, error } = await supabase.rpc("get_customer_history", {
    p_customer_id: customerId,
  });

  if (error) {
    console.error("Lỗi khi lấy lịch sử khách hàng:", error);
    throw new Error(error.message);
  }

  return data as CustomerHistoryData;
}

/**
 * Tạo đợt quay lại mới (Return Visit) cho khách hàng an toàn chống race condition
 */
export async function createCustomerReturnVisit(
  customerId: string,
  notes?: string
): Promise<CustomerReturnVisit> {
  const { data, error } = await supabase.rpc("create_customer_return_visit", {
    p_customer_id: customerId,
    p_notes: notes || null,
  });

  if (error) {
    console.error("Lỗi khi tạo đợt quay lại cho khách hàng:", error);
    throw new Error(error.message);
  }

  return data as CustomerReturnVisit;
}

/**
 * Tạo mới một khách hàng và Return Visit #1 cho đơn đầu tiên
 */
export async function createNewCustomerWithFirstVisit(params: {
  full_name: string;
  phone?: string | null;
  email?: string | null;
  country?: string | null;
}): Promise<{ customer: Customer; visit: CustomerReturnVisit }> {
  // 1. Tạo customer
  const { data: customerData, error: customerErr } = await supabase
    .from("customers")
    .insert({
      full_name: params.full_name.trim(),
      phone: params.phone ? params.phone.trim() : null,
      email: params.email ? params.email.trim() : null,
      country: params.country || null,
    })
    .select()
    .single();

  if (customerErr) {
    console.error("Lỗi tạo khách hàng:", customerErr);
    throw new Error(customerErr.message);
  }

  const customer = customerData as Customer;

  // 2. Tạo Return Visit #1
  const { data: visitData, error: visitErr } = await supabase
    .from("customer_return_visits")
    .insert({
      customer_id: customer.id,
      visit_number: 1,
      notes: "Đơn tour đầu tiên của khách hàng",
    })
    .select()
    .single();

  if (visitErr) {
    console.error("Lỗi tạo lượt tương tác đầu tiên:", visitErr);
    throw new Error(visitErr.message);
  }

  return { customer, visit: visitData as CustomerReturnVisit };
}

/**
 * Sắp xếp lại danh sách các đợt quay lại của khách hàng theo thứ tự mới (Atomic, transaction-safe)
 */
export async function reorderCustomerVisits(
  customerId: string,
  orderedVisitIds: string[]
): Promise<void> {
  const { error } = await supabase.rpc("reorder_customer_return_visits", {
    p_customer_id: customerId,
    p_ordered_visit_ids: orderedVisitIds,
  });

  if (error) {
    console.error("Lỗi khi sắp xếp lại các đợt quay lại:", error);
    throw new Error(error.message);
  }
}

/**
 * Di chuyển một đơn tour sang một đợt quay lại khác (hoặc gộp đợt)
 */
export async function moveOrderToVisit(
  orderId: string,
  targetVisitId: string,
  customerId: string
): Promise<void> {
  const { error } = await supabase.rpc("move_order_to_visit", {
    p_order_id: orderId,
    p_target_visit_id: targetVisitId,
    p_customer_id: customerId,
  });

  if (error) {
    console.error("Lỗi khi chuyển đơn sang đợt khác:", error);
    throw new Error(error.message);
  }
}

/**
 * Tách một đơn tour ra thành một đợt quay lại độc lập mới (ví dụ từ đợt có 2 đơn nhảy ra ngoài)
 */
export async function separateOrderToNewVisit(
  orderId: string,
  customerId: string,
  targetPosition?: number
): Promise<{ success: boolean; new_visit_id: string }> {
  const { data, error } = await supabase.rpc("separate_order_to_new_visit", {
    p_order_id: orderId,
    p_customer_id: customerId,
    p_target_position: targetPosition || null,
  });

  if (error) {
    console.error("Lỗi khi tách đơn thành đợt mới:", error);
    throw new Error(error.message);
  }

  return data as { success: boolean; new_visit_id: string };
}

