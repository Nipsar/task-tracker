import { api } from "../api/http.js";
import { normalizeMealPlan, normalizeMealPlanSummary } from "../api/normalizers.js";

const days = [
  ["MONDAY", "Понедельник"],
  ["TUESDAY", "Вторник"],
  ["WEDNESDAY", "Среда"],
  ["THURSDAY", "Четверг"],
  ["FRIDAY", "Пятница"],
  ["SATURDAY", "Суббота"],
  ["SUNDAY", "Воскресенье"]
];

const elements = {
  reloadButton: document.getElementById("reloadWeeklyMenuBtn"),
  status: document.getElementById("weeklyMenuStatus"),
  grid: document.getElementById("weeklyMenuGrid"),
  targetCalories: document.getElementById("targetCalories"),
  currentCalories: document.getElementById("currentCalories"),
  leftCalories: document.getElementById("leftCalories"),
  weeklyMealCount: document.getElementById("weeklyMealCount")
};

let state = {
  mealPlan: null,
  summary: null
};

elements.reloadButton?.addEventListener("click", loadWeeklyMenu);
document.addEventListener("DOMContentLoaded", loadWeeklyMenu);

async function loadWeeklyMenu() {
  setLoading(true);

  try {
    const [mealPlanRaw, summaryRaw] = await Promise.all([
      api.getCurrentMealPlan(),
      api.getCurrentMealPlanSummary()
    ]);

    state.mealPlan = normalizeMealPlan(mealPlanRaw);
    state.summary = normalizeMealPlanSummary(summaryRaw);

    renderStats();
    renderMenu();
    elements.status.textContent = "";
  } catch (error) {
    console.error(error);
    elements.status.textContent = normalizeErrorMessage(error);
  } finally {
    setLoading(false);
  }
}

function renderStats() {
  const target = state.summary?.targetCalories ?? 0;
  const current = state.summary?.currentCalories ?? 0;
  const left = target - current;

  elements.targetCalories.textContent = target;
  elements.currentCalories.textContent = current;
  elements.leftCalories.textContent = left;
  elements.weeklyMealCount.textContent = state.mealPlan?.items?.length ?? 0;
}

function renderMenu() {
  const items = state.mealPlan?.items ?? [];

  if (items.length === 0) {
    elements.grid.innerHTML = `
      <article class="empty-state">
        <h3>Меню пустое</h3>
        <p>Открой рецепты и выбери блюда на неделю.</p>
        <a href="/recipes.html" class="primary-button">К рецептам</a>
      </article>
    `;
    return;
  }

  elements.grid.innerHTML = days
    .map(([dayKey, dayTitle]) => renderDay(dayKey, dayTitle, items))
    .join("");
}

function renderDay(dayKey, dayTitle, items) {
  const dayItems = items.filter(item => item.dayOfWeek === dayKey);
  const calories = dayItems.reduce((sum, item) => sum + item.recipe.caloriesPerServing, 0);

  return `
    <article class="weekly-day-card">
      <header>
        <h3>${dayTitle}</h3>
        <span>${calories} ккал</span>
      </header>

      ${
        dayItems.length === 0
          ? `<p class="muted-text">Блюд нет</p>`
          : dayItems.map(renderMeal).join("")
      }
    </article>
  `;
}

function renderMeal(item) {
  const recipe = item.recipe;

  return `
    <div class="weekly-meal-card">
      ${recipe.imageUrl ? `<img src="${escapeHtml(recipe.imageUrl)}" alt="">` : `<div class="meal-placeholder">🍽️</div>`}
      <div>
        <strong>${escapeHtml(recipe.title)}</strong>
        <p>${recipe.caloriesPerServing} ккал · Б ${formatMacro(recipe.proteinPerServing)} · Ж ${formatMacro(recipe.fatPerServing)} · У ${formatMacro(recipe.carbsPerServing)}</p>
      </div>
    </div>
  `;
}

function setLoading(isLoading) {
  elements.reloadButton.disabled = isLoading;
  elements.reloadButton.textContent = isLoading ? "Загрузка..." : "Обновить меню";
}

function formatMacro(value) {
  return `${Number(value || 0).toFixed(1)} г`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeErrorMessage(error) {
  return error?.message || "Ошибка загрузки меню.";
}