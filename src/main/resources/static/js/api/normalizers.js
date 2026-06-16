import { parseDate } from "../utils/date.js";

export function normalizeTasks(tasks) {
    return (tasks ?? []).map(task => ({
        id: task.id,
        projectId: task.projectId ?? null,
        goalId: task.goalId ?? null,
        title: String(task.title ?? "Без названия").trim(),
        status: String(task.status ?? "NEW"),
        deadline: parseDate(task.deadline),
        createdAt: parseDate(task.createdAt),
        completedAt: parseDate(task.completedAt),
        importance: String(task.importance ?? "MEDIUM"),
        difficulty: String(task.difficulty ?? "MEDIUM"),
        energy: String(task.energy ?? "MEDIUM"),
        estimatedMinutes: Number(task.estimatedMinutes ?? 60),
        autoPlanEnabled: task.autoPlanEnabled !== false
    }));
}

export function normalizeProjects(projects) {
    return (projects ?? []).map(project => ({
        id: project.id,
        title: String(project.title ?? "Без названия").trim(),
        status: String(project.status ?? "NEW"),
        deadline: parseDate(project.deadline),
        createdAt: parseDate(project.createdAt)
    }));
}

export function normalizeGoals(goals) {
    return (goals ?? []).map(normalizeGoal);
}

export function normalizeGoal(goal) {
    return {
        id: goal.id,
        projectId: goal.projectId ?? null,
        title: String(goal.title ?? "Без названия").trim(),
        deadline: parseDate(goal.deadline),
        createdAt: parseDate(goal.createdAt),
        totalTasks: Number(goal.totalTasks ?? 0),
        doneTasks: Number(goal.doneTasks ?? 0),
        progressPercent: Number(goal.progressPercent ?? 0)
    };
}

export function normalizeHabits(habits) {
    return (habits ?? []).map(habit => ({
        id: habit.id,
        title: String(habit.title ?? "Без названия").trim(),
        streakDays: Number(habit.streakDays ?? 0),
        bestStreakDays: Number(habit.bestStreakDays ?? 0),
        totalCompletions: Number(habit.totalCompletions ?? 0),
        lastCompletedDate: habit.lastCompletedDate ?? null,
        createdAt: parseDate(habit.createdAt)
    }));
}

export function normalizeRecipes(recipes) {
    return (recipes ?? []).map(recipe => ({
        id: recipe.id,
        title: String(recipe.title ?? "Без названия").trim(),
        description: recipe.description ?? "",
        imageUrl: recipe.imageUrl ?? "",
        servings: Number(recipe.servings ?? 1),
        caloriesPerServing: Number(recipe.caloriesPerServing ?? 0),
        proteinPerServing: Number(recipe.proteinPerServing ?? 0),
        fatPerServing: Number(recipe.fatPerServing ?? 0),
        carbsPerServing: Number(recipe.carbsPerServing ?? 0),
        ingredients: normalizeRecipeIngredients(recipe.ingredients ?? []),
        createdAt: parseDate(recipe.createdAt),
        updatedAt: parseDate(recipe.updatedAt)
    }));
}

function normalizeRecipeIngredients(ingredients) {
    return (ingredients ?? []).map(item => ({
        id: item.id,
        ingredient: {
            id: item.ingredient?.id ?? null,
            name: String(item.ingredient?.name ?? "Ингредиент").trim(),
            defaultUnit: item.ingredient?.defaultUnit ?? item.unit ?? "GRAM"
        },
        amount: Number(item.amount ?? 0),
        unit: item.unit ?? "GRAM"
    }));
}

export function normalizeMealPlan(mealPlan) {
  return {
    id: mealPlan?.id ?? null,
    weekStartDate: mealPlan?.weekStartDate ?? null,
    targetCalories: Number(mealPlan?.targetCalories ?? 0),
    items: normalizeMealPlanItems(mealPlan?.items ?? [])
  };
}

export function normalizeMealPlanItems(items) {
  return (items ?? []).map(item => ({
    id: item.id,
    dayOfWeek: item.dayOfWeek,
    mealType: item.mealType,
    position: Number(item.position ?? 0),
    recipe: {
      id: item.recipe?.id ?? null,
      title: String(item.recipe?.title ?? "Без названия").trim(),
      description: item.recipe?.description ?? "",
      imageUrl: item.recipe?.imageUrl ?? "",
      servings: Number(item.recipe?.servings ?? 1),
      caloriesPerServing: Number(item.recipe?.caloriesPerServing ?? 0),
      proteinPerServing: Number(item.recipe?.proteinPerServing ?? 0),
      fatPerServing: Number(item.recipe?.fatPerServing ?? 0),
      carbsPerServing: Number(item.recipe?.carbsPerServing ?? 0)
    }
  }));
}

export function normalizeMealPlanSummary(summary) {
  return {
    targetCalories: Number(summary?.targetCalories ?? 0),
    currentCalories: Number(summary?.currentCalories ?? 0),
    protein: Number(summary?.protein ?? 0),
    fat: Number(summary?.fat ?? 0),
    carbs: Number(summary?.carbs ?? 0)
  };
}