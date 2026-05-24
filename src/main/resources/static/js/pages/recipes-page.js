import { api } from "../api/http.js";

import {
  normalizeMealPlan,
  normalizeMealPlanSummary,
  normalizeRecipes
} from "../api/normalizers.js";

import {
  clearMessage,
  escapeHtml,
  renderEmptyState,
  showMessage
} from "../utils/dom.js";

import { normalizeErrorMessage } from "../utils/errors.js";
import { initNavigation } from "./common.js";

const state = {
    recipes: [],
    mealPlan: null,
    mealPlanSummary: null,
    activeRecipe: null
};

const elements = {
    loadButton: document.getElementById("loadRecipesBtn"),
    statusMessage: document.getElementById("recipesStatusMessage"),
    recipeGrid: document.getElementById("recipeGrid"),
    mealCardRail: document.getElementById("mealCardRail"),

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
    toggleSelectedButton: document.getElementById("toggleSelectedRecipeBtn"),
    deleteRecipeButton: document.getElementById("deleteRecipeBtn")
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

    elements.toggleSelectedButton?.addEventListener("click", toggleActiveRecipeSelection);
    elements.deleteRecipeButton?.addEventListener("click", deleteActiveRecipe);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeModal();
        }
    });
}

async function loadRecipes() {
    try {
        elements.statusMessage.textContent = "Загружаю рецепты...";

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

        elements.statusMessage.textContent = "";
        renderPage();
    } catch (error) {
        console.error(error);
        elements.statusMessage.textContent = normalizeErrorMessage(error);
    }
}

function renderPage() {
    renderStats();
    renderRecipeGrid();
    renderMealRail();
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
        card.className = "recipe-card";
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

function renderMealRail() {
    if (!elements.mealCardRail) {
        return;
    }

    if (state.recipes.length === 0) {
        elements.mealCardRail.innerHTML = `
            <div class="meal-rail-empty">
                Добавь рецепты, и здесь появится нижнее меню блюд.
            </div>
        `;
        return;
    }

    elements.mealCardRail.innerHTML = "";

    state.recipes.forEach(recipe => {
        const isSelected = isRecipeSelected(recipe.id);

        const card = document.createElement("button");
        card.className = `meal-choice-card ${isSelected ? "selected" : ""}`;
        card.type = "button";
        card.innerHTML = `
            <span class="meal-choice-ring"></span>

            <span class="meal-choice-image">
                ${renderRecipeImage(recipe)}
            </span>

            <span class="meal-choice-content">
                <strong>${escapeHtml(recipe.title)}</strong>
                <small>${recipe.caloriesPerServing} ккал · Б${formatMacro(recipe.proteinPerServing)}</small>
            </span>
        `;

        card.addEventListener("click", () => openRecipeWithAnimation(recipe, card));
        elements.mealCardRail.appendChild(card);
    });
}

function isRecipeSelected(recipeId) {
  return Boolean(
    state.mealPlan?.items?.some(item => item.recipe.id === recipeId)
  );
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

    updateModalSelectionButton();

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

async function toggleActiveRecipeSelection() {
  const recipe = state.activeRecipe;

  if (!recipe) {
    return;
  }

  elements.toggleSelectedButton.disabled = true;
  elements.toggleSelectedButton.textContent = "Сохраняю...";

  try {
    const existingItem = state.mealPlan?.items?.find(
      item => item.recipe.id === recipe.id
    );

    if (existingItem) {
      await api.deleteMealPlanItem(existingItem.id);
    } else {
      await api.addMealPlanItem({
        recipeId: recipe.id,
        dayOfWeek: "MONDAY",
        mealType: "LUNCH"
      });
    }

    state.mealPlan = normalizeMealPlan(await api.getCurrentMealPlan());
    state.mealPlanSummary = normalizeMealPlanSummary(await api.getCurrentMealPlanSummary());

    updateModalSelectionButton();
    renderPage();
  } catch (error) {
    console.error(error);
    elements.statusMessage.textContent = normalizeErrorMessage(error);
  } finally {
    elements.toggleSelectedButton.disabled = false;
    updateModalSelectionButton();
  }
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

        elements.statusMessage.textContent = "Рецепт удалён.";
    } catch (error) {
        console.error(error);
        elements.statusMessage.textContent = normalizeErrorMessage(error);
    } finally {
        elements.deleteRecipeButton.disabled = false;
        elements.deleteRecipeButton.textContent = previousText;
    }
}

function updateModalSelectionButton() {
    const recipe = state.activeRecipe;

    if (!recipe) {
        return;
    }

    const isSelected = isRecipeSelected(recipe.id);
    elements.toggleSelectedButton.textContent = isSelected
      ? "Убрать из недели"
      : "Выбрать на неделю";
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

            return {
                ingredientName,
                amount: Number(amountRaw.replace(",", ".")),
                unit: unitRaw.toUpperCase()
            };
        })
        .filter(item => item && item.ingredientName && item.amount > 0 && item.unit);
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
        elements.statusMessage.textContent = "Загружаю рецепты...";
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