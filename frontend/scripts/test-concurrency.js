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

async function callCreateVisit(client, userId, customerId, notes) {
  await client.query("BEGIN;");
  await client.query("SELECT set_config('request.jwt.claim.sub', $1, true);", [userId]);
  await client.query("SELECT set_config('request.jwt.claim.role', 'authenticated', true);");
  const res = await client.query("SELECT * FROM public.create_customer_return_visit($1, $2);", [customerId, notes]);
  await client.query("COMMIT;");
  return res.rows[0];
}

async function main() {
  const adminId = "0c5d598b-bbbc-46f0-8b47-2f1c4de7fd1b";
  const salerAId = "cf3fee11-7dd1-48ea-9042-89ef5eafca5d";
  const salerBId = "651414a9-83ff-43c7-8a96-ca6a55d07ffd";

  const adminClient = await createClient();

  // 1. Create a test customer
  const cusRes = await adminClient.query(`
    INSERT INTO public.customers (full_name, phone, email)
    VALUES ('Concurrency Test Customer', '0999999999', 'concurrency@test.com')
    RETURNING id, customer_code;
  `);
  const testCusId = cusRes.rows[0].id;
  console.log("Created test customer:", cusRes.rows[0]);

  // 2. Insert Visit #1
  await adminClient.query(`
    INSERT INTO public.customer_return_visits (customer_id, visit_number)
    VALUES ($1, 1);
  `, [testCusId]);
  console.log("Created initial Visit #1");

  // 3. Connect Saler A and Saler B
  const clientA = await createClient();
  const clientB = await createClient();

  console.log("Running concurrent create_customer_return_visit calls from 2 different Salers...");
  const [resA, resB] = await Promise.all([
    callCreateVisit(clientA, salerAId, testCusId, "Saler A concurrent"),
    callCreateVisit(clientB, salerBId, testCusId, "Saler B concurrent")
  ]);

  console.log("Saler A created visit_number:", resA.visit_number);
  console.log("Saler B created visit_number:", resB.visit_number);

  // 4. Query all visits for test customer to verify sequential numbering
  const allVisits = await adminClient.query(`
    SELECT id, visit_number, notes FROM public.customer_return_visits
    WHERE customer_id = $1
    ORDER BY visit_number ASC;
  `, [testCusId]);
  console.log("\nAll visits created for customer:");
  console.table(allVisits.rows);

  // 5. Clean up test customer
  await adminClient.query("DELETE FROM public.customers WHERE id = $1;", [testCusId]);
  console.log("Cleaned up test customer successfully.");

  await clientA.end();
  await clientB.end();
  await adminClient.end();
}

main().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
