import { api } from "../api/http.js";
import { escapeHtml, renderEmptyState } from "../utils/dom.js";
import { formatDate } from "../utils/date.js";
import { normalizeErrorMessage } from "../utils/errors.js";
import { initNavigation } from "./common.js";

const elements = {
    loadButton: document.getElementById("loadTodayBtn"),
    statusMessage: document.getElementById("todayStatusMessage"),

    totalTasksValue: document.getElementById("totalTasksValue"),
    totalTasksNote: document.getElementById("totalTasksNote"),
    doneTasksValue: document.getElementById("doneTasksValue"),
    overdueTasksValue: document.getElementById("overdueTasksValue"),
    habitsValue: document.getElementById("habitsValue"),
    habitsNote: document.getElementById("habitsNote"),

    tasksList: document.getElementById("todayTasksList"),
    habitsList: document.getElementById("todayHabitsList"),
    goalsList: document.getElementById("todayGoalsList")
};

initNavigation("today");

document.addEventListener("DOMContentLoaded", initPage);

elements.loadButton?.addEventListener("click", loadTodayBoard);
elements.tasksList?.addEventListener("click", onTodayTaskActionClick);

async function initPage() {
    await loadTodayBoard();
}

async function loadTodayBoard() {
    setLoading(true);

    try {
        const board = await api.getTodayBoard();

        renderSummary(board.summary);
        renderTasks(board.tasks ?? []);
        renderHabits(board.habits ?? []);
        renderGoals(board.goals ?? []);

        elements.statusMessage.textContent = board.date
            ? `Доска обновлена за ${formatBoardDate(board.date)}.`
            : "Доска обновлена.";
    } catch (error) {
        console.error(error);

        renderSummary(null);
        renderTasks([]);
        renderHabits([]);
        renderGoals([]);

        elements.statusMessage.textContent = normalizeErrorMessage(error);
        elements.statusMessage.className = "form-message error";
    } finally {
        setLoading(false);
    }
}

function renderSummary(summary) {
    const safeSummary = summary ?? {
        totalTasks: 0,
        doneTasks: 0,
        overdueTasks: 0,
        dueTodayTasks: 0,
        totalHabits: 0,
        completedHabits: 0,
        totalGoals: 0
    };

    elements.totalTasksValue.textContent = safeSummary.totalTasks;
    elements.totalTasksNote.textContent = `Сегодня: ${safeSummary.dueTodayTasks}`;

    elements.doneTasksValue.textContent = safeSummary.doneTasks;
    elements.overdueTasksValue.textContent = safeSummary.overdueTasks;

    elements.habitsValue.textContent =
        `${safeSummary.completedHabits}/${safeSummary.totalHabits}`;

    elements.habitsNote.textContent =
        `Целей в фокусе: ${safeSummary.totalGoals}`;
}

function renderTasks(tasks) {
    if (!elements.tasksList) {
        return;
    }

    elements.tasksList.innerHTML = "";

    if (tasks.length === 0) {
        elements.tasksList.innerHTML = renderEmptyState(
            "На сегодня задач нет",
            "Автоплан не выбрал задач на сегодня или все задачи уже выполнены/перенесены."
        );
        return;
    }

    tasks.forEach(task => {
        const card = document.createElement("article");
        card.className = "task-card";

        const deadlineText = task.deadline
            ? formatDate(task.deadline)
            : "Без deadline";

        const estimatedMinutes = Number(task.estimatedMinutes ?? 0);
        const score = Number(task.score ?? 0);

        const todayPlanItemId = task.todayPlanItemId;

        card.innerHTML = `
            <div class="task-top">
                <div>
                    <h3>${escapeHtml(task.title)}</h3>
                    <p class="task-id">
                        task: ${escapeHtml(task.taskId ?? "—")}
                    </p>
                    <p class="task-id">
                        plan item: ${escapeHtml(todayPlanItemId ?? "—")}
                    </p>
                </div>

                <span class="badge ${escapeHtml(task.taskStatus ?? "ACTIVE")}">
                    ${escapeHtml(task.taskStatus ?? "ACTIVE")}
                </span>
            </div>

            <div class="task-meta-grid">
                <div class="task-meta-item">
                    <span class="task-meta-label">Deadline</span>
                    ${escapeHtml(deadlineText)}
                </div>

                <div class="task-meta-item">
                    <span class="task-meta-label">Важность</span>
                    ${escapeHtml(formatImportance(task.importance))}
                </div>

                <div class="task-meta-item">
                    <span class="task-meta-label">Сложность</span>
                    ${escapeHtml(formatDifficulty(task.difficulty))}
                </div>

                <div class="task-meta-item">
                    <span class="task-meta-label">Энергия</span>
                    ${escapeHtml(formatEnergy(task.energy))}
                </div>

                <div class="task-meta-item">
                    <span class="task-meta-label">Время</span>
                    ${estimatedMinutes > 0 ? `${estimatedMinutes} мин.` : "—"}
                </div>

                <div class="task-meta-item">
                    <span class="task-meta-label">Score</span>
                    ${score}
                </div>
            </div>

            <p class="stat-note">
                ${escapeHtml(formatPlanStatus(task.planStatus))}
                ${task.plannedDate ? ` · ${escapeHtml(task.plannedDate)}` : ""}
                ${task.autoPlanEnabled === false ? " · Автоплан выключен" : ""}
            </p>

            <div class="today-task-actions">
                <button
                    class="primary-btn"
                    type="button"
                    data-today-action="done"
                    data-item-id="${escapeHtml(todayPlanItemId ?? "")}"
                    ${todayPlanItemId ? "" : "disabled"}
                >
                    Готово
                </button>

                <button
                    class="secondary-btn"
                    type="button"
                    data-today-action="move-tomorrow"
                    data-item-id="${escapeHtml(todayPlanItemId ?? "")}"
                    ${todayPlanItemId ? "" : "disabled"}
                >
                    На завтра
                </button>
            </div>
        `;

        elements.tasksList.appendChild(card);
    });
}

async function onTodayTaskActionClick(event) {
    const button = event.target.closest("[data-today-action]");

    if (!button) {
        return;
    }

    const itemId = button.dataset.itemId;
    const action = button.dataset.todayAction;

    if (!itemId) {
        elements.statusMessage.textContent = "У задачи нет todayPlanItemId.";
        elements.statusMessage.className = "form-message error";
        return;
    }

    setTodayActionButtonsDisabled(true);

    try {
        const board = action === "done"
            ? await api.markTodayBoardItemDone(itemId)
            : await api.moveTodayBoardItemTomorrow(itemId);

        renderSummary(board.summary);
        renderTasks(board.tasks ?? []);
        renderHabits(board.habits ?? []);
        renderGoals(board.goals ?? []);

        elements.statusMessage.textContent = action === "done"
            ? "Задача выполнена."
            : "Задача перенесена на завтра.";

        elements.statusMessage.className = "form-message success";
    } catch (error) {
        console.error(error);
        elements.statusMessage.textContent = normalizeErrorMessage(error);
        elements.statusMessage.className = "form-message error";
    } finally {
        setTodayActionButtonsDisabled(false);
    }
}

function setTodayActionButtonsDisabled(isDisabled) {
    elements.tasksList
        ?.querySelectorAll("[data-today-action]")
        .forEach(button => {
            button.disabled = isDisabled;
        });
}

function renderHabits(habits) {
    if (!elements.habitsList) {
        return;
    }

    elements.habitsList.innerHTML = "";

    if (habits.length === 0) {
        elements.habitsList.innerHTML = renderEmptyState(
            "Привычек пока нет",
            "Создай привычки на странице привычек."
        );
        return;
    }

    habits.forEach(habit => {
        const card = document.createElement("article");
        card.className = "habit-card";

        card.innerHTML = `
            <div class="habit-top">
                <div>
                    <h3>${escapeHtml(habit.title)}</h3>
                    <p class="task-id">${escapeHtml(habit.id)}</p>
                </div>

                <span class="habit-streak-badge">
                    ${habit.completedToday ? "Готово" : "Не выполнено"}
                </span>
            </div>

            <div class="habit-meta-grid">
                <div class="task-meta-item">
                    <span class="task-meta-label">Streak</span>
                    ${Number(habit.streakDays ?? 0)} дн.
                </div>

                <div class="task-meta-item">
                    <span class="task-meta-label">Best</span>
                    ${Number(habit.bestStreakDays ?? 0)} дн.
                </div>

                <div class="task-meta-item">
                    <span class="task-meta-label">Total</span>
                    ${Number(habit.totalCompletions ?? 0)}
                </div>

                <div class="task-meta-item">
                    <span class="task-meta-label">Last</span>
                    ${escapeHtml(habit.lastCompletedDate ?? "—")}
                </div>
            </div>
        `;

        elements.habitsList.appendChild(card);
    });
}

function renderGoals(goals) {
    if (!elements.goalsList) {
        return;
    }

    elements.goalsList.innerHTML = "";

    if (goals.length === 0) {
        elements.goalsList.innerHTML = renderEmptyState(
            "Целей пока нет",
            "Создай цели на странице целей."
        );
        return;
    }

    goals.forEach(goal => {
        const progressPercent = Number(goal.progressPercent ?? 0);
        const doneTasks = Number(goal.doneTasks ?? 0);
        const totalTasks = Number(goal.totalTasks ?? 0);

        const card = document.createElement("article");
        card.className = `goal-card ${progressPercent >= 100 ? "done" : ""}`;

        card.innerHTML = `
            <div class="goal-top">
                <div>
                    <h3 class="goal-title">${escapeHtml(goal.title)}</h3>
                    <p class="goal-project">
                        ${escapeHtml(goal.projectTitle ?? "Без проекта")}
                    </p>
                    <p class="goal-id">${escapeHtml(goal.id)}</p>
                </div>

                <span class="goal-badge ${progressPercent >= 100 ? "DONE" : "ACTIVE"}">
                    ${progressPercent >= 100 ? "DONE" : "ACTIVE"}
                </span>
            </div>

            <div class="goal-progress">
                <div class="goal-progress-head">
                    <span>Прогресс</span>
                    <span class="goal-progress-value">${progressPercent}%</span>
                </div>

                <div class="goal-progress-track">
                    <div
                        class="goal-progress-fill"
                        style="width: ${Math.max(0, Math.min(100, progressPercent))}%"
                    ></div>
                </div>
            </div>

            <div class="goal-meta-grid">
                <div class="goal-meta-item">
                    <span class="goal-meta-label">Задачи</span>
                    <span class="goal-meta-value">${doneTasks}/${totalTasks}</span>
                </div>

                <div class="goal-meta-item">
                    <span class="goal-meta-label">Deadline</span>
                    <span class="goal-meta-value">
                        ${escapeHtml(goal.deadline ? formatDate(goal.deadline) : "—")}
                    </span>
                </div>
            </div>
        `;

        elements.goalsList.appendChild(card);
    });
}

function formatImportance(value) {
    switch (value) {
        case "LOW":
            return "Низкая";
        case "MEDIUM":
            return "Средняя";
        case "HIGH":
            return "Высокая";
        case "CRITICAL":
            return "Критическая";
        default:
            return value ?? "—";
    }
}

function formatDifficulty(value) {
    switch (value) {
        case "EASY":
            return "Лёгкая";
        case "MEDIUM":
            return "Средняя";
        case "HARD":
            return "Сложная";
        default:
            return value ?? "—";
    }
}

function formatEnergy(value) {
    switch (value) {
        case "LOW":
            return "Низкая";
        case "MEDIUM":
            return "Средняя";
        case "HIGH":
            return "Высокая";
        default:
            return value ?? "—";
    }
}

function formatPlanStatus(value) {
    switch (value) {
        case "PLANNED":
            return "Запланировано";
        case "DONE":
            return "Выполнено";
        case "MOVED":
            return "Перенесено";
        default:
            return value ?? "—";
    }
}

function setLoading(isLoading) {
    if (!elements.loadButton) {
        return;
    }

    elements.loadButton.disabled = isLoading;
    elements.loadButton.textContent = isLoading
        ? "Загрузка..."
        : "Обновить";

    if (isLoading) {
        elements.statusMessage.textContent = "Загружаю Today board...";
        elements.statusMessage.className = "form-message info";
    }
}

function formatBoardDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}