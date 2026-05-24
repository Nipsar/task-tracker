package com.example.tasktracker.service;

import com.example.tasktracker.api.mealplan.MealPlanAddItemRequest;
import com.example.tasktracker.api.mealplan.MealPlanSummaryResponse;
import com.example.tasktracker.domain.model.MealPlan;
import com.example.tasktracker.domain.model.MealPlanItem;
import com.example.tasktracker.domain.model.Recipe;
import com.example.tasktracker.repository.MealPlanItemRepository;
import com.example.tasktracker.repository.MealPlanRepository;
import com.example.tasktracker.repository.RecipeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class MealPlanService {

    private static final int DEFAULT_TARGET_CALORIES = 2200;

    private final MealPlanRepository mealPlanRepository;
    private final MealPlanItemRepository mealPlanItemRepository;
    private final RecipeRepository recipeRepository;

    public MealPlanService(
            MealPlanRepository mealPlanRepository,
            MealPlanItemRepository mealPlanItemRepository,
            RecipeRepository recipeRepository
    ) {
        this.mealPlanRepository = mealPlanRepository;
        this.mealPlanItemRepository = mealPlanItemRepository;
        this.recipeRepository = recipeRepository;
    }

    @Transactional
    public MealPlan getOrCreateCurrentWeek() {
        LocalDate weekStart = currentWeekStart();

        return mealPlanRepository.findByWeekStartDate(weekStart)
                .orElseGet(() -> mealPlanRepository.save(
                        MealPlan.create(weekStart, DEFAULT_TARGET_CALORIES)
                ));
    }

    @Transactional(readOnly = true)
    public List<MealPlanItem> getCurrentWeekItems() {
        MealPlan mealPlan = getOrCreateCurrentWeek();
        return mealPlanItemRepository.findAllByMealPlanOrderByDayOfWeekAscMealTypeAscPositionAsc(mealPlan);
    }

    @Transactional
    public MealPlanItem addItemToCurrentWeek(MealPlanAddItemRequest request) {
        MealPlan mealPlan = getOrCreateCurrentWeek();

        Recipe recipe = recipeRepository.findById(request.recipeId())
                .orElseThrow(() -> new IllegalArgumentException("recipe not found: " + request.recipeId()));

        int position = mealPlanItemRepository
                .findAllByMealPlanOrderByDayOfWeekAscMealTypeAscPositionAsc(mealPlan)
                .stream()
                .filter(item -> item.getDayOfWeek() == request.dayOfWeek())
                .filter(item -> item.getMealType() == request.mealType())
                .mapToInt(MealPlanItem::getPosition)
                .max()
                .orElse(0) + 1;

        MealPlanItem item = MealPlanItem.create(
                mealPlan,
                recipe,
                request.dayOfWeek(),
                request.mealType(),
                position
        );

        return mealPlanItemRepository.save(item);
    }

    @Transactional
    public void deleteItem(UUID itemId) {
        mealPlanItemRepository.deleteById(itemId);
    }

    @Transactional(readOnly = true)
    public MealPlanSummaryResponse getCurrentWeekSummary() {
        MealPlan mealPlan = getOrCreateCurrentWeek();

        List<MealPlanItem> items =
                mealPlanItemRepository.findAllByMealPlanOrderByDayOfWeekAscMealTypeAscPositionAsc(mealPlan);

        int calories = items.stream()
                .map(MealPlanItem::getRecipe)
                .mapToInt(Recipe::getCaloriesPerServing)
                .sum();

        BigDecimal protein = items.stream()
                .map(item -> item.getRecipe().getProteinPerServing())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal fat = items.stream()
                .map(item -> item.getRecipe().getFatPerServing())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal carbs = items.stream()
                .map(item -> item.getRecipe().getCarbsPerServing())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new MealPlanSummaryResponse(
                mealPlan.getTargetCalories(),
                calories,
                protein,
                fat,
                carbs
        );
    }

    private LocalDate currentWeekStart() {
        LocalDate today = LocalDate.now();
        return today.with(DayOfWeek.MONDAY);
    }
}