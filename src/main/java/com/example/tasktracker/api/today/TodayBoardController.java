package com.example.tasktracker.api.today;

import com.example.tasktracker.service.TodayBoardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/today-board")
public class TodayBoardController {

    private final TodayBoardService todayBoardService;

    public TodayBoardController(TodayBoardService todayBoardService) {
        this.todayBoardService = todayBoardService;
    }

    @GetMapping
    public TodayBoardResponse getTodayBoard(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {
        return todayBoardService.getTodayBoard(date);
    }
}