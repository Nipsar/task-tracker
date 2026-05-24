package com.example.tasktracker.api.habit;

import com.example.tasktracker.domain.model.Habit;
import com.example.tasktracker.service.HabitService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class HabitController {

    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    @GetMapping("/api/habits")
    public List<HabitResponse> getHabits() {
        return habitService.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping("/api/habits")
    public HabitResponse createHabit(@Valid @RequestBody HabitCreateRequest request) {
        Habit habit = habitService.create(request);
        return toResponse(habit);
    }

    @PostMapping("/api/habits/{habitId}/complete")
    public HabitResponse completeHabit(@PathVariable UUID habitId) {
        Habit habit = habitService.completeToday(habitId);
        return toResponse(habit);
    }

    private HabitResponse toResponse(Habit habit) {
        return new HabitResponse(
                habit.getId(),
                habit.getTitle(),
                habit.getStreakDays(),
                habit.getBestStreakDays(),
                habit.getTotalCompletions(),
                habit.getLastCompletedDate(),
                habit.getCreatedAt()
        );
    }
}