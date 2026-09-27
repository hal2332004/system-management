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
    console.error('❌ DATABASE_URL is not set in .env');
    process.exit(1);
  }

  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('❌ Please provide a migration filename or path.');
    process.exit(1);
  }

  let filePath = fileArg;
  if (!path.isAbsolute(filePath)) {
    filePath = path.join(__dirname, '..', 'supabase', 'migrations', fileArg);
    if (!fs.existsSync(filePath)) {
      filePath = path.resolve(fileArg);
    }
  }

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Migration file not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`Running migration: ${filePath}`);
  const sql = fs.readFileSync(filePath, 'utf8');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');
    await client.query(sql);
    console.log('Migration executed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
