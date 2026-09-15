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
  const cols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'orders';
  `);
  console.log('Columns in orders:');
  console.table(cols.rows);

  const pub = await client.query(`
    SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
  `);
  console.log('Realtime publication tables:');
  console.table(pub.rows);

  const policies = await client.query(`
    SELECT policyname, permissive, roles, cmd, qual 
    FROM pg_policies 
    WHERE tablename = 'orders';
  `);
  console.log('Policies on orders:');
  console.table(policies.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
