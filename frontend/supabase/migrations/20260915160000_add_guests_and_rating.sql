-- Migration: Add num_guests and rating columns to orders table

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS num_guests integer DEFAULT 1 CHECK (num_guests > 0),
ADD COLUMN IF NOT EXISTS rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5);

-- Update existing records to default values if NULL
UPDATE public.orders SET num_guests = 1 WHERE num_guests IS NULL;
UPDATE public.orders SET rating = 5 WHERE rating IS NULL;
