
-- ─────────────────────────────────────────────
-- 1. PROFILES TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- 2. ADMIN HELPER FUNCTION (SECURITY DEFINER so it bypasses RLS)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- ─────────────────────────────────────────────
-- 3. PROFILES RLS POLICIES
-- ─────────────────────────────────────────────
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (true); -- needed for trigger

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (id = auth.uid() OR public.is_admin());

-- ─────────────────────────────────────────────
-- 4. AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─────────────────────────────────────────────
-- 5. ADD user_id TO workout_logs
-- ─────────────────────────────────────────────
ALTER TABLE public.workout_logs
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Drop old open policies
DROP POLICY IF EXISTS "Anyone can view workout logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Anyone can insert workout logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Anyone can update workout logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Anyone can delete workout logs" ON public.workout_logs;

-- New user-scoped policies
CREATE POLICY "workout_logs_select" ON public.workout_logs
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "workout_logs_insert" ON public.workout_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "workout_logs_update" ON public.workout_logs
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "workout_logs_delete" ON public.workout_logs
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- ─────────────────────────────────────────────
-- 6. ADD user_id TO food_logs
-- ─────────────────────────────────────────────
ALTER TABLE public.food_logs
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Drop old open policies
DROP POLICY IF EXISTS "Anyone can view food logs" ON public.food_logs;
DROP POLICY IF EXISTS "Anyone can insert food logs" ON public.food_logs;
DROP POLICY IF EXISTS "Anyone can delete food logs" ON public.food_logs;

-- New user-scoped policies
CREATE POLICY "food_logs_select" ON public.food_logs
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "food_logs_insert" ON public.food_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "food_logs_delete" ON public.food_logs
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- ─────────────────────────────────────────────
-- 7. UPDATED_AT TRIGGER FOR PROFILES
-- ─────────────────────────────────────────────
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
