package com.example.tasktracker.domain.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "meal_plans")
public class MealPlan {

    @Id
    @UuidGenerator
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "week_start_date", nullable = false, unique = true)
    private LocalDate weekStartDate;

    @Column(name = "target_calories", nullable = false)
    private Integer targetCalories;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected MealPlan() {
    }

    private MealPlan(LocalDate weekStartDate, Integer targetCalories) {
        this.weekStartDate = weekStartDate;
        this.targetCalories = targetCalories;
    }

    public static MealPlan create(LocalDate weekStartDate, Integer targetCalories) {
        return new MealPlan(weekStartDate, targetCalories);
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public LocalDate getWeekStartDate() {
        return weekStartDate;
    }

    public Integer getTargetCalories() {
        return targetCalories;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}