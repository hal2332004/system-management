-- Migration: Add destinations array column to orders table
-- Supports multi-select destinations (Destino)
-- Date: 2026-09-27

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS destinations text[] DEFAULT '{}'::text[];

-- Normalize any NULL values to empty array
UPDATE public.orders
SET destinations = '{}'::text[]
WHERE destinations IS NULL;

-- Comment for database documentation
COMMENT ON COLUMN public.orders.destinations IS 'List of destinations the customer is interested in visiting (Destino)';
