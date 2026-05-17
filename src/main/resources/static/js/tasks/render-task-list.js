import { escapeHtml, renderEmptyState } from "../utils/dom.js";
import { formatDate, formatRelativeDays } from "../utils/date.js";
import { getProjectTitleById } from "./task-utils.js";

export function renderTaskList({ container, tasks, projects, onStatusSave, onDelete }) {
    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (tasks.length === 0) {
        container.innerHTML = renderEmptyState(
            "Ничего не найдено",
            "Попробуй изменить фильтр или добавить задачу."
        );
        return;
    }

    tasks.forEach(task => {
        const card = document.createElement("article");
        card.className = "task-card";

        const deadlineMeta = task.deadline
            ? `${formatDate(task.deadline)} · ${formatRelativeDays(task.deadline)}`
            : "Без дедлайна";

        const createdMeta = task.createdAt
            ? formatDate(task.createdAt)
            : "Нет createdAt";

        card.innerHTML = `
            <div class="task-top">
                <div>
                    <h3>${escapeHtml(task.title)}</h3>
                    <div class="task-id">${escapeHtml(task.id)}</div>
                </div>
                <div class="badge ${escapeHtml(task.status)}">${escapeHtml(task.status)}</div>
            </div>

            <div class="task-meta-grid">
                <div class="task-meta-item">
                    <span class="task-meta-label">Проект</span>
                    <strong>${escapeHtml(getProjectTitleById(projects, task.projectId))}</strong>
                </div>
                <div class="task-meta-item">
                    <span class="task-meta-label">Deadline</span>
                    <strong>${escapeHtml(deadlineMeta)}</strong>
                </div>
                <div class="task-meta-item">
                    <span class="task-meta-label">Created</span>
                    <strong>${escapeHtml(createdMeta)}</strong>
                </div>
                <div class="task-meta-item">
                    <span class="task-meta-label">Status</span>
                    <strong>${escapeHtml(task.status)}</strong>
                </div>
            </div>

            <div class="task-actions">
                <select class="filter-select task-status-select">
                    <option value="NEW" ${task.status === "NEW" ? "selected" : ""}>NEW</option>
                    <option value="IN_PROGRESS" ${task.status === "IN_PROGRESS" ? "selected" : ""}>IN_PROGRESS</option>
                    <option value="DONE" ${task.status === "DONE" ? "selected" : ""}>DONE</option>
                </select>

                <button type="button" class="secondary-btn task-status-save">
                    Сохранить статус
                </button>

                <button type="button" class="secondary-btn task-delete-btn">
                    Удалить
                </button>
            </div>
        `;

        const statusSelect = card.querySelector(".task-status-select");
        const saveButton = card.querySelector(".task-status-save");
        const deleteButton = card.querySelector(".task-delete-btn");

        saveButton.addEventListener("click", () => {
            onStatusSave(task.id, statusSelect.value, saveButton, statusSelect);
        });

        deleteButton.addEventListener("click", () => {
            onDelete(task.id, deleteButton);
        });

        container.appendChild(card);
    });
}

export function renderProjectSelect(select, projects) {
    if (!select) {
        return;
    }

    if (projects.length === 0) {
        select.innerHTML = `<option value="">Нет проектов. Сначала создай проект.</option>`;
        select.disabled = true;
        return;
    }

    select.disabled = false;
    select.innerHTML = `
        <option value="">Выбери проект</option>
        ${projects.map(project => `
            <option value="${escapeHtml(project.id)}">
                ${escapeHtml(project.title)} — ${escapeHtml(project.status)}
            </option>
        `).join("")}
    `;
}
