package com.example.tasktracker.repository;

import com.example.tasktracker.domain.model.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface MealPlanRepository extends JpaRepository<MealPlan, UUID> {
    Optional<MealPlan> findByWeekStartDate(LocalDate weekStartDate);
}