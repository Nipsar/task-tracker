package com.example.tasktracker.api.recipe;

import com.example.tasktracker.domain.model.Ingredient;
import com.example.tasktracker.domain.model.Recipe;
import com.example.tasktracker.domain.model.RecipeIngredient;
import com.example.tasktracker.service.RecipeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class RecipeController {

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @GetMapping("/api/recipes")
    public List<RecipeResponse> getRecipes() {
        return recipeService.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/api/recipes/{recipeId}")
    public RecipeResponse getRecipe(@PathVariable UUID recipeId) {
        Recipe recipe = recipeService.findById(recipeId);
        return toResponse(recipe);
    }

    @PostMapping("/api/recipes")
    public RecipeResponse createRecipe(@Valid @RequestBody RecipeCreateRequest request) {
        Recipe recipe = recipeService.create(request);
        return toResponse(recipe);
    }

    @DeleteMapping("/api/recipes/{recipeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRecipe(@PathVariable UUID recipeId) {
        recipeService.delete(recipeId);
    }

    private RecipeResponse toResponse(Recipe recipe) {
        return new RecipeResponse(
                recipe.getId(),
                recipe.getTitle(),
                recipe.getDescription(),
                recipe.getImageUrl(),
                recipe.getServings(),
                recipe.getCaloriesPerServing(),
                recipe.getProteinPerServing(),
                recipe.getFatPerServing(),
                recipe.getCarbsPerServing(),
                recipe.getIngredients()
                        .stream()
                        .map(this::toIngredientResponse)
                        .toList(),
                recipe.getCreatedAt(),
                recipe.getUpdatedAt()
        );
    }

    private RecipeIngredientResponse toIngredientResponse(RecipeIngredient recipeIngredient) {
        Ingredient ingredient = recipeIngredient.getIngredient();

        return new RecipeIngredientResponse(
                recipeIngredient.getId(),
                new IngredientResponse(
                        ingredient.getId(),
                        ingredient.getName(),
                        ingredient.getDefaultUnit()
                ),
                recipeIngredient.getAmount(),
                recipeIngredient.getUnit()
        );
    }
}