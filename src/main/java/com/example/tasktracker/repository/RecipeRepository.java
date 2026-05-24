package com.example.tasktracker.repository;

import com.example.tasktracker.domain.model.Recipe;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecipeRepository extends JpaRepository<Recipe, UUID> {

    @Override
    @EntityGraph(attributePaths = {"ingredients", "ingredients.ingredient"})
    List<Recipe> findAll();

    @EntityGraph(attributePaths = {"ingredients", "ingredients.ingredient"})
    Optional<Recipe> findWithIngredientsById(UUID id);
}