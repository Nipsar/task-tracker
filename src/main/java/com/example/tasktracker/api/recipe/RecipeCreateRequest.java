package com.example.tasktracker.api.recipe;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.List;

public record RecipeCreateRequest(
        @NotBlank String title,

        String description,

        String imageUrl,

        @NotNull
        @Positive
        Integer servings,

        @NotNull
        @PositiveOrZero
        Integer caloriesPerServing,

        @NotNull
        @DecimalMin("0.0")
        BigDecimal proteinPerServing,

        @NotNull
        @DecimalMin("0.0")
        BigDecimal fatPerServing,

        @NotNull
        @DecimalMin("0.0")
        BigDecimal carbsPerServing,

        @NotEmpty
        List<@Valid RecipeIngredientRequest> ingredients
) {
}