package com.example.tasktracker.api.recipe;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RecipeResponse(
        UUID id,
        String title,
        String description,
        String imageUrl,
        Integer servings,
        Integer caloriesPerServing,
        BigDecimal proteinPerServing,
        BigDecimal fatPerServing,
        BigDecimal carbsPerServing,
        List<RecipeIngredientResponse> ingredients,
        Instant createdAt,
        Instant updatedAt
) {
}
