-- Migration: Thêm trường Quốc gia và Nguồn request vào bảng orders
-- Ngày tạo: 2026-09-17

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS customer_country VARCHAR(2),
ADD COLUMN IF NOT EXISTS request_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS request_source_other TEXT;
