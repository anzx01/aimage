-- Create credit_transactions table
-- Records all credit balance changes for audit trail

CREATE TABLE credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'refund', 'purchase', 'gift')),
  description text,
  reference_id uuid,
  reference_type text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_reference ON credit_transactions(reference_id, reference_type);

-- Enable RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);
