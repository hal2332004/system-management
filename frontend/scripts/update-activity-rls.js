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

  await client.query(`
    ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can read relevant activity logs" ON public.activity_logs;
    DROP POLICY IF EXISTS "Admins can read all activity logs" ON public.activity_logs;
    DROP POLICY IF EXISTS "Allow authenticated users to read activity logs" ON public.activity_logs;
    DROP POLICY IF EXISTS "Allow all read activity logs" ON public.activity_logs;

    CREATE POLICY "Allow all read activity logs" 
    ON public.activity_logs 
    FOR SELECT 
    USING (true);
  `);

  console.log('Successfully updated RLS policy to allow all reads on activity_logs!');

  const policies = await client.query(`
    SELECT policyname, permissive, roles, cmd, qual 
    FROM pg_policies 
    WHERE tablename = 'activity_logs';
  `);
  console.table(policies.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
