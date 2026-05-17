package com.example.tasktracker.service;

import com.example.tasktracker.api.GoalCreateRequest;
import com.example.tasktracker.api.GoalResponse;
import com.example.tasktracker.domain.exception.NotFoundException;
import com.example.tasktracker.domain.model.Goal;
import com.example.tasktracker.domain.model.TaskStatus;
import com.example.tasktracker.repository.GoalRepository;
import com.example.tasktracker.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.util.List;
import java.util.UUID;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final TaskRepository taskRepository;
    private final Clock clock;

    public GoalService(GoalRepository goalRepository, TaskRepository taskRepository) {
        this.goalRepository = goalRepository;
        this.taskRepository = taskRepository;
        this.clock = Clock.systemUTC();
    }

    public List<GoalResponse> findAll() {
        return goalRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public GoalResponse create(GoalCreateRequest request) {
        Goal goal = Goal.create(
                request.projectId(),
                request.title(),
                request.deadline(),
                clock
        );

        Goal savedGoal = goalRepository.save(goal);

        return toResponse(savedGoal);
    }

    public GoalResponse findById(UUID goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new NotFoundException("Goal not found: " + goalId));

        return toResponse(goal);
    }

    private GoalResponse toResponse(Goal goal) {
        long totalTasks = taskRepository.countByGoalId(goal.getId());
        long doneTasks = taskRepository.countByGoalIdAndStatus(goal.getId(), TaskStatus.DONE);

        int progressPercent = totalTasks == 0
                ? 0
                : (int) Math.round((doneTasks * 100.0) / totalTasks);

        return new GoalResponse(
                goal.getId(),
                goal.getProjectId(),
                goal.getTitle(),
                goal.getDeadline(),
                goal.getCreatedAt(),
                totalTasks,
                doneTasks,
                progressPercent
        );
    }
}