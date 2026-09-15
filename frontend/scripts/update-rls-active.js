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
      -- Hàm kiểm tra tài khoản của user hiện tại có đang hoạt động (is_active = true) hay không
      CREATE OR REPLACE FUNCTION public.is_my_account_active()
      RETURNS boolean
      LANGUAGE sql
      SECURITY DEFINER
      SET search_path = public
      STABLE
      AS $$
        SELECT coalesce((SELECT is_active FROM public.profiles WHERE id = auth.uid()), false);
      $$;

      GRANT EXECUTE ON FUNCTION public.is_my_account_active() TO authenticated;

      -- Cập nhật chính sách RLS cho orders: chỉ cho phép nhân viên có tài khoản còn hoạt động (is_active = true)
      DROP POLICY IF EXISTS "Salers can view their own orders" ON public.orders;
      CREATE POLICY "Salers can view their own orders" ON public.orders
        FOR SELECT USING (auth.uid() = owner_id AND public.is_my_account_active());

      DROP POLICY IF EXISTS "Salers can insert their own orders" ON public.orders;
      CREATE POLICY "Salers can insert their own orders" ON public.orders
        FOR INSERT WITH CHECK (auth.uid() = owner_id AND public.is_my_account_active());

      DROP POLICY IF EXISTS "Salers can update their own orders" ON public.orders;
      CREATE POLICY "Salers can update their own orders" ON public.orders
        FOR UPDATE USING (auth.uid() = owner_id AND public.is_my_account_active());
    `;
    await client.query(sql);
    console.log('✅ Updated RLS policies and is_my_account_active function successfully!');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
