package com.example.tasktracker.api.mealplan;

import com.example.tasktracker.domain.model.MealType;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.util.UUID;

public record MealPlanAddItemRequest(
        @NotNull UUID recipeId,
        @NotNull DayOfWeek dayOfWeek,
        @NotNull MealType mealType
) {
}