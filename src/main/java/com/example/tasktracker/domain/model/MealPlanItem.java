package com.example.tasktracker.domain.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.DayOfWeek;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "meal_plan_items")
public class MealPlanItem {

    @Id
    @UuidGenerator
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "meal_plan_id", nullable = false)
    private MealPlan mealPlan;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 16)
    private DayOfWeek dayOfWeek;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false, length = 16)
    private MealType mealType;

    @Column(name = "position", nullable = false)
    private Integer position;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected MealPlanItem() {
    }

    private MealPlanItem(
            MealPlan mealPlan,
            Recipe recipe,
            DayOfWeek dayOfWeek,
            MealType mealType,
            Integer position
    ) {
        this.mealPlan = mealPlan;
        this.recipe = recipe;
        this.dayOfWeek = dayOfWeek;
        this.mealType = mealType;
        this.position = position;
    }

    public static MealPlanItem create(
            MealPlan mealPlan,
            Recipe recipe,
            DayOfWeek dayOfWeek,
            MealType mealType,
            Integer position
    ) {
        return new MealPlanItem(mealPlan, recipe, dayOfWeek, mealType, position);
    }

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public MealPlan getMealPlan() {
        return mealPlan;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    public MealType getMealType() {
        return mealType;
    }

    public Integer getPosition() {
        return position;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}