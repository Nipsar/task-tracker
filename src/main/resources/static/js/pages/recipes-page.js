import { api } from "../api/http.js";

import {
    normalizeMealPlan,
    normalizeMealPlanSummary,
    normalizeRecipes
} from "../api/normalizers.js";

import { initNavigation } from "./common.js";

import {
    clearMessage,
    escapeHtml,
    renderEmptyState,
    showMessage
} from "../utils/dom.js";

import { normalizeErrorMessage } from "../utils/errors.js";

const dayTitles = {
    MONDAY: "Пн",
    TUESDAY: "Вт",
    WEDNESDAY: "Ср",
    THURSDAY: "Чт",
    FRIDAY: "Пт",
    SATURDAY: "Сб",
    SUNDAY: "Вс"
};

const mealTypeTitles = {
    BREAKFAST: "Завтрак",
    LUNCH: "Обед",
    DINNER: "Ужин",
    SNACK: "Перекус"
};

const elements = {
    loadButton: document.getElementById("loadRecipesBtn"),
    statusMessage: document.getElementById("recipesStatusMessage"),
    recipeGrid: document.getElementById("recipeGrid"),

    recipeCount: document.getElementById("recipeCount"),
    avgCalories: document.getElementById("avgCalories"),
    ingredientCount: document.getElementById("ingredientCount"),
    selectedCount: document.getElementById("selectedCount"),

    form: document.getElementById("createRecipeForm"),
    titleInput: document.getElementById("recipeTitleInput"),
    imageInput: document.getElementById("recipeImageInput"),
    descriptionInput: document.getElementById("recipeDescriptionInput"),
    servingsInput: document.getElementById("recipeServingsInput"),
    caloriesInput: document.getElementById("recipeCaloriesInput"),
    proteinInput: document.getElementById("recipeProteinInput"),
    fatInput: document.getElementById("recipeFatInput"),
    carbsInput: document.getElementById("recipeCarbsInput"),
    ingredientsInput: document.getElementById("recipeIngredientsInput"),
    submitButton: document.getElementById("createRecipeBtn"),
    clearButton: document.getElementById("clearRecipeFormBtn"),
    formMessage: document.getElementById("createRecipeMessage"),

    modal: document.getElementById("recipeModal"),
    modalImage: document.getElementById("recipeModalImage"),
    modalTitle: document.getElementById("recipeModalTitle"),
    modalDescription: document.getElementById("recipeModalDescription"),
    modalCalories: document.getElementById("recipeModalCalories"),
    modalProtein: document.getElementById("recipeModalProtein"),
    modalFat: document.getElementById("recipeModalFat"),
    modalCarbs: document.getElementById("recipeModalCarbs"),
    modalIngredients: document.getElementById("recipeModalIngredients"),

    mealPlanDaySelect: document.getElementById("mealPlanDaySelect"),
    mealPlanTypeSelect: document.getElementById("mealPlanTypeSelect"),
    mealPlanPickerNote: document.getElementById("mealPlanPickerNote"),
    addRecipeToWeekButton: document.getElementById("addRecipeToWeekBtn"),

    deleteRecipeButton: document.getElementById("deleteRecipeBtn")
};

const state = {
    recipes: [],
    mealPlan: null,
    mealPlanSummary: null,
    activeRecipe: null
};

initNavigation("recipes");
bindEvents();

document.addEventListener("DOMContentLoaded", loadRecipes);

function bindEvents() {
    elements.loadButton?.addEventListener("click", loadRecipes);
    elements.form?.addEventListener("submit", onCreateRecipeSubmit);
    elements.clearButton?.addEventListener("click", resetForm);

    document.querySelectorAll("[data-close-modal]").forEach(element => {
        element.addEventListener("click", closeModal);
    });

    elements.addRecipeToWeekButton?.addEventListener("click", addActiveRecipeToWeek);
    elements.deleteRecipeButton?.addEventListener("click", deleteActiveRecipe);
    elements.mealPlanDaySelect?.addEventListener("change", updateMealPlanPickerNote);
    elements.mealPlanTypeSelect?.addEventListener("change", updateMealPlanPickerNote);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeModal();
        }
    });
}

async function loadRecipes() {
    setPageLoading(true);

    try {
        state.recipes = normalizeRecipes(await api.getRecipes());

        try {
            state.mealPlan = normalizeMealPlan(await api.getCurrentMealPlan());
            state.mealPlanSummary = normalizeMealPlanSummary(await api.getCurrentMealPlanSummary());
        } catch (mealPlanError) {
            console.error("Meal plan load failed", mealPlanError);
            state.mealPlan = {
                id: null,
                weekStartDate: null,
                targetCalories: 0,
                items: []
            };
            state.mealPlanSummary = {
                targetCalories: 0,
                currentCalories: 0,
                protein: 0,
                fat: 0,
                carbs: 0
            };
        }

        clearMessage(elements.statusMessage);
        renderPage();
    } catch (error) {
        console.error(error);
        showMessage(elements.statusMessage, normalizeErrorMessage(error), "error");
    } finally {
        setPageLoading(false);
    }
}

function renderPage() {
    renderStats();
    renderRecipeGrid();
}

function renderStats() {
    const recipes = state.recipes;

    elements.recipeCount.textContent = recipes.length;

    const avgCalories = recipes.length === 0
        ? 0
        : Math.round(recipes.reduce((sum, recipe) => sum + recipe.caloriesPerServing, 0) / recipes.length);

    elements.avgCalories.textContent = avgCalories;

    const uniqueIngredients = new Set();

    recipes.forEach(recipe => {
        recipe.ingredients.forEach(item => {
            uniqueIngredients.add(item.ingredient.name.toLowerCase());
        });
    });

    elements.ingredientCount.textContent = uniqueIngredients.size;
    elements.selectedCount.textContent = state.mealPlan?.items?.length ?? 0;
}

function renderRecipeGrid() {
    if (!elements.recipeGrid) {
        return;
    }

    if (state.recipes.length === 0) {
        elements.recipeGrid.innerHTML = renderEmptyState(
            "Нет рецептов",
            "Добавь первое блюдо, чтобы оно появилось в каталоге."
        );
        return;
    }

    elements.recipeGrid.innerHTML = "";

    state.recipes.forEach(recipe => {
        const card = document.createElement("article");
        card.className = `recipe-card ${isRecipeSelected(recipe.id) ? "selected" : ""}`;
        card.innerHTML = `
            <div class="recipe-card-image">
                ${renderRecipeImage(recipe)}
            </div>

            <div class="recipe-card-body">
                <div class="recipe-card-top">
                    <div>
                        <h3>${escapeHtml(recipe.title)}</h3>
                        <p>${escapeHtml(recipe.description || "Описание пока не добавлено.")}</p>
                    </div>

                    <span class="recipe-kcal-badge">${recipe.caloriesPerServing} ккал</span>
                </div>

                <div class="recipe-macro-row">
                    <span>Б ${formatMacro(recipe.proteinPerServing)}</span>
                    <span>Ж ${formatMacro(recipe.fatPerServing)}</span>
                    <span>У ${formatMacro(recipe.carbsPerServing)}</span>
                </div>

                <div class="recipe-card-footer">
                    <span>${recipe.ingredients.length} ингредиентов</span>
                    <button class="recipe-open-btn" type="button">Открыть</button>
                </div>
            </div>
        `;

        card.addEventListener("click", () => openRecipeWithAnimation(recipe, card));

        const openButton = card.querySelector(".recipe-open-btn");
        openButton?.addEventListener("click", event => {
            event.stopPropagation();
            openRecipeWithAnimation(recipe, card);
        });

        elements.recipeGrid.appendChild(card);
    });
}

function isRecipeSelected(recipeId) {
    return getSelectedRecipeIds().includes(recipeId);
}

function getSelectedRecipeIds() {
    const ids = state.mealPlan?.items
        ?.map(item => item.recipe.id)
        ?.filter(Boolean) ?? [];

    return [...new Set(ids)];
}

function openRecipeWithAnimation(recipe, sourceElement) {
    sourceElement.classList.remove("is-pulsing");

    window.requestAnimationFrame(() => {
        sourceElement.classList.add("is-pulsing");
    });

    window.setTimeout(() => {
        sourceElement.classList.remove("is-pulsing");
        openModal(recipe);
    }, 520);
}

function openModal(recipe) {
    state.activeRecipe = recipe;

    elements.modalTitle.textContent = recipe.title;
    elements.modalDescription.textContent = recipe.description || "Описание пока не добавлено.";
    elements.modalCalories.textContent = `${recipe.caloriesPerServing}`;
    elements.modalProtein.textContent = formatMacro(recipe.proteinPerServing);
    elements.modalFat.textContent = formatMacro(recipe.fatPerServing);
    elements.modalCarbs.textContent = formatMacro(recipe.carbsPerServing);

    elements.modalImage.innerHTML = renderRecipeImage(recipe);

    elements.modalIngredients.innerHTML = recipe.ingredients
        .map(item => `
            <li>
                <span>${escapeHtml(item.ingredient.name)}</span>
                <strong>${formatAmount(item.amount)} ${escapeHtml(item.unit)}</strong>
            </li>
        `)
        .join("");

    updateMealPlanPickerNote();

    elements.modal.classList.remove("hidden");
    elements.modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

function closeModal() {
    state.activeRecipe = null;

    elements.modal?.classList.add("hidden");
    elements.modal?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}
async function addActiveRecipeToWeek() {
    const recipe = state.activeRecipe;

    if (!recipe) {
        return;
    }

    const dayOfWeek = elements.mealPlanDaySelect?.value || "MONDAY";
    const mealType = elements.mealPlanTypeSelect?.value || "LUNCH";

    const existingSameSlot = state.mealPlan?.items?.find(item =>
        item.recipe.id === recipe.id &&
        item.dayOfWeek === dayOfWeek &&
        item.mealType === mealType
    );

    if (existingSameSlot) {
        showMessage(
            elements.statusMessage,
            `Уже есть в меню: ${dayTitles[dayOfWeek]}, ${mealTypeTitles[mealType]}.`,
            "info"
        );
        updateMealPlanPickerNote();
        return;
    }

    elements.addRecipeToWeekButton.disabled = true;
    elements.addRecipeToWeekButton.textContent = "Добавляю...";

    try {
        await api.addMealPlanItem({
            recipeId: recipe.id,
            dayOfWeek,
            mealType
        });

        state.mealPlan = normalizeMealPlan(await api.getCurrentMealPlan());
        state.mealPlanSummary = normalizeMealPlanSummary(await api.getCurrentMealPlanSummary());

        renderPage();
        updateMealPlanPickerNote();

        showMessage(
            elements.statusMessage,
            `Добавлено в меню: ${dayTitles[dayOfWeek]}, ${mealTypeTitles[mealType]}.`,
            "success"
        );
    } catch (error) {
        console.error(error);
        showMessage(elements.statusMessage, normalizeErrorMessage(error), "error");
    } finally {
        elements.addRecipeToWeekButton.disabled = false;
        elements.addRecipeToWeekButton.textContent = "Добавить в меню недели";
    }
}

function updateMealPlanPickerNote() {
    const recipe = state.activeRecipe;

    if (!recipe || !elements.mealPlanPickerNote) {
        return;
    }

    const placements = state.mealPlan?.items
        ?.filter(item => item.recipe.id === recipe.id)
        ?.map(item => `${dayTitles[item.dayOfWeek] ?? item.dayOfWeek} · ${mealTypeTitles[item.mealType] ?? item.mealType}`)
        ?? [];

    elements.mealPlanPickerNote.textContent = placements.length === 0
        ? "Этого блюда ещё нет в меню недели."
        : `Уже в меню: ${placements.join(", ")}.`;
}

async function deleteActiveRecipe() {
    const recipe = state.activeRecipe;

    if (!recipe) {
        return;
    }

    const previousText = elements.deleteRecipeButton.textContent;
    elements.deleteRecipeButton.disabled = true;
    elements.deleteRecipeButton.textContent = "Удаляю...";

    try {
        await api.deleteRecipe(recipe.id);

        if (state.mealPlan) {
            state.mealPlan.items = state.mealPlan.items.filter(
                item => item.recipe.id !== recipe.id
            );
        }

        state.recipes = state.recipes.filter(item => item.id !== recipe.id);

        closeModal();
        renderPage();

        showMessage(elements.statusMessage, "Рецепт удалён.", "success");
    } catch (error) {
        console.error(error);
        showMessage(elements.statusMessage, normalizeErrorMessage(error), "error");
    } finally {
        elements.deleteRecipeButton.disabled = false;
        elements.deleteRecipeButton.textContent = previousText;
    }
}

async function onCreateRecipeSubmit(event) {
    event.preventDefault();
    clearMessage(elements.formMessage);

    const payload = getRecipeFormPayload();
    const validationError = validateRecipePayload(payload);

    if (validationError) {
        showMessage(elements.formMessage, validationError, "error");
        return;
    }

    setFormLoading(true);

    try {
        const createdRecipe = await api.createRecipe(payload);

        resetForm();
        showMessage(elements.formMessage, `Рецепт создан: ${createdRecipe.title}`, "success");

        await loadRecipes();
    } catch (error) {
        console.error(error);
        showMessage(elements.formMessage, normalizeErrorMessage(error), "error");
    } finally {
        setFormLoading(false);
    }
}

function getRecipeFormPayload() {
    return {
        title: elements.titleInput.value.trim(),
        imageUrl: elements.imageInput.value.trim() || null,
        description: elements.descriptionInput.value.trim() || null,
        servings: Number(elements.servingsInput.value),
        caloriesPerServing: Number(elements.caloriesInput.value),
        proteinPerServing: Number(elements.proteinInput.value),
        fatPerServing: Number(elements.fatInput.value),
        carbsPerServing: Number(elements.carbsInput.value),
        ingredients: parseIngredients(elements.ingredientsInput.value)
    };
}

function validateRecipePayload(payload) {
    if (!payload.title) {
        return "Название рецепта обязательно.";
    }

    if (!Number.isInteger(payload.servings) || payload.servings <= 0) {
        return "Количество порций должно быть больше 0.";
    }

    if (payload.caloriesPerServing < 0) {
        return "Ккал не могут быть меньше 0.";
    }

    if (payload.proteinPerServing < 0 || payload.fatPerServing < 0 || payload.carbsPerServing < 0) {
        return "БЖУ не могут быть меньше 0.";
    }

    if (payload.ingredients.length === 0) {
        return "Добавь хотя бы один ингредиент.";
    }

    return null;
}

function parseIngredients(rawValue) {
    return rawValue
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
            const parts = line.split("|").map(part => part.trim());

            if (parts.length !== 3) {
                return null;
            }

            const [ingredientName, amountRaw, unitRaw] = parts;
            const amount = Number(amountRaw.replace(",", "."));

            if (!ingredientName || !Number.isFinite(amount) || amount <= 0 || !unitRaw) {
                return null;
            }

            return {
                ingredientName,
                amount,
                unit: unitRaw.toUpperCase()
            };
        })
        .filter(Boolean);
}

function resetForm() {
    elements.form?.reset();

    elements.servingsInput.value = "1";
    elements.caloriesInput.value = "0";
    elements.proteinInput.value = "0";
    elements.fatInput.value = "0";
    elements.carbsInput.value = "0";

    clearMessage(elements.formMessage);
}

function setPageLoading(isLoading) {
    if (!elements.loadButton) {
        return;
    }

    elements.loadButton.disabled = isLoading;
    elements.loadButton.textContent = isLoading ? "Загрузка..." : "Обновить рецепты";

    if (isLoading && elements.statusMessage) {
        showMessage(elements.statusMessage, "Загружаю рецепты...", "info");
    }
}

function setFormLoading(isLoading) {
    elements.submitButton.disabled = isLoading;
    elements.submitButton.textContent = isLoading ? "Создание..." : "Добавить рецепт";

    [
        elements.titleInput,
        elements.imageInput,
        elements.descriptionInput,
        elements.servingsInput,
        elements.caloriesInput,
        elements.proteinInput,
        elements.fatInput,
        elements.carbsInput,
        elements.ingredientsInput,
        elements.clearButton
    ].forEach(element => {
        if (element) {
            element.disabled = isLoading;
        }
    });
}

function renderRecipeImage(recipe) {
    if (recipe.imageUrl) {
        return `<img src="${escapeHtml(recipe.imageUrl)}" alt="${escapeHtml(recipe.title)}" loading="lazy">`;
    }

    return `
        <div class="recipe-image-placeholder">
            <span>🍽️</span>
        </div>
    `;
}

function formatMacro(value) {
    return `${Number(value || 0).toFixed(1)} г`;
}

function formatAmount(value) {
    const number = Number(value || 0);

    if (Number.isInteger(number)) {
        return String(number);
    }

    return number.toFixed(1);
}