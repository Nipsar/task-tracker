package com.example.tasktracker.api;

import com.example.tasktracker.domain.model.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record TaskStatusUpdateRequest(
        @NotNull TaskStatus status
) {
}