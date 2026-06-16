package com.example.tasktracker.api.today;

import com.example.tasktracker.domain.model.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record TodayBoardResponse(
        LocalDate date,
        List<TaskItem> tasks,
        List<HabitItem> habits,
        List<GoalItem> goals,
        Summary summary
) {

    public record TaskItem(
            UUID todayPlanItemId,
            UUID taskId,
            UUID projectId,
            UUID goalId,
            String title,
            TaskStatus taskStatus,
            Instant deadline,

            TaskImportance importance,
            TaskDifficulty difficulty,
            TaskEnergy energy,
            Integer estimatedMinutes,
            Boolean autoPlanEnabled,

            TodayPlanItemStatus planStatus,
            LocalDate plannedDate,
            Integer score
    ) {
    }

    public record HabitItem(
            UUID id,
            String title,
            int streakDays,
            int bestStreakDays,
            int totalCompletions,
            LocalDate lastCompletedDate,
            Instant createdAt,
            boolean completedToday
    ) {
    }

    public record GoalItem(
            UUID id,
            UUID projectId,
            String projectTitle,
            String title,
            Instant deadline,
            Instant createdAt,
            long totalTasks,
            long doneTasks,
            int progressPercent
    ) {
    }

    public record Summary(
            int totalTasks,
            int doneTasks,
            int overdueTasks,
            int dueTodayTasks,
            int totalHabits,
            int completedHabits,
            int totalGoals
    ) {
    }
}