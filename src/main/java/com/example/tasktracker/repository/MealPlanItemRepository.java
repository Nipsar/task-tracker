package com.example.tasktracker.repository;

import com.example.tasktracker.domain.model.MealPlan;
import com.example.tasktracker.domain.model.MealPlanItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MealPlanItemRepository extends JpaRepository<MealPlanItem, UUID> {
    List<MealPlanItem> findAllByMealPlanOrderByDayOfWeekAscMealTypeAscPositionAsc(MealPlan mealPlan);
}