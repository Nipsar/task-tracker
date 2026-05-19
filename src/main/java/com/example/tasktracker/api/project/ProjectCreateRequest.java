package com.example.tasktracker.api.project;

import com.example.tasktracker.domain.model.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record ProjectCreateRequest(
        @NotBlank String title,
        @NotNull ProjectStatus status,
        Instant deadline
) {
}