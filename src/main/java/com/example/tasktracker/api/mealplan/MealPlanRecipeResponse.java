package com.example.tasktracker.api.mealplan;

import java.math.BigDecimal;
import java.util.UUID;

public record MealPlanRecipeResponse(
        UUID id,
        String title,
        String description,
        String imageUrl,
        Integer servings,
        Integer caloriesPerServing,
        BigDecimal proteinPerServing,
        BigDecimal fatPerServing,
        BigDecimal carbsPerServing
) {
}