import { escapeHtml, renderEmptyState } from "../utils/dom.js";
import { toLocalDateKey } from "../utils/date.js";

export function renderHabits({ container, habits, onComplete }) {
    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!habits || habits.length === 0) {
        container.innerHTML = renderEmptyState(
            "Привычек пока нет",
            "Добавь привычку выше и отмечай её каждый день."
        );
        return;
    }

    const todayKey = toLocalDateKey(new Date());
    const sortedHabits = [...habits].sort((a, b) => {
        const streakDiff = Number(b.streakDays ?? 0) - Number(a.streakDays ?? 0);
        if (streakDiff !== 0) return streakDiff;
        return String(a.title ?? "").localeCompare(String(b.title ?? ""), "ru");
    });

    sortedHabits.forEach(habit => {
        const card = document.createElement("article");
        card.className = "habit-card";

        const lastCompletedDate = habit.lastCompletedDate ?? null;
        const isCompletedToday = lastCompletedDate === todayKey;

        card.innerHTML = `
            <div class="habit-top">
                <div>
                    <h3>${escapeHtml(habit.title)}</h3>
                    <div class="task-id">${escapeHtml(habit.id)}</div>
                </div>
                <div class="habit-streak-badge">
                    🔥 ${Number(habit.streakDays ?? 0)} дн.
                </div>
            </div>

            <div class="habit-meta-grid">
                <div class="task-meta-item">
                    <span class="task-meta-label">Серия</span>
                    <strong>${Number(habit.streakDays ?? 0)} дней подряд</strong>
                </div>
                <div class="task-meta-item">
                    <span class="task-meta-label">Лучший результат</span>
                    <strong>${Number(habit.bestStreakDays ?? 0)} дней</strong>
                </div>
                <div class="task-meta-item">
                    <span class="task-meta-label">Всего выполнено</span>
                    <strong>${Number(habit.totalCompletions ?? 0)}</strong>
                </div>
                <div class="task-meta-item">
                    <span class="task-meta-label">Последнее выполнение</span>
                    <strong>${escapeHtml(lastCompletedDate ?? "—")}</strong>
                </div>
            </div>

            <div class="task-actions">
                <button
                    type="button"
                    class="primary-btn habit-complete-btn"
                    ${isCompletedToday ? "disabled" : ""}
                >
                    ${isCompletedToday ? "Сегодня выполнено" : "Выполнено сегодня"}
                </button>
            </div>
        `;

        const completeButton = card.querySelector(".habit-complete-btn");
        completeButton.addEventListener("click", () => onComplete(habit.id, completeButton));

        container.appendChild(card);
    });
}
