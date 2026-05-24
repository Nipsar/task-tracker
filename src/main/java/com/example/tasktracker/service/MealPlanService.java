package com.example.tasktracker.service;

import com.example.tasktracker.api.mealplan.MealPlanAddItemRequest;
import com.example.tasktracker.api.mealplan.MealPlanSummaryResponse;
import com.example.tasktracker.domain.exception.NotFoundException;
import com.example.tasktracker.domain.exception.ValidationException;
import com.example.tasktracker.domain.model.MealPlan;
import com.example.tasktracker.domain.model.MealPlanItem;
import com.example.tasktracker.domain.model.MealType;
import com.example.tasktracker.domain.model.Recipe;
import com.example.tasktracker.repository.MealPlanItemRepository;
import com.example.tasktracker.repository.MealPlanRepository;
import com.example.tasktracker.repository.RecipeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
public class MealPlanService {

    private static final int DEFAULT_TARGET_CALORIES = 2200;

    private static final List<DayOfWeek> WEEK_DAYS = List.of(
            DayOfWeek.MONDAY,
            DayOfWeek.TUESDAY,
            DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY,
            DayOfWeek.FRIDAY,
            DayOfWeek.SATURDAY,
            DayOfWeek.SUNDAY
    );

    private static final List<MealType> MEAL_TYPE_ORDER = List.of(
            MealType.BREAKFAST,
            MealType.LUNCH,
            MealType.DINNER,
            MealType.SNACK
    );

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

    @Transactional
    public List<MealPlanItem> getCurrentWeekItems() {
        MealPlan mealPlan = getOrCreateCurrentWeek();
        return mealPlanItemRepository.findAllByMealPlanOrderByDayOfWeekAscMealTypeAscPositionAsc(mealPlan);
    }

    @Transactional
    public MealPlan updateCurrentWeekTargetCalories(Integer targetCalories) {
        MealPlan mealPlan = getOrCreateCurrentWeek();
        mealPlan.updateTargetCalories(targetCalories);
        return mealPlan;
    }

    @Transactional
    public MealPlanItem addItemToCurrentWeek(MealPlanAddItemRequest request) {
        MealPlan mealPlan = getOrCreateCurrentWeek();
        Recipe recipe = getRecipeOrThrow(request.recipeId());

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
    public List<MealPlanItem> autoDistributeCurrentWeek(List<UUID> recipeIds) {
        MealPlan mealPlan = getOrCreateCurrentWeek();
        List<Recipe> recipes = resolveRecipesForDistribution(mealPlan, recipeIds);

        if (recipes.isEmpty()) {
            throw new ValidationException(
                    "meal_plan.auto_distribution.empty",
                    "no recipes selected for weekly menu"
            );
        }

        mealPlanItemRepository.deleteAllByMealPlan(mealPlan);
        mealPlanItemRepository.flush();

        List<MealPlanItem> items = distributeRecipes(mealPlan, recipes);
        return mealPlanItemRepository.saveAll(items);
    }

    @Transactional
    public void deleteItem(UUID itemId) {
        mealPlanItemRepository.deleteById(itemId);
    }

    @Transactional
    public MealPlanSummaryResponse getCurrentWeekSummary() {
        MealPlan mealPlan = getOrCreateCurrentWeek();

        List<MealPlanItem> items =
                mealPlanItemRepository.findAllByMealPlanOrderByDayOfWeekAscMealTypeAscPositionAsc(mealPlan);

        int calories = items.stream()
                .map(MealPlanItem::getRecipe)
                .mapToInt(this::safeCalories)
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

    private List<Recipe> resolveRecipesForDistribution(MealPlan mealPlan, List<UUID> recipeIds) {
        List<UUID> selectedIds = recipeIds == null
                ? List.of()
                : recipeIds.stream()
                .filter(Objects::nonNull)
                .toList();

        if (!selectedIds.isEmpty()) {
            return selectedIds.stream()
                    .map(this::getRecipeOrThrow)
                    .toList();
        }

        return mealPlanItemRepository
                .findAllByMealPlanOrderByDayOfWeekAscMealTypeAscPositionAsc(mealPlan)
                .stream()
                .map(MealPlanItem::getRecipe)
                .toList();
    }

    private Recipe getRecipeOrThrow(UUID recipeId) {
        return recipeRepository.findById(recipeId)
                .orElseThrow(() -> new NotFoundException(
                        "recipe.not_found",
                        "recipe not found: " + recipeId
                ));
    }

    private List<MealPlanItem> distributeRecipes(MealPlan mealPlan, List<Recipe> recipes) {
        List<DayBucket> buckets = WEEK_DAYS.stream()
                .map(DayBucket::new)
                .toList();

        List<Recipe> sortedRecipes = new ArrayList<>(recipes);
        sortedRecipes.sort(
                Comparator.comparingInt(this::safeCalories)
                        .reversed()
                        .thenComparing(Recipe::getTitle, String.CASE_INSENSITIVE_ORDER)
        );

        for (Recipe recipe : sortedRecipes) {
            DayBucket bucket = buckets.stream()
                    .min(
                            Comparator
                                    .comparingInt((DayBucket candidate) ->
                                            distributionScore(candidate, recipe, mealPlan.getTargetCalories())
                                    )
                                    .thenComparingInt(DayBucket::getCalories)
                                    .thenComparing(DayBucket::getDayOfWeek)
                    )
                    .orElseThrow();

            bucket.add(recipe);
        }

        List<MealPlanItem> result = new ArrayList<>();

        for (DayBucket bucket : buckets) {
            Map<MealType, Integer> positionsByMealType = new EnumMap<>(MealType.class);

            for (int index = 0; index < bucket.getRecipes().size(); index++) {
                Recipe recipe = bucket.getRecipes().get(index);
                MealType mealType = mealTypeForIndex(index);
                int position = positionsByMealType.merge(mealType, 1, Integer::sum);

                result.add(MealPlanItem.create(
                        mealPlan,
                        recipe,
                        bucket.getDayOfWeek(),
                        mealType,
                        position
                ));
            }
        }

        return result;
    }

    private int distributionScore(DayBucket bucket, Recipe recipe, int targetCalories) {
        int currentCalories = bucket.getCalories();
        int afterCalories = currentCalories + safeCalories(recipe);
        int overTarget = Math.max(0, afterCalories - targetCalories);
        int underTarget = Math.max(0, targetCalories - afterCalories);

        int overPenalty = overTarget > 0 ? 1_000_000 + overTarget * 10 : 0;
        int balancePenalty = currentCalories * 20;

        return overPenalty + balancePenalty + underTarget;
    }

    private MealType mealTypeForIndex(int index) {
        return MEAL_TYPE_ORDER.get(index % MEAL_TYPE_ORDER.size());
    }

    private int safeCalories(Recipe recipe) {
        return Math.max(0, recipe.getCaloriesPerServing() == null ? 0 : recipe.getCaloriesPerServing());
    }

    private LocalDate currentWeekStart() {
        LocalDate today = LocalDate.now();
        return today.with(DayOfWeek.MONDAY);
    }

    private static final class DayBucket {
        private final DayOfWeek dayOfWeek;
        private final List<Recipe> recipes = new ArrayList<>();
        private int calories;

        private DayBucket(DayOfWeek dayOfWeek) {
            this.dayOfWeek = dayOfWeek;
        }

        private void add(Recipe recipe) {
            recipes.add(recipe);
            calories += Math.max(0, recipe.getCaloriesPerServing() == null ? 0 : recipe.getCaloriesPerServing());
        }

        private DayOfWeek getDayOfWeek() {
            return dayOfWeek;
        }

        private List<Recipe> getRecipes() {
            return recipes;
        }

        private int getCalories() {
            return calories;
        }
    }
}