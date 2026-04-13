
-- ─────────────────────────────────────────────
-- USER PROGRAMS TABLE
-- Stores per-user workout program (7-day split)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_programs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_key     TEXT NOT NULL,
  label       TEXT NOT NULL,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'workout',
  exercises   JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, day_key)
);

ALTER TABLE public.user_programs ENABLE ROW LEVEL SECURITY;

-- Users can view and edit their own program; admins can view/edit all
CREATE POLICY "user_programs_select" ON public.user_programs
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_programs_insert" ON public.user_programs
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_programs_update" ON public.user_programs
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_programs_delete" ON public.user_programs
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

CREATE TRIGGER update_user_programs_updated_at
  BEFORE UPDATE ON public.user_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
