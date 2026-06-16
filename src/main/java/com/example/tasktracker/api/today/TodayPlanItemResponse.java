package com.example.tasktracker.api.today;

import com.example.tasktracker.domain.model.TaskDifficulty;
import com.example.tasktracker.domain.model.TaskEnergy;
import com.example.tasktracker.domain.model.TaskImportance;
import com.example.tasktracker.domain.model.TaskStatus;
import com.example.tasktracker.domain.model.TodayPlanItemStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TodayPlanItemResponse(
        UUID itemId,
        UUID taskId,
        String title,
        TaskStatus taskStatus,
        Instant deadline,
        TaskImportance importance,
        TaskDifficulty difficulty,
        TaskEnergy energy,
        Integer estimatedMinutes,
        TodayPlanItemStatus planStatus,
        LocalDate plannedDate,
        Integer score
) {
}