CREATE TABLE public.product_prices (
  product_id text NOT NULL,
  size text NOT NULL,
  price integer NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, size)
);
GRANT SELECT ON public.product_prices TO anon, authenticated;
GRANT ALL ON public.product_prices TO service_role;
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read prices" ON public.product_prices FOR SELECT TO anon, authenticated USING (true);