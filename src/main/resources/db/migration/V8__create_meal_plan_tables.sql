CREATE TABLE meal_plans (
    id UUID PRIMARY KEY,
    week_start_date DATE NOT NULL,
    target_calories INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT uq_meal_plans_week_start_date UNIQUE (week_start_date),
    CONSTRAINT chk_meal_plans_target_calories_positive CHECK (target_calories > 0)
);

CREATE TABLE meal_plan_items (
    id UUID PRIMARY KEY,
    meal_plan_id UUID NOT NULL,
    recipe_id UUID NOT NULL,
    day_of_week VARCHAR(16) NOT NULL,
    meal_type VARCHAR(16) NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT fk_meal_plan_items_meal_plan
        FOREIGN KEY (meal_plan_id)
        REFERENCES meal_plans(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_meal_plan_items_recipe
        FOREIGN KEY (recipe_id)
        REFERENCES recipes(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_meal_plan_items_position_positive CHECK (position > 0)
);

CREATE INDEX idx_meal_plan_items_meal_plan_id
    ON meal_plan_items(meal_plan_id);

CREATE INDEX idx_meal_plan_items_recipe_id
    ON meal_plan_items(recipe_id);

CREATE INDEX idx_meal_plan_items_day_type
    ON meal_plan_items(day_of_week, meal_type);