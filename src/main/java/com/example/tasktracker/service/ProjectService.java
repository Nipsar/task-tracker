package com.example.tasktracker.service;

import com.example.tasktracker.api.ProjectCreateRequest;
import com.example.tasktracker.domain.exception.NotFoundException;
import com.example.tasktracker.domain.model.Project;
import com.example.tasktracker.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.util.List;
import java.util.UUID;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final Clock clock;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
        this.clock = Clock.systemUTC();
    }

    public List<Project> findAll() {
        return projectRepository.findAll();
    }

    public Project findById(UUID projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found: " + projectId));
    }

    public Project create(ProjectCreateRequest request) {
        Project project = Project.create(
                request.title(),
                request.status(),
                request.deadline(),
                clock
        );

        return projectRepository.save(project);
    }
}