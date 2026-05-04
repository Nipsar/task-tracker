package com.example.tasktracker.api;

import com.example.tasktracker.domain.model.Task;
import com.example.tasktracker.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;
import java.util.UUID;

@RestController
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/api/tasks")
    public List<TaskResponse> getTasks() {
        return taskService.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping("/api/tasks")
    public TaskResponse createTask(@Valid @RequestBody com.example.tasktracker.api.TaskCreateRequest request) {
        Task task = taskService.create(request);
        return toResponse(task);
    }

    @PatchMapping("/api/tasks/{taskId}/status")
    public TaskResponse changeTaskStatus(
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskStatusUpdateRequest request
    ) {
        Task task = taskService.changeStatus(taskId, request.status());
        return toResponse(task);
    }

    private TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getProjectId(),
                task.getTitle(),
                task.getStatus(),
                task.getDeadline(),
                task.getCreatedAt(),
                task.getCompletedAt()
        );
    }

    @DeleteMapping("/api/tasks/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable UUID taskId) {
        taskService.delete(taskId);
    }

}