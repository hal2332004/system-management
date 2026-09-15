import dotenv from 'dotenv';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const updateTriggerSql = `
CREATE OR REPLACE FUNCTION public.log_order_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor uuid;
  v_target uuid;
  v_action text;
  v_desc text;
BEGIN
  v_actor := auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    v_action := 'create_order';
    v_target := NEW.owner_id;
    v_desc := 'Tạo đơn tour mới: ' || NEW.order_code;
    
    INSERT INTO public.activity_logs (actor_id, target_user_id, action_type, description)
    VALUES (v_actor, v_target, v_action, v_desc);

  ELSIF TG_OP = 'UPDATE' THEN
    v_target := NEW.owner_id;
    
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      v_action := 'update_status';
      v_desc := 'Cập nhật trạng thái đơn ' || NEW.order_code || ' thành: ' || 
        CASE (NEW.status::text)
          WHEN 'new' THEN 'Mới'
          WHEN 'consulting' THEN 'Đang tư vấn'
          WHEN 'closed' THEN 'Đã chốt'
          WHEN 'cancelled' THEN 'Đã hủy'
          ELSE NEW.status::text
        END;
    ELSE
      v_action := 'update_order';
      v_desc := 'Cập nhật thông tin đơn tour ' || NEW.order_code;
    END IF;

    INSERT INTO public.activity_logs (actor_id, target_user_id, action_type, description)
    VALUES (v_actor, v_target, v_action, v_desc);

  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete_order';
    v_target := OLD.owner_id;
    v_desc := 'Xóa đơn tour ' || OLD.order_code;

    INSERT INTO public.activity_logs (actor_id, target_user_id, action_type, description)
    VALUES (v_actor, v_target, v_action, v_desc);
  END IF;

  RETURN NULL;
END;
$$;
`;

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Đã kết nối Supabase.');

    console.log('⏳ Đang cập nhật function log_order_changes()...');
    await client.query(updateTriggerSql);
    console.log('✅ Đã cập nhật trigger function log_order_changes() thành công!');

    // Test thử update trên 1 order xem trigger có chạy mượt mà không
    console.log('🧪 Đang kiểm tra UPDATE trên bảng orders...');
    const testOrder = await client.query('SELECT id, status FROM public.orders LIMIT 1');
    if (testOrder.rows.length > 0) {
      const { id, status } = testOrder.rows[0];
      await client.query('UPDATE public.orders SET updated_at = now() WHERE id = $1', [id]);
      console.log(`✅ UPDATE đơn ${id} thành công không còn lỗi enum! Trạng thái hiện tại: ${status}`);
    }

  } catch (err) {
    console.error('❌ Lỗi:', err);
  } finally {
    await client.end();
  }
}

main();
