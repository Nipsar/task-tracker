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
            "Нет просроченных задач, задач с deadline сегодня или закрытых сегодня."
        );
        return;
    }

    tasks.forEach(task => {
        const card = document.createElement("article");
        card.className = "task-card";

        const labels = [
            task.overdue ? "Просрочено" : null,
            task.dueToday ? "Сегодня" : null,
            task.completedToday ? "Закрыто сегодня" : null
        ].filter(Boolean);

        const deadlineText = task.deadline
            ? formatDate(task.deadline)
            : "Без deadline";

        const completedText = task.completedAt
            ? formatDate(task.completedAt)
            : "—";

        card.innerHTML = `
            <div class="task-top">
                <div>
                    <h3>${escapeHtml(task.title)}</h3>
                    <p class="task-id">${escapeHtml(task.id)}</p>
                </div>

                <span class="badge ${escapeHtml(task.status)}">
                    ${escapeHtml(task.status)}
                </span>
            </div>

            <div class="task-meta-grid">
                <div class="task-meta-item">
                    <span class="task-meta-label">Проект</span>
                    ${escapeHtml(task.projectTitle ?? "Без проекта")}
                </div>

                <div class="task-meta-item">
                    <span class="task-meta-label">Цель</span>
                    ${escapeHtml(task.goalTitle ?? "Без цели")}
                </div>

                <div class="task-meta-item">
                    <span class="task-meta-label">Deadline</span>
                    ${escapeHtml(deadlineText)}
                </div>

                <div class="task-meta-item">
                    <span class="task-meta-label">Completed</span>
                    ${escapeHtml(completedText)}
                </div>
            </div>

            <p class="stat-note">
                ${labels.length === 0 ? "Без специальных меток" : escapeHtml(labels.join(" · "))}
            </p>
        `;

        elements.tasksList.appendChild(card);
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