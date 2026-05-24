package com.example.tasktracker.api.mealplan;

import java.util.List;
import java.util.UUID;

public record MealPlanAutoDistributeRequest(
        List<UUID> recipeIds
) {
}