import { formatDate, formatRelativeDays, toLocalDateKey } from "../utils/date.js";

const MS_IN_DAY = 24 * 60 * 60 * 1000;

export function buildMetrics(tasks) {
    const now = new Date();
    const statusCounts = { NEW: 0, IN_PROGRESS: 0, DONE: 0 };

    for (const task of tasks) {
        if (statusCounts[task.status] !== undefined) {
            statusCounts[task.status] += 1;
        }
    }

    const total = tasks.length;
    const done = statusCounts.DONE;
    const overdue = tasks.filter(task => task.deadline && task.deadline < now && task.status !== "DONE").length;
    const donePercent = total === 0 ? 0 : Math.round((done / total) * 100);

    const nearestActiveTask = tasks
        .filter(task => task.deadline && task.status !== "DONE" && task.deadline >= now)
        .sort((a, b) => a.deadline - b.deadline)[0];

    return {
        total,
        done,
        overdue,
        donePercent,
        statusCounts,
        nearestDeadlineLabel: nearestActiveTask ? formatDate(nearestActiveTask.deadline) : "Нет активных дедлайнов",
        nearestDeadlineNote: nearestActiveTask
            ? `${nearestActiveTask.title} · ${formatRelativeDays(nearestActiveTask.deadline)}`
            : "Все активные задачи без дедлайна или уже завершены",
        deadlineBuckets: buildDeadlineBuckets(tasks, now),
        activityLast7Days: buildLast7DaysActivity(tasks, now)
    };
}

function buildDeadlineBuckets(tasks, now) {
    const buckets = [
        { key: "overdue", label: "Просрочено", value: 0 },
        { key: "week", label: "До 7 дней", value: 0 },
        { key: "month", label: "8–30 дней", value: 0 },
        { key: "later", label: "Позже", value: 0 },
        { key: "none", label: "Без дедлайна", value: 0 }
    ];

    for (const task of tasks) {
        if (!task.deadline) {
            buckets[4].value += 1;
            continue;
        }

        if (task.status === "DONE") {
            continue;
        }

        const diffDays = Math.ceil((task.deadline - now) / MS_IN_DAY);

        if (diffDays < 0) {
            buckets[0].value += 1;
        } else if (diffDays <= 7) {
            buckets[1].value += 1;
        } else if (diffDays <= 30) {
            buckets[2].value += 1;
        } else {
            buckets[3].value += 1;
        }
    }

    return buckets;
}

function buildLast7DaysActivity(tasks, now) {
    const days = [];
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (let i = 6; i >= 0; i -= 1) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        days.push({
            key: toLocalDateKey(date),
            shortLabel: date.toLocaleDateString("ru-RU", { weekday: "short" }),
            fullLabel: date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
            value: 0
        });
    }

    for (const task of tasks) {
        if (task.status !== "DONE" || !task.completedAt) {
            continue;
        }

        const key = toLocalDateKey(task.completedAt);
        const day = days.find(item => item.key === key);

        if (day) {
            day.value += 1;
        }
    }

    return days;
}
