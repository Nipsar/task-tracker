package com.example.tasktracker.domain.model;

import com.example.tasktracker.domain.exception.ValidationException;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "recipe_ingredients")
public class RecipeIngredient {

    @Id
    @UuidGenerator
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private MeasurementUnit unit;

    protected RecipeIngredient() {
        // JPA
    }

    private RecipeIngredient(
            UUID id,
            Recipe recipe,
            Ingredient ingredient,
            BigDecimal amount,
            MeasurementUnit unit
    ) {
        this.id = id;
        this.recipe = Objects.requireNonNull(recipe, "recipe");
        this.ingredient = Objects.requireNonNull(ingredient, "ingredient");
        this.amount = validateAmount(amount);
        this.unit = requireUnit(unit);
    }

    public static RecipeIngredient create(
            Recipe recipe,
            Ingredient ingredient,
            BigDecimal amount,
            MeasurementUnit unit
    ) {
        return new RecipeIngredient(
                null,
                recipe,
                ingredient,
                amount,
                unit
        );
    }

    public UUID getId() {
        return id;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public Ingredient getIngredient() {
        return ingredient;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public MeasurementUnit getUnit() {
        return unit;
    }

    private static BigDecimal validateAmount(BigDecimal amount) {
        if (amount == null) {
            throw new ValidationException("recipe_ingredient.amount.null", "ingredient amount must not be null");
        }

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("recipe_ingredient.amount.not_positive", "ingredient amount must be > 0");
        }

        return amount;
    }

    private static MeasurementUnit requireUnit(MeasurementUnit unit) {
        if (unit == null) {
            throw new ValidationException("recipe_ingredient.unit.null", "ingredient unit must not be null");
        }

        return unit;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RecipeIngredient other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}