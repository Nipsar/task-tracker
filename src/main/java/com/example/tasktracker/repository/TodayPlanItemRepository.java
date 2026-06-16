package com.example.tasktracker.repository;

import com.example.tasktracker.domain.model.TodayPlanItem;
import com.example.tasktracker.domain.model.TodayPlanItemStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface TodayPlanItemRepository extends JpaRepository<TodayPlanItem, UUID> {

    boolean existsByPlannedDate(LocalDate plannedDate);

    @EntityGraph(attributePaths = "task")
    List<TodayPlanItem> findByPlannedDate(LocalDate plannedDate);

    @EntityGraph(attributePaths = "task")
    List<TodayPlanItem> findByPlannedDateAndStatus(
            LocalDate plannedDate,
            TodayPlanItemStatus status
    );

    @EntityGraph(attributePaths = "task")
    List<TodayPlanItem> findByMovedToDateAndStatus(
            LocalDate movedToDate,
            TodayPlanItemStatus status
    );
}