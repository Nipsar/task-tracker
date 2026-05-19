package com.example.tasktracker.api.habit;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record HabitResponse(
        UUID id,
        String title,
        int streakDays,
        int bestStreakDays,
        int totalCompletions,
        LocalDate lastCompletedDate,
        Instant createdAt
) {
}