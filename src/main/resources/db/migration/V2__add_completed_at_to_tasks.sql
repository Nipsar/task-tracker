ALTER TABLE tasks ADD COLUMN completed_at TIMESTAMPTZ NULL;

CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);