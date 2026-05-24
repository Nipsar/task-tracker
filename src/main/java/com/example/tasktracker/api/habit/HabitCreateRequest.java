package com.example.tasktracker.api.habit;

import jakarta.validation.constraints.NotBlank;

public record HabitCreateRequest(
        @NotBlank String title
) {
}
