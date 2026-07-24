-- GAJURI CINEMAS SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Execute this SQL script in your Supabase SQL Editor to set up tables and security policies.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MOVIES TABLE
CREATE TABLE IF NOT EXISTS movies (
  id VARCHAR(100) PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  nepali_title TEXT DEFAULT '',
  poster TEXT NOT NULL,
  backdrop TEXT NOT NULL,
  vertical_poster TEXT DEFAULT '',
  trailer_thumbnail TEXT DEFAULT '',
  synopsis TEXT NOT NULL,
  duration VARCHAR(50) NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  release_date VARCHAR(50) NOT NULL,
  end_date VARCHAR(50) DEFAULT '',
  genre JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC DEFAULT 9.0,
  age_rating VARCHAR(20) DEFAULT 'U/A',
  censor_rating TEXT DEFAULT 'U/A (Nepal Censor Board)',
  languages JSONB DEFAULT '["Nepali"]'::jsonb,
  country TEXT DEFAULT 'Nepal',
  industry VARCHAR(50) DEFAULT 'Nepali',
  status VARCHAR(50) DEFAULT 'NOW_SHOWING',
  youtube_trailer_url TEXT DEFAULT '',
  teaser_url TEXT DEFAULT '',
  director TEXT DEFAULT '',
  producer TEXT DEFAULT '',
  main_cast_text TEXT DEFAULT '',
  music_director TEXT DEFAULT '',
  cinematographer TEXT DEFAULT '',
  cast_members JSONB DEFAULT '[]'::jsonb,
  hall_type TEXT DEFAULT 'Hall 1 - IMAX 3D Laser',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- MIGRATION: ADD MISSING COLUMNS TO EXISTING public.movies
-- ===================================================
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS subtitle TEXT DEFAULT '';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS nepali_title TEXT DEFAULT '';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS vertical_poster TEXT DEFAULT '';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS trailer_thumbnail TEXT DEFAULT '';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 120;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS end_date TEXT DEFAULT '';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 9.0;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS age_rating TEXT DEFAULT 'U/A';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS censor_rating TEXT DEFAULT 'U/A (Nepal Censor Board)';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Nepal';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT 'Nepali';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS youtube_trailer_url TEXT DEFAULT '';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS teaser_url TEXT DEFAULT '';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS director TEXT DEFAULT '';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS producer TEXT DEFAULT '';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS main_cast_text TEXT DEFAULT '';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS music_director TEXT DEFAULT '';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS cinematographer TEXT DEFAULT '';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS cast_members JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS hall_type TEXT DEFAULT 'Hall 1 - IMAX 3D Laser';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT true;

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

ALTER TABLE public.showtimes ADD COLUMN IF NOT EXISTS hall_id VARCHAR(50) DEFAULT 'hall-1';
ALTER TABLE public.showtimes ADD COLUMN IF NOT EXISTS hall_name TEXT DEFAULT 'Hall 1 - IMAX 3D Laser';
ALTER TABLE public.showtimes ADD COLUMN IF NOT EXISTS screen_name TEXT DEFAULT 'Screen 1';
ALTER TABLE public.showtimes ADD COLUMN IF NOT EXISTS end_time VARCHAR(20);
ALTER TABLE public.showtimes ADD COLUMN IF NOT EXISTS intermission_time VARCHAR(20) DEFAULT '15 mins';
ALTER TABLE public.showtimes ADD COLUMN IF NOT EXISTS format VARCHAR(50) DEFAULT 'IMAX 3D';
ALTER TABLE public.showtimes ADD COLUMN IF NOT EXISTS prices JSONB DEFAULT '{"regular": 350, "executive": 500, "vip": 800}'::jsonb;
ALTER TABLE public.showtimes ADD COLUMN IF NOT EXISTS seat_capacity INT DEFAULT 120;
ALTER TABLE public.showtimes ADD COLUMN IF NOT EXISTS booked_seat_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.showtimes ADD COLUMN IF NOT EXISTS blocked_seat_ids JSONB DEFAULT '[]'::jsonb;

-- 3. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(100) PRIMARY KEY,
  booking_code VARCHAR(100) UNIQUE NOT NULL,
  movie_id VARCHAR(100),
  movie_title TEXT NOT NULL,
  movie_poster TEXT,
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
  qr_token TEXT,
  scanned_by VARCHAR(100),
  scanned_by_name TEXT,
  scanned_at TIMESTAMPTZ,
  manual_checkin_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS movie_poster TEXT DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS qr_token TEXT DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS scanned_by VARCHAR(100) DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS scanned_by_name TEXT DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS scanned_at TIMESTAMPTZ;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS manual_checkin_reason TEXT DEFAULT '';

-- 4. HALLS TABLE
CREATE TABLE IF NOT EXISTS halls (
  id VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  screen_type VARCHAR(50) NOT NULL,
  total_seats INT DEFAULT 120
);

-- 5. ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(100) PRIMARY KEY,
  admin_id VARCHAR(50),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  password_hash TEXT DEFAULT 'admin123',
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS admin_id VARCHAR(50);
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT 'admin123';

-- 6. STAFF MEMBERS TABLE
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

ALTER TABLE public.staff_members ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT 'staff123';
ALTER TABLE public.staff_members ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'Gajuri Main Branch';
ALTER TABLE public.staff_members ADD COLUMN IF NOT EXISTS assigned_hall TEXT DEFAULT 'All Screens';
ALTER TABLE public.staff_members ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'staff';
ALTER TABLE public.staff_members ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 7. SCAN LOGS TABLE
CREATE TABLE IF NOT EXISTS scan_logs (
  id VARCHAR(100) PRIMARY KEY,
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
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Allow public full access for movies (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Public full access movies" ON movies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access showtimes" ON showtimes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access staff_members" ON staff_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access scan_logs" ON scan_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access admins" ON admins FOR ALL USING (true) WITH CHECK (true);


