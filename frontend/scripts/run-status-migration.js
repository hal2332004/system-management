import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Không tìm thấy DATABASE_URL');
    process.exit(1);
  }

  const sqlFile = path.join(__dirname, '..', 'supabase', 'migrations', '20260915170000_update_order_statuses.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Đã kết nối Supabase thành công!');
    await client.query(sql);
    console.log('🎉 Cập nhật database order_status thành công!');

    const res = await client.query(`SELECT status, count(*) FROM public.orders GROUP BY status`);
    console.log('📊 Dữ liệu trạng thái sau khi cập nhật:');
    console.table(res.rows);

    const enumValues = await client.query(`
      SELECT e.enumlabel 
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      WHERE t.typname = 'order_status'
      ORDER BY e.enumsortorder;
    `);
    console.log('🏷️ Danh sách giá trị enum order_status mới:');
    console.table(enumValues.rows);
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật database:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
