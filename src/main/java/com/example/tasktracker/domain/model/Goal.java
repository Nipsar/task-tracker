package com.example.tasktracker.domain.model;

import com.example.tasktracker.domain.exception.ValidationException;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Clock;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "goals")
public class Goal {

    @Id
    @UuidGenerator
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(nullable = false)
    private String title;

    @Column
    private Instant deadline;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Goal() {
        // JPA
    }

    private Goal(UUID projectId, String title, Instant deadline, Instant createdAt) {
        this.projectId = Objects.requireNonNull(projectId, "projectId");
        this.title = normalizeAndValidateTitle(title);
        this.createdAt = Objects.requireNonNull(createdAt, "createdAt");

        if (deadline != null) {
            validateDeadline(deadline, createdAt);
        }

        this.deadline = deadline;
    }

    public static Goal create(UUID projectId, String title, Instant deadline, Clock clock) {
        Objects.requireNonNull(clock, "clock");
        return new Goal(projectId, title, deadline, clock.instant());
    }

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public String getTitle() {
        return title;
    }

    public Instant getDeadline() {
        return deadline;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    private static String normalizeAndValidateTitle(String title) {
        if (title == null) {
            throw new ValidationException("goal.title.null", "title must not be null");
        }

        String normalized = title.trim();

        if (normalized.isEmpty()) {
            throw new ValidationException("goal.title.blank", "title must not be blank");
        }

        return normalized;
    }

    private static void validateDeadline(Instant deadline, Instant now) {
        if (deadline.isBefore(now)) {
            throw new ValidationException("goal.deadline.past", "deadline must be >= now");
        }
    }
}