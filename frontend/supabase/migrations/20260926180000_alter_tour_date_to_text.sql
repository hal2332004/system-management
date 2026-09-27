-- Migration: Change tour_date from DATE to TEXT to support multiple departure months (e.g. "02/2027, 03/2027")
ALTER TABLE orders ALTER COLUMN tour_date TYPE text USING to_char(tour_date, 'MM/YYYY');
