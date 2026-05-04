package com.example.tasktracker.domain.model;

import com.example.tasktracker.domain.exception.ValidationException;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;

class CommentInvariantTest {

    private static Clock fixedClock(Instant now) {
        return Clock.fixed(now, ZoneOffset.UTC);
    }

    @Test
    void blankText_throwsValidationException() {
        Instant now = Instant.parse("2026-01-01T00:00:00Z");
        Clock clock = fixedClock(now);

        ValidationException ex = assertThrows( ValidationException.class, () -> Comment.create(" ", clock));
        assertEquals("comment.text.blank", ex.getCode());
    }
}
