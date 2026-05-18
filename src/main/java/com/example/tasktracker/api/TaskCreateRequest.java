package com.example.tasktracker.api;

import com.example.tasktracker.domain.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public record TaskCreateRequest(
        UUID projectId,
        UUID goalId,
        @NotBlank String title,
        Instant deadline,
        @NotNull TaskStatus status
) {
}