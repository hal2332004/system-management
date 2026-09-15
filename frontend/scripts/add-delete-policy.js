import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    await client.connect();
    const sql = `
      -- Cho phép Saler xóa đơn tour của chính mình nếu tài khoản còn hoạt động
      DROP POLICY IF EXISTS "Salers can delete their own orders" ON public.orders;
      CREATE POLICY "Salers can delete their own orders" ON public.orders
        FOR DELETE USING (auth.uid() = owner_id AND public.is_my_account_active());
    `;
    await client.query(sql);
    console.log('✅ Added "Salers can delete their own orders" RLS policy successfully!');
  } catch (err) {
    console.error('❌ Error executing SQL:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
