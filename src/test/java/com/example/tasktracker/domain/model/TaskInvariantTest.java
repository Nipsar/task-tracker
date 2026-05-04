package com.example.tasktracker.domain.model;

import com.example.tasktracker.domain.exception.ValidationException;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class TaskInvariantTest {

    private static Clock fixedClock(Instant now) {
        return Clock.fixed(now, ZoneOffset.UTC);
    }

    @Test
    void blankTitle_throwsValidationException() {
        Instant now = Instant.parse("2025-01-01T00:00:00Z");
        Clock clock = fixedClock(now);

        ValidationException ex = assertThrows(
                ValidationException.class,
                () -> Task.create(UUID.randomUUID(), "   ", now.plusSeconds(60), TaskStatus.NEW, clock)
        );

        assertEquals("task.title.blank", ex.getCode());
    }

    @Test
    void deadlineBeforeNow_throwsValidationException() {
        Instant now = Instant.parse("2025-01-01T00:00:00Z");
        Clock clock = fixedClock(now);

        ValidationException ex = assertThrows(
                ValidationException.class,
                () -> Task.create(UUID.randomUUID(), "Ok", now.minusSeconds(1), TaskStatus.NEW, clock)
        );

        assertEquals("task.deadline.past", ex.getCode());
    }

    @Test
    void nullStatus_throwsValidationException() {
        Instant now = Instant.parse("2025-01-01T00:00:00Z");
        Clock clock = fixedClock(now);

        ValidationException ex = assertThrows(
                ValidationException.class,
                () -> Task.create(UUID.randomUUID(), "Ok", now.plusSeconds(60), null, clock)
        );

        assertEquals("task.status.null", ex.getCode());
    }
}
