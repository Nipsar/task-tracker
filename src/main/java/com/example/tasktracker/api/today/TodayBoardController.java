package com.example.tasktracker.api.today;

import com.example.tasktracker.service.TodayPlannerService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@RestController
public class TodayBoardController {

    private final TodayPlannerService todayPlannerService;

    public TodayBoardController(TodayPlannerService todayPlannerService) {
        this.todayPlannerService = todayPlannerService;
    }

    @GetMapping("/api/today-board")
    public TodayBoardResponse getTodayBoard() {
        return todayPlannerService.getTodayBoard();
    }

    @PatchMapping("/api/today-board/items/{itemId}/done")
    public TodayBoardResponse markDone(@PathVariable UUID itemId) {
        return todayPlannerService.markItemDone(itemId);
    }

    @PatchMapping("/api/today-board/items/{itemId}/move-tomorrow")
    public TodayBoardResponse moveTomorrow(@PathVariable UUID itemId) {
        return todayPlannerService.moveItemToTomorrow(itemId);
    }
}