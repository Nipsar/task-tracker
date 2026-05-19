package com.example.tasktracker.domain.model;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Constructor;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class EqualsHashCodeContractTest {

    @Test
    void task_equalsHashCode_contract() throws Exception {
        UUID id = UUID.randomUUID();
        Instant createdAt = Instant.parse("2025-01-01T00:00:00Z");

        Task a = newTask(
                id,
                UUID.randomUUID(),
                null,
                "A",
                null,
                TaskStatus.NEW,
                createdAt
        );

        Task b = newTask(
                id,
                UUID.randomUUID(),
                null,
                "B",
                null,
                TaskStatus.DONE,
                createdAt
        );

        assertTrue(a.equals(a));
        assertTrue(a.equals(b));
        assertEquals(a.hashCode(), b.hashCode());

        Task c = newTask(
                UUID.randomUUID(),
                UUID.randomUUID(),
                null,
                "A",
                null,
                TaskStatus.NEW,
                createdAt
        );

        assertNotEquals(a, c);
    }

    @Test
    void project_equalsHashCode_contract() throws Exception {
        UUID id = UUID.randomUUID();
        Instant createdAt = Instant.parse("2025-01-01T00:00:00Z");

        Project a = newProject(
                id,
                "A",
                ProjectStatus.NEW,
                null,
                createdAt
        );

        Project b = newProject(
                id,
                "B",
                ProjectStatus.DONE,
                null,
                createdAt
        );

        assertTrue(a.equals(a));
        assertTrue(a.equals(b));
        assertEquals(a.hashCode(), b.hashCode());

        Project c = newProject(
                UUID.randomUUID(),
                "A",
                ProjectStatus.NEW,
                null,
                createdAt
        );

        assertNotEquals(a, c);
    }

    private static Task newTask(
            UUID id,
            UUID projectId,
            UUID goalId,
            String title,
            Instant deadline,
            TaskStatus status,
            Instant createdAt
    ) throws Exception {
        Constructor<Task> ctor = Task.class.getDeclaredConstructor(
                UUID.class,
                UUID.class,
                UUID.class,
                String.class,
                Instant.class,
                TaskStatus.class,
                Instant.class
        );

        ctor.setAccessible(true);

        return ctor.newInstance(
                id,
                projectId,
                goalId,
                title,
                deadline,
                status,
                createdAt
        );
    }

    private static Project newProject(
            UUID id,
            String title,
            ProjectStatus status,
            Instant deadline,
            Instant createdAt
    ) throws Exception {
        Constructor<Project> ctor = Project.class.getDeclaredConstructor(
                UUID.class,
                String.class,
                ProjectStatus.class,
                Instant.class,
                Instant.class
        );

        ctor.setAccessible(true);

        return ctor.newInstance(
                id,
                title,
                status,
                deadline,
                createdAt
        );
    }
}