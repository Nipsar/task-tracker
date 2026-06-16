package com.example.tasktracker.service;

import com.example.tasktracker.api.today.TodayBoardResponse;
import com.example.tasktracker.domain.model.Goal;
import com.example.tasktracker.domain.model.Habit;
import com.example.tasktracker.domain.model.Project;
import com.example.tasktracker.domain.model.Task;
import com.example.tasktracker.domain.model.TaskDifficulty;
import com.example.tasktracker.domain.model.TaskEnergy;
import com.example.tasktracker.domain.model.TaskImportance;
import com.example.tasktracker.domain.model.TaskStatus;
import com.example.tasktracker.domain.model.TodayPlanItem;
import com.example.tasktracker.domain.model.TodayPlanItemStatus;
import com.example.tasktracker.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Set;

@Service
public class TodayPlannerService {

    private static final int DAILY_CAPACITY_MINUTES = 900;
    private static final int MAX_HARD_TASKS = 2;
    private static final int MAX_MEDIUM_TASKS = 5;
    private static final int MOVED_BONUS = 150;

    private final TodayPlanItemRepository todayPlanItemRepository;
    private final TaskRepository taskRepository;
    private final Clock clock;

    private final HabitRepository habitRepository;
    private final GoalRepository goalRepository;
    private final ProjectRepository projectRepository;

    public TodayPlannerService(
            TodayPlanItemRepository todayPlanItemRepository,
            TaskRepository taskRepository,
            HabitRepository habitRepository,
            GoalRepository goalRepository,
            ProjectRepository projectRepository
    ) {
        this.todayPlanItemRepository = todayPlanItemRepository;
        this.taskRepository = taskRepository;
        this.habitRepository = habitRepository;
        this.goalRepository = goalRepository;
        this.projectRepository = projectRepository;
        this.clock = Clock.systemUTC();
    }

    @Transactional
    public TodayBoardResponse getTodayBoard() {
        LocalDate today = LocalDate.now(clock);
        Set<UUID> movedToTodayTaskIds = loadMovedToTodayTaskIds(today);

        List<TodayPlanItem> planItems;

        if (todayPlanItemRepository.existsByPlannedDate(today)) {
            planItems = todayPlanItemRepository.findByPlannedDateAndStatus(
                    today,
                    TodayPlanItemStatus.PLANNED
            );
        } else {
            planItems = generateTodayPlan(today, movedToTodayTaskIds);
        }

        return toResponse(today, planItems, movedToTodayTaskIds);
    }

    @Transactional
    public TodayBoardResponse markItemDone(UUID itemId) {
        TodayPlanItem item = findPlanItem(itemId);

        item.markDone();
        item.getTask().changeStatus(TaskStatus.DONE, clock);

        return getTodayBoard();
    }

    @Transactional
    public TodayBoardResponse moveItemToTomorrow(UUID itemId) {
        TodayPlanItem item = findPlanItem(itemId);

        LocalDate tomorrow = LocalDate.now(clock).plusDays(1);
        item.moveToTomorrow(tomorrow);

        return getTodayBoard();
    }

    private TodayPlanItem findPlanItem(UUID itemId) {
        return todayPlanItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Today plan item not found"
                ));
    }

    private Set<UUID> loadMovedToTodayTaskIds(LocalDate today) {
        return todayPlanItemRepository.findByMovedToDateAndStatus(
                        today,
                        TodayPlanItemStatus.MOVED
                )
                .stream()
                .map(item -> item.getTask().getId())
                .collect(Collectors.toSet());
    }

    private List<TodayPlanItem> generateTodayPlan(
            LocalDate today,
            Set<UUID> movedToTodayTaskIds
    ) {
        List<Task> activeTasks = taskRepository.findByStatusNotAndAutoPlanEnabledTrue(TaskStatus.DONE);

        List<TaskScore> scoredTasks = activeTasks.stream()
                .filter(task -> task.getEstimatedMinutes() != null)
                .filter(task -> task.getEstimatedMinutes() > 0)
                .filter(task -> !isWeekend(today) || isOverdue(task, today))
                .map(task -> new TaskScore( task, calculateScore( task, today, movedToTodayTaskIds.contains(task.getId()))))
                .sorted(Comparator.comparingInt(TaskScore::score).reversed())
                .toList();

        List<TodayPlanItem> selectedItems = new ArrayList<>();

        int totalMinutes = 0;
        int hardCount = 0;
        int mediumCount = 0;

        for (TaskScore taskScore : scoredTasks) {
            Task task = taskScore.task();

            int estimatedMinutes = task.getEstimatedMinutes();

            if (totalMinutes + estimatedMinutes > DAILY_CAPACITY_MINUTES) {
                continue;
            }

            if (task.getDifficulty() == TaskDifficulty.HARD && hardCount >= MAX_HARD_TASKS) {
                continue;
            }

            if (task.getDifficulty() == TaskDifficulty.MEDIUM && mediumCount >= MAX_MEDIUM_TASKS) {
                continue;
            }

            TodayPlanItem item = TodayPlanItem.planned(task, today, clock);
            selectedItems.add(item);

            totalMinutes += estimatedMinutes;

            if (task.getDifficulty() == TaskDifficulty.HARD) {
                hardCount++;
            }

            if (task.getDifficulty() == TaskDifficulty.MEDIUM) {
                mediumCount++;
            }
        }

        return todayPlanItemRepository.saveAll(selectedItems);
    }

    private TodayBoardResponse toResponse(LocalDate today, List<TodayPlanItem> planItems, Set<UUID> movedToTodayTaskIds) {
        List<TodayBoardResponse.TaskItem> tasks = planItems.stream()
                .sorted(todayBoardComparator(today, movedToTodayTaskIds))
                .map(item -> toTaskItem(item, today, movedToTodayTaskIds))
                .toList();

        List<Habit> habits = habitRepository.findAll();
        List<Goal> goals = goalRepository.findAll();

        Map<UUID, String> projectTitlesById = loadProjectTitles(goals);

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
                tasks,
                habitItems,
                goalItems
        );

        return new TodayBoardResponse(
                today,
                tasks,
                habitItems,
                goalItems,
                summary
        );
    }

    private TodayBoardResponse.TaskItem toTaskItem(
            TodayPlanItem item,
            LocalDate today,
            Set<UUID> movedToTodayTaskIds
    ) {
        Task task = item.getTask();
        boolean movedToToday = movedToTodayTaskIds.contains(task.getId());

        return new TodayBoardResponse.TaskItem(
                item.getId(),
                task.getId(),
                task.getProjectId(),
                task.getGoalId(),
                task.getTitle(),
                task.getStatus(),
                task.getDeadline(),
                task.getImportance(),
                task.getDifficulty(),
                task.getEnergy(),
                task.getEstimatedMinutes(),
                task.getAutoPlanEnabled(),
                item.getStatus(),
                item.getPlannedDate(),
                calculateScore(task, today, movedToToday)
        );
    }

    private Comparator<TodayPlanItem> todayBoardComparator(
            LocalDate today,
            Set<UUID> movedToTodayTaskIds
    ) {
        return Comparator
                .comparingInt((TodayPlanItem item) -> energyOrder(item.getTask().getEnergy()))
                .thenComparing(
                        Comparator.comparingInt((TodayPlanItem item) -> {
                                    Task task = item.getTask();
                                    return calculateScore(
                                            task,
                                            today,
                                            movedToTodayTaskIds.contains(task.getId())
                                    );
                                })
                                .reversed()
                );
    }

    private int energyOrder(TaskEnergy energy) {
        return switch (energy) {
            case HIGH -> 0;
            case MEDIUM -> 1;
            case LOW -> 2;
        };
    }

    private int calculateScore(Task task, LocalDate today) {
        return calculateScore(task, today, false);
    }

    private int calculateScore(
            Task task,
            LocalDate today,
            boolean movedToToday
    ) {
        return deadlineScore(task, today)
                + importanceScore(task.getImportance())
                + movedBonus(movedToToday)
                + ageScore(task, today);
    }

    private int movedBonus(boolean movedToToday) {
        return movedToToday ? MOVED_BONUS : 0;
    }

    private int deadlineScore(Task task, LocalDate today) {
        if (task.getDeadline() == null) {
            return 0;
        }

        LocalDate deadlineDate = task.getDeadline()
                .atZone(clock.getZone())
                .toLocalDate();

        long daysUntilDeadline = ChronoUnit.DAYS.between(today, deadlineDate);

        if (daysUntilDeadline < 0) {
            return 1000;
        }

        if (daysUntilDeadline == 0) {
            return 800;
        }

        if (daysUntilDeadline == 1) {
            return 600;
        }

        if (daysUntilDeadline == 2) {
            return 400;
        }

        if (daysUntilDeadline <= 7) {
            return 200;
        }

        return 50;
    }

    private int importanceScore(TaskImportance importance) {
        return switch (importance) {
            case LOW -> 10;
            case MEDIUM -> 50;
            case HIGH -> 120;
            case CRITICAL -> 250;
        };
    }

    private int ageScore(Task task, LocalDate today) {
        LocalDate createdDate = task.getCreatedAt()
                .atZone(clock.getZone())
                .toLocalDate();

        long daysFromCreatedAt = ChronoUnit.DAYS.between(createdDate, today);

        return (int) Math.min(daysFromCreatedAt * 2, 100);
    }

    private boolean isWeekend(LocalDate date) {
        return date.getDayOfWeek().getValue() >= 6;
    }

    private boolean isOverdue(Task task, LocalDate today) {
        if (task.getDeadline() == null) {
            return false;
        }

        LocalDate deadlineDate = task.getDeadline()
                .atZone(clock.getZone())
                .toLocalDate();

        return deadlineDate.isBefore(today);
    }

    private record TaskScore(Task task, int score) {
    }

    private int countDoneTasks(List<TodayBoardResponse.TaskItem> tasks) {
        return (int) tasks.stream()
                .filter(task -> task.taskStatus() == TaskStatus.DONE)
                .count();
    }

    private int countOverdueTasks(List<TodayBoardResponse.TaskItem> tasks, LocalDate today) {
        return (int) tasks.stream()
                .filter(task -> task.deadline() != null)
                .filter(task -> task.deadline()
                        .atZone(clock.getZone())
                        .toLocalDate()
                        .isBefore(today))
                .count();
    }

    private int countDueTodayTasks(List<TodayBoardResponse.TaskItem> tasks, LocalDate today) {
        return (int) tasks.stream()
                .filter(task -> task.deadline() != null)
                .filter(task -> task.deadline()
                        .atZone(clock.getZone())
                        .toLocalDate()
                        .isEqual(today))
                .count();
    }

    private boolean isDueToday(Task task, LocalDate today) {
        if (task.getDeadline() == null) {
            return false;
        }

        LocalDate deadlineDate = task.getDeadline()
                .atZone(clock.getZone())
                .toLocalDate();

        return deadlineDate.isEqual(today);
    }

    private boolean isCompletedToday(Task task, LocalDate today) {
        if (task.getCompletedAt() == null) {
            return false;
        }

        LocalDate completedDate = task.getCompletedAt()
                .atZone(clock.getZone())
                .toLocalDate();

        return completedDate.isEqual(today);
    }

    private Map<UUID, String> loadProjectTitles(List<Goal> goals) {
        List<UUID> projectIds = goals.stream()
                .map(Goal::getProjectId)
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
        int doneTasks = countDoneTasks(taskItems);
        int overdueTasks = countOverdueTasks(taskItems, today);
        int dueTodayTasks = countDueTodayTasks(taskItems, today);

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


}