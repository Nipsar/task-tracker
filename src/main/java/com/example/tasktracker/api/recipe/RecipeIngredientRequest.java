package com.example.tasktracker.api.recipe;

import com.example.tasktracker.domain.model.MeasurementUnit;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record RecipeIngredientRequest(
        @NotBlank String ingredientName,

        @NotNull
        @DecimalMin(value = "0.0", inclusive = false)
        BigDecimal amount,

        @NotNull MeasurementUnit unit
) {
}