package com.example.tasktracker.repository;

import com.example.tasktracker.domain.model.Task;
import com.example.tasktracker.domain.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    long countByGoalId(UUID goalId);

    long countByGoalIdAndStatus(UUID goalId, TaskStatus status);
}