package com.example.tasktracker.api.goal;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.UUID;

public record GoalCreateRequest(
        UUID projectId,
        @NotBlank String title,
        Instant deadline
) {
}