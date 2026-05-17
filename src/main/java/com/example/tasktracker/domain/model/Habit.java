package com.example.tasktracker.domain.model;


import com.example.tasktracker.domain.exception.ValidationException;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "habits")
public class Habit {

    @Id
    @UuidGenerator
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(name = "streak_days", nullable = false)
    private int streakDays;

    @Column(name = "best_streak_days", nullable = false)
    private int  bestStreakDays;

    @Column(name = "total_completions", nullable = false)
    private int totalCompletions;

    @Column(name = "last_completed_date")
    private LocalDate lastCompletedDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Habit(){ }

    private Habit(String title, Instant createdAt) {
        this.title = normalizeAndValidateTitle(title);
        this.createdAt = Objects.requireNonNull(createdAt, "createdAt");
        this.streakDays = 0;
        this.bestStreakDays = 0;
        this.totalCompletions = 0;
    }

    public static Habit create(String title, Clock clock){
        Objects.requireNonNull(clock, "clock");
        return new Habit(title, clock.instant());
    }

    public void completeToday(Clock clock) {
        Objects.requireNonNull(clock, "clock");

        LocalDate today = LocalDate.now(clock);
        LocalDate yesterday = today.minusDays(1);

        if (today.equals(lastCompletedDate)) {
            throw new ValidationException("habit.already_completed_today", "habit already completed today");
        }

        if (yesterday.equals(lastCompletedDate)) {
            streakDays += 1;
        } else {
            streakDays = 1;
        }

        bestStreakDays = Math.max(bestStreakDays, streakDays);
        totalCompletions += 1;
        lastCompletedDate = today;
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

    public String getTitle() {
        return title;
    }

    public int getStreakDays() {
        return streakDays;
    }

    public int getBestStreakDays() {
        return bestStreakDays;
    }

    public int getTotalCompletions() {
        return totalCompletions;
    }

    public LocalDate getLastCompletedDate() {
        return lastCompletedDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    private static String normalizeAndValidateTitle(String title) {
        if (title == null) {
            throw new ValidationException("habit.title.null", "title must not be null");
        }

        String normalized = title.trim();

        if (normalized.isEmpty()) {
            throw new ValidationException("habit.title.blank", "title must not be blank");
        }

        return normalized;
    }
}
