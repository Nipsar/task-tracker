package com.example.tasktracker.domain.model;

import com.example.tasktracker.domain.exception.ValidationException;

import java.time.Clock;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public final class Project {

    private final UUID id;
    private final Instant createdAt;

    private String title;
    private Instant deadline;
    private ProjectStatus status;

    private Project(UUID id, Instant createdAt, String title, Instant deadline, ProjectStatus status){

        this.id = Objects.requireNonNull(id);
        this.createdAt = Objects.requireNonNull(createdAt);

        this.title = normalizeAndValidateTitle(title);
        this.status = requireStatus(status);

        if (deadline != null){
            validateDeadline(deadline, createdAt);
        }
        this.deadline = deadline;
    }

    public static Project create( Clock clock, String title, Instant deadline, ProjectStatus status){
        Objects.requireNonNull(clock, "clock" );
        Instant now = clock.instant();

        String normalizedTitle = normalizeAndValidateTitle(title);
        ProjectStatus st = requireStatus(status);

        if (deadline != null) {
            validateDeadline(deadline, now);
        }

        return new Project(UUID.randomUUID(), now, normalizedTitle, deadline, st);

    }

    public UUID getId() { return id; }
    public Instant getCreatedAt() { return createdAt; }
    public String getTitle() { return title; }
    public Instant getDeadline() { return deadline; }
    public ProjectStatus getStatus() { return status; }

    public void rename(String newTitle){
        this.title = normalizeAndValidateTitle(newTitle);
    }

    public void changeStatus(ProjectStatus newStatus){
        this.status = requireStatus(newStatus);
    }

    public void reschedule(Instant newDeadline, Clock clock){
        Objects.requireNonNull(clock, "clock");
        Instant now = clock.instant();

        if (newDeadline != null) {
            validateDeadline(newDeadline, now);
        }
        this.deadline = newDeadline;
    }

    private static String normalizeAndValidateTitle(String title) {
        if (title == null) throw new ValidationException("project.title.null", "title must not be null");
        String t = title.trim();
        if (t.isEmpty()) throw new ValidationException("project.title.blank", "title must not be blank");
        return t;
    }

    private static ProjectStatus requireStatus(ProjectStatus status) {
        if (status == null) throw new ValidationException("project.status.null", "status must not be null");
        return status;
    }

    private static void validateDeadline(Instant deadline, Instant now) {
        if (deadline == null) throw new ValidationException("project.deadline.null", "deadline must not be null");
        if (deadline.isBefore(now)) {
            throw new ValidationException("project.deadline.past", "deadline must be >= now");
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Project other)) return false;
        return id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }

    @Override
    public String toString() {
        return "Project{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", status=" + status +
                ", createdAt=" + createdAt +
                ", deadline=" + deadline +
                '}';
    }
}
