CREATE TABLE goals (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    deadline TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_goals_project_id ON goals(project_id);
CREATE INDEX idx_goals_created_at ON goals(created_at);

ALTER TABLE tasks ADD COLUMN goal_id UUID NULL;

CREATE INDEX idx_tasks_goal_id ON tasks(goal_id);