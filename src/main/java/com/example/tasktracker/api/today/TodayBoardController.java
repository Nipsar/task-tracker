package com.example.tasktracker.api.today;

import com.example.tasktracker.service.TodayBoardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/today-board")
public class TodayBoardController {

    private final TodayBoardService todayBoardService;

    public TodayBoardController(TodayBoardService todayBoardService) {
        this.todayBoardService = todayBoardService;
    }

    @GetMapping
    public TodayBoardResponse getTodayBoard() {
        return todayBoardService.getTodayBoard();
    }
}