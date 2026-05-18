package com.example.tasktracker.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public record GoalCreateRequest(
        UUID projectId,
        @NotBlank String title,
        Instant deadline
) {
}