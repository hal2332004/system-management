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

  const query = `
    SELECT 
      o.order_code, 
      o.customer_name, 
      c.customer_code, 
      v.visit_number, 
      o.tour_name, 
      o.tour_date, 
      o.status,
      o.created_at
    FROM orders o 
    LEFT JOIN customers c ON o.customer_id = c.id 
    LEFT JOIN customer_return_visits v ON o.return_visit_id = v.id 
    WHERE o.customer_name ILIKE '%Alejandro%' 
    ORDER BY o.created_at ASC;
  `;

  const res = await client.query(query);
  console.log('Alejandro Orders:');
  console.table(res.rows);

  // Check all return visits for this customer
  if (res.rows.length > 0 && res.rows[0].customer_code) {
    const visits = await client.query(`
      SELECT v.visit_number, count(o.id) as orders_count
      FROM customer_return_visits v
      JOIN customers c ON v.customer_id = c.id
      LEFT JOIN orders o ON o.return_visit_id = v.id
      WHERE c.customer_code = $1
      GROUP BY v.visit_number
      ORDER BY v.visit_number ASC;
    `, [res.rows[0].customer_code]);
    console.log('\nReturn visits breakdown:');
    console.table(visits.rows);
  }

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
