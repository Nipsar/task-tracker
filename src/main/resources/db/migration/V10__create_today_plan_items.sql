CREATE TABLE today_plan_items (
    id UUID PRIMARY KEY,
    task_id UUID NOT NULL,
    planned_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL,
    moved_to_date DATE NULL,
    created_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT fk_today_plan_items_task
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

CREATE INDEX idx_today_plan_items_planned_date
ON today_plan_items(planned_date);

CREATE INDEX idx_today_plan_items_task_id
ON today_plan_items(task_id);

CREATE INDEX uq_today_plan_items_task_date
ON today_plan_items(task_id, planned_date);