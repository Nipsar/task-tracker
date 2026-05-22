import { api } from "../api/http.js";
import { normalizeMealPlan, normalizeMealPlanSummary } from "../api/normalizers.js";
import { initNavigation } from "./common.js";

const days = [
    ["MONDAY", "Понедельник"],
    ["TUESDAY", "Вторник"],
    ["WEDNESDAY", "Среда"],
    ["THURSDAY", "Четверг"],
    ["FRIDAY", "Пятница"],
    ["SATURDAY", "Суббота"],
    ["SUNDAY", "Воскресенье"]
];

const mealTypeTitles = {
    BREAKFAST: "Завтрак",
    LUNCH: "Обед",
    DINNER: "Ужин",
    SNACK: "Перекус"
};

const mealTypeWeights = {
    BREAKFAST: 1,
    LUNCH: 2,
    DINNER: 3,
    SNACK: 4
};

const elements = {
    reloadButton: document.getElementById("reloadWeeklyMenuBtn"),
    status: document.getElementById("weeklyMenuStatus"),
    grid: document.getElementById("weeklyMenuGrid"),
    targetCalories: document.getElementById("targetCalories"),
    currentCalories: document.getElementById("currentCalories"),
    leftCalories: document.getElementById("leftCalories"),
    weeklyMealCount: document.getElementById("weeklyMealCount")
};

const state = {
    mealPlan: null,
    summary: null
};

initNavigation("food-weekly-menu");

elements.reloadButton?.addEventListener("click", loadWeeklyMenu);
elements.grid?.addEventListener("click", onWeeklyGridClick);

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
        elements.status.className = "form-message";
    } catch (error) {
        console.error(error);

        renderEmptyBoard();
        elements.status.textContent = normalizeErrorMessage(error);
        elements.status.className = "form-message error";
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

    elements.grid.innerHTML = days
        .map(([dayKey, dayTitle]) => renderDay(dayKey, dayTitle, items))
        .join("");
}

function renderEmptyBoard() {
    elements.targetCalories.textContent = "—";
    elements.currentCalories.textContent = "—";
    elements.leftCalories.textContent = "—";
    elements.weeklyMealCount.textContent = "0";

    elements.grid.innerHTML = days
        .map(([dayKey, dayTitle]) => renderDay(dayKey, dayTitle, []))
        .join("");
}

function renderDay(dayKey, dayTitle, items) {
    const dayItems = items
        .filter(item => item.dayOfWeek === dayKey)
        .sort((first, second) =>
            mealTypeOrder(first.mealType) - mealTypeOrder(second.mealType) ||
            Number(first.position ?? 0) - Number(second.position ?? 0)
        );

    const calories = dayItems.reduce(
        (sum, item) => sum + Number(item.recipe.caloriesPerServing ?? 0),
        0
    );

    return `
        <article class="weekly-day-card">
            <header class="weekly-day-head">
                <div>
                    <h3>${escapeHtml(dayTitle)}</h3>
                    <p>${dayItems.length} блюд</p>
                </div>
                <span>${calories} ккал</span>
            </header>

            <div class="weekly-day-meals">
                ${
                    dayItems.length === 0
                        ? `<p class="muted-text">Блюд нет</p>`
                        : dayItems.map(renderMeal).join("")
                }
            </div>
        </article>
    `;
}

function renderMeal(item) {
    const recipe = item.recipe;

    return `
        <div class="weekly-meal-card">
            ${
                recipe.imageUrl
                    ? `<img src="${escapeHtml(recipe.imageUrl)}" alt="${escapeHtml(recipe.title)}">`
                    : `<div class="meal-placeholder">🍽️</div>`
            }

            <div>
                <span class="weekly-meal-type">${formatMealType(item.mealType)}</span>
                <strong>${escapeHtml(recipe.title)}</strong>
                <p>
                    ${recipe.caloriesPerServing} ккал ·
                    Б ${formatMacro(recipe.proteinPerServing)} ·
                    Ж ${formatMacro(recipe.fatPerServing)} ·
                    У ${formatMacro(recipe.carbsPerServing)}
                </p>
            </div>

            <button
                class="weekly-meal-delete"
                type="button"
                title="Убрать из меню"
                data-delete-meal-item-id="${escapeHtml(item.id)}"
            >
                ×
            </button>
        </div>
    `;
}

async function onWeeklyGridClick(event) {
    const button = event.target.closest("[data-delete-meal-item-id]");

    if (!button) {
        return;
    }

    const itemId = button.dataset.deleteMealItemId;

    if (!itemId) {
        return;
    }

    button.disabled = true;

    try {
        await api.deleteMealPlanItem(itemId);
        await loadWeeklyMenu();

        elements.status.textContent = "Блюдо убрано из меню.";
        elements.status.className = "form-message success";
    } catch (error) {
        console.error(error);

        elements.status.textContent = normalizeErrorMessage(error);
        elements.status.className = "form-message error";
    }
}

function setLoading(isLoading) {
    if (!elements.reloadButton) {
        return;
    }

    elements.reloadButton.disabled = isLoading;
    elements.reloadButton.textContent = isLoading ? "Загрузка..." : "Обновить меню";

    if (isLoading && elements.status) {
        elements.status.textContent = "Загружаю меню недели...";
        elements.status.className = "form-message info";
    }
}

function mealTypeOrder(mealType) {
    return mealTypeWeights[mealType] ?? 99;
}

function formatMealType(mealType) {
    return mealTypeTitles[mealType] ?? mealType;
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