package com.example.tasktracker.domain.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "today_plan_items")
public class TodayPlanItem {

    @Id
    @UuidGenerator
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Column(name = "planned_date", nullable = false)
    private LocalDate plannedDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TodayPlanItemStatus status;

    @Column(name = "moved_to_date")
    private LocalDate movedToDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected TodayPlanItem() {
        // JPA
    }

    private TodayPlanItem(
            UUID id,
            Task task,
            LocalDate plannedDate,
            TodayPlanItemStatus status,
            LocalDate movedToDate,
            Instant createdAt
    ) {
        this.id = id;
        this.task = Objects.requireNonNull(task, "task");
        this.plannedDate = Objects.requireNonNull(plannedDate, "plannedDate");
        this.status = Objects.requireNonNull(status, "status");
        this.movedToDate = movedToDate;
        this.createdAt = Objects.requireNonNull(createdAt, "createdAt");
    }

    public void markDone() {
        this.status = TodayPlanItemStatus.DONE;
        this.movedToDate = null;
    }

    public void moveToTomorrow(LocalDate tomorrow) {
        this.status = TodayPlanItemStatus.MOVED;
        this.movedToDate = Objects.requireNonNull(tomorrow, "tomorrow");
    }

    public static TodayPlanItem planned(Task task, LocalDate plannedDate, Clock clock) {
        Objects.requireNonNull(clock, "clock");

        return new TodayPlanItem(
                null,
                task,
                plannedDate,
                TodayPlanItemStatus.PLANNED,
                null,
                clock.instant()
        );
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

    public Task getTask() {
        return task;
    }

    public LocalDate getPlannedDate() {
        return plannedDate;
    }

    public TodayPlanItemStatus getStatus() {
        return status;
    }

    public LocalDate getMovedToDate() {
        return movedToDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}