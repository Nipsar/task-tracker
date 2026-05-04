package com.example.tasktracker.domain.model;

import com.example.tasktracker.domain.exception.ValidationException;

import java.util.Locale;
import java.util.Objects;

public final class Tag {
    private final String name;

    private Tag(String name) {
        this.name = name;
    }

    public static Tag of(String raw) {
        if (raw == null) {
            throw new ValidationException("tag.name.null", "Tag name must not be null");
        }
        String n = raw.trim().toLowerCase(Locale.ROOT);
        if (n.isBlank()) {
            throw new ValidationException("tag.name.blank", "Tag name must not be blank");
        }
        if (n.length() > 30) {
            throw new ValidationException("tag.name.too_long", "Tag name too long (max 30)");
        }
        return new Tag(n);
    }

    public String name() {
        return name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Tag tag)) return false;
        return name.equals(tag.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }

    @Override
    public String toString() {
        return "#" + name;
    }
}
