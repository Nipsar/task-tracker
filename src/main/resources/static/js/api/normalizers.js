import { parseDate } from "../utils/date.js";

export function normalizeTasks(tasks) {
    return (tasks ?? []).map(task => ({
        id: task.id,
        title: String(task.title ?? "Без названия").trim(),
        status: String(task.status ?? "NEW"),
        deadline: parseDate(task.deadline),
        createdAt: parseDate(task.createdAt),
        completedAt: parseDate(task.completedAt),
        projectId: task.projectId ?? null
    }));
}

export function normalizeProjects(projects) {
    return (projects ?? []).map(project => ({
        id: project.id,
        title: String(project.title ?? "Без названия").trim(),
        status: String(project.status ?? "NEW"),
        deadline: parseDate(project.deadline),
        createdAt: parseDate(project.createdAt)
    }));
}

export function normalizeHabits(habits) {
    return (habits ?? []).map(habit => ({
        id: habit.id,
        title: String(habit.title ?? "Без названия").trim(),
        streakDays: Number(habit.streakDays ?? 0),
        bestStreakDays: Number(habit.bestStreakDays ?? 0),
        totalCompletions: Number(habit.totalCompletions ?? 0),
        lastCompletedDate: habit.lastCompletedDate ?? null,
        createdAt: parseDate(habit.createdAt)
    }));
}
