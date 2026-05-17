import { formatDate, formatRelativeDays } from "../utils/date.js";
import { escapeHtml } from "../utils/dom.js";

export function renderGoalStats(elements, goals) {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => goal.progressPercent === 100).length;
    const totalGoalTasks = goals.reduce((sum, goal) => sum + goal.totalTasks, 0);

    const averageProgress = totalGoals === 0
        ? 0
        : Math.round(goals.reduce((sum, goal) => sum + goal.progressPercent, 0) / totalGoals);

    elements.totalGoalsEl.textContent = totalGoals;
    elements.averageGoalProgressEl.textContent = `${averageProgress}%`;
    elements.completedGoalsEl.textContent = completedGoals;
    elements.goalTasksCountEl.textContent = totalGoalTasks;
}

export function renderGoalsList(goalsListElement, goals) {
    goalsListElement.innerHTML = "";

    if (goals.length === 0) {
        goalsListElement.innerHTML = `
            <div class="empty-state">
                <div class="empty-title">Цели не найдены</div>
                <div class="empty-text">Создай цель или измени фильтр.</div>
            </div>
        `;
        return;
    }

    goalsListElement.innerHTML = goals.map(buildGoalCard).join("");
}

function buildGoalCard(goal) {
    const deadlineText = goal.deadline
        ? `${formatDate(goal.deadline)} · ${formatRelativeDays(goal.deadline)}`
        : "Без дедлайна";

    const createdText = goal.createdAt
        ? formatDate(goal.createdAt)
        : "Нет createdAt";

    return `
        <article class="goal-card">
            <div class="goal-card-top">
                <div>
                    <h3>${escapeHtml(goal.title)}</h3>
                    <div class="task-id">${escapeHtml(goal.id)}</div>
                </div>

                <div class="goal-progress-number">${goal.progressPercent}%</div>
            </div>

            <div class="goal-progress">
                <div class="goal-progress-fill" style="width: ${goal.progressPercent}%"></div>
            </div>

            <div class="goal-progress-note">
                Выполнено ${goal.doneTasks} из ${goal.totalTasks} задач
            </div>

            <div class="task-meta-grid">
                <div class="task-meta-item">
                    <span class="task-meta-label">Проект</span>
                    <strong>${escapeHtml(goal.projectTitle)}</strong>
                </div>

                <div class="task-meta-item">
                    <span class="task-meta-label">Deadline</span>
                    <strong>${escapeHtml(deadlineText)}</strong>
                </div>

                <div class="task-meta-item">
                    <span class="task-meta-label">Created</span>
                    <strong>${escapeHtml(createdText)}</strong>
                </div>

                <div class="task-meta-item">
                    <span class="task-meta-label">Статус цели</span>
                    <strong>${goal.progressPercent === 100 ? "DONE" : "IN_PROGRESS"}</strong>
                </div>
            </div>

            <div class="goal-tasks-block">
                <h4>Задачи цели</h4>
                ${buildGoalTasksPreview(goal.tasks)}
            </div>
        </article>
    `;
}

function buildGoalTasksPreview(tasks) {
    if (!tasks || tasks.length === 0) {
        return `<div class="empty-text">К этой цели пока нет задач.</div>`;
    }

    return `
        <div class="goal-task-list">
            ${tasks.slice(0, 5).map(task => `
                <div class="goal-task-row">
                    <span>${escapeHtml(task.title)}</span>
                    <strong class="badge ${escapeHtml(task.status)}">${escapeHtml(task.status)}</strong>
                </div>
            `).join("")}

            ${tasks.length > 5 ? `
                <div class="empty-text">И ещё ${tasks.length - 5} задач...</div>
            ` : ""}
        </div>
    `;
}