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
      -- Function tra cứu email an toàn từ username cho cả anon và authenticated
      CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username text)
      RETURNS text
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      DECLARE
        v_email text;
      BEGIN
        SELECT email INTO v_email
        FROM public.profiles
        WHERE LOWER(username) = LOWER(p_username)
        LIMIT 1;
        RETURN v_email;
      END;
      $$;

      GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO anon, authenticated;
    `;
    await client.query(sql);
    console.log('✅ Created secure RPC function get_email_by_username successfully!');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.end();
  }
}

run();
