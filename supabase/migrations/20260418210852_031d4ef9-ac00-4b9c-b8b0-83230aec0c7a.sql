ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_source text NOT NULL DEFAULT 'online';
CREATE INDEX IF NOT EXISTS idx_orders_order_source ON public.orders(order_source);