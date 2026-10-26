-- Logs Razorpay checkout attempts that fail before a `payments` row exists
-- (order creation failure, signature verification failure) — surfaced on the
-- admin Payment Gateway page as "Failed Attempts (Pre-Order)".
CREATE TABLE IF NOT EXISTS public.payment_attempt_logs (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  plan_key       TEXT,
  stage          TEXT NOT NULL,   -- 'create_order' | 'verify_payment'
  status         TEXT NOT NULL DEFAULT 'failed',
  error_code     TEXT,
  error_message  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_attempt_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_attempt_logs: admin read" ON public.payment_attempt_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );
