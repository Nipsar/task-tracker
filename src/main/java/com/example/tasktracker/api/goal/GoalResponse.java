package com.example.tasktracker.api.goal;

import java.time.Instant;
import java.util.UUID;

public record GoalResponse(
        UUID id,
        UUID projectId,
        String title,
        Instant deadline,
        Instant createdAt,
        long totalTasks,
        long doneTasks,
        int progressPercent
) {
}