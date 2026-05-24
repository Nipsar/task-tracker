package com.example.tasktracker.api.mealplan;

import com.example.tasktracker.domain.model.MealPlan;
import com.example.tasktracker.domain.model.MealPlanItem;
import com.example.tasktracker.domain.model.Recipe;
import com.example.tasktracker.service.MealPlanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class MealPlanController {

    private final MealPlanService mealPlanService;

    public MealPlanController(MealPlanService mealPlanService) {
        this.mealPlanService = mealPlanService;
    }

    @GetMapping("/api/meal-plans/current-week")
    public MealPlanResponse getCurrentWeek() {
        MealPlan mealPlan = mealPlanService.getOrCreateCurrentWeek();
        List<MealPlanItemResponse> items = mealPlanService.getCurrentWeekItems()
                .stream()
                .map(this::toItemResponse)
                .toList();

        return new MealPlanResponse(
                mealPlan.getId(),
                mealPlan.getWeekStartDate(),
                mealPlan.getTargetCalories(),
                items
        );
    }

    @PostMapping("/api/meal-plans/current-week/items")
    public MealPlanItemResponse addItem(@Valid @RequestBody MealPlanAddItemRequest request) {
        MealPlanItem item = mealPlanService.addItemToCurrentWeek(request);
        return toItemResponse(item);
    }

    @DeleteMapping("/api/meal-plans/current-week/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@PathVariable UUID itemId) {
        mealPlanService.deleteItem(itemId);
    }

    @GetMapping("/api/meal-plans/current-week/summary")
    public MealPlanSummaryResponse getSummary() {
        return mealPlanService.getCurrentWeekSummary();
    }

    private MealPlanItemResponse toItemResponse(MealPlanItem item) {
        Recipe recipe = item.getRecipe();

        return new MealPlanItemResponse(
                item.getId(),
                item.getDayOfWeek(),
                item.getMealType(),
                item.getPosition(),
                new MealPlanRecipeResponse(
                        recipe.getId(),
                        recipe.getTitle(),
                        recipe.getDescription(),
                        recipe.getImageUrl(),
                        recipe.getServings(),
                        recipe.getCaloriesPerServing(),
                        recipe.getProteinPerServing(),
                        recipe.getFatPerServing(),
                        recipe.getCarbsPerServing()
                )
        );
    }
}