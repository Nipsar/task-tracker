package com.example.tasktracker.domain.model;

import com.example.tasktracker.domain.exception.ValidationException;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Clock;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @UuidGenerator
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "project_id")
    private UUID projectId;

    @Column(name = "goal_id")
    private UUID goalId;

    @Column(nullable = false)
    private String title;

    @Column
    private Instant deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskImportance importance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskDifficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskEnergy energy;

    @Column(name = "estimated_minutes", nullable = false)
    private Integer estimatedMinutes;

    @Column(name = "auto_plan_enabled", nullable = false)
    private Boolean autoPlanEnabled;

    protected Task() {
        // JPA
    }

    private Task(
            UUID id,
            UUID projectId,
            UUID goalId,
            String title,
            Instant deadline,
            TaskStatus status,
            Instant createdAt,
            TaskImportance importance,
            TaskDifficulty difficulty,
            TaskEnergy energy,
            Integer estimatedMinutes,
            Boolean autoPlanEnabled
    ) {
        this.id = id;
        this.projectId = projectId;
        this.goalId = goalId;
        this.createdAt = Objects.requireNonNull(createdAt, "createdAt");
        this.title = normalizeAndValidateTitle(title);
        this.status = requireStatus(status);
        this.importance = requireImportance(importance);
        this.difficulty = requireDifficulty(difficulty);
        this.energy = requireEnergy(energy);
        this.estimatedMinutes = requirePositiveEstimatedMinutes(estimatedMinutes);
        this.autoPlanEnabled = autoPlanEnabled != null ? autoPlanEnabled : true;


        if (deadline != null) {
            validateDeadline(deadline, createdAt);
        }

        this.deadline = deadline;
    }

    public static Task create(
            UUID projectId,
            UUID goalId,
            String title,
            Instant deadline,
            TaskStatus status,
            TaskImportance importance,
            TaskDifficulty difficulty,
            TaskEnergy energy,
            Integer estimatedMinutes,
            Boolean autoPlanEnabled,
            Clock clock
    ) {
        Objects.requireNonNull(clock, "clock");
        Instant now = clock.instant();

        String normalizedTitle = normalizeAndValidateTitle(title);
        TaskStatus st = requireStatus(status);
        TaskImportance ti = requireImportance(importance);
        TaskDifficulty td = requireDifficulty(difficulty);
        TaskEnergy te = requireEnergy(energy);
        Integer em = requirePositiveEstimatedMinutes(estimatedMinutes);
        boolean ape = autoPlanEnabled != null ? autoPlanEnabled : true;

        if (deadline != null) {
            validateDeadline(deadline, now);
        }

        return new Task(null, projectId, goalId, normalizedTitle, deadline, st, now, ti, td, te, em, ape);
    }

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public UUID getId() { return id; }
    public UUID getProjectId() { return projectId; }
    public Instant getCreatedAt() { return createdAt; }
    public String getTitle() { return title; }
    public Instant getDeadline() { return deadline; }
    public TaskStatus getStatus() { return status; }
    public Instant getCompletedAt() { return completedAt; }
    public UUID getGoalId() { return goalId; }
    public TaskImportance getImportance() { return importance; }
    public TaskDifficulty getDifficulty() { return difficulty; }
    public TaskEnergy getEnergy() { return energy; }
    public Integer getEstimatedMinutes() { return estimatedMinutes; }
    public Boolean getAutoPlanEnabled() { return autoPlanEnabled; }

    public void rename(String newTitle) {
        this.title = normalizeAndValidateTitle(newTitle);
    }
    public void rename(Integer newEstimatedMinutes) { this.estimatedMinutes = requirePositiveEstimatedMinutes(newEstimatedMinutes); }

    public void changeStatus(TaskStatus newStatus, Clock clock) {
        Objects.requireNonNull(clock, "clock");

        TaskStatus validatedStatus = requireStatus(newStatus);
        Instant now = clock.instant();

        if (this.status != TaskStatus.DONE && validatedStatus == TaskStatus.DONE) {
            this.completedAt = now;
        } else if (this.status == TaskStatus.DONE && validatedStatus != TaskStatus.DONE) {
            this.completedAt = null;
        }

        this.status = validatedStatus;
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
        if (title == null) throw new ValidationException("task.title.null", "title must not be null");
        String t = title.trim();
        if (t.isEmpty()) throw new ValidationException("task.title.blank", "title must not be blank");
        return t;
    }

    private static TaskStatus requireStatus(TaskStatus status) {
        if (status == null) throw new ValidationException("task.status.null", "status must not be null");
        return status;
    }

    private static void validateDeadline(Instant deadline, Instant now) {
        if (deadline == null) throw new ValidationException("task.deadline.null", "deadline must not be null");
        if (deadline.isBefore(now)) {
            throw new ValidationException("task.deadline.past", "deadline must be >= now");
        }
    }

    private static TaskImportance requireImportance(TaskImportance importance) {
        if (importance == null) throw new ValidationException("task.importance.null", "importance must not be null");
        return importance;
    }

    private static TaskDifficulty requireDifficulty(TaskDifficulty difficulty) {
        if (difficulty == null) throw new ValidationException("task.difficulty.null", "difficulty must not be null");
        return difficulty;
    }

    private static TaskEnergy requireEnergy(TaskEnergy energy) {
        if (energy == null) throw new ValidationException("task.energy.null", "energy must not be null");
        return energy;
    }

    private static Integer requirePositiveEstimatedMinutes(Integer estimatedMinutes) {
        if (estimatedMinutes == null) {
            throw new ValidationException("task.estimatedMinutes.null", "estimatedMinutes must not be null");
        }
        if (estimatedMinutes <= 0) {
            throw new ValidationException("task.estimatedMinutes.notPositive", "estimatedMinutes must be positive");
        }
        return estimatedMinutes;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Task other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
