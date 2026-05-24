package com.example.tasktracker.api.task;

import com.example.tasktracker.domain.model.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record TaskStatusUpdateRequest(
        @NotNull TaskStatus status
) {
}