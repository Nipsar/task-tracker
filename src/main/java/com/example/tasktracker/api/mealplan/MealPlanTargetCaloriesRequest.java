package com.example.tasktracker.api.mealplan;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record MealPlanTargetCaloriesRequest(
        @NotNull
        @Min(1)
        Integer targetCalories
) {
}