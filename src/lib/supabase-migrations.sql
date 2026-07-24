-- ===================================================
-- GAJURI CINEMAS - PAYMENT SYSTEM SUPABASE SQL MIGRATIONS
-- ===================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. IMPROVED BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_reference VARCHAR(100) UNIQUE NOT NULL,
  user_id VARCHAR(100),
  movie_id VARCHAR(100) NOT NULL,
  movie_title TEXT NOT NULL,
  movie_poster TEXT,
  show_id VARCHAR(100) NOT NULL,
  hall_name TEXT DEFAULT 'Hall 1',
  show_date VARCHAR(20) NOT NULL,
  show_time VARCHAR(20) NOT NULL,
  format VARCHAR(20) DEFAULT '2D',
  seat_numbers JSONB DEFAULT '[]'::jsonb NOT NULL,
  amount NUMERIC NOT NULL,
  ticket_total NUMERIC DEFAULT 0,
  snack_total NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  food_items JSONB DEFAULT '[]'::jsonb,
  payment_method VARCHAR(50) NOT NULL, -- 'esewa' | 'khalti' | 'fonepay' | 'counter'
  payment_status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- 'pending' | 'success' | 'failed' | 'refunded'
  booking_status VARCHAR(50) DEFAULT 'payment_pending' NOT NULL, -- 'pending' | 'payment_pending' | 'paid' | 'confirmed' | 'cancelled' | 'failed' | 'expired'
  transaction_id TEXT,
  gateway_reference TEXT,
  qr_token TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for high speed reference lookups
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status, payment_status);

-- 2. PAYMENT LOGS TABLE
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id TEXT,
  booking_reference VARCHAR(100) NOT NULL,
  gateway VARCHAR(50) NOT NULL,
  request_payload JSONB DEFAULT '{}'::jsonb,
  response_payload JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(50) NOT NULL, -- 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_ref ON payment_logs(booking_reference);

-- 3. SEAT RESERVATIONS TABLE (10-minute temporary seat lock)
CREATE TABLE IF NOT EXISTS seat_reservations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  show_id VARCHAR(100) NOT NULL,
  seat_id VARCHAR(20) NOT NULL,
  booking_id VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'reserved' NOT NULL, -- 'reserved' | 'locked' | 'expired'
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(show_id, seat_id)
);

CREATE INDEX IF NOT EXISTS idx_seat_reservations_show ON seat_reservations(show_id, seat_id);

-- 4. FUNCTION TO CLEAN EXPIRED SEAT RESERVATIONS
CREATE OR REPLACE FUNCTION release_expired_seat_reservations()
RETURNS INT AS $$
DECLARE
  released_count INT;
BEGIN
  -- Mark reservations as expired
  UPDATE seat_reservations
  SET status = 'expired'
  WHERE status = 'reserved' AND expires_at < NOW();

  -- Delete expired reservations to free seats
  WITH deleted AS (
    DELETE FROM seat_reservations
    WHERE status = 'expired'
    RETURNING *
  )
  SELECT count(*) INTO released_count FROM deleted;

  -- Update associated bookings status to expired
  UPDATE bookings
  SET booking_status = 'expired', payment_status = 'failed'
  WHERE booking_status = 'payment_pending' AND expires_at < NOW();

  RETURN released_count;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_reservations ENABLE ROW LEVEL SECURITY;

-- Security Policies
CREATE POLICY "Public read bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Public insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update bookings" ON bookings FOR UPDATE USING (true);

CREATE POLICY "Public full payment_logs" ON payment_logs FOR ALL USING (true);
CREATE POLICY "Public full seat_reservations" ON seat_reservations FOR ALL USING (true);
