package com.example.tasktracker.api.mealplan;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record MealPlanResponse(
        UUID id,
        LocalDate weekStartDate,
        Integer targetCalories,
        List<MealPlanItemResponse> items
) {
}