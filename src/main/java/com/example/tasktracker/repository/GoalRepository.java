package com.example.tasktracker.repository;

import com.example.tasktracker.domain.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GoalRepository extends JpaRepository<Goal, UUID> {
}