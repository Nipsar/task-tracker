ALTER TABLE tasks
    ADD COLUMN importance VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    ADD COLUMN difficulty VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    ADD COLUMN energy VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    ADD COLUMN estimated_minutes INTEGER NOT NULL DEFAULT 60,
    ADD COLUMN auto_plan_enabled BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE tasks
    ADD CONSTRAINT chk_chk_tasks_estimated_minutes_positive
    CHECK (estimated_minutes > 0);