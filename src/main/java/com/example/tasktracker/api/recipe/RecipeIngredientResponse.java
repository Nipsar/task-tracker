package com.example.tasktracker.api.recipe;

import com.example.tasktracker.domain.model.MeasurementUnit;

import java.math.BigDecimal;
import java.util.UUID;

public record RecipeIngredientResponse(
        UUID id,
        IngredientResponse ingredient,
        BigDecimal amount,
        MeasurementUnit unit
) {
}