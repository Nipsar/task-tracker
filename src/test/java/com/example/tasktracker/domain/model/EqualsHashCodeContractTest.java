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

        Task a = newTask(id, UUID.randomUUID(), "A", null, TaskStatus.NEW, createdAt);
        Task b = newTask(id, UUID.randomUUID(), "B", null, TaskStatus.DONE, createdAt);

        assertTrue(a.equals(a));
        assertTrue(a.equals(b));
        assertEquals(a.hashCode(), b.hashCode());

        Task c = newTask(UUID.randomUUID(), UUID.randomUUID(), "A", null, TaskStatus.NEW, createdAt);
        assertNotEquals(a, c);
    }

    @Test
    void project_equalsHashCode_contract() throws Exception {
        UUID id = UUID.randomUUID();
        Instant createdAt = Instant.parse("2025-01-01T00:00:00Z");

        Project a = newProject(id, createdAt, "A", null, ProjectStatus.NEW);
        Project b = newProject(id, createdAt, "B", null, ProjectStatus.DONE);

        assertTrue(a.equals(a));
        assertTrue(a.equals(b));
        assertEquals(a.hashCode(), b.hashCode());

        Project c = newProject(UUID.randomUUID(), createdAt, "A", null, ProjectStatus.NEW);
        assertNotEquals(a, c);
    }

    private static Task newTask(UUID id, UUID projectId, String title, Instant deadline, TaskStatus status, Instant createdAt) throws Exception {
        Constructor<Task> ctor = Task.class.getDeclaredConstructor(
                UUID.class, UUID.class, String.class, Instant.class, TaskStatus.class, Instant.class
        );
        ctor.setAccessible(true);
        return ctor.newInstance(id, projectId, title, deadline, status, createdAt);
    }

    private static Project newProject(UUID id, Instant createdAt, String title, Instant deadline, ProjectStatus status) throws Exception {
        Constructor<Project> ctor = Project.class.getDeclaredConstructor(
                UUID.class, Instant.class, String.class, Instant.class, ProjectStatus.class
        );
        ctor.setAccessible(true);
        return ctor.newInstance(id, createdAt, title, deadline, status);
    }
}