package com.example.tasktracker.service;

import com.example.tasktracker.api.recipe.RecipeCreateRequest;
import com.example.tasktracker.api.recipe.RecipeIngredientRequest;
import com.example.tasktracker.domain.exception.NotFoundException;
import com.example.tasktracker.domain.model.Ingredient;
import com.example.tasktracker.domain.model.Recipe;
import com.example.tasktracker.repository.IngredientRepository;
import com.example.tasktracker.repository.RecipeRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.util.List;
import java.util.UUID;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final Clock clock;

    public RecipeService(
            RecipeRepository recipeRepository,
            IngredientRepository ingredientRepository
    ) {
        this.recipeRepository = recipeRepository;
        this.ingredientRepository = ingredientRepository;
        this.clock = Clock.systemUTC();
    }

    public List<Recipe> findAll() {
        return recipeRepository.findAll();
    }

    public Recipe findById(UUID recipeId) {
        return recipeRepository.findWithIngredientsById(recipeId)
                .orElseThrow(() -> new NotFoundException("Recipe not found: " + recipeId));
    }

    @Transactional
    public Recipe create(RecipeCreateRequest request) {
        Recipe recipe = Recipe.create(
                request.title(),
                request.description(),
                request.imageUrl(),
                request.servings(),
                request.caloriesPerServing(),
                request.proteinPerServing(),
                request.fatPerServing(),
                request.carbsPerServing(),
                clock
        );

        for (RecipeIngredientRequest ingredientRequest : request.ingredients()) {
            Ingredient ingredient = getOrCreateIngredient(ingredientRequest);
            recipe.addIngredient(
                    ingredient,
                    ingredientRequest.amount(),
                    ingredientRequest.unit()
            );
        }

        return recipeRepository.save(recipe);
    }

    public void delete(UUID recipeId) {
        if (!recipeRepository.existsById(recipeId)) {
            throw new NotFoundException("Recipe not found: " + recipeId);
        }

        recipeRepository.deleteById(recipeId);
    }

    private Ingredient getOrCreateIngredient(RecipeIngredientRequest request) {
        String normalizedName = Ingredient.normalizeAndValidateName(request.ingredientName());

        return ingredientRepository.findByNameIgnoreCase(normalizedName)
                .orElseGet(() -> ingredientRepository.save(
                        Ingredient.create(
                                normalizedName,
                                request.unit(),
                                clock
                        )
                ));
    }
}