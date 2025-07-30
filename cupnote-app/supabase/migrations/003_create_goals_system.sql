-- Create user goals table
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  period VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  unit VARCHAR(20),
  progress INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_progress CHECK (progress >= 0 AND progress <= 100),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Create indexes
CREATE INDEX idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX idx_user_goals_is_active ON user_goals(is_active);
CREATE INDEX idx_user_goals_period ON user_goals(period);
CREATE INDEX idx_user_goals_type ON user_goals(type);

-- Enable RLS
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own goals"
  ON user_goals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
  ON user_goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON user_goals
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON user_goals
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON user_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_goals_updated_at();

-- Create function to check and complete goals
CREATE OR REPLACE FUNCTION check_goal_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- If goal reaches 100% progress, mark as completed
  IF NEW.progress >= 100 AND OLD.progress < 100 THEN
    -- Log the completion
    INSERT INTO achievement_log (user_id, type, data)
    VALUES (NEW.user_id, 'goal_completed', jsonb_build_object(
      'goal_id', NEW.id,
      'goal_title', NEW.title,
      'goal_type', NEW.type,
      'completed_at', CURRENT_TIMESTAMP
    ));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for goal completion
CREATE TRIGGER check_user_goal_completion
  AFTER UPDATE OF progress ON user_goals
  FOR EACH ROW
  WHEN (NEW.progress >= 100 AND OLD.progress < 100)
  EXECUTE FUNCTION check_goal_completion();

-- Create achievement log table if not exists
CREATE TABLE IF NOT EXISTS achievement_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for achievement log
CREATE INDEX idx_achievement_log_user_id ON achievement_log(user_id);
CREATE INDEX idx_achievement_log_type ON achievement_log(type);

-- Enable RLS for achievement log
ALTER TABLE achievement_log ENABLE ROW LEVEL SECURITY;

-- Create policy for achievement log
CREATE POLICY "Users can view their own achievement logs"
  ON achievement_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Function to clean up expired goals
CREATE OR REPLACE FUNCTION cleanup_expired_goals()
RETURNS void AS $$
BEGIN
  UPDATE user_goals
  SET is_active = false
  WHERE is_active = true
    AND end_date < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired goals (requires pg_cron extension)
-- This would be set up separately in Supabase dashboard or through API