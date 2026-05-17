package com.example.tasktracker.api;

import com.example.tasktracker.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping("/api/goals")
    public List<GoalResponse> getGoals() {
        return goalService.findAll();
    }

    @GetMapping("/api/goals/{goalId}")
    public GoalResponse getGoal(@PathVariable UUID goalId) {
        return goalService.findById(goalId);
    }

    @PostMapping("/api/goals")
    public GoalResponse createGoal(@Valid @RequestBody GoalCreateRequest request) {
        return goalService.create(request);
    }
}