package com.example.tasktracker.domain.model;

import com.example.tasktracker.domain.exception.ValidationException;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Clock;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @UuidGenerator
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status;

    @Column
    private Instant deadline;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Project() {
    }

    private Project(UUID id, String title, ProjectStatus status, Instant deadline, Instant createdAt) {
        this.id = id;
        this.title = normalizeAndValidateTitle(title);
        this.status = requireStatus(status);
        this.createdAt = Objects.requireNonNull(createdAt, "createdAt");

        if (deadline != null) {
            validateDeadline(deadline, createdAt);
        }

        this.deadline = deadline;
    }

    public static Project create(String title, ProjectStatus status, Instant deadline, Clock clock) {
        Objects.requireNonNull(clock, "clock");

        Instant now = clock.instant();

        return new Project(
                null,
                title,
                status,
                deadline,
                now
        );
    }

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public ProjectStatus getStatus() { return status; }
    public Instant getDeadline() { return deadline; }
    public Instant getCreatedAt() { return createdAt; }

    public void rename(String newTitle) {
        this.title = normalizeAndValidateTitle(newTitle);
    }

    public void changeStatus(ProjectStatus newStatus) {
        this.status = requireStatus(newStatus);
    }

    public void reschedule(Instant newDeadline, Clock clock) {
        Objects.requireNonNull(clock, "clock");

        Instant now = clock.instant();

        if (newDeadline != null) {
            validateDeadline(newDeadline, now);
        }

        this.deadline = newDeadline;
    }

    private static String normalizeAndValidateTitle(String title) {
        if (title == null) {
            throw new ValidationException("project.title.null", "title must not be null");
        }

        String t = title.trim();

        if (t.isEmpty()) {
            throw new ValidationException("project.title.blank", "title must not be blank");
        }

        return t;
    }

    private static ProjectStatus requireStatus(ProjectStatus status) {
        if (status == null) {
            throw new ValidationException("project.status.null", "status must not be null");
        }

        return status;
    }

    private static void validateDeadline(Instant deadline, Instant now) {
        if (deadline.isBefore(now)) {
            throw new ValidationException("project.deadline.past", "deadline must be >= now");
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Project other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

}