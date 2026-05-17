import { api } from "../api/http.js";
import { normalizeHabits } from "../api/normalizers.js";
import { clearMessage, showMessage } from "../utils/dom.js";
import { normalizeErrorMessage } from "../utils/errors.js";
import { renderHabits } from "../habits/render-habits.js";
import { initNavigation } from "./common.js";

let habits = [];

const elements = {
    reloadButton: document.getElementById("reloadHabitsBtn"),
    list: document.getElementById("habitList"),
    form: document.getElementById("createHabitForm"),
    titleInput: document.getElementById("habitTitleInput"),
    submitButton: document.getElementById("createHabitBtn"),
    clearButton: document.getElementById("clearHabitFormBtn"),
    formMessage: document.getElementById("createHabitMessage")
};

initNavigation("habits");

bindEvents();
document.addEventListener("DOMContentLoaded", loadHabits);

function bindEvents() {
    elements.reloadButton?.addEventListener("click", loadHabits);
    elements.form?.addEventListener("submit", onCreateHabitSubmit);
    elements.clearButton?.addEventListener("click", resetForm);
}

async function loadHabits() {
    setListLoading(true);

    try {
        habits = normalizeHabits(await api.getHabits());
        renderHabits({
            container: elements.list,
            habits,
            onComplete: onHabitComplete
        });

        if (habits.length === 0) {
            showMessage(elements.formMessage, "Привычек пока нет. Добавь первую.", "info");
        } else {
            clearMessage(elements.formMessage);
        }
    } catch (error) {
        console.error(error);
        habits = [];
        renderHabits({
            container: elements.list,
            habits,
            onComplete: onHabitComplete
        });
        showMessage(elements.formMessage, normalizeErrorMessage(error), "error");
    } finally {
        setListLoading(false);
    }
}

async function onCreateHabitSubmit(event) {
    event.preventDefault();
    clearMessage(elements.formMessage);

    const title = elements.titleInput?.value.trim() ?? "";

    if (!title) {
        showMessage(elements.formMessage, "Название привычки обязательно.", "error");
        return;
    }

    setFormLoading(true);

    try {
        const createdHabit = await api.createHabit({ title });
        resetForm();
        showMessage(elements.formMessage, `Привычка создана: ${createdHabit.title}`, "success");
        await loadHabits();
    } catch (error) {
        console.error(error);
        showMessage(elements.formMessage, normalizeErrorMessage(error), "error");
    } finally {
        setFormLoading(false);
    }
}

async function onHabitComplete(habitId, button) {
    const previousText = button.textContent;

    button.disabled = true;
    button.textContent = "Сохраняю...";

    try {
        const updatedHabit = normalizeHabits([await api.completeHabit(habitId)])[0];
        habits = habits.map(habit => habit.id === habitId ? updatedHabit : habit);
        renderHabits({
            container: elements.list,
            habits,
            onComplete: onHabitComplete
        });
        showMessage(elements.formMessage, `Готово: ${updatedHabit.title}`, "success");
    } catch (error) {
        console.error(error);
        showMessage(elements.formMessage, normalizeErrorMessage(error), "error");
        button.disabled = false;
        button.textContent = previousText;
    }
}

function resetForm() {
    elements.form?.reset();
    clearMessage(elements.formMessage);
}

function setListLoading(isLoading) {
    if (!elements.reloadButton) return;
    elements.reloadButton.disabled = isLoading;
    elements.reloadButton.textContent = isLoading ? "Загрузка..." : "Обновить привычки";
}

function setFormLoading(isLoading) {
    if (!elements.submitButton) return;

    elements.submitButton.disabled = isLoading;
    elements.submitButton.textContent = isLoading ? "Создание..." : "Добавить привычку";

    elements.titleInput.disabled = isLoading;
    elements.clearButton.disabled = isLoading;
}
