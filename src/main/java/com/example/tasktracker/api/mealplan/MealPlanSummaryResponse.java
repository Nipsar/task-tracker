package com.example.tasktracker.api.mealplan;

import java.math.BigDecimal;

public record MealPlanSummaryResponse(
        Integer targetCalories,
        Integer currentCalories,
        BigDecimal protein,
        BigDecimal fat,
        BigDecimal carbs
) {
}