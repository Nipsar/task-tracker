CREATE TABLE habits (
    id UUID PRIMARY KEY,
    title VARCHAR(255)  NOT NULL,
    streak_days INT NOT NULL,
    best_streak_days INT NOT NULL,
    total_completions INT NOT NULL,
    last_completed_date DATE NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_habits_created_at ON habits(created_at);
CREATE INDEX idx_habits_last_completed_date ON habits(last_completed_date);