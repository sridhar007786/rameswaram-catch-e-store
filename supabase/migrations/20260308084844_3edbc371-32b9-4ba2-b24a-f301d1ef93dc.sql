
-- Reviews table for customer product reviews
CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews"
  ON public.product_reviews FOR SELECT
  USING (is_approved = true);

-- Authenticated users can insert their own reviews
CREATE POLICY "Users can insert own reviews"
  ON public.product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews"
  ON public.product_reviews FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Store settings table
CREATE TABLE public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can read settings"
  ON public.store_settings FOR SELECT
  USING (true);

-- Admins can manage settings
CREATE POLICY "Admins can manage settings"
  ON public.store_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.store_settings (key, value) VALUES
  ('store_name', 'Meenava Sonthangal'),
  ('store_phone', '+91 98765 43210'),
  ('store_email', 'orders@meenavasonthangal.com'),
  ('store_address', 'Kanyakumari, Tamil Nadu'),
  ('delivery_charge', '49'),
  ('free_delivery_threshold', '500'),
  ('whatsapp_number', '+919876543210'),
  ('whatsapp_notifications', 'true'),
  ('email_notifications', 'true'),
  ('order_confirmation_msg', 'Thank you for your order! We will process it shortly.');

-- Order tracking table
CREATE TABLE public.order_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.order_tracking ENABLE ROW LEVEL SECURITY;

-- Users can read tracking for their orders
CREATE POLICY "Users can read own order tracking"
  ON public.order_tracking FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_tracking.order_id AND orders.user_id = auth.uid())
  );

-- Admins can manage all tracking
CREATE POLICY "Admins can manage tracking"
  ON public.order_tracking FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
