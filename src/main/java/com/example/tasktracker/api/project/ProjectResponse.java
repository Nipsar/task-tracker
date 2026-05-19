package com.example.tasktracker.api.project;

import com.example.tasktracker.domain.model.ProjectStatus;

import java.time.Instant;
import java.util.UUID;

public record ProjectResponse(
        UUID id,
        String title,
        ProjectStatus status,
        Instant deadline,
        Instant createdAt
) {
}