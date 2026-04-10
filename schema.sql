-- ============================================================
-- DELIVERY LMS — Supabase Database Schema
-- Run this in Supabase → SQL Editor → New Query → Run
-- ============================================================

-- 1. Users Profile Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Progress Table — stores per-day, per-tab completion
CREATE TABLE IF NOT EXISTS public.progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_id INTEGER NOT NULL CHECK (day_id BETWEEN 1 AND 10),
  tab TEXT NOT NULL CHECK (tab IN ('video','audio','theory','practice','workbook')),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, day_id, tab)
);

-- 3. Day Completions Table — tracks which full days are done
CREATE TABLE IF NOT EXISTS public.day_completions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_id INTEGER NOT NULL CHECK (day_id BETWEEN 1 AND 10),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  quiz_score INTEGER DEFAULT 0,
  UNIQUE (user_id, day_id)
);

-- 4. Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  score INTEGER DEFAULT 0,
  UNIQUE (user_id)
);

-- ── ROW LEVEL SECURITY (RLS) ────────────────────────────────
-- Users can only see/edit their OWN data

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Progress
CREATE POLICY "Users can view own progress" ON public.progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Day Completions
CREATE POLICY "Users can view own completions" ON public.day_completions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON public.day_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Certificates
CREATE POLICY "Users can view own certificate" ON public.certificates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own certificate" ON public.certificates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── AUTO-CREATE PROFILE ON SIGNUP ──────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Learner'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── INDEXES for performance ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_progress_user_day ON public.progress(user_id, day_id);
CREATE INDEX IF NOT EXISTS idx_day_completions_user ON public.day_completions(user_id);

-- ============================================================
-- DONE! Your database is ready.
-- ============================================================
