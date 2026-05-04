package com.example.tasktracker.api;

import com.example.tasktracker.domain.exception.DomainException;
import com.example.tasktracker.domain.exception.NotFoundException;
import com.example.tasktracker.domain.exception.ValidationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(NotFoundException ex) {
        return new ErrorResponse(
                Instant.now(),
                404,
                ex.getCode(),
                ex.getMessage()
        );
    }

    @ExceptionHandler(ValidationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(ValidationException ex) {
        return new ErrorResponse(
                Instant.now(),
                400,
                ex.getCode(),
                ex.getMessage()
        );
    }

    @ExceptionHandler(DomainException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleDomain(DomainException ex) {
        return new ErrorResponse(
                Instant.now(),
                400,
                ex.getCode(),
                ex.getMessage()
        );
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleOther(Exception ex) {
        return new ErrorResponse(
                Instant.now(),
                500,
                "INTERNAL_ERROR",
                ex.getMessage()
        );
    }

    public record ErrorResponse(
            Instant timestamp,
            int status,
            String code,
            String message
    ) {}
}