package com.example.tasktracker.api.task;

import com.example.tasktracker.domain.model.TaskDifficulty;
import com.example.tasktracker.domain.model.TaskEnergy;
import com.example.tasktracker.domain.model.TaskImportance;
import com.example.tasktracker.domain.model.TaskStatus;

import java.time.Instant;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        UUID projectId,
        UUID goalId,
        String title,
        TaskStatus status,
        Instant deadline,
        Instant createdAt,
        Instant completedAt,
        TaskImportance importance,
        TaskDifficulty difficulty,
        TaskEnergy energy,
        Integer estimatedMinutes,
        Boolean autoPlanEnabled
) {
}