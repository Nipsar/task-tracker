package com.example.tasktracker.repository;

import com.example.tasktracker.domain.model.Habit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface HabitRepository extends JpaRepository<Habit, UUID> {
}
