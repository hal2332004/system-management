import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();

  const cusCount = await client.query('SELECT count(*) FROM customers');
  const visitCount = await client.query('SELECT count(*) FROM customer_return_visits');
  const ordersCount = await client.query('SELECT count(*) FROM orders');
  const ordersWithCustomer = await client.query('SELECT count(*) FROM orders WHERE customer_id IS NOT NULL AND return_visit_id IS NOT NULL');

  console.log('--- Verification Results ---');
  console.log('Total customers:', cusCount.rows[0].count);
  console.log('Total return visits:', visitCount.rows[0].count);
  console.log('Total orders:', ordersCount.rows[0].count);
  console.log('Orders with customer & return visit:', ordersWithCustomer.rows[0].count);

  const sample = await client.query(`
    SELECT o.order_code, o.customer_name, c.customer_code, v.visit_number
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN customer_return_visits v ON o.return_visit_id = v.id
    LIMIT 5;
  `);
  console.log('\nSample linked orders:');
  console.table(sample.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
