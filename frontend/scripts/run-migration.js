import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260909100000_tourflow_schema.sql');
const resetSqlPath = path.join(__dirname, '..', 'supabase', 'migrations', 'reset_admin.sql');

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ LỖI: Không tìm thấy biến DATABASE_URL trong file .env');
    console.error('Vui lòng thêm DATABASE_URL=postgres://[user]:[password]@[host]:[port]/[db_name] vào file .env');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  let fileToRun = sqlPath;
  let fileDesc = 'Schema Database chính';

  if (args.includes('--reset-admin')) {
    fileToRun = resetSqlPath;
    fileDesc = 'Script Reset Admin';
  }

  if (!fs.existsSync(fileToRun)) {
    console.error(`❌ LỖI: Không tìm thấy file SQL tại ${fileToRun}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(fileToRun, 'utf8');
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase hosted databases
  });

  try {
    console.log(`🔌 Đang kết nối tới Supabase...`);
    await client.connect();
    console.log('✅ Đã kết nối thành công!');
    
    console.log(`⏳ Đang chạy ${fileDesc}...`);
    await client.query(sql);
    
    console.log(`🎉 Chạy ${fileDesc} thành công tuyệt đối!`);
  } catch (err) {
    console.error('❌ Lỗi khi chạy SQL:', err);
  } finally {
    await client.end();
  }
}

runMigration();
