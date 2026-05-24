package com.example.tasktracker.api.mealplan;

import com.example.tasktracker.domain.model.MealType;

import java.time.DayOfWeek;
import java.util.UUID;

public record MealPlanItemResponse(
        UUID id,
        DayOfWeek dayOfWeek,
        MealType mealType,
        Integer position,
        MealPlanRecipeResponse recipe
) {
}