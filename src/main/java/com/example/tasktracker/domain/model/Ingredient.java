package com.example.tasktracker.domain.model;

import com.example.tasktracker.domain.exception.ValidationException;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Clock;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "ingredients")
public class Ingredient {

    @Id
    @UuidGenerator
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false, unique = true, length = 160)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_unit", nullable = false, length = 32)
    private MeasurementUnit defaultUnit;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Ingredient() {
        // JPA
    }

    private Ingredient(
            UUID id,
            String name,
            MeasurementUnit defaultUnit,
            Instant createdAt,
            Instant updatedAt
    ) {
        this.id = id;
        this.name = normalizeAndValidateName(name);
        this.defaultUnit = requireUnit(defaultUnit);
        this.createdAt = Objects.requireNonNull(createdAt, "createdAt");
        this.updatedAt = Objects.requireNonNull(updatedAt, "updatedAt");
    }

    public static Ingredient create(String name, MeasurementUnit defaultUnit, Clock clock) {
        Objects.requireNonNull(clock, "clock");
        Instant now = clock.instant();

        return new Ingredient(
                null,
                name,
                defaultUnit,
                now,
                now
        );
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public MeasurementUnit getDefaultUnit() {
        return defaultUnit;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public static String normalizeAndValidateName(String name) {
        if (name == null) {
            throw new ValidationException("ingredient.name.null", "ingredient name must not be null");
        }

        String normalized = name.trim();

        if (normalized.isEmpty()) {
            throw new ValidationException("ingredient.name.blank", "ingredient name must not be blank");
        }

        if (normalized.length() > 160) {
            throw new ValidationException("ingredient.name.too_long", "ingredient name must be <= 160 characters");
        }

        return normalized;
    }

    private static MeasurementUnit requireUnit(MeasurementUnit unit) {
        if (unit == null) {
            throw new ValidationException("ingredient.unit.null", "ingredient unit must not be null");
        }

        return unit;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Ingredient other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}