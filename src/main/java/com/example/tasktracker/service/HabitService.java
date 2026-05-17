package com.example.tasktracker.service;

import com.example.tasktracker.api.HabitCreateRequest;
import com.example.tasktracker.domain.exception.NotFoundException;
import com.example.tasktracker.domain.model.Habit;
import com.example.tasktracker.repository.HabitRepository;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.util.List;
import java.util.UUID;

@Service
public class HabitService {

    private final HabitRepository habitRepository;
    private final Clock clock;

    public HabitService(HabitRepository habitRepository) {
        this.habitRepository = habitRepository;
        this.clock = Clock.systemUTC();
    }

    public List<Habit> findAll() {
        return habitRepository.findAll();
    }

    public Habit create(HabitCreateRequest request) {
        Habit habit = Habit.create(request.title(), clock);
        return habitRepository.save(habit);
    }

    public Habit completeToday(UUID habitId) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new NotFoundException("Habit not found: " + habitId));

        habit.completeToday(clock);

        return habitRepository.save(habit);
    }
}