package com.example.tasktracker.repository;

import com.example.tasktracker.domain.model.Task;
import com.example.tasktracker.domain.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    long countByGoalId(UUID goalId);

    long countByGoalIdAndStatus(UUID goalId, TaskStatus status);

    List<Task> findByDeadlineLessThanAndStatusNot(
            Instant deadline,
            TaskStatus status
    );

    List<Task> findByCompletedAtGreaterThanEqualAndCompletedAtLessThanAndStatus(
            Instant start,
            Instant end,
            TaskStatus status
    );

    List<Task> findByStatusNotAndAutoPlanEnabledTrue(TaskStatus status);
}