package com.example.tasktracker.api.today;

import com.example.tasktracker.service.TodayBoardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TodayBoardController.class)
class TodayBoardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TodayBoardService todayBoardService;

    @Test
    void getTodayBoard_withoutDate_returnsTodayBoard() throws Exception {
        LocalDate date = LocalDate.parse("2025-01-02");

        TodayBoardResponse response = emptyResponse(date);

        when(todayBoardService.getTodayBoard(null))
                .thenReturn(response);

        mockMvc.perform(get("/api/today-board"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.date").value("2025-01-02"))
                .andExpect(jsonPath("$.tasks.length()").value(0))
                .andExpect(jsonPath("$.habits.length()").value(0))
                .andExpect(jsonPath("$.goals.length()").value(0))
                .andExpect(jsonPath("$.summary.totalTasks").value(0))
                .andExpect(jsonPath("$.summary.doneTasks").value(0))
                .andExpect(jsonPath("$.summary.overdueTasks").value(0))
                .andExpect(jsonPath("$.summary.totalHabits").value(0))
                .andExpect(jsonPath("$.summary.completedHabits").value(0))
                .andExpect(jsonPath("$.summary.totalGoals").value(0));

        verify(todayBoardService).getTodayBoard(null);
    }

    @Test
    void getTodayBoard_withDate_returnsTodayBoardForRequestedDate() throws Exception {
        LocalDate date = LocalDate.parse("2025-01-02");

        TodayBoardResponse response = emptyResponse(date);

        when(todayBoardService.getTodayBoard(date))
                .thenReturn(response);

        mockMvc.perform(get("/api/today-board")
                        .param("date", "2025-01-02"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.date").value("2025-01-02"));

        verify(todayBoardService).getTodayBoard(date);
    }

    private static TodayBoardResponse emptyResponse(LocalDate date) {
        return new TodayBoardResponse(
                date,
                List.of(),
                List.of(),
                List.of(),
                new TodayBoardResponse.Summary(
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                )
        );
    }
}