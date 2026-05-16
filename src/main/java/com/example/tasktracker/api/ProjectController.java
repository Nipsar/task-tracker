package com.example.tasktracker.api;

import com.example.tasktracker.domain.model.Project;
import com.example.tasktracker.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping("/api/projects")
    public List<ProjectResponse> getProjects() {
        return projectService.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/api/projects/{projectId}")
    public ProjectResponse getProjectById(@PathVariable UUID projectId) {
        return toResponse(projectService.findById(projectId));
    }

    @PostMapping("/api/projects")
    public ProjectResponse createProject(@Valid @RequestBody ProjectCreateRequest request) {
        Project project = projectService.create(request);
        return toResponse(project);
    }

    private ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getStatus(),
                project.getDeadline(),
                project.getCreatedAt()
        );
    }
}