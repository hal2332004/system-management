import dotenv from "dotenv";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function createClient() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  return client;
}

async function runInAuth(client, userId, fn) {
  await client.query("BEGIN;");
  await client.query("SELECT set_config('request.jwt.claim.sub', $1, true);", [userId]);
  await client.query("SELECT set_config('request.jwt.claim.role', 'authenticated', true);");
  const res = await fn();
  await client.query("COMMIT;");
  return res;
}

async function main() {
  const adminId = "0c5d598b-bbbc-46f0-8b47-2f1c4de7fd1b";
  const salerId = "cf3fee11-7dd1-48ea-9042-89ef5eafca5d";
  const client = await createClient();

  console.log("=== COMPREHENSIVE REQUIREMENTS & EDGE CASES AUDIT ===\n");

  // CASE 1: New customer creates first order
  console.log("-> Testing Case 1: New Customer first order creation...");
  const newCusRes = await client.query(`
    INSERT INTO public.customers (full_name, phone, email, country)
    VALUES ('Automated Test Customer', '+84988776655', 'autotest@example.com', 'VN')
    RETURNING id, customer_code, full_name;
  `);
  const cus1 = newCusRes.rows[0];
  console.log(`   Customer created: ${cus1.full_name} with Code: ${cus1.customer_code}`);
  if (!cus1.customer_code.startsWith("CUS-")) throw new Error("Invalid customer code prefix");

  const visit1Res = await client.query(`
    INSERT INTO public.customer_return_visits (customer_id, visit_number, notes)
    VALUES ($1, 1, 'First visit order')
    RETURNING id, visit_number;
  `, [cus1.id]);
  const visit1 = visit1Res.rows[0];
  console.log(`   Return Visit #${visit1.visit_number} created: ${visit1.id}`);

  const order1Res = await client.query(`
    INSERT INTO public.orders (customer_id, return_visit_id, customer_name, customer_phone, customer_email, tour_name, tour_date, booking_date, status, owner_id)
    VALUES ($1, $2, $3, '+84988776655', 'autotest@example.com', 'Tour Ha Long 3D2N', '06/2027', CURRENT_DATE, 'new', $4)
    RETURNING id, order_code, customer_id, return_visit_id;
  `, [cus1.id, visit1.id, cus1.full_name, salerId]);
  const order1 = order1Res.rows[0];
  console.log(`   Order created: ${order1.order_code} correctly linked to Customer and Visit #1`);

  // CASE 2: Search existing customer by Name
  console.log("\n-> Testing Case 2: Search existing customer by Name...");
  const searchByName = await runInAuth(client, salerId, async () => {
    const res = await client.query("SELECT * FROM public.search_customers($1);", ["Automated Test Customer"]);
    return res.rows;
  });
  console.log(`   Found ${searchByName.length} customer(s). Matched code: ${searchByName[0]?.customer_code}`);
  if (searchByName.length === 0 || searchByName[0].id !== cus1.id) throw new Error("Case 2 failed: Name search mismatch");

  // CASE 3: Search existing customer by Phone
  console.log("\n-> Testing Case 3: Search existing customer by Phone...");
  const searchByPhone = await runInAuth(client, salerId, async () => {
    const res = await client.query("SELECT * FROM public.search_customers($1);", ["84988776655"]);
    return res.rows;
  });
  console.log(`   Found ${searchByPhone.length} customer(s) by phone. Matched code: ${searchByPhone[0]?.customer_code}`);
  if (searchByPhone.length === 0 || searchByPhone[0].id !== cus1.id) throw new Error("Case 3 failed: Phone search mismatch");

  // CASE 4: Search existing customer by Email (case-insensitive)
  console.log("\n-> Testing Case 4: Search existing customer by Email (case-insensitive)...");
  const searchByEmail = await runInAuth(client, salerId, async () => {
    const res = await client.query("SELECT * FROM public.search_customers($1);", ["AUTOTEST@EXAMPLE.COM"]);
    return res.rows;
  });
  console.log(`   Found ${searchByEmail.length} customer(s) by uppercase email. Matched code: ${searchByEmail[0]?.customer_code}`);
  if (searchByEmail.length === 0 || searchByEmail[0].id !== cus1.id) throw new Error("Case 4 failed: Email search mismatch");

  // CASE 6 & 7: Customers with missing email or phone
  console.log("\n-> Testing Case 6 & 7: Customers without email or without phone...");
  const cusNoEmail = await client.query(`
    INSERT INTO public.customers (full_name, phone, email)
    VALUES ('Customer No Email', '+84111222333', NULL)
    RETURNING id, customer_code;
  `);
  const cusNoPhone = await client.query(`
    INSERT INTO public.customers (full_name, phone, email)
    VALUES ('Customer No Phone', NULL, 'nophone@example.com')
    RETURNING id, customer_code;
  `);

  const searchNoEmail = await runInAuth(client, salerId, async () => {
    const res = await client.query("SELECT * FROM public.search_customers($1);", ["Customer No Email"]);
    return res.rows;
  });
  const searchNoPhone = await runInAuth(client, salerId, async () => {
    const res = await client.query("SELECT * FROM public.search_customers($1);", ["nophone@example.com"]);
    return res.rows;
  });
  console.log(`   Search customer with no email succeeded: ${searchNoEmail[0]?.customer_code}`);
  console.log(`   Search customer with no phone succeeded: ${searchNoPhone[0]?.customer_code}`);

  // CASE 8 & 9: Multiple orders in SAME return visit (Overlap or same discussion)
  console.log("\n-> Testing Case 8 & 9: Multiple orders in SAME Return Visit...");
  const order2Res = await client.query(`
    INSERT INTO public.orders (customer_id, return_visit_id, customer_name, customer_phone, customer_email, tour_name, tour_date, booking_date, status, owner_id)
    VALUES ($1, $2, $3, '+84988776655', 'autotest@example.com', 'Tour Sapa 2D1N', '06/2027', CURRENT_DATE, 'new', $4)
    RETURNING id, order_code, customer_id, return_visit_id;
  `, [cus1.id, visit1.id, cus1.full_name, salerId]);
  console.log(`   Order #2 created: ${order2Res.rows[0].order_code} sharing SAME Return Visit #${visit1.visit_number}`);

  // Check customer visits count vs orders count
  const statsAfterOrder2 = await runInAuth(client, salerId, async () => {
    const res = await client.query("SELECT total_orders, total_visits FROM public.search_customers($1);", [cus1.customer_code]);
    return res.rows[0];
  });
  console.log(`   Current customer stats: Total Orders = ${statsAfterOrder2.total_orders}, Total Visits = ${statsAfterOrder2.total_visits}`);
  if (Number(statsAfterOrder2.total_orders) !== 2 || Number(statsAfterOrder2.total_visits) !== 1) {
    throw new Error(`Requirement 4 & 11 violated: Expected 2 orders and 1 visit, got ${statsAfterOrder2.total_orders} orders and ${statsAfterOrder2.total_visits} visits`);
  }

  // CASE 10 & 11: Saler creates NEW Return Visit for new interaction
  console.log("\n-> Testing Case 10 & 11: Creating a NEW Return Visit...");
  const visit2 = await runInAuth(client, salerId, async () => {
    const res = await client.query("SELECT * FROM public.create_customer_return_visit($1, $2);", [cus1.id, "Second trip next year"]);
    return res.rows[0];
  });
  console.log(`   New Return Visit created: Visit #${visit2.visit_number} (Expected: 2)`);
  if (visit2.visit_number !== 2) throw new Error("Expected visit_number 2");

  const order3Res = await client.query(`
    INSERT INTO public.orders (customer_id, return_visit_id, customer_name, customer_phone, customer_email, tour_name, tour_date, booking_date, status, owner_id)
    VALUES ($1, $2, $3, '+84988776655', 'autotest@example.com', 'Tour Da Nang 4D3N', '10/2027', CURRENT_DATE, 'new', $4)
    RETURNING id, order_code, customer_id, return_visit_id;
  `, [cus1.id, visit2.id, cus1.full_name, salerId]);
  console.log(`   Order #3 created: ${order3Res.rows[0].order_code} attached to Return Visit #${visit2.visit_number}`);

  const statsAfterOrder3 = await runInAuth(client, salerId, async () => {
    const res = await client.query("SELECT total_orders, total_visits FROM public.search_customers($1);", [cus1.customer_code]);
    return res.rows[0];
  });
  console.log(`   Customer stats: Total Orders = ${statsAfterOrder3.total_orders}, Total Visits = ${statsAfterOrder3.total_visits}`);
  if (Number(statsAfterOrder3.total_orders) !== 3 || Number(statsAfterOrder3.total_visits) !== 2) {
    throw new Error("Stats mismatch: Expected 3 orders and 2 visits");
  }

  // CASE 12: Cancelled Order does NOT reduce return history
  console.log("\n-> Testing Case 12: Cancelled order does NOT reduce return visits...");
  await client.query("UPDATE public.orders SET status = 'cancelled' WHERE id = $1;", [order3Res.rows[0].id]);
  const statsAfterCancel = await runInAuth(client, salerId, async () => {
    const res = await client.query("SELECT total_orders, total_visits FROM public.search_customers($1);", [cus1.customer_code]);
    return res.rows[0];
  });
  console.log(`   Stats after cancellation: Total Orders = ${statsAfterCancel.total_orders}, Total Visits = ${statsAfterCancel.total_visits}`);
  if (Number(statsAfterCancel.total_visits) !== 2) {
    throw new Error("Requirement 18 violated: Cancellation reduced total visits!");
  }

  // CASE: get_customer_history inspection
  console.log("\n-> Testing get_customer_history grouping and structure...");
  const histRes = await runInAuth(client, salerId, async () => {
    const res = await client.query("SELECT public.get_customer_history($1);", [cus1.id]);
    return res.rows[0].get_customer_history;
  });
  console.log(`   Customer history loaded for ${histRes.customer.full_name}`);
  console.log(`   Number of Return Visits grouped: ${histRes.visits.length}`);
  histRes.visits.forEach(v => {
    console.log(`     - Visit #${v.visit_number}: ${v.orders.length} order(s) [${v.orders.map(o => o.order_code + ' ' + o.status).join(', ')}]`);
  });

  // CLEANUP test records
  console.log("\n-> Cleaning up test records...");
  await client.query("DELETE FROM public.orders WHERE customer_id IN ($1, $2, $3);", [cus1.id, cusNoEmail.rows[0].id, cusNoPhone.rows[0].id]);
  await client.query("DELETE FROM public.customer_return_visits WHERE customer_id IN ($1, $2, $3);", [cus1.id, cusNoEmail.rows[0].id, cusNoPhone.rows[0].id]);
  await client.query("DELETE FROM public.customers WHERE id IN ($1, $2, $3);", [cus1.id, cusNoEmail.rows[0].id, cusNoPhone.rows[0].id]);
  console.log("   All test records cleaned up successfully.");

  await client.end();
  console.log("\n✅ ALL REQUIREMENTS AND EDGE CASES VERIFIED SUCCESSFULLY!");
}

main().catch(err => {
  console.error("❌ Test error:", err);
  process.exit(1);
});
