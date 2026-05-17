package com.example.tasktracker.service;

import com.example.tasktracker.api.TaskCreateRequest;
import com.example.tasktracker.domain.exception.NotFoundException;
import com.example.tasktracker.domain.model.Task;
import com.example.tasktracker.domain.model.TaskStatus;
import com.example.tasktracker.repository.ProjectRepository;
import com.example.tasktracker.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.util.List;
import java.util.UUID;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final Clock clock;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.clock = Clock.systemUTC();
    }

    public List<Task> findAll() {
        return taskRepository.findAll();
    }

    public Task create(TaskCreateRequest request) {
        projectRepository.findById(request.projectId())
                .orElseThrow(() -> new NotFoundException("Project not found: " + request.projectId()));

        Task task = Task.create(
                request.projectId(),
                request.goalId(),
                request.title(),
                request.deadline(),
                request.status(),
                clock
        );

        return taskRepository.save(task);
    }

    public Task changeStatus(UUID taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found: " + taskId));

        task.changeStatus(newStatus, clock);

        return taskRepository.save(task);
    }

    public void delete(UUID taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new NotFoundException("Task not found: " + taskId);
        }

        taskRepository.deleteById(taskId);
    }

}
