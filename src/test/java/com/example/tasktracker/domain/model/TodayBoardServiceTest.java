package com.example.tasktracker.service;

import com.example.tasktracker.api.today.TodayBoardResponse;
import com.example.tasktracker.domain.model.Goal;
import com.example.tasktracker.domain.model.Habit;
import com.example.tasktracker.domain.model.Task;
import com.example.tasktracker.domain.model.TaskStatus;
import com.example.tasktracker.repository.GoalRepository;
import com.example.tasktracker.repository.HabitRepository;
import com.example.tasktracker.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TodayBoardServiceTest {

    private final TaskRepository taskRepository = mock(TaskRepository.class);
    private final HabitRepository habitRepository = mock(HabitRepository.class);
    private final GoalRepository goalRepository = mock(GoalRepository.class);

    private final TodayBoardService todayBoardService = new TodayBoardService(
            taskRepository,
            habitRepository,
            goalRepository
    );

    @Test
    void getTodayBoard_returnsTasksHabitsGoalsAndSummary() {
        LocalDate date = LocalDate.parse("2025-01-02");

        Instant startOfDay = Instant.parse("2025-01-02T00:00:00Z");
        Instant endOfDay = Instant.parse("2025-01-03T00:00:00Z");

        Task overdueTask = task(
                UUID.randomUUID(),
                UUID.randomUUID(),
                null,
                "Overdue task",
                TaskStatus.NEW,
                Instant.parse("2025-01-01T10:00:00Z"),
                Instant.parse("2025-01-01T08:00:00Z"),
                null
        );

        Task dueTodayTask = task(
                UUID.randomUUID(),
                UUID.randomUUID(),
                null,
                "Due today task",
                TaskStatus.NEW,
                Instant.parse("2025-01-02T12:00:00Z"),
                Instant.parse("2025-01-01T08:00:00Z"),
                null
        );

        Task completedTodayTask = task(
                UUID.randomUUID(),
                UUID.randomUUID(),
                null,
                "Completed today task",
                TaskStatus.DONE,
                Instant.parse("2025-01-02T18:00:00Z"),
                Instant.parse("2025-01-01T08:00:00Z"),
                Instant.parse("2025-01-02T09:00:00Z")
        );

        Habit completedHabit = habit(
                UUID.randomUUID(),
                "Read",
                3,
                5,
                10,
                date,
                Instant.parse("2025-01-01T08:00:00Z")
        );

        Habit notCompletedHabit = habit(
                UUID.randomUUID(),
                "Sport",
                1,
                2,
                4,
                date.minusDays(1),
                Instant.parse("2025-01-01T08:00:00Z")
        );

        UUID goalId = UUID.randomUUID();

        Goal goal = goal(
                goalId,
                UUID.randomUUID(),
                "Launch MVP",
                Instant.parse("2025-02-01T00:00:00Z"),
                Instant.parse("2025-01-01T08:00:00Z")
        );

        when(taskRepository.findByDeadlineLessThanAndStatusNot(endOfDay, TaskStatus.DONE))
                .thenReturn(List.of(overdueTask, dueTodayTask));

        when(taskRepository.findByCompletedAtGreaterThanEqualAndCompletedAtLessThanAndStatus(
                startOfDay,
                endOfDay,
                TaskStatus.DONE
        )).thenReturn(List.of(completedTodayTask));

        when(habitRepository.findAll())
                .thenReturn(List.of(completedHabit, notCompletedHabit));

        when(goalRepository.findAll())
                .thenReturn(List.of(goal));

        when(taskRepository.countByGoalId(goalId))
                .thenReturn(4L);

        when(taskRepository.countByGoalIdAndStatus(goalId, TaskStatus.DONE))
                .thenReturn(3L);

        TodayBoardResponse response = todayBoardService.getTodayBoard(date);

        assertEquals(date, response.date());

        assertEquals(3, response.tasks().size());
        assertEquals(2, response.habits().size());
        assertEquals(1, response.goals().size());

        assertEquals(3, response.summary().totalTasks());
        assertEquals(1, response.summary().doneTasks());
        assertEquals(1, response.summary().overdueTasks());

        assertEquals(2, response.summary().totalHabits());
        assertEquals(1, response.summary().completedHabits());

        assertEquals(1, response.summary().totalGoals());

        TodayBoardResponse.GoalItem goalItem = response.goals().getFirst();

        assertEquals(goalId, goalItem.id());
        assertEquals(4L, goalItem.totalTasks());
        assertEquals(3L, goalItem.doneTasks());
        assertEquals(75, goalItem.progressPercent());

        assertTrue(
                response.habits()
                        .stream()
                        .anyMatch(habit -> habit.title().equals("Read") && habit.completedToday())
        );

        assertTrue(
                response.habits()
                        .stream()
                        .anyMatch(habit -> habit.title().equals("Sport") && !habit.completedToday())
        );

        verify(taskRepository).findByDeadlineLessThanAndStatusNot(endOfDay, TaskStatus.DONE);
        verify(taskRepository).findByCompletedAtGreaterThanEqualAndCompletedAtLessThanAndStatus(
                startOfDay,
                endOfDay,
                TaskStatus.DONE
        );
        verify(habitRepository).findAll();
        verify(goalRepository).findAll();
        verify(taskRepository).countByGoalId(goalId);
        verify(taskRepository).countByGoalIdAndStatus(goalId, TaskStatus.DONE);
    }

    private static Task task(
            UUID id,
            UUID projectId,
            UUID goalId,
            String title,
            TaskStatus status,
            Instant deadline,
            Instant createdAt,
            Instant completedAt
    ) {
        Task task = mock(Task.class);

        when(task.getId()).thenReturn(id);
        when(task.getProjectId()).thenReturn(projectId);
        when(task.getGoalId()).thenReturn(goalId);
        when(task.getTitle()).thenReturn(title);
        when(task.getStatus()).thenReturn(status);
        when(task.getDeadline()).thenReturn(deadline);
        when(task.getCreatedAt()).thenReturn(createdAt);
        when(task.getCompletedAt()).thenReturn(completedAt);

        return task;
    }

    private static Habit habit(
            UUID id,
            String title,
            int streakDays,
            int bestStreakDays,
            int totalCompletions,
            LocalDate lastCompletedDate,
            Instant createdAt
    ) {
        Habit habit = mock(Habit.class);

        when(habit.getId()).thenReturn(id);
        when(habit.getTitle()).thenReturn(title);
        when(habit.getStreakDays()).thenReturn(streakDays);
        when(habit.getBestStreakDays()).thenReturn(bestStreakDays);
        when(habit.getTotalCompletions()).thenReturn(totalCompletions);
        when(habit.getLastCompletedDate()).thenReturn(lastCompletedDate);
        when(habit.getCreatedAt()).thenReturn(createdAt);

        return habit;
    }

    private static Goal goal(
            UUID id,
            UUID projectId,
            String title,
            Instant deadline,
            Instant createdAt
    ) {
        Goal goal = mock(Goal.class);

        when(goal.getId()).thenReturn(id);
        when(goal.getProjectId()).thenReturn(projectId);
        when(goal.getTitle()).thenReturn(title);
        when(goal.getDeadline()).thenReturn(deadline);
        when(goal.getCreatedAt()).thenReturn(createdAt);

        return goal;
    }
}