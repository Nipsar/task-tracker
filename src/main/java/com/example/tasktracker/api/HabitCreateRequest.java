package com.example.tasktracker.api;

import jakarta.validation.constraints.NotBlank;

public record HabitCreateRequest(
        @NotBlank String title
) {
}
