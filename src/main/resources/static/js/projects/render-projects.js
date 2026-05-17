import { escapeHtml, renderEmptyState } from "../utils/dom.js";
import { formatDate, formatRelativeDays } from "../utils/date.js";

export function renderProjects(container, projects) {
    if (!container) {
        return;
    }

    if (!projects || projects.length === 0) {
        container.innerHTML = renderEmptyState(
            "Проектов пока нет",
            "Создай первый проект через форму выше."
        );
        return;
    }

    const sortedProjects = [...projects].sort((a, b) => {
        if (a.deadline && b.deadline) return a.deadline - b.deadline;
        if (a.deadline) return -1;
        if (b.deadline) return 1;
        return a.title.localeCompare(b.title, "ru");
    });

    container.innerHTML = sortedProjects.map(project => {
        const deadlineMeta = project.deadline
            ? `${formatDate(project.deadline)} · ${formatRelativeDays(project.deadline)}`
            : "Без дедлайна";

        const createdMeta = project.createdAt ? formatDate(project.createdAt) : "Нет createdAt";

        return `
            <article class="project-card">
                <div class="task-top">
                    <div>
                        <h3>${escapeHtml(project.title)}</h3>
                        <div class="task-id">${escapeHtml(project.id)}</div>
                    </div>
                    <div class="badge ${escapeHtml(project.status)}">${escapeHtml(project.status)}</div>
                </div>

                <div class="task-meta-grid">
                    <div class="task-meta-item">
                        <span class="task-meta-label">Deadline</span>
                        <strong>${escapeHtml(deadlineMeta)}</strong>
                    </div>
                    <div class="task-meta-item">
                        <span class="task-meta-label">Created</span>
                        <strong>${escapeHtml(createdMeta)}</strong>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}
