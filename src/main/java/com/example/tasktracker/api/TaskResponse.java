package com.example.tasktracker.api;

import com.example.tasktracker.domain.model.TaskStatus;
import jakarta.persistence.criteria.CriteriaBuilder;

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
        Instant completedAt
) {
}