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
        List<MealPlanItem> items = mealPlanService.getCurrentWeekItems();

        return toMealPlanResponse(mealPlan, items);
    }

    @PatchMapping("/api/meal-plans/current-week/target-calories")
    public MealPlanResponse updateTargetCalories(
            @Valid @RequestBody MealPlanTargetCaloriesRequest request
    ) {
        MealPlan mealPlan = mealPlanService.updateCurrentWeekTargetCalories(request.targetCalories());
        List<MealPlanItem> items = mealPlanService.getCurrentWeekItems();

        return toMealPlanResponse(mealPlan, items);
    }

    @PostMapping("/api/meal-plans/current-week/auto-distribute")
    public MealPlanResponse autoDistribute(
            @Valid @RequestBody(required = false) MealPlanAutoDistributeRequest request
    ) {
        List<UUID> recipeIds = request == null ? List.of() : request.recipeIds();

        List<MealPlanItem> items = mealPlanService.autoDistributeCurrentWeek(recipeIds);
        MealPlan mealPlan = mealPlanService.getOrCreateCurrentWeek();

        return toMealPlanResponse(mealPlan, items);
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

    private MealPlanResponse toMealPlanResponse(MealPlan mealPlan, List<MealPlanItem> items) {
        return new MealPlanResponse(
                mealPlan.getId(),
                mealPlan.getWeekStartDate(),
                mealPlan.getTargetCalories(),
                items.stream()
                        .map(this::toItemResponse)
                        .toList()
        );
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