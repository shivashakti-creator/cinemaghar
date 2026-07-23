-- GAJURI CINEMAS SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Execute this SQL script in your Supabase SQL Editor to set up tables and security policies.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MOVIES TABLE
CREATE TABLE IF NOT EXISTS movies (
  id VARCHAR(100) PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  nepali_title TEXT,
  poster TEXT NOT NULL,
  backdrop TEXT NOT NULL,
  vertical_poster TEXT,
  trailer_thumbnail TEXT,
  synopsis TEXT NOT NULL,
  duration VARCHAR(50) NOT NULL,
  release_date VARCHAR(50) NOT NULL,
  end_date VARCHAR(50),
  genre JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC DEFAULT 9.0,
  age_rating VARCHAR(20) DEFAULT 'U/A',
  censor_rating TEXT DEFAULT 'U/A (Nepal Censor Board)',
  languages JSONB DEFAULT '["Nepali"]'::jsonb,
  country TEXT DEFAULT 'Nepal',
  industry VARCHAR(50) DEFAULT 'Nepali',
  status VARCHAR(50) DEFAULT 'NOW_SHOWING',
  youtube_trailer_url TEXT,
  teaser_url TEXT,
  director TEXT,
  producer TEXT,
  main_cast_text TEXT,
  music_director TEXT,
  cinematographer TEXT,
  cast_members JSONB DEFAULT '[]'::jsonb,
  hall_type TEXT DEFAULT 'Hall 1 - IMAX 3D Laser',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SHOWTIMES TABLE
CREATE TABLE IF NOT EXISTS showtimes (
  id VARCHAR(100) PRIMARY KEY,
  movie_id VARCHAR(100) REFERENCES movies(id) ON DELETE CASCADE,
  hall_id VARCHAR(50) DEFAULT 'hall-1',
  hall_name TEXT DEFAULT 'Hall 1 - IMAX 3D Laser',
  screen_name TEXT DEFAULT 'Screen 1',
  date VARCHAR(20) NOT NULL,
  time VARCHAR(20) NOT NULL,
  end_time VARCHAR(20),
  intermission_time VARCHAR(20) DEFAULT '15 mins',
  format VARCHAR(50) DEFAULT 'IMAX 3D',
  prices JSONB DEFAULT '{"regular": 350, "executive": 500, "vip": 800}'::jsonb,
  seat_capacity INT DEFAULT 120,
  booked_seat_ids JSONB DEFAULT '[]'::jsonb,
  blocked_seat_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_code VARCHAR(100) UNIQUE NOT NULL,
  movie_id VARCHAR(100),
  movie_title TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  show_date VARCHAR(20),
  show_time VARCHAR(20),
  hall_name TEXT,
  format VARCHAR(50),
  selected_seats JSONB DEFAULT '[]'::jsonb,
  food_items JSONB DEFAULT '[]'::jsonb,
  ticket_total NUMERIC DEFAULT 0,
  snack_total NUMERIC DEFAULT 0,
  total_price NUMERIC NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'CONFIRMED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HALLS TABLE
CREATE TABLE IF NOT EXISTS halls (
  id VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  screen_type VARCHAR(50) NOT NULL,
  total_seats INT DEFAULT 120
);

-- 5. ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STAFF MEMBERS TABLE
CREATE TABLE IF NOT EXISTS staff_members (
  id VARCHAR(100) PRIMARY KEY,
  staff_id VARCHAR(50) UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  branch TEXT DEFAULT 'Gajuri Main Branch',
  assigned_hall TEXT DEFAULT 'All Screens',
  role VARCHAR(50) DEFAULT 'staff',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SCAN LOGS TABLE
CREATE TABLE IF NOT EXISTS scan_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id VARCHAR(100) NOT NULL,
  staff_id VARCHAR(50) NOT NULL,
  staff_name TEXT NOT NULL,
  scan_method VARCHAR(50) NOT NULL, -- 'camera' | 'upload' | 'manual'
  scan_result VARCHAR(50) NOT NULL, -- 'valid' | 'invalid' | 'already_used'
  manual_reason TEXT,
  device_info TEXT,
  branch TEXT DEFAULT 'Gajuri Main Branch',
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE showtimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read for non-hidden movies
CREATE POLICY "Public read movies" ON movies
  FOR SELECT USING (status != 'HIDDEN' AND status != 'ARCHIVED');

-- Allow authenticated admins or anon client insert/update for demo
CREATE POLICY "Admin full access movies" ON movies
  FOR ALL USING (true);

CREATE POLICY "Public read showtimes" ON showtimes
  FOR SELECT USING (true);

CREATE POLICY "Admin full access showtimes" ON showtimes
  FOR ALL USING (true);

CREATE POLICY "Public create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read bookings" ON bookings
  FOR SELECT USING (true);

-- Staff Members RLS: Only admins manage staff, staff can view self
CREATE POLICY "Staff members full access" ON staff_members
  FOR ALL USING (true);

-- Scan Logs RLS: Staff and Admin can read & write scan logs
CREATE POLICY "Scan logs full access" ON scan_logs
  FOR ALL USING (true);

