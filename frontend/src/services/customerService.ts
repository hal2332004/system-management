import { supabase } from "@/lib/supabase";
import type {
  CustomerSearchResult,
  CustomerHistoryData,
  CustomerHistoryVisit,
  CustomerHistoryOrder,
  CustomerReturnVisit,
  Customer,
} from "@/types";
import { parseTourMonths } from "@/components/MonthMultiSelector";

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

export interface OverlapDetectionResult {
  hasOverlap: boolean;
  overlappingOrders: CustomerHistoryOrder[];
  overlappingVisits: CustomerHistoryVisit[];
  matchingMonths: string[];
}

/**
 * Kiểm tra sự trùng lặp tháng khởi hành giữa đơn mới và các đơn trước đó của khách hàng (Requirement 10)
 * Hoàn toàn tất định (deterministic), không dùng AI/LLM
 */
export function detectTourDateOverlap(
  newTourDateStr: string,
  visits: CustomerHistoryVisit[],
  excludeOrderId?: string
): OverlapDetectionResult {
  const newMonths = parseTourMonths(newTourDateStr);
  if (newMonths.length === 0) {
    return {
      hasOverlap: false,
      overlappingOrders: [],
      overlappingVisits: [],
      matchingMonths: [],
    };
  }

  const overlappingOrders: CustomerHistoryOrder[] = [];
  const overlappingVisitsMap = new Map<string, CustomerHistoryVisit>();
  const matchingMonthsSet = new Set<string>();

  for (const visit of visits) {
    for (const order of visit.orders) {
      if (excludeOrderId && order.id === excludeOrderId) continue;

      const orderMonths = parseTourMonths(order.tour_date);
      const common = newMonths.filter((m) => orderMonths.includes(m));

      if (common.length > 0) {
        overlappingOrders.push(order);
        overlappingVisitsMap.set(visit.id, visit);
        common.forEach((m) => matchingMonthsSet.add(m));
      }
    }
  }

  return {
    hasOverlap: overlappingOrders.length > 0,
    overlappingOrders,
    overlappingVisits: Array.from(overlappingVisitsMap.values()),
    matchingMonths: Array.from(matchingMonthsSet),
  };
}
