package com.example.tasktracker.service;

import com.example.tasktracker.api.today.TodayBoardResponse;
import com.example.tasktracker.domain.model.Goal;
import com.example.tasktracker.domain.model.Habit;
import com.example.tasktracker.domain.model.Project;
import com.example.tasktracker.domain.model.Task;
import com.example.tasktracker.domain.model.TaskStatus;
import com.example.tasktracker.domain.model.TodayPlanItemStatus;
import com.example.tasktracker.repository.GoalRepository;
import com.example.tasktracker.repository.HabitRepository;
import com.example.tasktracker.repository.ProjectRepository;
import com.example.tasktracker.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class TodayBoardService {

    private final TaskRepository taskRepository;
    private final HabitRepository habitRepository;
    private final GoalRepository goalRepository;
    private final ProjectRepository projectRepository;
    private final Clock clock;

    public TodayBoardService(
            TaskRepository taskRepository,
            HabitRepository habitRepository,
            GoalRepository goalRepository,
            ProjectRepository projectRepository
    ) {
        this.taskRepository = taskRepository;
        this.habitRepository = habitRepository;
        this.goalRepository = goalRepository;
        this.projectRepository = projectRepository;
        this.clock = Clock.systemUTC();
    }

    @Transactional(readOnly = true)
    public TodayBoardResponse getTodayBoard() {
        LocalDate today = LocalDate.now(clock);

        Instant startOfDay = today.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant endOfDay = today.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        List<Task> activeDueTasks = taskRepository.findByDeadlineLessThanAndStatusNot(
                endOfDay,
                TaskStatus.DONE
        );

        List<Task> completedTodayTasks = taskRepository
                .findByCompletedAtGreaterThanEqualAndCompletedAtLessThanAndStatus(
                        startOfDay,
                        endOfDay,
                        TaskStatus.DONE
                );

        List<Task> todayTasks = mergeTasks(activeDueTasks, completedTodayTasks);
        List<Habit> habits = habitRepository.findAll();
        List<Goal> goals = goalRepository.findAll();

        Map<UUID, String> projectTitlesById = loadProjectTitles(todayTasks, goals);

        List<TodayBoardResponse.TaskItem> taskItems = todayTasks.stream()
                .map(task -> toTaskItem(task, today))
                .sorted(Comparator
                        .comparing(
                                TodayBoardResponse.TaskItem::deadline,
                                Comparator.nullsLast(Comparator.naturalOrder())
                        )
                        .thenComparing(TodayBoardResponse.TaskItem::title)
                )
                .toList();

        List<TodayBoardResponse.HabitItem> habitItems = habits.stream()
                .map(habit -> toHabitItem(habit, today))
                .sorted(Comparator.comparing(TodayBoardResponse.HabitItem::title))
                .toList();

        List<TodayBoardResponse.GoalItem> goalItems = goals.stream()
                .map(goal -> toGoalItem(goal, projectTitlesById))
                .sorted(Comparator.comparing(TodayBoardResponse.GoalItem::title))
                .toList();

        TodayBoardResponse.Summary summary = buildSummary(
                today,
                taskItems,
                habitItems,
                goalItems
        );

        return new TodayBoardResponse(
                today,
                taskItems,
                habitItems,
                goalItems,
                summary
        );
    }

    private List<Task> mergeTasks(
            List<Task> activeDueTasks,
            List<Task> completedTodayTasks
    ) {
        Map<UUID, Task> tasksById = new LinkedHashMap<>();

        Stream.concat(activeDueTasks.stream(), completedTodayTasks.stream())
                .forEach(task -> tasksById.put(task.getId(), task));

        return new ArrayList<>(tasksById.values());
    }

    private Map<UUID, String> loadProjectTitles(
            List<Task> tasks,
            List<Goal> goals
    ) {
        List<UUID> projectIds = Stream.concat(
                        tasks.stream().map(Task::getProjectId),
                        goals.stream().map(Goal::getProjectId)
                )
                .filter(projectId -> projectId != null)
                .distinct()
                .toList();

        if (projectIds.isEmpty()) {
            return Map.of();
        }

        return projectRepository.findAllById(projectIds)
                .stream()
                .collect(Collectors.toMap(
                        Project::getId,
                        Project::getTitle,
                        (left, right) -> left
                ));
    }

    private TodayBoardResponse.TaskItem toTaskItem(
            Task task,
            LocalDate today
    ) {
        return new TodayBoardResponse.TaskItem(
                null,                         // todayPlanItemId: старый сервис не работает с today_plan_items
                task.getId(),                 // taskId
                task.getProjectId(),          // projectId
                task.getGoalId(),             // goalId
                task.getTitle(),              // title
                task.getStatus(),             // taskStatus
                task.getDeadline(),           // deadline

                task.getImportance(),         // importance
                task.getDifficulty(),         // difficulty
                task.getEnergy(),             // energy
                task.getEstimatedMinutes(),   // estimatedMinutes
                task.getAutoPlanEnabled(),    // autoPlanEnabled

                TodayPlanItemStatus.PLANNED,  // planStatus
                today,                        // plannedDate
                0                             // score
        );
    }

    private TodayBoardResponse.HabitItem toHabitItem(
            Habit habit,
            LocalDate today
    ) {
        boolean completedToday = today.equals(habit.getLastCompletedDate());

        return new TodayBoardResponse.HabitItem(
                habit.getId(),
                habit.getTitle(),
                habit.getStreakDays(),
                habit.getBestStreakDays(),
                habit.getTotalCompletions(),
                habit.getLastCompletedDate(),
                habit.getCreatedAt(),
                completedToday
        );
    }

    private TodayBoardResponse.GoalItem toGoalItem(
            Goal goal,
            Map<UUID, String> projectTitlesById
    ) {
        long totalTasks = taskRepository.countByGoalId(goal.getId());

        long doneTasks = taskRepository.countByGoalIdAndStatus(
                goal.getId(),
                TaskStatus.DONE
        );

        int progressPercent = totalTasks == 0
                ? 0
                : (int) Math.round((doneTasks * 100.0) / totalTasks);

        return new TodayBoardResponse.GoalItem(
                goal.getId(),
                goal.getProjectId(),
                projectTitlesById.get(goal.getProjectId()),
                goal.getTitle(),
                goal.getDeadline(),
                goal.getCreatedAt(),
                totalTasks,
                doneTasks,
                progressPercent
        );
    }

    private TodayBoardResponse.Summary buildSummary(
            LocalDate today,
            List<TodayBoardResponse.TaskItem> taskItems,
            List<TodayBoardResponse.HabitItem> habitItems,
            List<TodayBoardResponse.GoalItem> goalItems
    ) {
        int doneTasks = (int) taskItems.stream()
                .filter(task -> task.taskStatus() == TaskStatus.DONE)
                .count();

        int overdueTasks = (int) taskItems.stream()
                .filter(task -> isOverdue(task, today))
                .count();

        int dueTodayTasks = (int) taskItems.stream()
                .filter(task -> isDueToday(task, today))
                .count();

        int completedHabits = (int) habitItems.stream()
                .filter(TodayBoardResponse.HabitItem::completedToday)
                .count();

        return new TodayBoardResponse.Summary(
                taskItems.size(),
                doneTasks,
                overdueTasks,
                dueTodayTasks,
                habitItems.size(),
                completedHabits,
                goalItems.size()
        );
    }

    private boolean isOverdue(
            TodayBoardResponse.TaskItem task,
            LocalDate today
    ) {
        if (task.taskStatus() == TaskStatus.DONE || task.deadline() == null) {
            return false;
        }

        LocalDate deadlineDate = task.deadline()
                .atZone(clock.getZone())
                .toLocalDate();

        return deadlineDate.isBefore(today);
    }

    private boolean isDueToday(
            TodayBoardResponse.TaskItem task,
            LocalDate today
    ) {
        if (task.deadline() == null) {
            return false;
        }

        LocalDate deadlineDate = task.deadline()
                .atZone(clock.getZone())
                .toLocalDate();

        return deadlineDate.isEqual(today);
    }
}