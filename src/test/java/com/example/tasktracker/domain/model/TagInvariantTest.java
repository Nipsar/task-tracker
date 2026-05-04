package com.example.tasktracker.domain.model;

import com.example.tasktracker.domain.exception.ValidationException;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TagInvariantTest {

    @Test
    void nullName_throwsValidationException() {
        ValidationException ex = assertThrows(ValidationException.class, () -> Tag.of(null));
    }

    @Test
    void blankName_throwsValidationException() {
        ValidationException ex = assertThrows(ValidationException.class, () -> Tag.of(" "));
    }

    @Test
    void tooLongName_throwsValidationException() {
        String longName = "a".repeat(31); // max=30
        ValidationException ex = assertThrows(ValidationException.class, () -> Tag.of(longName));
        assertEquals("tag.name.too_long", ex.getCode());
    }
}
