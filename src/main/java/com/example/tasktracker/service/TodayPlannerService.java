package com.example.tasktracker.service;

import com.example.tasktracker.api.today.TodayBoardResponse;
import com.example.tasktracker.domain.model.Task;
import com.example.tasktracker.domain.model.TaskDifficulty;
import com.example.tasktracker.domain.model.TaskEnergy;
import com.example.tasktracker.domain.model.TaskImportance;
import com.example.tasktracker.domain.model.TaskStatus;
import com.example.tasktracker.domain.model.TodayPlanItem;
import com.example.tasktracker.domain.model.TodayPlanItemStatus;
import com.example.tasktracker.repository.TaskRepository;
import com.example.tasktracker.repository.TodayPlanItemRepository;
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
import java.util.UUID;

@Service
public class TodayPlannerService {

    private static final int DAILY_CAPACITY_MINUTES = 900;
    private static final int MAX_HARD_TASKS = 2;
    private static final int MAX_MEDIUM_TASKS = 5;

    private final TodayPlanItemRepository todayPlanItemRepository;
    private final TaskRepository taskRepository;
    private final Clock clock;

    public TodayPlannerService(
            TodayPlanItemRepository todayPlanItemRepository,
            TaskRepository taskRepository
    ) {
        this.todayPlanItemRepository = todayPlanItemRepository;
        this.taskRepository = taskRepository;
        this.clock = Clock.systemUTC();
    }

    @Transactional
    public TodayBoardResponse getTodayBoard() {
        LocalDate today = LocalDate.now(clock);

        List<TodayPlanItem> planItems;

        if (todayPlanItemRepository.existsByPlannedDate(today)) {
            planItems = todayPlanItemRepository.findByPlannedDateAndStatus(
                    today,
                    TodayPlanItemStatus.PLANNED
            );
        } else {
            planItems = generateTodayPlan(today);
        }

        return toResponse(today, planItems);
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

    private List<TodayPlanItem> generateTodayPlan(LocalDate today) {
        List<Task> activeTasks = taskRepository.findByStatusNotAndAutoPlanEnabledTrue(TaskStatus.DONE);

        List<TaskScore> scoredTasks = activeTasks.stream()
                .filter(task -> task.getEstimatedMinutes() != null)
                .filter(task -> task.getEstimatedMinutes() > 0)
                .filter(task -> !isWeekend(today) || isOverdue(task, today))
                .map(task -> new TaskScore(task, calculateScore(task, today)))
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

    private TodayBoardResponse toResponse(LocalDate today, List<TodayPlanItem> planItems) {
        List<TodayBoardResponse.TaskItem> tasks = planItems.stream()
                .sorted(todayBoardComparator(today))
                .map(item -> toTaskItem(item, today))
                .toList();

        TodayBoardResponse.Summary summary = new TodayBoardResponse.Summary(
                tasks.size(),
                countDoneTasks(tasks),
                countOverdueTasks(tasks, today),
                countDueTodayTasks(tasks, today),
                0,
                0,
                0
        );

        return new TodayBoardResponse(
                today,
                tasks,
                List.of(),
                List.of(),
                summary
        );
    }

    private TodayBoardResponse.TaskItem toTaskItem(TodayPlanItem item, LocalDate today) {
        Task task = item.getTask();

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
                calculateScore(task, today)
        );
    }

    private Comparator<TodayPlanItem> todayBoardComparator(LocalDate today) {
        return Comparator
                .comparingInt((TodayPlanItem item) -> energyOrder(item.getTask().getEnergy()))
                .thenComparing(
                        Comparator.comparingInt((TodayPlanItem item) -> calculateScore(item.getTask(), today))
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
        return deadlineScore(task, today)
                + importanceScore(task.getImportance())
                + ageScore(task, today);
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


}