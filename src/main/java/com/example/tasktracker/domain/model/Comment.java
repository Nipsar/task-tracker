package com.example.tasktracker.domain.model;

import com.example.tasktracker.domain.exception.ValidationException;

import java.time.Clock;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public final class Comment {
    private final UUID id;
    private final String text;
    private final Instant createdAt;

    private Comment(UUID id, String text, Instant createdAt){
        this.id = Objects.requireNonNull(id, "id");
        this.text = requireNonBlank(text, "text");
        this.createdAt = Objects.requireNonNull(createdAt, "createdAt");
    }

    public static Comment create(String text, Clock clock){
        Objects.requireNonNull(clock, "clock");
        Instant now = clock.instant();

        return new Comment(UUID.randomUUID(), text, now);
    }

    public UUID id() { return id; }
    public String text() { return text; }
    public Instant createdAt() { return createdAt; }

    private static String requireNonBlank(String v, String field) {
        if (v == null) {
            throw new ValidationException("comment." + field + ".null", field + " must not be null");
        }
        if (v.isBlank()) {
            throw new ValidationException("comment." + field + ".blank", field + " must not be blank");
        }
        return v.trim();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!( o instanceof Comment c)) return false;
        return  id.equals(c.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
