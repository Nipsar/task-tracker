package com.example.tasktracker.domain.model;

import com.example.tasktracker.domain.exception.ValidationException;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "recipes")
public class Recipe {

    @Id
    @UuidGenerator
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(nullable = false)
    private Integer servings;

    @Column(name = "calories_per_serving", nullable = false)
    private Integer caloriesPerServing;

    @Column(name = "protein_per_serving", nullable = false, precision = 8, scale = 2)
    private BigDecimal proteinPerServing;

    @Column(name = "fat_per_serving", nullable = false, precision = 8, scale = 2)
    private BigDecimal fatPerServing;

    @Column(name = "carbs_per_serving", nullable = false, precision = 8, scale = 2)
    private BigDecimal carbsPerServing;

    @OneToMany(
            mappedBy = "recipe",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<RecipeIngredient> ingredients = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Recipe() {
        // JPA
    }

    private Recipe(
            UUID id,
            String title,
            String description,
            String imageUrl,
            Integer servings,
            Integer caloriesPerServing,
            BigDecimal proteinPerServing,
            BigDecimal fatPerServing,
            BigDecimal carbsPerServing,
            Instant createdAt,
            Instant updatedAt
    ) {
        this.id = id;
        this.title = normalizeAndValidateTitle(title);
        this.description = normalizeOptionalText(description);
        this.imageUrl = normalizeOptionalText(imageUrl);
        this.servings = validatePositive(servings, "recipe.servings", "servings must be > 0");
        this.caloriesPerServing = validateNonNegative(caloriesPerServing, "recipe.calories", "calories must be >= 0");
        this.proteinPerServing = validateNonNegative(proteinPerServing, "recipe.protein", "protein must be >= 0");
        this.fatPerServing = validateNonNegative(fatPerServing, "recipe.fat", "fat must be >= 0");
        this.carbsPerServing = validateNonNegative(carbsPerServing, "recipe.carbs", "carbs must be >= 0");
        this.createdAt = Objects.requireNonNull(createdAt, "createdAt");
        this.updatedAt = Objects.requireNonNull(updatedAt, "updatedAt");
    }

    public static Recipe create(
            String title,
            String description,
            String imageUrl,
            Integer servings,
            Integer caloriesPerServing,
            BigDecimal proteinPerServing,
            BigDecimal fatPerServing,
            BigDecimal carbsPerServing,
            Clock clock
    ) {
        Objects.requireNonNull(clock, "clock");
        Instant now = clock.instant();

        return new Recipe(
                null,
                title,
                description,
                imageUrl,
                servings,
                caloriesPerServing,
                proteinPerServing,
                fatPerServing,
                carbsPerServing,
                now,
                now
        );
    }

    public void addIngredient(
            Ingredient ingredient,
            BigDecimal amount,
            MeasurementUnit unit
    ) {
        RecipeIngredient recipeIngredient = RecipeIngredient.create(
                this,
                ingredient,
                amount,
                unit
        );

        ingredients.add(recipeIngredient);
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Integer getServings() {
        return servings;
    }

    public Integer getCaloriesPerServing() {
        return caloriesPerServing;
    }

    public BigDecimal getProteinPerServing() {
        return proteinPerServing;
    }

    public BigDecimal getFatPerServing() {
        return fatPerServing;
    }

    public BigDecimal getCarbsPerServing() {
        return carbsPerServing;
    }

    public List<RecipeIngredient> getIngredients() {
        return Collections.unmodifiableList(ingredients);
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    private static String normalizeAndValidateTitle(String title) {
        if (title == null) {
            throw new ValidationException("recipe.title.null", "recipe title must not be null");
        }

        String normalized = title.trim();

        if (normalized.isEmpty()) {
            throw new ValidationException("recipe.title.blank", "recipe title must not be blank");
        }

        return normalized;
    }

    private static String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();

        return normalized.isEmpty() ? null : normalized;
    }

    private static Integer validatePositive(Integer value, String codePrefix, String message) {
        if (value == null) {
            throw new ValidationException(codePrefix + ".null", message);
        }

        if (value <= 0) {
            throw new ValidationException(codePrefix + ".not_positive", message);
        }

        return value;
    }

    private static Integer validateNonNegative(Integer value, String codePrefix, String message) {
        if (value == null) {
            throw new ValidationException(codePrefix + ".null", message);
        }

        if (value < 0) {
            throw new ValidationException(codePrefix + ".negative", message);
        }

        return value;
    }

    private static BigDecimal validateNonNegative(BigDecimal value, String codePrefix, String message) {
        if (value == null) {
            throw new ValidationException(codePrefix + ".null", message);
        }

        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new ValidationException(codePrefix + ".negative", message);
        }

        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Recipe other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}