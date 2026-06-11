package com.example.tasktracker.api.task;

import com.example.tasktracker.domain.model.TaskDifficulty;
import com.example.tasktracker.domain.model.TaskEnergy;
import com.example.tasktracker.domain.model.TaskImportance;
import com.example.tasktracker.domain.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.Instant;
import java.util.UUID;

public record TaskCreateRequest(
        UUID projectId,
        UUID goalId,
        @NotBlank String title,
        Instant deadline,
        @NotNull TaskStatus status,
        @NotNull TaskImportance importance,
        @NotNull TaskDifficulty difficulty,
        @NotNull TaskEnergy energy,
        @NotNull @Positive Integer estimatedMinutes,
        Boolean autoPlanEnabled
        ) {
}