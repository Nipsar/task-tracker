package com.example.tasktracker.api.recipe;

import com.example.tasktracker.domain.model.MeasurementUnit;

import java.util.UUID;

public record IngredientResponse(
        UUID id,
        String name,
        MeasurementUnit defaultUnit
) {
}