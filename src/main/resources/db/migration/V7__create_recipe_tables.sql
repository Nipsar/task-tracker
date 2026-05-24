CREATE TABLE ingredients (
    id UUID PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    default_unit VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT uq_ingredients_name UNIQUE (name)
);

CREATE TABLE recipes (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(1000),
    servings INTEGER NOT NULL,
    calories_per_serving INTEGER NOT NULL,
    protein_per_serving NUMERIC(8, 2) NOT NULL,
    fat_per_serving NUMERIC(8, 2) NOT NULL,
    carbs_per_serving NUMERIC(8, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT chk_recipes_servings_positive CHECK (servings > 0),
    CONSTRAINT chk_recipes_calories_non_negative CHECK (calories_per_serving >= 0),
    CONSTRAINT chk_recipes_protein_non_negative CHECK (protein_per_serving >= 0),
    CONSTRAINT chk_recipes_fat_non_negative CHECK (fat_per_serving >= 0),
    CONSTRAINT chk_recipes_carbs_non_negative CHECK (carbs_per_serving >= 0)
);

CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY,
    recipe_id UUID NOT NULL,
    ingredient_id UUID NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(32) NOT NULL,

    CONSTRAINT fk_recipe_ingredients_recipe
        FOREIGN KEY (recipe_id)
        REFERENCES recipes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_recipe_ingredients_ingredient
        FOREIGN KEY (ingredient_id)
        REFERENCES ingredients(id),

    CONSTRAINT chk_recipe_ingredients_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_recipes_title ON recipes(title);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);