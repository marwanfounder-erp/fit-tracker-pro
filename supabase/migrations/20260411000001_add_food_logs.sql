
CREATE TABLE public.food_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  food_name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🍽️',
  quantity NUMERIC NOT NULL DEFAULT 100,
  unit TEXT NOT NULL DEFAULT 'g',
  grams_total NUMERIC NOT NULL,
  protein_per_100g NUMERIC NOT NULL,
  calories_per_100g NUMERIC NOT NULL,
  total_protein NUMERIC NOT NULL,
  total_calories NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view food logs" ON public.food_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert food logs" ON public.food_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete food logs" ON public.food_logs FOR DELETE USING (true);

CREATE TRIGGER update_food_logs_updated_at
BEFORE UPDATE ON public.food_logs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
