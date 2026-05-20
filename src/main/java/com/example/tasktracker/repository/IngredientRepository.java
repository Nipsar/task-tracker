package com.example.tasktracker.repository;

import com.example.tasktracker.domain.model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface IngredientRepository extends JpaRepository<Ingredient, UUID> {

    Optional<Ingredient> findByNameIgnoreCase(String name);
}